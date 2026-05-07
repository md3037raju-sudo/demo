---
Task ID: 1
Agent: Main Agent
Task: Apply CoreX Logo with light/dark mode support, fix renewal process, add extend feature

Work Log:
- Copied uploaded logo files to /public/ (corex-logo-light.png, corex-logo-dark.png)
- Created shared CoreXLogo and CoreXLogoIcon components (src/components/shared/corex-logo.tsx)
- Updated all pages to use CoreXLogo component instead of Shield icon:
  - Dashboard sidebar (dashboard-layout.tsx)
  - Admin sidebar (admin-layout.tsx)
  - Landing page navbar + footer (landing-page.tsx)
  - Login page (login-page.tsx)
  - About page navbar + footer (about-page.tsx)
  - Download page header (download-page.tsx)
  - Docs page header (docs-page.tsx)
- Fixed Renewal Process (subscriptions-page.tsx):
  - Renew now reactivates the SAME subscription with the SAME plan
  - No more plan selection dialog - shows the matching plan details automatically
  - New expiry = today + plan duration (since sub is already expired)
  - Shows warning if original plan is no longer available
  - Removed the full plan browser from the renew flow
- Added Extend Subscription feature (overview-page.tsx):
  - New "Extend" button next to "Configure" on active subscriptions
  - Extend dialog shows same plan details (not changeable)
  - New expiry = current expiry date + plan duration (extends from current, not today)
  - Price calculated from same plan & device count
  - Coupon support and balance check included
  - Shows warning if original plan is no longer available
  - Uses CalendarPlus icon for the extend button

Stage Summary:
- CoreX logo now dynamically switches between light/dark mode variants across all pages
- Renew = Reactivate same subscription (extend from today), not buy a new plan
- Extend = Add more time to active subscription (extend from current expiry date)
- Both features include coupon support and insufficient balance warnings
