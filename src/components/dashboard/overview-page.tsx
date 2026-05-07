'use client'

import React, { useState, useMemo } from 'react'
import { useAuthStore } from '@/lib/auth-store'
import {
  mockSubscriptions,
  mockActiveDevices,
  mockPlans,
  type Coupon,
  type Plan,
  type PlanDuration,
  getDurationLabel,
  calculateDevicePrice,
  getPerDeviceCost,
  getSavingsPercent,
} from '@/lib/mock-data'
import { useCouponStore } from '@/lib/coupon-store'
import { useNavigationStore } from '@/lib/navigation-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
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
  CreditCard,
  Smartphone,
  Wallet,
  Users,
  Settings,
  ShoppingCart,
  Check,
  Zap,
  Globe,
  Monitor,
  AlertCircle,
  ArrowRight,
  Tag,
  X,
  Star,
  Clock,
  Wifi,
  HardDrive,
  ChevronRight,
  Sparkles,
  CalendarPlus,
} from 'lucide-react'
import { toast } from 'sonner'
import { AnimateIn } from '@/components/shared/animate-in'

interface Subscription {
  id: string
  userId: string
  userName: string
  name: string
  plan: string
  status: 'active' | 'expired' | 'renewable'
  startDate: string
  expiryDate: string
  price: number
  bandwidthUsed: number
  bandwidthLimit: number
  deepLink: string
  devices: number
}

// Duration tab order
const DURATION_ORDER: PlanDuration[] = ['3d', '7d', '15d', '30d', '6m', '1y']

// Find the matching plan for a subscription by name
function findMatchingPlan(subName: string): Plan | null {
  return mockPlans.find((p) => p.name === subName && p.isActive) ?? null
}

// Calculate the extend price for a subscription (same plan, same devices)
function getExtendPrice(sub: Subscription): number {
  const plan = findMatchingPlan(sub.name)
  if (!plan) return sub.price // fallback to original price
  return calculateDevicePrice(plan.basePrice, plan.devicePricing, sub.devices ?? 1)
}

// Calculate new expiry date when extending (from CURRENT expiry + duration)
function getExtendedExpiry(currentExpiry: string, duration: PlanDuration): Date {
  const expiry = new Date(currentExpiry)
  switch (duration) {
    case '3d': expiry.setDate(expiry.getDate() + 3); break
    case '7d': expiry.setDate(expiry.getDate() + 7); break
    case '15d': expiry.setDate(expiry.getDate() + 15); break
    case '30d': expiry.setMonth(expiry.getMonth() + 1); break
    case '6m': expiry.setMonth(expiry.getMonth() + 6); break
    case '1y': expiry.setFullYear(expiry.getFullYear() + 1); break
  }
  return expiry
}

