---
Task ID: 1
Agent: Main
Task: Implement 6 user-requested features for CoreX admin/user panels

Work Log:
- Read all relevant store files, admin pages, and user pages to understand architecture
- Added `registrationEnabled: boolean` to utility-store.ts config
- Updated payment-store.ts: added `deleteRequest`, `deleteRequests` actions, `isTrxIdApproved` getter, and modified `submitBalanceRequest` to return null on duplicate approved TrxID
- Created `/src/lib/ticket-store.ts` — shared Zustand store connecting admin and user ticket data, with create (one-at-a-time restriction), reply, status change, delete, and bulk operations
- Updated admin-users.tsx: added `isInactive60Days` helper + "Inactive (60d)" filter option in status dropdown
- Updated admin-utility.tsx: added Registration Control card with on/off toggle and save functionality
- Updated login-page.tsx: added `registrationEnabled` check from utility store, shows paused banner and disables Google/Telegram buttons when registration is off (admin access still works)
- Updated payments-page.tsx (user): handles null return from submitBalanceRequest for duplicate TrxID
- Rewrote admin-payments.tsx: added status filter (approved/rejected/pending) in All Payments tab, single delete via dropdown, bulk delete, and updated bulk action bar
- Rewrote admin-tickets.tsx: uses shared ticket-store instead of local state, added single delete, bulk delete, delete confirmation dialogs
- Rewrote user-tickets-page.tsx: uses shared ticket-store, one-ticket-at-a-time restriction, view ticket detail dialog with reply functionality, warning banner when active ticket exists

Stage Summary:
- 6 features implemented: Inactive users filter, Registration toggle, Payment/ticket deletion sync, Payment status filter + delete, Duplicate TrxID prevention, One ticket per user restriction
- All files lint clean, dev server compiles successfully
- Key architectural change: ticket-store.ts now provides shared state between admin and user ticket pages (previously disconnected local state)

---
Task ID: 8-a
Agent: Plan Store Sync
Task: Update Zustand plan store to sync with Supabase

Work Log:
- Read existing plan-store.ts, supabase-sync.ts, supabase-client.ts, and mock-data.ts to understand current architecture
- Created converter functions `planFromDb` (snake_case DB row → camelCase Plan) and `planToDb` (camelCase → snake_case)
- Added `isSupabaseConnected` boolean state to PlanState interface
- Added `syncWithSupabase()` async method that:
  - Fetches data from Supabase `plans` table using `fetchTable` with `planFromDb` converter
  - If data returned, replaces mock data with Supabase data and sets `isSupabaseConnected: true`
  - If table exists but empty, keeps mock data as seed and marks connected
  - On failure, falls back to mock data with `isSupabaseConnected: false`
  - After successful fetch, subscribes to real-time changes via `subscribeToTable`
- Real-time subscription handles INSERT (add to store, dedup), UPDATE (replace plan), DELETE (remove plan)
- Updated all 6 write methods (addPlan, updatePlan, deletePlan, deletePlans, toggleActive, setPlansActive) to:
  - Update local Zustand state immediately (optimistic UI)
  - Push change to Supabase in background via insertRow/updateRow/deleteRows
  - Graceful degradation: if Supabase push fails, local state is already updated and preserved
- Auto-sync on store creation using `setTimeout(() => syncWithSupabase(), 0)` with `typeof window` guard to avoid SSR issues
- All existing method signatures preserved exactly — no breaking changes
- Lint passes clean, dev server compiles successfully

Stage Summary:
- Plan store now fully syncs with Supabase while maintaining 100% backward compatibility
- Store works both with and without Supabase connected (graceful fallback to mock data)
- Real-time subscriptions keep multiple clients in sync
- Optimistic local updates + background Supabase push for responsive UX

---
Task ID: 8-b
Agent: User Store Sync
Task: Update Zustand user store to sync with Supabase

Work Log:
- Read existing user-store.ts, supabase-sync.ts, plan-store.ts (reference pattern from 8-a), and mock-data.ts to understand current architecture
- Created converter functions `userFromDb` (snake_case DB row → camelCase User) and `userToDb` (camelCase → snake_case)
  - userFromDb explicitly maps each field with defaults for safety (e.g. provider defaults to 'google', role to 'user', status to 'active')
  - Extra DB-only fields (avatar, referral_code, total_referrals, created_at, updated_at) are gracefully ignored by userFromDb
