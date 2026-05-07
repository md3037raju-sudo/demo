---
Task ID: 1
Agent: Main
Task: Revert preset visibility from user side, add Auto preset option for admin

Work Log:
- Explored codebase for all "preset" references across user and admin components
- Found 3 locations in overview-page.tsx showing preset names/warnings to users
- Removed all preset-related UI from user-facing overview-page.tsx
- Updated admin-plans.tsx with Auto preset option
- Updated mock-data.ts: all plans default to 'auto'
- Lint passes cleanly, dev server running OK

Stage Summary:
- Users never see "Preset" or preset names
- Admin has 3 options: Auto, None, or specific preset
- Default for new plans is "Auto"

---
Task ID: 2
Agent: Main
Task: Restructure Overview and Subscriptions pages

Work Log:
- Overview page (overview-page.tsx):
  - Now only shows ACTIVE subscriptions (filtered out expired/renewable)
  - Removed Status column from table (all are active, no need)
  - Action button: Configure only
  - Added empty state when no active subscriptions
  - Removed unused StatusBadge component
  - Stats kept: Active Subscriptions, Active Devices, Balance, Referrals
- Subscriptions page (subscriptions-page.tsx):
  - Complete rewrite: now shows EXPIRED & RENEWABLE subscriptions only
  - 60-day auto-vanish logic: expired subs older than 60 days are filtered out
  - "Vanishes In" column shows countdown (red ≤7d, amber ≤30d, gray >30d)
  - Action button: Renew (opens plan selection dialog)
  - Full renewal flow: plan selection → device picker → coupon → checkout
  - Stats: Total Spent (Wallet icon), Active (CreditCard icon), Renewable (RefreshCw icon)
  - Each stat has unique icon — no more duplicate Settings icons
  - Empty state when no history within 60 days
  - Header explains 60-day auto-vanish policy
- Lint passes cleanly
- Dev server running OK

Stage Summary:
- Overview = Active subs only + Configure button
- Subscriptions = Expired/Renewable history + Renew button + 60-day vanish
- Icons are now unique: Wallet for Total Spent, CreditCard for Active, RefreshCw for Renewable
- Full renewal purchase flow implemented in subscriptions page
