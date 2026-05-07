---
Task ID: 1
Agent: Main
Task: Revert preset visibility from user side, add Auto preset option for admin

Work Log:
- Explored codebase for all "preset" references across user and admin components
- Found 3 locations in overview-page.tsx showing preset names/warnings to users
- Removed all preset-related UI from user-facing overview-page.tsx:
  - Removed preset name badge from plan cards (replaced with generic "Auto-assigned" text)
  - Removed "Proxy Preset" row from confirm purchase dialog (replaced with "Server Group - Auto-assigned")
  - Removed "No Proxy Preset Assigned" warning from confirm dialog
  - Removed mockProxyPresets import and unused AlertTriangle import
- Updated admin-plans.tsx:
  - Added "Auto (System assigns best preset)" option to preset selector
  - Default preset changed from 'none' to 'auto'
  - Added info card for Auto preset selection (explains auto-assign behavior)
  - Updated "None" warning to suggest using Auto
  - Updated preset display in plan cards to show "Auto-assign" with Sparkles icon
  - Fixed IIFE parsing error by replacing with simpler conditional rendering
- Updated mock-data.ts:
  - Changed all plan proxyPresetId values from specific presets to 'auto'
  - Updated Plan type comment to document 'auto' value
  - Kept one plan (plan_008) as null to demonstrate "None" case
- Lint passes cleanly, dev server running OK

Stage Summary:
- Users will NEVER see the word "Preset" or any preset names
- User sees "Auto-assigned" for server group info (no details exposed)
- Admin has 3 options: Auto (system auto-assigns), None (no preset), or specific preset
- Admin-only: preset names and details are only visible in the admin panel
- Default for new plans is "Auto" instead of "None"