export function OverviewPage() {
  const { user, deductBalance } = useAuthStore()
  const navigate = useNavigationStore((s) => s.navigate)
  const [configDialogOpen, setConfigDialogOpen] = useState(false)
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null)

  // Purchase flow state
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [selectedDevices, setSelectedDevices] = useState(1)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(mockSubscriptions as Subscription[])

  // Extend flow state
  const [extendDialogOpen, setExtendDialogOpen] = useState(false)
  const [extendingSub, setExtendingSub] = useState<Subscription | null>(null)

  // Coupon state (shared for purchase & extend)
  const couponStore = useCouponStore()
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)
  const [couponError, setCouponError] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)

  const activeSubsList = subscriptions.filter((s) => s.status === 'active')
  const activeSubscriptions = activeSubsList.length
  const activeDevicesCount = mockActiveDevices.length
  const balance = user?.balance ?? 0
  const referralCount = user?.totalReferrals ?? 0

  const handleConfigure = (subId: string) => {
    setSelectedSubId(subId)
    setConfigDialogOpen(true)
  }

  const handleOpenCoreX = () => {
    if (selectedSubId) {
      window.location.href = `corex://configure/${selectedSubId}`
    }
    setConfigDialogOpen(false)
  }

  // ── Extend handlers ──
  const handleExtendClick = (sub: Subscription) => {
    setExtendingSub(sub)
    setCouponInput('')
    setAppliedCoupon(null)
    setCouponError('')
    setCouponDiscount(0)
    setExtendDialogOpen(true)
  }

  const extendPrice = extendingSub ? getExtendPrice(extendingSub) : 0
  const extendPlan = extendingSub ? findMatchingPlan(extendingSub.name) : null
  const extendFinalPrice = Math.max(0, extendPrice - couponDiscount)
  const newExpiryDate = extendingSub && extendPlan
    ? getExtendedExpiry(extendingSub.expiryDate, extendPlan.duration)
    : null

  const handleExtendApplyCoupon = () => {
    if (!couponInput.trim()) {
      setCouponError('Please enter a coupon code')
      return
    }
    if (!extendPlan) return
    const userId = user?.id ?? 'usr_cx_001'
    const result = couponStore.validateCoupon(couponInput.trim(), userId, extendPlan.id, extendPrice)
    if (!result.valid) {
      setCouponError(result.error || 'Invalid coupon')
      setAppliedCoupon(null)
      setCouponDiscount(0)
      return
    }
    setAppliedCoupon(result.coupon || null)
    setCouponDiscount(result.discount || 0)
    setCouponError('')
    toast.success('Coupon applied!', {
      description: `You save ৳${(result.discount || 0).toFixed(2)} on this extension.`,
    })
  }

  const handleExtendRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponInput('')
    setCouponDiscount(0)
    setCouponError('')
  }

  const handleConfirmExtend = () => {
    if (!extendingSub || !extendPlan) return
    if (balance < extendFinalPrice) return

    deductBalance(extendFinalPrice)

    if (appliedCoupon && couponDiscount > 0) {
      couponStore.claimCoupon(appliedCoupon.id, user?.id ?? 'usr_cx_001', user?.name ?? 'User', couponDiscount)
    }

    // Update the subscription's expiry date (extend it)
    const newExpiry = getExtendedExpiry(extendingSub.expiryDate, extendPlan.duration)
    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === extendingSub.id
          ? { ...s, expiryDate: newExpiry.toISOString().split('T')[0], price: s.price + extendPrice }
          : s
      )
    )

    setExtendDialogOpen(false)
    setExtendingSub(null)
    setCouponInput('')
    setAppliedCoupon(null)
    setCouponDiscount(0)
    setCouponError('')

    const discountMsg = couponDiscount > 0 ? ` ৳${couponDiscount.toFixed(2)} coupon discount applied.` : ''
    toast.success('Subscription extended!', {
      description: `${extendingSub.name} has been extended to ${newExpiry.toLocaleDateString()}. ৳${extendFinalPrice.toFixed(2)} deducted.${discountMsg}`,
    })
  }

  const handleCancelExtend = () => {
    setExtendDialogOpen(false)
    setExtendingSub(null)
    setCouponInput('')
    setAppliedCoupon(null)
    setCouponDiscount(0)
    setCouponError('')
  }

  // ── Purchase flow ──
  const selectedPlan = mockPlans.find((p) => p.id === selectedPlanId) ?? null

  // Active plans grouped by duration
  const activePlans = useMemo(() => mockPlans.filter((p) => p.isActive), [])
  const plansByDuration = useMemo(() => {
    const grouped: Partial<Record<PlanDuration, Plan[]>> = {}
    for (const plan of activePlans) {
      if (!grouped[plan.duration]) grouped[plan.duration] = []
      grouped[plan.duration]!.push(plan)
    }
    return grouped
  }, [activePlans])

  // Default tab: first duration that has plans
  const defaultDurationTab = useMemo(() => {
    for (const d of DURATION_ORDER) {
      if (plansByDuration[d] && plansByDuration[d]!.length > 0) return d
    }
    return '30d'
  }, [plansByDuration])

  // Live price calculation
  const totalPrice = selectedPlan
    ? calculateDevicePrice(selectedPlan.basePrice, selectedPlan.devicePricing, selectedDevices)
    : 0
  const perDeviceCost = selectedPlan
    ? getPerDeviceCost(totalPrice, selectedDevices)
    : 0
  const savingsPercent = selectedPlan
    ? getSavingsPercent(selectedPlan.basePrice, selectedPlan.devicePricing, selectedDevices)
    : 0

  const finalPrice = Math.max(0, totalPrice - couponDiscount)

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId)
    setSelectedDevices(1)
    // Reset coupon state when new plan selected
    setCouponInput('')
    setAppliedCoupon(null)
    setCouponError('')
    setCouponDiscount(0)
  }

  const handleProceedToCheckout = () => {
    if (!selectedPlanId) return
    setPurchaseDialogOpen(false)
    setConfirmDialogOpen(true)
  }

  const handleBackToPlans = () => {
    setConfirmDialogOpen(false)
    setPurchaseDialogOpen(true)
  }

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) {
      setCouponError('Please enter a coupon code')
      return
    }

    if (!selectedPlan) return

    const userId = user?.id ?? 'usr_cx_001'
    const result = couponStore.validateCoupon(couponInput.trim(), userId, selectedPlan.id, totalPrice)

    if (!result.valid) {
      setCouponError(result.error || 'Invalid coupon')
      setAppliedCoupon(null)
      setCouponDiscount(0)
      return
    }

    setAppliedCoupon(result.coupon || null)
    setCouponDiscount(result.discount || 0)
    setCouponError('')
    toast.success('Coupon applied!', {
      description: `You save ৳${(result.discount || 0).toFixed(2)} on this purchase.`,
    })
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponInput('')
    setCouponDiscount(0)
    setCouponError('')
  }

  const handleConfirmPurchase = () => {
    if (!selectedPlan) return

    if (balance < finalPrice) {
      return
    }

    // Deduct balance
    deductBalance(finalPrice)

    // Claim coupon if applied
    if (appliedCoupon && couponDiscount > 0) {
      couponStore.claimCoupon(appliedCoupon.id, user?.id ?? 'usr_cx_001', user?.name ?? 'User', couponDiscount)
    }

    // Calculate expiry date based on duration
    const now = new Date()
    const expiry = new Date(now)
    switch (selectedPlan.duration) {
      case '3d': expiry.setDate(expiry.getDate() + 3); break
      case '7d': expiry.setDate(expiry.getDate() + 7); break
      case '15d': expiry.setDate(expiry.getDate() + 15); break
      case '30d': expiry.setMonth(expiry.getMonth() + 1); break
      case '6m': expiry.setMonth(expiry.getMonth() + 6); break
      case '1y': expiry.setFullYear(expiry.getFullYear() + 1); break
    }

    // Parse bandwidth limit
    const bwLimit = selectedPlan.bandwidthType === 'unlimited'
      ? 9999
      : parseInt(selectedPlan.bandwidthLimit.replace(/[^0-9]/g, '')) || 0

    const newSub: Subscription = {
      id: `sub_${Date.now()}`,
      userId: user?.id ?? 'usr_cx_001',
      userName: user?.name ?? 'Alex Morgan',
      name: selectedPlan.name,
      plan: getDurationLabel(selectedPlan.duration),
      status: 'active',
      startDate: now.toISOString().split('T')[0],
      expiryDate: expiry.toISOString().split('T')[0],
      price: totalPrice,
      bandwidthUsed: 0,
      bandwidthLimit: bwLimit,
      deepLink: `corex://configure/sub_${Date.now()}`,
      devices: selectedDevices,
    }

    setSubscriptions((prev) => [newSub, ...prev])

    setConfirmDialogOpen(false)
    setSelectedPlanId(null)
    setSelectedDevices(1)
    setAppliedCoupon(null)
    setCouponInput('')
    setCouponDiscount(0)
    setCouponError('')

    const discountMsg = couponDiscount > 0 ? ` ৳${couponDiscount.toFixed(2)} coupon discount applied.` : ''
    toast.success('Subscription purchased!', {
      description: `${selectedPlan.name} (${getDurationLabel(selectedPlan.duration)}, ${selectedDevices} device${selectedDevices > 1 ? 's' : ''}) has been activated. ৳${finalPrice.toFixed(2)} deducted from your balance.${discountMsg}`,
    })
  }

  const handleCancelPurchase = () => {
    setConfirmDialogOpen(false)
    setSelectedPlanId(null)
    setSelectedDevices(1)
    setAppliedCoupon(null)
    setCouponInput('')
    setCouponDiscount(0)
    setCouponError('')
  }

  const stats = [
    {
      title: 'Active Subscriptions',
      value: activeSubscriptions,
      icon: CreditCard,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Active Devices',
      value: activeDevicesCount,
      icon: Smartphone,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10',
    },
    {
      title: 'Balance',
      value: `৳${balance.toFixed(2)}`,
      icon: Wallet,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Referrals',
      value: referralCount,
      icon: Users,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome + Buy Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            Welcome back, {user?.name?.split(' ')[0]}
          </h2>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your CoreX account.
          </p>
        </div>
        <Button
          size="lg"
          className="gap-2 shadow-lg shadow-primary/20"
          onClick={() => {
            setSelectedPlanId(null)
            setSelectedDevices(1)
            setPurchaseDialogOpen(true)
          }}
        >
          <ShoppingCart className="size-4" />
          Buy Subscription
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <AnimateIn key={stat.title} type="slide-up" delay={i * 60}>
            <Card>
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
          </AnimateIn>
        ))}
      </div>

      {/* Active Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          {activeSubsList.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Devices</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeSubsList.map((sub) => {
                  const hasMatchingPlan = !!findMatchingPlan(sub.name)
                  return (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.name}</TableCell>
                      <TableCell>{sub.plan}</TableCell>
                      <TableCell>{sub.devices ?? 1}</TableCell>
                      <TableCell>{sub.startDate}</TableCell>
                      <TableCell>{sub.expiryDate}</TableCell>
                      <TableCell>৳{sub.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => handleConfigure(sub.id)}
                          >
                            <Settings className="size-3.5" />
                            Configure
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => handleExtendClick(sub)}
                            disabled={!hasMatchingPlan}
                          >
                            <CalendarPlus className="size-3.5" />
                            Extend
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center">
              <CreditCard className="mx-auto mb-3 size-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No active subscriptions</p>
              <p className="text-xs text-muted-foreground mt-1">Purchase a plan to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deep Link Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Open CoreX App?</DialogTitle>
            <DialogDescription>
              This will open the CoreX application to configure your
              subscription. Make sure CoreX is installed on your device.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleOpenCoreX}>
              Open CoreX
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/* Extend Subscription Dialog                                   */}
      {/* ============================================================ */}
      <Dialog open={extendDialogOpen} onOpenChange={(open) => { if (!open) handleCancelExtend() }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarPlus className="size-5 text-primary" />
              Extend Subscription
            </DialogTitle>
            <DialogDescription>
              Extend your active subscription by adding more time. Your new expiry date will be calculated from the current expiry.
            </DialogDescription>
          </DialogHeader>

          {extendingSub && extendPlan && (
            <div className="space-y-4 py-2">
              {/* Plan Details — same plan, not changeable */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-lg">{extendingSub.name}</span>
                    <Badge variant="outline">{getDurationLabel(extendPlan.duration)}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{extendPlan.description}</p>
                  <Separator />
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Duration</div>
                    <div className="text-right font-medium">{getDurationLabel(extendPlan.duration)}</div>
                    <div className="text-muted-foreground">Speed</div>
                    <div className="text-right font-medium">{extendPlan.speed}</div>
                    <div className="text-muted-foreground">Bandwidth</div>
                    <div className="text-right font-medium">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          extendPlan.bandwidthType === 'unlimited'
                            ? 'border-emerald-500/30 text-emerald-400'
                            : ''
                        }`}
                      >
                        {extendPlan.bandwidthLimit}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground">Devices</div>
                    <div className="text-right font-medium">
                      {extendingSub.devices ?? 1} device{(extendingSub.devices ?? 1) > 1 ? 's' : ''}
                    </div>
                  </div>
                  {/* Expiry info */}
                  <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
                    <Clock className="size-3.5" />
                    <span>Current expiry: <strong className="text-foreground">{new Date(extendingSub.expiryDate).toLocaleDateString()}</strong></span>
                  </div>
                  {newExpiryDate && (
                    <div className="flex items-center gap-2 text-xs text-emerald-400">
                      <CalendarPlus className="size-3.5" />
                      <span>New expiry after extend: <strong>{newExpiryDate.toLocaleDateString()}</strong></span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Price Breakdown */}
              <Card className="border-border/50">
                <CardContent className="p-4 space-y-2.5">
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet className="size-4 text-primary" />
                    <span className="font-medium text-sm">Price Breakdown</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Base price (1 device)</span>
                    <span className="font-medium">৳{calculateDevicePrice(extendPlan.basePrice, extendPlan.devicePricing, 1).toFixed(2)}</span>
                  </div>
                  {(extendingSub.devices ?? 1) > 1 && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Device multiplier ({extendingSub.devices} devices — {extendPlan.devicePricing[extendingSub.devices ?? 1]}% of base)
                        </span>
                        <span className="font-medium">৳{extendPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Per-device cost</span>
                        <span className="font-medium">৳{getPerDeviceCost(extendPrice, extendingSub.devices ?? 1).toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  {(extendingSub.devices ?? 1) === 1 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Extend price</span>
                      <span className="font-bold text-lg">৳{extendPrice.toFixed(2)}</span>
                    </div>
                  )}
                  {(extendingSub.devices ?? 1) > 1 && (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Extend price</span>
                        <span className="font-bold text-lg">৳{extendPrice.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Coupon Section */}
              <Card className="border-border/50">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Tag className="size-4 text-primary" />
                    <span className="font-medium text-sm">Have a coupon code?</span>
                  </div>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Tag className="size-4 text-emerald-400" />
                        <div>
                          <code className="font-mono text-sm font-bold text-emerald-400">{appliedCoupon.code}</code>
                          <p className="text-xs text-emerald-300">Coupon applied! You save ৳{couponDiscount.toFixed(2)}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-red-400"
                        onClick={handleExtendRemoveCoupon}
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter coupon code"
                          value={couponInput}
                          onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                          className="font-mono"
                        />
                        <Button
                          variant="outline"
                          className="shrink-0 gap-1.5"
                          onClick={handleExtendApplyCoupon}
                          disabled={!couponInput.trim()}
                        >
                          <Tag className="size-3.5" />
                          Apply
                        </Button>
                      </div>
                      {couponError && (
                        <p className="text-xs text-red-400">{couponError}</p>
                      )}
                    </div>
                  )}

                  {couponDiscount > 0 && (
                    <div className="flex items-center justify-between text-sm pt-1">
                      <span className="text-muted-foreground">Coupon Discount</span>
                      <span className="font-semibold text-emerald-400">-৳{couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Final Price & Balance */}
              <Card className={`border-border/50 ${balance < extendFinalPrice ? 'border-red-500/30 bg-red-500/5' : 'border-emerald-500/30 bg-emerald-500/5'}`}>
                <CardContent className="p-4 space-y-2.5">
                  {couponDiscount > 0 && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Original Price</span>
                        <span className="line-through text-muted-foreground">৳{extendPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Coupon Discount</span>
                        <span className="font-semibold text-emerald-400">-৳{couponDiscount.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Final Price</span>
                    <span className="text-xl font-bold">৳{extendFinalPrice.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Current Balance</span>
                    <span className="font-semibold">৳{balance.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">After Extension</span>
                    <span className={`font-semibold ${balance < extendFinalPrice ? 'text-red-400' : 'text-emerald-400'}`}>
                      ৳{(balance - extendFinalPrice).toFixed(2)}
                    </span>
                  </div>

                  {balance < extendFinalPrice && (
                    <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <AlertCircle className="size-4 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-400">Insufficient Balance</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          You need ৳{(extendFinalPrice - balance).toFixed(2)} more. Add funds to your balance to complete this extension.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 gap-1 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                          onClick={() => {
                            handleCancelExtend()
                            navigate('dashboard/payments')
                          }}
                        >
                          Go to Payments
                          <ArrowRight className="size-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {extendingSub && !extendPlan && (
            <div className="py-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertCircle className="size-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-400">Plan no longer available</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    The plan &quot;{extendingSub.name}&quot; is no longer active and cannot be extended. You can purchase a new subscription instead.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 gap-1"
                    onClick={() => {
                      handleCancelExtend()
                      setPurchaseDialogOpen(true)
                    }}
                  >
                    Buy New Subscription
                    <ArrowRight className="size-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={handleCancelExtend}>
              Cancel
            </Button>
            {extendingSub && extendPlan && balance >= extendFinalPrice && (
              <Button className="gap-1.5" onClick={handleConfirmExtend}>
                <CalendarPlus className="size-4" />
                Confirm Extend — ৳{extendFinalPrice.toFixed(2)}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/* Step 1: Plan Selection Dialog — with duration tabs           */}
      {/* ============================================================ */}
      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="size-5 text-primary" />
              Choose a Subscription Plan
            </DialogTitle>
            <DialogDescription>
              Select a plan that fits your needs. Browse by duration, then pick your plan.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue={defaultDurationTab} className="w-full">
            <TabsList className="flex w-full flex-wrap gap-1 h-auto p-1">
              {DURATION_ORDER.map((dur) => {
                const plans = plansByDuration[dur]
                if (!plans || plans.length === 0) return null
                return (
                  <TabsTrigger key={dur} value={dur} className="text-xs px-3 py-1.5">
                    {getDurationLabel(dur)}
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {DURATION_ORDER.map((dur) => {
              const plans = plansByDuration[dur]
              if (!plans || plans.length === 0) return null
              return (
                <TabsContent key={dur} value={dur}>
                  <div className="grid gap-3 pt-2">
                    {plans.map((plan) => {
                      const isSelected = selectedPlanId === plan.id
                      const baseTotal = calculateDevicePrice(plan.basePrice, plan.devicePricing, 1)
                      return (
                        <Card
                          key={plan.id}
                          className={`cursor-pointer transition-all group ${
                            isSelected
                              ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                              : 'border-border/50 hover:border-primary/50 hover:bg-primary/5'
                          }`}
                          onClick={() => handleSelectPlan(plan.id)}
                        >
                          <CardContent className="p-4 sm:p-5">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-semibold text-base">{plan.name}</h3>
                                  {plan.isFeatured && (
                                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 gap-1 text-xs">
                                      <Star className="size-3" />
                                      Recommended
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="text-xs">
                                    <Clock className="size-3 mr-1" />
                                    {getDurationLabel(plan.duration)}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{plan.description}</p>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Zap className="size-3.5 text-amber-400" />
                                    {plan.speed}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Wifi className="size-3.5 text-teal-400" />
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${
                                        plan.bandwidthType === 'unlimited'
                                          ? 'border-emerald-500/30 text-emerald-400'
                                          : 'border-border text-muted-foreground'
                                      }`}
                                    >
                                      {plan.bandwidthLimit}
                                    </Badge>
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Globe className="size-3.5 text-emerald-400" />
                                    <span className="text-xs text-muted-foreground">Auto-assigned</span>
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="text-xl font-bold">৳{baseTotal.toFixed(2)}</div>
                                  <div className="text-xs text-muted-foreground">starting / 1 device</div>
                                </div>
                                <div className={`rounded-full p-2 transition-colors ${
                                  isSelected
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground'
                                }`}>
                                  {isSelected ? (
                                    <Check className="size-4" />
                                  ) : (
                                    <ChevronRight className="size-4" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </TabsContent>
              )
            })}
          </Tabs>

          {/* Device & Price Configuration — shown once a plan is selected */}
          {selectedPlan && (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <HardDrive className="size-4 text-primary" />
                <span className="font-medium text-sm">Select Number of Devices</span>
              </div>

              {/* Visual device selector: 5 circles */}
              <div className="flex items-center gap-3 justify-center">
                {([1, 2, 3, 4, 5] as const).map((d) => {
                  const dPrice = calculateDevicePrice(selectedPlan.basePrice, selectedPlan.devicePricing, d)
                  const dSavings = getSavingsPercent(selectedPlan.basePrice, selectedPlan.devicePricing, d)
                  const isDevSelected = selectedDevices === d

                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSelectedDevices(d)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl px-3 py-3 transition-all border-2 min-w-[64px] ${
                        isDevSelected
                          ? 'border-primary bg-primary/10 text-primary shadow-sm'
                          : 'border-border/50 hover:border-primary/40 hover:bg-primary/5 text-muted-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: d }).map((_, i) => (
                          <Monitor key={i} className={`size-3.5 ${isDevSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        ))}
                      </div>
                      <span className={`text-xs font-semibold ${isDevSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                        {d} {d === 1 ? 'device' : 'devices'}
                      </span>
                      <span className="text-xs font-bold">৳{dPrice.toFixed(0)}</span>
                      {dSavings > 0 && (
                        <Badge className="text-[10px] px-1.5 py-0 h-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                          Save {dSavings}%
                        </Badge>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Live pricing summary */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{selectedPlan.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {getDurationLabel(selectedPlan.duration)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {selectedDevices} device{selectedDevices > 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {selectedDevices > 1
                          ? `৳${perDeviceCost.toFixed(2)} per device`
                          : `৳${totalPrice.toFixed(2)} total`
                        }
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-2xl font-bold">৳{totalPrice.toFixed(2)}</div>
                      {savingsPercent > 0 && (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-1">
                          <Sparkles className="size-3" />
                          Save {savingsPercent}% per device
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Plan features list */}
              <div className="space-y-1.5">
                <span className="text-sm font-medium">Includes:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {selectedPlan.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="size-3.5 text-emerald-400 shrink-0" />
                      {feat}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setPurchaseDialogOpen(false)}>
              Cancel
            </Button>
            {selectedPlan && (
              <Button className="gap-1.5" onClick={handleProceedToCheckout}>
                Proceed to Checkout
                <ArrowRight className="size-4" />
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/* Step 3: Confirm Purchase Dialog                              */}
      {/* ============================================================ */}
      <Dialog open={confirmDialogOpen} onOpenChange={(open) => { if (!open) handleCancelPurchase() }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="size-5 text-emerald-400" />
              Confirm Purchase
            </DialogTitle>
            <DialogDescription>
              Review your selection before completing the purchase.
            </DialogDescription>
          </DialogHeader>

          {selectedPlan && (
            <div className="space-y-4 py-2">
              {/* Plan Details */}
              <Card className="border-border/50">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-lg">{selectedPlan.name}</span>
                    <Badge variant="outline">{getDurationLabel(selectedPlan.duration)}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedPlan.description}</p>
                  <Separator />
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Duration</div>
                    <div className="text-right font-medium">{getDurationLabel(selectedPlan.duration)}</div>
                    <div className="text-muted-foreground">Speed</div>
                    <div className="text-right font-medium">{selectedPlan.speed}</div>
                    <div className="text-muted-foreground">Bandwidth</div>
                    <div className="text-right font-medium">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          selectedPlan.bandwidthType === 'unlimited'
                            ? 'border-emerald-500/30 text-emerald-400'
                            : ''
                        }`}
                      >
                        {selectedPlan.bandwidthLimit}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground">Server Group</div>
                    <div className="text-right font-medium">
                      <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400">
                        Auto-assigned
                      </Badge>
                    </div>
                    <div className="text-muted-foreground">Devices</div>
                    <div className="text-right font-medium">
                      {selectedDevices} device{selectedDevices > 1 ? 's' : ''}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Price Breakdown */}
              <Card className="border-border/50">
                <CardContent className="p-4 space-y-2.5">
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet className="size-4 text-primary" />
                    <span className="font-medium text-sm">Price Breakdown</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Base price (1 device)</span>
                    <span className="font-medium">৳{calculateDevicePrice(selectedPlan.basePrice, selectedPlan.devicePricing, 1).toFixed(2)}</span>
                  </div>
                  {selectedDevices > 1 && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Device multiplier ({selectedDevices} devices — {selectedPlan.devicePricing[selectedDevices]}% of base)
                        </span>
                        <span className="font-medium">৳{totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Per-device cost</span>
                        <span className="font-medium">৳{perDeviceCost.toFixed(2)}</span>
                      </div>
                      {savingsPercent > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Multi-device savings</span>
                          <span className="font-medium text-emerald-400">Save {savingsPercent}%</span>
                        </div>
                      )}
                    </>
                  )}
                  {selectedDevices === 1 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total price</span>
                      <span className="font-bold text-lg">৳{totalPrice.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedDevices > 1 && (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Total price</span>
                        <span className="font-bold text-lg">৳{totalPrice.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Coupon Section */}
              <Card className="border-border/50">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Tag className="size-4 text-primary" />
                    <span className="font-medium text-sm">Have a coupon code?</span>
                  </div>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Tag className="size-4 text-emerald-400" />
                        <div>
                          <code className="font-mono text-sm font-bold text-emerald-400">{appliedCoupon.code}</code>
                          <p className="text-xs text-emerald-300">Coupon applied! You save ৳{couponDiscount.toFixed(2)}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-red-400"
                        onClick={handleRemoveCoupon}
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter coupon code"
                          value={couponInput}
                          onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                          className="font-mono"
                        />
                        <Button
                          variant="outline"
                          className="shrink-0 gap-1.5"
                          onClick={handleApplyCoupon}
                          disabled={!couponInput.trim()}
                        >
                          <Tag className="size-3.5" />
                          Apply
                        </Button>
                      </div>
                      {couponError && (
                        <p className="text-xs text-red-400">{couponError}</p>
                      )}
                    </div>
                  )}

                  {couponDiscount > 0 && (
                    <div className="flex items-center justify-between text-sm pt-1">
                      <span className="text-muted-foreground">Coupon Discount</span>
                      <span className="font-semibold text-emerald-400">-৳{couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Final Price & Balance Check */}
              <Card className={`border-border/50 ${balance < finalPrice ? 'border-red-500/30 bg-red-500/5' : 'border-emerald-500/30 bg-emerald-500/5'}`}>
                <CardContent className="p-4 space-y-2.5">
                  {couponDiscount > 0 && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Original Price</span>
                        <span className="line-through text-muted-foreground">৳{totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Coupon Discount</span>
                        <span className="font-semibold text-emerald-400">-৳{couponDiscount.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Final Price</span>
                    <span className="text-xl font-bold">৳{finalPrice.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Current Balance</span>
                    <span className="font-semibold">৳{balance.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {couponDiscount > 0 ? 'After Purchase (with discount)' : 'After Purchase'}
                    </span>
                    <span className={`font-semibold ${balance < finalPrice ? 'text-red-400' : 'text-emerald-400'}`}>
                      ৳{(balance - finalPrice).toFixed(2)}
                    </span>
                  </div>
                  {couponDiscount > 0 && (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total Savings</span>
                        <span className="font-semibold text-emerald-400">
                          ৳{(couponDiscount + (selectedDevices > 1 ? (calculateDevicePrice(selectedPlan.basePrice, selectedPlan.devicePricing, 1) * selectedDevices - totalPrice) : 0)).toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}

                  {balance < finalPrice && (
                    <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <AlertCircle className="size-4 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-400">Insufficient Balance</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          You need ৳{(finalPrice - balance).toFixed(2)} more. Add funds to your balance to complete this purchase.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 gap-1 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                          onClick={() => {
                            setConfirmDialogOpen(false)
                            setSelectedPlanId(null)
                            navigate('dashboard/payments')
                          }}
                        >
                          Go to Payments
                          <ArrowRight className="size-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleBackToPlans}>
              Back
            </Button>
            <Button variant="ghost" onClick={handleCancelPurchase}>
              Cancel
            </Button>
            {selectedPlan && balance >= finalPrice && (
              <Button className="gap-1.5" onClick={handleConfirmPurchase}>
                <Check className="size-4" />
                Confirm Purchase — ৳{finalPrice.toFixed(2)}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
