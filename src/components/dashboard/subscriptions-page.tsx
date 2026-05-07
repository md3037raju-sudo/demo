'use client'

import React from 'react'
import { mockSubscriptions } from '@/lib/mock-data'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Subscription History</h2>
        <p className="text-muted-foreground">
          Subscriptions are renewable within 60 days of expiry
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Renewable Until</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSubscriptions.map((sub) => {
                const renewableUntil = getRenewableUntil(sub.expiryDate)
                return (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.name}</TableCell>
                    <TableCell>{sub.plan}</TableCell>
                    <TableCell>{getStatusBadge(sub.status)}</TableCell>
                    <TableCell>{sub.startDate}</TableCell>
                    <TableCell>{sub.expiryDate}</TableCell>
                    <TableCell>${sub.price.toFixed(2)}</TableCell>
                    <TableCell>
                      {renewableUntil ? (
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30">
                          Renewable until {renewableUntil}
                        </Badge>
                      ) : sub.status === 'expired' ? (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30">
                          Expired
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
