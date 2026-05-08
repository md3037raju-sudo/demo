'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
  RefreshCw,
  Copy,
  Zap,
} from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'
import { usePaymentStore } from '@/lib/payment-store'
import { useTicketStore } from '@/lib/ticket-store'
import { useUtilityStore } from '@/lib/utility-store'
import { useSubscriptionStore } from '@/lib/subscription-store'
import { useCouponStore } from '@/lib/coupon-store'
import { useReferralStore } from '@/lib/referral-store'
import { COREX_TABLES } from '@/lib/supabase-schema'
import { forceResyncAllStores } from '@/lib/sync-all'

export function AdminDbInitPage() {
  // Connection states
  const [dbStatus, setDbStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
  const [connectionError, setConnectionError] = useState('')

  // Init states
  const [initProgress, setInitProgress] = useState(0)
  const [isInitializing, setIsInitializing] = useState(false)
  const [initComplete, setInitComplete] = useState(false)
  const [initMessage, setInitMessage] = useState('')

  // Table status
  const [tableStatus, setTableStatus] = useState<Record<string, boolean>>({})
  const [isLoadingStatus, setIsLoadingStatus] = useState(false)

  // Seed states
  const [isSeeding, setIsSeeding] = useState(false)
  const [seedComplete, setSeedComplete] = useState(false)

  // Download states
  const [isDownloadingLocal, setIsDownloadingLocal] = useState(false)
  const [isDownloadingSupabase, setIsDownloadingSupabase] = useState(false)
  const [localDownloadComplete, setLocalDownloadComplete] = useState(false)
  const [supabaseDownloadComplete, setSupabaseDownloadComplete] = useState(false)

  // Supabase config status
  const [supabaseConfig, setSupabaseConfig] = useState<{
    configured: boolean
    hasUrl: boolean
    hasAnonKey: boolean
    hasServiceKey: boolean
    anonKeyFormat: string
    serviceKeyFormat: string
    isModernKeys: boolean
    issues: string[]
    urlMasked: string
    anonKeyHint: string
  } | null>(null)

  // Auto-check connection on mount
  useEffect(() => {
    checkSupabaseConfig()
    checkConnection()
  }, [])

  const checkSupabaseConfig = async () => {
    try {
      const res = await fetch('/api/supabase/config')
      const data = await res.json()
      setSupabaseConfig(data)
    } catch {
      // ignore
    }
  }

  const checkConnection = async () => {
    setIsLoadingStatus(true)
    try {
      const res = await fetch('/api/db-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'status' }),
      })
      const data = await res.json()

      if (data.connected) {
        setDbStatus('connected')
        setTableStatus(data.tables || {})
        if (data.allExist) {
          setInitComplete(true)
        }
      } else {
        setDbStatus('error')
        setConnectionError('Could not connect to Supabase')
      }
    } catch {
      setDbStatus('disconnected')
    } finally {
      setIsLoadingStatus(false)
    }
  }

  // ── Initialize Database (uses Management API, no password needed) ──
  const handleInitialize = useCallback(async () => {
    setIsInitializing(true)
    setInitProgress(0)
    setInitComplete(false)
    setInitMessage('')

    try {
      const progressInterval = setInterval(() => {
        setInitProgress((prev) => Math.min(prev + 2, 90))
      }, 500)

      const res = await fetch('/api/db-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'init' }),
      })

      clearInterval(progressInterval)

      const data = await res.json()

      if (data.success) {
        setInitProgress(100)
        setInitComplete(true)
        setInitMessage(data.message || `All ${COREX_TABLES.length} tables created!`)
        toast.success('Database initialized successfully!', {
          description: data.message,
        })
        await checkConnection()
        // Sync all stores with the newly created database
        await forceResyncAllStores()
      } else {
        setInitProgress(0)
        setInitMessage('')
        toast.error('Initialization failed', {
          description: data.error || data.errors?.join(', ') || 'Unknown error',
        })
        setConnectionError(data.error || data.errors?.join(', ') || 'Unknown error')
      }
    } catch (err) {
      setInitProgress(0)
      toast.error('Connection failed', {
        description: String(err),
      })
    } finally {
      setIsInitializing(false)
    }
  }, [])

  // ── Seed Mock Data ──
  const handleSeedData = async () => {
    setIsSeeding(true)
    setSeedComplete(false)
    try {
      const res = await fetch('/api/db-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed' }),
      })
      const data = await res.json()

      if (data.success) {
        setSeedComplete(true)
        toast.success('Mock data seeded!', {
          description: 'All tables populated with sample data.',
        })
        // Re-sync stores to pick up the seeded data
        await forceResyncAllStores()
      } else {
        toast.error('Seeding failed', {
          description: data.errors?.join(', ') || data.message,
        })
      }
    } catch (err) {
      toast.error('Seeding failed', { description: String(err) })
    } finally {
      setIsSeeding(false)
    }
  }

  // ── Reset Database ──
  const handleResetDatabase = async () => {
    try {
      const res = await fetch('/api/db-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      })
      const data = await res.json()

      if (data.success) {
        setDbStatus('connected')
        setInitComplete(false)
        setInitProgress(0)
        setSeedComplete(false)
        setInitMessage('')
        setTableStatus({})
        toast.success('Database reset!', {
          description: 'All tables dropped successfully.',
        })
        await checkConnection()
      } else {
        toast.error('Reset failed', {
          description: data.error || data.details || 'Unknown error',
        })
      }
    } catch (err) {
      toast.error('Reset failed', { description: String(err) })
    }
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
      },
      coupon: {
        coupons: couponState.coupons,
      },
      referral: {
        entries: referralState.referrals,
        settings: referralState.settings,
      },
    }
  }

  // ── Download Local Data ──
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
        toast.success('Local data downloaded!')
      } catch {
        toast.error('Failed to download local data')
      } finally {
        setIsDownloadingLocal(false)
      }
    }, 600)
  }

  // ── Download Supabase Data ──
  const handleDownloadSupabaseData = async () => {
    if (dbStatus !== 'connected') {
      toast.error('Connect to Supabase first')
      return
    }

    setIsDownloadingSupabase(true)
    setSupabaseDownloadComplete(false)

    try {
      // Fetch all table data from Supabase
      const tableData: Record<string, unknown[]> = {}
      for (const table of COREX_TABLES) {
        try {
          const res = await fetch(`/api/supabase?table=${table}`)
          const data = await res.json()
          tableData[table] = data.data || []
        } catch {
          tableData[table] = []
        }
      }

      const localData = collectAllStoreData()
      const supabaseExport = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        type: 'supabase_full',
        source: 'supabase',
        tables: tableData,
        localStores: localData,
      }

      const blob = new Blob([JSON.stringify(supabaseExport, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `corex_supabase_backup_${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setSupabaseDownloadComplete(true)
      toast.success('Supabase data downloaded!')
    } catch {
      toast.error('Failed to download Supabase data')
    } finally {
      setIsDownloadingSupabase(false)
    }
  }

  // ── Copy SQL to clipboard ──
  const handleCopySQL = async () => {
    try {
      const { COREX_SCHEMA_SQL } = await import('@/lib/supabase-schema')
      await navigator.clipboard.writeText(COREX_SCHEMA_SQL)
      toast.success('SQL copied to clipboard!', {
        description: 'You can paste it into the Supabase SQL Editor.',
      })
    } catch {
      toast.error('Failed to copy SQL')
    }
  }

  // ── Calculate stats ──
  const storeData = collectAllStoreData()
  const existingTableCount = Object.values(tableStatus).filter(Boolean).length
  const totalTableCount = COREX_TABLES.length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Database className="size-6 text-primary" />
          Database Initialization
        </h2>
        <p className="text-muted-foreground">
          One-click Supabase auto-initialization — no password needed
        </p>
      </div>

      {/* ══════════ Supabase Connection ══════════ */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="size-5 text-primary" />
            Supabase Connection
          </CardTitle>
          <CardDescription>
            All credentials are configured in your .env.local. Click Initialize to create all tables.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Config Status */}
          {supabaseConfig && !supabaseConfig.configured && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 space-y-2">
              <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
                <AlertTriangle className="size-4" />
                Supabase Credentials Not Configured
              </div>
              <p className="text-xs text-red-400/80">
                Some keys in your <code className="bg-muted px-1 rounded">.env.local</code> are missing or invalid.
              </p>
              <div className="space-y-1.5 mt-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className={`size-2 rounded-full ${supabaseConfig.hasUrl ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  <span className={supabaseConfig.hasUrl ? 'text-emerald-400' : 'text-red-400'}>
                    Project URL: {supabaseConfig.hasUrl ? '✓ Valid' : '✗ Missing or invalid'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`size-2 rounded-full ${supabaseConfig.hasAnonKey ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  <span className={supabaseConfig.hasAnonKey ? 'text-emerald-400' : 'text-red-400'}>
                    Publishable Key: {supabaseConfig.hasAnonKey ? '✓ Valid' : `✗ Missing or invalid`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`size-2 rounded-full ${supabaseConfig.hasServiceKey ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  <span className={supabaseConfig.hasServiceKey ? 'text-emerald-400' : 'text-red-400'}>
                    Secret Key: {supabaseConfig.hasServiceKey ? '✓ Valid' : '✗ Missing or invalid'}
                  </span>
                </div>
              </div>
              <div className="mt-3 rounded-md bg-muted/50 p-3 text-xs space-y-2">
                <p className="font-semibold text-foreground">How to get the correct keys:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Go to <strong>supabase.com</strong> → Your Project → <strong>Settings</strong> → <strong>API</strong></li>
                  <li>Copy <strong>Project URL</strong> → paste as <code className="bg-muted px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code></li>
                  <li>Copy <strong>Publishable Key</strong> (sb_publishable_...) → paste as <code className="bg-muted px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
                  <li>Copy <strong>Secret Key</strong> (sb_secret_...) → paste as <code className="bg-muted px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code></li>
                </ol>
              </div>
            </div>
          )}

          {/* Modern Keys Detected Banner */}
          {supabaseConfig && supabaseConfig.configured && supabaseConfig.isModernKeys && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-center gap-2 text-sm text-emerald-400">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>Supabase connected with modern keys (<code className="bg-muted/50 px-1 rounded text-xs">sb_publishable/sb_secret</code>)</span>
            </div>
          )}

          {/* Current Config Display */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-lg border p-3 space-y-1">
              <p className="text-xs text-muted-foreground">Project URL</p>
              <p className="text-xs font-mono truncate">
                {supabaseConfig?.urlMasked || 'Checking...'}
              </p>
            </div>
            <div className="rounded-lg border p-3 space-y-1">
              <div className="flex items-center gap-1">
                <p className="text-xs text-muted-foreground">{supabaseConfig?.isModernKeys ? 'Publishable Key' : 'Anon Key'}</p>
                {supabaseConfig && (
                  <span className={`size-1.5 rounded-full ${supabaseConfig.hasAnonKey ? 'bg-emerald-400' : 'bg-red-400'}`} />
                )}
              </div>
              <p className="text-xs font-mono truncate">
                {supabaseConfig?.anonKeyHint || 'Checking...'}...
              </p>
            </div>
            <div className="rounded-lg border p-3 space-y-1">
              <div className="flex items-center gap-1">
                <p className="text-xs text-muted-foreground">{supabaseConfig?.isModernKeys ? 'Secret Key' : 'Service Role'}</p>
                {supabaseConfig && (
                  <span className={`size-1.5 rounded-full ${supabaseConfig.hasServiceKey ? 'bg-emerald-400' : 'bg-red-400'}`} />
                )}
              </div>
              <p className="text-xs font-mono truncate">
                {supabaseConfig?.hasServiceKey ? '••••••••••••' : 'Not set'}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Status:</span>
            {dbStatus === 'connected' ? (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                <CheckCircle2 className="size-3 mr-1" />
                Connected
              </Badge>
            ) : dbStatus === 'connecting' ? (
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                <Loader2 className="size-3 mr-1 animate-spin" />
                Connecting...
              </Badge>
            ) : dbStatus === 'error' ? (
              <Badge variant="destructive">Error</Badge>
            ) : (
              <Badge variant="outline">Not Connected</Badge>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={checkConnection}
              disabled={isLoadingStatus}
              className="gap-1"
            >
              <RefreshCw className={`size-3.5 ${isLoadingStatus ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Table Status Summary */}
          {dbStatus === 'connected' && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Tables:</span>
              <span className="font-medium">{existingTableCount} / {totalTableCount}</span>
              {existingTableCount === totalTableCount ? (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                  All tables exist
                </Badge>
              ) : (
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">
                  Needs initialization
                </Badge>
              )}
            </div>
          )}

          {/* Table Status Grid */}
          {Object.keys(tableStatus).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {COREX_TABLES.map((table) => (
                <Badge
                  key={table}
                  variant={tableStatus[table] ? 'default' : 'outline'}
                  className={`text-[10px] px-1.5 py-0 ${
                    tableStatus[table]
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : ''
                  }`}
                >
                  {tableStatus[table] ? '✓' : '○'} {table}
                </Badge>
              ))}
            </div>
          )}

          {connectionError && (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2">
              <AlertTriangle className="size-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-xs text-red-400">{connectionError}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ══════════ Initialize Database ══════════ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="size-5 text-primary" />
            One-Click Initialize
          </CardTitle>
          <CardDescription>
            Creates all 19 tables, indexes, RLS policies, and seed data automatically via Supabase Management API.
            No password needed — everything is configured in your <code className="bg-muted px-1 rounded">.env.local</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Initialize Button */}
          <Button
            size="lg"
            onClick={handleInitialize}
            disabled={isInitializing}
            className="w-full sm:w-auto gap-2"
          >
            {isInitializing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Initializing...
              </>
            ) : (
              <>
                <Zap className="size-4" />
                Initialize Database
              </>
            )}
          </Button>

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
              <CheckCircle2 className="size-4 inline mr-1" />
              {initMessage || 'All tables created successfully!'}
            </div>
          )}

          {/* Post-init actions */}
          {initComplete && !seedComplete && (
            <div className="space-y-3">
              <Separator />
              <div>
                <h3 className="text-sm font-semibold mb-2">Next Step: Seed Data</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Tables are created but empty. Seed mock data to test the website.
                </p>
                <Button
                  onClick={handleSeedData}
                  disabled={isSeeding}
                  variant="secondary"
                  className="gap-2"
                >
                  {isSeeding ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Play className="size-4" />
                  )}
                  {isSeeding ? 'Seeding...' : 'Seed Mock Data'}
                </Button>
              </div>
            </div>
          )}

          {seedComplete && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-400">
              <CheckCircle2 className="size-4 inline mr-1" />
              Mock data seeded! Your website is now fully connected with Supabase.
            </div>
          )}

          <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-400">
            <AlertTriangle className="size-4 mt-0.5 shrink-0" />
            <span>
              Initialization uses the Supabase Management API. Your access token is stored in <code className="bg-muted px-1 rounded">.env.local</code> and never exposed to the browser.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ══════════ Data Backup & Download ══════════ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="size-5 text-primary" />
            Data Backup & Download
          </CardTitle>
          <CardDescription>
            Download all data — local store data or Supabase data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Local Data Download */}
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
                {isDownloadingLocal ? 'Downloading...' : 'Download Local Data'}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Supabase Data Download */}
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
                {isDownloadingSupabase ? 'Downloading...' : 'Download Supabase Data'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ══════════ Advanced / Manual SQL ══════════ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="size-5 text-primary" />
            Advanced & Manual Setup
          </CardTitle>
          <CardDescription>
            If auto-init doesn&apos;t work, you can manually run the SQL in Supabase SQL Editor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={handleCopySQL} className="gap-2">
              <Copy className="size-4" />
              Copy SQL Schema
            </Button>
            <Button variant="secondary" onClick={handleSeedData} disabled={isSeeding || dbStatus !== 'connected'} className="gap-2">
              {isSeeding ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
              Re-seed Data
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="size-4" />
                  Reset Database
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset Database</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all data and tables from your Supabase database. This action
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

          <div className="flex items-start gap-2 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 text-sm text-blue-400">
            <Database className="size-4 mt-0.5 shrink-0" />
            <span>
              <strong>Manual setup:</strong> Copy the SQL schema above, go to your Supabase Dashboard → SQL Editor,
              paste and run it. Then come back here and click &quot;Re-seed Data&quot; to populate the tables.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
