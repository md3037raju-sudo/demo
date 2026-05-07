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
  /** Tracks balance changes for ALL users, not just the logged-in one.
   *  Key = user.id, Value = cumulative pending balance delta.
   *  When a user logs in, any entry here is applied and then removed. */
  userBalanceMap: Record<string, number>
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
  userBalanceMap: {},
  login: (provider) => {
    const role = mockCheckAdmin(provider)
    const baseUser = role === 'admin' ? mockAdmin : mockUser
    const user = { ...baseUser, provider }
    // Apply any pending balance that was recorded while this user was logged out
    const map = get().userBalanceMap
    const pending = map[user.id]
    if (pending && pending !== 0) {
      user.balance = user.balance + pending
      const { [user.id]: _, ...rest } = map
      set({ isAuthenticated: true, user, userBalanceMap: rest })
    } else {
      set({ isAuthenticated: true, user })
    }
    return role
  },
  loginAsAdmin: () => {
    const user = { ...mockAdmin }
    // Apply any pending balance for admin
    const map = get().userBalanceMap
    const pending = map[user.id]
    if (pending && pending !== 0) {
      user.balance = user.balance + pending
      const { [user.id]: _, ...rest } = map
      set({ isAuthenticated: true, user, userBalanceMap: rest })
    } else {
      set({ isAuthenticated: true, user })
    }
    return 'admin' as UserRole
  },
  loginAsUser: () => {
    const currentUser = get().user
    if (currentUser && currentUser.role === 'admin') {
      // Admin choosing to login as user — switch to mock user persona
      const user = { ...mockUser, provider: currentUser.provider }
      // Apply any pending balance for this user
      const map = get().userBalanceMap
      const pending = map[user.id]
      if (pending && pending !== 0) {
        user.balance = user.balance + pending
        const { [user.id]: _, ...rest } = map
        set({ user, userBalanceMap: rest })
      } else {
        set({ user })
      }
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
    // Always record the balance change in the map so any user gets it on login
    const map = get().userBalanceMap
    const updatedMap = { ...map, [userId]: (map[userId] ?? 0) + amount }

    const user = get().user
    if (user && user.id === userId) {
      // Current user matches — update their balance in real-time too
      set({
        user: { ...user, balance: user.balance + amount },
        userBalanceMap: updatedMap,
      })
    } else {
      // Different user (e.g. admin approving payment for another user)
      // Just record in the map; the target user will get it on next login
      set({ userBalanceMap: updatedMap })
    }
  },
}))

// Standalone function for use by other stores (e.g. payment-store)
export function addBalanceToUser(userId: string, amount: number) {
  const state = useAuthStore.getState()

  // Always record the balance change in the map
  const updatedMap = {
    ...state.userBalanceMap,
    [userId]: (state.userBalanceMap[userId] ?? 0) + amount,
  }

  const user = state.user
  if (user && user.id === userId) {
    // Current user matches — update their balance in real-time too
    useAuthStore.setState({
      user: { ...user, balance: user.balance + amount },
      userBalanceMap: updatedMap,
    })
  } else {
    // Different user — record in map only; applied on their next login
    useAuthStore.setState({ userBalanceMap: updatedMap })
  }
}
