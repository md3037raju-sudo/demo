import { create } from 'zustand'
import { addBalanceToUser } from './auth-store'

export type PaymentMethod = 'bkash' | 'nagad'
export type RequestStatus = 'pending' | 'approved' | 'rejected'

export interface BalanceRequest {
  id: string
  userId: string
  userName: string
  amount: number
  method: PaymentMethod
  trxId: string
  status: RequestStatus
  submittedAt: string
  adminNote: string
}

export interface Transaction {
  id: string
  userId: string
  userName: string
  type: 'payment' | 'topup' | 'refund'
  description: string
  amount: number
  date: string
  status: 'completed' | 'pending' | 'failed'
}

export interface PaymentConfig {
  bkashNumber: string
  bkashType: 'personal' | 'merchant'
  nagadNumber: string
  nagadType: 'personal' | 'merchant'
}

const TRANSACTIONS_VANISH_DAYS = 90

function isWithin90Days(dateStr: string): boolean {
  const txnDate = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - txnDate.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays <= TRANSACTIONS_VANISH_DAYS
}

function getDaysBeforeVanish(dateStr: string): number {
  const txnDate = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - txnDate.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return Math.max(0, Math.ceil(TRANSACTIONS_VANISH_DAYS - diffDays))
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
}

interface PaymentState {
  balanceRequests: BalanceRequest[]
  transactions: Transaction[]
  paymentConfig: PaymentConfig

  // Actions - user side
  submitBalanceRequest: (userId: string, userName: string, amount: number, method: PaymentMethod, trxId: string) => BalanceRequest

  // Actions - admin side
  approveRequest: (requestId: string, adminNote?: string) => void
  rejectRequest: (requestId: string, adminNote?: string) => void
  bulkApprove: (requestIds: string[]) => void
  bulkReject: (requestIds: string[]) => void

  // Actions - config
  updatePaymentConfig: (config: Partial<PaymentConfig>) => void

  // Getters
  getPendingRequests: () => BalanceRequest[]
  getUserRequests: (userId: string) => BalanceRequest[]
  getUserTransactions: (userId: string) => Transaction[]
  getVisibleTransactions: (userId: string) => Transaction[]
}

const initialTransactions: Transaction[] = [
  { id: 'txn_001', userId: 'usr_cx_001', userName: 'Alex Morgan', type: 'payment', description: 'CoreX Pro - Monthly', amount: -29.99, date: '2025-02-01', status: 'completed' },
  { id: 'txn_002', userId: 'usr_cx_001', userName: 'Alex Morgan', type: 'topup', description: 'Balance Top-up (bKash)', amount: 100.00, date: '2025-01-28', status: 'completed' },
  { id: 'txn_003', userId: 'usr_cx_002', userName: 'Sarah Chen', type: 'payment', description: 'CoreX Enterprise - Yearly', amount: -299.99, date: '2024-12-01', status: 'completed' },
  { id: 'txn_004', userId: 'usr_cx_003', userName: 'Mike Johnson', type: 'topup', description: 'Balance Top-up (Nagad)', amount: 250.00, date: '2024-11-15', status: 'pending' },
  { id: 'txn_005', userId: 'usr_cx_004', userName: 'Emily Davis', type: 'refund', description: 'CoreX Starter - Refund', amount: 9.99, date: '2024-11-02', status: 'completed' },
  { id: 'txn_006', userId: 'usr_cx_005', userName: 'James Wilson', type: 'topup', description: 'Balance Top-up (bKash)', amount: 500.00, date: '2025-02-10', status: 'pending' },
]

const initialBalanceRequests: BalanceRequest[] = [
  { id: 'pay_001', userId: 'usr_cx_003', userName: 'Mike Johnson', amount: 250.00, method: 'bkash', trxId: 'BK0A2B3C4D', status: 'pending', submittedAt: '2025-02-25', adminNote: '' },
  { id: 'pay_002', userId: 'usr_cx_005', userName: 'James Wilson', amount: 500.00, method: 'bkash', trxId: 'BK9X8Y7Z6W', status: 'pending', submittedAt: '2025-02-24', adminNote: '' },
  { id: 'pay_003', userId: 'usr_cx_001', userName: 'Alex Morgan', amount: 100.00, method: 'nagad', trxId: 'NG5E4R3T2Y', status: 'approved', submittedAt: '2025-01-28', adminNote: 'Verified and added' },
  { id: 'pay_004', userId: 'usr_cx_002', userName: 'Sarah Chen', amount: 50.00, method: 'bkash', trxId: 'BK1Q2W3E4R', status: 'rejected', submittedAt: '2025-01-15', adminNote: 'Invalid transaction ID' },
]

