import { create } from 'zustand'
import { addBalanceToUser } from './auth-store'
import {
  fetchTable,
  fetchConfig,
  insertRow,
  updateRow,
  deleteRows,
  subscribeToTable,
  snakeToCamelObj,
  camelToSnakeObj,
} from '@/lib/supabase-sync'

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

// ── Converter functions: snake_case DB row ↔ camelCase ──

function balanceRequestFromDb(row: Record<string, unknown>): BalanceRequest {
  const camel = snakeToCamelObj<BalanceRequest>(row)
  return {
    id: camel.id ?? '',
    userId: camel.userId ?? '',
    userName: camel.userName ?? '',
    amount: typeof camel.amount === 'number' ? camel.amount : 0,
    method: camel.method === 'nagad' ? 'nagad' : 'bkash',
    trxId: camel.trxId ?? '',
    status: ['pending', 'approved', 'rejected'].includes(camel.status as string)
      ? (camel.status as RequestStatus)
      : 'pending',
    submittedAt: camel.submittedAt ?? '',
    adminNote: camel.adminNote ?? '',
  }
}

function balanceRequestToDb(item: Partial<BalanceRequest>): Record<string, unknown> {
  return camelToSnakeObj(item as Record<string, unknown>)
}

function transactionFromDb(row: Record<string, unknown>): Transaction {
  const camel = snakeToCamelObj<Transaction>(row)
  return {
    id: camel.id ?? '',
    userId: camel.userId ?? '',
    userName: camel.userName ?? '',
    type: ['payment', 'topup', 'refund'].includes(camel.type as string)
      ? (camel.type as Transaction['type'])
      : 'payment',
    description: camel.description ?? '',
    amount: typeof camel.amount === 'number' ? camel.amount : 0,
    date: camel.date ?? '',
    status: ['completed', 'pending', 'failed'].includes(camel.status as string)
      ? (camel.status as Transaction['status'])
      : 'completed',
  }
}

function transactionToDb(item: Partial<Transaction>): Record<string, unknown> {
  return camelToSnakeObj(item as Record<string, unknown>)
}

function paymentConfigFromDb(row: Record<string, unknown>): PaymentConfig {
  const camel = snakeToCamelObj<PaymentConfig>(row)
  return {
    bkashNumber: camel.bkashNumber ?? '',
    bkashType: camel.bkashType === 'merchant' ? 'merchant' : 'personal',
    nagadNumber: camel.nagadNumber ?? '',
    nagadType: camel.nagadType === 'merchant' ? 'merchant' : 'personal',
  }
}

function paymentConfigToDb(item: Partial<PaymentConfig>): Record<string, unknown> {
  return camelToSnakeObj(item as Record<string, unknown>)
}

// ── Table name constants ──

const BALANCE_REQUESTS_TABLE = 'balance_requests'
const TRANSACTIONS_TABLE = 'transactions'
const PAYMENT_CONFIG_TABLE = 'payment_config'

// ── Initial mock data ──

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

const initialPaymentConfig: PaymentConfig = {
  bkashNumber: '01712345678',
  bkashType: 'personal',
  nagadNumber: '01812345678',
  nagadType: 'personal',
}

// ── Store interface ──

interface PaymentState {
  balanceRequests: BalanceRequest[]
  transactions: Transaction[]
  paymentConfig: PaymentConfig
  isSupabaseConnected: boolean

  // Actions - user side
  submitBalanceRequest: (userId: string, userName: string, amount: number, method: PaymentMethod, trxId: string) => BalanceRequest | null

  // Actions - admin side
  approveRequest: (requestId: string, adminNote?: string) => void
  rejectRequest: (requestId: string, adminNote?: string) => void
  bulkApprove: (requestIds: string[]) => void
  bulkReject: (requestIds: string[]) => void
  deleteRequest: (requestId: string) => void
  deleteRequests: (requestIds: string[]) => void

  // Actions - config
  updatePaymentConfig: (config: Partial<PaymentConfig>) => void

  // Getters
  getPendingRequests: () => BalanceRequest[]
  getUserRequests: (userId: string) => BalanceRequest[]
  getUserTransactions: (userId: string) => Transaction[]
  getVisibleTransactions: (userId: string) => Transaction[]
  isTrxIdApproved: (trxId: string) => boolean

  // Sync
  syncWithSupabase: () => Promise<void>
}

// ── Real-time subscription channel references ──

let balanceRequestsChannel: ReturnType<typeof subscribeToTable<BalanceRequest>> | null = null
let transactionsChannel: ReturnType<typeof subscribeToTable<Transaction>> | null = null
let paymentConfigChannel: ReturnType<typeof subscribeToTable<PaymentConfig>> | null = null

// ── Store ──

