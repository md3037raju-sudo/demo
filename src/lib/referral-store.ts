import { create } from 'zustand'

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

interface ReferralState {
  referrals: ReferralEntry[]
  settings: ReferralSettings
  applyReferralCode: (code: string, newUserId: string, newUserName: string) => { success: boolean; error?: string }
  updateSettings: (settings: Partial<ReferralSettings>) => void
  getReferralsByUser: (userId: string) => ReferralEntry[]
  getTotalEarnings: (userId: string) => number
}

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

export const useReferralStore = create<ReferralState>((set, get) => ({
  referrals: [...mockReferrals],

  settings: {
    referrerReward: 5,
    referredReward: 5,
    minWithdrawal: 10,
    commissionType: 'fixed',
    commissionValue: 5,
  },

  applyReferralCode: (code, newUserId, newUserName) => {
    const state = get()

    // Check if user already used a referral code
    const alreadyReferred = state.referrals.some((r) => r.referredUserId === newUserId)
    if (alreadyReferred) {
      return { success: false, error: 'You have already used a referral code' }
    }

    // Find the referrer by code
    // We check against known referral codes from the auth store pattern
    const codeToReferrer: Record<string, { id: string; name: string }> = {
      'COREX-7K9M2': { id: 'usr_cx_001', name: 'Alex Morgan' },
      'SARAH-X4K7M': { id: 'usr_cx_002', name: 'Sarah Chen' },
      'ADMIN-0001': { id: 'adm_cx_001', name: 'Admin CoreX' },
    }

    const referrer = codeToReferrer[code.toUpperCase()]
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

    return { success: true }
  },

  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }))
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
