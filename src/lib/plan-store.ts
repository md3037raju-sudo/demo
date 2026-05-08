import { create } from 'zustand'
import { mockPlans, type Plan } from '@/lib/mock-data'
import {
  fetchTable,
  insertRow,
  updateRow,
  deleteRows,
  subscribeToTable,
  snakeToCamelObj,
  camelToSnakeObj,
} from '@/lib/supabase-sync'

// ── Converter functions: snake_case DB row ↔ camelCase Plan ──

function planFromDb(row: Record<string, unknown>): Plan {
  const camel = snakeToCamelObj<Plan>(row)
  // JSONB fields come back as the correct JS type from Supabase,
  // but snakeToCamelObj only converts top-level keys.
  // Ensure devicePricing and features are properly typed.
  return {
    ...camel,
    devicePricing: (camel.devicePricing ?? {}) as Plan['devicePricing'],
    features: (camel.features ?? []) as string[],
    proxyPresetId: camel.proxyPresetId ?? null,
  }
}

function planToDb(plan: Partial<Plan>): Record<string, unknown> {
  const snake = camelToSnakeObj(plan as Record<string, unknown>)
  return snake
}

// ── Table name constant ──

const TABLE = 'plans'

// ── Store interface (unchanged from original) ──

interface PlanState {
  plans: Plan[]
  isSupabaseConnected: boolean

  // Actions
  addPlan: (plan: Plan) => void
  updatePlan: (id: string, data: Partial<Plan>) => void
  deletePlan: (id: string) => void
  deletePlans: (ids: string[]) => void
  toggleActive: (id: string) => void
  setPlansActive: (ids: string[], active: boolean) => void
  syncWithSupabase: () => Promise<void>
}

// ── Real-time subscription channel reference ──

let realtimeChannel: ReturnType<typeof subscribeToTable<Plan>> | null = null

// ── Store ──

export const usePlanStore = create<PlanState>((set, get) => ({
  plans: [...mockPlans],
  isSupabaseConnected: false,

  // ── Sync with Supabase ──

  syncWithSupabase: async () => {
    try {
      const data = await fetchTable<Plan>(TABLE, planFromDb, 'created_at', false)

      if (data.length > 0) {
        set({ plans: data, isSupabaseConnected: true })
      } else {
        // Table exists but is empty — still mark connected, keep mock data as seed
        set({ isSupabaseConnected: true })
      }

      // Subscribe to real-time changes after successful fetch
      if (!realtimeChannel) {
        realtimeChannel = subscribeToTable<Plan>(
          TABLE,
          {
            onInsert: (item) => {
              set((state) => {
                // Avoid duplicates (e.g. from own insert echoed back)
                if (state.plans.some((p) => p.id === item.id)) return state
                return { plans: [item, ...state.plans] }
              })
            },
            onUpdate: (item) => {
              set((state) => ({
                plans: state.plans.map((p) => (p.id === item.id ? item : p)),
              }))
            },
            onDelete: (id) => {
              set((state) => ({
                plans: state.plans.filter((p) => p.id !== id),
              }))
            },
          },
          planFromDb
        )
      }
    } catch (err) {
      console.warn('[PLAN-STORE] Supabase sync failed, using mock data:', err)
      // Keep mock data, mark as not connected
      set({ isSupabaseConnected: false })
    }
  },

  // ── Write operations: update local state immediately, push to Supabase in background ──

  addPlan: (plan) => {
    // Update local state immediately
    set((state) => ({
      plans: [plan, ...state.plans],
    }))

    // Push to Supabase in background
    if (get().isSupabaseConnected) {
      insertRow(TABLE, plan, planToDb).catch((err) => {
        console.warn('[PLAN-STORE] Failed to push addPlan to Supabase:', err)
      })
    }
  },

  updatePlan: (id, data) => {
    // Update local state immediately
    set((state) => ({
      plans: state.plans.map((p) => (p.id === id ? { ...p, ...data } : p)),
    }))

    // Push to Supabase in background
    if (get().isSupabaseConnected) {
      updateRow(TABLE, id, data, planToDb).catch((err) => {
        console.warn('[PLAN-STORE] Failed to push updatePlan to Supabase:', err)
      })
    }
  },

  deletePlan: (id) => {
    // Update local state immediately
    set((state) => ({
      plans: state.plans.filter((p) => p.id !== id),
    }))

    // Push to Supabase in background
    if (get().isSupabaseConnected) {
      deleteRows(TABLE, id).catch((err) => {
        console.warn('[PLAN-STORE] Failed to push deletePlan to Supabase:', err)
      })
    }
  },

  deletePlans: (ids) => {
    const set_ = new Set(ids)

    // Update local state immediately
    set((state) => ({
      plans: state.plans.filter((p) => !set_.has(p.id)),
    }))

    // Push to Supabase in background
    if (get().isSupabaseConnected) {
      deleteRows(TABLE, ids).catch((err) => {
        console.warn('[PLAN-STORE] Failed to push deletePlans to Supabase:', err)
      })
    }
  },

  toggleActive: (id) => {
    // Find current plan to compute new value
    const plan = get().plans.find((p) => p.id === id)
    if (!plan) return

    const newIsActive = !plan.isActive

    // Update local state immediately
    set((state) => ({
      plans: state.plans.map((p) => (p.id === id ? { ...p, isActive: newIsActive } : p)),
    }))

    // Push to Supabase in background
    if (get().isSupabaseConnected) {
      updateRow(TABLE, id, { isActive: newIsActive }, planToDb).catch((err) => {
        console.warn('[PLAN-STORE] Failed to push toggleActive to Supabase:', err)
      })
    }
  },

  setPlansActive: (ids, active) => {
    const set_ = new Set(ids)

    // Update local state immediately
    set((state) => ({
      plans: state.plans.map((p) => (set_.has(p.id) ? { ...p, isActive: active } : p)),
    }))

    // Push to Supabase in background — update each plan individually
    if (get().isSupabaseConnected) {
      ids.forEach((id) => {
        updateRow(TABLE, id, { isActive: active }, planToDb).catch((err) => {
          console.warn('[PLAN-STORE] Failed to push setPlansActive to Supabase:', err)
        })
      })
    }
  },
}))

// ── Auto-sync on store creation (setTimeout avoids SSR issues) ──

if (typeof window !== 'undefined') {
  setTimeout(() => {
    usePlanStore.getState().syncWithSupabase()
  }, 0)
}
