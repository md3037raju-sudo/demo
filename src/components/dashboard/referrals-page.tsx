'use client'

import React, { useState } from 'react'
import { useAuthStore } from '@/lib/auth-store'
import { useReferralStore } from '@/lib/referral-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
import { toast } from 'sonner'
import { Copy, Users, Gift, DollarSign, ArrowDownToLine, Sparkles } from 'lucide-react'

export function ReferralsPage() {
  const { user } = useAuthStore()
  const { referrals, settings, applyReferralCode, getReferralsByUser, getTotalEarnings } = useReferralStore()

  const [referralCodeInput, setReferralCodeInput] = useState('')
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false)
  const [referralSuccessOpen, setReferralSuccessOpen] = useState(false)

  const userReferrals = user ? getReferralsByUser(user.id) : []
  const totalEarnings = user ? getTotalEarnings(user.id) : 0
  const totalReferrals = userReferrals.length
  const canWithdraw = totalEarnings >= settings.minWithdrawal

  const handleCopyCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode)
      toast.success('Referral code copied to clipboard!')
    }
  }

  const handleApplyReferralCode = () => {
    if (!referralCodeInput.trim()) {
      toast.error('Please enter a referral code')
      return
    }
    if (!user) return

    const result = applyReferralCode(referralCodeInput.trim(), user.id, user.name)
    if (result.success) {
      setReferralCodeInput('')
      setReferralSuccessOpen(true)
      toast.success(`Welcome bonus of $${settings.referredReward.toFixed(2)} applied!`)
    } else {
      toast.error(result.error || 'Invalid referral code')
    }
  }

  const handleWithdraw = () => {
    if (!canWithdraw) {
      toast.error(`Minimum withdrawal amount is $${settings.minWithdrawal.toFixed(2)}`)
      return
    }
    setWithdrawDialogOpen(true)
  }

  const confirmWithdraw = () => {
    setWithdrawDialogOpen(false)
    toast.success(`Withdrawal of $${totalEarnings.toFixed(2)} initiated!`)
  }

  // Check if user has already been referred (entered a code)
  const hasBeenReferred = user ? referrals.some((r) => r.referredUserId === user.id) : false

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Referrals</h2>
      </div>

      {/* Enter Referral Code Section */}
      {!hasBeenReferred && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="size-5 text-primary" />
              Enter Referral Code
            </CardTitle>
            <CardDescription>
              Have a referral code? Enter it below to receive a welcome bonus of ${settings.referredReward.toFixed(2)}!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Input
                value={referralCodeInput}
                onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                placeholder="Enter referral code (e.g., COREX-7K9M2)"
                className="flex-1 font-mono"
              />
              <Button onClick={handleApplyReferralCode} className="gap-2">
                <Sparkles className="size-4" />
                Apply Code
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Referral Code Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="size-5" />
            Your Referral Code
          </CardTitle>
          <CardDescription>
            Share this code with friends. They&apos;ll get a welcome bonus, and you&apos;ll earn credits.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 rounded-lg border bg-muted/50 px-6 py-4 text-center">
              <span className="font-mono text-2xl font-bold tracking-widest text-primary">
                {user?.referralCode ?? 'COREX-XXXX'}
              </span>
            </div>
            <Button onClick={handleCopyCode} className="gap-2">
              <Copy className="size-4" />
              Copy Code
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Share this code with friends. They&apos;ll get a ${settings.referredReward.toFixed(2)} welcome
            bonus on sign-up, and you&apos;ll earn ${settings.referrerReward.toFixed(2)} in credits for each successful referral.
          </p>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Referrals
            </CardTitle>
            <div className="rounded-lg bg-teal-500/10 p-2">
              <Users className="size-4 text-teal-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReferrals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Earnings
            </CardTitle>
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <DollarSign className="size-4 text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Withdraw Earnings
            </CardTitle>
            <div className="rounded-lg bg-primary/10 p-2">
              <ArrowDownToLine className="size-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={handleWithdraw}
              disabled={!canWithdraw}
              className="w-full gap-2"
              variant={canWithdraw ? 'default' : 'outline'}
            >
              <ArrowDownToLine className="size-4" />
              Withdraw
            </Button>
            {!canWithdraw && (
              <p className="text-xs text-muted-foreground text-center">
                Min. withdrawal: ${settings.minWithdrawal.toFixed(2)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Referrals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Referrals</CardTitle>
          <CardDescription>
            People who signed up using your referral code
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {userReferrals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Users className="size-10 mb-3 opacity-30" />
              <p className="text-sm">No referrals yet</p>
              <p className="text-xs mt-1">Share your code to start earning</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reward</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userReferrals.map((ref) => (
                  <TableRow key={ref.id}>
                    <TableCell className="font-medium">{ref.referredUserName}</TableCell>
                    <TableCell>{ref.referredAt}</TableCell>
                    <TableCell>
                      {ref.status === 'completed' ? (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30">
                          Completed
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-emerald-400 font-medium">
                      ${ref.referrerReward.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Referral Success Dialog */}
      <Dialog open={referralSuccessOpen} onOpenChange={setReferralSuccessOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex items-center justify-center size-8 rounded-lg bg-emerald-500/10">
                <Sparkles className="size-4 text-emerald-400" />
              </div>
              Welcome Bonus Applied!
            </DialogTitle>
            <DialogDescription>
              Your referral code was accepted. A welcome bonus of ${settings.referredReward.toFixed(2)} has been added to your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setReferralSuccessOpen(false)}>
              Awesome!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
                <ArrowDownToLine className="size-4 text-primary" />
              </div>
              Withdraw Earnings
            </DialogTitle>
            <DialogDescription>
              You are about to withdraw your referral earnings.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Available Earnings</span>
              <span className="font-bold text-emerald-400">${totalEarnings.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Min. Withdrawal</span>
              <span>${settings.minWithdrawal.toFixed(2)}</span>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setWithdrawDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmWithdraw} className="gap-1.5">
              <ArrowDownToLine className="size-4" />
              Confirm Withdrawal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
