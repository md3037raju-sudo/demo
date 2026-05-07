import { create } from 'zustand'
import {
  fetchTable,
  updateRow,
  subscribeToTable,
  snakeToCamelObj,
  camelToSnakeObj,
} from '@/lib/supabase-sync'
import { getSupabaseBrowser as supabaseBrowser } from '@/lib/supabase-client'

// ── Types (unchanged) ──

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

// ── Mock data (unchanged, used as fallback) ──

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

// ── Converter functions: snake_case DB row → camelCase auth User ──

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

// ── Table name constant ──

const TABLE = 'users'

// ── Simulates a backend check: is this OAuth account an admin? ──
// For demo: Google account → admin (admin@corex.io is a Google account)
// Telegram account → regular user

function mockCheckAdmin(provider: 'google' | 'telegram'): UserRole {
  if (provider === 'google') return 'admin'
  return 'user'
}

// ── Helper: fetch user from Supabase by email ──

async function fetchUserByEmail(email: string): Promise<User | null> {
  try {
    const { data, error } = await supabaseBrowser()
      .from(TABLE)
      .select('*')
      .eq('email', email)
      .limit(1)
      .single()

    if (error || !data) return null

    return authUserFromDb(data as Record<string, unknown>)
  } catch {
    return null
  }
}

// ── Helper: fetch user from Supabase by id ──

async function fetchUserById(id: string): Promise<User | null> {
  try {
    const { data, error } = await supabaseBrowser()
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .limit(1)
      .single()

    if (error || !data) return null

    return authUserFromDb(data as Record<string, unknown>)
  } catch {
    return null
  }
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

// ── Real-time subscription channel reference ──

let realtimeChannel: ReturnType<typeof subscribeToTable<User>> | null = null

// ── Store ──

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  userBalanceMap: {},
  isSupabaseConnected: false,

  // ── Sync with Supabase ──

  syncWithSupabase: async () => {
    try {
      // Try to fetch users table to check connection
      const data = await fetchTable<User>(TABLE, authUserFromDb, 'created_at', false)

      if (data.length > 0 || data.length === 0) {
        // If fetchTable didn't throw, we're connected
        set({ isSupabaseConnected: true })
      }

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

      // Subscribe to real-time changes after successful fetch
      if (!realtimeChannel) {
        realtimeChannel = subscribeToTable<User>(
          TABLE,
          {
            onInsert: () => {
              // Not relevant for auth store — we don't maintain a user list
            },
            onUpdate: (item) => {
              // If the updated user is the currently logged-in user, update their state
              const currentUser = get().user
              if (currentUser && currentUser.id === item.id) {
                set({ user: item })
              }
            },
            onDelete: () => {
              // Not relevant for auth store
            },
          },
          authUserFromDb
        )
      }
    } catch (err) {
      console.warn('[AUTH-STORE] Supabase sync failed:', err)
      set({ isSupabaseConnected: false })
    }
  },

  // ── Login methods ──

  login: (provider) => {
    const role = mockCheckAdmin(provider)
    const baseUser = role === 'admin' ? mockAdmin : mockUser
    const user = { ...baseUser, provider }

    // Apply any pending balance that was recorded while this user was logged out
    const map = get().userBalanceMap
    const { user: updatedUser, updatedMap } = applyPendingBalance(user, map)
    set({ isAuthenticated: true, user: updatedUser, userBalanceMap: updatedMap })

    // Background: try to fetch user from Supabase by email for real data
    if (get().isSupabaseConnected) {
      fetchUserByEmail(user.email).then((supabaseUser) => {
        if (supabaseUser) {
          // Re-apply with provider override from the login call
          const mergedUser = { ...supabaseUser, provider }
          const currentMap = get().userBalanceMap
          const { user: refreshedUser, updatedMap: refreshedMap } = applyPendingBalance(mergedUser, currentMap)
          // Only update if the user is still the same one (hasn't logged out)
          const current = get().user
          if (current && current.id === supabaseUser.id && get().isAuthenticated) {
            set({ user: refreshedUser, userBalanceMap: refreshedMap })
          }
        }
      }).catch(() => {
        // Silently ignore — mock data is already set
      })
    }

    return role
  },

  loginAsAdmin: () => {
    const user = { ...mockAdmin }

    // Apply any pending balance for admin
    const map = get().userBalanceMap
    const { user: updatedUser, updatedMap } = applyPendingBalance(user, map)
    set({ isAuthenticated: true, user: updatedUser, userBalanceMap: updatedMap })

    // Background: try to fetch admin from Supabase by email for real data
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
      }).catch(() => {
        // Silently ignore — mock data is already set
      })
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
      const { user: updatedUser, updatedMap } = applyPendingBalance(user, map)
      set({ user: updatedUser, userBalanceMap: updatedMap })

      // Background: try to fetch user from Supabase by email for real data
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
        }).catch(() => {
          // Silently ignore — mock data is already set
        })
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
      const newBalance = user.balance - amount
      set({ user: { ...user, balance: newBalance } })

      // Push balance update to Supabase in background
      if (get().isSupabaseConnected) {
        updateRow(TABLE, user.id, { balance: newBalance }, (data) =>
          camelToSnakeObj(data as Record<string, unknown>)
        ).catch((err) => {
          console.warn('[AUTH-STORE] Failed to push deductBalance to Supabase:', err)
        })
      }
    }
  },

  addBalance: (userId: string, amount: number) => {
    // Always record the balance change in the map so any user gets it on login
    const map = get().userBalanceMap
    const updatedMap = { ...map, [userId]: (map[userId] ?? 0) + amount }

    const user = get().user
    if (user && user.id === userId) {
      // Current user matches — update their balance in real-time too
      const newBalance = user.balance + amount
      set({
        user: { ...user, balance: newBalance },
        userBalanceMap: updatedMap,
      })

      // Push balance update to Supabase in background
      if (get().isSupabaseConnected) {
        updateRow(TABLE, userId, { balance: newBalance }, (data) =>
          camelToSnakeObj(data as Record<string, unknown>)
        ).catch((err) => {
          console.warn('[AUTH-STORE] Failed to push addBalance to Supabase:', err)
        })
      }
    } else {
      // Different user (e.g. admin approving payment for another user)
      // Just record in the map; the target user will get it on next login
      set({ userBalanceMap: updatedMap })

      // Push balance update to Supabase in background
      // We need to compute the new balance from Supabase data
      if (get().isSupabaseConnected) {
        fetchUserById(userId).then((supabaseUser) => {
          if (supabaseUser) {
            const newBalance = supabaseUser.balance + amount
            updateRow(TABLE, userId, { balance: newBalance }, (data) =>
              camelToSnakeObj(data as Record<string, unknown>)
            ).catch((err) => {
              console.warn('[AUTH-STORE] Failed to push addBalance (other user) to Supabase:', err)
            })
          }
        }).catch(() => {
          // Silently ignore
        })
      }
    }
  },
}))

