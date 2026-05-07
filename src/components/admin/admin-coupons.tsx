'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
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
  Ticket,
  Plus,
  Search,
  Edit,
  Eye,
  Trash2,
  ToggleLeft,
  RefreshCcw,
  Download,
  Copy,
  Check,
  XCircle,
  Sparkles,
  Tag,
  Users,
  DollarSign,
  BarChart3,
} from 'lucide-react'
import { mockCoupons, mockPlans, type Coupon } from '@/lib/mock-data'
import { toast } from 'sonner'

function generateCouponCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const seg = () => {
    let r = ''
    for (let i = 0; i < 6; i++) r += chars.charAt(Math.floor(Math.random() * chars.length))
    return r
  }
  return `COREX-${seg()}`
}

export function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([...mockCoupons])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Create/Edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)

  // Form state
  const [formCode, setFormCode] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formType, setFormType] = useState<'percentage' | 'fixed'>('percentage')
  const [formValue, setFormValue] = useState('')
  const [formMinPurchase, setFormMinPurchase] = useState('0')
  const [formMaxDiscount, setFormMaxDiscount] = useState('')
  const [formMaxClaims, setFormMaxClaims] = useState('')
  const [formApplicablePlans, setFormApplicablePlans] = useState<string[]>([])
  const [formExpiry, setFormExpiry] = useState('')
  const [formActive, setFormActive] = useState(true)

  // View Claims dialog
  const [claimsDialogOpen, setClaimsDialogOpen] = useState(false)
  const [claimsCoupon, setClaimsCoupon] = useState<Coupon | null>(null)

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [bulkDeactivateOpen, setBulkDeactivateOpen] = useState(false)

  const filteredCoupons = useMemo(() => {
    if (!searchQuery.trim()) return coupons
    const q = searchQuery.toLowerCase()
    return coupons.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    )
  }, [coupons, searchQuery])

  // Stats
  const totalCoupons = coupons.length
  const activeCoupons = coupons.filter((c) => c.isActive && new Date(c.expiresAt) > new Date()).length
  const totalClaims = coupons.reduce((sum, c) => sum + c.currentClaims, 0)
  const totalDiscount = coupons.reduce(
    (sum, c) => sum + c.claimedBy.reduce((s, cl) => s + cl.discount, 0),
    0
  )

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredCoupons.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredCoupons.map((c) => c.id)))
    }
  }

  const openCreateDialog = () => {
    setEditingCoupon(null)
    setFormCode(generateCouponCode())
    setFormDescription('')
    setFormType('percentage')
    setFormValue('')
    setFormMinPurchase('0')
    setFormMaxDiscount('')
    setFormMaxClaims('')
    setFormApplicablePlans([])
    setFormExpiry('')
    setFormActive(true)
    setEditDialogOpen(true)
  }

  const openEditDialog = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setFormCode(coupon.code)
    setFormDescription(coupon.description)
    setFormType(coupon.type)
    setFormValue(String(coupon.value))
    setFormMinPurchase(String(coupon.minPurchase))
    setFormMaxDiscount(String(coupon.maxDiscount))
    setFormMaxClaims(String(coupon.maxClaims))
    setFormApplicablePlans(coupon.applicablePlans)
    setFormExpiry(coupon.expiresAt)
    setFormActive(coupon.isActive)
    setEditDialogOpen(true)
  }

  const handleSaveCoupon = () => {
    if (!formCode.trim() || !formValue || !formMaxClaims) {
      toast.error('Please fill in all required fields')
      return
    }

    const couponData: Coupon = {
      id: editingCoupon?.id || `coup_${Date.now()}`,
      code: formCode.toUpperCase(),
      description: formDescription,
      type: formType,
      value: parseFloat(formValue),
      minPurchase: parseFloat(formMinPurchase) || 0,
      maxDiscount: parseFloat(formMaxDiscount) || (formType === 'percentage' ? 0 : parseFloat(formValue)),
      maxClaims: parseInt(formMaxClaims),
      currentClaims: editingCoupon?.currentClaims || 0,
      applicablePlans: formApplicablePlans,
      expiresAt: formExpiry || '2099-12-31',
      createdAt: editingCoupon?.createdAt || new Date().toISOString().split('T')[0],
      isActive: formActive,
      claimedBy: editingCoupon?.claimedBy || [],
    }

    if (editingCoupon) {
      setCoupons((prev) => prev.map((c) => (c.id === editingCoupon.id ? couponData : c)))
      toast.success('Coupon updated', { description: `${couponData.code} has been updated.` })
    } else {
      setCoupons((prev) => [couponData, ...prev])
      toast.success('Coupon created', { description: `${couponData.code} has been created.` })
    }

    setEditDialogOpen(false)
  }

  const handleToggleActive = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    )
    const coupon = coupons.find((c) => c.id === id)
    toast.success(coupon?.isActive ? 'Coupon deactivated' : 'Coupon activated', {
      description: `${coupon?.code} has been ${coupon?.isActive ? 'deactivated' : 'activated'}.`,
    })
  }

  const handleDeleteCoupon = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id))
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    setDeleteTarget(null)
    toast.success('Coupon deleted')
  }

  const handleBulkDelete = () => {
    setCoupons((prev) => prev.filter((c) => !selectedIds.has(c.id)))
    setSelectedIds(new Set())
    setBulkDeleteOpen(false)
    toast.success(`${selectedIds.size} coupons deleted`)
  }

  const handleBulkDeactivate = () => {
    setCoupons((prev) =>
      prev.map((c) => (selectedIds.has(c.id) ? { ...c, isActive: false } : c))
    )
    setSelectedIds(new Set())
    setBulkDeactivateOpen(false)
    toast.success('Selected coupons deactivated')
  }

  const openClaimsDialog = (coupon: Coupon) => {
    setClaimsCoupon(coupon)
    setClaimsDialogOpen(true)
  }

  const handleExportCSV = () => {
    if (!claimsCoupon) return
    const headers = 'User,Claimed At,Discount Amount\n'
    const rows = claimsCoupon.claimedBy.map((c) => `${c.userName},${c.claimedAt},$${c.discount.toFixed(2)}`).join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `coupon-${claimsCoupon.code}-claims.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exported!')
  }

  const isExpired = (dateStr: string) => new Date(dateStr) < new Date()

  const statsCards = [
    { title: 'Total Coupons', value: totalCoupons, icon: Ticket, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'Active Coupons', value: activeCoupons, icon: Tag, color: 'text-teal-400', bg: 'bg-teal-500/10' },
    { title: 'Total Claims', value: totalClaims, icon: Users, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { title: 'Total Discount', value: `$${totalDiscount.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ]

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Coupon Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create, manage, and track discount coupons
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="size-4" />
          Create Coupon
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.bg}`}>
                <stat.icon className={`size-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search + Bulk Actions */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search coupons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{selectedIds.size} selected</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setBulkDeactivateOpen(true)}
                >
                  <ToggleLeft className="size-3.5" />
                  Deactivate Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-red-500/30 text-red-400 hover:bg-red-500/10"
                  onClick={() => setBulkDeleteOpen(true)}
                >
                  <Trash2 className="size-3.5" />
                  Delete Selected
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={selectedIds.size === filteredCoupons.length && filteredCoupons.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Code</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead className="hidden lg:table-cell">Min Purchase</TableHead>
                <TableHead>Claims</TableHead>
                <TableHead className="hidden md:table-cell">Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCoupons.map((coupon) => {
                const expired = isExpired(coupon.expiresAt)
                const claimProgress = coupon.maxClaims > 0 ? (coupon.currentClaims / coupon.maxClaims) * 100 : 0
                return (
                  <TableRow key={coupon.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(coupon.id)}
                        onCheckedChange={() => toggleSelect(coupon.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <code className="font-mono font-bold text-sm bg-muted px-2 py-0.5 rounded">
                        {coupon.code}
                      </code>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[200px] truncate">
                      {coupon.description}
                    </TableCell>
                    <TableCell>
                      {coupon.type === 'percentage' ? (
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">%</Badge>
                      ) : (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Fixed</Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value.toFixed(2)}`}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      ${coupon.minPurchase.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 min-w-[80px]">
                        <div className="flex items-center justify-between text-xs">
                          <span>{coupon.currentClaims}/{coupon.maxClaims}</span>
                        </div>
                        <Progress value={claimProgress} className="h-1.5" />
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {coupon.expiresAt}
                    </TableCell>
                    <TableCell>
                      {expired ? (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Expired</Badge>
                      ) : coupon.isActive ? (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Active</Badge>
                      ) : (
                        <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => openEditDialog(coupon)}
                          title="Edit"
                        >
                          <Edit className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => openClaimsDialog(coupon)}
                          title="View Claims"
                        >
                          <Eye className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => handleToggleActive(coupon.id)}
                          title={coupon.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <ToggleLeft className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-red-400"
                          onClick={() => setDeleteTarget(coupon.id)}
                          title="Delete"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredCoupons.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                    No coupons found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Coupon Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="size-5 text-primary" />
              {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
            </DialogTitle>
            <DialogDescription>
              {editingCoupon ? 'Update coupon details below.' : 'Fill in the details to create a new coupon.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Code */}
            <div className="space-y-2">
              <Label>Coupon Code</Label>
              <div className="flex gap-2">
                <Input
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  placeholder="e.g. LAUNCH20"
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  onClick={() => setFormCode(generateCouponCode())}
                  title="Auto-generate code"
                >
                  <Sparkles className="size-4" />
                </Button>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Brief description of this coupon..."
                className="min-h-[60px]"
              />
            </div>

            {/* Type + Value */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Discount Type</Label>
                <Select value={formType} onValueChange={(v: 'percentage' | 'fixed') => setFormType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Discount Value</Label>
                <div className="relative">
                  {formType === 'fixed' && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  )}
                  <Input
                    type="number"
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    placeholder={formType === 'percentage' ? 'e.g. 20' : 'e.g. 5'}
                    className={formType === 'fixed' ? 'pl-7' : ''}
                    min="0"
                  />
                  {formType === 'percentage' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                  )}
                </div>
              </div>
            </div>

            {/* Min Purchase + Max Discount */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Min Purchase ($)</Label>
                <Input
                  type="number"
                  value={formMinPurchase}
                  onChange={(e) => setFormMinPurchase(e.target.value)}
                  min="0"
                  placeholder="0"
                />
              </div>
              {formType === 'percentage' && (
                <div className="space-y-2">
                  <Label>Max Discount ($)</Label>
                  <Input
                    type="number"
                    value={formMaxDiscount}
                    onChange={(e) => setFormMaxDiscount(e.target.value)}
                    min="0"
                    placeholder="No limit"
                  />
                </div>
              )}
            </div>

            {/* Max Claims */}
            <div className="space-y-2">
              <Label>Max Claims</Label>
              <Input
                type="number"
                value={formMaxClaims}
                onChange={(e) => setFormMaxClaims(e.target.value)}
                min="1"
                placeholder="e.g. 100"
              />
            </div>

            {/* Applicable Plans */}
            <div className="space-y-2">
              <Label>Applicable Plans</Label>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="plan-all"
                    checked={formApplicablePlans.length === 0}
                    onCheckedChange={(checked) => {
                      if (checked) setFormApplicablePlans([])
                    }}
                  />
                  <Label htmlFor="plan-all" className="text-sm font-normal cursor-pointer">
                    All Plans
                  </Label>
                </div>
                {mockPlans.map((plan) => (
                  <div key={plan.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`plan-${plan.id}`}
                      checked={formApplicablePlans.includes(plan.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormApplicablePlans((prev) => [...prev, plan.id])
                        } else {
                          setFormApplicablePlans((prev) => prev.filter((p) => p !== plan.id))
                        }
                      }}
                    />
                    <Label htmlFor={`plan-${plan.id}`} className="text-sm font-normal cursor-pointer">
                      {plan.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Expiry + Active */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <Input
                  type="date"
                  value={formExpiry}
                  onChange={(e) => setFormExpiry(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Active</Label>
                <div className="flex items-center gap-3 pt-1">
                  <Switch checked={formActive} onCheckedChange={setFormActive} />
                  <span className="text-sm text-muted-foreground">
                    {formActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCoupon} className="gap-1.5">
              <Check className="size-4" />
              {editingCoupon ? 'Save Changes' : 'Create Coupon'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Claims Dialog */}
      <Dialog open={claimsDialogOpen} onOpenChange={setClaimsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="size-5 text-primary" />
              Claims for {claimsCoupon?.code}
            </DialogTitle>
            <DialogDescription>
              {claimsCoupon?.currentClaims || 0} of {claimsCoupon?.maxClaims || 0} claims used
            </DialogDescription>
          </DialogHeader>

          {claimsCoupon && claimsCoupon.claimedBy.length > 0 ? (
            <div className="space-y-4 py-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Claimed At</TableHead>
                    <TableHead>Discount Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claimsCoupon.claimedBy.map((claim, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{claim.userName}</TableCell>
                      <TableCell>{claim.claimedAt}</TableCell>
                      <TableCell className="text-emerald-400 font-medium">
                        -${claim.discount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Total discount given: <span className="font-medium text-emerald-400">
                    ${claimsCoupon.claimedBy.reduce((s, c) => s + c.discount, 0).toFixed(2)}
                  </span>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExportCSV}>
                  <Download className="size-3.5" />
                  Export CSV
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Users className="size-10 mb-2 opacity-30" />
              <p className="text-sm">No claims yet for this coupon.</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setClaimsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Single Coupon */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Coupon?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The coupon and all its claim history will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && handleDeleteCoupon(deleteTarget)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} Coupons?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All selected coupons and their claim history will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700">
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Deactivate */}
      <AlertDialog open={bulkDeactivateOpen} onOpenChange={setBulkDeactivateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate {selectedIds.size} Coupons?</AlertDialogTitle>
            <AlertDialogDescription>
              Selected coupons will be deactivated and no longer available for use.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDeactivate}>
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
