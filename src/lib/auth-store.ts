import { create } from 'zustand'
import {
  fetchTable,
  fetchOne,
  updateRow,
  snakeToCamelObj,
  camelToSnakeObj,
} from '@/lib/supabase-sync'

// ── Types ──

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
  isSupabaseConnected: boolean
  login: (provider: 'google' | 'telegram') => UserRole
  loginAsAdmin: () => UserRole
  loginAsUser: () => void
  logout: () => void
  deductBalance: (amount: number) => void
  addBalance: (userId: string, amount: number) => void
  syncWithSupabase: () => Promise<void>
}

// ── Mock data ──

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

// ── Converter: DB row → auth User ──

function authUserFromDb(row: Record<string, unknown>): User {
  const camel = snakeToCamelObj<Record<string, unknown>>(row)
  return {
    id: (camel.id as string) ?? '',
    name: (camel.name as string) ?? '',
    email: (camel.email as string) ?? '',
    avatar: (camel.avatar as string) ?? '',
    provider: (camel.provider as 'google' | 'telegram') ?? 'google',
    balance: (camel.balance as number) ?? 0,
    referralCode: (camel.referralCode as string) ?? '',
    totalReferrals: (camel.totalReferrals as number) ?? 0,
    role: (camel.role as UserRole) ?? 'user',
  }
}

const TABLE = 'users'

// ── Helper: fetch user from API by email ──

async function fetchUserByEmail(email: string): Promise<User | null> {
  try {
    const params = new URLSearchParams({ table: TABLE, email, limit: '1' })
    const res = await fetch(`/api/supabase?${params}`)
    if (!res.ok) return null
    const result = await res.json()
    if (!result.data?.[0]) return null
    return authUserFromDb(result.data[0])
  } catch {
    return null
  }
}

// ── Helper: fetch user from API by id ──

async function fetchUserById(id: string): Promise<User | null> {
  return fetchOne<User>(TABLE, id, authUserFromDb)
}

// ── Helper: apply pending balance from userBalanceMap ──

function applyPendingBalance(user: User, map: Record<string, number>): {
  user: User
  updatedMap: Record<string, number>
} {
  const pending = map[user.id]
  if (pending && pending !== 0) {
    const { [user.id]: _, ...rest } = map
    return { user: { ...user, balance: user.balance + pending }, updatedMap: rest }
  }
  return { user, updatedMap: map }
}

