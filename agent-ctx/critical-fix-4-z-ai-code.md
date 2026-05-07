# Task: Create Zustand Stores for User and Plan Management

## Summary
Created two new Zustand stores following existing project patterns.

## Files Created

### 1. `/home/z/my-project/src/lib/user-store.ts`
- **Types exported**: `UserStatus`, `UserRole`, `User` interface
- **Store**: `useUserStore`
- **State**: `users` array initialized from `mockUsers`
- **Methods**:
  - `addUser(user)` — prepends user to array
  - `updateUser(id, data)` — partial update via spread
  - `deleteUser(id)` — filters out by id
  - `setUserStatus(id, status)` — sets status to 'active' | 'banned' | 'suspended'
  - `setUserRole(id, role)` — sets role to 'user' | 'moderator' | 'admin'
  - `setUserBalance(id, balance)` — sets balance number
  - `getUserById(id)` — getter, finds by id

### 2. `/home/z/my-project/src/lib/plan-store.ts`
- **Type imported**: `Plan` from `@/lib/mock-data`
- **Store**: `usePlanStore`
- **State**: `plans` array initialized from `mockPlans`
- **Methods**:
  - `addPlan(plan)` — prepends plan to array
  - `updatePlan(id, data)` — partial update via spread
  - `deletePlan(id)` — filters out by id
  - `deletePlans(ids)` — bulk delete using Set for O(1) lookup
  - `toggleActive(id)` — flips `isActive` boolean
  - `setPlansActive(ids, active)` — bulk set active/inactive using Set

## Patterns Followed
- Same `import { create } from 'zustand'` pattern as existing stores
- Mock data initialization with spread operator (`[...mockPlans]`) like coupon-store
- `generateId` helper included in user-store (consistent with payment-store, ticket-store)
- Set-based bulk operations (consistent with ticket-store, payment-store)
- Lint: ✅ passes cleanly
