import { create } from 'zustand'

interface TwoFAState {
  isEnabled: boolean
  secret: string | null
  isVerified: boolean
  backupCodes: string[]
  enable2FA: (secret: string) => void
  disable2FA: () => void
  verifyCode: (code: string) => boolean
  setVerified: (verified: boolean) => void
  generateSecret: () => string
  generateBackupCodes: () => string[]
  regenerateBackupCodes: () => string[]
}

function randomAlphanumeric(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const use2FAStore = create<TwoFAState>((set, get) => ({
  isEnabled: false,
  secret: null,
  isVerified: false,
  backupCodes: [],

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
  },

  disable2FA: () => {
    set({
      isEnabled: false,
      secret: null,
      isVerified: false,
      backupCodes: [],
    })
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
      set({
        isVerified: true,
        backupCodes: backupCodes.filter((c) => c !== code.toUpperCase()),
      })
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
    return codes
  },
}))
