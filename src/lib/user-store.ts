import { create } from 'zustand'
import { mockUsers } from '@/lib/mock-data'

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

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
}

interface UserState {
  users: User[]

  // Actions
  addUser: (user: User) => void
  updateUser: (id: string, data: Partial<User>) => void
  deleteUser: (id: string) => void
  setUserStatus: (id: string, status: UserStatus) => void
  setUserRole: (id: string, role: UserRole) => void
  setUserBalance: (id: string, balance: number) => void

  // Getters
  getUserById: (id: string) => User | undefined
}

// Initialize from mock data
const initialUsers: User[] = mockUsers.map((u) => ({
  ...u,
  role: u.role as UserRole,
  status: u.status as UserStatus,
}))

export const useUserStore = create<UserState>((set, get) => ({
  users: initialUsers,

  addUser: (user) => {
    set((state) => ({
      users: [user, ...state.users],
    }))
  },

  updateUser: (id, data) => {
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, ...data } : u)),
    }))
  },

  deleteUser: (id) => {
    set((state) => ({
      users: state.users.filter((u) => u.id !== id),
    }))
  },

  setUserStatus: (id, status) => {
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, status } : u)),
    }))
  },

  setUserRole: (id, role) => {
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, role } : u)),
    }))
  },

  setUserBalance: (id, balance) => {
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, balance } : u)),
    }))
  },

  getUserById: (id) => get().users.find((u) => u.id === id),
}))
