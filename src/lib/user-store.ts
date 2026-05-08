import { create } from 'zustand'
import { mockUsers } from '@/lib/mock-data'
import {
  fetchTable,
  insertRow,
  updateRow,
  deleteRows,
  subscribeToTable,
  snakeToCamelObj,
  camelToSnakeObj,
} from '@/lib/supabase-sync'

// ── Types (unchanged) ──

export type UserStatus = 'active' | 'banned' | 'suspended'
export type UserRole = 'user' | 'moderator' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  provider: string
  role: UserRole
  balance: number
  status: UserStatus
  joinedAt: string
  subscriptions: number
  devices: number
  lastActive: string
}

// ── Converter functions: snake_case DB row ↔ camelCase User ──

function userFromDb(row: Record<string, unknown>): User {
  const camel = snakeToCamelObj<User>(row)
  return {
    id: (camel.id as string) ?? '',
    name: (camel.name as string) ?? '',
    email: (camel.email as string) ?? '',
    provider: (camel.provider as string) ?? 'google',
    role: (camel.role as UserRole) ?? 'user',
    balance: (camel.balance as number) ?? 0,
    status: (camel.status as UserStatus) ?? 'active',
    joinedAt: (camel.joinedAt as string) ?? '',
    subscriptions: (camel.subscriptions as number) ?? 0,
    devices: (camel.devices as number) ?? 0,
    lastActive: (camel.lastActive as string) ?? '',
  }
}

function userToDb(user: Partial<User>): Record<string, unknown> {
  const snake = camelToSnakeObj(user as Record<string, unknown>)
  return snake
}

// ── Table name constant ──

const TABLE = 'users'

// ── Store interface (unchanged except for new sync fields) ──

interface UserState {
  users: User[]
  isSupabaseConnected: boolean

  // Actions
  addUser: (user: User) => void
  updateUser: (id: string, data: Partial<User>) => void
  deleteUser: (id: string) => void
  setUserStatus: (id: string, status: UserStatus) => void
  setUserRole: (id: string, role: UserRole) => void
  setUserBalance: (id: string, balance: number) => void

  // Getters
  getUserById: (id: string) => User | undefined

  // Sync
  syncWithSupabase: () => Promise<void>
}

// ── Initialize from mock data ──

const initialUsers: User[] = mockUsers.map((u) => ({
  ...u,
  role: u.role as UserRole,
  status: u.status as UserStatus,
}))

// ── Real-time subscription channel reference ──

let realtimeChannel: ReturnType<typeof subscribeToTable<User>> | null = null

// ── Store ──

export const useUserStore = create<UserState>((set, get) => ({
  users: initialUsers,
  isSupabaseConnected: false,

  // ── Sync with Supabase ──

  syncWithSupabase: async () => {
    try {
      const data = await fetchTable<User>(TABLE, userFromDb, 'created_at', false)

      if (data.length > 0) {
        set({ users: data, isSupabaseConnected: true })
      } else {
        // Table exists but is empty — still mark connected, keep mock data as seed
        set({ isSupabaseConnected: true })
      }

      // Subscribe to real-time changes after successful fetch
      if (!realtimeChannel) {
        realtimeChannel = subscribeToTable<User>(
          TABLE,
          {
            onInsert: (item) => {
              set((state) => {
                // Avoid duplicates (e.g. from own insert echoed back)
                if (state.users.some((u) => u.id === item.id)) return state
                return { users: [item, ...state.users] }
              })
            },
            onUpdate: (item) => {
              set((state) => ({
                users: state.users.map((u) => (u.id === item.id ? item : u)),
              }))
            },
            onDelete: (id) => {
              set((state) => ({
                users: state.users.filter((u) => u.id !== id),
              }))
            },
          },
          userFromDb
        )
      }
    } catch (err) {
      console.warn('[USER-STORE] Supabase sync failed, using mock data:', err)
      // Keep mock data, mark as not connected
      set({ isSupabaseConnected: false })
    }
  },

  // ── Write operations: update local state immediately, push to Supabase in background ──

  addUser: (user) => {
    // Update local state immediately
    set((state) => ({
      users: [user, ...state.users],
    }))

    // Push to Supabase in background
    if (get().isSupabaseConnected) {
      insertRow(TABLE, user, userToDb).catch((err) => {
        console.warn('[USER-STORE] Failed to push addUser to Supabase:', err)
      })
    }
  },

  updateUser: (id, data) => {
    // Update local state immediately
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, ...data } : u)),
    }))

    // Push to Supabase in background
    if (get().isSupabaseConnected) {
      updateRow(TABLE, id, data, userToDb).catch((err) => {
        console.warn('[USER-STORE] Failed to push updateUser to Supabase:', err)
      })
    }
  },

  deleteUser: (id) => {
    // Update local state immediately
    set((state) => ({
      users: state.users.filter((u) => u.id !== id),
    }))

    // Push to Supabase in background
    if (get().isSupabaseConnected) {
      deleteRows(TABLE, id).catch((err) => {
        console.warn('[USER-STORE] Failed to push deleteUser to Supabase:', err)
      })
    }
  },

  setUserStatus: (id, status) => {
    // Update local state immediately
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, status } : u)),
    }))

    // Push to Supabase in background
    if (get().isSupabaseConnected) {
      updateRow(TABLE, id, { status }, userToDb).catch((err) => {
        console.warn('[USER-STORE] Failed to push setUserStatus to Supabase:', err)
      })
    }
  },

  setUserRole: (id, role) => {
    // Update local state immediately
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, role } : u)),
    }))

    // Push to Supabase in background
    if (get().isSupabaseConnected) {
      updateRow(TABLE, id, { role }, userToDb).catch((err) => {
        console.warn('[USER-STORE] Failed to push setUserRole to Supabase:', err)
      })
    }
  },

  setUserBalance: (id, balance) => {
    // Update local state immediately
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, balance } : u)),
    }))

    // Push to Supabase in background
    if (get().isSupabaseConnected) {
      updateRow(TABLE, id, { balance }, userToDb).catch((err) => {
        console.warn('[USER-STORE] Failed to push setUserBalance to Supabase:', err)
      })
    }
  },

  getUserById: (id) => get().users.find((u) => u.id === id),
}))

// NOTE: Auto-sync removed — call syncAllStores() from the app to trigger sync
