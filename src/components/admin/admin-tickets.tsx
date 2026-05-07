'use client'

import React, { useState } from 'react'
import { toast } from 'sonner'
import { mockTickets } from '@/lib/mock-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Ticket, MoreHorizontal, MessageSquare, User } from 'lucide-react'

interface TicketMessage {
  id: string
  sender: 'user' | 'admin'
  name: string
  content: string
  timestamp: string
}

interface TicketData {
  id: string
  userId: string
  userName: string
  subject: string
  status: 'open' | 'in_progress' | 'closed'
  priority: 'high' | 'medium' | 'low'
  createdAt: string
  lastUpdate: string
  messages: number
  conversation: TicketMessage[]
}

const initialTickets: TicketData[] = [
  {
    ...mockTickets[0],
    conversation: [
      { id: 'm1', sender: 'user', name: 'Mike Johnson', content: 'I cannot connect to the Dhaka proxy. It keeps timing out.', timestamp: '2025-02-10 10:00' },
      { id: 'm2', sender: 'admin', name: 'Admin CoreX', content: 'We are looking into the Dhaka proxy issue. Can you share your connection logs?', timestamp: '2025-02-10 11:30' },
      { id: 'm3', sender: 'user', name: 'Mike Johnson', content: 'Sure, I\'ve uploaded the logs. It shows timeout after 30 seconds.', timestamp: '2025-02-11 09:00' },
    ],
  },
  {
    ...mockTickets[1],
    conversation: [
      { id: 'm4', sender: 'user', name: 'Alex Morgan', content: 'The Asia Pacific preset is giving me very slow speeds, around 5 Mbps instead of 50 Mbps.', timestamp: '2025-02-08 14:00' },
      { id: 'm5', sender: 'admin', name: 'Admin CoreX', content: 'We are investigating the speed degradation on APAC nodes. Thank you for reporting.', timestamp: '2025-02-08 15:00' },
      { id: 'm6', sender: 'user', name: 'Alex Morgan', content: 'Any updates? It\'s been two days now.', timestamp: '2025-02-10 10:00' },
      { id: 'm7', sender: 'admin', name: 'Admin CoreX', content: 'We\'ve identified the issue — a faulty router in Singapore. Replacement is scheduled for tonight.', timestamp: '2025-02-10 14:00' },
      { id: 'm8', sender: 'user', name: 'Alex Morgan', content: 'Thanks for the update. Hope it gets fixed soon.', timestamp: '2025-02-10 14:30' },
    ],
  },
  {
    ...mockTickets[2],
    conversation: [
      { id: 'm9', sender: 'user', name: 'James Wilson', content: 'I made a payment of $500 via bKash but my balance hasn\'t been updated.', timestamp: '2025-02-10 18:00' },
      { id: 'm10', sender: 'admin', name: 'Admin CoreX', content: 'Please share your transaction ID so we can verify the payment.', timestamp: '2025-02-10 19:00' },
    ],
  },
  {
    ...mockTickets[3],
    conversation: [
      { id: 'm11', sender: 'user', name: 'Sarah Chen', content: 'It would be great if the mobile app had a dark mode option.', timestamp: '2025-01-20 08:00' },
      { id: 'm12', sender: 'admin', name: 'Admin CoreX', content: 'Thank you for the suggestion! We\'ve added this to our roadmap.', timestamp: '2025-01-21 10:00' },
      { id: 'm13', sender: 'user', name: 'Sarah Chen', content: 'Awesome! Looking forward to it.', timestamp: '2025-01-22 09:00' },
      { id: 'm14', sender: 'admin', name: 'Admin CoreX', content: 'Dark mode has been implemented in v2.1.0. Please update your app!', timestamp: '2025-02-01 12:00' },
    ],
  },
]

