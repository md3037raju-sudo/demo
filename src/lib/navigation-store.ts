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
  | 'dashboard/settings'
  | 'download'
  | 'docs'

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

// Sync hash to store on load
if (typeof window !== 'undefined') {
  const hash = window.location.hash.slice(1)
  if (hash) {
    const validPages: Page[] = [
      'landing', 'login', 'about', 'dashboard',
      'dashboard/subscriptions', 'dashboard/activedevices',
      'dashboard/payments', 'dashboard/referrals',
      'dashboard/settings', 'download', 'docs'
    ]
    if (validPages.includes(hash as Page)) {
      useNavigationStore.setState({ currentPage: hash as Page })
    }
  }

  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1) as Page
    const validPages: Page[] = [
      'landing', 'login', 'about', 'dashboard',
      'dashboard/subscriptions', 'dashboard/activedevices',
      'dashboard/payments', 'dashboard/referrals',
      'dashboard/settings', 'download', 'docs'
    ]
    if (validPages.includes(hash)) {
      useNavigationStore.setState({ currentPage: hash })
    }
  })
}
