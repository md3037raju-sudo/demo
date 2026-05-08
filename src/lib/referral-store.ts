import { create } from 'zustand'
import {
  fetchTable,
  fetchConfig,
  insertRow,
  updateRow,
  subscribeToTable,
  snakeToCamelObj,
  camelToSnakeObj,
} from '@/lib/supabase-sync'
import { addBalanceToUser } from './auth-store'

export interface ReferralEntry {
  id: string
  referrerId: string
  referrerName: string
  referredUserId: string
  referredUserName: string
  referralCode: string
  referredAt: string
  referrerReward: number
  referredReward: number
  status: 'completed' | 'pending'
}

export interface ReferralSettings {
  referrerReward: number
  referredReward: number
  minWithdrawal: number
  commissionType: 'fixed' | 'percentage'
  commissionValue: number
}

// ── Converter functions: snake_case DB row ↔ camelCase ──

function referralFromDb(row: Record<string, unknown>): ReferralEntry {
  const camel = snakeToCamelObj<ReferralEntry>(row)
  return {
    id: camel.id ?? '',
    referrerId: camel.referrerId ?? '',
    referrerName: camel.referrerName ?? '',
    referredUserId: camel.referredUserId ?? '',
    referredUserName: camel.referredUserName ?? '',
    referralCode: camel.referralCode ?? '',
    referredAt: camel.referredAt ?? '',
    referrerReward: typeof camel.referrerReward === 'number' ? camel.referrerReward : 0,
    referredReward: typeof camel.referredReward === 'number' ? camel.referredReward : 0,
    status: camel.status === 'pending' ? 'pending' : 'completed',
  }
}

function referralToDb(item: Partial<ReferralEntry>): Record<string, unknown> {
  return camelToSnakeObj(item as Record<string, unknown>)
}

function referralSettingsFromDb(row: Record<string, unknown>): ReferralSettings {
  const camel = snakeToCamelObj<ReferralSettings>(row)
  return {
    referrerReward: typeof camel.referrerReward === 'number' ? camel.referrerReward : 5,
    referredReward: typeof camel.referredReward === 'number' ? camel.referredReward : 5,
    minWithdrawal: typeof camel.minWithdrawal === 'number' ? camel.minWithdrawal : 10,
    commissionType: camel.commissionType === 'percentage' ? 'percentage' : 'fixed',
    commissionValue: typeof camel.commissionValue === 'number' ? camel.commissionValue : 5,
  }
}

function referralSettingsToDb(item: Partial<ReferralSettings>): Record<string, unknown> {
  return camelToSnakeObj(item as Record<string, unknown>)
}

// ── Table name constants ──

const REFERRALS_TABLE = 'referrals'
const REFERRAL_SETTINGS_TABLE = 'referral_settings'

// ── Initial mock data ──

const mockReferrals: ReferralEntry[] = [
  {
    id: 'ref_001',
    referrerId: 'usr_cx_001',
    referrerName: 'Alex Morgan',
    referredUserId: 'usr_cx_002',
    referredUserName: 'Sarah Chen',
    referralCode: 'COREX-7K9M2',
    referredAt: '2025-02-08',
    referrerReward: 5.00,
    referredReward: 5.00,
    status: 'completed',
  },
  {
    id: 'ref_002',
    referrerId: 'usr_cx_001',
    referrerName: 'Alex Morgan',
    referredUserId: 'usr_cx_003',
    referredUserName: 'Mike Johnson',
    referralCode: 'COREX-7K9M2',
    referredAt: '2025-02-05',
    referrerReward: 5.00,
    referredReward: 5.00,
    status: 'completed',
  },
  {
    id: 'ref_003',
    referrerId: 'usr_cx_001',
    referrerName: 'Alex Morgan',
    referredUserId: 'usr_cx_004',
    referredUserName: 'Emily Davis',
    referralCode: 'COREX-7K9M2',
    referredAt: '2025-01-28',
    referrerReward: 5.00,
    referredReward: 5.00,
    status: 'pending',
  },
  {
    id: 'ref_004',
    referrerId: 'usr_cx_002',
    referrerName: 'Sarah Chen',
    referredUserId: 'usr_cx_005',
    referredUserName: 'James Wilson',
    referralCode: 'SARAH-X4K7M',
    referredAt: '2025-01-20',
    referrerReward: 5.00,
    referredReward: 5.00,
    status: 'completed',
  },
  {
    id: 'ref_005',
    referrerId: 'usr_cx_001',
    referrerName: 'Alex Morgan',
    referredUserId: 'usr_cx_006',
    referredUserName: 'Lisa Anderson',
    referralCode: 'COREX-7K9M2',
    referredAt: '2025-01-15',
    referrerReward: 5.00,
    referredReward: 5.00,
    status: 'completed',
  },
]

const initialSettings: ReferralSettings = {
  referrerReward: 5,
  referredReward: 5,
  minWithdrawal: 10,
  commissionType: 'fixed',
  commissionValue: 5,
}

// ── Store interface (unchanged from original) ──

interface ReferralState {
  referrals: ReferralEntry[]
  settings: ReferralSettings
  isSupabaseConnected: boolean

  applyReferralCode: (code: string, newUserId: string, newUserName: string) => { success: boolean; error?: string }
  updateSettings: (settings: Partial<ReferralSettings>) => void
  getReferralsByUser: (userId: string) => ReferralEntry[]
  getTotalEarnings: (userId: string) => number