- Added `isSupabaseConnected` boolean state to UserState interface
- Added `syncWithSupabase()` async method that:
  - Fetches data from Supabase `users` table using `fetchTable` with `userFromDb` converter
  - If data returned, replaces mock data with Supabase data and sets `isSupabaseConnected: true`
  - If table exists but empty, keeps mock data as seed and marks connected
  - On failure, falls back to mock data with `isSupabaseConnected: false`
  - After successful fetch, subscribes to real-time changes via `subscribeToTable`
- Real-time subscription handles INSERT (add to store, dedup), UPDATE (replace user), DELETE (remove user)
- Updated all 5 write methods (addUser, updateUser, deleteUser, setUserStatus, setUserRole, setUserBalance) to:
  - Update local Zustand state immediately (optimistic UI)
  - Push change to Supabase in background via insertRow/updateRow/deleteRows
  - Graceful degradation: if Supabase push fails, local state is already updated and preserved
- Auto-sync on store creation using `setTimeout(() => syncWithSupabase(), 0)` with `typeof window` guard to avoid SSR issues
- All existing method signatures preserved exactly — no breaking changes
- Lint passes clean, dev server compiles successfully

Stage Summary:
- User store now fully syncs with Supabase while maintaining 100% backward compatibility
- Store works both with and without Supabase connected (graceful fallback to mock data)
- Real-time subscriptions keep multiple clients in sync
- Optimistic local updates + background Supabase push for responsive UX
- Follows identical pattern established by plan-store (Task 8-a) for consistency

---
Task ID: 8-c
Agent: Subscription Store Sync
Task: Update Zustand subscription store to sync with Supabase

Work Log:
- Read existing subscription-store.ts, supabase-sync.ts, plan-store.ts (reference pattern from 8-a), and worklog.md to understand current architecture
- Created converter functions `subscriptionFromDb` (snake_case DB row → camelCase Subscription) and `subscriptionToDb` (camelCase → snake_case)
  - subscriptionFromDb explicitly maps each field with defaults for safety (e.g. status defaults to 'active', devices to 1, numeric fields default to 0)
  - Extra DB-only fields (created_at, updated_at) are gracefully ignored by subscriptionFromDb
- Added `isSupabaseConnected` boolean state to SubscriptionState interface
- Added `syncWithSupabase()` async method that:
  - Fetches data from Supabase `subscriptions` table using `fetchTable` with `subscriptionFromDb` converter
  - If data returned, replaces mock data with Supabase data and sets `isSupabaseConnected: true`
  - If table exists but empty, keeps mock data as seed and marks connected
  - On failure, falls back to mock data with `isSupabaseConnected: false`
  - After successful fetch, subscribes to real-time changes via `subscribeToTable`
- Real-time subscription handles INSERT (add to store, dedup), UPDATE (replace subscription), DELETE (remove subscription)
- Updated all 4 write methods (addSubscription, renewSubscription, extendSubscription, removeSubscription) to:
  - Update local Zustand state immediately (optimistic UI)
  - Push change to Supabase in background via insertRow/updateRow/deleteRows
  - Graceful degradation: if Supabase push fails, local state is already updated and preserved
- Auto-sync on store creation using `setTimeout(() => syncWithSupabase(), 0)` with `typeof window` guard to avoid SSR issues
- All existing method signatures preserved exactly — no breaking changes
- All exported utility functions (isWithin60Days, getDaysBeforeVanish, findMatchingPlan, getSubscriptionPrice, calculateNewExpiry) kept intact
- Lint passes clean, dev server compiles successfully

Stage Summary:
- Subscription store now fully syncs with Supabase while maintaining 100% backward compatibility
- Store works both with and without Supabase connected (graceful fallback to mock data)
- Real-time subscriptions keep multiple clients in sync
- Optimistic local updates + background Supabase push for responsive UX
- Follows identical pattern established by plan-store (Task 8-a) and user-store (Task 8-b) for consistency

---
Task ID: 8-d
Agent: Payment Store Sync
Task: Update Zustand payment store to sync with Supabase

