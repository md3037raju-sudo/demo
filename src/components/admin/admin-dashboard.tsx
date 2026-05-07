'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { useNavigationStore, type Page } from '@/lib/navigation-store'
import { mockActivityLogs } from '@/lib/mock-data'
import {
  Users,
  CreditCard,
  DollarSign,
  Smartphone,
  TrendingUp,
  AlertCircle,
  Clock,
  MessageSquare,
  ArrowRight,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts'

// Revenue chart data
const revenueData = [
  { month: 'Jan', revenue: 180 },
  { month: 'Feb', revenue: 220 },
  { month: 'Mar', revenue: 195 },
  { month: 'Apr', revenue: 310 },
  { month: 'May', revenue: 280 },
  { month: 'Jun', revenue: 362 },
]

// Subscription distribution data
const subscriptionData = [
  { name: 'Starter', value: 45, color: '#10b981' },
  { name: 'Pro', value: 156, color: '#14b8a6' },
  { name: 'Enterprise', value: 32, color: '#f59e0b' },
]

// User growth data
const userGrowthData = [
  { month: 'Nov', users: 3 },
  { month: 'Dec', users: 1 },
  { month: 'Jan', users: 2 },
  { month: 'Feb', users: 1 },
]

// Quick stats
const quickStats = [
  { label: 'User Retention', value: 78, color: 'bg-emerald-500' },
  { label: 'Payment Success Rate', value: 94, color: 'bg-teal-500' },
  { label: 'Server Uptime', value: 99.9, color: 'bg-amber-500' },
]

// Pending actions
const pendingActions = [
  { label: 'Pending Payments', count: 2, icon: DollarSign, page: 'admin/payments' as Page, color: 'text-amber-500' },
  { label: 'Open Tickets', count: 2, icon: MessageSquare, page: 'admin/tickets' as Page, color: 'text-red-400' },
  { label: 'Expiring Subscriptions', count: 1, icon: Clock, page: 'admin/subscriptions' as Page, color: 'text-orange-400' },
]

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card px-3 py-2 shadow-md">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-bold">${payload[0].value}</p>
      </div>
    )
  }
  return null
}

function BarTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card px-3 py-2 shadow-md">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-bold">{payload[0].value} users</p>
      </div>
    )
  }
  return null
}

export function AdminDashboard() {
  const { navigate } = useNavigationStore()
  const recentLogs = mockActivityLogs.slice(0, 5)

  const getLogTypeIcon = (type: string) => {
    switch (type) {
      case 'paid':
        return <DollarSign className="size-3.5 text-emerald-500" />
      case 'referral':
        return <Users className="size-3.5 text-teal-500" />
      default:
        return <AlertCircle className="size-3.5 text-muted-foreground" />
    }
  }

  const getLogTypeBadge = (type: string) => {
    switch (type) {
      case 'paid':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">Payment</Badge>
      case 'referral':
        return <Badge className="bg-teal-500/10 text-teal-500 border-teal-500/20 text-[10px]">Referral</Badge>
      default:
        return <Badge variant="outline" className="text-[10px]">Activity</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold">7</p>
                <p className="text-xs text-emerald-500 flex items-center gap-1">
                  <TrendingUp className="size-3" />
                  +2 this week
                </p>
              </div>
              <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/10">
                <Users className="size-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                <p className="text-3xl font-bold">4</p>
                <p className="text-xs text-muted-foreground">
                  Revenue: <span className="text-emerald-500 font-medium">$369.96</span>
                </p>
              </div>
              <div className="flex size-12 items-center justify-center rounded-xl bg-teal-500/10">
                <CreditCard className="size-6 text-teal-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold">$1,247<span className="text-lg">.50</span></p>
                <p className="text-xs text-emerald-500 flex items-center gap-1">
                  <TrendingUp className="size-3" />
                  +15.3% from last month
                </p>
              </div>
              <div className="flex size-12 items-center justify-center rounded-xl bg-amber-500/10">
                <DollarSign className="size-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Active Devices</p>
                <p className="text-3xl font-bold">3</p>
                <p className="text-xs text-muted-foreground">
                  Across all users
                </p>
              </div>
              <div className="flex size-12 items-center justify-center rounded-xl bg-cyan-500/10">
                <Smartphone className="size-6 text-cyan-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>Monthly revenue for the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#0f172a' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Business Metrics */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Subscription Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Distribution</CardTitle>
            <CardDescription>Plan breakdown across all users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="h-[200px] w-[200px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subscriptionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {subscriptionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [`${value} subscribers`, name]}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-3">
                {subscriptionData.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div
                      className="size-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.value} subscribers
                      </p>
                    </div>
                  </div>
                ))}
                <Separator className="my-1" />
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-muted-foreground/30" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Total</p>
                    <p className="text-xs text-muted-foreground">
                      {subscriptionData.reduce((sum, d) => sum + d.value, 0)} subscribers
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Growth */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>New user registrations per month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userGrowthData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<BarTooltip />} />
                  <Bar dataKey="users" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {quickStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <span className="text-2xl font-bold">{stat.value}%</span>
                </div>
                <Progress value={stat.value} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity & Pending Actions */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
                    {getLogTypeIcon(log.type)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{log.user}</p>
                      {getLogTypeBadge(log.type)}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {log.action}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60">
                      {log.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Actions</CardTitle>
            <CardDescription>Items requiring admin attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="w-full justify-between h-auto py-3 px-4 hover:bg-muted/50"
                  onClick={() => navigate(action.page)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                      <action.icon className={`size-4 ${action.color}`} />
                    </div>
                    <span className="text-sm font-medium">{action.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="font-bold"
                    >
                      {action.count}
                    </Badge>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
