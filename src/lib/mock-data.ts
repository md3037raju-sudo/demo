export const mockSubscriptions = [
  {
    id: 'sub_001',
    userId: 'usr_cx_001',
    userName: 'Alex Morgan',
    name: 'CoreX Pro',
    plan: 'Monthly',
    status: 'active' as const,
    startDate: '2025-01-15',
    expiryDate: '2025-02-15',
    price: 29.99,
    bandwidthUsed: 45.2,
    bandwidthLimit: 100,
    deepLink: 'corex://configure/sub_001',
  },
  {
    id: 'sub_002',
    userId: 'usr_cx_002',
    userName: 'Sarah Chen',
    name: 'CoreX Enterprise',
    plan: 'Yearly',
    status: 'active' as const,
    startDate: '2024-12-01',
    expiryDate: '2025-12-01',
    price: 299.99,
    bandwidthUsed: 320.5,
    bandwidthLimit: 500,
    deepLink: 'corex://configure/sub_002',
  },
  {
    id: 'sub_003',
    userId: 'usr_cx_003',
    userName: 'Mike Johnson',
    name: 'CoreX Starter',
    plan: 'Monthly',
    status: 'expired' as const,
    startDate: '2024-10-01',
    expiryDate: '2024-11-01',
    price: 9.99,
    bandwidthUsed: 12.8,
    bandwidthLimit: 50,
    deepLink: 'corex://configure/sub_003',
  },
  {
    id: 'sub_004',
    userId: 'usr_cx_004',
    userName: 'Emily Davis',
    name: 'CoreX Pro',
    plan: 'Monthly',
    status: 'renewable' as const,
    startDate: '2025-01-01',
    expiryDate: '2025-02-01',
    price: 29.99,
    bandwidthUsed: 78.4,
    bandwidthLimit: 100,
    deepLink: 'corex://configure/sub_004',
  },
]

export const mockActiveDevices = [
  {
    id: 'dev_001',
    userId: 'usr_cx_001',
    userName: 'Alex Morgan',
    name: 'Samsung Galaxy S24',
    os: 'Android 14',
    subscription: 'CoreX Pro',
    bindDate: '2025-01-15',
    lastActive: '2025-02-10',
  },
  {
    id: 'dev_002',
    userId: 'usr_cx_002',
    userName: 'Sarah Chen',
    name: 'Google Pixel 8',
    os: 'Android 14',
    subscription: 'CoreX Enterprise',
    bindDate: '2024-12-05',
    lastActive: '2025-02-09',
  },
  {
    id: 'dev_003',
    userId: 'usr_cx_001',
    userName: 'Alex Morgan',
    name: 'OnePlus 12',
    os: 'Android 14',
    subscription: 'CoreX Pro',
    bindDate: '2025-01-20',
    lastActive: '2025-02-11',
  },
]

export const mockTransactions = [
  {
    id: 'txn_001',
    userId: 'usr_cx_001',
    userName: 'Alex Morgan',
    type: 'payment' as const,
    description: 'CoreX Pro - Monthly',
    amount: -29.99,
    date: '2025-02-01',
    status: 'completed' as const,
  },
  {
    id: 'txn_002',
    userId: 'usr_cx_001',
    userName: 'Alex Morgan',
    type: 'topup' as const,
    description: 'Balance Top-up (bKash)',
    amount: 100.00,
    date: '2025-01-28',
    status: 'completed' as const,
  },
  {
    id: 'txn_003',
    userId: 'usr_cx_002',
    userName: 'Sarah Chen',
    type: 'payment' as const,
    description: 'CoreX Enterprise - Yearly',
    amount: -299.99,
    date: '2024-12-01',
    status: 'completed' as const,
  },
  {
    id: 'txn_004',
    userId: 'usr_cx_003',
    userName: 'Mike Johnson',
    type: 'topup' as const,
    description: 'Balance Top-up (Nagad)',
    amount: 250.00,
    date: '2024-11-15',
    status: 'pending' as const,
  },
  {
    id: 'txn_005',
    userId: 'usr_cx_004',
    userName: 'Emily Davis',
    type: 'refund' as const,
    description: 'CoreX Starter - Refund',
    amount: 9.99,
    date: '2024-11-02',
    status: 'completed' as const,
  },
  {
    id: 'txn_006',
    userId: 'usr_cx_005',
    userName: 'James Wilson',
    type: 'topup' as const,
    description: 'Balance Top-up (bKash)',
    amount: 500.00,
    date: '2025-02-10',
    status: 'pending' as const,
  },
]

