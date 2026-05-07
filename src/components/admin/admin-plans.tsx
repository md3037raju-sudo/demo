'use client'

import { useState, useMemo } from 'react'
import {
  mockPlans,
  mockProxyPresets,
  type Plan,
  type PlanDuration,
  type DevicePricing,
  getDurationLabel,
  calculateDevicePrice,
  getPerDeviceCost,
  getSavingsPercent,
  defaultDevicePricing,
} from '@/lib/mock-data'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
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
  Plus,
  Pencil,
  Trash2,
  Copy,
  Zap,
  Gauge,
  HardDrive,
  Users,
  Star,
  Check,
  ArrowUpDown,
  Filter,
  BarChart3,
  DollarSign,
  Sparkles,
  Wifi,
  X,
  Activity,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react'

// ─── Form default ────────────────────────────────────────────────
interface PlanForm {
  name: string
  description: string
  speed: string
  bandwidthType: 'unlimited' | 'limited'
  bandwidthLimit: string
  duration: PlanDuration
  basePrice: number
  devicePricing: DevicePricing
  proxyPresetId: string
  features: string
  isFeatured: boolean
  isActive: boolean
}

const defaultForm: PlanForm = {
  name: '',
  description: '',
  speed: '',
  bandwidthType: 'limited',
  bandwidthLimit: '50 GB',
  duration: '30d',
  basePrice: 0,
  devicePricing: { ...defaultDevicePricing },
  proxyPresetId: 'auto',
  features: '',
  isFeatured: false,
  isActive: true,
}

const DURATIONS: PlanDuration[] = ['3d', '7d', '15d', '30d', '6m', '1y']

