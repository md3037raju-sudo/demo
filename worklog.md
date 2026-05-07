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

## Task g1: Two-Factor Authentication for Admin ✅

### New Files
- **2fa-store.ts**: Zustand store for 2FA state — `isEnabled`, `secret`, `isVerified`, `backupCodes`; mock `verifyCode()` accepts any 6-digit code or backup code; `generateSecret()` returns "JBSWY3DPEHPK3PXP"; `generateBackupCodes()` generates 8 random 8-char alphanumeric codes; `regenerateBackupCodes()` replaces existing codes
- **admin-2fa-settings.tsx**: Full 2FA setup/management component — enable flow (QR code visualization + secret key → verify with OTP → show backup codes with Download/Copy); enabled state shows green badge + "Regenerate Backup Codes" / "Disable 2FA" buttons (both require current OTP confirmation via AlertDialog); MockQRCode component renders a styled grid pattern as placeholder

### Modified Files
- **login-page.tsx**: After admin clicks "Login as Admin", checks if 2FA is enabled AND not verified → shows 2FA Verification Dialog with InputOTP (6-digit) or backup code input (8-char); on success navigates to admin and marks 2FA verified; on cancel returns to admin choice dialog; "Login as User" never requires 2FA
- **admin-layout.tsx**: Added `TwoFAShieldIndicator` component in top bar — green ShieldCheck badge when 2FA enabled+verified, red Shield badge when disabled; added `Ticket` + `ShieldCheck` lucide imports; added "Coupons" nav item with Ticket icon to secondary nav; added `admin/coupons` route to `renderAdminPage` and `getPageTitle`; imported `AdminCoupons` and `use2FAStore`
- **admin-rules.tsx**: Added `<Admin2faSettings />` at bottom as Security section; imported component

## Task g2: Coupon Code System ✅

### New Files
- **admin-coupons.tsx**: Full coupon management page — stats row (Total/Active Coupons, Total Claims, Total Discount Given); searchable coupon table with columns: Code (monospace), Description, Type (badge: %=purple, fixed=green), Value, Min Purchase, Claims progress bar, Expires, Status (Active/Inactive/Expired); row actions: Edit, View Claims, Toggle Active, Delete; bulk select with checkboxes + "Delete Selected" + "Deactivate Selected" with AlertDialog; Create/Edit dialog with code (auto-generate button), description, type select, value, min purchase, max discount (percentage only), max claims, applicable plans (checkboxes: All Plans / specific), expiry date, active switch; View Claims dialog shows claimedBy table with User/Claimed At/Discount Amount + total summary + Export CSV; auto-generate creates codes like "COREX-A7B3X9"

### Modified Files
- **overview-page.tsx**: Added coupon support to Confirm Purchase dialog — "Have a coupon code?" section with input + Apply button; validates against mockCoupons (active, not expired, claims < max, user not already claimed, plan applicable, meets min purchase); valid coupon shows green "Coupon applied!" badge with savings; invalid shows red error; calculates percentage discount (capped at maxDiscount) or fixed discount (capped at price); shows original price crossed out + discounted price + savings amount; deducted amount from balance uses discounted price; coupon can be removed with X button

## Task h1: Referral Tracking System ✅

### New Files
- **referral-store.ts**: Zustand store for referral tracking — `ReferralEntry` interface (id, referrerId/Name, referredUserId/Name, referralCode, referredAt, referrerReward, referredReward, status); `ReferralSettings` interface (referrerReward, referredReward, minWithdrawal, commissionType, commissionValue); `applyReferralCode()` validates code against known referrer codes, prevents self-referral and duplicate use; `updateSettings()` updates store; `getReferralsByUser()` filters by referrerId; `getTotalEarnings()` sums completed referral rewards; 5 mock referral entries with different users; default settings: referrerReward: 5, referredReward: 5, minWithdrawal: 10, commissionType: 'fixed', commissionValue: 5