export function AdminTicketsPage() {
  const [tickets, setTickets] = useState<TicketData[]>(initialTickets)
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null)
  const [replyText, setReplyText] = useState('')

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false
    return true
  })

  const openCount = tickets.filter((t) => t.status === 'open').length
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length
  const closedCount = tickets.filter((t) => t.status === 'closed').length

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>
      case 'medium':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Medium</Badge>
      case 'low':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Low</Badge>
      default:
        return <Badge variant="secondary">{priority}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Open</Badge>
      case 'in_progress':
        return <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/30">In Progress</Badge>
      case 'closed':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Closed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleViewTicket = (ticket: TicketData) => {
    setSelectedTicket(ticket)
    setReplyText('')
    setDetailOpen(true)
  }

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedTicket) return

    const newMessage: TicketMessage = {
      id: `m_${Date.now()}`,
      sender: 'admin',
      name: 'Admin CoreX',
      content: replyText,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    }

    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicket.id
          ? {
              ...t,
              conversation: [...t.conversation, newMessage],
              messages: t.messages + 1,
              lastUpdate: newMessage.timestamp,
            }
          : t
      )
    )
    setSelectedTicket((prev) =>
      prev
        ? {
            ...prev,
            conversation: [...prev.conversation, newMessage],
            messages: prev.messages + 1,
            lastUpdate: newMessage.timestamp,
          }
        : null
    )
    setReplyText('')
    toast.success('Reply sent')
  }

  const handleChangeStatus = (ticketId: string, newStatus: 'open' | 'in_progress' | 'closed') => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? { ...t, status: newStatus, lastUpdate: new Date().toISOString().replace('T', ' ').slice(0, 16) }
          : t
      )
    )
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket((prev) => (prev ? { ...prev, status: newStatus } : null))
    }
    toast.success(`Ticket status changed to ${newStatus.replace('_', ' ')}`)
  }

  const handleAssign = (ticketId: string) => {
    toast.success('Ticket assigned to you')
    handleChangeStatus(ticketId, 'in_progress')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Ticket className="size-6 text-primary" />
          Support Tickets
        </h2>
        <p className="text-muted-foreground">Manage and respond to user support requests</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-400">{openCount}</p>
              <p className="text-sm text-muted-foreground">Open</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-sky-400">{inProgressCount}</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400">{closedCount}</p>
              <p className="text-sm text-muted-foreground">Closed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{tickets.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Update</TableHead>
                  <TableHead>Messages</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-mono text-xs">{ticket.id}</TableCell>
                    <TableCell className="font-medium">{ticket.userName}</TableCell>
                    <TableCell>{ticket.subject}</TableCell>
                    <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell className="text-sm">{ticket.createdAt}</TableCell>
                    <TableCell className="text-sm">{ticket.lastUpdate}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="size-3.5 text-muted-foreground" />
                        {ticket.messages}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewTicket(ticket)}
                        >
                          View
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {ticket.status !== 'in_progress' && (
                              <DropdownMenuItem onClick={() => handleChangeStatus(ticket.id, 'in_progress')}>
                                Mark In Progress
                              </DropdownMenuItem>
                            )}
                            {ticket.status !== 'open' && (
                              <DropdownMenuItem onClick={() => handleChangeStatus(ticket.id, 'open')}>
                                Reopen
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleAssign(ticket.id)}>
                              Assign to Me
                            </DropdownMenuItem>
                            {ticket.status !== 'closed' && (
                              <DropdownMenuItem onClick={() => handleChangeStatus(ticket.id, 'closed')}>
                                Close Ticket
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTickets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No tickets match the current filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Ticket Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTicket?.subject}
              {selectedTicket && getPriorityBadge(selectedTicket.priority)}
              {selectedTicket && getStatusBadge(selectedTicket.status)}
            </DialogTitle>
            <DialogDescription>
              Ticket {selectedTicket?.id} — {selectedTicket?.userName}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 py-2 max-h-96">
            {selectedTicket?.conversation.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'admin' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`size-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.sender === 'admin'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {msg.sender === 'admin' ? (
                    <User className="size-4" />
                  ) : (
                    <span className="text-xs font-bold">
                      {msg.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </span>
                  )}
                </div>
                <div
                  className={`flex-1 rounded-lg p-3 ${
                    msg.sender === 'admin'
                      ? 'bg-primary/10 text-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{msg.name}</span>
                    <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Status change buttons */}
          {selectedTicket && selectedTicket.status !== 'closed' && (
            <div className="flex flex-wrap gap-2 border-t pt-4">
              {selectedTicket.status === 'open' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleChangeStatus(selectedTicket.id, 'in_progress')}
                >
                  Mark In Progress
                </Button>
              )}
              {selectedTicket.status === 'in_progress' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleChangeStatus(selectedTicket.id, 'open')}
                >
                  Reopen
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  handleChangeStatus(selectedTicket.id, 'closed')
                  setDetailOpen(false)
                }}
              >
                Close Ticket
              </Button>
            </div>
          )}

          {/* Reply */}
          {selectedTicket && selectedTicket.status !== 'closed' && (
            <div className="space-y-2 border-t pt-4">
              <Label>Reply</Label>
              <Textarea
                placeholder="Type your reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={3}
              />
              <div className="flex justify-end">
                <Button onClick={handleSendReply} disabled={!replyText.trim()}>
                  <MessageSquare className="size-4 mr-1" />
                  Send Reply
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
