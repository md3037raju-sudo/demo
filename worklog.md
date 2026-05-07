---
Task ID: 1
Agent: Main Agent
Task: Fix CoreX live preview crash caused by Supabase integration

Work Log:
- Identified ROOT CAUSE: `@supabase/supabase-js` was being imported in client-side code (via supabase-sync.ts → supabase-client.ts), causing Turbopack to crash
- Fetched real JWT keys from Supabase Management API (the `sb_publishable_*` keys don't work with createClient())
- Rewrote `supabase-sync.ts` to use API routes exclusively via `fetch()` — NO more `@supabase/supabase-js` import on client side
- Rewrote `auth-store.ts` to remove direct `supabaseBrowser()` calls, now uses API routes via fetch()
- Updated `page.tsx` to remove `syncAllStores()` from render path — app works 100% with local Zustand state
- Added `email` query param support to `/api/supabase` GET route
- Fixed dev script in package.json — removed `2>&1 | tee dev.log` pipe that was killing the process
- Server now runs stably with `setsid node node_modules/.bin/next dev -p 3000`

Stage Summary:
- Server stable and serving pages (HTTP 200 consistently)
- CoreX landing page renders correctly with 65KB HTML content
- No `@supabase/supabase-js` in client bundle — all DB operations go through API routes
- Real-time subscriptions temporarily stubbed (no-op) — can be re-added via WebSocket mini-service later
- `.env.local` has correct JWT keys (eyJ... format) from Supabase Management API

---
Task ID: 5
Agent: Sub-agent (full-stack-developer)
Task: Fix 5 critical bugs from earlier audit

Work Log:
- Bug 1: Fixed double-counting in `addBalance()`/`addBalanceToUser()` — now removes map entry when user is logged in
- Bug 2: Added 2FA Settings section to admin utility page
- Bug 3: Fixed login to skip referral dialog when registration is paused
- Bug 4: Added `updateSubscription` action to subscription store; admin-subscriptions now uses proper store action
- Bug 5: Verified AlertDialog already uses correct `onOpenChange` prop — no fix needed

Stage Summary:
- All 5 bugs fixed and lint passes
- Payment approval now correctly adds balance without double-counting
- 2FA Settings accessible from Utility page
- Existing users can login even when registration is paused
- Admin subscriptions use proper store actions for persistence
