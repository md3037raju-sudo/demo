'use client'

import React, { useState } from 'react'
import { useAuthStore } from '@/lib/auth-store'
import { useTicketStore, type TicketPriority } from '@/lib/ticket-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
  Eye,
  Send,
} from 'lucide-react'

type TicketStatus = 'open' | 'in_progress' | 'closed'

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

export function UserTicketsPage() {
  const { user } = useAuthStore()
  const { getUserTickets, getUserOpenTickets, createTicket, userReply } = useTicketStore()

  const userId = user?.id ?? ''
  const userName = user?.name ?? ''
  const myTickets = getUserTickets(userId)
  const myOpenTickets = getUserOpenTickets(userId)

  const [createOpen, setCreateOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TicketPriority>('medium')

  // View ticket detail
  const [viewTicketId, setViewTicketId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  const viewTicket = myTickets.find((t) => t.id === viewTicketId) || null

  const openCount = myTickets.filter((t) => t.status === 'open').length
  const inProgressCount = myTickets.filter((t) => t.status === 'in_progress').length
  const closedCount = myTickets.filter((t) => t.status === 'closed').length

  const handleCreateTicket = () => {
    if (!subject.trim()) {
      toast.error('Please enter a subject')
      return
    }
    if (!description.trim()) {
      toast.error('Please describe your issue')
      return
    }

    // Check one-ticket-at-a-time restriction
    if (myOpenTickets.length > 0) {
      toast.error('You already have an active ticket', {
        description: 'Please wait for your current ticket to be resolved before opening a new one.',
      })
      setCreateOpen(false)
      return
    }

    const result = createTicket(userId, userName, subject.trim(), description.trim(), priority)
    if (!result) {
      toast.error('Could not create ticket', {
        description: 'You already have an active ticket. Please wait for it to be resolved.',
      })
      setCreateOpen(false)
      return
    }

    toast.success('Ticket created!', {
      description: 'Our team will review your issue shortly.',
    })
    setCreateOpen(false)
    setSubject('')
    setDescription('')
    setPriority('medium')
  }

  const handleSendReply = () => {
    if (!replyText.trim() || !viewTicketId) return
    userReply(viewTicketId, replyText.trim(), userName)
    setReplyText('')
    toast.success('Reply sent')
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
        <Button
          className="gap-1.5"
          onClick={() => setCreateOpen(true)}
          disabled={myOpenTickets.length > 0}
        >
          <Plus className="size-4" />
          New Ticket
        </Button>
      </div>

      {/* One ticket restriction banner */}
      {myOpenTickets.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-3">
          <AlertCircle className="size-4 text-amber-400 shrink-0" />
          <span className="text-sm text-amber-400">
            You have an active ticket. You can open a new ticket only after your current one is resolved.
          </span>
        </div>
      )}

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
          {myTickets.length === 0 ? (
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
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-mono text-xs">{ticket.id}</TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">{ticket.subject}</TableCell>
                      <TableCell><PriorityBadge priority={ticket.priority} /></TableCell>
                      <TableCell><StatusBadge status={ticket.status} /></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{ticket.createdAt}</TableCell>
                      <TableCell className="text-sm">{ticket.messages}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          onClick={() => { setViewTicketId(ticket.id); setReplyText('') }}
                        >
                          <Eye className="size-3.5" />
                          View
                        </Button>
                      </TableCell>
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

          {myOpenTickets.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-3">
              <AlertCircle className="size-4 text-amber-400 shrink-0" />
              <span className="text-sm text-amber-400">
                You already have an active ticket. Please wait for it to be resolved first.
              </span>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input
                placeholder="Brief description of your issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={myOpenTickets.length > 0}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <div className="flex gap-2">
                <Button
                  variant={priority === 'low' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPriority('low')}
                  disabled={myOpenTickets.length > 0}
                >
                  Low
                </Button>
                <Button
                  variant={priority === 'medium' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPriority('medium')}
                  disabled={myOpenTickets.length > 0}
                >
                  Medium
                </Button>
                <Button
                  variant={priority === 'high' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPriority('high')}
                  className="text-red-400 hover:text-red-300"
                  disabled={myOpenTickets.length > 0}
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
                disabled={myOpenTickets.length > 0}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCreateTicket}
              className="gap-1.5"
              disabled={myOpenTickets.length > 0 || !subject.trim() || !description.trim()}
            >
              <MessageSquare className="size-4" />
              Submit Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Ticket Detail Dialog */}
      <Dialog open={!!viewTicketId} onOpenChange={(open) => { if (!open) setViewTicketId(null) }}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewTicket?.subject}
              {viewTicket && <PriorityBadge priority={viewTicket.priority} />}
              {viewTicket && <StatusBadge status={viewTicket.status} />}
            </DialogTitle>
            <DialogDescription>
              Ticket {viewTicket?.id} — Created {viewTicket?.createdAt}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 py-2 max-h-96">
            {viewTicket?.conversation.map((msg) => (
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
                  <span className="text-xs font-bold">
                    {msg.sender === 'admin' ? 'A' : msg.name.split(' ').map((n) => n[0]).join('')}
                  </span>
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

          {/* Reply (only if ticket is not closed) */}
          {viewTicket && viewTicket.status !== 'closed' && (
            <div className="space-y-2 border-t pt-4">
              <label className="text-sm font-medium">Reply</label>
              <Textarea
                placeholder="Type your reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={3}
              />
              <div className="flex justify-end">
                <Button onClick={handleSendReply} disabled={!replyText.trim()} className="gap-1.5">
                  <Send className="size-4" />
                  Send Reply
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewTicketId(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
