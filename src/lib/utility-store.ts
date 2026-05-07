import { create } from 'zustand'
import {
  fetchConfig,
  updateRow,
  subscribeToTable,
  snakeToCamelObj,
  camelToSnakeObj,
} from '@/lib/supabase-sync'

export interface UtilityConfig {
  apkDownloadUrl: string
  apkVersion: string
  tutorialUrl: string
  tutorialTitle: string
  appChangelog: string
  telegramLink: string
  facebookLink: string
  registrationEnabled: boolean
}

// ── Converter functions: snake_case DB row ↔ camelCase UtilityConfig ──

function utilityConfigFromDb(row: Record<string, unknown>): UtilityConfig {
  const camel = snakeToCamelObj<UtilityConfig>(row)
  return {
    apkDownloadUrl: camel.apkDownloadUrl ?? '',
    apkVersion: camel.apkVersion ?? '',
    tutorialUrl: camel.tutorialUrl ?? '',
    tutorialTitle: camel.tutorialTitle ?? '',
    appChangelog: camel.appChangelog ?? '',
    telegramLink: camel.telegramLink ?? '',
    facebookLink: camel.facebookLink ?? '',
    registrationEnabled: typeof camel.registrationEnabled === 'boolean' ? camel.registrationEnabled : true,
  }
}

function utilityConfigToDb(item: Partial<UtilityConfig>): Record<string, unknown> {
  return camelToSnakeObj(item as Record<string, unknown>)
}

// ── Table name constant ──

const TABLE = 'utility_config'

// ── Initial config ──

const initialConfig: UtilityConfig = {
  apkDownloadUrl: 'https://corex.io/download/corex-v2.5.3.apk',
  apkVersion: 'v2.5.3',
  tutorialUrl: 'https://corex.io/tutorial/getting-started',
  tutorialTitle: 'Getting Started with CoreX',
  appChangelog: '• Fixed connection stability\n• Added WireGuard protocol\n• Improved load balancing\n• Dark mode improvements',
  telegramLink: 'Coming Soon',
  facebookLink: 'Coming Soon',
  registrationEnabled: true,
}

// ── Store interface (unchanged from original) ──

interface UtilityState {
  config: UtilityConfig
  isSupabaseConnected: boolean

  updateConfig: (config: Partial<UtilityConfig>) => void

  // Sync
  syncWithSupabase: () => Promise<void>
}

// ── Real-time subscription channel reference ──

let realtimeChannel: ReturnType<typeof subscribeToTable<UtilityConfig>> | null = null

// ── Store ──

export const useUtilityStore = create<UtilityState>((set, get) => ({
  config: { ...initialConfig },
  isSupabaseConnected: false,

  // ── Sync with Supabase ──

  syncWithSupabase: async () => {
    try {
      const configData = await fetchConfig<UtilityConfig>(TABLE, utilityConfigFromDb)

      if (configData !== null) {
        set({ config: configData, isSupabaseConnected: true })
      } else {
        // Table exists but is empty — still mark connected, keep initial config as seed
        set({ isSupabaseConnected: true })
      }

      // Subscribe to real-time changes for utility_config table
      if (!realtimeChannel) {
        realtimeChannel = subscribeToTable<UtilityConfig>(
          TABLE,
          {
            onInsert: (item) => {
              set({ config: item })
            },
            onUpdate: (item) => {
              set({ config: item })
            },
            onDelete: () => {
              // If config is deleted, fall back to initial
              set({ config: { ...initialConfig } })
            },
          },
          utilityConfigFromDb
        )
      }
    } catch (err) {
      console.warn('[UTILITY-STORE] Supabase sync failed, using default config:', err)
      set({ isSupabaseConnected: false })
    }
  },

  // ── Write operations: update local state immediately, push to Supabase in background ──

  updateConfig: (partial) => {
    set((state) => ({
      config: { ...state.config, ...partial },
    }))

    if (get().isSupabaseConnected) {
      // utility_config is a single-row table — update by id 'config_001'
      updateRow(TABLE, 'config_001', partial, utilityConfigToDb).catch((err) => {
        console.warn('[UTILITY-STORE] Failed to push updateConfig to Supabase:', err)
      })
    }
  },
}))

// ── Auto-sync on store creation (setTimeout avoids SSR issues) ──

if (typeof window !== 'undefined') {
  setTimeout(() => {
    useUtilityStore.getState().syncWithSupabase()
  }, 0)
}

/**
 * Check if a value is a valid URL (starts with http:// or https://)
 * If not a URL, it's treated as display text (e.g. "Coming Soon")
 */
export function isUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim())
}
