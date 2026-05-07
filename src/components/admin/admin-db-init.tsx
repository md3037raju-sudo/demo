'use client'

import React, { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Database, Plug, Play, ArrowUpDown, Trash2, AlertTriangle } from 'lucide-react'

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Database className="size-6 text-primary" />
          Database Initialization
        </h2>
        <p className="text-muted-foreground">One-click Supabase auto-initialization</p>
      </div>

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