export const usePaymentStore = create<PaymentState>((set, get) => ({
  balanceRequests: initialBalanceRequests,
  transactions: initialTransactions,
  paymentConfig: initialPaymentConfig,
  isSupabaseConnected: false,

  // ── Sync with Supabase ──

  syncWithSupabase: async () => {
    try {
      // Fetch all 3 tables in parallel
      const [balanceData, transactionData, configData] = await Promise.all([
        fetchTable<BalanceRequest>(BALANCE_REQUESTS_TABLE, balanceRequestFromDb, 'created_at', false),
        fetchTable<Transaction>(TRANSACTIONS_TABLE, transactionFromDb, 'created_at', false),
        fetchConfig<PaymentConfig>(PAYMENT_CONFIG_TABLE, paymentConfigFromDb),
      ])

      // Determine if we got data from Supabase
      const hasBalanceData = balanceData.length > 0
      const hasTransactionData = transactionData.length > 0
      const hasConfigData = configData !== null

      set({
        ...(hasBalanceData ? { balanceRequests: balanceData } : {}),
        ...(hasTransactionData ? { transactions: transactionData } : {}),
        ...(hasConfigData ? { paymentConfig: configData } : {}),
        isSupabaseConnected: true,
      })

      // Subscribe to real-time changes for all 3 tables
      if (!balanceRequestsChannel) {
        balanceRequestsChannel = subscribeToTable<BalanceRequest>(
          BALANCE_REQUESTS_TABLE,
          {
            onInsert: (item) => {
              set((state) => {
                if (state.balanceRequests.some((r) => r.id === item.id)) return state
                return { balanceRequests: [item, ...state.balanceRequests] }
              })
            },
            onUpdate: (item) => {
              set((state) => ({
                balanceRequests: state.balanceRequests.map((r) =>
                  r.id === item.id ? item : r
                ),
              }))
            },
            onDelete: (id) => {
              set((state) => ({
                balanceRequests: state.balanceRequests.filter((r) => r.id !== id),
              }))
            },
          },
          balanceRequestFromDb
        )
      }

      if (!transactionsChannel) {
        transactionsChannel = subscribeToTable<Transaction>(
          TRANSACTIONS_TABLE,
          {
            onInsert: (item) => {
              set((state) => {
                if (state.transactions.some((t) => t.id === item.id)) return state
                return { transactions: [item, ...state.transactions] }
              })
            },
            onUpdate: (item) => {
              set((state) => ({
                transactions: state.transactions.map((t) =>
                  t.id === item.id ? item : t
                ),
              }))
            },
            onDelete: (id) => {
              set((state) => ({
                transactions: state.transactions.filter((t) => t.id !== id),
              }))
            },
          },
          transactionFromDb
        )
      }

      if (!paymentConfigChannel) {
        paymentConfigChannel = subscribeToTable<PaymentConfig>(
          PAYMENT_CONFIG_TABLE,
          {
            onInsert: (item) => {
              set({ paymentConfig: item })
            },
            onUpdate: (item) => {
              set({ paymentConfig: item })
            },
            onDelete: () => {
              // If config is deleted, fall back to initial
              set({ paymentConfig: initialPaymentConfig })
            },
          },
          paymentConfigFromDb
        )
      }
    } catch (err) {
      console.warn('[PAYMENT-STORE] Supabase sync failed, using mock data:', err)
      set({ isSupabaseConnected: false })
    }
  },

  // ── Write operations: update local state immediately, push to Supabase in background ──

  submitBalanceRequest: (userId, userName, amount, method, trxId) => {
    // Check if this TrxID has already been approved
    if (get().isTrxIdApproved(trxId)) {
      return null
    }

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

    // Push to Supabase in background
    if (get().isSupabaseConnected) {
      insertRow(BALANCE_REQUESTS_TABLE, request, balanceRequestToDb).catch((err) => {
        console.warn('[PAYMENT-STORE] Failed to push submitBalanceRequest to Supabase:', err)
      })
    }

    return request
  },

  approveRequest: (requestId, adminNote = 'Verified and approved') => {
    const request = get().balanceRequests.find((r) => r.id === requestId)
    if (!request || request.status !== 'pending') return

    const newTransaction: Transaction = {
      id: generateId('txn'),
      userId: request.userId,
      userName: request.userName,
      type: 'topup',
      description: `Balance Top-up (${request.method === 'bkash' ? 'bKash' : 'Nagad'})`,
      amount: request.amount,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
    }

    set((state) => ({
      balanceRequests: state.balanceRequests.map((r) =>
        r.id === requestId ? { ...r, status: 'approved' as RequestStatus, adminNote } : r
      ),
      transactions: [newTransaction, ...state.transactions],
    }))

    // Add balance to auth store
    addBalanceToUser(request.userId, request.amount)

    // Push both changes to Supabase in background
    if (get().isSupabaseConnected) {
      updateRow(BALANCE_REQUESTS_TABLE, requestId, {
        status: 'approved' as RequestStatus,
        adminNote,
      }, balanceRequestToDb).catch((err) => {
        console.warn('[PAYMENT-STORE] Failed to push approveRequest (balance) to Supabase:', err)
      })

      insertRow(TRANSACTIONS_TABLE, newTransaction, transactionToDb).catch((err) => {
        console.warn('[PAYMENT-STORE] Failed to push approveRequest (transaction) to Supabase:', err)
      })
    }
  },

  rejectRequest: (requestId, adminNote = 'Rejected by admin') => {
    set((state) => ({
      balanceRequests: state.balanceRequests.map((r) =>
        r.id === requestId ? { ...r, status: 'rejected' as RequestStatus, adminNote } : r
      ),
    }))

    // Push to Supabase in background
    if (get().isSupabaseConnected) {
      updateRow(BALANCE_REQUESTS_TABLE, requestId, {
        status: 'rejected' as RequestStatus,
        adminNote,
      }, balanceRequestToDb).catch((err) => {
        console.warn('[PAYMENT-STORE] Failed to push rejectRequest to Supabase:', err)
      })
    }
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

    // Push both changes to Supabase in background
    if (get().isSupabaseConnected) {
      requestIds.forEach((id) => {
        updateRow(BALANCE_REQUESTS_TABLE, id, {
          status: 'approved' as RequestStatus,
          adminNote: 'Bulk approved',
        }, balanceRequestToDb).catch((err) => {
          console.warn('[PAYMENT-STORE] Failed to push bulkApprove (balance) to Supabase:', err)
        })
      })

      newTransactions.forEach((txn) => {
        insertRow(TRANSACTIONS_TABLE, txn, transactionToDb).catch((err) => {
          console.warn('[PAYMENT-STORE] Failed to push bulkApprove (transaction) to Supabase:', err)
        })
      })
    }
  },

  bulkReject: (requestIds) => {
    const set_ = new Set(requestIds)
    set((state) => ({
      balanceRequests: state.balanceRequests.map((r) =>
        set_.has(r.id) && r.status === 'pending' ? { ...r, status: 'rejected' as RequestStatus, adminNote: 'Bulk rejected' } : r
      ),
    }))

    // Push to Supabase in background
    if (get().isSupabaseConnected) {
      requestIds.forEach((id) => {
        updateRow(BALANCE_REQUESTS_TABLE, id, {
          status: 'rejected' as RequestStatus,
          adminNote: 'Bulk rejected',
        }, balanceRequestToDb).catch((err) => {
          console.warn('[PAYMENT-STORE] Failed to push bulkReject to Supabase:', err)
        })
      })
    }
  },

  deleteRequest: (requestId) => {
    set((state) => ({
      balanceRequests: state.balanceRequests.filter((r) => r.id !== requestId),
    }))

    // Push to Supabase in background
    if (get().isSupabaseConnected) {
      deleteRows(BALANCE_REQUESTS_TABLE, requestId).catch((err) => {
        console.warn('[PAYMENT-STORE] Failed to push deleteRequest to Supabase:', err)
      })
    }
  },

  deleteRequests: (requestIds) => {
    const set_ = new Set(requestIds)
    set((state) => ({
      balanceRequests: state.balanceRequests.filter((r) => !set_.has(r.id)),
    }))

    // Push to Supabase in background
    if (get().isSupabaseConnected) {
      deleteRows(BALANCE_REQUESTS_TABLE, requestIds).catch((err) => {
        console.warn('[PAYMENT-STORE] Failed to push deleteRequests to Supabase:', err)
      })
    }
  },

  updatePaymentConfig: (config) => {
    set((state) => ({
      paymentConfig: { ...state.paymentConfig, ...config },
    }))

    // Push to Supabase in background
    if (get().isSupabaseConnected) {
      // payment_config is a single-row table — update by id 'config_001'
      updateRow(PAYMENT_CONFIG_TABLE, 'config_001', config, paymentConfigToDb).catch((err) => {
        console.warn('[PAYMENT-STORE] Failed to push updatePaymentConfig to Supabase:', err)
      })
    }
  },

  getPendingRequests: () => get().balanceRequests.filter((r) => r.status === 'pending'),
  getUserRequests: (userId) => get().balanceRequests.filter((r) => r.userId === userId),
  getUserTransactions: (userId) => get().transactions.filter((t) => t.userId === userId),
  getVisibleTransactions: (userId) => get().transactions.filter((t) => t.userId === userId && isWithin90Days(t.date)),
  isTrxIdApproved: (trxId) => get().balanceRequests.some((r) => r.trxId === trxId && r.status === 'approved'),
}))

// NOTE: Auto-sync removed — call syncAllStores() from the app to trigger sync

export { isWithin90Days, getDaysBeforeVanish, TRANSACTIONS_VANISH_DAYS }
