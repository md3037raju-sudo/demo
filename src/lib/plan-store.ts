import { create } from 'zustand'
import { mockPlans, type Plan } from '@/lib/mock-data'

interface PlanState {
  plans: Plan[]

  // Actions
  addPlan: (plan: Plan) => void
  updatePlan: (id: string, data: Partial<Plan>) => void
  deletePlan: (id: string) => void
  deletePlans: (ids: string[]) => void
  toggleActive: (id: string) => void
  setPlansActive: (ids: string[], active: boolean) => void
}

export const usePlanStore = create<PlanState>((set) => ({
  plans: [...mockPlans],

  addPlan: (plan) => {
    set((state) => ({
      plans: [plan, ...state.plans],
    }))
  },

  updatePlan: (id, data) => {
    set((state) => ({
      plans: state.plans.map((p) => (p.id === id ? { ...p, ...data } : p)),
    }))
  },

  deletePlan: (id) => {
    set((state) => ({
      plans: state.plans.filter((p) => p.id !== id),
    }))
  },

  deletePlans: (ids) => {
    const set_ = new Set(ids)
    set((state) => ({
      plans: state.plans.filter((p) => !set_.has(p.id)),
    }))
  },

  toggleActive: (id) => {
    set((state) => ({
      plans: state.plans.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p)),
    }))
  },

  setPlansActive: (ids, active) => {
    const set_ = new Set(ids)
    set((state) => ({
      plans: state.plans.map((p) => (set_.has(p.id) ? { ...p, isActive: active } : p)),
    }))
  },
}))