// Admin-specific mock data
export const mockUsers = [
  { id: 'usr_cx_001', name: 'Alex Morgan', email: 'alex.morgan@gmail.com', provider: 'google', role: 'user' as const, balance: 249.50, status: 'active' as const, joinedAt: '2024-11-01', subscriptions: 2, devices: 2, lastActive: '2025-02-11' },
  { id: 'usr_cx_002', name: 'Sarah Chen', email: 'sarah.chen@gmail.com', provider: 'google', role: 'user' as const, balance: 89.00, status: 'active' as const, joinedAt: '2024-11-15', subscriptions: 1, devices: 1, lastActive: '2025-02-09' },
  { id: 'usr_cx_003', name: 'Mike Johnson', email: 'mike.j@telegram', provider: 'telegram', role: 'user' as const, balance: 15.00, status: 'active' as const, joinedAt: '2024-10-20', subscriptions: 0, devices: 0, lastActive: '2025-01-15' },
  { id: 'usr_cx_004', name: 'Emily Davis', email: 'emily.d@gmail.com', provider: 'google', role: 'user' as const, balance: 0, status: 'banned' as const, joinedAt: '2024-12-01', subscriptions: 1, devices: 1, lastActive: '2025-01-28' },
  { id: 'usr_cx_005', name: 'James Wilson', email: 'james.w@telegram', provider: 'telegram', role: 'user' as const, balance: 500.00, status: 'active' as const, joinedAt: '2025-01-10', subscriptions: 1, devices: 1, lastActive: '2025-02-10' },
  { id: 'usr_cx_006', name: 'Lisa Anderson', email: 'lisa.a@gmail.com', provider: 'google', role: 'moderator' as const, balance: 75.00, status: 'active' as const, joinedAt: '2024-09-15', subscriptions: 1, devices: 1, lastActive: '2025-02-08' },
  { id: 'usr_cx_007', name: 'Raj Patel', email: 'raj.p@telegram', provider: 'telegram', role: 'user' as const, balance: 0, status: 'suspended' as const, joinedAt: '2025-01-20', subscriptions: 0, devices: 0, lastActive: '2025-01-25' },
]

export const mockProxyPresets = [
  {
    id: 'preset_001',
    name: 'Bangladesh Premium',
    description: 'Optimized for BD users with local nodes',
    isActive: true,
    subgroups: [
      { id: 'sg_001', name: 'Dhaka', proxyCount: 7, status: 'healthy' as const, image: null, imageWidth: 200, imageHeight: 100 },
      { id: 'sg_002', name: 'Sylhet', proxyCount: 4, status: 'healthy' as const, image: null, imageWidth: 200, imageHeight: 100 },
      { id: 'sg_003', name: 'Chittagong', proxyCount: 5, status: 'degraded' as const, image: null, imageWidth: 200, imageHeight: 100 },
    ],
    assignedUsers: 156,
  },
  {
    id: 'preset_002',
    name: 'Asia Pacific',
    description: 'Wide coverage across APAC region',
    isActive: true,
    subgroups: [
      { id: 'sg_004', name: 'Singapore', proxyCount: 8, status: 'healthy' as const, image: null, imageWidth: 200, imageHeight: 100 },
      { id: 'sg_005', name: 'Japan', proxyCount: 6, status: 'healthy' as const, image: null, imageWidth: 200, imageHeight: 100 },
      { id: 'sg_006', name: 'Hong Kong', proxyCount: 5, status: 'down' as const, image: null, imageWidth: 200, imageHeight: 100 },
    ],
    assignedUsers: 98,
  },
  {
    id: 'preset_003',
    name: 'Global Mix',
    description: 'Balanced global proxy distribution',
    isActive: true,
    subgroups: [
      { id: 'sg_007', name: 'US West', proxyCount: 10, status: 'healthy' as const, image: null, imageWidth: 200, imageHeight: 100 },
      { id: 'sg_008', name: 'EU Central', proxyCount: 8, status: 'healthy' as const, image: null, imageWidth: 200, imageHeight: 100 },
      { id: 'sg_009', name: 'BD', proxyCount: 7, status: 'healthy' as const, image: null, imageWidth: 200, imageHeight: 100 },
    ],
    assignedUsers: 210,
  },
]

export const mockPlans = [
  { id: 'plan_001', name: 'CoreX Starter', speed: '10 Mbps', dataLimit: '50 GB', maxDevices: 1, price: 9.99, period: 'Monthly', isActive: true, subscribers: 45 },
  { id: 'plan_002', name: 'CoreX Pro', speed: '50 Mbps', dataLimit: '100 GB', maxDevices: 3, price: 29.99, period: 'Monthly', isActive: true, subscribers: 156 },
  { id: 'plan_003', name: 'CoreX Enterprise', speed: '100 Mbps', dataLimit: '500 GB', maxDevices: 10, price: 299.99, period: 'Yearly', isActive: true, subscribers: 32 },
  { id: 'plan_004', name: 'CoreX Ultimate', speed: 'Unlimited', dataLimit: 'Unlimited', maxDevices: 5, price: 49.99, period: 'Monthly', isActive: false, subscribers: 0 },
]

