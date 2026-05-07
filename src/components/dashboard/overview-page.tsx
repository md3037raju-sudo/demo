'use client'

import React, { useState } from 'react'
import { useAuthStore } from '@/lib/auth-store'
import { mockSubscriptions, mockActiveDevices, mockPlans } from '@/lib/mock-data'
import { useNavigationStore } from '@/lib/navigation-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
} from 'lucide-react'
import { toast } from 'sonner'

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
}

function StatusBadge({ status }: { status: 'active' | 'expired' | 'renewable' }) {
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

export function OverviewPage() {
  const { user, deductBalance } = useAuthStore()
  const navigate = useNavigationStore((s) => s.navigate)
  const [configDialogOpen, setConfigDialogOpen] = useState(false)
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null)

  // Purchase flow state
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(mockSubscriptions)

  const activeSubscriptions = subscriptions.filter((s) => s.status === 'active').length
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

  const selectedPlan = mockPlans.find((p) => p.id === selectedPlanId)

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId)
    setPurchaseDialogOpen(false)
    setConfirmDialogOpen(true)
  }

  const handleConfirmPurchase = () => {
    if (!selectedPlan) return

    const price = selectedPlan.price
    if (balance < price) {
      // Not enough balance — dialog stays open, user sees the message
      return
    }

    // Deduct balance
    deductBalance(price)

    // Create new subscription
    const now = new Date()
    const expiry = new Date(now)
    if (selectedPlan.period === 'Monthly') {
      expiry.setMonth(expiry.getMonth() + 1)
    } else if (selectedPlan.period === 'Yearly') {
      expiry.setFullYear(expiry.getFullYear() + 1)
    }

    const newSub: Subscription = {
      id: `sub_${Date.now()}`,
      userId: user?.id ?? 'usr_cx_001',
      userName: user?.name ?? 'Alex Morgan',
      name: selectedPlan.name,
      plan: selectedPlan.period,
      status: 'active',
      startDate: now.toISOString().split('T')[0],
      expiryDate: expiry.toISOString().split('T')[0],
      price: selectedPlan.price,
      bandwidthUsed: 0,
      bandwidthLimit: selectedPlan.dataLimit === 'Unlimited' ? 9999 : parseInt(selectedPlan.dataLimit),
      deepLink: `corex://configure/sub_${Date.now()}`,
    }

    setSubscriptions((prev) => [newSub, ...prev])

    setConfirmDialogOpen(false)
    setSelectedPlanId(null)

    toast.success('Subscription purchased!', {
      description: `${selectedPlan.name} (${selectedPlan.period}) has been activated. $${price.toFixed(2)} deducted from your balance.`,
    })
  }

  const handleCancelPurchase = () => {
    setConfirmDialogOpen(false)
    setSelectedPlanId(null)
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
      value: `$${balance.toFixed(2)}`,
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

  const activePlans = mockPlans.filter((p) => p.isActive)

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
            setPurchaseDialogOpen(true)
          }}
        >
          <ShoppingCart className="size-4" />
          Buy Subscription
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
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

      {/* Active Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">{sub.name}</TableCell>
                  <TableCell>{sub.plan}</TableCell>
                  <TableCell>
                    <StatusBadge status={sub.status} />
                  </TableCell>
                  <TableCell>{sub.startDate}</TableCell>
                  <TableCell>{sub.expiryDate}</TableCell>
                  <TableCell>${sub.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => handleConfigure(sub.id)}
                    >
                      <Settings className="size-3.5" />
                      Configure
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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

      {/* Buy Subscription - Plan Selection Dialog */}
      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="size-5 text-primary" />
              Choose a Subscription Plan
            </DialogTitle>
            <DialogDescription>
              Select a plan that fits your needs. You can manage your subscriptions anytime.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {activePlans.map((plan) => (
              <Card
                key={plan.id}
                className="cursor-pointer border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                onClick={() => handleSelectPlan(plan.id)}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-base">{plan.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {plan.period}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Zap className="size-3.5 text-amber-400" />
                          {plan.speed}
                        </span>
                        <span className="flex items-center gap-1">
                          <Globe className="size-3.5 text-blue-400" />
                          {plan.dataLimit}
                        </span>
                        <span className="flex items-center gap-1">
                          <Monitor className="size-3.5 text-teal-400" />
                          {plan.maxDevices} device{plan.maxDevices !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xl font-bold">${plan.price.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">per {plan.period.toLowerCase()}</div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors"
                      >
                        Select
                        <ArrowRight className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setPurchaseDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Purchase Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={(open) => { if (!open) handleCancelPurchase() }}>
        <DialogContent className="sm:max-w-md">
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
                    <Badge variant="outline">{selectedPlan.period}</Badge>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Speed</div>
                    <div className="text-right font-medium">{selectedPlan.speed}</div>
                    <div className="text-muted-foreground">Data Limit</div>
                    <div className="text-right font-medium">{selectedPlan.dataLimit}</div>
                    <div className="text-muted-foreground">Max Devices</div>
                    <div className="text-right font-medium">{selectedPlan.maxDevices}</div>
                    <div className="text-muted-foreground">Price</div>
                    <div className="text-right font-bold text-lg">${selectedPlan.price.toFixed(2)}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Balance Check */}
              <Card className={`border-border/50 ${balance < selectedPlan.price ? 'border-red-500/30 bg-red-500/5' : 'border-emerald-500/30 bg-emerald-500/5'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Current Balance</span>
                    <span className="font-semibold">${balance.toFixed(2)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">After Purchase</span>
                    <span className={`font-semibold ${balance < selectedPlan.price ? 'text-red-400' : 'text-emerald-400'}`}>
                      ${(balance - selectedPlan.price).toFixed(2)}
                    </span>
                  </div>

                  {balance < selectedPlan.price && (
                    <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <AlertCircle className="size-4 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-400">Insufficient Balance</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          You need ${(selectedPlan.price - balance).toFixed(2)} more. Add funds to your balance to complete this purchase.
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

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelPurchase}>
              Cancel
            </Button>
            {selectedPlan && balance >= selectedPlan.price && (
              <Button className="gap-1.5" onClick={handleConfirmPurchase}>
                <Check className="size-4" />
                Confirm Purchase
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
