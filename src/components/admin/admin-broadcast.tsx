'use client'

import React, { useState } from 'react'
import { toast } from 'sonner'
import { mockUsers } from '@/lib/mock-data'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Megaphone, Send, Eye, Trash2 } from 'lucide-react'

interface Broadcast {
  id: string
  title: string
  message: string
  target: string
  type: 'info' | 'warning' | 'update'
  priority: 'normal' | 'high'
  sentAt: string
  status: 'sent' | 'delivered'
}

const mockBroadcasts: Broadcast[] = [
  {
    id: 'bc_001',
    title: 'Scheduled Maintenance',
    message: 'CoreX services will undergo scheduled maintenance on Feb 15, 2025 from 02:00-04:00 UTC. Expect brief interruptions.',
    target: 'All Users',
    type: 'warning',
    priority: 'high',
    sentAt: '2025-02-10 09:00',
    status: 'delivered',
  },
  {
    id: 'bc_002',
    title: 'New Asia Pacific Nodes',
    message: 'We have added 3 new proxy nodes in Singapore, Japan, and Hong Kong. Enjoy improved speeds!',
    target: 'Premium Users Only',
    type: 'update',
    priority: 'normal',
    sentAt: '2025-02-05 14:30',
    status: 'delivered',
  },
  {
    id: 'bc_003',
    title: 'Security Advisory',
    message: 'Please update your CoreX app to the latest version (v2.1.0) to benefit from critical security patches.',
    target: 'All Users',
    type: 'warning',
    priority: 'high',
    sentAt: '2025-01-28 11:00',
    status: 'sent',
  },
  {
    id: 'bc_004',
    title: 'Referral Bonus Weekend',
    message: 'This weekend only: earn double referral credits! Share your code with friends and earn ৳10 per referral.',
    target: 'Free Users Only',
    type: 'info',
    priority: 'normal',
    sentAt: '2025-01-20 08:00',
    status: 'delivered',
  },
]

export function AdminBroadcastPage() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>(mockBroadcasts)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [target, setTarget] = useState('all')
  const [type, setType] = useState<'info' | 'warning' | 'update'>('info')
  const [priority, setPriority] = useState<'normal' | 'high'>('normal')
  const [specificUser, setSpecificUser] = useState('')
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewTarget, setViewTarget] = useState<Broadcast | null>(null)

  const handleSendBroadcast = () => {
    if (!title.trim()) {
      toast.error('Please enter a broadcast title')
      return
    }
    if (!message.trim()) {
      toast.error('Please enter a broadcast message')
      return
    }

    const targetLabel =
      target === 'all'
        ? 'All Users'
        : target === 'premium'
        ? 'Premium Users Only'
        : target === 'free'
        ? 'Free Users Only'
        : `Specific User: ${specificUser}`

    const newBroadcast: Broadcast = {
      id: `bc_${Date.now()}`,
      title,
      message,
      target: targetLabel,
      type,
      priority,
      sentAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'sent',
    }

    setBroadcasts((prev) => [newBroadcast, ...prev])
    setTitle('')
    setMessage('')
    setTarget('all')
    setType('info')
    setPriority('normal')
    setSpecificUser('')
    toast.success('Broadcast sent successfully!')
  }

  const handleDelete = (id: string) => {
    setBroadcasts((prev) => prev.filter((b) => b.id !== id))
    toast.success('Broadcast deleted')
  }

  const handleView = (broadcast: Broadcast) => {
    setViewTarget(broadcast)
    setViewDialogOpen(true)
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'warning':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Warning</Badge>
      case 'update':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Update</Badge>
      default:
        return <Badge variant="secondary">Info</Badge>
    }
  }

  const getPriorityBadge = (p: string) => {
    if (p === 'high') {
      return <Badge variant="destructive">High</Badge>
    }
    return <Badge variant="outline">Normal</Badge>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Megaphone className="size-6 text-primary" />
          Broadcast Center
        </h2>
        <p className="text-muted-foreground">Send notifications and messages to users</p>
      </div>

      {/* Send New Broadcast Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="size-5 text-primary" />
            Send New Broadcast
          </CardTitle>
          <CardDescription>Compose and send a new broadcast message</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bc-title">Title</Label>
            <Input
              id="bc-title"
              placeholder="Broadcast title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bc-message">Message</Label>
            <Textarea
              id="bc-message"
              placeholder="Write your broadcast message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Select value={target} onValueChange={setTarget}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="premium">Premium Users Only</SelectItem>
                  <SelectItem value="free">Free Users Only</SelectItem>
                  <SelectItem value="specific">Specific User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {target === 'specific' && (
              <div className="space-y-2">
                <Label>Search User</Label>
                <Input
                  placeholder="Enter user name or email"
                  value={specificUser}
                  onChange={(e) => setSpecificUser(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as 'info' | 'warning' | 'update')}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as 'normal' | 'high')}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleSendBroadcast} className="w-full sm:w-auto">
            <Send className="size-4 mr-1" />
            Send Broadcast
          </Button>
        </CardContent>
      </Card>

      {/* Broadcast History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Broadcast History</CardTitle>
          <CardDescription>Previously sent broadcasts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Message Preview</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {broadcasts.map((bc) => (
                  <TableRow key={bc.id}>
                    <TableCell className="font-medium">{bc.title}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {bc.message}
                    </TableCell>
                    <TableCell>{bc.target}</TableCell>
                    <TableCell>{getTypeBadge(bc.type)}</TableCell>
                    <TableCell className="text-sm">{bc.sentAt}</TableCell>
                    <TableCell>
                      {bc.status === 'delivered' ? (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Delivered</Badge>
                      ) : (
                        <Badge variant="secondary">Sent</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleView(bc)}>
                          <Eye className="size-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="size-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Broadcast</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete &quot;{bc.title}&quot;? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(bc.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {broadcasts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No broadcasts yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewTarget?.title}</DialogTitle>
            <DialogDescription>Broadcast details</DialogDescription>
          </DialogHeader>
          {viewTarget && (
            <div className="space-y-4 py-2">
              <div className="flex flex-wrap gap-2">
                {getTypeBadge(viewTarget.type)}
                {getPriorityBadge(viewTarget.priority)}
                {viewTarget.status === 'delivered' ? (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Delivered</Badge>
                ) : (
                  <Badge variant="secondary">Sent</Badge>
                )}
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Message</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{viewTarget.message}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Target:</span>{' '}
                  <span className="font-medium">{viewTarget.target}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Sent At:</span>{' '}
                  <span className="font-medium">{viewTarget.sentAt}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