// ─── Component ───────────────────────────────────────────────────
export function AdminPlans() {
  // Plan list (local state, initialized from mock)
  const [plans, setPlans] = useState<Plan[]>(() =>
    mockPlans.map((p) => ({ ...p, devicePricing: { ...p.devicePricing }, features: [...p.features] }))
  )

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Filter / Sort
  const [filterDuration, setFilterDuration] = useState<string>('all')
  const [filterBandwidth, setFilterBandwidth] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  const [searchQuery, setSearchQuery] = useState('')

  // Dialogs
  const [planDialogOpen, setPlanDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [planForm, setPlanForm] = useState<PlanForm>(defaultForm)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null)
  const [deletingPlanName, setDeletingPlanName] = useState('')

  // Bulk delete confirmation
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)

  // ── Filtered & sorted plans ──────────────────────────────────
  const filteredPlans = useMemo(() => {
    let result = [...plans]

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.features.some((f) => f.toLowerCase().includes(q))
      )
    }

    // Filter: duration
    if (filterDuration !== 'all') {
      result = result.filter((p) => p.duration === filterDuration)
    }

    // Filter: bandwidth type
    if (filterBandwidth !== 'all') {
      result = result.filter((p) => p.bandwidthType === filterBandwidth)
    }

    // Filter: status
    if (filterStatus === 'active') {
      result = result.filter((p) => p.isActive)
    } else if (filterStatus === 'inactive') {
      result = result.filter((p) => !p.isActive)
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.basePrice - b.basePrice)
        break
      case 'price-desc':
        result.sort((a, b) => b.basePrice - a.basePrice)
        break
      case 'subscribers':
        result.sort((a, b) => b.subscribers - a.subscribers)
        break
      case 'name':
      default:
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    return result
  }, [plans, searchQuery, filterDuration, filterBandwidth, filterStatus, sortBy])

  // ── Stats ────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const active = plans.filter((p) => p.isActive)
    const inactive = plans.filter((p) => !p.isActive)
    const totalSubs = plans.reduce((sum, p) => sum + p.subscribers, 0)
    const mostPopular = plans.reduce((max, p) => (p.subscribers > max.subscribers ? p : max), plans[0])
    const revenue = active.reduce(
      (sum, p) => sum + p.basePrice * p.subscribers,
      0
    )
    return { total: plans.length, active: active.length, inactive: inactive.length, totalSubs, mostPopular, revenue }
  }, [plans])

  // ── Selection helpers ────────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredPlans.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredPlans.map((p) => p.id)))
    }
  }

  // ── Plan CRUD ────────────────────────────────────────────────
  const openCreatePlan = () => {
    setEditingPlan(null)
    setPlanForm(defaultForm)
    setPlanDialogOpen(true)
  }

  const openEditPlan = (plan: Plan) => {
    setEditingPlan(plan)
    setPlanForm({
      name: plan.name,
      description: plan.description,
      speed: plan.speed,
      bandwidthType: plan.bandwidthType,
      bandwidthLimit: plan.bandwidthLimit,
      duration: plan.duration,
      basePrice: plan.basePrice,
      devicePricing: { ...plan.devicePricing },
      proxyPresetId: plan.proxyPresetId ?? 'auto',
      features: plan.features.join(', '),
      isFeatured: plan.isFeatured,
      isActive: plan.isActive,
    })
    setPlanDialogOpen(true)
  }

  const clonePlan = (plan: Plan) => {
    const newPlan: Plan = {
      ...plan,
      id: `plan_${Date.now()}`,
      name: `${plan.name} (Copy)`,
      subscribers: 0,
      features: [...plan.features],
      devicePricing: { ...plan.devicePricing },
      createdAt: new Date().toISOString().split('T')[0],
    }
    setPlans((prev) => [...prev, newPlan])
    toast.success(`Cloned "${plan.name}" as "${newPlan.name}"`)
  }

  const savePlan = () => {
    if (!planForm.name.trim()) {
      toast.error('Plan name is required')
      return
    }
    if (!planForm.speed.trim()) {
      toast.error('Speed is required')
      return
    }
    if (planForm.basePrice <= 0) {
      toast.error('Base price must be greater than 0')
      return
    }

    const featuresList = planForm.features
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean)

    if (editingPlan) {
      setPlans((prev) =>
        prev.map((p) =>
          p.id === editingPlan.id
            ? {
                ...p,
                name: planForm.name,
                description: planForm.description,
                speed: planForm.speed,
                bandwidthType: planForm.bandwidthType,
                bandwidthLimit: planForm.bandwidthType === 'unlimited' ? 'Unlimited' : planForm.bandwidthLimit,
                duration: planForm.duration,
                basePrice: planForm.basePrice,
                devicePricing: { ...planForm.devicePricing },
                proxyPresetId: planForm.proxyPresetId === 'none' ? null : planForm.proxyPresetId === 'auto' ? 'auto' : planForm.proxyPresetId,
                features: featuresList,
                isFeatured: planForm.isFeatured,
                isActive: planForm.isActive,
              }
            : p
        )
      )
      toast.success('Plan updated successfully')
    } else {
      const newPlan: Plan = {
        id: `plan_${Date.now()}`,
        name: planForm.name,
        description: planForm.description,
        speed: planForm.speed,
        bandwidthType: planForm.bandwidthType,
        bandwidthLimit: planForm.bandwidthType === 'unlimited' ? 'Unlimited' : planForm.bandwidthLimit,
        duration: planForm.duration,
        basePrice: planForm.basePrice,
        devicePricing: { ...planForm.devicePricing },
        maxDevices: 5,
        isActive: planForm.isActive,
        isFeatured: planForm.isFeatured,
        subscribers: 0,
        proxyPresetId: planForm.proxyPresetId === 'none' ? null : planForm.proxyPresetId === 'auto' ? 'auto' : planForm.proxyPresetId,
        features: featuresList,
        createdAt: new Date().toISOString().split('T')[0],
      }
      setPlans((prev) => [...prev, newPlan])
      toast.success('Plan created successfully')
    }
    setPlanDialogOpen(false)
  }

  const confirmDeletePlan = (id: string) => {
    const plan = plans.find((p) => p.id === id)
    setDeletingPlanId(id)
    setDeletingPlanName(plan?.name ?? '')
    setDeleteDialogOpen(true)
  }

  const deletePlan = () => {
    setPlans((prev) => prev.filter((p) => p.id !== deletingPlanId))
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(deletingPlanId!)
      return next
    })
    setDeleteDialogOpen(false)
    toast.success('Plan deleted')
  }

  // ── Bulk actions ─────────────────────────────────────────────
  const bulkActivate = () => {
    setPlans((prev) =>
      prev.map((p) => (selectedIds.has(p.id) ? { ...p, isActive: true } : p))
    )
    toast.success(`${selectedIds.size} plan(s) activated`)
    setSelectedIds(new Set())
  }

  const bulkDeactivate = () => {
    setPlans((prev) =>
      prev.map((p) => (selectedIds.has(p.id) ? { ...p, isActive: false } : p))
    )
    toast.success(`${selectedIds.size} plan(s) deactivated`)
    setSelectedIds(new Set())
  }

  const bulkDelete = () => {
    setPlans((prev) => prev.filter((p) => !selectedIds.has(p.id)))
    toast.success(`${selectedIds.size} plan(s) deleted`)
    setSelectedIds(new Set())
    setBulkDeleteDialogOpen(false)
  }

  // ── Device pricing update helper ─────────────────────────────
  const updateDevicePricing = (devices: number, percentage: number) => {
    setPlanForm((f) => ({
      ...f,
      devicePricing: { ...f.devicePricing, [devices]: percentage },
    }))
  }

  // ─── RENDER ──────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Plan Management</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage subscription plans with device-based pricing
          </p>
        </div>
        <Button onClick={openCreatePlan} className="gap-2">
          <Plus className="size-4" />
          Create New Plan
        </Button>
      </div>

      {/* ── Stats Bar ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <Zap className="size-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Plans</p>
              <p className="text-xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">
                {stats.active} active / {stats.inactive} inactive
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Users className="size-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Subscribers</p>
              <p className="text-xl font-bold">{stats.totalSubs}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Star className="size-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Most Popular</p>
              <p className="text-lg font-bold truncate max-w-[120px]">
                {stats.mostPopular?.name ?? '—'}
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.mostPopular?.subscribers ?? 0} subs
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-rose-500/10">
              <DollarSign className="size-5 text-rose-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Revenue Est.</p>
              <p className="text-xl font-bold">৳{stats.revenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">base × subs</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-purple-500/10">
              <TrendingUp className="size-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Featured</p>
              <p className="text-xl font-bold">{plans.filter((p) => p.isFeatured).length}</p>
              <p className="text-xs text-muted-foreground">highlighted</p>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Filter / Sort / Search ────────────────────────────── */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[180px]">
            <Label className="text-xs text-muted-foreground">Search</Label>
            <Input
              placeholder="Search plans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Duration filter */}
          <div className="min-w-[140px]">
            <Label className="text-xs text-muted-foreground">Duration</Label>
            <Select value={filterDuration} onValueChange={setFilterDuration}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Durations</SelectItem>
                {DURATIONS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {getDurationLabel(d)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bandwidth filter */}
          <div className="min-w-[140px]">
            <Label className="text-xs text-muted-foreground">Bandwidth</Label>
            <Select value={filterBandwidth} onValueChange={setFilterBandwidth}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="unlimited">Unlimited</SelectItem>
                <SelectItem value="limited">Limited</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status filter */}
          <div className="min-w-[140px]">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <div className="min-w-[160px]">
            <Label className="text-xs text-muted-foreground">Sort By</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="mt-1">
                <ArrowUpDown className="size-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="price-asc">Price (Low → High)</SelectItem>
                <SelectItem value="price-desc">Price (High → Low)</SelectItem>
                <SelectItem value="subscribers">Subscribers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* ── Bulk Actions Bar ───────────────────────────────────── */}
      {selectedIds.size > 0 && (
        <Card className="p-4 border-emerald-500/30 bg-emerald-500/5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={selectedIds.size === filteredPlans.length && filteredPlans.length > 0}
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-sm font-medium">
                {selectedIds.size} plan(s) selected
              </span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-1.5" onClick={bulkActivate}>
                <Activity className="size-3.5" />
                Activate
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5" onClick={bulkDeactivate}>
                <X className="size-3.5" />
                Deactivate
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="gap-1.5"
                onClick={() => setBulkDeleteDialogOpen(true)}
              >
                <Trash2 className="size-3.5" />
                Delete
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ── Select All Row (when no bulk bar) ──────────────────── */}
      {selectedIds.size === 0 && filteredPlans.length > 0 && (
        <div className="flex items-center gap-3 px-1">
          <Checkbox
            checked={false}
            onCheckedChange={toggleSelectAll}
          />
          <span className="text-xs text-muted-foreground">Select all plans</span>
        </div>
      )}

      {/* ── Plan Cards Grid ────────────────────────────────────── */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPlans.map((plan) => {
          const isSelected = selectedIds.has(plan.id)
          const presetName = plan.proxyPresetId && plan.proxyPresetId !== 'auto'
            ? mockProxyPresets.find((p) => p.id === plan.proxyPresetId)?.name ?? 'Unknown'
            : null

          return (
            <Card
              key={plan.id}
              className={`relative overflow-hidden transition-colors ${
                plan.isActive
                  ? isSelected
                    ? 'border-emerald-500 ring-1 ring-emerald-500/30'
                    : 'hover:border-emerald-500/50'
                  : 'opacity-70'
              } ${plan.isFeatured ? 'ring-1 ring-amber-500/40' : ''}`}
            >
              {/* Top color strip */}
              <div
                className={`absolute top-0 left-0 h-1 w-full ${
                  plan.isFeatured
                    ? 'bg-gradient-to-r from-amber-400 to-amber-600'
                    : plan.isActive
                    ? 'bg-emerald-500'
                    : 'bg-gray-500'
                }`}
              />

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelect(plan.id)}
                    />
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {plan.name}
                        {plan.isFeatured && (
                          <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20 text-[10px] px-1.5 py-0">
                            <Star className="size-3 mr-0.5" />
                            Featured
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1 line-clamp-1">
                        {plan.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-0.5 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => openEditPlan(plan)}
                    >
                      <Pencil className="size-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => clonePlan(plan)}
                    >
                      <Copy className="size-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-red-500 hover:text-red-400"
                      onClick={() => confirmDeletePlan(plan.id)}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                {/* Badges row */}
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant={plan.isActive ? 'default' : 'secondary'} className="text-[10px]">
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge
                    className={`text-[10px] ${
                      plan.bandwidthType === 'unlimited'
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    }`}
                    variant="outline"
                  >
                    {plan.bandwidthType === 'unlimited' ? 'Unlimited' : 'Limited'}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {getDurationLabel(plan.duration)}
                  </Badge>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">৳{plan.basePrice}</span>
                  <span className="text-xs text-muted-foreground">base / 1 device</span>
                </div>

                {/* Info row */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Gauge className="size-3.5 text-emerald-500 shrink-0" />
                    <span>Speed: <span className="font-medium">{plan.speed}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <HardDrive className="size-3.5 text-emerald-500 shrink-0" />
                    <span>Bandwidth: <span className="font-medium">{plan.bandwidthLimit}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {plan.proxyPresetId === 'auto' ? (
                      <>
                        <Sparkles className="size-3.5 text-primary shrink-0" />
                        <span>Preset: <span className="font-medium text-primary">Auto-assign</span></span>
                      </>
                    ) : presetName ? (
                      <>
                        <Wifi className="size-3.5 text-emerald-500 shrink-0" />
                        <span>Preset: <span className="font-medium">{presetName}</span></span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="size-3.5 text-amber-500 shrink-0" />
                        <span className="text-amber-600 dark:text-amber-400">Preset: <span className="font-medium">Not assigned</span></span>
                      </>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Device pricing table */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Device Pricing</p>
                  <div className="space-y-1.5">
                    {[1, 2, 3, 4, 5].map((d) => {
                      const price = calculateDevicePrice(plan.basePrice, plan.devicePricing, d)
                      const perDevice = getPerDeviceCost(price, d)
                      const savings = getSavingsPercent(plan.basePrice, plan.devicePricing, d)
                      return (
                        <div
                          key={d}
                          className="flex items-center justify-between text-xs rounded-md px-2 py-1 bg-muted/50"
                        >
                          <span className="text-muted-foreground">
                            {d} device{d > 1 ? 's' : ''}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">৳{price.toFixed(0)}</span>
                            {d > 1 && (
                              <>
                                <span className="text-muted-foreground">
                                  (৳{perDevice.toFixed(0)}/ea)
                                </span>
                                {savings > 0 && (
                                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px] px-1 py-0">
                                    -{savings}%
                                  </Badge>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <Separator />

                {/* Features */}
                {plan.features.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">Features</p>
                    <div className="flex flex-wrap gap-1">
                      {plan.features.map((f, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px]">
                          <Check className="size-2.5 mr-0.5 text-emerald-500" />
                          {f}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subscriber count */}
                <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
                  <Users className="size-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{plan.subscribers}</span>{' '}
                    subscriber{plan.subscribers !== 1 ? 's' : ''}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* ── Empty state ────────────────────────────────────────── */}
      {filteredPlans.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Zap className="mx-auto mb-3 size-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              {plans.length === 0
                ? 'No plans yet. Create one to get started.'
                : 'No plans match your filters.'}
            </p>
            {plans.length > 0 && (
              <Button
                variant="outline"
                className="mt-3"
                onClick={() => {
                  setSearchQuery('')
                  setFilterDuration('all')
                  setFilterBandwidth('all')
                  setFilterStatus('all')
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Create/Edit Plan Dialog ────────────────────────────── */}
      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Edit Plan' : 'Create New Plan'}</DialogTitle>
            <DialogDescription>
              {editingPlan ? 'Update plan details and device pricing' : 'Define a new subscription plan with device-based pricing'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {/* Name & Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plan-name">Name *</Label>
                <Input
                  id="plan-name"
                  value={planForm.name}
                  onChange={(e) => setPlanForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g., CoreX Pro"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-desc">Description</Label>
                <Input
                  id="plan-desc"
                  value={planForm.description}
                  onChange={(e) => setPlanForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="e.g., Most popular plan"
                />
              </div>
            </div>

            {/* Speed & Bandwidth */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plan-speed">Speed *</Label>
                <Input
                  id="plan-speed"
                  value={planForm.speed}
                  onChange={(e) => setPlanForm((f) => ({ ...f, speed: e.target.value }))}
                  placeholder="e.g., 50 Mbps"
                />
              </div>
              <div className="space-y-2">
                <Label>Bandwidth Type</Label>
                <Select
                  value={planForm.bandwidthType}
                  onValueChange={(v) =>
                    setPlanForm((f) => ({
                      ...f,
                      bandwidthType: v as 'unlimited' | 'limited',
                      bandwidthLimit: v === 'unlimited' ? 'Unlimited' : f.bandwidthLimit,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="limited">Limited</SelectItem>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-bw-limit">Bandwidth Limit</Label>
                <Input
                  id="plan-bw-limit"
                  value={planForm.bandwidthLimit}
                  onChange={(e) => setPlanForm((f) => ({ ...f, bandwidthLimit: e.target.value }))}
                  placeholder="e.g., 200 GB"
                  disabled={planForm.bandwidthType === 'unlimited'}
                />
              </div>
            </div>

            {/* Duration & Base Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration</Label>
                <Select
                  value={planForm.duration}
                  onValueChange={(v) =>
                    setPlanForm((f) => ({ ...f, duration: v as PlanDuration }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATIONS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {getDurationLabel(d)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-base-price">Base Price (৳) — 1 device</Label>
                <Input
                  id="plan-base-price"
                  type="number"
                  min={0}
                  step={1}
                  value={planForm.basePrice}
                  onChange={(e) =>
                    setPlanForm((f) => ({
                      ...f,
                      basePrice: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>

            <Separator />

            {/* Device Pricing Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <Label className="text-sm font-semibold">Device Pricing</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Percentage of base price for each device tier
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() =>
                    setPlanForm((f) => ({ ...f, devicePricing: { ...defaultDevicePricing } }))
                  }
                >
                  Reset to Default
                </Button>
              </div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((d) => {
                  const pct = planForm.devicePricing[d] ?? defaultDevicePricing[d]
                  const calculatedPrice = calculateDevicePrice(planForm.basePrice, planForm.devicePricing, d)
                  const perDevice = getPerDeviceCost(calculatedPrice, d)
                  const savings = getSavingsPercent(planForm.basePrice, planForm.devicePricing, d)
                  return (
                    <div key={d} className="flex items-center gap-3">
                      <span className="text-sm font-medium w-24 shrink-0">
                        {d} device{d > 1 ? 's' : ''}
                      </span>
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          type="number"
                          min={0}
                          max={500}
                          value={pct}
                          onChange={(e) =>
                            updateDevicePricing(d, parseInt(e.target.value) || 0)
                          }
                          className="w-20 text-sm"
                        />
                        <span className="text-xs text-muted-foreground">% of base</span>
                      </div>
                      <div className="text-right min-w-[100px]">
                        <span className="text-sm font-semibold">৳{calculatedPrice.toFixed(0)}</span>
                        {d > 1 && (
                          <div className="flex items-center gap-1 justify-end">
                            <span className="text-[10px] text-muted-foreground">
                              ৳{perDevice.toFixed(0)}/ea
                            </span>
                            {savings > 0 && (
                              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px] px-1 py-0">
                                -{savings}%
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <Separator />

            {/* Proxy Preset */}
            <div className="space-y-2">
              <Label>Proxy Preset</Label>
              <Select
                value={planForm.proxyPresetId}
                onValueChange={(v) =>
                  setPlanForm((f) => ({ ...f, proxyPresetId: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto (System assigns best preset)</SelectItem>
                  <SelectItem value="none">None (No preset)</SelectItem>
                  {mockProxyPresets.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} — {p.subgroups.length} subgroup{p.subgroups.length !== 1 ? 's' : ''}, {p.assignedUsers} users
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {planForm.proxyPresetId === 'auto' && (
                <div className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/10 p-3 mt-1">
                  <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-primary">Auto-assign Preset</p>
                    <p className="text-xs text-muted-foreground">
                      The system will automatically assign the best proxy preset to each user based on their location and load balancing. Users won&apos;t see any preset details — they&apos;ll just get connected automatically.
                    </p>
                  </div>
                </div>
              )}
              {planForm.proxyPresetId === 'none' && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 mt-1">
                  <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-amber-600 dark:text-amber-400">No Proxy Preset Assigned</p>
                    <p className="text-xs text-muted-foreground">
                      Users who subscribe to this plan will <span className="font-medium text-amber-600 dark:text-amber-400">not be assigned to any proxy group or nodes</span>.
                      They will need manual configuration or will receive default/generic proxies.
                      It&apos;s recommended to assign a preset or use Auto for a better user experience.
                    </p>
                  </div>
                </div>
              )}
              {planForm.proxyPresetId !== 'none' && planForm.proxyPresetId !== 'auto' && mockProxyPresets.find((p) => p.id === planForm.proxyPresetId) && (
                <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 mt-1">
                  <Wifi className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{mockProxyPresets.find((p) => p.id === planForm.proxyPresetId)?.name}</p>
                    <p className="text-xs text-muted-foreground">{mockProxyPresets.find((p) => p.id === planForm.proxyPresetId)?.description} — Admin-only info, users will not see the preset name.</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {mockProxyPresets.find((p) => p.id === planForm.proxyPresetId)?.subgroups.map((sg) => (
                        <Badge key={sg.id} variant="secondary" className="text-[10px]">
                          {sg.name} ({sg.proxyIds.length} prox{sg.proxyIds.length !== 1 ? 'ies' : 'y'})
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="space-y-2">
              <Label htmlFor="plan-features">Features (comma-separated)</Label>
              <Input
                id="plan-features"
                value={planForm.features}
                onChange={(e) => setPlanForm((f) => ({ ...f, features: e.target.value }))}
                placeholder="e.g., Unlimited bandwidth, All Asian nodes, Priority support"
              />
              {planForm.features && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {planForm.features
                    .split(',')
                    .map((f) => f.trim())
                    .filter(Boolean)
                    .map((f, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px]">
                        {f}
                      </Badge>
                    ))}
                </div>
              )}
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label htmlFor="plan-featured" className="text-sm">Featured</Label>
                  <p className="text-xs text-muted-foreground">Highlight this plan</p>
                </div>
                <Switch
                  id="plan-featured"
                  checked={planForm.isFeatured}
                  onCheckedChange={(checked) =>
                    setPlanForm((f) => ({ ...f, isFeatured: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label htmlFor="plan-active" className="text-sm">Active</Label>
                  <p className="text-xs text-muted-foreground">Visible to users</p>
                </div>
                <Switch
                  id="plan-active"
                  checked={planForm.isActive}
                  onCheckedChange={(checked) =>
                    setPlanForm((f) => ({ ...f, isActive: checked }))
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={savePlan}>
              {editingPlan ? 'Save Changes' : 'Create Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Single Plan ─────────────────────────────────── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingPlanName}&quot;? This action cannot be
              undone. Users currently subscribed will not be affected immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deletePlan} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Bulk Delete Confirmation ───────────────────────────── */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} Plan(s)</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.size} selected plan(s)? This action cannot
              be undone. Users currently subscribed will not be affected immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={bulkDelete} className="bg-red-600 hover:bg-red-700">
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
