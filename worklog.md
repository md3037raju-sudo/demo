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
