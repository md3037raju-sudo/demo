'use client'

import React, { useState } from 'react'
import { mockUsers } from '@/lib/mock-data'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  MoreHorizontal,
  Eye,
  Wallet,
  Shield,
  Ban,
  Pause,
  CheckCircle,
  UserCog,
  ArrowUpRight,
  ArrowDownRight,
  History,
} from 'lucide-react'

type UserStatus = 'active' | 'banned' | 'suspended'
type UserRole = 'user' | 'moderator' | 'admin'

interface BalanceHistoryEntry {
  id: string
  date: string
  type: 'topup' | 'payment' | 'referral' | 'refund'
  description: string
  amount: number
  balanceAfter: number
}

const mockBalanceHistory: BalanceHistoryEntry[] = [
  { id: 'bh_001', date: '2025-02-10', type: 'topup', description: 'bKash Top-up', amount: 100.00, balanceAfter: 249.50 },
  { id: 'bh_002', date: '2025-02-01', type: 'payment', description: 'CoreX Pro - Monthly', amount: -29.99, balanceAfter: 149.50 },
  { id: 'bh_003', date: '2025-01-15', type: 'referral', description: 'Referral Bonus - Lisa Anderson', amount: 5.00, balanceAfter: 179.49 },
  { id: 'bh_004', date: '2025-01-01', type: 'payment', description: 'CoreX Pro - Monthly', amount: -29.99, balanceAfter: 174.49 },
  { id: 'bh_005', date: '2024-12-20', type: 'topup', description: 'Nagad Top-up', amount: 200.00, balanceAfter: 204.48 },
]

interface User {
  id: string
  name: string
  email: string
  provider: string
  role: UserRole
  balance: number
  status: UserStatus
  joinedAt: string
  subscriptions: number
  devices: number
  lastActive: string
}

function StatusBadge({ status }: { status: UserStatus }) {
  switch (status) {
    case 'active':
      return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20">Active</Badge>
    case 'banned':
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/20">Banned</Badge>
    case 'suspended':
      return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/20">Suspended</Badge>
  }
}

function RoleBadge({ role }: { role: UserRole }) {
  switch (role) {
    case 'user':
      return <Badge variant="secondary">User</Badge>
    case 'moderator':
      return <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/30 hover:bg-sky-500/20">Moderator</Badge>
    case 'admin':
      return <Badge className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/20">Admin</Badge>
  }
}

function ProviderBadge({ provider }: { provider: string }) {
  if (provider === 'google') {
    return <Badge variant="outline" className="text-xs">Google</Badge>
  }
  return <Badge variant="outline" className="text-xs bg-sky-500/10 text-sky-400 border-sky-500/30">Telegram</Badge>
}

function isInactive60Days(lastActive: string): boolean {
  const lastActiveDate = new Date(lastActive)
  const sixtyDaysAgo = new Date()
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
  return lastActiveDate < sixtyDaysAgo
}