### Modified Files
- **referrals-page.tsx**: Replaced mock data with `useReferralStore`; added "Enter Referral Code" section at top (visible only if user hasn't been referred yet) with Input + Apply button that validates against store and shows welcome bonus dialog on success; referral code card uses auth store's `referralCode`; stats now show Total Referrals from `getReferralsByUser()`, Total Earnings from `getTotalEarnings()`, and Withdraw Earnings card with min withdrawal check; recent referrals table uses store data; added Withdraw Dialog and Referral Success Dialog
- **login-page.tsx**: After successful Google/Telegram login for regular users, shows optional "Have a Referral Code?" dialog with input field, Apply button, and Skip button; on success shows "Welcome Bonus Applied!" message with dollar amount from store settings; admin login flow unchanged (admin choice dialog → 2FA if needed → admin panel); admin choosing "Login as User" also gets referral dialog
- **admin-rules.tsx**: Referral Settings section now uses `useReferralStore` settings; replaced old local state (commissionPercent, maxCommissionPerReferral) with store-synced state (referrerReward, referredReward, minWithdrawal, commissionType, commissionValue); Save button calls `updateReferralSettings()` to persist to store; added field descriptions and commission value field with dynamic $/% suffix based on commission type
- **admin-dashboard.tsx**: Replaced "Active Devices" stat card with "Total Referrals" card showing count from `useReferralStore().referrals` and total rewards given (sum of referrerReward + referredReward for all referrals); imported `Gift` icon and `useReferralStore`

## Task h2: Theme Engine with Light/Dark + Presets + Animations ✅

### New Files
- **theme-store.ts**: Zustand store for theme management — `ThemeMode` ('dark'|'light'), `ThemePreset` ('emerald'|'ocean'|'rose'|'midnight'), `animationsEnabled` boolean; `setMode()`, `toggleMode()`, `setPreset()`, `setAnimationsEnabled()` all call `applyThemeToDOM()` which updates: `document.documentElement.classList` for dark/light, `data-theme` attribute for preset, `animate-enabled` class for animations; initial theme applied on load
- **theme-page.tsx**: Full theme management page with 4 sections: (1) Appearance — Light/Dark toggle buttons with Sun/Moon icons and descriptions; (2) Theme Presets — 4 clickable cards (Emerald/Ocean/Rose/Midnight) with gradient color preview, name, description, color dots, active indicator with Check icon and "Active" badge; (3) Animations — Switch toggle with description, side-by-side comparison of "Animations On" vs "Animations Off" effects; (4) Live Preview — Card showing Buttons (all variants), Badges (default/secondary/outline/success/warning/error), Typography (heading/body/primary text), Cards (muted/primary), and current theme info summary

### Modified Files
- **navigation-store.ts**: Added `'dashboard/themes'` to `Page` type union and `allValidPages` array
- **dashboard-layout.tsx**: Added `Palette` icon import; added `ThemePage` import; added `{ label: 'Themes', icon: Palette, page: 'dashboard/themes' }` to `mainNavItems`; added `'dashboard/themes'` case to `getPageTitle()` returning 'Themes' and `renderPage()` returning `<ThemePage />`
- **globals.css**: Added theme preset CSS variable overrides for Ocean (hue 220), Rose (hue 350), Midnight (hue 290) — each with light and dark mode variants overriding `--primary`, `--primary-foreground`, `--ring`, `--chart-1/2/3`, `--corex`, `--corex-foreground`; added animation system: `.animate-enabled *` with 150ms transitions, `.animate-fade-in`, `.animate-slide-up`, `.animate-scale-in` keyframe animations (fadeIn, slideUp, scaleIn), `:not(.animate-enabled) *` with 0ms transition/animation override

## Status: All lint passing, dev server running on port 3000

---
Task ID: 1
Agent: mock-data-updater
Task: Update mock-data.ts with new Plan schema

Work Log:
- Replaced mockPlans with new advanced Plan type
- Added PlanDuration, DevicePricing types
- Added helper functions (getDurationLabel, calculateDevicePrice, getPerDeviceCost, getSavingsPercent)
- Added defaultDevicePricing constant
- Updated mockPlans with 8 plans covering all durations (3d, 7d, 15d, 30d, 6m, 1y)
- Updated mockSubscriptions: name → Pro/Unlimited Annual/Starter, plan → 30 Days/1 Year, prices → 99/1299/49, bandwidthLimit → 200/0/50
- Updated mockRecycleBin: subscriptionName → Starter/Pro, plan → 30 Days, prices → 49/99

Stage Summary:
- New Plan schema supports device pricing %, bandwidth types, durations 3d/7d/15d/30d/6m/1y
- 8 mock plans created covering all duration options
- Helper functions for price calculations added
- mockSubscriptions and mockRecycleBin updated to match new plan names and prices

---
Task ID: 1-c
Agent: lib-pages-currency-fixer
Task: Replace $ with ৳ in lib and pages files

Work Log:
- Read and edited coupon-store.ts: replaced 1 currency $ with ৳ (template literal `$${coupon.minPurchase.toFixed(2)}` → `৳${coupon.minPurchase.toFixed(2)}`)
- Read and edited mock-data.ts: replaced 5 currency $ with ৳ (`$5.00` in activity logs (2 instances), `$500` in activity log, `$75` in activity log, `$5 flat discount` in coupon description)
- Read and edited docs-page.tsx: replaced 1 currency $ with ৳ (`$5 account credit` → `৳5 account credit`)
- Read and edited login-page.tsx: replaced 2 currency $ with ৳ (`$${settings.referredReward.toFixed(2)}` → `৳${settings.referredReward.toFixed(2)}` in two places)

Stage Summary:
- All currency symbols in lib and pages files changed from $ to ৳

---
Task ID: 1-b
Agent: admin-currency-fixer
Task: Replace $ with ৳ in admin component files

Work Log:
- Read and edited admin-users.tsx: replaced 6 currency $ with ৳ (template literal in toast, table cell balance, view details balance, balance history balance after, edit balance current/previous)
- Read and edited admin-dashboard.tsx: replaced 5 currency $ with ৳ (CustomTooltip, $369.96 revenue, totalRewardsGiven, $1,247.50 total revenue, YAxis tickFormatter)
- Read and edited admin-coupons.tsx: replaced 9 currency $ with ৳ (CSV export $${c.discount.toFixed(2)}, stats totalDiscount, table fixed value, minPurchase cell, discount value input prefix $ → ৳, Min Purchase ($) label, Max Discount ($) label, claim discount amount, total discount given)
- Read and edited admin-payments.tsx: replaced 5 currency $ with ৳ (approve toast description, payment table amount, view details amount, approve confirmation amount, reject dialog amount)
- Read and edited admin-plans.tsx: replaced 1 currency $ with ৳ (Price ($) label → Price (৳))
- Read and edited admin-rules.tsx: replaced 5 currency $ with ৳ (referral settings toast with 3 currency $, 4 span element input prefixes $ → ৳ for Referrer Reward, New User Reward, Minimum Withdrawal, Commission Value)
- Read and edited admin-broadcast.tsx: replaced 1 currency $ with ৳ ($10 per referral → ৳10 per referral)
- Read and edited admin-tickets.tsx: replaced 1 currency $ with ৳ ($500 via bKash → ৳500 via bKash)
- Read and edited admin-cms.tsx: replaced 2 currency $ with ৳ ($5.00 referral earnings in doc content, 2 instances)
- Read and edited admin-subscriptions.tsx: replaced 3 currency $ with ৳ (subscription table price, recycle bin price, view details price)

Stage Summary:
- All currency symbols in admin components changed from $ to ৳

---
Task ID: 1-a
Agent: dashboard-currency-fixer
Task: Replace $ with ৳ in dashboard component files

Work Log:
- Read and edited overview-page.tsx: replaced 15 currency $ with ৳
- Read and edited payments-page.tsx: replaced 6 currency $ with ৳
- Read and edited subscriptions-page.tsx: replaced 1 currency $ with ৳
- Read and edited referrals-page.tsx: replaced 12 currency $ with ৳

Stage Summary:
- All currency symbols in dashboard components changed from $ to ৳

---
Task ID: 2
Agent: admin-plans-rewriter
Task: Completely rewrite admin-plans.tsx with new Plan system

Work Log:
- Read worklog.md, mock-data.ts, and existing admin-plans.tsx to understand context
- Verified available shadcn/ui components (checkbox, separator, badge, dialog, alert-dialog, select, switch, input, label, card, button all present)
- Completely rewrote admin-plans.tsx from scratch with new Plan type and all helper functions
- Implemented 6 major feature areas:

1. **Stats Bar** (5 cards): Total Plans (active/inactive), Total Subscribers, Most Popular Plan, Revenue Estimate (base price × subscribers), Featured count

2. **Filter/Sort System**: Search by name/description/features, filter by Duration (3d/7d/15d/30d/6m/1y), Bandwidth Type (unlimited/limited), Status (active/inactive), Sort by Name/Price/Subscribers

3. **Bulk Actions**: Checkbox selection per card + Select All, bulk Activate/Deactivate/Delete with AlertDialog confirmations, contextual action bar when items selected

4. **Plan Card Grid**: Each card shows — name with Featured star badge, Active/Inactive badge, description, bandwidth type badge (green=Unlimited, amber=Limited), duration badge, base price with ৳, speed/bandwidth/preset info rows, full device pricing table (1-5 devices with calculated price, per-device cost, savings %), feature badges, subscriber count, Edit/Clone/Delete action buttons

5. **Create/Edit Dialog**: Full form with Name, Description, Speed, Bandwidth Type (disables limit when unlimited), Bandwidth Limit, Duration select (all 6 options), Base Price (৳), Device Pricing section (5 inputs for % of base with live calculated prices and per-device costs + savings), Reset to Default button, Proxy Preset select (from mockProxyPresets + None), Features (comma-separated with live preview badges), Featured toggle, Active toggle

6. **Clone Plan**: Duplicates plan with new ID, "(Copy)" suffix, 0 subscribers, current date

- All imports from @/lib/mock-data: mockPlans, Plan, PlanDuration, DevicePricing, getDurationLabel, calculateDevicePrice, getPerDeviceCost, getSavingsPercent, defaultDevicePricing, mockProxyPresets
- Uses useState for local plan list management (initialized from mockPlans with deep copies)
- Uses useMemo for filtered/sorted plans and stats computation
- All shadcn/ui components used: Card, Button, Badge, Input, Label, Switch, Dialog, Select, AlertDialog, Separator, Checkbox
- Lint: passing with zero errors
- Dev server: compiling successfully

---
Task ID: 3
Agent: purchase-flow-rewriter
Task: Rewrite purchase subscription flow with new Plan system, device selection, and live pricing

Work Log:
- Read worklog.md, mock-data.ts, overview-page.tsx, coupon-store.ts, auth-store.ts to understand current code
- Completely rewrote overview-page.tsx purchase flow:
  - **Subscription interface**: Added `devices: number` field
  - **Step 1 — Plan Selection Dialog**: Uses Tabs component with duration-based tabs (3d, 7d, 15d, 30d, 6m, 1y); plans grouped by duration via useMemo; each plan card shows name, description, speed, bandwidth badge (unlimited=green), duration label, base price (1 device), "★ Recommended" badge for featured plans, check/chevron indicator; selected plan gets ring highlight
  - **Step 2 — Device & Price Configuration**: Visual 5-button device selector (1-5) with Monitor icons; each button shows device count, total price, and "Save X%" badge for multi-device; live pricing summary card shows total price, per-device cost, and savings badge; plan features list below with check icons
  - **Step 3 — Confirm Purchase Dialog**: Shows plan name + description, duration label, bandwidth badge, device count; price breakdown: base price (1 device), device multiplier info with %, per-device cost, multi-device savings %, total price; coupon section (reused existing logic but validates against totalPrice instead of plan.price); final price card with original price crossed out + discount + final price + balance check; insufficient balance warning with Go to Payments link
  - **Subscription creation**: Now uses duration switch (3d→+3 days, 7d→+7 days, etc.) for expiry calculation; parses bandwidthLimit from string; stores selectedDevices count; uses getDurationLabel() for plan display name
  - **Imports**: Added PlanDuration, Plan, getDurationLabel, calculateDevicePrice, getPerDeviceCost, getSavingsPercent, Tabs/TabsList/TabsTrigger/TabsContent, Star, Clock, Wifi, HardDrive, ChevronRight, Sparkles
  - **Kept intact**: AnimateIn, stats cards with ৳, subscription table (added Devices column), deep link dialog, coupon store logic

Stage Summary:
- Purchase flow now fully supports new Plan type with device selection and live pricing
- Plans are browsable by duration tabs
- Device selector shows 5 clickable buttons with per-tier pricing and savings
- Confirm dialog shows full price breakdown with device multiplier info
- Currency is ৳ (Bangladeshi Taka) throughout
- Lint passes cleanly, dev server compiles without errors
