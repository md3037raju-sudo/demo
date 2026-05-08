# Task a6-a7: Admin Proxy Presets & Plans Pages

## Summary
Created two comprehensive admin components for the CoreX admin panel:

### Files Created
1. **`src/components/admin/admin-proxies-preset.tsx`** - Proxy Presets management (exported as `AdminProxiesPreset`)
2. **`src/components/admin/admin-plans.tsx`** - Plan Management (exported as `AdminPlans`)

### Files Modified
- **`src/components/admin/admin-layout.tsx`** - Added imports for both new components, route mapping in `renderAdminPage()`, fixed duplicate Badge import

### Key Features Implemented

#### Proxy Presets Page
- Two-view architecture: Preset List → Preset Detail (click to drill in)
- Preset list: cards with name, description, status badge, subgroup count, total proxies, assigned users
- Add New Preset / Health Check All buttons
- Preset detail: stat cards (Total Proxies, Subgroups, Assigned Users, Healthy Subgroups), back button
- Subgroup cards with expandable proxy tables (chevron toggle)
- Status dots: healthy=green, degraded=amber, down=red
- Image preview area with upload button and editable width/height dimensions
- Add Subgroup dialog: name, image upload, image dimensions
- Bulk Upload dialog: CSV/JSON tabs with format examples, parses and adds mock proxies
- Health check: all proxies, per subgroup, per individual proxy (mock random status)
- Health summary bar (healthy/degraded/down counts)
- Full CRUD: create/edit/delete presets, add/delete subgroups, add/delete proxies
- All operations use local state + toast notifications

#### Plans Page
- Grid layout of plan cards with active indicator strip
- Each card: name, price with period, speed, data limit, max devices, period, subscriber count, active/inactive badge
- Inactive plans visually dimmed (opacity-70)
- Create New Plan button
- Create/Edit Plan dialog: Name, Speed, Data Limit, Max Devices, Price, Period (Monthly/Yearly Select), Active switch
- Delete Plan with AlertDialog confirmation
- Full CRUD with local state + toast notifications

### Technical Details
- Dark theme with emerald/teal color scheme
- Uses shadcn/ui components: Card, Table, Button, Dialog, Input, Badge, Tabs, Switch, Textarea, Label, AlertDialog, Select, Separator
- Mock data from `@/lib/mock-data` (mockProxyPresets, mockPlans)
- All state managed locally with useState
- Lint passes clean, dev server compiles successfully
