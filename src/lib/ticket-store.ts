import { create } from 'zustand'

export type TicketStatus = 'open' | 'in_progress' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high'

export interface TicketMessage {
  id: string
  sender: 'user' | 'admin'
  name: string
  content: string
  timestamp: string
}

export interface TicketData {
  id: string
  userId: string
  userName: string
  subject: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  createdAt: string
  lastUpdate: string
  messages: number
  conversation: TicketMessage[]
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
}

function nowTimestamp(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 16)
}

function todayDate(): string {
  return new Date().toISOString().split('T')[0]
}

// Initial mock tickets
const initialTickets: TicketData[] = [
  {
    id: 'tk_101',
    userId: 'usr_cx_003',
    userName: 'Mike Johnson',
    subject: 'Cannot connect to Dhaka proxy',
    description: 'Getting timeout errors when connecting to Dhaka node',
    status: 'in_progress',
    priority: 'high',
    createdAt: '2025-02-10',
    lastUpdate: '2025-02-11 09:00',
    messages: 3,
    conversation: [
      { id: 'm1', sender: 'user', name: 'Mike Johnson', content: 'I cannot connect to the Dhaka proxy. It keeps timing out.', timestamp: '2025-02-10 10:00' },
      { id: 'm2', sender: 'admin', name: 'Admin CoreX', content: 'We are looking into the Dhaka proxy issue. Can you share your connection logs?', timestamp: '2025-02-10 11:30' },
      { id: 'm3', sender: 'user', name: 'Mike Johnson', content: 'Sure, I\'ve uploaded the logs. It shows timeout after 30 seconds.', timestamp: '2025-02-11 09:00' },
    ],
  },
  {
    id: 'tk_102',
    userId: 'usr_cx_001',
    userName: 'Alex Morgan',
    subject: 'Slow speed on Asia Pacific preset',
    description: 'Speeds are much lower than expected on Singapore nodes',
    status: 'open',
    priority: 'medium',
    createdAt: '2025-02-08',
    lastUpdate: '2025-02-10 14:30',
    messages: 5,
    conversation: [
      { id: 'm4', sender: 'user', name: 'Alex Morgan', content: 'The Asia Pacific preset is giving me very slow speeds, around 5 Mbps instead of 50 Mbps.', timestamp: '2025-02-08 14:00' },
      { id: 'm5', sender: 'admin', name: 'Admin CoreX', content: 'We are investigating the speed degradation on APAC nodes. Thank you for reporting.', timestamp: '2025-02-08 15:00' },
      { id: 'm6', sender: 'user', name: 'Alex Morgan', content: 'Any updates? It\'s been two days now.', timestamp: '2025-02-10 10:00' },
      { id: 'm7', sender: 'admin', name: 'Admin CoreX', content: 'We\'ve identified the issue — a faulty router in Singapore. Replacement is scheduled for tonight.', timestamp: '2025-02-10 14:00' },
      { id: 'm8', sender: 'user', name: 'Alex Morgan', content: 'Thanks for the update. Hope it gets fixed soon.', timestamp: '2025-02-10 14:30' },
    ],
  },
  {
    id: 'tk_103',
    userId: 'usr_cx_005',
    userName: 'James Wilson',
    subject: 'Payment not reflected in balance',
    description: 'I made a payment of ৳500 via bKash but my balance hasn\'t been updated.',
    status: 'open',
    priority: 'high',
    createdAt: '2025-02-10',
    lastUpdate: '2025-02-10 19:00',
    messages: 2,
    conversation: [
      { id: 'm9', sender: 'user', name: 'James Wilson', content: 'I made a payment of ৳500 via bKash but my balance hasn\'t been updated.', timestamp: '2025-02-10 18:00' },
      { id: 'm10', sender: 'admin', name: 'Admin CoreX', content: 'Please share your transaction ID so we can verify the payment.', timestamp: '2025-02-10 19:00' },
    ],
  },
  {
    id: 'tk_104',
    userId: 'usr_cx_002',
    userName: 'Sarah Chen',
    subject: 'Feature request: Dark mode in app',
    description: 'Would love a dark mode option in the mobile app',
    status: 'closed',
    priority: 'low',
    createdAt: '2025-01-20',
    lastUpdate: '2025-02-01 12:00',
    messages: 4,
    conversation: [
      { id: 'm11', sender: 'user', name: 'Sarah Chen', content: 'It would be great if the mobile app had a dark mode option.', timestamp: '2025-01-20 08:00' },
      { id: 'm12', sender: 'admin', name: 'Admin CoreX', content: 'Thank you for the suggestion! We\'ve added this to our roadmap.', timestamp: '2025-01-21 10:00' },
      { id: 'm13', sender: 'user', name: 'Sarah Chen', content: 'Awesome! Looking forward to it.', timestamp: '2025-01-22 09:00' },
      { id: 'm14', sender: 'admin', name: 'Admin CoreX', content: 'Dark mode has been implemented in v2.1.0. Please update your app!', timestamp: '2025-02-01 12:00' },
    ],
  },
]

