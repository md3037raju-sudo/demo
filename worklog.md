---
Task ID: 1
Agent: Main Agent
Task: Fix Supabase connection and server crashes for CoreX proxy website

Work Log:
- Used Supabase Management API with access token to fetch actual JWT keys (anon + service_role)
- Discovered .env.local already had the correct JWT keys (eyJ... format)
- Verified Supabase REST API works with the JWT keys via curl
- Found that ALL 19 tables exist in Supabase (including admin_2fa, activity_logs, broadcasts, cms_content)
- Root cause of server crashes: stores auto-sync on module load which creates multiple concurrent Supabase clients + WebSocket connections, crashing Next.js/Turbopack
- Rewrote supabase-client.ts - simplified, crash-proof lazy init with placeholder fallback
- Rewrote supabase-sync.ts - all operations wrapped in try/catch, realtime subscriptions are crash-proof
- Created sync-all.ts - centralized sync function that replaces per-store auto-sync
- Removed auto-sync from ALL 8 stores: auth-store, payment-store, utility-store, subscription-store, coupon-store, referral-store, ticket-store, 2fa-store
- Updated page.tsx to call syncAllStores() only when user enters authenticated area
- Updated admin-db-init to call forceResyncAllStores() after DB init and seed
- Simplified config/route.ts to be more robust
- Server is now STABLE: 5+ page requests, API calls, all return 200 without crashing
- Lint passes clean with 0 errors

Stage Summary:
- Server crashes FIXED - root cause was per-store auto-sync creating concurrent Supabase connections
- All 19 Supabase tables verified as existing and working
- JWT keys (anon + service_role) confirmed working with REST API
- Supabase connection is fully functional
- Centralized sync approach prevents crashes while still allowing data sync