Work Log:
- Read existing payment-store.ts, supabase-sync.ts, plan-store.ts (reference pattern from 8-a), subscription-store.ts (reference from 8-c), and worklog.md to understand current architecture
- Created converter functions for all 3 entities:
  - `balanceRequestFromDb` / `balanceRequestToDb` — snake_case DB row ↔ camelCase BalanceRequest, with safe defaults for method ('bkash'), status ('pending'), and numeric fields
  - `transactionFromDb` / `transactionToDb` — snake_case DB row ↔ camelCase Transaction, with type/status validation against allowed enum values
  - `paymentConfigFromDb` / `paymentConfigToDb` — snake_case DB row ↔ camelCase PaymentConfig, with type validation for bkashType/nagadType
- Added `isSupabaseConnected` boolean state to PaymentState interface
- Added `syncWithSupabase()` async method that:
  - Fetches all 3 tables in parallel using `Promise.all` (balance_requests via fetchTable, transactions via fetchTable, payment_config via fetchConfig)
  - Only replaces local state if Supabase returned data; keeps mock data otherwise (supports empty-but-connected tables)
  - Sets `isSupabaseConnected: true` on success
  - On failure, falls back to mock data with `isSupabaseConnected: false`
  - Subscribes to real-time changes for all 3 tables via `subscribeToTable` after successful fetch
- Real-time subscriptions handle INSERT (add, dedup), UPDATE (replace), DELETE (remove) for balance_requests and transactions
- Payment config subscription: INSERT/UPDATE replaces config, DELETE falls back to initial config
- Updated all write methods to push to Supabase in background:
  - `submitBalanceRequest`: inserts into balance_requests table
  - `approveRequest`: updates balance_requests row + inserts new transaction row (both pushed to Supabase), still calls `addBalanceToUser`
  - `rejectRequest`: updates balance_requests row in Supabase
  - `bulkApprove`: updates each balance_requests row + inserts each new transaction row in Supabase
  - `bulkReject`: updates each balance_requests row in Supabase
  - `deleteRequest`: deletes from balance_requests in Supabase
  - `deleteRequests`: bulk deletes from balance_requests in Supabase
  - `updatePaymentConfig`: updates payment_config row by id 'config_001' in Supabase
- All write methods follow optimistic UI pattern: update local Zustand state immediately, push to Supabase in background with `.catch()` for graceful degradation
- Auto-sync on store creation using `setTimeout(() => syncWithSupabase(), 0)` with `typeof window` guard
- All existing method signatures preserved exactly — no breaking changes
- All exported utility functions (isWithin90Days, getDaysBeforeVanish, TRANSACTIONS_VANISH_DAYS) kept intact
- The `addBalanceToUser` import from `@/lib/auth-store` remains unchanged
- Lint passes clean, dev server compiles successfully

Stage Summary:
- Payment store now fully syncs with Supabase (3 tables: balance_requests, transactions, payment_config) while maintaining 100% backward compatibility
- Store works both with and without Supabase connected (graceful fallback to mock data)
- Real-time subscriptions for all 3 tables keep multiple clients in sync
- Optimistic local updates + background Supabase push for responsive UX
- approveRequest and bulkApprove correctly push both the balance request update AND the new transaction to Supabase
- Follows identical pattern established by plan-store (Task 8-a), user-store (Task 8-b), and subscription-store (Task 8-c) for consistency

---
Task ID: 8-e
Agent: Remaining Stores Sync
Task: Update Zustand coupon, referral, ticket, utility, and 2FA stores to sync with Supabase

