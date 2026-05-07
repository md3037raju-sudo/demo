'use client'

import React, { useState } from 'react'
import { useAuthStore } from '@/lib/auth-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import {
  MessageSquare,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
} from 'lucide-react'

type TicketStatus = 'open' | 'in_progress' | 'closed'
type TicketPriority = 'low' | 'medium' | 'high'

interface Ticket {
  id: string
  subject: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  createdAt: string
  lastUpdate: string
  messages: number
}

function StatusBadge({ status }: { status: TicketStatus }) {
  switch (status) {
    case 'open':
      return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Open</Badge>
    case 'in_progress':
      return <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/30">In Progress</Badge>
    case 'closed':
      return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Closed</Badge>
  }
}

function PriorityBadge({ priority }: { priority: TicketPriority }) {
  switch (priority) {
    case 'high':
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">High</Badge>
    case 'medium':
      return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Medium</Badge>
    case 'low':
      return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Low</Badge>
  }
}

const initialTickets: Ticket[] = [
  { id: 'tk_001', subject: 'Cannot connect to Dhaka proxy', description: 'Getting timeout errors when connecting to Dhaka node', status: 'in_progress', priority: 'high', createdAt: '2025-02-25', lastUpdate: '2025-02-26', messages: 3 },
  { id: 'tk_002', subject: 'Slow speed on Asia Pacific preset', description: 'Speeds are much lower than expected on Singapore nodes', status: 'open', priority: 'medium', createdAt: '2025-02-24', lastUpdate: '2025-02-25', messages: 2 },
  { id: 'tk_003', subject: 'Feature request: Dark mode in app', description: 'Would love a dark mode option in the mobile app', status: 'closed', priority: 'low', createdAt: '2025-02-20', lastUpdate: '2025-02-22', messages: 4 },
]

export function UserTicketsPage() {
  const { user } = useAuthStore()
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets)
  const [createOpen, setCreateOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TicketPriority>('medium')

  const openCount = tickets.filter((t) => t.status === 'open').length
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length
  const closedCount = tickets.filter((t) => t.status === 'closed').length

  const handleCreateTicket = () => {
    if (!subject.trim()) {
      toast.error('Please enter a subject')
      return
    }
    if (!description.trim()) {
      toast.error('Please describe your issue')
      return
    }

    const newTicket: Ticket = {
      id: `tk_${Date.now()}`,
      subject: subject.trim(),
      description: description.trim(),
      status: 'open',
      priority,
      createdAt: new Date().toISOString().split('T')[0],
      lastUpdate: new Date().toISOString().split('T')[0],
      messages: 1,
    }

    setTickets((prev) => [newTicket, ...prev])
    toast.success('Ticket created!', {
      description: 'Our team will review your issue shortly.',
    })
    setCreateOpen(false)
    setSubject('')
    setDescription('')
    setPriority('medium')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Support Tickets</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Get help with any issues or questions
          </p>
        </div>
        <Button className="gap-1.5" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          New Ticket
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/15">
                <AlertCircle className="size-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{openCount}</p>
                <p className="text-xs text-muted-foreground">Open</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-sky-500/15">
                <Clock className="size-5 text-sky-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inProgressCount}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/15">
                <CheckCircle2 className="size-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{closedCount}</p>
                <p className="text-xs text-muted-foreground">Closed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">My Tickets</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <MessageSquare className="size-10 mb-3 opacity-30" />
              <p className="text-sm">No tickets yet</p>
              <p className="text-xs mt-1">Create a new ticket if you need help</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Messages</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-mono text-xs">{ticket.id}</TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">{ticket.subject}</TableCell>
                      <TableCell><PriorityBadge priority={ticket.priority} /></TableCell>
                      <TableCell><StatusBadge status={ticket.status} /></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{ticket.createdAt}</TableCell>
                      <TableCell className="text-sm">{ticket.messages}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Ticket Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="size-5" />
              Open Support Ticket
            </DialogTitle>
            <DialogDescription>
              Describe your issue and our team will get back to you
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input
                placeholder="Brief description of your issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <div className="flex gap-2">
                <Button
                  variant={priority === 'low' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPriority('low')}
                >
                  Low
                </Button>
                <Button
                  variant={priority === 'medium' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPriority('medium')}
                >
                  Medium
                </Button>
                <Button
                  variant={priority === 'high' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPriority('high')}
                  className="text-red-400 hover:text-red-300"
                >
                  High
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Describe your issue in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTicket} className="gap-1.5">
              <MessageSquare className="size-4" />
              Submit Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
