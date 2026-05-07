'use client'

import React, { useState } from 'react'
import { useTicketStore, type TicketData, type TicketStatus, type TicketPriority } from '@/lib/ticket-store'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Ticket, MoreHorizontal, MessageSquare, User, Trash2 } from 'lucide-react'

function getPriorityBadge(priority: string) {
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

function getStatusBadge(status: string) {
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

export function AdminTicketsPage() {
  const { tickets, adminReply, changeStatus, assignTicket, deleteTicket, deleteTickets, bulkClose } = useTicketStore()

  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null)
  const [replyText, setReplyText] = useState('')

  // Delete
  const [deleteSingleTicket, setDeleteSingleTicket] = useState<TicketData | null>(null)
  const [deleteSingleOpen, setDeleteSingleOpen] = useState(false)

  // Bulk select
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkCloseOpen, setBulkCloseOpen] = useState(false)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = (ids: string[]) => {
    setSelectedIds(prev => {
      if (prev.size === ids.length) return new Set()
      return new Set(ids)
    })
  }

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false
    return true
  })

  const filteredTicketIds = filteredTickets.map((t) => t.id)

  const openCount = tickets.filter((t) => t.status === 'open').length
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length
  const closedCount = tickets.filter((t) => t.status === 'closed').length

  const handleViewTicket = (ticket: TicketData) => {
    setSelectedTicket(ticket)
    setReplyText('')
    setDetailOpen(true)
  }

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedTicket) return

    adminReply(selectedTicket.id, replyText)

    // Update local selectedTicket for immediate UI feedback
    const newMsg = {
      id: `m_${Date.now()}`,
      sender: 'admin' as const,
      name: 'Admin CoreX',
      content: replyText,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    }
    setSelectedTicket((prev) =>
      prev
        ? {
            ...prev,
            conversation: [...prev.conversation, newMsg],
            messages: prev.messages + 1,
            lastUpdate: newMsg.timestamp,
          }
        : null
    )
    setReplyText('')
    toast.success('Reply sent')
  }

  const handleChangeStatus = (ticketId: string, newStatus: TicketStatus) => {
    changeStatus(ticketId, newStatus)
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket((prev) => (prev ? { ...prev, status: newStatus } : null))
    }
    toast.success(`Ticket status changed to ${newStatus.replace('_', ' ')}`)
  }

  const handleAssign = (ticketId: string) => {
    assignTicket(ticketId)
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket((prev) => (prev ? { ...prev, status: 'in_progress' as TicketStatus } : null))
    }
    toast.success('Ticket assigned to you')
  }

  const handleDeleteSingle = () => {
    if (deleteSingleTicket) {
      deleteTicket(deleteSingleTicket.id)
      toast.success(`Ticket ${deleteSingleTicket.id} deleted`)
      setDeleteSingleOpen(false)
      setDeleteSingleTicket(null)
      if (selectedTicket?.id === deleteSingleTicket.id) {
        setDetailOpen(false)
      }
    }
  }

  // Bulk close
  const handleBulkClose = () => {
    const count = selectedIds.size
    bulkClose(Array.from(selectedIds))
    toast.success(`${count} ticket(s) closed`)
    setSelectedIds(new Set())
    setBulkCloseOpen(false)
  }

  // Bulk delete
  const handleBulkDelete = () => {
    const count = selectedIds.size
    deleteTickets(Array.from(selectedIds))
    toast.success(`${count} ticket(s) deleted`)
    setSelectedIds(new Set())
    setBulkDeleteOpen(false)
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

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBulkCloseOpen(true)}
            className="gap-1"
          >
            Close Selected
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBulkDeleteOpen(true)}
            className="gap-1 text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <Trash2 className="size-3.5" />
            Delete Selected
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedIds(new Set())}
          >
            Clear selection
          </Button>
        </div>
      )}

      {/* Tickets Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.size === filteredTicketIds.length && filteredTicketIds.length > 0}
                      onCheckedChange={() => toggleSelectAll(filteredTicketIds)}
                    />
                  </TableHead>
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
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(ticket.id)}
                        onCheckedChange={() => toggleSelect(ticket.id)}
                      />
                    </TableCell>
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
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => { setDeleteSingleTicket(ticket); setDeleteSingleOpen(true) }}
                              className="text-red-400 focus:text-red-300 focus:bg-red-500/10"
                            >
                              <Trash2 className="mr-2 size-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTickets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                      No tickets match the current filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Close Confirmation */}
      <AlertDialog open={bulkCloseOpen} onOpenChange={setBulkCloseOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close Selected Tickets</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to close <strong>{selectedIds.size}</strong> ticket(s)?
              This will mark them as resolved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkClose}>
              Close Selected
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Tickets</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selectedIds.size}</strong> ticket(s)?
              This will remove them from both admin and user history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700">
              Delete Selected
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Single Confirmation */}
      <AlertDialog open={deleteSingleOpen} onOpenChange={setDeleteSingleOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ticket</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete ticket <strong>{deleteSingleTicket?.id}</strong> — &quot;{deleteSingleTicket?.subject}&quot;?
              This will remove it from both admin and user history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSingle} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
