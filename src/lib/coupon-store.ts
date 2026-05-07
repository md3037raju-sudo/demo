import { create } from 'zustand'
import { mockCoupons, type Coupon } from '@/lib/mock-data'
import {
  fetchTable,
  insertRow,
  updateRow,
  deleteRows,
  subscribeToTable,
  snakeToCamelObj,
  camelToSnakeObj,
} from '@/lib/supabase-sync'

// ── Converter functions: snake_case DB row ↔ camelCase Coupon ──

function couponFromDb(row: Record<string, unknown>): Coupon {
  const camel = snakeToCamelObj<Coupon>(row)
  return {
    id: camel.id ?? '',
    code: camel.code ?? '',
    description: camel.description ?? '',
    type: camel.type === 'percentage' ? 'percentage' : 'fixed',
    value: typeof camel.value === 'number' ? camel.value : 0,
    minPurchase: typeof camel.minPurchase === 'number' ? camel.minPurchase : 0,
    maxDiscount: typeof camel.maxDiscount === 'number' ? camel.maxDiscount : 0,
    maxClaims: typeof camel.maxClaims === 'number' ? camel.maxClaims : 1,
    currentClaims: typeof camel.currentClaims === 'number' ? camel.currentClaims : 0,
    applicablePlans: Array.isArray(camel.applicablePlans) ? camel.applicablePlans : [],
    expiresAt: camel.expiresAt ?? '',
    createdAt: camel.createdAt ?? '',
    isActive: typeof camel.isActive === 'boolean' ? camel.isActive : true,
    claimedBy: Array.isArray(camel.claimedBy) ? camel.claimedBy : [],
  }
}

function couponToDb(item: Partial<Coupon>): Record<string, unknown> {
  return camelToSnakeObj(item as Record<string, unknown>)
}

// ── Table name constant ──

const TABLE = 'coupons'

// ── Store interface (unchanged from original) ──

interface CouponState {
  coupons: Coupon[]
  isSupabaseConnected: boolean

  setCoupons: (coupons: Coupon[]) => void
  addCoupon: (coupon: Coupon) => void
  updateCoupon: (id: string, data: Partial<Coupon>) => void
  deleteCoupon: (id: string) => void
  deleteCoupons: (ids: string[]) => void
  deactivateCoupons: (ids: string[]) => void
  toggleActive: (id: string) => void
  claimCoupon: (couponId: string, userId: string, userName: string, discount: number) => boolean
  validateCoupon: (code: string, userId: string, planId: string, planPrice: number) => { valid: boolean; coupon?: Coupon; error?: string; discount?: number }

  // Sync
  syncWithSupabase: () => Promise<void>
}

// ── Real-time subscription channel reference ──

let realtimeChannel: ReturnType<typeof subscribeToTable<Coupon>> | null = null

// ── Store ──