// ── Standalone function for use by other stores (e.g. payment-store) ──

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
    const newBalance = user.balance + amount
    useAuthStore.setState({
      user: { ...user, balance: newBalance },
      userBalanceMap: updatedMap,
    })

    // Push balance update to Supabase in background
    if (useAuthStore.getState().isSupabaseConnected) {
      updateRow(TABLE, userId, { balance: newBalance }, (data) =>
        camelToSnakeObj(data as Record<string, unknown>)
      ).catch((err) => {
        console.warn('[AUTH-STORE] Failed to push addBalanceToUser to Supabase:', err)
      })
    }
  } else {
    // Different user — record in map only; applied on their next login
    useAuthStore.setState({ userBalanceMap: updatedMap })

    // Push balance update to Supabase in background
    if (useAuthStore.getState().isSupabaseConnected) {
      fetchUserById(userId).then((supabaseUser) => {
        if (supabaseUser) {
          const newBalance = supabaseUser.balance + amount
          updateRow(TABLE, userId, { balance: newBalance }, (data) =>
            camelToSnakeObj(data as Record<string, unknown>)
          ).catch((err) => {
            console.warn('[AUTH-STORE] Failed to push addBalanceToUser (other user) to Supabase:', err)
          })
        }
      }).catch(() => {
        // Silently ignore
      })
    }
  }
}

// ── Auto-sync on store creation (setTimeout avoids SSR issues) ──

if (typeof window !== 'undefined') {
  setTimeout(() => {
    useAuthStore.getState().syncWithSupabase()
  }, 0)
}
