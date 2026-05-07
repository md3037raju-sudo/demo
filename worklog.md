# CoreX Website - Worklog

## Task 1: Core Setup ✅
- Navigation store, auth store, mock data, layout, CSS theme

## Task 2-4: Public Pages ✅
- Landing, Login (Google+Telegram only), About

## Task 5-13: User Dashboard + Extras ✅
- Dashboard layout with sidebar, overview, subscriptions, devices, payments, referrals, settings, download, docs

## Tasks a1: Admin Core Setup ✅
- Updated navigation-store.ts with 13 admin page routes
- Updated auth-store.ts with admin role and loginAsAdmin
- Updated mock-data.ts with admin mock data (users, proxyPresets, plans, recycleBin, adminPayments, activityLogs, tickets)
- Updated page.tsx router with admin role guard
- Updated login-page.tsx with Admin Access button

## Tasks a2-a3: Admin Layout + Dashboard ✅
- admin-layout.tsx: Full sidebar with 13 nav items, role guard, mobile Sheet, Admin badge
- admin-dashboard.tsx: Stats cards, recharts (line/pie/bar), progress bars, recent activity, pending actions

## Tasks a4-a5: Admin Users + Subscriptions ✅
- admin-users.tsx: Search/filter, user table, actions (view/edit balance/change role/ban/suspend/activate)
- admin-subscriptions.tsx: Tabs (Active/All/Recycle Bin), bandwidth progress bars, edit/cancel/restore/delete

## Tasks a6-a7: Admin Proxy Presets + Plans ✅
- admin-proxies-preset.tsx: Preset cards, subgroups with health status, proxy tables, bulk upload CSV/JSON, health check
- admin-plans.tsx: Plan cards grid, create/edit dialog, delete

## Tasks a8-a10: Admin Payments + Rules + Logs ✅
- admin-payments.tsx: Telegram bot status, pending/all tabs, approve/reject/refund, notification toasts
- admin-rules.tsx: Maintenance mode, referral settings, global alerts, suggested rules
- admin-logs.tsx: Filter/search, type tabs, log table with badges

## Tasks a11-a13: Admin Devices + DB-Init + Broadcast + Tickets + CMS ✅
- admin-devices.tsx: Device overrides, force release
- admin-db-init.tsx: Connection test, DB init with progress, migration/seed/reset
- admin-broadcast.tsx: Send broadcast, history table
- admin-tickets.tsx: Stats, filter, ticket detail with conversation
- admin-cms.tsx: Landing page editor, documentation editor

## Added Features:
- Admin access button on user dashboard sidebar (visible only for admin role)
- User dashboard sidebar shows "Admin Panel" link with red styling when logged in as admin

## Status: All lint passing, dev server running on port 3000
