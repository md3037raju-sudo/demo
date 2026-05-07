'use client'

import React, { useState } from 'react'
import { mockSubscriptions, mockRecycleBin } from '@/lib/mock-data'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  MoreHorizontal,
  Pencil,
  XCircle,
  Eye,
  RotateCcw,
  Trash2,
  AlertTriangle,
  CreditCard,
} from 'lucide-react'

type SubStatus = 'active' | 'expired' | 'renewable'

interface Subscription {
  id: string
  userId: string
  userName: string
  name: string
  plan: string
  status: SubStatus
  startDate: string
  expiryDate: string
  price: number
  bandwidthUsed: number
  bandwidthLimit: number
  deepLink: string
}

interface RecycleItem {
  id: string
  subscriptionId: string
  subscriptionName: string
  userId: string
  userName: string
  deletedAt: string
  restoreDeadline: string
  plan: string
  price: number
}

function SubStatusBadge({ status }: { status: SubStatus }) {
  switch (status) {
    case 'active':
      return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20">Active</Badge>
    case 'renewable':
      return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/20">Renewable</Badge>
    case 'expired':
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/20">Expired</Badge>
  }
}

function PlanTypeBadge({ plan }: { plan: string }) {
  if (plan === 'Yearly') {
    return <Badge className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/20">Yearly</Badge>
  }
  return <Badge variant="secondary">Monthly</Badge>
}

