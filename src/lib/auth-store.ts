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
  login: (provider: 'google' | 'telegram', role?: UserRole) => void
  loginAsAdmin: () => void
  logout: () => void
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

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  login: (provider, role = 'user') => {
    set({
      isAuthenticated: true,
      user: { ...mockUser, provider, role },
    })
  },
  loginAsAdmin: () => {
    set({
      isAuthenticated: true,
      user: { ...mockAdmin },
    })
  },
  logout: () => {
    set({
      isAuthenticated: false,
      user: null,
    })
  },
}))
