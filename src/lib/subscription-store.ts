import { create } from 'zustand'
import { mockSubscriptions, mockPlans, type PlanDuration, getDurationLabel, calculateDevicePrice } from './mock-data'
import {
  fetchTable,
  insertRow,
  updateRow,
  deleteRows,
  subscribeToTable,
  snakeToCamelObj,
  camelToSnakeObj,
} from '@/lib/supabase-sync'

// ── Converter functions: snake_case DB row ↔ camelCase Subscription ──

function subscriptionFromDb(row: Record<string, unknown>): Subscription {
  const camel = snakeToCamelObj<Subscription>(row)
  return {
    id: camel.id ?? '',
    userId: camel.userId ?? '',
    userName: camel.userName ?? '',
    name: camel.name ?? '',
    plan: camel.plan ?? '',
    status: camel.status ?? 'active',
    startDate: camel.startDate ?? '',
    expiryDate: camel.expiryDate ?? '',
    price: typeof camel.price === 'number' ? camel.price : 0,
    bandwidthUsed: typeof camel.bandwidthUsed === 'number' ? camel.bandwidthUsed : 0,
    bandwidthLimit: typeof camel.bandwidthLimit === 'number' ? camel.bandwidthLimit : 0,
    deepLink: camel.deepLink ?? '',
    devices: typeof camel.devices === 'number' ? camel.devices : 1,
  }
}

function subscriptionToDb(sub: Partial<Subscription>): Record<string, unknown> {
  const snake = camelToSnakeObj(sub as Record<string, unknown>)
  return snake
}

// ── Table name constant ──

const TABLE = 'subscriptions'

export interface Subscription {
  id: string
  userId: string
  userName: string
  name: string
  plan: string
  status: 'active' | 'expired' | 'renewable'
  startDate: string
  expiryDate: string
  price: number
  bandwidthUsed: number
  bandwidthLimit: number
  deepLink: string
  devices: number
}

interface SubscriptionState {
  subscriptions: Subscription[]
  isSupabaseConnected: boolean

  // Actions
  addSubscription: (sub: Subscription) => void
  /** Renew = reactivate the SAME subscription (change status to active, extend expiry from today) */
  renewSubscription: (subId: string, newExpiryDate: string) => void
  /** Extend = add duration to an active subscription (extends from current expiry) */
  extendSubscription: (subId: string, newExpiryDate: string, additionalPrice: number) => void
  /** Remove subscription entirely (e.g. after 60-day window) */
  removeSubscription: (subId: string) => void
  /** Get active subscriptions */
  getActiveSubscriptions: () => Subscription[]
  /** Get expired/renewable subscriptions within 60-day window */
  getExpiredSubscriptions: () => Subscription[]
  /** Sync with Supabase */
  syncWithSupabase: () => Promise<void>
}

/** Check if an expired subscription is within the 60-day renewable window */
export function isWithin60Days(expiryDate: string): boolean {
  const expiry = new Date(expiryDate)
  const now = new Date()
  const sixtyDaysAfter = new Date(expiry)
  sixtyDaysAfter.setDate(sixtyDaysAfter.getDate() + 60)
  return now <= sixtyDaysAfter
}

