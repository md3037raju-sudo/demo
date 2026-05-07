'use client'

import React from 'react'
import { mockSubscriptions } from '@/lib/mock-data'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { Settings, Monitor } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

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

function getRenewableUntil(expiryDate: string): string | null {
  const expiry = new Date(expiryDate)
  const renewableUntil = new Date(expiry)
  renewableUntil.setDate(renewableUntil.getDate() + 60)
  const now = new Date()

  if (now > expiry && now <= renewableUntil) {
    return renewableUntil.toISOString().split('T')[0]
  }
  return null
}

export function SubscriptionsPage() {
  const [configDialogOpen, setConfigDialogOpen] = React.useState(false)
  const [selectedSubId, setSelectedSubId] = React.useState<string | null>(null)

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

  const activeCount = mockSubscriptions.filter((s) => s.status === 'active').length
  const expiredCount = mockSubscriptions.filter((s) => s.status === 'expired').length
  const renewableCount = mockSubscriptions.filter((s) => s.status === 'renewable').length
  const totalSpent = mockSubscriptions.reduce((sum, s) => sum + s.price, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Subscription History</h2>
        <p className="text-muted-foreground">
          Subscriptions are renewable within 60 days of expiry
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <Settings className="size-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="text-xl font-bold">{activeCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-red-500/10">
              <Monitor className="size-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Expired</p>
              <p className="text-xl font-bold">{expiredCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Settings className="size-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Renewable</p>
              <p className="text-xl font-bold">{renewableCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-teal-500/10">
              <Settings className="size-5 text-teal-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Spent</p>
              <p className="text-xl font-bold">৳{totalSpent.toFixed(2)}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions</CardTitle>
          <CardDescription>Your complete subscription history</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Devices</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Renewable Until</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSubscriptions.map((sub) => {
                const renewableUntil = getRenewableUntil(sub.expiryDate)
                return (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.name}</TableCell>
                    <TableCell>{sub.plan}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Monitor className="size-3.5 text-muted-foreground" />
                        <span>{1}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(sub.status)}</TableCell>
                    <TableCell>{sub.startDate}</TableCell>
                    <TableCell>{sub.expiryDate}</TableCell>
                    <TableCell className="font-medium">৳{sub.price.toFixed(2)}</TableCell>
                    <TableCell>
                      {renewableUntil ? (
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30">
                          Until {renewableUntil}
                        </Badge>
                      ) : sub.status === 'expired' ? (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30">
                          Expired
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {sub.status === 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => handleConfigure(sub.id)}
                        >
                          <Settings className="size-3.5" />
                          Configure
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
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
