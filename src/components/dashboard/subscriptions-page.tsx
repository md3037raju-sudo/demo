'use client'

import React, { useState, useMemo } from 'react'
import { mockSubscriptions, mockPlans, type Plan, type PlanDuration, getDurationLabel, calculateDevicePrice, getPerDeviceCost, getSavingsPercent } from '@/lib/mock-data'
import { useAuthStore } from '@/lib/auth-store'
import { useNavigationStore } from '@/lib/navigation-store'
import { useCouponStore } from '@/lib/coupon-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  RefreshCw,
  Wallet,
  Monitor,
  Check,
  Zap,
  Star,
  Clock,
  Wifi,
  HardDrive,
  Globe,
  ChevronRight,
  Sparkles,
  AlertCircle,
  ArrowRight,
  Tag,
  X,
  History,
  ShoppingCart,
} from 'lucide-react'
import { toast } from 'sonner'
import { AnimateIn } from '@/components/shared/animate-in'
import type { Coupon } from '@/lib/mock-data'

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

function getStatusBadge(status: 'active' | 'expired' | 'renewable') {
  switch (status) {
    case 'active':
      return (
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30">
          Active
        </Badge>
      )
    case 'expired':
      return (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30">
          Expired
        </Badge>
      )
    case 'renewable':
      return (
        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30">
          Renewable
        </Badge>
      )
  }
}

// Check if a subscription is within 60-day renewable window
function isWithin60Days(expiryDate: string): boolean {
  const expiry = new Date(expiryDate)
  const now = new Date()
  const sixtyDaysAfter = new Date(expiry)
  sixtyDaysAfter.setDate(sixtyDaysAfter.getDate() + 60)
  return now <= sixtyDaysAfter
}

