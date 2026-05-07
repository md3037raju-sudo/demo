'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Settings,
  AlertTriangle,
  Wrench,
  Users,
  Bell,
  Shield,
  RefreshCcw,
  UserCheck,
  Smartphone,
  Globe,
  Gauge,
  Plus,
  Trash2,
  Save,
  Info,
  AlertCircle,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Admin2faSettings } from './admin-2fa-settings'

interface Alert {
  id: string
  message: string
  type: 'info' | 'warning' | 'error'
  target: 'all' | 'premium'
  active: boolean
  expiry: string
}

const initialAlerts: Alert[] = [
  {
    id: 'alert_001',
    message: 'Server maintenance scheduled for Feb 15, 2025',
    type: 'warning',
    target: 'all',
    active: true,
    expiry: '2025-02-16',
  },
]

export function AdminRules() {
  // Maintenance Mode
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false)
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    'We are currently performing scheduled maintenance. Please check back shortly.'
  )
  const [maintenanceDowntime, setMaintenanceDowntime] = useState('2 hours')

  // Referral Settings
  const [commissionPercent, setCommissionPercent] = useState('5')
  const [minWithdrawal, setMinWithdrawal] = useState('10')
  const [maxCommissionPerReferral, setMaxCommissionPerReferral] = useState('5')
  const [commissionType, setCommissionType] = useState('percentage')

  // Global Alerts
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts)
  const [showAlertForm, setShowAlertForm] = useState(false)
  const [newAlertMessage, setNewAlertMessage] = useState('')
  const [newAlertType, setNewAlertType] = useState<'info' | 'warning' | 'error'>('info')
  const [newAlertTarget, setNewAlertTarget] = useState<'all' | 'premium'>('all')
  const [newAlertActive, setNewAlertActive] = useState(true)
  const [newAlertExpiry, setNewAlertExpiry] = useState('')

  // Suggested Rules
  const [autoRenewal, setAutoRenewal] = useState(false)
  const [newUserVerification, setNewUserVerification] = useState(true)
  const [maxDevices, setMaxDevices] = useState('3')
  const [ipRestriction, setIpRestriction] = useState(false)
  const [rateLimit, setRateLimit] = useState('100')
  const [rateLimitWindow, setRateLimitWindow] = useState('15')

  const handleApplyMaintenance = () => {
    toast.success(
      maintenanceEnabled
        ? 'Maintenance mode enabled'
        : 'Maintenance mode disabled',
      {
        description: maintenanceEnabled
          ? 'Users will see the maintenance page.'
          : 'Site is now live for all users.',
      }
    )
  }

  const handleSaveReferralSettings = () => {
    toast.success('Referral settings saved', {
      description: `Commission: ${commissionType === 'percentage' ? commissionPercent + '%' : '$' + commissionPercent}, Min withdrawal: $${minWithdrawal}`,
    })
  }

  const handleAddAlert = () => {
    if (!newAlertMessage.trim()) {
      toast.error('Alert message is required')
      return
    }
    const newAlert: Alert = {
      id: `alert_${Date.now()}`,
      message: newAlertMessage,
      type: newAlertType,
      target: newAlertTarget,
      active: newAlertActive,
      expiry: newAlertExpiry || 'Never',
    }
    setAlerts((prev) => [...prev, newAlert])
    setNewAlertMessage('')
    setNewAlertType('info')
    setNewAlertTarget('all')
    setNewAlertActive(true)
    setNewAlertExpiry('')
    setShowAlertForm(false)
    toast.success('New alert added')
  }

  const handleDeleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
    toast.success('Alert deleted')
  }

  const handleToggleAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    )
  }

  const handleSaveSuggestedRules = () => {
    toast.success('Suggested rules saved', {
      description: 'All rule changes have been applied.',
    })
  }

  function AlertTypeBadge({ type }: { type: 'info' | 'warning' | 'error' }) {
    switch (type) {
      case 'info':
        return (
          <Badge className="bg-sky-500/15 text-sky-400 border-sky-500/30 gap-1">
            <Info className="size-3" />
            Info
          </Badge>
        )
      case 'warning':
        return (
          <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 gap-1">
            <AlertCircle className="size-3" />
            Warning
          </Badge>
        )
      case 'error':
        return (
          <Badge className="bg-red-500/15 text-red-400 border-red-500/30 gap-1">
            <XCircle className="size-3" />
            Error
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Rules & Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure platform rules, maintenance mode, and global settings
        </p>
      </div>

      {/* 1. Maintenance Mode */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/15">
              <Wrench className="size-5 text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Maintenance Mode</CardTitle>
              <CardDescription>Take the platform offline for maintenance</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Switch
                checked={maintenanceEnabled}
                onCheckedChange={setMaintenanceEnabled}
              />
              <Label htmlFor="maintenance" className="font-medium">
                Enable Maintenance Mode
              </Label>
            </div>
          </div>

          {maintenanceEnabled && (
            <div className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
              <AlertTriangle className="size-5 text-amber-400 shrink-0" />
              <p className="text-sm text-amber-200">
                Maintenance mode is <span className="font-semibold">active</span>. All users will see the maintenance page.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Maintenance Page Message</Label>
            <Textarea
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              placeholder="Enter maintenance page message..."
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Estimated Downtime</Label>
            <Input
              value={maintenanceDowntime}
              onChange={(e) => setMaintenanceDowntime(e.target.value)}
              placeholder="e.g. 2 hours"
            />
          </div>

          <Button onClick={handleApplyMaintenance} className="gap-2">
            <Save className="size-4" />
            Apply
          </Button>
        </CardContent>
      </Card>

      {/* 2. Referral Settings */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/15">
              <Users className="size-5 text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Referral Settings</CardTitle>
              <CardDescription>Configure referral commission and withdrawal rules</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Commission Percentage</Label>
              <div className="relative">
                <Input
                  type="number"
                  value={commissionPercent}
                  onChange={(e) => setCommissionPercent(e.target.value)}
                  min="0"
                  max="100"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  %
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Minimum Withdrawal Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  $
                </span>
                <Input
                  type="number"
                  value={minWithdrawal}
                  onChange={(e) => setMinWithdrawal(e.target.value)}
                  className="pl-7"
                  min="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Max Commission Per Referral</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  $
                </span>
                <Input
                  type="number"
                  value={maxCommissionPerReferral}
                  onChange={(e) => setMaxCommissionPerReferral(e.target.value)}
                  className="pl-7"
                  min="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Commission Type</Label>
              <Select value={commissionType} onValueChange={setCommissionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleSaveReferralSettings} className="gap-2">
            <Save className="size-4" />
            Save Settings
          </Button>
        </CardContent>
      </Card>

      {/* 3. Global Alerts */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-sky-500/15">
                <Bell className="size-5 text-sky-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Global Alerts</CardTitle>
                <CardDescription>Manage platform-wide user notifications</CardDescription>
              </div>
            </div>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => setShowAlertForm(!showAlertForm)}
            >
              <Plus className="size-3.5" />
              Add New Alert
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Alert Form */}
          {showAlertForm && (
            <div className="space-y-4 rounded-lg border border-border p-4 bg-muted/20">
              <h4 className="font-medium text-sm">New Alert</h4>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  value={newAlertMessage}
                  onChange={(e) => setNewAlertMessage(e.target.value)}
                  placeholder="Enter alert message..."
                  className="min-h-[60px]"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={newAlertType}
                    onValueChange={(v) => setNewAlertType(v as 'info' | 'warning' | 'error')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Target</Label>
                  <Select
                    value={newAlertTarget}
                    onValueChange={(v) => setNewAlertTarget(v as 'all' | 'premium')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="premium">Premium Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Expiry Date</Label>
                  <Input
                    type="date"
                    value={newAlertExpiry}
                    onChange={(e) => setNewAlertExpiry(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={newAlertActive}
                  onCheckedChange={setNewAlertActive}
                />
                <Label>Active</Label>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddAlert} className="gap-1.5">
                  <Plus className="size-3.5" />
                  Add Alert
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAlertForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Alert List */}
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="size-10 mb-2 opacity-30" />
              <p className="text-sm">No active alerts</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-center justify-between gap-3 rounded-lg border p-3 ${
                    alert.active ? 'border-border bg-muted/10' : 'border-border/50 bg-muted/5 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <AlertTypeBadge type={alert.type} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm truncate">{alert.message}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {alert.target === 'all' ? 'All Users' : 'Premium Only'}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          Expires: {alert.expiry}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch
                      checked={alert.active}
                      onCheckedChange={() => handleToggleAlert(alert.id)}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8 text-muted-foreground hover:text-red-400"
                      onClick={() => handleDeleteAlert(alert.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4. Suggested Rules */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-violet-500/15">
              <Shield className="size-5 text-violet-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Suggested Rules</CardTitle>
              <CardDescription>Additional platform rules and configurations</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Auto-subscription renewal */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RefreshCcw className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Auto-Subscription Renewal</p>
                <p className="text-xs text-muted-foreground">
                  Automatically renew subscriptions before expiry
                </p>
              </div>
            </div>
            <Switch checked={autoRenewal} onCheckedChange={setAutoRenewal} />
          </div>

          <Separator />

          {/* New user verification */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserCheck className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">New User Verification</p>
                <p className="text-xs text-muted-foreground">
                  Require verification for new user registrations
                </p>
              </div>
            </div>
            <Switch checked={newUserVerification} onCheckedChange={setNewUserVerification} />
          </div>

          <Separator />

          {/* Max devices per subscription */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Max Devices Per Subscription</p>
                <p className="text-xs text-muted-foreground">
                  Limit the number of devices that can be bound to a subscription
                </p>
              </div>
            </div>
            <Input
              type="number"
              value={maxDevices}
              onChange={(e) => setMaxDevices(e.target.value)}
              className="w-20 text-center"
              min="1"
            />
          </div>

          <Separator />

          {/* IP restriction */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">IP Restriction</p>
                <p className="text-xs text-muted-foreground">
                  Allow or deny access from specific countries
                </p>
              </div>
            </div>
            <Switch checked={ipRestriction} onCheckedChange={setIpRestriction} />
          </div>

          <Separator />

          {/* API rate limiting */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gauge className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">API Rate Limiting</p>
                <p className="text-xs text-muted-foreground">
                  Configure request limits per time window
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={rateLimit}
                onChange={(e) => setRateLimit(e.target.value)}
                className="w-20 text-center"
                min="1"
              />
              <span className="text-xs text-muted-foreground">requests /</span>
              <Input
                type="number"
                value={rateLimitWindow}
                onChange={(e) => setRateLimitWindow(e.target.value)}
                className="w-20 text-center"
                min="1"
              />
              <span className="text-xs text-muted-foreground">min</span>
            </div>
          </div>

          <Separator />

          <Button onClick={handleSaveSuggestedRules} className="gap-2">
            <Save className="size-4" />
            Save Rules
          </Button>
        </CardContent>
      </Card>

      {/* 5. Two-Factor Authentication */}
      <Admin2faSettings />
    </div>
  )
}
