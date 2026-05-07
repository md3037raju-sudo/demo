'use client'

import React, { useState } from 'react'
import { useAuthStore } from '@/lib/auth-store'
import { usePaymentStore, type PaymentMethod, TRANSACTIONS_VANISH_DAYS, getDaysBeforeVanish } from '@/lib/payment-store'
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
import { toast } from 'sonner'
import {
  Wallet,
  Copy,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  AlertCircle,
  Smartphone,
  ExternalLink,
} from 'lucide-react'

// ── Bkash Logo SVG ──
function BkashLogo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 40" className={`h-8 ${className}`} fill="none">
      <rect width="120" height="40" rx="8" fill="#E2136E" />
      <text x="14" y="27" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="18" fill="white">bKash</text>
    </svg>
  )
}

// ── Nagad Logo SVG ──
function NagadLogo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 40" className={`h-8 ${className}`} fill="none">
      <rect width="120" height="40" rx="8" fill="#F6921E" />
      <text x="14" y="27" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="16" fill="white">Nagad</text>
    </svg>
  )
}

function TypeBadge({ type }: { type: 'payment' | 'topup' | 'refund' }) {
  switch (type) {
    case 'payment':
      return (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30">
          Payment
        </Badge>
      )
    case 'topup':
      return (
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30">
          Top-up
        </Badge>
      )
    case 'refund':
      return (
        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30">
          Refund
        </Badge>
      )
  }
}

function AmountDisplay({ amount, type }: { amount: number; type: 'payment' | 'topup' | 'refund' }) {
  const formatted = Math.abs(amount).toFixed(2)
  if (type === 'payment') {
    return <span className="text-red-400 font-medium">-৳{formatted}</span>
  }
  if (type === 'topup') {
    return <span className="text-emerald-400 font-medium">+৳{formatted}</span>
  }
  return <span className="text-amber-400 font-medium">+৳{formatted}</span>
}

const presetAmounts = [10, 25, 50, 100, 250, 500]

