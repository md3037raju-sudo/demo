import { create } from 'zustand'
import { mockCoupons, type Coupon } from '@/lib/mock-data'

interface CouponState {
  coupons: Coupon[]
  setCoupons: (coupons: Coupon[]) => void
  addCoupon: (coupon: Coupon) => void
  updateCoupon: (id: string, data: Partial<Coupon>) => void
  deleteCoupon: (id: string) => void
  deleteCoupons: (ids: string[]) => void
  deactivateCoupons: (ids: string[]) => void
  toggleActive: (id: string) => void
  claimCoupon: (couponId: string, userId: string, userName: string, discount: number) => boolean
  validateCoupon: (code: string, userId: string, planId: string, planPrice: number) => { valid: boolean; coupon?: Coupon; error?: string; discount?: number }
}

export const useCouponStore = create<CouponState>((set, get) => ({
  coupons: [...mockCoupons],

  setCoupons: (coupons) => set({ coupons }),

  addCoupon: (coupon) => set((state) => ({ coupons: [coupon, ...state.coupons] })),

  updateCoupon: (id, data) => set((state) => ({
    coupons: state.coupons.map((c) => (c.id === id ? { ...c, ...data } : c)),
  })),

  deleteCoupon: (id) => set((state) => ({
    coupons: state.coupons.filter((c) => c.id !== id),
  })),

  deleteCoupons: (ids) => set((state) => ({
    coupons: state.coupons.filter((c) => !ids.includes(c.id)),
  })),

  deactivateCoupons: (ids) => set((state) => ({
    coupons: state.coupons.map((c) => (ids.includes(c.id) ? { ...c, isActive: false } : c)),
  })),

  toggleActive: (id) => set((state) => ({
    coupons: state.coupons.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)),
  })),

  claimCoupon: (couponId, userId, userName, discount) => {
    const state = get()
    const coupon = state.coupons.find((c) => c.id === couponId)
    if (!coupon) return false
    if (coupon.currentClaims >= coupon.maxClaims) return false

    set((state) => ({
      coupons: state.coupons.map((c) =>
        c.id === couponId
          ? {
              ...c,
              currentClaims: c.currentClaims + 1,
              claimedBy: [...c.claimedBy, { userId, userName, claimedAt: new Date().toISOString().split('T')[0], discount }],
            }
          : c
      ),
    }))
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
    if (planPrice < coupon.minPurchase) return { valid: false, error: `Minimum purchase of $${coupon.minPurchase.toFixed(2)} required`, coupon }

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