interface TicketState {
  tickets: TicketData[]

  // Actions - user side
  createTicket: (userId: string, userName: string, subject: string, description: string, priority: TicketPriority) => TicketData | null
  userReply: (ticketId: string, content: string, userName: string) => void

  // Actions - admin side
  adminReply: (ticketId: string, content: string) => void
  changeStatus: (ticketId: string, newStatus: TicketStatus) => void
  assignTicket: (ticketId: string) => void
  deleteTicket: (ticketId: string) => void
  deleteTickets: (ticketIds: string[]) => void
  bulkClose: (ticketIds: string[]) => void

  // Getters
  getUserTickets: (userId: string) => TicketData[]
  getUserOpenTickets: (userId: string) => TicketData[]
  getTicketById: (ticketId: string) => TicketData | undefined
}

export const useTicketStore = create<TicketState>((set, get) => ({
  tickets: initialTickets,

  createTicket: (userId, userName, subject, description, priority) => {
    // Check: one open ticket at a time per user
    const openTickets = get().getUserOpenTickets(userId)
    if (openTickets.length > 0) {
      return null
    }

    const now = nowTimestamp()
    const ticket: TicketData = {
      id: generateId('tk'),
      userId,
      userName,
      subject,
      description,
      status: 'open',
      priority,
      createdAt: todayDate(),
      lastUpdate: now,
      messages: 1,
      conversation: [
        {
          id: generateId('m'),
          sender: 'user',
          name: userName,
          content: description,
          timestamp: now,
        },
      ],
    }

    set((state) => ({
      tickets: [ticket, ...state.tickets],
    }))
    return ticket
  },

  userReply: (ticketId, content, userName) => {
    const newMsg: TicketMessage = {
      id: generateId('m'),
      sender: 'user',
      name: userName,
      content,
      timestamp: nowTimestamp(),
    }
    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.id === ticketId
          ? { ...t, conversation: [...t.conversation, newMsg], messages: t.messages + 1, lastUpdate: newMsg.timestamp }
          : t
      ),
    }))
  },

  adminReply: (ticketId, content) => {
    const newMsg: TicketMessage = {
      id: generateId('m'),
      sender: 'admin',
      name: 'Admin CoreX',
      content,
      timestamp: nowTimestamp(),
    }
    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.id === ticketId
          ? { ...t, conversation: [...t.conversation, newMsg], messages: t.messages + 1, lastUpdate: newMsg.timestamp }
          : t
      ),
    }))
  },

  changeStatus: (ticketId, newStatus) => {
    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.id === ticketId
          ? { ...t, status: newStatus, lastUpdate: nowTimestamp() }
          : t
      ),
    }))
  },

  assignTicket: (ticketId) => {
    get().changeStatus(ticketId, 'in_progress')
  },

  deleteTicket: (ticketId) => {
    set((state) => ({
      tickets: state.tickets.filter((t) => t.id !== ticketId),
    }))
  },

  deleteTickets: (ticketIds) => {
    const set_ = new Set(ticketIds)
    set((state) => ({
      tickets: state.tickets.filter((t) => !set_.has(t.id)),
    }))
  },

  bulkClose: (ticketIds) => {
    const set_ = new Set(ticketIds)
    const now = nowTimestamp()
    set((state) => ({
      tickets: state.tickets.map((t) =>
        set_.has(t.id) ? { ...t, status: 'closed' as TicketStatus, lastUpdate: now } : t
      ),
    }))
  },

  getUserTickets: (userId) => get().tickets.filter((t) => t.userId === userId),
  getUserOpenTickets: (userId) => get().tickets.filter((t) => t.userId === userId && (t.status === 'open' || t.status === 'in_progress')),
  getTicketById: (ticketId) => get().tickets.find((t) => t.id === ticketId),
}))
