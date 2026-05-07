import { create } from 'zustand'

export type UserRole = 'user' | 'admin' | 'moderator'

interface User {
  id: string
  name: string
  email: string
  avatar: string
  provider: 'google' | 'telegram'
  balance: number
  referralCode: string
  totalReferrals: number
  role: UserRole
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  login: (provider: 'google' | 'telegram') => UserRole
  loginAsAdmin: () => UserRole
  loginAsUser: () => void
  logout: () => void
  deductBalance: (amount: number) => void
  addBalance: (userId: string, amount: number) => void
}

const mockUser: User = {
  id: 'usr_cx_001',
  name: 'Alex Morgan',
  email: 'alex.morgan@gmail.com',
  avatar: '',
  provider: 'google',
  balance: 249.50,
  referralCode: 'COREX-7K9M2',
  totalReferrals: 12,
  role: 'user',
}

const mockAdmin: User = {
  id: 'adm_cx_001',
  name: 'Admin CoreX',
  email: 'admin@corex.io',
  avatar: '',
  provider: 'google',
  balance: 99999.00,
  referralCode: 'ADMIN-0001',
  totalReferrals: 0,
  role: 'admin',
}

// Simulates a backend check: is this OAuth account an admin?
// For demo: Google account → admin (admin@corex.io is a Google account)
// Telegram account → regular user
function mockCheckAdmin(provider: 'google' | 'telegram'): UserRole {
  if (provider === 'google') return 'admin'
  return 'user'
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  login: (provider) => {
    const role = mockCheckAdmin(provider)
    const baseUser = role === 'admin' ? mockAdmin : mockUser
    const user = { ...baseUser, provider }
    set({ isAuthenticated: true, user })
    return role
  },
  loginAsAdmin: () => {
    set({ isAuthenticated: true, user: { ...mockAdmin } })
    return 'admin' as UserRole
  },
  loginAsUser: () => {
    const currentUser = get().user
    if (currentUser && currentUser.role === 'admin') {
      // Admin choosing to login as user — switch to mock user persona
      set({ user: { ...mockUser, provider: currentUser.provider } })
    }
  },
  logout: () => {
    set({
      isAuthenticated: false,
      user: null,
    })
  },
  deductBalance: (amount: number) => {
    const user = get().user
    if (user) {
      set({ user: { ...user, balance: user.balance - amount } })
    }
  },
  addBalance: (userId: string, amount: number) => {
    const user = get().user
    if (user && user.id === userId) {
      set({ user: { ...user, balance: user.balance + amount } })
    }
  },
}))

// Standalone function for use by other stores (e.g. payment-store)
export function addBalanceToUser(userId: string, amount: number) {
  const { user } = useAuthStore.getState()
  if (user && user.id === userId) {
    useAuthStore.setState({ user: { ...user, balance: user.balance + amount } })
  }
}