export function PaymentsPage() {
  const { user } = useAuthStore()
  const { paymentConfig, submitBalanceRequest, getUserRequests, getVisibleTransactions } = usePaymentStore()

  const [addBalanceOpen, setAddBalanceOpen] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [amount, setAmount] = useState('')
  const [trxId, setTrxId] = useState('')
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const userId = user?.id ?? ''
  const userRequests = getUserRequests(userId)
  const visibleTransactions = getVisibleTransactions(userId)
  const pendingRequests = userRequests.filter((r) => r.status === 'pending')

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleOpenAddBalance = () => {
    setSelectedMethod(null)
    setAmount('')
    setTrxId('')
    setAddBalanceOpen(true)
  }

  const handleSubmitTrx = () => {
    const numAmount = parseFloat(amount)
    if (!selectedMethod) {
      toast.error('Please select a payment method')
      return
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    if (!trxId.trim()) {
      toast.error('Please enter your Transaction ID')
      return
    }
    if (trxId.trim().length < 6) {
      toast.error('Transaction ID must be at least 6 characters')
      return
    }

    submitBalanceRequest(userId, user?.name ?? '', numAmount, selectedMethod, trxId.trim())
    toast.success('Balance request submitted!', {
      description: 'Admin will review and approve your payment.',
    })
    setAddBalanceOpen(false)
    setSelectedMethod(null)
    setAmount('')
    setTrxId('')
  }

  const getMethodNumber = (method: PaymentMethod) => {
    return method === 'bkash' ? paymentConfig.bkashNumber : paymentConfig.nagadNumber
  }

  const getMethodType = (method: PaymentMethod) => {
    return method === 'bkash' ? paymentConfig.bkashType : paymentConfig.nagadType
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Payments</h2>
        <p className="text-muted-foreground text-sm mt-1">Manage your balance and view transaction history</p>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/15">
                <Wallet className="size-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">৳{user?.balance.toFixed(2) ?? '0.00'}</p>
                <p className="text-xs text-muted-foreground">Current Balance</p>
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
                <p className="text-2xl font-bold">{pendingRequests.length}</p>
                <p className="text-xs text-muted-foreground">Pending Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/15">
                <ArrowUpRight className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{visibleTransactions.length}</p>
                <p className="text-xs text-muted-foreground">Transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="size-5" />
            Add Balance
          </CardTitle>
          <CardDescription>
            Send payment via bKash or Nagad, then submit your TrxID for admin approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button size="lg" onClick={handleOpenAddBalance} className="gap-2">
            <ArrowDownLeft className="size-4" />
            Add Balance
          </Button>
          {pendingRequests.length > 0 && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-3">
              <Clock className="size-4 text-amber-400" />
              <span className="text-sm text-amber-400">
                You have {pendingRequests.length} pending request{pendingRequests.length > 1 ? 's' : ''} awaiting admin approval
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Balance Requests */}
      {userRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Smartphone className="size-4" />
              My Balance Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>TrxID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userRequests.slice(0, 10).map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-mono text-xs">{req.trxId}</TableCell>
                      <TableCell className="font-semibold text-emerald-400">৳{req.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        {req.method === 'bkash' ? (
                          <Badge className="bg-[#E2136E]/20 text-[#E2136E] border-[#E2136E]/30 hover:bg-[#E2136E]/30">bKash</Badge>
                        ) : (
                          <Badge className="bg-[#F6921E]/20 text-[#F6921E] border-[#F6921E]/30 hover:bg-[#F6921E]/30">Nagad</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{req.submittedAt}</TableCell>
                      <TableCell>
                        {req.status === 'pending' && (
                          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Pending</Badge>
                        )}
                        {req.status === 'approved' && (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Approved</Badge>
                        )}
                        {req.status === 'rejected' && (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Rejected</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">{req.adminNote || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Transaction History</span>
            <Badge variant="outline" className="text-xs font-normal">
              Auto-deletes after {TRANSACTIONS_VANISH_DAYS} days
            </Badge>
          </CardTitle>
          <CardDescription>
            Transactions older than {TRANSACTIONS_VANISH_DAYS} days are automatically removed
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {visibleTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Wallet className="size-10 mb-3 opacity-30" />
              <p className="text-sm">No transactions in the last {TRANSACTIONS_VANISH_DAYS} days</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Vanishes in</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleTransactions.map((txn) => {
                    const daysLeft = getDaysBeforeVanish(txn.date)
                    return (
                      <TableRow key={txn.id}>
                        <TableCell>
                          <TypeBadge type={txn.type} />
                        </TableCell>
                        <TableCell>{txn.description}</TableCell>
                        <TableCell>
                          <AmountDisplay amount={txn.amount} type={txn.type} />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{txn.date}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {txn.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              daysLeft <= 7
                                ? 'border-red-500/30 text-red-400'
                                : daysLeft <= 30
                                ? 'border-amber-500/30 text-amber-400'
                                : 'border-emerald-500/30 text-emerald-400'
                            }`}
                          >
                            {daysLeft}d
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ══════════ Add Balance Dialog ══════════ */}
      <Dialog open={addBalanceOpen} onOpenChange={setAddBalanceOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="size-5" />
              Add Balance
            </DialogTitle>
            <DialogDescription>
              Select a payment method, send the amount, then submit your Transaction ID
            </DialogDescription>
          </DialogHeader>

          {!selectedMethod ? (
            /* ── Step 1: Select Payment Method ── */
            <div className="space-y-4">
              <p className="text-sm font-medium">Choose Payment Method</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedMethod('bkash')}
                  className="group relative flex flex-col items-center gap-3 rounded-xl border-2 border-border p-6 transition-all hover:border-[#E2136E] hover:bg-[#E2136E]/5 hover:shadow-lg hover:shadow-[#E2136E]/5"
                >
                  <BkashLogo className="h-10" />
                  <span className="text-xs text-muted-foreground group-hover:text-[#E2136E]">
                    {paymentConfig.bkashType === 'merchant' ? 'Merchant' : 'Personal'}
                  </span>
                </button>
                <button
                  onClick={() => setSelectedMethod('nagad')}
                  className="group relative flex flex-col items-center gap-3 rounded-xl border-2 border-border p-6 transition-all hover:border-[#F6921E] hover:bg-[#F6921E]/5 hover:shadow-lg hover:shadow-[#F6921E]/5"
                >
                  <NagadLogo className="h-10" />
                  <span className="text-xs text-muted-foreground group-hover:text-[#F6921E]">
                    {paymentConfig.nagadType === 'merchant' ? 'Merchant' : 'Personal'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            /* ── Step 2: Payment Details & TrxID Submit ── */
            <div className="space-y-5">
              {/* Selected Method Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedMethod === 'bkash' ? <BkashLogo className="h-8" /> : <NagadLogo className="h-8" />}
                  <Badge variant="outline" className="text-xs">
                    {getMethodType(selectedMethod) === 'merchant' ? 'Merchant' : 'Personal'}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMethod(null)}
                  className="text-xs text-muted-foreground"
                >
                  Change Method
                </Button>
              </div>

              {/* Number Display with Copy */}
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground mb-1.5">
                  Send payment to this number
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-mono font-bold tracking-wider">
                    {getMethodNumber(selectedMethod)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => handleCopy(getMethodNumber(selectedMethod), selectedMethod)}
                  >
                    {copiedField === selectedMethod ? (
                      <CheckCircle2 className="size-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                    {copiedField === selectedMethod ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>

              {/* Amount Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount (৳)</label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  step="1"
                />
                <div className="flex flex-wrap gap-2">
                  {presetAmounts.map((preset) => (
                    <Button
                      key={preset}
                      variant={amount === preset.toString() ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAmount(preset.toString())}
                    >
                      ৳{preset}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* TrxID Submission */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <AlertCircle className="size-3.5 text-amber-400" />
                  Transaction ID
                </label>
                <Input
                  placeholder={`Enter your ${selectedMethod === 'bkash' ? 'bKash' : 'Nagad'} TrxID`}
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  After sending payment, enter the Transaction ID from your {selectedMethod === 'bkash' ? 'bKash' : 'Nagad'} app.
                  Admin will verify and add balance to your account.
                </p>
              </div>

              {/* Info Box */}
              <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
                <AlertCircle className="size-4 text-primary mt-0.5 shrink-0" />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>1. Copy the number above</p>
                  <p>2. Send ৳{amount || '___'} via <strong>{selectedMethod === 'bkash' ? 'bKash' : 'Nagad'}</strong></p>
                  <p>3. Copy the TrxID from your payment receipt</p>
                  <p>4. Submit below — admin will approve shortly!</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {selectedMethod && (
              <>
                <Button variant="outline" onClick={() => setAddBalanceOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitTrx}
                  className="gap-1.5"
                  disabled={!amount || !trxId.trim()}
                >
                  <CheckCircle2 className="size-4" />
                  Submit Request
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
