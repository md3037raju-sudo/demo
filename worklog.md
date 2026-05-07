---
Task ID: 1
Agent: Main
Task: Apply logos across website, fix renewal logic, add extend feature, update stats

Work Log:
- Fixed CoreXLogo component: corrected aspect ratio from height*4 (wrong for 1254x1254 square logos) to height*1
- Updated logo text size to dynamically scale with height parameter
- Landing page: Replaced Shield icon with CoreXLogoIcon (64px) above "Clash-Powered VPN" badge in hero section
- Adjusted logo sizes across all pages: nav height=28, footer height=22-28, login height=36, mobile sheet height=24
- Applied dark/light mode logos (corex-logo-dark.png, corex-logo-light.png) across all pages via CoreXLogo component using useTheme()
- Created shared subscription store at /src/lib/subscription-store.ts with Zustand
- Store provides: addSubscription, renewSubscription, extendSubscription, removeSubscription, findMatchingPlan, getSubscriptionPrice, calculateNewExpiry, isWithin60Days, getDaysBeforeVanish
- Updated OverviewPage to use shared store: replaced local useState with useSubscriptionStore, extend uses extendSubscription(), purchase uses addSubscription()
- Updated SubscriptionsPage to use shared store: replaced local useState with useSubscriptionStore, renewal uses renewSubscription() which reactivates SAME subscription (not creates new)
- Renewal logic now correctly reactivates the same subscription: changes status to active, extends expiry from today, resets bandwidth
- Extend feature works on overview page: extends from current expiry date, adds to price
- Stats icons now consistent: Total Spent (Wallet/emerald), Active (CreditCard/emerald), Renewable (RefreshCw/amber), Balance (Smartphone/teal)

Stage Summary:
- Logo properly displayed in landing page hero, navbar, footer, and all pages with correct dark/light mode switching
- Shared subscription store ensures renewal on subscriptions page reflects on overview page
- Renew = reactivate same subscription (not create new)
- Extend = add duration to active subscription from current expiry
- Stats consistent between dashboard and subscription pages

---
Task ID: 2
Agent: Main
Task: Fix dark/light mode logo switching + Add thunder animation on logo

Work Log:
- Identified critical bug: corex-logo.tsx used `useTheme()` from `next-themes` but no `ThemeProvider` existed in the app — `resolvedTheme` was always undefined, causing logo to always show light variant
- Fixed by replacing `import { useTheme } from 'next-themes'` with `import { useThemeStore } from '@/lib/theme-store'` — now reads `mode` from Zustand store which is actually used by the app's ThemeToggle
- Added `animate` prop to both `CoreXLogo` and `CoreXLogoIcon` components
- Added `thunder-glow` CSS class with `thunderPulse` keyframe animation — creates periodic glow/flash effect on the logo simulating lightning crackling on the thunder symbol
- Added `thunder-flash` CSS class with `thunderFlash` keyframe — creates brief radial flash overlay on the logo image
- Both animations respect `.animate-enabled` class — disabled when animations are turned off in theme settings
- Updated landing page hero section: `<CoreXLogoIcon size={64} animate />` now shows the thunder animation
- Removed old inline `drop-shadow` style that was hardcoded

Stage Summary:
- Logo now correctly switches between corex-logo-dark.png and corex-logo-light.png based on actual theme mode
- Thunder animation (glow + flash) added to logo and activates on the hero section landing page
- All pages using CoreXLogo/CoreXLogoIcon automatically benefit from the theme fix

---
Task ID: 3
Agent: Main
Task: Transaction history 90-day auto-vanish, Add Balance with Bkash/Nagad, TrxID submit, Admin approve flow, Admin Utility page

Work Log:
- Created `src/lib/payment-store.ts` (Zustand): BalanceRequest, Transaction, PaymentConfig models
  - 90-day auto-vanish for transactions (isWithin90Days, getDaysBeforeVanish)
  - submitBalanceRequest: User submits amount + method + trxId → creates pending request
  - approveRequest: Admin approves → adds transaction + calls addBalanceToUser → balance updates
  - rejectRequest: Admin rejects with note
  - bulkApprove/bulkReject for batch operations
  - PaymentConfig: bkashNumber, bkashType, nagadNumber, nagadType (admin controlled)
