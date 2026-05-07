/**
 * CoreX — Centralized Store Sync
 *
 * Instead of each store auto-syncing on module load (which causes crashes),
 * we provide a single syncAllStores() function that's called explicitly
 * from the app when needed (e.g., after DB init, or on first page load).
 *
 * This prevents multiple concurrent Supabase connections from crashing Next.js.
 */

import { useAuthStore } from './auth-store'
import { usePaymentStore } from './payment-store'
import { useUtilityStore } from './utility-store'
import { useSubscriptionStore } from './subscription-store'
import { useCouponStore } from './coupon-store'
import { useReferralStore } from './referral-store'
import { useTicketStore } from './ticket-store'
import { use2FAStore } from './2fa-store'

let _synced = false
let _syncing = false

/**
 * Sync all stores with Supabase.
 * Safe to call multiple times — only syncs once per session.
 * Each store's syncWithSupabase() is independent and won't crash if one fails.
 */
export async function syncAllStores(): Promise<boolean> {
  if (_synced || _syncing) return _synced
  _syncing = true

  try {
    // Sync all stores in parallel — each one handles its own errors
    await Promise.allSettled([
      useAuthStore.getState().syncWithSupabase(),
      usePaymentStore.getState().syncWithSupabase(),
      useUtilityStore.getState().syncWithSupabase(),
      useSubscriptionStore.getState().syncWithSupabase(),
      useCouponStore.getState().syncWithSupabase(),
      useReferralStore.getState().syncWithSupabase(),
      useTicketStore.getState().syncWithSupabase(),
      use2FAStore.getState().syncWithSupabase(),
    ])

    _synced = true
    return true
  } catch (err) {
    console.warn('[SYNC-ALL] Some stores failed to sync:', err)
    return false
  } finally {
    _syncing = false
  }
}

/**
 * Force re-sync all stores (e.g., after DB init or reset)
 */
export async function forceResyncAllStores(): Promise<boolean> {
  _synced = false
  _syncing = false
  return syncAllStores()
}

/**
 * Check if stores have been synced at least once
 */
export function isSynced(): boolean {
  return _synced
}
