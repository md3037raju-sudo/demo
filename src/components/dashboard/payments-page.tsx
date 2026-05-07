'use client'

import React, { useState } from 'react'
import { useAuthStore } from '@/lib/auth-store'
import { mockTransactions } from '@/lib/mock-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { toast } from 'sonner'
import { Wallet } from 'lucide-react'

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

const presetAmounts = [10, 25, 50, 100, 250]

export function PaymentsPage() {
  const { user } = useAuthStore()
  const [amount, setAmount] = useState('')
  const [balance, setBalance] = useState(user?.balance ?? 0)

  const handlePresetAmount = (value: number) => {
    setAmount(value.toString())
  }

  const handleAddBalance = () => {
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    setBalance((prev) => prev + numAmount)
    toast.success(`৳${numAmount.toFixed(2)} added to your balance!`)
    setAmount('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Payments</h2>
      </div>

      {/* Add Balance Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="size-5" />
            Add Balance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
            <Button onClick={handleAddBalance}>Add Balance</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {presetAmounts.map((preset) => (
              <Button
                key={preset}
                variant="outline"
                size="sm"
                onClick={() => handlePresetAmount(preset)}
              >
                ৳{preset}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Current balance:</span>
            <span className="text-lg font-bold text-emerald-400">৳{balance.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell className="font-mono text-xs">{txn.id}</TableCell>
                  <TableCell>
                    <TypeBadge type={txn.type} />
                  </TableCell>
                  <TableCell>{txn.description}</TableCell>
                  <TableCell>
                    <AmountDisplay amount={txn.amount} type={txn.type} />
                  </TableCell>
                  <TableCell>{txn.date}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {txn.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