export const usePaymentStore = create<PaymentState>((set, get) => ({
  balanceRequests: initialBalanceRequests,
  transactions: initialTransactions,
  paymentConfig: {
    bkashNumber: '01712345678',
    bkashType: 'personal',
    nagadNumber: '01812345678',
    nagadType: 'personal',
  },

  submitBalanceRequest: (userId, userName, amount, method, trxId) => {
    const request: BalanceRequest = {
      id: generateId('pay'),
      userId,
      userName,
      amount,
      method,
      trxId,
      status: 'pending',
      submittedAt: new Date().toISOString().split('T')[0],
      adminNote: '',
    }
    set((state) => ({
      balanceRequests: [request, ...state.balanceRequests],
    }))
    return request
  },

  approveRequest: (requestId, adminNote = 'Verified and approved') => {
    const request = get().balanceRequests.find((r) => r.id === requestId)
    if (!request || request.status !== 'pending') return

    set((state) => ({
      balanceRequests: state.balanceRequests.map((r) =>
        r.id === requestId ? { ...r, status: 'approved' as RequestStatus, adminNote } : r
      ),
      transactions: [
        {
          id: generateId('txn'),
          userId: request.userId,
          userName: request.userName,
          type: 'topup',
          description: `Balance Top-up (${request.method === 'bkash' ? 'bKash' : 'Nagad'})`,
          amount: request.amount,
          date: new Date().toISOString().split('T')[0],
          status: 'completed',
        },
        ...state.transactions,
      ],
    }))

    // Add balance to auth store
    addBalanceToUser(request.userId, request.amount)
  },

  rejectRequest: (requestId, adminNote = 'Rejected by admin') => {
    set((state) => ({
      balanceRequests: state.balanceRequests.map((r) =>
        r.id === requestId ? { ...r, status: 'rejected' as RequestStatus, adminNote } : r
      ),
    }))
  },

  bulkApprove: (requestIds) => {
    const set_ = new Set(requestIds)
    const requests = get().balanceRequests.filter((r) => set_.has(r.id) && r.status === 'pending')

    const newTransactions: Transaction[] = requests.map((r) => ({
      id: generateId('txn'),
      userId: r.userId,
      userName: r.userName,
      type: 'topup' as const,
      description: `Balance Top-up (${r.method === 'bkash' ? 'bKash' : 'Nagad'})`,
      amount: r.amount,
      date: new Date().toISOString().split('T')[0],
      status: 'completed' as const,
    }))

    set((state) => ({
      balanceRequests: state.balanceRequests.map((r) =>
        set_.has(r.id) && r.status === 'pending' ? { ...r, status: 'approved' as RequestStatus, adminNote: 'Bulk approved' } : r
      ),
      transactions: [...newTransactions, ...state.transactions],
    }))

    // Add balance to auth store for each
    requests.forEach((r) => addBalanceToUser(r.userId, r.amount))
  },

  bulkReject: (requestIds) => {
    const set_ = new Set(requestIds)
    set((state) => ({
      balanceRequests: state.balanceRequests.map((r) =>
        set_.has(r.id) && r.status === 'pending' ? { ...r, status: 'rejected' as RequestStatus, adminNote: 'Bulk rejected' } : r
      ),
    }))
  },

  updatePaymentConfig: (config) => {
    set((state) => ({
      paymentConfig: { ...state.paymentConfig, ...config },
    }))
  },

  getPendingRequests: () => get().balanceRequests.filter((r) => r.status === 'pending'),
  getUserRequests: (userId) => get().balanceRequests.filter((r) => r.userId === userId),
  getUserTransactions: (userId) => get().transactions.filter((t) => t.userId === userId),
  getVisibleTransactions: (userId) => get().transactions.filter((t) => t.userId === userId && isWithin90Days(t.date)),
}))

export { isWithin90Days, getDaysBeforeVanish, TRANSACTIONS_VANISH_DAYS }
