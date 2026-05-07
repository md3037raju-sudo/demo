'use client'

import React, { useState, useEffect } from 'react'
import { useUtilityStore } from '@/lib/utility-store'
import { usePaymentStore } from '@/lib/payment-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  Download,
  BookOpen,
  Settings2,
  Save,
  Smartphone,
  CreditCard,
  ExternalLink,
  RefreshCw,
  FileText,
} from 'lucide-react'

export function AdminUtility() {
  const { config, updateConfig } = useUtilityStore()
  const { paymentConfig, updatePaymentConfig } = usePaymentStore()

  // Local state for editing
  const [apkUrl, setApkUrl] = useState(config.apkDownloadUrl)
  const [apkVersion, setApkVersion] = useState(config.apkVersion)
  const [tutorialUrl, setTutorialUrl] = useState(config.tutorialUrl)
  const [tutorialTitle, setTutorialTitle] = useState(config.tutorialTitle)
  const [changelog, setChangelog] = useState(config.appChangelog)

  const [bkashNumber, setBkashNumber] = useState(paymentConfig.bkashNumber)
  const [bkashType, setBkashType] = useState(paymentConfig.bkashType)
  const [nagadNumber, setNagadNumber] = useState(paymentConfig.nagadNumber)
  const [nagadType, setNagadType] = useState(paymentConfig.nagadType)

  // Sync local state when store changes
  useEffect(() => {
    setApkUrl(config.apkDownloadUrl)
    setApkVersion(config.apkVersion)
    setTutorialUrl(config.tutorialUrl)
    setTutorialTitle(config.tutorialTitle)
    setChangelog(config.appChangelog)
  }, [config])

  useEffect(() => {
    setBkashNumber(paymentConfig.bkashNumber)
    setBkashType(paymentConfig.bkashType)
    setNagadNumber(paymentConfig.nagadNumber)
    setNagadType(paymentConfig.nagadType)
  }, [paymentConfig])

  const handleSaveAppConfig = () => {
    updateConfig({
      apkDownloadUrl: apkUrl,
      apkVersion: apkVersion,
      tutorialUrl: tutorialUrl,
      tutorialTitle: tutorialTitle,
      appChangelog: changelog,
    })
    toast.success('App configuration saved!', {
      description: 'APK download link, tutorial, and changelog updated.',
    })
  }

  const handleSavePaymentConfig = () => {
    updatePaymentConfig({
      bkashNumber,
      bkashType,
      nagadNumber,
      nagadType,
    })
    toast.success('Payment configuration saved!', {
      description: 'bKash and Nagad numbers updated for users.',
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Utility Settings</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Manage app download links, tutorials, and payment method configurations
        </p>
      </div>

      {/* ── App Configuration ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="size-5" />
            App Configuration
          </CardTitle>
          <CardDescription>
            Update APK download link, version, and tutorial for users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* APK Download */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <Download className="size-3.5" />
              APK Download URL
            </label>
            <Input
              placeholder="https://example.com/corex-app.apk"
              value={apkUrl}
              onChange={(e) => setApkUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              This link is shown to users on the Download page
            </p>
          </div>

          {/* APK Version */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <RefreshCw className="size-3.5" />
              App Version
            </label>
            <Input
              placeholder="v2.5.3"
              value={apkVersion}
              onChange={(e) => setApkVersion(e.target.value)}
              className="max-w-[200px]"
            />
          </div>

          <Separator />

          {/* Tutorial Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <BookOpen className="size-3.5" />
              Tutorial URL
            </label>
            <Input
              placeholder="https://corex.io/tutorial"
              value={tutorialUrl}
              onChange={(e) => setTutorialUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Link to setup/usage tutorial shown to users
            </p>
          </div>

          {/* Tutorial Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <FileText className="size-3.5" />
              Tutorial Title
            </label>
            <Input
              placeholder="Getting Started with CoreX"
              value={tutorialTitle}
              onChange={(e) => setTutorialTitle(e.target.value)}
            />
          </div>

          <Separator />

          {/* Changelog */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <Settings2 className="size-3.5" />
              App Changelog
            </label>
            <Textarea
              placeholder="• Feature 1&#10;• Feature 2&#10;• Bug fix..."
              value={changelog}
              onChange={(e) => setChangelog(e.target.value)}
              rows={5}
            />
            <p className="text-xs text-muted-foreground">
              Shown to users on the download page. Use • for bullet points.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button onClick={handleSaveAppConfig} className="gap-1.5">
              <Save className="size-4" />
              Save App Configuration
            </Button>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Version: {apkVersion}
              </Badge>
              {apkUrl && (
                <a
                  href={apkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="size-3" />
                  Test Link
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Payment Method Configuration ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="size-5" />
            Payment Method Configuration
          </CardTitle>
          <CardDescription>
            Update bKash and Nagad numbers shown to users when adding balance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* bKash */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-md bg-[#E2136E]/15">
                <svg viewBox="0 0 24 24" className="size-4" fill="#E2136E">
                  <rect width="24" height="24" rx="4" />
                  <text x="4" y="17" fontFamily="Arial" fontWeight="700" fontSize="10" fill="white">b</text>
                </svg>
              </div>
              <h3 className="text-sm font-semibold">bKash</h3>
              <Badge variant="outline" className="text-xs">Payment Method</Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">bKash Number</label>
                <Input
                  placeholder="01XXXXXXXXX"
                  value={bkashNumber}
                  onChange={(e) => setBkashNumber(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Account Type</label>
                <div className="flex gap-2">
                  <Button
                    variant={bkashType === 'personal' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setBkashType('personal')}
                  >
                    Personal
                  </Button>
                  <Button
                    variant={bkashType === 'merchant' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setBkashType('merchant')}
                  >
                    Merchant
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Nagad */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-md bg-[#F6921E]/15">
                <svg viewBox="0 0 24 24" className="size-4" fill="#F6921E">
                  <rect width="24" height="24" rx="4" />
                  <text x="3" y="17" fontFamily="Arial" fontWeight="700" fontSize="10" fill="white">N</text>
                </svg>
              </div>
              <h3 className="text-sm font-semibold">Nagad</h3>
              <Badge variant="outline" className="text-xs">Payment Method</Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Nagad Number</label>
                <Input
                  placeholder="01XXXXXXXXX"
                  value={nagadNumber}
                  onChange={(e) => setNagadNumber(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Account Type</label>
                <div className="flex gap-2">
                  <Button
                    variant={nagadType === 'personal' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNagadType('personal')}
                  >
                    Personal
                  </Button>
                  <Button
                    variant={nagadType === 'merchant' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNagadType('merchant')}
                  >
                    Merchant
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button onClick={handleSavePaymentConfig} className="gap-1.5">
              <Save className="size-4" />
              Save Payment Configuration
            </Button>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Smartphone className="size-3.5" />
              Changes apply immediately for all users
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Preview ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings2 className="size-4" />
            User Preview
          </CardTitle>
          <CardDescription>
            How users will see the payment information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border bg-muted/20 p-3 space-y-1.5">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 80 24" className="h-5" fill="none">
                  <rect width="80" height="24" rx="4" fill="#E2136E" />
                  <text x="8" y="17" fontFamily="Arial" fontWeight="700" fontSize="12" fill="white">bKash</text>
                </svg>
                <Badge variant="outline" className="text-[10px]">{bkashType}</Badge>
              </div>
              <p className="font-mono text-sm font-bold">{bkashNumber}</p>
            </div>
            <div className="rounded-lg border bg-muted/20 p-3 space-y-1.5">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 80 24" className="h-5" fill="none">
                  <rect width="80" height="24" rx="4" fill="#F6921E" />
                  <text x="8" y="17" fontFamily="Arial" fontWeight="700" fontSize="12" fill="white">Nagad</text>
                </svg>
                <Badge variant="outline" className="text-[10px]">{nagadType}</Badge>
              </div>
              <p className="font-mono text-sm font-bold">{nagadNumber}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
