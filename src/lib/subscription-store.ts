import { create } from 'zustand'
import { mockSubscriptions, mockPlans, type PlanDuration, getDurationLabel, calculateDevicePrice } from './mock-data'

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

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscriptions: initialSubscriptions,

  addSubscription: (sub) => {
    set((state) => ({
      subscriptions: [sub, ...state.subscriptions],
    }))
  },

  renewSubscription: (subId, newExpiryDate) => {
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
  },

  extendSubscription: (subId, newExpiryDate, additionalPrice) => {
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
  },

  removeSubscription: (subId) => {
    set((state) => ({
      subscriptions: state.subscriptions.filter((s) => s.id !== subId),
    }))
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