function getDaysLeft(expiryDate: string): number | null {
  const expiry = new Date(expiryDate)
  const now = new Date()
  const sixtyDaysAfter = new Date(expiry)
  sixtyDaysAfter.setDate(sixtyDaysAfter.getDate() + 60)
  const diff = sixtyDaysAfter.getTime() - now.getTime()
  if (diff <= 0) return null
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// Duration tab order
const DURATION_ORDER: PlanDuration[] = ['3d', '7d', '15d', '30d', '6m', '1y']

export function SubscriptionsPage() {
  const { user, deductBalance } = useAuthStore()
  const navigate = useNavigationStore((s) => s.navigate)
  const couponStore = useCouponStore()

  // Local subscription state — only expired/renewable that are within 60-day window
  const [historySubs, setHistorySubs] = useState<Subscription[]>(() =>
    (mockSubscriptions as Subscription[]).filter((s) => {
      if (s.status === 'active') return false
      return isWithin60Days(s.expiryDate)
    })
  )

  // Renew flow state
  const [renewDialogOpen, setRenewDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [renewingSubId, setRenewingSubId] = useState<string | null>(null)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [selectedDevices, setSelectedDevices] = useState(1)

  // Coupon state
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)
  const [couponError, setCouponError] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)

  const balance = user?.balance ?? 0

  // Stats
  const activeCount = (mockSubscriptions as Subscription[]).filter((s) => s.status === 'active').length
  const renewableCount = historySubs.filter((s) => s.status === 'renewable').length
  const totalSpent = (mockSubscriptions as Subscription[]).reduce((sum, s) => sum + s.price, 0)

  // Selected plan for renewal
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

  const handleRenewClick = (subId: string) => {
    setRenewingSubId(subId)
    setSelectedPlanId(null)
    setSelectedDevices(1)
    setCouponInput('')
    setAppliedCoupon(null)
    setCouponError('')
    setCouponDiscount(0)
    setRenewDialogOpen(true)
  }

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId)
    setSelectedDevices(1)
    setCouponInput('')
    setAppliedCoupon(null)
    setCouponError('')
    setCouponDiscount(0)
  }

  const handleProceedToCheckout = () => {
    if (!selectedPlanId) return
    setRenewDialogOpen(false)
    setConfirmDialogOpen(true)
  }

  const handleBackToPlans = () => {
    setConfirmDialogOpen(false)
    setRenewDialogOpen(true)
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
    if (balance < finalPrice) return

    deductBalance(finalPrice)

    if (appliedCoupon && couponDiscount > 0) {
      couponStore.claimCoupon(appliedCoupon.id, user?.id ?? 'usr_cx_001', user?.name ?? 'User', couponDiscount)
    }

    // Calculate expiry
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

    const bwLimit = selectedPlan.bandwidthType === 'unlimited'
      ? 9999
      : parseInt(selectedPlan.bandwidthLimit.replace(/[^0-9]/g, '')) || 0

    // If renewing, update the existing sub to active; otherwise create new
    if (renewingSubId) {
      setHistorySubs((prev) => prev.filter((s) => s.id !== renewingSubId))
    }

    setConfirmDialogOpen(false)
    setRenewingSubId(null)
    setSelectedPlanId(null)
    setSelectedDevices(1)
    setAppliedCoupon(null)
    setCouponInput('')
    setCouponDiscount(0)
    setCouponError('')

    const discountMsg = couponDiscount > 0 ? ` ৳${couponDiscount.toFixed(2)} coupon discount applied.` : ''
    toast.success('Subscription renewed!', {
      description: `${selectedPlan.name} (${getDurationLabel(selectedPlan.duration)}, ${selectedDevices} device${selectedDevices > 1 ? 's' : ''}) has been activated. ৳${finalPrice.toFixed(2)} deducted.${discountMsg}`,
    })
  }

  const handleCancelRenew = () => {
    setConfirmDialogOpen(false)
    setRenewingSubId(null)
    setSelectedPlanId(null)
    setSelectedDevices(1)
    setAppliedCoupon(null)
    setCouponInput('')
    setCouponDiscount(0)
    setCouponError('')
  }

  const stats = [
    {
      title: 'Total Spent',
      value: `৳${totalSpent.toFixed(0)}`,
      icon: Wallet,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Active',
      value: activeCount,
      icon: CreditCard,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Renewable',
      value: renewableCount,
      icon: RefreshCw,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Subscription History</h2>
        <p className="text-muted-foreground">
          Expired subscriptions are kept for 60 days, then permanently removed. Renewable ones can be renewed anytime within this window.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat, i) => (
          <AnimateIn key={stat.title} type="slide-up" delay={i * 60}>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className={`flex size-10 items-center justify-center rounded-lg ${stat.bg}`}>
                  <stat.icon className={`size-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
              </div>
            </Card>
          </AnimateIn>
        ))}
      </div>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="size-5 text-muted-foreground" />
            Expired & Renewable
          </CardTitle>
          <CardDescription>
            Subscriptions past their expiry date. Renewable within 60 days.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {historySubs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Devices</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expired On</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Vanishes In</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historySubs.map((sub) => {
                  const daysLeft = getDaysLeft(sub.expiryDate)
                  return (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.name}</TableCell>
                      <TableCell>{sub.plan}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Monitor className="size-3.5 text-muted-foreground" />
                          <span>{sub.devices ?? 1}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(sub.status)}</TableCell>
                      <TableCell>{sub.expiryDate}</TableCell>
                      <TableCell className="font-medium">৳{sub.price.toFixed(2)}</TableCell>
                      <TableCell>
                        {daysLeft !== null ? (
                          <Badge className={`text-xs ${
                            daysLeft <= 7
                              ? 'bg-red-500/20 text-red-400 border-red-500/30'
                              : daysLeft <= 30
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                : 'bg-muted text-muted-foreground border-border'
                          }`}>
                            {daysLeft}d left
                          </Badge>
                        ) : (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                            Vanished
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => handleRenewClick(sub.id)}
                        >
                          <RefreshCw className="size-3.5" />
                          Renew
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center">
              <History className="mx-auto mb-3 size-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">No expired subscriptions in the last 60 days.</p>
              <p className="text-xs text-muted-foreground mt-1">Expired records are automatically removed after 60 days.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ============================================================ */}
      {/* Renew Flow: Plan Selection Dialog                            */}
      {/* ============================================================ */}
      <Dialog open={renewDialogOpen} onOpenChange={setRenewDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="size-5 text-primary" />
              Renew Subscription
            </DialogTitle>
            <DialogDescription>
              Choose a new plan to continue your subscription. Your previous configuration will be restored.
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

          {/* Device & Price Configuration */}
          {selectedPlan && (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <HardDrive className="size-4 text-primary" />
                <span className="font-medium text-sm">Select Number of Devices</span>
              </div>

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

              {/* Pricing summary */}
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

              {/* Features */}
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
            <Button variant="ghost" onClick={() => setRenewDialogOpen(false)}>
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
      {/* Confirm Renewal Dialog                                       */}
      {/* ============================================================ */}
      <Dialog open={confirmDialogOpen} onOpenChange={(open) => { if (!open) handleCancelRenew() }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="size-5 text-primary" />
              Confirm Renewal
            </DialogTitle>
            <DialogDescription>
              Review your renewal selection before completing.
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

              {/* Final Price & Balance */}
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
                    <span className="text-muted-foreground">After Purchase</span>
                    <span className={`font-semibold ${balance < finalPrice ? 'text-red-400' : 'text-emerald-400'}`}>
                      ৳{(balance - finalPrice).toFixed(2)}
                    </span>
                  </div>

                  {balance < finalPrice && (
                    <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <AlertCircle className="size-4 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-400">Insufficient Balance</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          You need ৳{(finalPrice - balance).toFixed(2)} more. Add funds to your balance to complete this renewal.
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
            <Button variant="ghost" onClick={handleCancelRenew}>
              Cancel
            </Button>
            {selectedPlan && balance >= finalPrice && (
              <Button className="gap-1.5" onClick={handleConfirmPurchase}>
                <RefreshCw className="size-4" />
                Confirm Renewal — ৳{finalPrice.toFixed(2)}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
