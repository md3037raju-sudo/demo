import { create } from 'zustand'

interface User {
  id: string
  name: string
  email: string
  avatar: string
  provider: 'google' | 'telegram'
  balance: number
  referralCode: string
  totalReferrals: number
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  login: (provider: 'google' | 'telegram') => void
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
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  login: (provider) => {
    set({
      isAuthenticated: true,
      user: { ...mockUser, provider },
    })
  },
  logout: () => {
    set({
      isAuthenticated: false,
      user: null,
    })
  },
}))
