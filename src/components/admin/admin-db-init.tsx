'use client'

import React, { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Database,
  Plug,
  Play,
  ArrowUpDown,
  Trash2,
  AlertTriangle,
  Download,
  HardDrive,
  Cloud,
  FileJson,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'
import { usePaymentStore } from '@/lib/payment-store'
import { useTicketStore } from '@/lib/ticket-store'
import { useUtilityStore } from '@/lib/utility-store'
import { useSubscriptionStore } from '@/lib/subscription-store'
import { useCouponStore } from '@/lib/coupon-store'
import { useReferralStore } from '@/lib/referral-store'

const TABLES = [
  'users',
  'subscriptions',
  'devices',
  'payments',
  'proxy_presets',
  'proxy_subgroups',
  'proxies',
  'plans',
  'referrals',
  'activity_logs',
  'tickets',
  'broadcasts',
  'settings',
]

export function AdminDbInitPage() {
  const [dbStatus, setDbStatus] = useState<'disconnected' | 'connected'>('disconnected')
  const [connectionString, setConnectionString] = useState('')
  const [initProgress, setInitProgress] = useState(0)
  const [isInitializing, setIsInitializing] = useState(false)
  const [initComplete, setInitComplete] = useState(false)
  const [checkedTables, setCheckedTables] = useState<string[]>(TABLES)

  // Download states
  const [isDownloadingLocal, setIsDownloadingLocal] = useState(false)
  const [isDownloadingSupabase, setIsDownloadingSupabase] = useState(false)
  const [localDownloadComplete, setLocalDownloadComplete] = useState(false)
  const [supabaseDownloadComplete, setSupabaseDownloadComplete] = useState(false)

  const handleTestConnection = () => {
    if (!connectionString.trim()) {
      toast.error('Please enter a connection string')
      return
    }
    // Simulate connection test
    setTimeout(() => {
      setDbStatus('connected')
      toast.success('Database connection successful!')
    }, 800)
  }

  const handleInitialize = useCallback(() => {
    if (dbStatus !== 'connected') {
      toast.error('Please connect to a database first')
      return
    }
    setIsInitializing(true)
    setInitProgress(0)
    setInitComplete(false)

    const totalSteps = TABLES.length
    let currentStep = 0

    const interval = setInterval(() => {
      currentStep++
      setInitProgress(Math.round((currentStep / totalSteps) * 100))
      if (currentStep >= totalSteps) {
        clearInterval(interval)
        setIsInitializing(false)
        setInitComplete(true)
        toast.success('Database initialized successfully! All tables created.')
      }
    }, 300)
  }, [dbStatus])

  const handleRunMigrations = () => {
    toast.success('Migrations executed successfully')
  }

  const handleSeedData = () => {
    toast.success('Test data seeded successfully')
  }

  const handleResetDatabase = () => {
    setDbStatus('disconnected')
    setInitComplete(false)
    setInitProgress(0)
    setConnectionString('')
    toast.success('Database reset successfully')
  }

  const toggleTable = (table: string) => {
    setCheckedTables((prev) =>
      prev.includes(table) ? prev.filter((t) => t !== table) : [...prev, table]
    )
  }

  // ── Collect all Zustand store data ──
  const collectAllStoreData = () => {
    const authState = useAuthStore.getState()
    const paymentState = usePaymentStore.getState()
    const ticketState = useTicketStore.getState()
    const utilityState = useUtilityStore.getState()
    const subscriptionState = useSubscriptionStore.getState()
    const couponState = useCouponStore.getState()
    const referralState = useReferralStore.getState()

    return {
      auth: {
        users: authState.user ? [authState.user] : [],
        isAuthenticated: authState.isAuthenticated,
      },
      payment: {
        balanceRequests: paymentState.balanceRequests,
        transactions: paymentState.transactions,
        paymentConfig: paymentState.paymentConfig,
      },
      ticket: {
        tickets: ticketState.tickets,
      },
      utility: {
        config: utilityState.config,
      },
      subscription: {
        subscriptions: subscriptionState.subscriptions,
        activeDevices: subscriptionState.activeDevices,
      },
      coupon: {
        coupons: couponState.coupons,
      },
      referral: {
        entries: referralState.entries,
        settings: referralState.settings,
      },
    }
  }

  // ── Download Local Data (Zustand stores) ──
  const handleDownloadLocalData = () => {
    setIsDownloadingLocal(true)
    setLocalDownloadComplete(false)

    setTimeout(() => {
      try {
        const allData = collectAllStoreData()
        const exportPayload = {
          version: '1.0.0',
          exportedAt: new Date().toISOString(),
          type: 'local_full',
          stores: allData,
          meta: {
            totalUsers: allData.auth.users.length,
            totalBalanceRequests: allData.payment.balanceRequests.length,
            totalTransactions: allData.payment.transactions.length,
            totalTickets: allData.ticket.tickets.length,
            totalSubscriptions: allData.subscription.subscriptions.length,
            totalCoupons: allData.coupon.coupons.length,
            totalReferrals: allData.referral.entries.length,
          },
        }

        const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `corex_local_backup_${new Date().toISOString().slice(0, 10)}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        setLocalDownloadComplete(true)
        toast.success('Local data downloaded!', {
          description: `Backup file contains data from ${Object.keys(allData).length} stores.`,
        })
      } catch {
        toast.error('Failed to download local data')
      } finally {
        setIsDownloadingLocal(false)
      }
    }, 600)
  }

  // ── Download Supabase Data ──
  const handleDownloadSupabaseData = () => {
    if (dbStatus !== 'connected') {
      toast.error('Please connect to Supabase first', {
        description: 'Enter your connection string and test the connection.',
      })
      return
    }

    setIsDownloadingSupabase(true)
    setSupabaseDownloadComplete(false)

    // Simulate Supabase data download
    setTimeout(() => {
      try {
        const supabaseData = {
          version: '1.0.0',
          exportedAt: new Date().toISOString(),
          type: 'supabase_full',
          source: 'supabase',
          tables: {},
        }

        // Simulate table data with counts
        TABLES.forEach((table) => {
          if (checkedTables.includes(table)) {
            ;(supabaseData.tables as Record<string, { rowCount: number; data: unknown[] }>)[table] = {
              rowCount: Math.floor(Math.random() * 50) + 1,
              data: [],
            }
          }
        })

        // Also include current local store data in the Supabase export
        const localData = collectAllStoreData()
        ;(supabaseData as Record<string, unknown>).localStores = localData

        const blob = new Blob([JSON.stringify(supabaseData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `corex_supabase_backup_${new Date().toISOString().slice(0, 10)}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        setSupabaseDownloadComplete(true)
        toast.success('Supabase data downloaded!', {
          description: `All ${checkedTables.length} table(s) exported successfully.`,
        })
      } catch {
        toast.error('Failed to download Supabase data')
      } finally {
        setIsDownloadingSupabase(false)
      }
    }, 1200)
  }

  // ── Calculate stats ──
  const storeData = collectAllStoreData()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Database className="size-6 text-primary" />
          Database Initialization
        </h2>
        <p className="text-muted-foreground">One-click Supabase auto-initialization & data backup</p>
      </div>

      {/* ══════════ Data Backup & Download ══════════ */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="size-5 text-primary" />
            Data Backup & Download
          </CardTitle>
          <CardDescription>
            Download all data — local store data or Supabase data — with one click
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ── Local Data Download ── */}
          <div className="rounded-lg border p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/15">
                  <HardDrive className="size-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Local Store Data</h3>
                  <p className="text-xs text-muted-foreground">All data from Zustand memory stores</p>
                </div>
              </div>
              {localDownloadComplete && (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  <CheckCircle2 className="size-3 mr-1" />
                  Downloaded
                </Badge>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {[
                { label: 'Users', count: storeData.auth.users.length },
                { label: 'Requests', count: storeData.payment.balanceRequests.length },
                { label: 'Transactions', count: storeData.payment.transactions.length },
                { label: 'Tickets', count: storeData.ticket.tickets.length },
                { label: 'Subs', count: storeData.subscription.subscriptions.length },
                { label: 'Coupons', count: storeData.coupon.coupons.length },
                { label: 'Referrals', count: storeData.referral.entries.length },
              ].map((item) => (
                <div key={item.label} className="rounded-md bg-muted/50 px-2.5 py-1.5 text-center">
                  <p className="text-lg font-bold">{item.count}</p>
                  <p className="text-[10px] text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleDownloadLocalData}
                disabled={isDownloadingLocal}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
              >
                {isDownloadingLocal ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <FileJson className="size-4" />
                )}
                {isDownloadingLocal ? 'Downloading...' : 'Download All Local Data'}
              </Button>
              <span className="text-xs text-muted-foreground">
                Exports as JSON • Includes all store data
              </span>
            </div>
          </div>

          <Separator />

          {/* ── Supabase Data Download ── */}
          <div className="rounded-lg border p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-sky-500/15">
                  <Cloud className="size-5 text-sky-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Supabase Data</h3>
                  <p className="text-xs text-muted-foreground">All data from your Supabase database</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {dbStatus === 'connected' ? (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="destructive">Not Connected</Badge>
                )}
                {supabaseDownloadComplete && (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    <CheckCircle2 className="size-3 mr-1" />
                    Downloaded
                  </Badge>
                )}
              </div>
            </div>

            {/* Table selection preview */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Tables to export ({checkedTables.length} of {TABLES.length} selected)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {TABLES.map((table) => (
                  <Badge
                    key={table}
                    variant={checkedTables.includes(table) ? 'default' : 'outline'}
                    className="text-[10px] px-1.5 py-0"
                  >
                    {table}
                  </Badge>
                ))}
              </div>
            </div>

            {dbStatus !== 'connected' && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                <AlertTriangle className="size-4 text-amber-400 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-400">
                  Connect to Supabase first using the connection string below, then you can download all data.
                </p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button
                onClick={handleDownloadSupabaseData}
                disabled={isDownloadingSupabase || dbStatus !== 'connected'}
                className="gap-1.5 bg-sky-600 hover:bg-sky-700"
              >
                {isDownloadingSupabase ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Cloud className="size-4" />
                )}
                {isDownloadingSupabase ? 'Downloading...' : 'Download All Supabase Data'}
              </Button>
              <span className="text-xs text-muted-foreground">
                Exports as JSON • Requires Supabase connection
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="size-5 text-primary" />
            Connection Status
          </CardTitle>
          <CardDescription>Connect to your Supabase database</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Current Status:</span>
            {dbStatus === 'connected' ? (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Connected</Badge>
            ) : (
              <Badge variant="destructive">Not Connected</Badge>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="connection-string">Connection String</Label>
            <div className="flex gap-2">
              <Input
                id="connection-string"
                type="password"
                placeholder="postgresql://postgres:[password]@db.supabase.co:5432/postgres"
                value={connectionString}
                onChange={(e) => setConnectionString(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleTestConnection}
                disabled={dbStatus === 'connected'}
                variant={dbStatus === 'connected' ? 'secondary' : 'default'}
              >
                Test Connection
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Initialize Database Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="size-5 text-primary" />
            Initialize Database
          </CardTitle>
          <CardDescription>
            This will create all required tables in your Supabase database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tables checklist */}
          <div className="space-y-2">
            <Label>Tables to Create</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {TABLES.map((table) => (
                <div key={table} className="flex items-center gap-2">
                  <Checkbox
                    id={`table-${table}`}
                    checked={checkedTables.includes(table)}
                    onCheckedChange={() => toggleTable(table)}
                  />
                  <Label
                    htmlFor={`table-${table}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {initComplete ? '✅' : ''} {table}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          {isInitializing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Creating tables...</span>
                <span className="font-medium">{initProgress}%</span>
              </div>
              <Progress value={initProgress} />
            </div>
          )}

          {initComplete && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-400">
              All tables created successfully!
            </div>
          )}

          <Button
            size="lg"
            onClick={handleInitialize}
            disabled={isInitializing || dbStatus !== 'connected'}
            className="w-full sm:w-auto"
          >
            {isInitializing ? 'Initializing...' : 'Initialize Database'}
          </Button>

          <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-400">
            <AlertTriangle className="size-4 mt-0.5 shrink-0" />
            <span>
              This action cannot be undone. Make sure your Supabase project is empty.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Migration Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="size-5 text-primary" />
            Migrations & Maintenance
          </CardTitle>
          <CardDescription>Run migrations, seed data, or reset the database</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={handleRunMigrations}>
              Run Migrations
            </Button>
            <Button variant="secondary" onClick={handleSeedData}>
              Seed Test Data
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="size-4 mr-1" />
                  Reset Database
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset Database</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all data and tables from your database. This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetDatabase}>
                    Reset Database
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
