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
