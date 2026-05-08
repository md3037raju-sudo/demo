'use client'

import React, { useState, useMemo } from 'react'
import { mockPlans, type Plan, type PlanDuration, getDurationLabel, calculateDevicePrice, getPerDeviceCost } from '@/lib/mock-data'
import {
  useSubscriptionStore,
  findMatchingPlan,
  getSubscriptionPrice,
  calculateNewExpiry,
  isWithin60Days,
  getDaysBeforeVanish,
  type Subscription,
} from '@/lib/subscription-store'
import { useAuthStore } from '@/lib/auth-store'
import { useNavigationStore } from '@/lib/navigation-store'
import { useCouponStore } from '@/lib/coupon-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
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
  AlertCircle,
  ArrowRight,
  Tag,
  X,
  History,
  Clock,
  Zap,
  Wifi,
} from 'lucide-react'
import { toast } from 'sonner'
import { AnimateIn } from '@/components/shared/animate-in'
import type { Coupon } from '@/lib/mock-data'

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

export function SubscriptionsPage() {
  const { user, deductBalance } = useAuthStore()
  const navigate = useNavigationStore((s) => s.navigate)
  const couponStore = useCouponStore()

  const { subscriptions, renewSubscription } = useSubscriptionStore()

  // Derived: expired/renewable subscriptions within 60-day window
  const historySubs = subscriptions.filter((s) => s.status !== 'active' && isWithin60Days(s.expiryDate))

  // Renew flow state
  const [renewDialogOpen, setRenewDialogOpen] = useState(false)
  const [renewingSub, setRenewingSub] = useState<Subscription | null>(null)

  // Coupon state
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)
  const [couponError, setCouponError] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)

  const balance = user?.balance ?? 0

  // Stats
  const activeCount = subscriptions.filter((s) => s.status === 'active').length
  const renewableCount = historySubs.filter((s) => s.status === 'renewable').length
  const totalSpent = subscriptions.reduce((sum, s) => sum + s.price, 0)

  // Renewal price calculation
  const renewalPrice = renewingSub ? getSubscriptionPrice(renewingSub) : 0
  const matchingPlan = renewingSub ? findMatchingPlan(renewingSub.name) : null

  const finalPrice = Math.max(0, renewalPrice - couponDiscount)

  const handleRenewClick = (sub: Subscription) => {
    setRenewingSub(sub)
    setCouponInput('')
    setAppliedCoupon(null)
    setCouponError('')
    setCouponDiscount(0)
    setRenewDialogOpen(true)
  }

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) {
      setCouponError('Please enter a coupon code')
      return
    }
    if (!matchingPlan) return
    const userId = user?.id ?? 'usr_cx_001'
    const result = couponStore.validateCoupon(couponInput.trim(), userId, matchingPlan.id, renewalPrice)
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
      description: `You save ৳${(result.discount || 0).toFixed(2)} on this renewal.`,
    })
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponInput('')
    setCouponDiscount(0)
    setCouponError('')
  }

  const handleConfirmRenewal = () => {
    if (!renewingSub || !matchingPlan) return
    if (balance < finalPrice) return

    deductBalance(finalPrice)

    if (appliedCoupon && couponDiscount > 0) {
      couponStore.claimCoupon(appliedCoupon.id, user?.id ?? 'usr_cx_001', user?.name ?? 'User', couponDiscount)
    }

    // Calculate new expiry: from TODAY + plan duration (since it's already expired)
    const now = new Date()
    const newExpiry = calculateNewExpiry(now, matchingPlan.duration)
    const newExpiryStr = newExpiry.toISOString().split('T')[0]

    // Renew the same subscription (updates status to active, extends expiry, resets bandwidth)
    renewSubscription(renewingSub.id, newExpiryStr)

    setRenewDialogOpen(false)
    setRenewingSub(null)
    setCouponInput('')
    setAppliedCoupon(null)
    setCouponDiscount(0)
    setCouponError('')

    const discountMsg = couponDiscount > 0 ? ` ৳${couponDiscount.toFixed(2)} coupon discount applied.` : ''
    toast.success('Subscription renewed!', {
      description: `${renewingSub.name} (${getDurationLabel(matchingPlan.duration)}, ${renewingSub.devices ?? 1} device${(renewingSub.devices ?? 1) > 1 ? 's' : ''}) has been reactivated. New expiry: ${newExpiry.toLocaleDateString()}. ৳${finalPrice.toFixed(2)} deducted.${discountMsg}`,
    })
  }

  const handleCancelRenew = () => {
    setRenewDialogOpen(false)
    setRenewingSub(null)
    setCouponInput('')
    setAppliedCoupon(null)
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
                  const daysLeft = getDaysBeforeVanish(sub.expiryDate)
                  const hasMatchingPlan = !!findMatchingPlan(sub.name)
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
                          onClick={() => handleRenewClick(sub)}
                          disabled={!hasMatchingPlan}
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
      {/* Renew Dialog: Reactivate the SAME subscription               */}
      {/* ============================================================ */}
      <Dialog open={renewDialogOpen} onOpenChange={(open) => { if (!open) handleCancelRenew() }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="size-5 text-primary" />
              Renew Subscription
            </DialogTitle>
            <DialogDescription>
              Reactivate your subscription with the same plan and device configuration. Your expiry date will be extended from today.
            </DialogDescription>
          </DialogHeader>

          {renewingSub && matchingPlan && (
            <div className="space-y-4 py-2">
              {/* Plan Details — same plan, not changeable */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-lg">{renewingSub.name}</span>
                    <Badge variant="outline">{getDurationLabel(matchingPlan.duration)}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{matchingPlan.description}</p>
                  <Separator />
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Duration</div>
                    <div className="text-right font-medium">{getDurationLabel(matchingPlan.duration)}</div>
                    <div className="text-muted-foreground">Speed</div>
                    <div className="text-right font-medium">{matchingPlan.speed}</div>
                    <div className="text-muted-foreground">Bandwidth</div>
                    <div className="text-right font-medium">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          matchingPlan.bandwidthType === 'unlimited'
                            ? 'border-emerald-500/30 text-emerald-400'
                            : ''
                        }`}
                      >
                        {matchingPlan.bandwidthLimit}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground">Devices</div>
                    <div className="text-right font-medium">
                      {renewingSub.devices ?? 1} device{(renewingSub.devices ?? 1) > 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
                    <Clock className="size-3.5" />
                    <span>New expiry will be: <strong className="text-foreground">{calculateNewExpiry(new Date(), matchingPlan.duration).toLocaleDateString()}</strong> (from today)</span>
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
                    <span className="font-medium">৳{calculateDevicePrice(matchingPlan.basePrice, matchingPlan.devicePricing, 1).toFixed(2)}</span>
                  </div>
                  {(renewingSub.devices ?? 1) > 1 && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Device multiplier ({renewingSub.devices} devices — {matchingPlan.devicePricing[renewingSub.devices ?? 1]}% of base)
                        </span>
                        <span className="font-medium">৳{renewalPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Per-device cost</span>
                        <span className="font-medium">৳{getPerDeviceCost(renewalPrice, renewingSub.devices ?? 1).toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  {(renewingSub.devices ?? 1) === 1 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total price</span>
                      <span className="font-bold text-lg">৳{renewalPrice.toFixed(2)}</span>
                    </div>
                  )}
                  {(renewingSub.devices ?? 1) > 1 && (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Renewal price</span>
                        <span className="font-bold text-lg">৳{renewalPrice.toFixed(2)}</span>
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
                        <span className="line-through text-muted-foreground">৳{renewalPrice.toFixed(2)}</span>
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
                    <span className="text-muted-foreground">After Renewal</span>
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
                            setRenewDialogOpen(false)
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

          {renewingSub && !matchingPlan && (
            <div className="py-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertCircle className="size-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-400">Plan no longer available</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    The plan &quot;{renewingSub.name}&quot; is no longer active. Please purchase a new subscription from the Overview page.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 gap-1"
                    onClick={() => {
                      handleCancelRenew()
                      navigate('dashboard')
                    }}
                  >
                    Go to Overview
                    <ArrowRight className="size-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={handleCancelRenew}>
              Cancel
            </Button>
            {renewingSub && matchingPlan && balance >= finalPrice && (
              <Button className="gap-1.5" onClick={handleConfirmRenewal}>
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