export const useCouponStore = create<CouponState>((set, get) => ({
  coupons: [...mockCoupons],
  isSupabaseConnected: false,

  // ── Sync with Supabase ──

  syncWithSupabase: async () => {
    try {
      const data = await fetchTable<Coupon>(TABLE, couponFromDb, 'created_at', false)

      if (data.length > 0) {
        set({ coupons: data, isSupabaseConnected: true })
      } else {
        set({ isSupabaseConnected: true })
      }

      // Subscribe to real-time changes after successful fetch
      if (!realtimeChannel) {
        realtimeChannel = subscribeToTable<Coupon>(
          TABLE,
          {
            onInsert: (item) => {
              set((state) => {
                if (state.coupons.some((c) => c.id === item.id)) return state
                return { coupons: [item, ...state.coupons] }
              })
            },
            onUpdate: (item) => {
              set((state) => ({
                coupons: state.coupons.map((c) => (c.id === item.id ? item : c)),
              }))
            },
            onDelete: (id) => {
              set((state) => ({
                coupons: state.coupons.filter((c) => c.id !== id),
              }))
            },
          },
          couponFromDb
        )
      }
    } catch (err) {
      console.warn('[COUPON-STORE] Supabase sync failed, using mock data:', err)
      set({ isSupabaseConnected: false })
    }
  },

  // ── Write operations: update local state immediately, push to Supabase in background ──

  setCoupons: (coupons) => set({ coupons }),

  addCoupon: (coupon) => {
    set((state) => ({ coupons: [coupon, ...state.coupons] }))

    if (get().isSupabaseConnected) {
      insertRow(TABLE, coupon, couponToDb).catch((err) => {
        console.warn('[COUPON-STORE] Failed to push addCoupon to Supabase:', err)
      })
    }
  },

  updateCoupon: (id, data) => {
    set((state) => ({
      coupons: state.coupons.map((c) => (c.id === id ? { ...c, ...data } : c)),
    }))

    if (get().isSupabaseConnected) {
      updateRow(TABLE, id, data, couponToDb).catch((err) => {
        console.warn('[COUPON-STORE] Failed to push updateCoupon to Supabase:', err)
      })
    }
  },

  deleteCoupon: (id) => {
    set((state) => ({
      coupons: state.coupons.filter((c) => c.id !== id),
    }))

    if (get().isSupabaseConnected) {
      deleteRows(TABLE, id).catch((err) => {
        console.warn('[COUPON-STORE] Failed to push deleteCoupon to Supabase:', err)
      })
    }
  },

  deleteCoupons: (ids) => {
    const set_ = new Set(ids)

    set((state) => ({
      coupons: state.coupons.filter((c) => !set_.has(c.id)),
    }))

    if (get().isSupabaseConnected) {
      deleteRows(TABLE, ids).catch((err) => {
        console.warn('[COUPON-STORE] Failed to push deleteCoupons to Supabase:', err)
      })
    }
  },

  deactivateCoupons: (ids) => {
    set((state) => ({
      coupons: state.coupons.map((c) => (ids.includes(c.id) ? { ...c, isActive: false } : c)),
    }))

    if (get().isSupabaseConnected) {
      ids.forEach((id) => {
        updateRow(TABLE, id, { isActive: false }, couponToDb).catch((err) => {
          console.warn('[COUPON-STORE] Failed to push deactivateCoupons to Supabase:', err)
        })
      })
    }
  },

  toggleActive: (id) => {
    const coupon = get().coupons.find((c) => c.id === id)
    if (!coupon) return

    const newIsActive = !coupon.isActive

    set((state) => ({
      coupons: state.coupons.map((c) => (c.id === id ? { ...c, isActive: newIsActive } : c)),
    }))

    if (get().isSupabaseConnected) {
      updateRow(TABLE, id, { isActive: newIsActive }, couponToDb).catch((err) => {
        console.warn('[COUPON-STORE] Failed to push toggleActive to Supabase:', err)
      })
    }
  },

  claimCoupon: (couponId, userId, userName, discount) => {
    const state = get()
    const coupon = state.coupons.find((c) => c.id === couponId)
    if (!coupon) return false
    if (coupon.currentClaims >= coupon.maxClaims) return false

    const newClaimEntry = { userId, userName, claimedAt: new Date().toISOString().split('T')[0], discount }
    const updatedCoupon = {
      currentClaims: coupon.currentClaims + 1,
      claimedBy: [...coupon.claimedBy, newClaimEntry],
    }

    set((state) => ({
      coupons: state.coupons.map((c) =>
        c.id === couponId ? { ...c, ...updatedCoupon } : c
      ),
    }))

    // Push the updated fields to Supabase in background
    if (get().isSupabaseConnected) {
      updateRow(TABLE, couponId, updatedCoupon, couponToDb).catch((err) => {
        console.warn('[COUPON-STORE] Failed to push claimCoupon to Supabase:', err)
      })
    }

    return true
  },

  validateCoupon: (code, userId, planId, planPrice) => {
    const coupon = get().coupons.find((c) => c.code === code.toUpperCase())

    if (!coupon) return { valid: false, error: 'Invalid coupon code' }
    if (!coupon.isActive) return { valid: false, error: 'This coupon is no longer active', coupon }
    if (new Date(coupon.expiresAt) < new Date()) return { valid: false, error: 'This coupon has expired', coupon }
    if (coupon.currentClaims >= coupon.maxClaims) return { valid: false, error: 'This coupon has reached its maximum claims', coupon }
    if (coupon.claimedBy.some((c) => c.userId === userId)) return { valid: false, error: 'You have already used this coupon', coupon }
    if (coupon.applicablePlans.length > 0 && !coupon.applicablePlans.includes(planId)) return { valid: false, error: 'This coupon is not applicable to the selected plan', coupon }
    if (planPrice < coupon.minPurchase) return { valid: false, error: `Minimum purchase of ৳${coupon.minPurchase.toFixed(2)} required`, coupon }

    let discount = 0
    if (coupon.type === 'percentage') {
      discount = planPrice * (coupon.value / 100)
      if (coupon.maxDiscount > 0) discount = Math.min(discount, coupon.maxDiscount)
    } else {
      discount = Math.min(coupon.value, planPrice)
    }

    return { valid: true, coupon, discount }
  },
}))

// ── Auto-sync on store creation (setTimeout avoids SSR issues) ──

if (typeof window !== 'undefined') {
  setTimeout(() => {
    useCouponStore.getState().syncWithSupabase()
  }, 0)
}