- Created `src/lib/utility-store.ts` (Zustand): APK download URL, version, tutorial URL/title, changelog
- Added `addBalance` and `addBalanceToUser` to auth-store.ts for cross-store balance updates
- Completely rewrote `payments-page.tsx` (user side):
  - "Add Balance" button opens dialog with Step 1 (select bKash/Nagad with premium logos) → Step 2 (number display with copy, amount selection, TrxID input)
  - Shows user's balance requests with status badges (pending/approved/rejected)
  - Transaction history with 90-day auto-vanish countdown badges (color-coded by urgency)
  - Pending request notification banner
- Updated `admin-payments.tsx` to use shared payment store:
  - Approve → automatically adds balance to user via addBalanceToUser
  - Method badges with bKash pink (#E2136E) and Nagad orange (#F6921E) branding
  - Pending notification indicator with bell icon
- Created `admin-utility.tsx` page:
  - App Configuration: APK download URL, version, tutorial URL, tutorial title, changelog
  - Payment Method Configuration: bKash number + type (personal/merchant), Nagad number + type
  - User preview section showing how payment info appears to users
  - Save buttons with toast confirmations
- Updated `download-page.tsx` to use utility store:
  - APK version from store, download link from store
  - Tutorial card with link and changelog display
- Added 'admin/utility' to navigation-store.ts and admin-layout.tsx sidebar

Stage Summary:
- Transaction history auto-vanishes after 90 days with visual countdown
- Add Balance flow: Select bKash/Nagad → Copy number → Send payment → Submit TrxID → Admin approves → Balance added
- Admin Payments page connected to shared store, approve actually adds balance
- Admin Utility page controls APK link, tutorial link, payment method numbers
- Everything is admin-controllable through the Utility settings page

---
Task ID: 4
Agent: Main
Task: Admin utility payment number update, Telegram/Facebook links, premium social icons, user tickets page

Work Log:
- Updated `utility-store.ts`: Added `telegramLink` and `facebookLink` fields + `isUrl()` helper
- Created `src/components/shared/social-links.tsx`: Premium branded Telegram & Facebook icons
  - URL mode: if value starts with http/https → clicking opens the link in new tab
  - Text mode: any other text (e.g. "Coming Soon") → clicking shows a dialog popup with that message
  - "Soon" badge shown on text-mode links
  - Hover effects with scale + shadow animation
- Updated `admin-utility.tsx`: Added "Social Links" configuration section
  - Telegram link/text input with live URL/text detection badge
  - Facebook link/text input with live URL/text detection badge
  - Info box explaining URL mode vs Text mode behavior
  - Separate "Save Social Links" button
  - Payment method number update section (bKash/Nagad) with personal/merchant type toggle
- Added `SocialLinks` component to:
  - Landing page footer (next to "Available worldwide")
  - Dashboard Settings page ("Contact & Support" section)
- Created `user-tickets-page.tsx`: User-side support ticket system
  - Stats: Open / In Progress / Closed counts
  - Tickets table with status and priority badges
  - "New Ticket" dialog with subject, priority, and description
  - Added to dashboard sidebar navigation as "Tickets"
- Updated `settings-page.tsx`: Added "Contact & Support" card
  - Social links row with premium icons
  - "Having a problem? Open a support ticket" with button → navigates to dashboard/tickets
- Updated navigation store: Added `dashboard/tickets` page type
- Updated dashboard layout: Added Tickets nav item + UserTicketsPage render

Stage Summary:
- Admin can update payment method numbers (bKash/Nagad) from Utility page
- Admin can set Telegram & Facebook links — URL opens link, text shows popup
- Premium branded social icons appear on landing page footer and settings page
- Users can open support tickets from dashboard → Tickets page
- Settings page has Contact & Support section with social links + ticket button
