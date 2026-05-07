import { create } from 'zustand'

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

interface UtilityState {
  config: UtilityConfig
  updateConfig: (config: Partial<UtilityConfig>) => void
}

export const useUtilityStore = create<UtilityState>((set) => ({
  config: {
    apkDownloadUrl: 'https://corex.io/download/corex-v2.5.3.apk',
    apkVersion: 'v2.5.3',
    tutorialUrl: 'https://corex.io/tutorial/getting-started',
    tutorialTitle: 'Getting Started with CoreX',
    appChangelog: '• Fixed connection stability\n• Added WireGuard protocol\n• Improved load balancing\n• Dark mode improvements',
    telegramLink: 'Coming Soon',
    facebookLink: 'Coming Soon',
    registrationEnabled: true,
  },

  updateConfig: (partial) => {
    set((state) => ({
      config: { ...state.config, ...partial },
    }))
  },
}))

/**
 * Check if a value is a valid URL (starts with http:// or https://)
 * If not a URL, it's treated as display text (e.g. "Coming Soon")
 */
export function isUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim())
}