// ── Store ──

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  userBalanceMap: {},
  isSupabaseConnected: false,

  syncWithSupabase: async () => {
    try {
      const data = await fetchTable<User>(TABLE, authUserFromDb, 'created_at', false)

      // If fetchTable didn't throw, we're connected
      set({ isSupabaseConnected: true })

      // If a user is already logged in, refresh their data from Supabase
      const currentUser = get().user
      if (currentUser) {
        const supabaseUser = await fetchUserById(currentUser.id)
        if (supabaseUser) {
          const map = get().userBalanceMap
          const { user: updatedUser, updatedMap } = applyPendingBalance(supabaseUser, map)
          set({ user: updatedUser, userBalanceMap: updatedMap })
        }
      }
    } catch (err) {
      console.warn('[AUTH-STORE] Supabase sync failed:', err)
      set({ isSupabaseConnected: false })
    }
  },

  login: (provider) => {
    const role = provider === 'google' ? 'admin' as UserRole : 'user' as UserRole
    const baseUser = role === 'admin' ? mockAdmin : mockUser
    const user = { ...baseUser, provider }

    const map = get().userBalanceMap
    const { user: updatedUser, updatedMap } = applyPendingBalance(user, map)
    set({ isAuthenticated: true, user: updatedUser, userBalanceMap: updatedMap })

    // Background: try to fetch user from Supabase for real data
    if (get().isSupabaseConnected) {
      fetchUserByEmail(user.email).then((supabaseUser) => {
        if (supabaseUser) {
          const mergedUser = { ...supabaseUser, provider }
          const currentMap = get().userBalanceMap
          const { user: refreshedUser, updatedMap: refreshedMap } = applyPendingBalance(mergedUser, currentMap)
          const current = get().user
          if (current && current.id === supabaseUser.id && get().isAuthenticated) {
            set({ user: refreshedUser, userBalanceMap: refreshedMap })
          }
        }
      }).catch(() => {})
    }

    return role
  },

  loginAsAdmin: () => {
    const user = { ...mockAdmin }
    const map = get().userBalanceMap
    const { user: updatedUser, updatedMap } = applyPendingBalance(user, map)
    set({ isAuthenticated: true, user: updatedUser, userBalanceMap: updatedMap })

    if (get().isSupabaseConnected) {
      fetchUserByEmail(mockAdmin.email).then((supabaseUser) => {
        if (supabaseUser) {
          const currentMap = get().userBalanceMap
          const { user: refreshedUser, updatedMap: refreshedMap } = applyPendingBalance(supabaseUser, currentMap)
          const current = get().user
          if (current && current.id === supabaseUser.id && get().isAuthenticated) {
            set({ user: refreshedUser, userBalanceMap: refreshedMap })
          }
        }
      }).catch(() => {})
    }

    return 'admin' as UserRole
  },

  loginAsUser: () => {
    const currentUser = get().user
    if (currentUser && currentUser.role === 'admin') {
      const user = { ...mockUser, provider: currentUser.provider }
      const map = get().userBalanceMap
      const { user: updatedUser, updatedMap } = applyPendingBalance(user, map)
      set({ user: updatedUser, userBalanceMap: updatedMap })

      if (get().isSupabaseConnected) {
        fetchUserByEmail(mockUser.email).then((supabaseUser) => {
          if (supabaseUser) {
            const mergedUser = { ...supabaseUser, provider: currentUser.provider }
            const currentMap = get().userBalanceMap
            const { user: refreshedUser, updatedMap: refreshedMap } = applyPendingBalance(mergedUser, currentMap)
            const current = get().user
            if (current && current.id === supabaseUser.id && get().isAuthenticated) {
              set({ user: refreshedUser, userBalanceMap: refreshedMap })
            }
          }
        }).catch(() => {})
      }
    }
  },

  logout: () => {
    set({ isAuthenticated: false, user: null })
  },

  deductBalance: (amount: number) => {
    const user = get().user
    if (user) {
      const newBalance = user.balance - amount
      set({ user: { ...user, balance: newBalance } })

      if (get().isSupabaseConnected) {
        updateRow(TABLE, user.id, { balance: newBalance }, (data) =>
          camelToSnakeObj(data as Record<string, unknown>)
        ).catch(() => {})
      }
    }
  },

  addBalance: (userId: string, amount: number) => {
    const user = get().user
    if (user && user.id === userId) {
      // Apply directly to the currently logged-in user.
      // Remove any pending map entry for this user to avoid double-counting
      // on re-login (Supabase already has the updated balance).
      const newBalance = user.balance + amount
      const { [userId]: _, ...restMap } = get().userBalanceMap
      set({ user: { ...user, balance: newBalance }, userBalanceMap: restMap })

      if (get().isSupabaseConnected) {
        updateRow(TABLE, userId, { balance: newBalance }, (data) =>
          camelToSnakeObj(data as Record<string, unknown>)
        ).catch(() => {})
      }
    } else {
      // User is not currently logged in — store the delta in the map
      // so it can be applied when they next log in.
      const map = get().userBalanceMap
      const updatedMap = { ...map, [userId]: (map[userId] ?? 0) + amount }
      set({ userBalanceMap: updatedMap })

      if (get().isSupabaseConnected) {
        fetchUserById(userId).then((supabaseUser) => {
          if (supabaseUser) {
            const newBalance = supabaseUser.balance + amount
            updateRow(TABLE, userId, { balance: newBalance }, (data) =>
              camelToSnakeObj(data as Record<string, unknown>)
            ).catch(() => {})
          }
        }).catch(() => {})
      }
    }
  },
}))

// ── Standalone function for use by other stores ──

export function addBalanceToUser(userId: string, amount: number) {
  const state = useAuthStore.getState()
  const user = state.user

  if (user && user.id === userId) {
    // Apply directly to the currently logged-in user.
    // Remove any pending map entry for this user to avoid double-counting
    // on re-login (Supabase already has the updated balance).
    const newBalance = user.balance + amount
    const { [userId]: _, ...restMap } = state.userBalanceMap
    useAuthStore.setState({ user: { ...user, balance: newBalance }, userBalanceMap: restMap })

    if (useAuthStore.getState().isSupabaseConnected) {
      updateRow(TABLE, userId, { balance: newBalance }, (data) =>
        camelToSnakeObj(data as Record<string, unknown>)
      ).catch(() => {})
    }
  } else {
    // User is not currently logged in — store the delta in the map
    // so it can be applied when they next log in.
    const updatedMap = { ...state.userBalanceMap, [userId]: (state.userBalanceMap[userId] ?? 0) + amount }
    useAuthStore.setState({ userBalanceMap: updatedMap })

    if (useAuthStore.getState().isSupabaseConnected) {
      fetchUserById(userId).then((supabaseUser) => {
        if (supabaseUser) {
          const newBalance = supabaseUser.balance + amount
          updateRow(TABLE, userId, { balance: newBalance }, (data) =>
            camelToSnakeObj(data as Record<string, unknown>)
          ).catch(() => {})
        }
      }).catch(() => {})
    }
  }
}
