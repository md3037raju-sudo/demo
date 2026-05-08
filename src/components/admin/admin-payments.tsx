'use client'

import React, { useState } from 'react'
import { usePaymentStore, type PaymentMethod, type BalanceRequest, type RequestStatus } from '@/lib/payment-store'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import {
  Textarea,
} from '@/components/ui/textarea'
import {
  CreditCard,
  Search,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Eye,
  Send,
  DollarSign,
  Clock,
  Bell,
  Trash2,
} from 'lucide-react'

function PaymentStatusBadge({ status }: { status: RequestStatus }) {
  switch (status) {
    case 'pending':
      return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/20">Pending</Badge>
    case 'approved':
      return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20">Approved</Badge>
    case 'rejected':
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/20">Rejected</Badge>
  }
}

function MethodBadge({ method }: { method: PaymentMethod }) {
  if (method === 'bkash') {
    return <Badge className="bg-[#E2136E]/20 text-[#E2136E] border-[#E2136E]/30 hover:bg-[#E2136E]/30">bKash</Badge>
  }
  return <Badge className="bg-[#F6921E]/20 text-[#F6921E] border-[#F6921E]/30 hover:bg-[#F6921E]/30">Nagad</Badge>
}

export function AdminPayments() {
  const { balanceRequests, approveRequest, rejectRequest, bulkApprove, bulkReject, deleteRequest, deleteRequests } = usePaymentStore()

  const [activeTab, setActiveTab] = useState('pending')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // View details dialog
  const [viewPayment, setViewPayment] = useState<BalanceRequest | null>(null)
  const [viewOpen, setViewOpen] = useState(false)

  // Approve/reject single
  const [approvePayment, setApprovePayment] = useState<BalanceRequest | null>(null)
  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectPayment, setRejectPayment] = useState<BalanceRequest | null>(null)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  // Delete single
  const [deleteSinglePayment, setDeleteSinglePayment] = useState<BalanceRequest | null>(null)
  const [deleteSingleOpen, setDeleteSingleOpen] = useState(false)

  // Bulk select
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkApproveOpen, setBulkApproveOpen] = useState(false)
  const [bulkRejectOpen, setBulkRejectOpen] = useState(false)
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

  const pendingPayments = balanceRequests.filter((p) => p.status === 'pending')

  const getFilteredPayments = () => {
    let list = activeTab === 'pending' ? pendingPayments : balanceRequests
    // Apply status filter (only in "all" tab)
    if (activeTab === 'all' && statusFilter !== 'all') {
      list = list.filter((p) => p.status === statusFilter)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (p) =>
          p.userName.toLowerCase().includes(q) ||
          p.trxId.toLowerCase().includes(q) ||
          p.method.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q)
      )
    }
    return list
  }

  const filteredPayments = getFilteredPayments()
  const filteredPaymentIds = filteredPayments.map((p) => p.id)

  const pendingCount = pendingPayments.length
  const approvedCount = balanceRequests.filter((p) => p.status === 'approved').length
  const rejectedCount = balanceRequests.filter((p) => p.status === 'rejected').length

  const handleViewDetails = (payment: BalanceRequest) => {
    setViewPayment(payment)
    setViewOpen(true)
  }

  const handleApprove = () => {
    if (approvePayment) {
      approveRequest(approvePayment.id, 'Verified and approved')
      toast.success(`Payment ${approvePayment.trxId} approved`, {
        description: `৳${approvePayment.amount.toFixed(2)} added to ${approvePayment.userName}'s balance`,
      })
      setApproveOpen(false)
    }
  }

  const handleReject = () => {
    if (rejectPayment) {
      rejectRequest(rejectPayment.id, rejectReason || 'Rejected by admin')
      toast.success(`Payment ${rejectPayment.trxId} rejected`)
      setRejectOpen(false)
      setRejectReason('')
    }
  }

  const handleDeleteSingle = () => {
    if (deleteSinglePayment) {
      deleteRequest(deleteSinglePayment.id)
      toast.success(`Payment ${deleteSinglePayment.trxId} deleted`)
      setDeleteSingleOpen(false)
      setDeleteSinglePayment(null)
    }
  }

  const handleBulkApprove = () => {
    const count = selectedIds.size
    bulkApprove(Array.from(selectedIds))
    toast.success(`${count} payment(s) approved — balances updated`)
    setSelectedIds(new Set())
    setBulkApproveOpen(false)
  }

  const handleBulkReject = () => {
    const count = selectedIds.size
    bulkReject(Array.from(selectedIds))
    toast.success(`${count} payment(s) rejected`)
    setSelectedIds(new Set())
    setBulkRejectOpen(false)
  }

  const handleBulkDelete = () => {
    const count = selectedIds.size
    deleteRequests(Array.from(selectedIds))
    toast.success(`${count} payment(s) deleted`)
    setSelectedIds(new Set())
    setBulkDeleteOpen(false)
  }

  const renderPaymentsTable = (list: BalanceRequest[], showCheckbox = true) => (
    <>
      {/* Bulk Action Bar */}
      {showCheckbox && selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-muted/50 border-b">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          {list.some((p) => selectedIds.has(p.id) && p.status === 'pending') && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkApproveOpen(true)}
                className="gap-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
              >
                <CheckCircle className="size-3.5" />
                Approve Selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkRejectOpen(true)}
                className="gap-1 text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <XCircle className="size-3.5" />
                Reject Selected
              </Button>
            </>
          )}
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
              {showCheckbox && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.size === filteredPaymentIds.length && filteredPaymentIds.length > 0}
                    onCheckedChange={() => toggleSelectAll(filteredPaymentIds)}
                  />
                </TableHead>
              )}
              <TableHead>Transaction ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showCheckbox ? 8 : 7} className="text-center py-8 text-muted-foreground">
                  No payments found
                </TableCell>
              </TableRow>
            ) : (
              list.map((payment) => (
                <TableRow key={payment.id}>
                  {showCheckbox && (
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(payment.id)}
                        onCheckedChange={() => toggleSelect(payment.id)}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-mono text-xs">{payment.trxId}</TableCell>
                  <TableCell className="font-medium">{payment.userName}</TableCell>
                  <TableCell className="font-semibold text-emerald-400">৳{payment.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <MethodBadge method={payment.method} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{payment.submittedAt}</TableCell>
                  <TableCell><PaymentStatusBadge status={payment.status} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {payment.status === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                            onClick={() => { setApprovePayment(payment); setApproveOpen(true) }}
                          >
                            <CheckCircle className="size-3.5" />
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={() => { setRejectPayment(payment); setRejectOpen(true); setRejectReason('') }}
                          >
                            <XCircle className="size-3.5" />
                            Reject
                          </Button>
                        </>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleViewDetails(payment)}>
                            <Eye className="mr-2 size-4" />
                            View Details
                          </DropdownMenuItem>
                          {payment.status === 'pending' && (
                            <>
                              <DropdownMenuItem onClick={() => { setApprovePayment(payment); setApproveOpen(true) }}>
                                <CheckCircle className="mr-2 size-4" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setRejectPayment(payment); setRejectOpen(true); setRejectReason('') }}>
                                <XCircle className="mr-2 size-4" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => { setDeleteSinglePayment(payment); setDeleteSingleOpen(true) }}
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Payment Management</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Review and process user payment submissions. Approved payments add balance automatically.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/15">
                <CreditCard className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{balanceRequests.length}</p>
                <p className="text-xs text-muted-foreground">Total Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/15">
                <Clock className="size-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/15">
                <CheckCircle className="size-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{approvedCount}</p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-red-500/15">
                <XCircle className="size-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{rejectedCount}</p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search + Notification Indicator */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by user, trx ID, or method..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {pendingCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Bell className="size-4 text-amber-400 animate-pulse" />
                <span className="text-sm text-amber-400 font-medium">{pendingCount} Pending Request{pendingCount > 1 ? 's' : ''}</span>
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Send className="size-4 text-emerald-400" />
              <span className="text-sm text-emerald-400 font-medium">Telegram Bot Active</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSelectedIds(new Set()); setStatusFilter('all') }}>
        <div className="flex items-center gap-3 flex-wrap">
          <TabsList>
            <TabsTrigger value="pending">
              Pending
              {pendingCount > 0 && (
                <Badge variant="destructive" className="ml-1.5 text-xs px-1.5 py-0">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">All Payments</TabsTrigger>
          </TabsList>

          {/* Status Filter (visible only in "All" tab) */}
          {activeTab === 'all' && (
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        <TabsContent value="pending">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Pending Payments</CardTitle>
              <CardDescription>Review and approve or reject payment submissions. Approved amounts are added to user balance automatically.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {renderPaymentsTable(filteredPayments, true)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">All Payments</CardTitle>
              <CardDescription>Complete payment history. Use status filter to find approved/rejected/pending payments easily.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {renderPaymentsTable(filteredPayments, true)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Details Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="size-5" />
              Payment Details
            </DialogTitle>
            <DialogDescription>
              Payment submission information
            </DialogDescription>
          </DialogHeader>
          {viewPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Payment ID</p>
                  <p className="text-sm font-mono">{viewPayment.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">User</p>
                  <p className="text-sm font-medium">{viewPayment.userName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Transaction ID</p>
                  <p className="text-sm font-mono">{viewPayment.trxId}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Amount</p>
                  <p className="text-sm font-semibold text-emerald-400">৳{viewPayment.amount.toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Method</p>
                  <MethodBadge method={viewPayment.method} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
                  <PaymentStatusBadge status={viewPayment.status} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Submitted At</p>
                  <p className="text-sm">{viewPayment.submittedAt}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Admin Note</p>
                  <p className="text-sm">{viewPayment.adminNote || 'No notes'}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {viewPayment && viewPayment.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => { setRejectPayment(viewPayment); setRejectOpen(true); setRejectReason('') }}
                  className="gap-1 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <XCircle className="size-4" />
                  Reject
                </Button>
                <Button
                  onClick={() => { setApprovePayment(viewPayment); setApproveOpen(true) }}
                  className="gap-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle className="size-4" />
                  Approve
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation */}
      <AlertDialog open={approveOpen} onOpenChange={setApproveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Approve payment <strong>{approvePayment?.trxId}</strong> for{' '}
              <strong>৳{approvePayment?.amount.toFixed(2)}</strong> from{' '}
              <strong>{approvePayment?.userName}</strong>?
              The amount will be automatically added to their balance.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} className="bg-emerald-600 hover:bg-emerald-700">
              Approve Payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
            <DialogDescription>
              Reject payment {rejectPayment?.trxId} for ৳{rejectPayment?.amount.toFixed(2)} from {rejectPayment?.userName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">Reason for rejection</label>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejecting this payment..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button onClick={handleReject} className="bg-red-600 hover:bg-red-700">Reject Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Single Confirmation */}
      <AlertDialog open={deleteSingleOpen} onOpenChange={setDeleteSingleOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete payment <strong>{deleteSinglePayment?.trxId}</strong>?
              This will remove the record from both admin and user history. This action cannot be undone.
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

      {/* Bulk Approve Confirmation */}
      <AlertDialog open={bulkApproveOpen} onOpenChange={setBulkApproveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Selected Payments</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve <strong>{selectedIds.size}</strong> payment(s)?
              The amounts will be automatically added to the respective users&apos; balances.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkApprove} className="bg-emerald-600 hover:bg-emerald-700">
              Approve Selected
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Reject Confirmation */}
      <AlertDialog open={bulkRejectOpen} onOpenChange={setBulkRejectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Selected Payments</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject <strong>{selectedIds.size}</strong> payment(s)?
              The users will be notified that their payments were rejected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkReject} className="bg-red-600 hover:bg-red-700">
              Reject Selected
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Payments</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selectedIds.size}</strong> payment record(s)?
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
    </div>
  )
}
