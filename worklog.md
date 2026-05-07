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

## Task f1: Messaging Update — Proxy/VPN Focus ✅
- Updated ALL public-facing messaging from "enterprise security" to Clash-based proxy/VPN subscription focus
- **landing-page.tsx**: Hero headline → "Fast & Secure Proxy, Simplified"; Badge → "Clash-Powered VPN"; Feature cards → Multi-Protocol Support, Load-Balanced Nodes, Seamless Auth, Real-time Monitoring; Security section → Infrastructure section with 256-bit Encryption, Zero Data Leaks, 99.9% Uptime; CTA → "Ready to Browse Privately?" with "Get CoreX" button; Trust indicators → "Works with Clash"; Footer → proxy subscription description
- **about-page.tsx**: Hero → "Building the Future of Private Browsing"; Mission → making premium proxy access affordable; Values → Privacy First, Fast & Reliable, Transparent; Technology → Clash-Based Infrastructure, Multi-Protocol Support; Team → Proxy & Network Engineers; CTA → "Ready to browse privately?"
- **login-page.tsx**: Subtitle → "Sign in to manage your proxy subscription"; Bottom text → "Powered by Clash — Fast & Secure Proxy"
- **download-page.tsx**: Already proxy/VPN app focused — no changes needed
- **docs-page.tsx**: Updated all doc articles to reflect proxy/VPN usage (Welcome, Setup, System Requirements, Authentication Methods, Account Recovery, Subscription Plans, Device Management, Proxy Architecture, Protocol Selection, Troubleshooting, No-Log Policy)
- **overview-page.tsx**: Deep link dialog → "This will open the CoreX app to configure your proxy subscription. Make sure CoreX is installed on your device."
- **layout.tsx**: Title → "CoreX — Fast & Secure Proxy Platform"; Description and keywords updated to proxy/VPN focus; OpenGraph updated

## Task f2: Admin Dual Login Option ✅
- Updated auth-store.ts: `login()` now returns UserRole; added `mockCheckAdmin()` (Google→admin, Telegram→user); added `loginAsUser()` for admin choosing user mode; added `deductBalance()` for purchase flow
- Updated login-page.tsx: After Google/Telegram login, checks returned role; if admin, shows "Admin Account Detected" Dialog with two choices: "Login as Admin" (→admin dashboard) and "Login as User" (→user dashboard); Admin Access dev button also triggers the dual-choice dialog; regular users go straight to dashboard

## Task f3: User Purchase Subscription Flow ✅
- Updated overview-page.tsx: Added prominent "Buy Subscription" button at top right; plan selection Dialog shows active plans from mockPlans with speed/data/devices/price; confirm purchase Dialog shows plan details, current balance, and remaining balance after purchase; insufficient balance shows warning with link to Payments page; successful purchase deducts balance, adds subscription to local state, shows success toast via sonner
- mock-data.ts: No changes needed — existing mockPlans data used directly

## Task f4: Proxy Presets — Full Protocol Support ✅
- **mock-data.ts**: Added `ProxyProtocol` type (vless/vmess/trojan/ss/ssr/wireguard/socks5/http); Added `ProxyEntry` interface with all protocol-specific optional fields (uuid, password, flow, network, tls, sni, alpn, cipher, alterId, skipCertVerify, realityPublicKey, realityShortId, clientFingerprint, grpcService, wsPath, wsHost, udp, plugin, pluginOptsMode, pluginOptsHost, ssrProtocol, obfs, obfsParam, privateKey, publicKey, presharedKey, dns, mtu); Added 12 mock proxies covering all 8 protocols (px_001–px_012); Updated mockProxyPresets subgroups with `proxyIds` linking to specific mock proxies
- **admin-proxies-preset.tsx**: Complete rewrite with:
  - Protocol selector grid (8 protocols) with colored buttons
  - Dynamic form fields per protocol — common fields (address, port) first, then auth fields (uuid/password/username/privateKey), then protocol-specific fields
  - VLESS: flow selector, client fingerprint, Reality options panel (public key + short ID)
  - VMess: cipher selector (auto/aes-128-gcm/chacha20-poly1305/none), alterId
  - Trojan: password auth, network selector, TLS, SNI
  - SS: cipher selector (7 options), UDP toggle, plugin selector (none/obfs/v2ray-plugin), conditional plugin-opts
  - SSR: cipher, protocol, obfs, obfs-param selectors
  - WireGuard: private key, public key, preshared key, DNS, MTU
  - Socks5/HTTP: optional username+password, TLS, skip-cert-verify
  - Network selector (tcp/ws/grpc/h2) with conditional WebSocket fields (path+host) and gRPC fields (service name)
  - Colored protocol badges: VLESS=purple, VMess=blue, Trojan=red, SS=green, SSR=amber, WG=teal, Socks5=gray, HTTP=orange
  - Proxy table shows: Address:Port, Protocol badge, Network badge, TLS yes/no badge, Status, Latency, Actions (edit/health-check/delete)
  - Bulk Upload dialog with CSV/JSON tabs and per-protocol example formats for both CSV and JSON
  - Preset cards show protocol count badges (e.g., "VLESS ×2")
  - Subgroup cards with Add Proxy button, inline edit proxy dialog

## Tasks f5-f6: Bulk Select + User Previous Balance ✅

### FIX 1: Bulk Select for Delete/Restore (f5)
- **Admin Subscriptions** (Recycle Bin tab): Added checkboxes per row, Select All, "X selected" count, "Restore Selected" and "Delete Selected" bulk action buttons with AlertDialog confirmations
- **Admin Logs**: Added checkboxes per row, Select All, "X selected" count, "Delete Selected" bulk action with AlertDialog confirmation; converted logs from useMemo to useState for mutability
- **Admin Users**: Added checkboxes per row, Select All, "X selected" count, "Ban Selected", "Suspend Selected", "Activate Selected" bulk action buttons with AlertDialog confirmations
- **Admin Tickets**: Added checkboxes per row, Select All, "X selected" count, "Close Selected" bulk action with AlertDialog confirmation
- **Admin Payments**: Built full payment management component from scratch (was placeholder), including pending/all tabs, stats cards, search, Telegram bot status indicator, approve/reject per-row actions, view details dialog, and bulk select with "Approve Selected" / "Reject Selected" + AlertDialog confirmations

### FIX 2: User Previous Balance in Admin Users (f6)
- **Balance History** section added to "View Details" dialog: Shows table with Date, Type (Top-up/Payment/Referral/Refund), Description, Amount (with +/- indicators and color coding), Balance After columns using mock data
- **Edit Balance** dialog enhanced: Now shows Current Balance and Previous Balance side-by-side, New Balance input, and Reason for Adjustment textarea

## Status: All lint passing, dev server running on port 3000