  // Sync
  syncWithSupabase: () => Promise<void>
}

// ── Real-time subscription channel references ──

let referralsChannel: ReturnType<typeof subscribeToTable<ReferralEntry>> | null = null
let referralSettingsChannel: ReturnType<typeof subscribeToTable<ReferralSettings>> | null = null

// ── Store ──

export const useReferralStore = create<ReferralState>((set, get) => ({
  referrals: [...mockReferrals],
  settings: { ...initialSettings },
  isSupabaseConnected: false,

  // ── Sync with Supabase ──

  syncWithSupabase: async () => {
    try {
      const [referralData, settingsData] = await Promise.all([
        fetchTable<ReferralEntry>(REFERRALS_TABLE, referralFromDb, 'created_at', false),
        fetchConfig<ReferralSettings>(REFERRAL_SETTINGS_TABLE, referralSettingsFromDb),
      ])

      const hasReferralData = referralData.length > 0
      const hasSettingsData = settingsData !== null

      set({
        ...(hasReferralData ? { referrals: referralData } : {}),
        ...(hasSettingsData ? { settings: settingsData } : {}),
        isSupabaseConnected: true,
      })

      // Subscribe to real-time changes for referrals table
      if (!referralsChannel) {
        referralsChannel = subscribeToTable<ReferralEntry>(
          REFERRALS_TABLE,
          {
            onInsert: (item) => {
              set((state) => {
                if (state.referrals.some((r) => r.id === item.id)) return state
                return { referrals: [item, ...state.referrals] }
              })
            },
            onUpdate: (item) => {
              set((state) => ({
                referrals: state.referrals.map((r) => (r.id === item.id ? item : r)),
              }))
            },
            onDelete: (id) => {
              set((state) => ({
                referrals: state.referrals.filter((r) => r.id !== id),
              }))
            },
          },
          referralFromDb
        )
      }

      // Subscribe to real-time changes for referral_settings table
      if (!referralSettingsChannel) {
        referralSettingsChannel = subscribeToTable<ReferralSettings>(
          REFERRAL_SETTINGS_TABLE,
          {
            onInsert: (item) => {
              set({ settings: item })
            },
            onUpdate: (item) => {
              set({ settings: item })
            },
            onDelete: () => {
              // If settings are deleted, fall back to initial
              set({ settings: { ...initialSettings } })
            },
          },
          referralSettingsFromDb
        )
      }
    } catch (err) {
      console.warn('[REFERRAL-STORE] Supabase sync failed, using mock data:', err)
      set({ isSupabaseConnected: false })
    }
  },

  // ── Write operations: update local state immediately, push to Supabase in background ──

  applyReferralCode: (code, newUserId, newUserName) => {
    const state = get()

    // Check if user already used a referral code
    const alreadyReferred = state.referrals.some((r) => r.referredUserId === newUserId)
    if (alreadyReferred) {
      return { success: false, error: 'You have already used a referral code' }
    }

    // Find the referrer by code — dynamic lookup from existing referral data
    const existingReferral = state.referrals.find((r) => r.referralCode === code.toUpperCase())
    const referrer = existingReferral
      ? { id: existingReferral.referrerId, name: existingReferral.referrerName }
      : null
    if (!referrer) {
      return { success: false, error: 'Invalid referral code' }
    }

    // Can't refer yourself
    if (referrer.id === newUserId) {
      return { success: false, error: 'You cannot use your own referral code' }
    }

    const newReferral: ReferralEntry = {
      id: `ref_${Date.now()}`,
      referrerId: referrer.id,
      referrerName: referrer.name,
      referredUserId: newUserId,
      referredUserName: newUserName,
      referralCode: code.toUpperCase(),
      referredAt: new Date().toISOString().split('T')[0],
      referrerReward: state.settings.referrerReward,
      referredReward: state.settings.referredReward,
      status: 'completed',
    }

    set((state) => ({
      referrals: [newReferral, ...state.referrals],
    }))

    // Add rewards to both users' balances
    addBalanceToUser(referrer.id, state.settings.referrerReward)
    addBalanceToUser(newUserId, state.settings.referredReward)

    // Push to Supabase in background
    if (get().isSupabaseConnected) {
      insertRow(REFERRALS_TABLE, newReferral, referralToDb).catch((err) => {
        console.warn('[REFERRAL-STORE] Failed to push applyReferralCode to Supabase:', err)
      })
    }

    return { success: true }
  },

  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }))

    // Push to Supabase in background
    if (get().isSupabaseConnected) {
      // referral_settings is a single-row table — update by id 'settings_001'
      updateRow(REFERRAL_SETTINGS_TABLE, 'settings_001', newSettings, referralSettingsToDb).catch((err) => {
        console.warn('[REFERRAL-STORE] Failed to push updateSettings to Supabase:', err)
      })
    }
  },

  getReferralsByUser: (userId) => {
    return get().referrals.filter((r) => r.referrerId === userId)
  },

  getTotalEarnings: (userId) => {
    return get()
      .referrals.filter((r) => r.referrerId === userId && r.status === 'completed')
      .reduce((sum, r) => sum + r.referrerReward, 0)
  },
}))

// NOTE: Auto-sync removed — call syncAllStores() from the app to trigger sync