export function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(
    mockSubscriptions as unknown as Subscription[]
  )
  const [recycleBin, setRecycleBin] = useState<RecycleItem[]>(
    mockRecycleBin as unknown as RecycleItem[]
  )
  const [activeTab, setActiveTab] = useState('active')

  // View Details dialog
  const [viewSub, setViewSub] = useState<Subscription | null>(null)
  const [viewOpen, setViewOpen] = useState(false)

  // Edit dialog
  const [editSub, setEditSub] = useState<Subscription | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editExpiry, setEditExpiry] = useState('')
  const [editBandwidth, setEditBandwidth] = useState('')

  // Cancel confirmation
  const [cancelSub, setCancelSub] = useState<Subscription | null>(null)
  const [cancelOpen, setCancelOpen] = useState(false)

  // Restore confirmation
  const [restoreItem, setRestoreItem] = useState<RecycleItem | null>(null)
  const [restoreOpen, setRestoreOpen] = useState(false)

  // Permanent delete confirmation
  const [deleteItem, setDeleteItem] = useState<RecycleItem | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  // Bulk select for recycle bin
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkRestoreOpen, setBulkRestoreOpen] = useState(false)
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

  // Filter subscriptions based on tab
  const activeSubs = subscriptions.filter((s) => s.status === 'active' || s.status === 'renewable')
  const allSubs = subscriptions
  const recycleIds = recycleBin.map((r) => r.id)

  const handleViewDetails = (sub: Subscription) => {
    setViewSub(sub)
    setViewOpen(true)
  }

  const handleEdit = (sub: Subscription) => {
    setEditSub(sub)
    setEditExpiry(sub.expiryDate)
    setEditBandwidth(sub.bandwidthLimit.toString())
    setEditOpen(true)
  }

  const handleSaveEdit = () => {
    if (editSub) {
      const newBandwidth = parseFloat(editBandwidth)
      if (isNaN(newBandwidth) || newBandwidth < 0) {
        toast.error('Please enter a valid bandwidth limit')
        return
      }
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.id === editSub.id
            ? { ...s, expiryDate: editExpiry, bandwidthLimit: newBandwidth }
            : s
        )
      )
      toast.success(`Subscription ${editSub.name} updated`, {
        description: `Expiry: ${editExpiry}, Bandwidth: ${newBandwidth} GB`,
      })
      setEditOpen(false)
    }
  }

  const handleCancel = () => {
    if (cancelSub) {
      // Move to recycle bin
      const recycleItem: RecycleItem = {
        id: `del_${Date.now()}`,
        subscriptionId: cancelSub.id,
        subscriptionName: cancelSub.name,
        userId: cancelSub.userId,
        userName: cancelSub.userName,
        deletedAt: new Date().toISOString().split('T')[0],
        restoreDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        plan: cancelSub.plan,
        price: cancelSub.price,
      }
      setRecycleBin((prev) => [...prev, recycleItem])
      // Remove from subscriptions
      setSubscriptions((prev) => prev.filter((s) => s.id !== cancelSub.id))
      toast.success(`Subscription ${cancelSub.name} cancelled and moved to recycle bin`)
      setCancelOpen(false)
    }
  }

  const handleRestore = () => {
    if (restoreItem) {
      // Add back to subscriptions as active
      const restoredSub: Subscription = {
        id: restoreItem.subscriptionId,
        userId: restoreItem.userId,
        userName: restoreItem.userName,
        name: restoreItem.subscriptionName,
        plan: restoreItem.plan,
        status: 'active',
        startDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        price: restoreItem.price,
        bandwidthUsed: 0,
        bandwidthLimit: 100,
        deepLink: `corex://configure/${restoreItem.subscriptionId}`,
      }
      setSubscriptions((prev) => [...prev, restoredSub])
      setRecycleBin((prev) => prev.filter((r) => r.id !== restoreItem.id))
      toast.success(`Subscription ${restoreItem.subscriptionName} restored`, {
        description: 'The subscription has been reactivated for the user.',
      })
      setRestoreOpen(false)
    }
  }

  const handlePermanentDelete = () => {
    if (deleteItem) {
      setRecycleBin((prev) => prev.filter((r) => r.id !== deleteItem.id))
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.delete(deleteItem.id)
        return next
      })
      toast.success(`Subscription ${deleteItem.subscriptionName} permanently deleted`)
      setDeleteOpen(false)
    }
  }

  const handleBulkRestore = () => {
    const items = recycleBin.filter((r) => selectedIds.has(r.id))
    const restoredSubs: Subscription[] = items.map((item) => ({
      id: item.subscriptionId,
      userId: item.userId,
      userName: item.userName,
      name: item.subscriptionName,
      plan: item.plan,
      status: 'active' as SubStatus,
      startDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      price: item.price,
      bandwidthUsed: 0,
      bandwidthLimit: 100,
      deepLink: `corex://configure/${item.subscriptionId}`,
    }))
    setSubscriptions((prev) => [...prev, ...restoredSubs])
    setRecycleBin((prev) => prev.filter((r) => !selectedIds.has(r.id)))
    toast.success(`${items.length} subscription(s) restored`)
    setSelectedIds(new Set())
    setBulkRestoreOpen(false)
  }

  const handleBulkDelete = () => {
    const count = selectedIds.size
    setRecycleBin((prev) => prev.filter((r) => !selectedIds.has(r.id)))
    toast.success(`${count} subscription(s) permanently deleted`)
    setSelectedIds(new Set())
    setBulkDeleteOpen(false)
  }

  const isPastDeadline = (deadline: string) => {
    return new Date(deadline) < new Date()
  }

  const renderSubscriptionsTable = (subs: Subscription[]) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Plan Name</TableHead>
            <TableHead>Plan Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Expiry</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Bandwidth Used</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                No subscriptions found
              </TableCell>
            </TableRow>
          ) : (
            subs.map((sub) => {
              const bandwidthPct = Math.round((sub.bandwidthUsed / sub.bandwidthLimit) * 100)
              return (
                <TableRow key={sub.id}>
                  <TableCell className="font-mono text-xs">{sub.id}</TableCell>
                  <TableCell className="font-medium">{sub.userName}</TableCell>
                  <TableCell>{sub.name}</TableCell>
                  <TableCell><PlanTypeBadge plan={sub.plan} /></TableCell>
                  <TableCell><SubStatusBadge status={sub.status} /></TableCell>
                  <TableCell className="text-muted-foreground text-sm">{sub.startDate}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{sub.expiryDate}</TableCell>
                  <TableCell className="font-medium">${sub.price.toFixed(2)}</TableCell>
                  <TableCell className="min-w-[180px]">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>{sub.bandwidthUsed} / {sub.bandwidthLimit} GB</span>
                        <span className="text-muted-foreground">{bandwidthPct}%</span>
                      </div>
                      <Progress
                        value={bandwidthPct}
                        className={`h-2 ${
                          bandwidthPct > 90
                            ? '[&>[data-slot=progress-indicator]]:bg-red-500'
                            : bandwidthPct > 70
                            ? '[&>[data-slot=progress-indicator]]:bg-amber-500'
                            : '[&>[data-slot=progress-indicator]]:bg-emerald-500'
                        }`}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleEdit(sub)}>
                          <Pencil className="mr-2 size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewDetails(sub)}>
                          <Eye className="mr-2 size-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => { setCancelSub(sub); setCancelOpen(true) }}
                          variant="destructive"
                        >
                          <XCircle className="mr-2 size-4" />
                          Cancel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Subscription Management</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Manage subscription plans, billing, and renewal settings
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSelectedIds(new Set()) }}>
        <TabsList>
          <TabsTrigger value="active">
            Active
            <Badge variant="secondary" className="ml-1.5 text-xs px-1.5 py-0">
              {activeSubs.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="recycle">
            Recycle Bin
            {recycleBin.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-xs px-1.5 py-0">
                {recycleBin.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Active Tab */}
        <TabsContent value="active">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Active &amp; Renewable Subscriptions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {renderSubscriptionsTable(activeSubs)}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Tab */}
        <TabsContent value="all">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">All Subscriptions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {renderSubscriptionsTable(allSubs)}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recycle Bin Tab */}
        <TabsContent value="recycle">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="size-4 text-amber-500" />
                  Recycle Bin
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Deleted subscriptions are auto-removed after 3 days
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Bulk Action Bar */}
              {selectedIds.size > 0 && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 border-b">
                  <span className="text-sm font-medium">{selectedIds.size} selected</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBulkRestoreOpen(true)}
                    className="gap-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                  >
                    <RotateCcw className="size-3.5" />
                    Restore Selected
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedIds.size === recycleIds.length && recycleIds.length > 0}
                          onCheckedChange={() => toggleSelectAll(recycleIds)}
                        />
                      </TableHead>
                      <TableHead>Subscription Name</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Deleted At</TableHead>
                      <TableHead>Restore Deadline</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recycleBin.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No deleted subscriptions in the recycle bin
                        </TableCell>
                      </TableRow>
                    ) : (
                      recycleBin.map((item) => {
                        const pastDeadline = isPastDeadline(item.restoreDeadline)
                        return (
                          <TableRow key={item.id} className={pastDeadline ? 'opacity-60' : ''}>
                            <TableCell>
                              <Checkbox
                                checked={selectedIds.has(item.id)}
                                onCheckedChange={() => toggleSelect(item.id)}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{item.subscriptionName}</TableCell>
                            <TableCell>{item.userName}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">{item.deletedAt}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{item.restoreDeadline}</span>
                                {pastDeadline && (
                                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/20">
                                    Expired
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">${item.price.toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 gap-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                                  onClick={() => { setRestoreItem(item); setRestoreOpen(true) }}
                                  disabled={pastDeadline}
                                >
                                  <RotateCcw className="size-3.5" />
                                  Restore
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 gap-1 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                  onClick={() => { setDeleteItem(item); setDeleteOpen(true) }}
                                >
                                  <Trash2 className="size-3.5" />
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Details Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="size-5" />
              Subscription Details
            </DialogTitle>
            <DialogDescription>
              Complete subscription information
            </DialogDescription>
          </DialogHeader>
          {viewSub && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Subscription ID</p>
                  <p className="text-sm font-mono">{viewSub.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">User</p>
                  <p className="text-sm font-medium">{viewSub.userName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Plan Name</p>
                  <p className="text-sm">{viewSub.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Plan Type</p>
                  <PlanTypeBadge plan={viewSub.plan} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
                  <SubStatusBadge status={viewSub.status} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Price</p>
                  <p className="text-sm font-semibold text-emerald-400">${viewSub.price.toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Start Date</p>
                  <p className="text-sm">{viewSub.startDate}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Expiry Date</p>
                  <p className="text-sm">{viewSub.expiryDate}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Bandwidth Usage</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span>{viewSub.bandwidthUsed} / {viewSub.bandwidthLimit} GB</span>
                      <span className="text-muted-foreground">
                        {Math.round((viewSub.bandwidthUsed / viewSub.bandwidthLimit) * 100)}%
                      </span>
                    </div>
                    <Progress
                      value={Math.round((viewSub.bandwidthUsed / viewSub.bandwidthLimit) * 100)}
                      className="h-2"
                    />
                  </div>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Deep Link</p>
                  <p className="text-sm font-mono text-muted-foreground">{viewSub.deepLink}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Subscription Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
            <DialogDescription>
              Extend validity date and adjust bandwidth for {editSub?.name}
            </DialogDescription>
          </DialogHeader>
          {editSub && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Expiry Date</label>
                <Input
                  type="date"
                  value={editExpiry}
                  onChange={(e) => setEditExpiry(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Current: {editSub.expiryDate}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Bandwidth Limit (GB)</label>
                <Input
                  type="number"
                  min="0"
                  value={editBandwidth}
                  onChange={(e) => setEditBandwidth(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Current: {editSub.bandwidthLimit} GB (Used: {editSub.bandwidthUsed} GB)
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit} className="bg-emerald-600 hover:bg-emerald-700">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription Confirmation */}
      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel <strong>{cancelSub?.name}</strong> for{' '}
              <strong>{cancelSub?.userName}</strong>? This will move the subscription to the recycle bin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-red-600 hover:bg-red-700">
              Cancel Subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Confirmation */}
      <AlertDialog open={restoreOpen} onOpenChange={setRestoreOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Restore <strong>{restoreItem?.subscriptionName}</strong> for{' '}
              <strong>{restoreItem?.userName}</strong>? It will be reactivated for the user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore} className="bg-emerald-600 hover:bg-emerald-700">
              Restore Subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Permanent Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{' '}
              <strong>{deleteItem?.subscriptionName}</strong> for{' '}
              <strong>{deleteItem?.userName}</strong> and remove it from the recycle bin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePermanentDelete} className="bg-red-600 hover:bg-red-700">
              Permanently Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Restore Confirmation */}
      <AlertDialog open={bulkRestoreOpen} onOpenChange={setBulkRestoreOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Selected Subscriptions</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restore <strong>{selectedIds.size}</strong> subscription(s)?
              They will be reactivated for their respective users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkRestore} className="bg-emerald-600 hover:bg-emerald-700">
              Restore Selected
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete Selected</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{' '}
              <strong>{selectedIds.size}</strong> subscription(s) and remove them from the recycle bin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700">
              Permanently Delete Selected
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
