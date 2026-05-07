import { create } from 'zustand'
import {
  fetchConfig,
  updateRow,
  subscribeToTable,
  snakeToCamelObj,
  camelToSnakeObj,
} from '@/lib/supabase-sync'

// ── Converter functions: snake_case DB row ↔ camelCase ──

interface TwoFADbRow {
  id: string
  isEnabled: boolean
  secret: string | null
  backupCodes: string[]
}

function twoFAFromDb(row: Record<string, unknown>): TwoFADbRow {
  const camel = snakeToCamelObj<TwoFADbRow>(row)
  return {
    id: camel.id ?? '2fa_001',
    isEnabled: typeof camel.isEnabled === 'boolean' ? camel.isEnabled : false,
    secret: typeof camel.secret === 'string' ? camel.secret : null,
    backupCodes: Array.isArray(camel.backupCodes) ? camel.backupCodes : [],
  }
}

function twoFAToDb(item: Record<string, unknown>): Record<string, unknown> {
  return camelToSnakeObj(item)
}

// ── Table name constant ──

const TABLE = 'admin_2fa'

function randomAlphanumeric(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// ── Store interface (unchanged from original) ──

interface TwoFAState {
  isEnabled: boolean
  secret: string | null
  isVerified: boolean
  backupCodes: string[]
  isSupabaseConnected: boolean

  enable2FA: (secret: string) => void
  disable2FA: () => void
  verifyCode: (code: string) => boolean
  setVerified: (verified: boolean) => void
  generateSecret: () => string
  generateBackupCodes: () => string[]
  regenerateBackupCodes: () => string[]

  // Sync
  syncWithSupabase: () => Promise<void>
}

// ── Real-time subscription channel reference ──

let realtimeChannel: ReturnType<typeof subscribeToTable<TwoFADbRow>> | null = null

// ── Store ──

export const use2FAStore = create<TwoFAState>((set, get) => ({
  isEnabled: false,
  secret: null,
  isVerified: false,
  backupCodes: [],
  isSupabaseConnected: false,

  // ── Sync with Supabase ──

  syncWithSupabase: async () => {
    try {
      const data = await fetchConfig<TwoFADbRow>(TABLE, twoFAFromDb)

      if (data !== null) {
        set({
          isEnabled: data.isEnabled,
          secret: data.secret,
          backupCodes: data.backupCodes,
          isSupabaseConnected: true,
        })
      } else {
        // Table exists but is empty — still mark connected, keep defaults
        set({ isSupabaseConnected: true })
      }

      // Subscribe to real-time changes for admin_2fa table
      if (!realtimeChannel) {
        realtimeChannel = subscribeToTable<TwoFADbRow>(
          TABLE,
          {
            onInsert: (item) => {
              set({
                isEnabled: item.isEnabled,
                secret: item.secret,
                backupCodes: item.backupCodes,
              })
            },
            onUpdate: (item) => {
              set({
                isEnabled: item.isEnabled,
                secret: item.secret,
                backupCodes: item.backupCodes,
              })
            },
            onDelete: () => {
              // If 2fa config is deleted, fall back to defaults
              set({
                isEnabled: false,
                secret: null,
                isVerified: false,
                backupCodes: [],
              })
            },
          },
          twoFAFromDb
        )
      }
    } catch (err) {
      console.warn('[2FA-STORE] Supabase sync failed, using local state:', err)
      set({ isSupabaseConnected: false })
    }
  },

  // ── Write operations: update local state immediately, push to Supabase in background ──

  generateSecret: () => {
    return 'JBSWY3DPEHPK3PXP'
  },

  generateBackupCodes: () => {
    const codes: string[] = []
    for (let i = 0; i < 8; i++) {
      codes.push(randomAlphanumeric(8))
    }
    return codes
  },

  enable2FA: (secret: string) => {
    const codes = get().generateBackupCodes()
    set({
      isEnabled: true,
      secret,
      backupCodes: codes,
      isVerified: false,
    })

    if (get().isSupabaseConnected) {
      updateRow(TABLE, '2fa_001', { isEnabled: true, secret, backupCodes: codes }, twoFAToDb).catch((err) => {
        console.warn('[2FA-STORE] Failed to push enable2FA to Supabase:', err)
      })
    }
  },

  disable2FA: () => {
    set({
      isEnabled: false,
      secret: null,
      isVerified: false,
      backupCodes: [],
    })

    if (get().isSupabaseConnected) {
      updateRow(TABLE, '2fa_001', { isEnabled: false, secret: null, backupCodes: [] }, twoFAToDb).catch((err) => {
        console.warn('[2FA-STORE] Failed to push disable2FA to Supabase:', err)
      })
    }
  },

  verifyCode: (code: string) => {
    // Mock: accept any 6-digit code for demo
    if (/^\d{6}$/.test(code)) {
      set({ isVerified: true })
      return true
    }
    // Also accept backup codes
    const { backupCodes } = get()
    if (backupCodes.includes(code.toUpperCase())) {
      // Remove used backup code
      const newCodes = backupCodes.filter((c) => c !== code.toUpperCase())
      set({
        isVerified: true,
        backupCodes: newCodes,
      })

      // Push updated backup codes to Supabase
      if (get().isSupabaseConnected) {
        updateRow(TABLE, '2fa_001', { backupCodes: newCodes }, twoFAToDb).catch((err) => {
          console.warn('[2FA-STORE] Failed to push verifyCode (backup code removal) to Supabase:', err)
        })
      }

      return true
    }
    return false
  },

  setVerified: (verified: boolean) => {
    set({ isVerified: verified })
  },

  regenerateBackupCodes: () => {
    const codes = get().generateBackupCodes()
    set({ backupCodes: codes })

    if (get().isSupabaseConnected) {
      updateRow(TABLE, '2fa_001', { backupCodes: codes }, twoFAToDb).catch((err) => {
        console.warn('[2FA-STORE] Failed to push regenerateBackupCodes to Supabase:', err)
      })
    }

    return codes
  },
}))

// ── Auto-sync on store creation (setTimeout avoids SSR issues) ──

if (typeof window !== 'undefined') {
  setTimeout(() => {
    use2FAStore.getState().syncWithSupabase()
  }, 0)
}