/** Get days left before a subscription vanishes (60 days after expiry) */
export function getDaysBeforeVanish(expiryDate: string): number | null {
  const expiry = new Date(expiryDate)
  const now = new Date()
  const sixtyDaysAfter = new Date(expiry)
  sixtyDaysAfter.setDate(sixtyDaysAfter.getDate() + 60)
  const diff = sixtyDaysAfter.getTime() - now.getTime()
  if (diff <= 0) return null
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/** Find the matching plan for a subscription by name */
export function findMatchingPlan(subName: string) {
  return mockPlans.find((p) => p.name === subName && p.isActive) ?? null
}

/** Calculate the renewal/extend price for a subscription (same plan, same devices) */
export function getSubscriptionPrice(sub: Subscription): number {
  const plan = findMatchingPlan(sub.name)
  if (!plan) return sub.price
  return calculateDevicePrice(plan.basePrice, plan.devicePricing, sub.devices ?? 1)
}

/** Calculate new expiry date when extending from a given date */
export function calculateNewExpiry(fromDate: string | Date, duration: PlanDuration): Date {
  const d = new Date(fromDate)
  switch (duration) {
    case '3d': d.setDate(d.getDate() + 3); break
    case '7d': d.setDate(d.getDate() + 7); break
    case '15d': d.setDate(d.getDate() + 15); break
    case '30d': d.setMonth(d.getMonth() + 1); break
    case '6m': d.setMonth(d.getMonth() + 6); break
    case '1y': d.setFullYear(d.getFullYear() + 1); break
  }
  return d
}

// Initialize from mock data
const initialSubscriptions: Subscription[] = mockSubscriptions.map((s) => ({
  ...s,
  devices: (s as Subscription).devices ?? 1,
}))

// ── Real-time subscription channel reference ──

let realtimeChannel: ReturnType<typeof subscribeToTable<Subscription>> | null = null

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscriptions: initialSubscriptions,
  isSupabaseConnected: false,

  // ── Sync with Supabase ──

  syncWithSupabase: async () => {
    try {
      const data = await fetchTable<Subscription>(TABLE, subscriptionFromDb, 'created_at', false)

      if (data.length > 0) {
        set({ subscriptions: data, isSupabaseConnected: true })
      } else {
        // Table exists but is empty — still mark connected, keep mock data as seed
        set({ isSupabaseConnected: true })
      }

      // Subscribe to real-time changes after successful fetch
      if (!realtimeChannel) {
        realtimeChannel = subscribeToTable<Subscription>(
          TABLE,
          {
            onInsert: (item) => {
              set((state) => {
                // Avoid duplicates (e.g. from own insert echoed back)
                if (state.subscriptions.some((s) => s.id === item.id)) return state
                return { subscriptions: [item, ...state.subscriptions] }
              })
            },
            onUpdate: (item) => {
              set((state) => ({
                subscriptions: state.subscriptions.map((s) => (s.id === item.id ? item : s)),
              }))
            },
            onDelete: (id) => {
              set((state) => ({
                subscriptions: state.subscriptions.filter((s) => s.id !== id),
              }))
            },
          },
          subscriptionFromDb
        )
      }
    } catch (err) {
      console.warn('[SUB-STORE] Supabase sync failed, using mock data:', err)
      // Keep mock data, mark as not connected
      set({ isSupabaseConnected: false })
    }
  },

  // ── Write operations: update local state immediately, push to Supabase in background ──

  addSubscription: (sub) => {
    // Update local state immediately
    set((state) => ({
      subscriptions: [sub, ...state.subscriptions],
    }))

    // Push to Supabase in background
    if (get().isSupabaseConnected) {
      insertRow(TABLE, sub, subscriptionToDb).catch((err) => {
        console.warn('[SUB-STORE] Failed to push addSubscription to Supabase:', err)
      })
    }
  },

  renewSubscription: (subId, newExpiryDate) => {
    // Find current subscription for Supabase push
    const current = get().subscriptions.find((s) => s.id === subId)

    // Update local state immediately
    set((state) => ({
      subscriptions: state.subscriptions.map((s) =>
        s.id === subId
          ? {
              ...s,
              status: 'active' as const,
              expiryDate: newExpiryDate,
              startDate: new Date().toISOString().split('T')[0],
              bandwidthUsed: 0, // Reset bandwidth on renewal
            }
          : s
      ),
    }))

    // Push to Supabase in background
    if (get().isSupabaseConnected && current) {
      updateRow(TABLE, subId, {
        status: 'active' as const,
        expiryDate: newExpiryDate,
        startDate: new Date().toISOString().split('T')[0],
        bandwidthUsed: 0,
      }, subscriptionToDb).catch((err) => {
        console.warn('[SUB-STORE] Failed to push renewSubscription to Supabase:', err)
      })
    }
  },

  extendSubscription: (subId, newExpiryDate, additionalPrice) => {
    // Find current subscription for Supabase push
    const current = get().subscriptions.find((s) => s.id === subId)

    // Update local state immediately
    set((state) => ({
      subscriptions: state.subscriptions.map((s) =>
        s.id === subId
          ? {
              ...s,
              expiryDate: newExpiryDate,
              price: s.price + additionalPrice,
            }
          : s
      ),
    }))

    // Push to Supabase in background
    if (get().isSupabaseConnected && current) {
      updateRow(TABLE, subId, {
        expiryDate: newExpiryDate,
        price: current.price + additionalPrice,
      }, subscriptionToDb).catch((err) => {
        console.warn('[SUB-STORE] Failed to push extendSubscription to Supabase:', err)
      })
    }
  },

  removeSubscription: (subId) => {
    // Update local state immediately
    set((state) => ({
      subscriptions: state.subscriptions.filter((s) => s.id !== subId),
    }))

    // Push to Supabase in background
    if (get().isSupabaseConnected) {
      deleteRows(TABLE, subId).catch((err) => {
        console.warn('[SUB-STORE] Failed to push removeSubscription to Supabase:', err)
      })
    }
  },

  getActiveSubscriptions: () => {
    return get().subscriptions.filter((s) => s.status === 'active')
  },

  getExpiredSubscriptions: () => {
    return get().subscriptions.filter((s) => {
      if (s.status === 'active') return false
      return isWithin60Days(s.expiryDate)
    })
  },
}))

// ── Auto-sync on store creation (setTimeout avoids SSR issues) ──

if (typeof window !== 'undefined') {
  setTimeout(() => {
    useSubscriptionStore.getState().syncWithSupabase()
  }, 0)
}
