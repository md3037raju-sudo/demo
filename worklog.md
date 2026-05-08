---
Task ID: 1
Agent: Main Agent
Task: Full code audit, bug fixes, Google OAuth setup, phone touch fix

Work Log:
- Read entire codebase (~30+ files) for full audit
- Fixed missing viewport meta tag in layout.tsx (added Viewport export with device-width, maximum-scale=1, userScalable=false)
- Fixed phone touch/click issues: added touch-action:manipulation globally, -webkit-tap-highlight-color:transparent, min-height 44px for buttons, overscroll-behavior:none
- Fixed mobile h-screen issue: added dvh support via CSS @supports
- Added iOS safe area support (pb-safe class, env(safe-area-inset-bottom))
- Set up Google OAuth with NextAuth: created /api/auth/[...nextauth]/route.ts with GoogleProvider
- Created nextauth-client.ts helper for client-side Google OAuth flow
- Updated login page to use real Google OAuth (with fallback to mock login)
- Updated .env.local with Google OAuth credentials and NEXTAUTH_SECRET
- Fixed syncAllStores() never being called: added useEffect in page.tsx
- Removed inconsistent auto-sync from plan-store.ts and user-store.ts
- Added NextAuth type declarations in src/types/next-auth.d.ts
- Tested: server runs, page renders, Supabase connected, NextAuth Google provider working

Stage Summary:
- All major bugs fixed (touch, viewport, sync inconsistency)
- Google OAuth fully configured and working
- Server stable and compiling successfully
- Supabase connection verified (tables with data return 200, empty config tables return 500 - needs DB Init)
