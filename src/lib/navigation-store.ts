import { create } from 'zustand'

export type Page = 
  | 'landing'
  | 'login'
  | 'about'
  | 'dashboard'
  | 'dashboard/subscriptions'
  | 'dashboard/activedevices'
  | 'dashboard/payments'
  | 'dashboard/referrals'
  | 'dashboard/themes'
  | 'dashboard/settings'
  | 'dashboard/tickets'
  | 'download'
  | 'docs'
  | 'admin'
  | 'admin/users'
  | 'admin/subscriptions'
  | 'admin/proxiespreset'
  | 'admin/plans'
  | 'admin/payments'
  | 'admin/rules'
  | 'admin/logs'
  | 'admin/devices'
  | 'admin/db-init'
  | 'admin/broadcast'
  | 'admin/tickets'
  | 'admin/cms'
  | 'admin/coupons'
  | 'admin/utility'

interface NavigationState {
  currentPage: Page
  navigate: (page: Page) => void
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentPage: 'landing',
  navigate: (page) => {
    set({ currentPage: page })
    window.location.hash = page
  },
}))

const allValidPages: Page[] = [
  'landing', 'login', 'about', 'dashboard',
  'dashboard/subscriptions', 'dashboard/activedevices',
  'dashboard/payments', 'dashboard/referrals',
  'dashboard/themes', 'dashboard/settings', 'dashboard/tickets',
  'download', 'docs',
  'admin', 'admin/users', 'admin/subscriptions',
  'admin/proxiespreset', 'admin/plans', 'admin/payments',
  'admin/rules', 'admin/logs', 'admin/devices',
  'admin/db-init', 'admin/broadcast', 'admin/tickets', 'admin/cms', 'admin/coupons', 'admin/utility'
]

// Sync hash to store on load
if (typeof window !== 'undefined') {
  const hash = window.location.hash.slice(1)
  if (hash && allValidPages.includes(hash as Page)) {
    useNavigationStore.setState({ currentPage: hash as Page })
  }

  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1) as Page
    if (allValidPages.includes(hash)) {
      useNavigationStore.setState({ currentPage: hash })
    }
  })
}