Work Log:
- Read worklog.md, all 5 existing stores, plan-store.ts and payment-store.ts as reference patterns, and supabase-sync.ts utilities
- **coupon-store.ts**: Created `couponFromDb` / `couponToDb` converter functions with safe defaults for JSONB fields (claimedBy, applicablePlans). Added `isSupabaseConnected` + `syncWithSupabase()`. Subscribes to real-time on `coupons` table. All 8 write methods (setCoupons, addCoupon, updateCoupon, deleteCoupon, deleteCoupons, deactivateCoupons, toggleActive, claimCoupon) push to Supabase. `claimCoupon` computes the update locally first, then pushes the changed fields (currentClaims, claimedBy) to Supabase. `validateCoupon` is read-only — no Supabase push needed.
- **referral-store.ts**: Created `referralFromDb` / `referralToDb` and `referralSettingsFromDb` / `referralSettingsToDb` converter pairs. Syncs both `referrals` table (via fetchTable) and `referral_settings` table (via fetchConfig) in parallel with `Promise.all`. Two real-time subscriptions. `applyReferralCode` works locally then inserts new referral to Supabase. `updateSettings` updates `referral_settings` row by id `settings_001`. Kept mock referral data and initial settings as fallbacks.
- **ticket-store.ts**: Most complex store — has `tickets` and `ticket_messages` as separate tables. Created `ticketFromDb` (returns Omit<TicketData, 'conversation'>), `ticketToDb` (strips conversation before writing), and `ticketMessageFromDb` / `ticketMessageToDb` converters. On sync, fetches both tables in parallel, groups messages by `ticket_id`, and builds full `TicketData` objects with conversations. Two real-time subscriptions: ticket updates preserve existing conversations; message insert/update/delete correctly modifies the conversation array of the corresponding ticket. `createTicket` inserts both ticket row and first message to Supabase. `userReply` and `adminReply` update the ticket (lastUpdate, messages count) and insert a new message. `deleteTicket` / `deleteTickets` delete from tickets table (CASCADE handles messages). `bulkClose` updates each ticket individually.
- **utility-store.ts**: Simple single-row config store. Created `utilityConfigFromDb` / `utilityConfigToDb` converters. Uses `fetchConfig` for `utility_config` table. Single real-time subscription: INSERT/UPDATE replaces config, DELETE falls back to initial defaults. `updateConfig` pushes partial updates to `config_001` row. Kept `isUrl` exported utility function intact.
- **2fa-store.ts**: Simple single-row config store. Created internal `TwoFADbRow` interface and `twoFAFromDb` / `twoFAToDb` converters. Uses `fetchConfig` for `admin_2fa` table. On sync, populates `isEnabled`, `secret`, and `backupCodes` from DB. `enable2FA` and `disable2FA` push full state to `2fa_001` row. `verifyCode` removes used backup codes and pushes updated list. `regenerateBackupCodes` pushes new codes to Supabase. `generateSecret` and `generateBackupCodes` remain pure functions (no Supabase push — they're generators only).
- All 5 stores follow identical pattern: `isSupabaseConnected` state, `syncWithSupabase()` method, auto-sync on store creation via `setTimeout` with `typeof window` guard, optimistic local updates + background Supabase push with `.catch()` for graceful degradation
- All existing method signatures preserved exactly — no breaking changes
- Fixed 3 unused eslint-disable directives in ticket-store.ts
- Lint passes clean (0 errors, 0 warnings), dev server compiles successfully

Stage Summary:
- All 5 remaining Zustand stores now fully sync with Supabase while maintaining 100% backward compatibility
- Total tables covered: coupons, referrals, referral_settings, tickets, ticket_messages, utility_config, admin_2fa
- Store works both with and without Supabase connected (graceful fallback to mock/default data)
- Real-time subscriptions for all tables keep multiple clients in sync
- Optimistic local updates + background Supabase push for responsive UX
- Ticket store handles the complex 2-table pattern (tickets + ticket_messages) with proper message grouping on sync and real-time message handling
- Follows identical pattern established by previous agents (Tasks 8-a through 8-d) for consistency
- All 10 Zustand stores in the project are now Supabase-synced

---
Task ID: 8-f
Agent: Auth Store Sync
Task: Update Zustand auth store to sync with Supabase

Work Log:
- Read existing auth-store.ts, supabase-sync.ts, supabase-client.ts, user-store.ts (reference pattern from 8-b), and worklog.md to understand current architecture
- Created converter function `authUserFromDb` (snake_case DB row → camelCase auth User) with safe defaults for all fields (provider defaults to 'google', role to 'user', balance to 0, etc.)
- Auth store's User interface differs from user-store's User interface — auth User has avatar, referralCode, totalReferrals but not status, joinedAt, subscriptions, devices, lastActive. Converter properly maps only the auth-relevant fields.
- Added `isSupabaseConnected` boolean state to AuthState interface
- Added `syncWithSupabase()` async method that:
  - Fetches from Supabase `users` table using `fetchTable` to verify connection
  - If fetch succeeds (even with empty data), sets `isSupabaseConnected: true`
  - If a user is already logged in, refreshes their data from Supabase by id
  - After successful fetch, subscribes to real-time changes via `subscribeToTable`
  - Real-time subscription onUpdate handler: if the changed user matches the currently logged-in user, updates their state
  - On failure, sets `isSupabaseConnected: false`
- Created helper functions:
  - `fetchUserByEmail(email)`: targeted Supabase query by email for login flow (uses supabaseBrowser directly)
  - `fetchUserById(id)`: targeted Supabase query by id for balance updates
  - `applyPendingBalance(user, map)`: extracts the pending balance logic into a reusable helper
- Updated `login(provider)`: Sets mock data immediately (synchronous), then kicks off background fetchUserByEmail to get real Supabase data (especially real balance). If found, merges Supabase data while preserving the provider from the login call. Only updates if the user is still the same and still authenticated.
- Updated `loginAsAdmin()`: Same pattern — sets mockAdmin immediately, background fetches admin by email (admin@corex.io), updates with real data if found.
- Updated `loginAsUser()`: Same pattern — sets mockUser immediately, background fetches user by email (alex.morgan@gmail.com), updates with real data if found. Preserves provider from current admin user.
- Updated `addBalance(userId, amount)`: Local state update remains the same. Added background push to Supabase `users` table via `updateRow`. For the logged-in user, pushes the computed new balance directly. For other users, fetches their current Supabase balance first, then pushes the updated value.
- Updated `deductBalance(amount)`: Local state update remains the same. Added background push to Supabase with the computed new balance.
- Updated `addBalanceToUser` standalone function: Same pattern as `addBalance` — updates local state + pushes to Supabase in background. Handles both logged-in user and other-user cases.
- All method signatures preserved exactly — `login` still returns `UserRole`, `loginAsAdmin` still returns `UserRole`, `loginAsUser` still returns `void`, `addBalance` and `deductBalance` signatures unchanged
- Mock data (mockUser, mockAdmin) remain as immediate fallback — Supabase data is applied asynchronously in the background
- Auto-sync on store creation using `setTimeout(() => syncWithSupabase(), 0)` with `typeof window` guard
- Lint passes clean (0 errors, 0 warnings), dev server compiles successfully

Stage Summary:
- Auth store now fully syncs with Supabase while maintaining 100% backward compatibility
- Login methods use "optimistic mock + background Supabase refresh" pattern for responsive UX
- Balance updates (addBalance, deductBalance, addBalanceToUser) push to Supabase `users` table in background
- Store works both with and without Supabase connected (graceful fallback to mock data)
- Real-time subscription for user updates keeps the logged-in user's state in sync with external changes
- Follows the established pattern from Tasks 8-a through 8-e for consistency

---
Task ID: 9
Agent: Main Orchestrator
Task: Complete Supabase A-to-Z setup for CoreX

Work Log:
- Installed `@supabase/supabase-js` and `pg` packages
- Created `.env.local` with all Supabase credentials (URL, anon key, service role key)
- Created `src/lib/supabase-client.ts` — browser + server Supabase clients
- Created `src/lib/supabase-schema.ts` — complete SQL schema (19 tables, indexes, RLS policies, seed data)
- Created `src/lib/supabase-sync.ts` — sync layer with fetchTable, insertRow, updateRow, deleteRows, subscribeToTable, converters
- Created `src/app/api/db-init/route.ts` — DB init/reset/seed/status API route using pg for DDL
- Created `src/app/api/supabase/route.ts` — CRUD API route with auto snake_case ↔ camelCase conversion
- Updated ALL 8 Zustand stores (plan, user, subscription, payment, coupon, referral, ticket, utility, 2fa, auth) to sync with Supabase
- Completely rewrote `admin-db-init.tsx` with:
  - Real Supabase connection check (auto on mount)
  - Table status grid (19 tables with ✓/○ indicators)
  - DB Password input (not stored permanently)
  - Auto-construct DATABASE_URL from project ref + password
  - Initialize Database button with progress bar
  - Seed Mock Data step after init
  - Download Local/Supabase data backups
  - Copy SQL Schema to clipboard for manual setup
  - Reset Database with confirmation dialog
- Verified: API routes work, lint passes, site loads

Stage Summary:
- Complete Supabase A-to-Z setup done
- 19 database tables defined in schema
- All Zustand stores sync bidirectionally with Supabase (optimistic local + background push)
- Real-time subscriptions on all tables
- DB Init page works from website — admin just needs to enter DB password
- Easy project switching: just change 3 env variables, reinitialize DB
- Architecture: Zustand = local cache, Supabase = source of truth, API routes = bridge