export const mockRecycleBin = [
  { id: 'del_001', subscriptionId: 'sub_005', subscriptionName: 'CoreX Starter', userId: 'usr_cx_003', userName: 'Mike Johnson', deletedAt: '2025-02-09', restoreDeadline: '2025-02-12', plan: 'Monthly', price: 9.99 },
  { id: 'del_002', subscriptionId: 'sub_006', subscriptionName: 'CoreX Pro', userId: 'usr_cx_004', userName: 'Emily Davis', deletedAt: '2025-02-10', restoreDeadline: '2025-02-13', plan: 'Monthly', price: 29.99 },
]

export const mockAdminPayments = [
  { id: 'pay_001', userId: 'usr_cx_003', userName: 'Mike Johnson', amount: 250.00, method: 'bKash', trxId: 'BK0A2B3C4D', submittedAt: '2024-11-15', status: 'pending' as const, notes: '' },
  { id: 'pay_002', userId: 'usr_cx_005', userName: 'James Wilson', amount: 500.00, method: 'bKash', trxId: 'BK9X8Y7Z6W', submittedAt: '2025-02-10', status: 'pending' as const, notes: '' },
  { id: 'pay_003', userId: 'usr_cx_001', userName: 'Alex Morgan', amount: 100.00, method: 'Nagad', trxId: 'NG5E4R3T2Y', submittedAt: '2025-01-28', status: 'approved' as const, notes: 'Verified and added' },
  { id: 'pay_004', userId: 'usr_cx_002', userName: 'Sarah Chen', amount: 50.00, method: 'bKash', trxId: 'BK1Q2W3E4R', submittedAt: '2025-01-15', status: 'rejected' as const, notes: 'Invalid transaction ID' },
]

export const mockActivityLogs = [
  { id: 'log_001', type: 'normal' as const, user: 'Alex Morgan', action: 'Logged in via Google', timestamp: '2025-02-11 14:30:00', ip: '103.48.xxx.xxx' },
  { id: 'log_002', type: 'paid' as const, user: 'Sarah Chen', action: 'Subscribed to CoreX Enterprise (Yearly)', timestamp: '2025-02-10 09:15:00', ip: '45.64.xxx.xxx' },
  { id: 'log_003', type: 'referral' as const, user: 'Alex Morgan', action: 'Referred Lisa Anderson — earned $5.00', timestamp: '2025-02-08 16:45:00', ip: '103.48.xxx.xxx' },
  { id: 'log_004', type: 'normal' as const, user: 'Mike Johnson', action: 'Downloaded CoreX APK', timestamp: '2025-02-07 11:20:00', ip: '119.30.xxx.xxx' },
  { id: 'log_005', type: 'paid' as const, user: 'James Wilson', action: 'Balance top-up request: $500 (bKash)', timestamp: '2025-02-10 18:00:00', ip: '37.111.xxx.xxx' },
  { id: 'log_006', type: 'normal' as const, user: 'Emily Davis', action: 'Device released: OnePlus 12', timestamp: '2025-02-05 08:30:00', ip: '182.48.xxx.xxx' },
  { id: 'log_007', type: 'referral' as const, user: 'Sarah Chen', action: 'Referred Raj Patel — earned $5.00', timestamp: '2025-02-04 13:10:00', ip: '45.64.xxx.xxx' },
  { id: 'log_008', type: 'paid' as const, user: 'Alex Morgan', action: 'Subscription renewed: CoreX Pro', timestamp: '2025-02-01 00:00:00', ip: 'System' },
  { id: 'log_009', type: 'normal' as const, user: 'Admin CoreX', action: 'Banned user Emily Davis', timestamp: '2025-01-28 10:00:00', ip: 'Admin Panel' },
  { id: 'log_010', type: 'paid' as const, user: 'Lisa Anderson', action: 'Balance top-up: $75 (Nagad)', timestamp: '2025-01-27 15:45:00', ip: '203.45.xxx.xxx' },
]

export const mockTickets = [
  { id: 'tk_001', userId: 'usr_cx_003', userName: 'Mike Johnson', subject: 'Cannot connect to Dhaka proxy', status: 'open' as const, priority: 'high' as const, createdAt: '2025-02-10', lastUpdate: '2025-02-11', messages: 3 },
  { id: 'tk_002', userId: 'usr_cx_001', userName: 'Alex Morgan', subject: 'Slow speed on Asia Pacific preset', status: 'in_progress' as const, priority: 'medium' as const, createdAt: '2025-02-08', lastUpdate: '2025-02-10', messages: 5 },
  { id: 'tk_003', userId: 'usr_cx_005', userName: 'James Wilson', subject: 'Payment not reflected in balance', status: 'open' as const, priority: 'high' as const, createdAt: '2025-02-10', lastUpdate: '2025-02-10', messages: 2 },
  { id: 'tk_004', userId: 'usr_cx_002', userName: 'Sarah Chen', subject: 'Feature request: Dark mode in app', status: 'closed' as const, priority: 'low' as const, createdAt: '2025-01-20', lastUpdate: '2025-02-01', messages: 4 },
]