function BalanceTypeBadge({ type }: { type: BalanceHistoryEntry['type'] }) {
  switch (type) {
    case 'topup':
      return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20">Top-up</Badge>
    case 'payment':
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/20">Payment</Badge>
    case 'referral':
      return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/20">Referral</Badge>
    case 'refund':
      return <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/30 hover:bg-sky-500/20">Refund</Badge>
  }
}

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>(mockUsers as unknown as User[])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  // View Details dialog
  const [viewUser, setViewUser] = useState<User | null>(null)
  const [viewOpen, setViewOpen] = useState(false)

  // Edit Balance dialog
  const [balanceUser, setBalanceUser] = useState<User | null>(null)
  const [balanceOpen, setBalanceOpen] = useState(false)
  const [balanceInput, setBalanceInput] = useState('')
  const [balanceReason, setBalanceReason] = useState('')

  // Ban confirmation
  const [banUser, setBanUser] = useState<User | null>(null)
  const [banOpen, setBanOpen] = useState(false)

  // Suspend confirmation
  const [suspendUser, setSuspendUser] = useState<User | null>(null)
  const [suspendOpen, setSuspendOpen] = useState(false)

  // Activate confirmation
  const [activateUser, setActivateUser] = useState<User | null>(null)
  const [activateOpen, setActivateOpen] = useState(false)

  // Bulk select
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkBanOpen, setBulkBanOpen] = useState(false)
  const [bulkSuspendOpen, setBulkSuspendOpen] = useState(false)
  const [bulkActivateOpen, setBulkActivateOpen] = useState(false)

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

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchQuery === '' ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'inactive_60d'
        ? user.balance === 0 && isInactive60Days(user.lastActive)
        : user.status === statusFilter)
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesStatus && matchesRole
  })

  const filteredUserIds = filteredUsers.map((u) => u.id)

  const handleViewDetails = (user: User) => {
    setViewUser(user)
    setViewOpen(true)
  }

  const handleEditBalance = (user: User) => {
    setBalanceUser(user)
    setBalanceInput(user.balance.toString())
    setBalanceReason('')
    setBalanceOpen(true)
  }

  const handleSaveBalance = () => {
    if (balanceUser) {
      const newBalance = parseFloat(balanceInput)
      if (isNaN(newBalance) || newBalance < 0) {
        toast.error('Please enter a valid balance amount')
        return
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === balanceUser.id ? { ...u, balance: newBalance } : u))
      )
      toast.success(`Balance updated for ${balanceUser.name}`, {
        description: `New balance: ৳${newBalance.toFixed(2)}`,
      })
      setBalanceOpen(false)
    }
  }

  const handleChangeRole = (userId: string, newRole: UserRole) => {
    const user = users.find((u) => u.id === userId)
    if (user) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      )
      toast.success(`Role updated for ${user.name}`, {
        description: `New role: ${newRole.charAt(0).toUpperCase() + newRole.slice(1)}`,
      })
    }
  }

  const handleBanUser = () => {
    if (banUser) {
      setUsers((prev) =>
        prev.map((u) => (u.id === banUser.id ? { ...u, status: 'banned' } : u))
      )
      toast.success(`User ${banUser.name} has been banned`)
      setBanOpen(false)
    }
  }

  const handleSuspendUser = () => {
    if (suspendUser) {
      setUsers((prev) =>
        prev.map((u) => (u.id === suspendUser.id ? { ...u, status: 'suspended' } : u))
      )
      toast.success(`User ${suspendUser.name} has been suspended`)
      setSuspendOpen(false)
    }
  }

  const handleActivateUser = () => {
    if (activateUser) {
      setUsers((prev) =>
        prev.map((u) => (u.id === activateUser.id ? { ...u, status: 'active' } : u))
      )
      toast.success(`User ${activateUser.name} has been activated`)
      setActivateOpen(false)
    }
  }

  // Bulk actions
  const handleBulkBan = () => {
    const count = selectedIds.size
    setUsers((prev) =>
      prev.map((u) => (selectedIds.has(u.id) ? { ...u, status: 'banned' } : u))
    )
    toast.success(`${count} user(s) have been banned`)
    setSelectedIds(new Set())
    setBulkBanOpen(false)
  }

  const handleBulkSuspend = () => {
    const count = selectedIds.size
    setUsers((prev) =>
      prev.map((u) => (selectedIds.has(u.id) ? { ...u, status: 'suspended' } : u))
    )
    toast.success(`${count} user(s) have been suspended`)
    setSelectedIds(new Set())
    setBulkSuspendOpen(false)
  }

  const handleBulkActivate = () => {
    const count = selectedIds.size
    setUsers((prev) =>
      prev.map((u) => (selectedIds.has(u.id) ? { ...u, status: 'active' } : u))
    )
    toast.success(`${count} user(s) have been activated`)
    setSelectedIds(new Set())
    setBulkActivateOpen(false)
  }

  const getPreviousBalance = () => {
    if (!balanceUser) return 0
    return mockBalanceHistory.length > 0 ? mockBalanceHistory[0].balanceAfter : balanceUser.balance
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Manage user accounts, roles, and access permissions
        </p>
      </div>

      {/* Search/Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="inactive_60d">Inactive (60d)</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
              </SelectContent>
            </Select>
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
            onClick={() => setBulkBanOpen(true)}
            className="gap-1 text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <Ban className="size-3.5" />
            Ban Selected
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBulkSuspendOpen(true)}
            className="gap-1 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
          >
            <Pause className="size-3.5" />
            Suspend Selected
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBulkActivateOpen(true)}
            className="gap-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
          >
            <CheckCircle className="size-3.5" />
            Activate Selected
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

      {/* Users Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Users
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({filteredUsers.length} of {users.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.size === filteredUserIds.length && filteredUserIds.length > 0}
                      onCheckedChange={() => toggleSelectAll(filteredUserIds)}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Subs</TableHead>
                  <TableHead className="text-center">Devices</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                      No users found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(user.id)}
                          onCheckedChange={() => toggleSelect(user.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{user.email}</TableCell>
                      <TableCell><ProviderBadge provider={user.provider} /></TableCell>
                      <TableCell><RoleBadge role={user.role} /></TableCell>
                      <TableCell>৳{user.balance.toFixed(2)}</TableCell>
                      <TableCell><StatusBadge status={user.status} /></TableCell>
                      <TableCell className="text-center">{user.subscriptions}</TableCell>
                      <TableCell className="text-center">{user.devices}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{user.joinedAt}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{user.lastActive}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                              <Eye className="mr-2 size-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditBalance(user)}>
                              <Wallet className="mr-2 size-4" />
                              Edit Balance
                            </DropdownMenuItem>
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                <Shield className="mr-2 size-4" />
                                Change Role
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                <DropdownMenuItem
                                  onClick={() => handleChangeRole(user.id, 'user')}
                                  className={user.role === 'user' ? 'font-semibold' : ''}
                                >
                                  {user.role === 'user' && '\u2713 '}User
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleChangeRole(user.id, 'moderator')}
                                  className={user.role === 'moderator' ? 'font-semibold' : ''}
                                >
                                  {user.role === 'moderator' && '\u2713 '}Moderator
                                </DropdownMenuItem>
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSeparator />
                            {user.status === 'active' && (
                              <>
                                <DropdownMenuItem onClick={() => { setBanUser(user); setBanOpen(true) }}>
                                  <Ban className="mr-2 size-4" />
                                  Ban User
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setSuspendUser(user); setSuspendOpen(true) }}>
                                  <Pause className="mr-2 size-4" />
                                  Suspend User
                                </DropdownMenuItem>
                              </>
                            )}
                            {(user.status === 'banned' || user.status === 'suspended') && (
                              <DropdownMenuItem onClick={() => { setActivateUser(user); setActivateOpen(true) }}>
                                <CheckCircle className="mr-2 size-4" />
                                Activate User
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="size-5" />
              User Details
            </DialogTitle>
            <DialogDescription>
              Complete user account information
            </DialogDescription>
          </DialogHeader>
          {viewUser && (
            <div className="space-y-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Name</p>
                  <p className="text-sm font-medium">{viewUser.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Email</p>
                  <p className="text-sm font-medium">{viewUser.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">User ID</p>
                  <p className="text-sm font-mono">{viewUser.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Provider</p>
                  <ProviderBadge provider={viewUser.provider} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Role</p>
                  <RoleBadge role={viewUser.role} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
                  <StatusBadge status={viewUser.status} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Balance</p>
                  <p className="text-sm font-semibold text-emerald-400">৳{viewUser.balance.toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Subscriptions</p>
                  <p className="text-sm">{viewUser.subscriptions}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Devices</p>
                  <p className="text-sm">{viewUser.devices}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Joined</p>
                  <p className="text-sm">{viewUser.joinedAt}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Last Active</p>
                  <p className="text-sm">{viewUser.lastActive}</p>
                </div>
              </div>

              {/* Balance History Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-t pt-4">
                  <History className="size-4 text-muted-foreground" />
                  <h4 className="text-sm font-semibold">Balance History</h4>
                </div>
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Balance After</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockBalanceHistory.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="text-sm text-muted-foreground">{entry.date}</TableCell>
                          <TableCell><BalanceTypeBadge type={entry.type} /></TableCell>
                          <TableCell className="text-sm">{entry.description}</TableCell>
                          <TableCell className="text-right">
                            <span className={`flex items-center justify-end gap-1 font-medium ${entry.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {entry.amount >= 0 ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                              {entry.amount >= 0 ? '+' : ''}{entry.amount.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium">৳{entry.balanceAfter.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Balance Dialog */}
      <Dialog open={balanceOpen} onOpenChange={setBalanceOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Balance</DialogTitle>
            <DialogDescription>
              Adjust the account balance for {balanceUser?.name}
            </DialogDescription>
          </DialogHeader>
          {balanceUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Current Balance</p>
                  <p className="text-sm font-semibold text-emerald-400">৳{balanceUser.balance.toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Previous Balance</p>
                  <p className="text-sm font-medium">৳{getPreviousBalance().toFixed(2)}</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">New Balance</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={balanceInput}
                  onChange={(e) => setBalanceInput(e.target.value)}
                  placeholder="Enter new balance"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Reason for Adjustment</label>
                <Textarea
                  value={balanceReason}
                  onChange={(e) => setBalanceReason(e.target.value)}
                  placeholder="Enter reason for balance adjustment..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setBalanceOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveBalance} className="bg-emerald-600 hover:bg-emerald-700">Save Balance</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban Confirmation */}
      <AlertDialog open={banOpen} onOpenChange={setBanOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ban User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to ban <strong>{banUser?.name}</strong>? They will lose access to their account immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBanUser} className="bg-red-600 hover:bg-red-700">
              Ban User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Suspend Confirmation */}
      <AlertDialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to suspend <strong>{suspendUser?.name}</strong>? Their account will be temporarily disabled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSuspendUser} className="bg-amber-600 hover:bg-amber-700">
              Suspend User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Activate Confirmation */}
      <AlertDialog open={activateOpen} onOpenChange={setActivateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reactivate <strong>{activateUser?.name}</strong>&apos;s account? They will regain full access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleActivateUser} className="bg-emerald-600 hover:bg-emerald-700">
              Activate User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Ban Confirmation */}
      <AlertDialog open={bulkBanOpen} onOpenChange={setBulkBanOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ban Selected Users</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to ban <strong>{selectedIds.size}</strong> user(s)?
              They will lose access to their accounts immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkBan} className="bg-red-600 hover:bg-red-700">
              Ban Selected
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Suspend Confirmation */}
      <AlertDialog open={bulkSuspendOpen} onOpenChange={setBulkSuspendOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend Selected Users</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to suspend <strong>{selectedIds.size}</strong> user(s)?
              Their accounts will be temporarily disabled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkSuspend} className="bg-amber-600 hover:bg-amber-700">
              Suspend Selected
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Activate Confirmation */}
      <AlertDialog open={bulkActivateOpen} onOpenChange={setBulkActivateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate Selected Users</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reactivate <strong>{selectedIds.size}</strong> user(s)?
              They will regain full access to their accounts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkActivate} className="bg-emerald-600 hover:bg-emerald-700">
              Activate Selected
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
