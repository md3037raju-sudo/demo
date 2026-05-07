'use client'

import React from 'react'
import { useAuthStore } from '@/lib/auth-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { Copy, Users, Gift } from 'lucide-react'

const mockReferrals = [
  { id: 1, user: 'Sarah Chen', date: '2025-02-08', status: 'completed' as const, reward: '$5.00' },
  { id: 2, user: 'Mike Johnson', date: '2025-02-05', status: 'completed' as const, reward: '$5.00' },
  { id: 3, user: 'Emily Davis', date: '2025-01-28', status: 'pending' as const, reward: '$5.00' },
  { id: 4, user: 'James Wilson', date: '2025-01-20', status: 'completed' as const, reward: '$5.00' },
  { id: 5, user: 'Lisa Anderson', date: '2025-01-15', status: 'completed' as const, reward: '$5.00' },
]

export function ReferralsPage() {
  const { user } = useAuthStore()

  const handleCopyCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode)
      toast.success('Referral code copied to clipboard!')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Referrals</h2>
      </div>

      {/* Referral Code Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="size-5" />
            Your Referral Code
          </CardTitle>
          <CardDescription>
            Share this code with friends. They&apos;ll get a discount, and you&apos;ll earn credits.
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
            Share this code with friends. They&apos;ll get a discount on their first
            subscription, and you&apos;ll earn $5.00 in credits for each successful referral.
          </p>
        </CardContent>
      </Card>

      {/* Stats Card */}
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
          <div className="text-2xl font-bold">{user?.totalReferrals ?? 0}</div>
        </CardContent>
      </Card>

      {/* Recent Referrals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Referrals</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
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
              {mockReferrals.map((ref) => (
                <TableRow key={ref.id}>
                  <TableCell className="font-medium">{ref.user}</TableCell>
                  <TableCell>{ref.date}</TableCell>
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
                  <TableCell className="text-emerald-400 font-medium">{ref.reward}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
