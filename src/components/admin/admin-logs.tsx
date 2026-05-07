'use client'

import React, { useState, useMemo } from 'react'
import { mockActivityLogs } from '@/lib/mock-data'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ScrollText,
  Search,
  CalendarDays,
  Activity,
  User,
  DollarSign,
  Users,
  Filter,
} from 'lucide-react'

type LogType = 'normal' | 'paid' | 'referral'

interface LogEntry {
  id: string
  type: LogType
  user: string
  action: string
  timestamp: string
  ip: string
}

function TypeBadge({ type }: { type: LogType }) {
  switch (type) {
    case 'normal':
      return (
        <Badge variant="secondary" className="gap-1">
          <Activity className="size-3" />
          Normal
        </Badge>
      )
    case 'paid':
      return (
        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25 gap-1">
          <DollarSign className="size-3" />
          Paid
        </Badge>
      )
    case 'referral':
      return (
        <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25 gap-1">
          <Users className="size-3" />
          Referral
        </Badge>
      )
  }
}

function getRowClass(type: LogType): string {
  switch (type) {
    case 'paid':
      return 'bg-emerald-500/[0.03]'
    case 'referral':
      return 'bg-amber-500/[0.03]'
    default:
      return ''
  }
}

export function AdminLogs() {
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const logs: LogEntry[] = useMemo(() => {
    return [...mockActivityLogs].sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })
  }, [])

  const filteredLogs = useMemo(() => {
    let result = logs

    // Tab / type filter
    if (activeTab !== 'all') {
      result = result.filter((l) => l.type === activeTab)
    } else if (typeFilter !== 'all') {
      result = result.filter((l) => l.type === typeFilter)
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (l) =>
          l.user.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          l.ip.toLowerCase().includes(q)
      )
    }

    // Date range
    if (dateFrom) {
      result = result.filter((l) => l.timestamp >= dateFrom)
    }
    if (dateTo) {
      result = result.filter((l) => l.timestamp <= dateTo + ' 23:59:59')
    }

    return result
  }, [logs, activeTab, typeFilter, searchQuery, dateFrom, dateTo])

  // Stats
  const totalLogs = logs.length
  const normalCount = logs.filter((l) => l.type === 'normal').length
  const paidCount = logs.filter((l) => l.type === 'paid').length
  const referralCount = logs.filter((l) => l.type === 'referral').length

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setTypeFilter(value)
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Activity Logs</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Monitor user activity, payments, and referral events
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/15">
                <ScrollText className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalLogs}</p>
                <p className="text-xs text-muted-foreground">Total Logs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted/50">
                <Activity className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{normalCount}</p>
                <p className="text-xs text-muted-foreground">Normal</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/15">
                <DollarSign className="size-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{paidCount}</p>
                <p className="text-xs text-muted-foreground">Paid</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/15">
                <Users className="size-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{referralCount}</p>
                <p className="text-xs text-muted-foreground">Referral</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 flex-1">
              <Filter className="size-4 text-muted-foreground shrink-0" />
              <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setActiveTab(v); }}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 flex-1">
              <Search className="size-4 text-muted-foreground shrink-0" />
              <Input
                placeholder="Search user, action, IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-muted-foreground shrink-0" />
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-[150px]"
                placeholder="From"
              />
              <span className="text-muted-foreground text-sm">to</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-[150px]"
                placeholder="To"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs & Table */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="all" className="gap-1.5">
            <ScrollText className="size-3.5" />
            All
          </TabsTrigger>
          <TabsTrigger value="normal" className="gap-1.5">
            <Activity className="size-3.5" />
            Normal
          </TabsTrigger>
          <TabsTrigger value="paid" className="gap-1.5">
            <DollarSign className="size-3.5" />
            Paid
          </TabsTrigger>
          <TabsTrigger value="referral" className="gap-1.5">
            <Users className="size-3.5" />
            Referral
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity Log Entries</CardTitle>
              <CardDescription>
                Showing {filteredLogs.length} of {logs.length} entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <ScrollText className="size-12 mb-3 opacity-30" />
                  <p className="font-medium">No logs found</p>
                  <p className="text-sm">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>IP Address</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.map((log) => (
                        <TableRow key={log.id} className={getRowClass(log.type)}>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap font-mono text-xs">
                            {log.timestamp}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="size-3.5 text-muted-foreground" />
                              <span className="font-medium text-sm">{log.user}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm max-w-[300px]">
                            {log.action}
                          </TableCell>
                          <TableCell>
                            <TypeBadge type={log.type} />
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {log.ip}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
