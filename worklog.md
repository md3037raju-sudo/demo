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
