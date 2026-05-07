'use client'

import React, { useState } from 'react'
import { useAuthStore } from '@/lib/auth-store'
import { mockSubscriptions, mockActiveDevices } from '@/lib/mock-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
} from 'lucide-react'

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
  const { user } = useAuthStore()
  const [configDialogOpen, setConfigDialogOpen] = useState(false)
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null)

  const activeSubscriptions = mockSubscriptions.filter((s) => s.status === 'active').length
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

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold">
          Welcome back, {user?.name?.split(' ')[0]}
        </h2>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your CoreX account.
        </p>
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
              {mockSubscriptions.map((sub) => (
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
    </div>
  )
}
