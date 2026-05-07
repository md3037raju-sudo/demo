# Task 8-c: Subscription Store Sync with Supabase

## Summary
Updated the Zustand subscription store (`/home/z/my-project/src/lib/subscription-store.ts`) to sync with Supabase, following the same pattern established by Tasks 8-a (plan-store) and 8-b (user-store).

## Changes Made
1. **Imported sync utilities** from `@/lib/supabase-sync`: `fetchTable`, `insertRow`, `updateRow`, `deleteRows`, `subscribeToTable`, `snakeToCamelObj`, `camelToSnakeObj`

2. **Created converter functions**:
   - `subscriptionFromDb(row)` — converts snake_case DB row to camelCase Subscription with safe defaults
   - `subscriptionToDb(sub)` — converts camelCase Subscription to snake_case for DB writes

3. **Added `isSupabaseConnected` boolean** to SubscriptionState interface

4. **Added `syncWithSupabase()` async method**:
   - Fetches from `subscriptions` table via `fetchTable`
   - Replaces mock data with Supabase data on success
   - Falls back to mock data on failure
   - Subscribes to real-time INSERT/UPDATE/DELETE after successful fetch

5. **Updated all 4 write methods** with optimistic local updates + background Supabase push:
   - `addSubscription` — local insert + `insertRow`
   - `renewSubscription` — local update + `updateRow` (status, expiryDate, startDate, bandwidthUsed)
   - `extendSubscription` — local update + `updateRow` (expiryDate, price)
   - `removeSubscription` — local delete + `deleteRows`

6. **Auto-sync on store creation** via `setTimeout` with `typeof window` guard

7. **Preserved all existing interfaces**: method signatures, exported utility functions unchanged

## Verification
- Lint passes clean
- Dev server compiles successfully
- All existing method signatures preserved exactly
