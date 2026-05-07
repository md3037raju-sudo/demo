'use client'

import React, { useState, useEffect } from 'react'
import { useUtilityStore, isUrl } from '@/lib/utility-store'
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
  Link2,
  MessageCircle,
  Info,
  UserPlus,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react'
import { Admin2FASettings } from './admin-2fa-settings'

// ── Telegram mini icon for admin UI ──
function TelegramMini() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none">
      <circle cx="12" cy="12" r="11" fill="#37AEE2" />
      <path
        d="M5.5 11.8l11-4.25c.5-.18.94.12.78.87l0 0-1.87 8.81c-.13.58-.47.72-.96.45l-2.65-1.95-1.28 1.23c-.14.14-.26.26-.53.26l.19-2.7 4.92-4.44c.21-.19-.05-.3-.33-.11l-6.08 3.82-2.62-.82c-.57-.18-.58-.57.12-.84l10.24-3.95c.47-.17.89.12.73.84l-1.75 8.22c-.12.56-.45.7-.91.43l-2.53-1.87-1.22 1.18c-.14.14-.25.25-.52.25l.18-2.68"
        fill="white"
      />
    </svg>
  )
}

// ── Facebook mini icon for admin UI ──
function FacebookMini() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none">
      <circle cx="12" cy="12" r="11" fill="#1877F2" />
      <path
        d="M16.5 13l.5-3h-3V8c0-.83.4-1.5 1.68-1.5H17V3.86c-.5-.07-1.37-.22-2.32-.22C13.38 3.64 12 4.83 12 7.2V10H9v3h3v7h3.5v-7h2z"
        fill="white"
      />
    </svg>
  )
}

export function AdminUtility() {
  const { config, updateConfig } = useUtilityStore()
  const { paymentConfig, updatePaymentConfig } = usePaymentStore()

  // Local state for editing — App config
  const [apkUrl, setApkUrl] = useState(config.apkDownloadUrl)
  const [apkVersion, setApkVersion] = useState(config.apkVersion)
  const [tutorialUrl, setTutorialUrl] = useState(config.tutorialUrl)
  const [tutorialTitle, setTutorialTitle] = useState(config.tutorialTitle)
  const [changelog, setChangelog] = useState(config.appChangelog)
  const [telegramLink, setTelegramLink] = useState(config.telegramLink)
  const [facebookLink, setFacebookLink] = useState(config.facebookLink)
  const [registrationEnabled, setRegistrationEnabled] = useState(config.registrationEnabled)

  // Local state for editing — Payment config
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
    setTelegramLink(config.telegramLink)
    setFacebookLink(config.facebookLink)
    setRegistrationEnabled(config.registrationEnabled)
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

  const handleSaveSocialConfig = () => {
    updateConfig({
      telegramLink,
      facebookLink,
    })
    toast.success('Social links saved!', {
      description: 'Telegram & Facebook links updated for users.',
    })
  }

  const handleSaveRegistrationConfig = () => {
    updateConfig({ registrationEnabled })
    toast.success('Registration setting saved!', {
      description: registrationEnabled ? 'New users can register.' : 'New registration is currently paused.',
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
          Manage app download links, social links, and payment method configurations
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

      {/* ── Social Links Configuration ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="size-5" />
            Social Links
          </CardTitle>
          <CardDescription>
            Configure Telegram &amp; Facebook links shown across the website
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Info box */}
          <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5">
            <Info className="size-4 text-primary mt-0.5 shrink-0" />
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>URL mode:</strong> Enter a link (e.g. <code className="bg-muted px-1 rounded text-[10px]">https://t.me/corex</code>) — clicking the icon opens the link directly.</p>
              <p><strong>Text mode:</strong> Enter any text (e.g. <code className="bg-muted px-1 rounded text-[10px]">Coming Soon</code>) — clicking the icon shows a popup with that text.</p>
            </div>
          </div>

          {/* Telegram */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-md bg-[#37AEE2]/15">
                <TelegramMini />
              </div>
              <h3 className="text-sm font-semibold">Telegram</h3>
              <Badge variant="outline" className="text-xs">
                {isUrl(telegramLink) ? '🔗 Link' : '💬 Text'}
              </Badge>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Telegram Link or Status Text
              </label>
              <Input
                placeholder="https://t.me/corex or Coming Soon"
                value={telegramLink}
                onChange={(e) => setTelegramLink(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">
                {isUrl(telegramLink)
                  ? '✅ URL detected — users will be redirected to this link'
                  : 'ℹ️ Text mode — users will see a popup with this message'}
              </p>
            </div>
          </div>

          {/* Facebook */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-md bg-[#1877F2]/15">
                <FacebookMini />
              </div>
              <h3 className="text-sm font-semibold">Facebook</h3>
              <Badge variant="outline" className="text-xs">
                {isUrl(facebookLink) ? '🔗 Link' : '💬 Text'}
              </Badge>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Facebook Link or Status Text
              </label>
              <Input
                placeholder="https://facebook.com/corex or Coming Soon"
                value={facebookLink}
                onChange={(e) => setFacebookLink(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">
                {isUrl(facebookLink)
                  ? '✅ URL detected — users will be redirected to this link'
                  : 'ℹ️ Text mode — users will see a popup with this message'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button onClick={handleSaveSocialConfig} className="gap-1.5">
              <Save className="size-4" />
              Save Social Links
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Registration Control ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="size-5" />
            Registration Control
          </CardTitle>
          <CardDescription>
            Enable or disable new user registration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">New Registration</h3>
                <p className="text-xs text-muted-foreground">
                  {registrationEnabled
                    ? 'Users can create new accounts'
                    : 'New registration is currently paused'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {registrationEnabled ? (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20">Active</Badge>
                ) : (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/20">Paused</Badge>
                )}
                <Button
                  variant={registrationEnabled ? 'destructive' : 'default'}
                  size="sm"
                  onClick={() => setRegistrationEnabled(!registrationEnabled)}
                >
                  {registrationEnabled ? 'Disable Registration' : 'Enable Registration'}
                </Button>
              </div>
            </div>
            {!registrationEnabled && (
              <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2">
                <AlertCircle className="size-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-xs text-red-400">
                  Users attempting to register will see a message that registration is temporarily paused.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button onClick={handleSaveRegistrationConfig} className="gap-1.5">
              <Save className="size-4" />
              Save Registration Setting
            </Button>
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

      {/* ── 2FA Security Settings ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Manage 2FA security settings for admin account protection
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Admin2FASettings />
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
            How users will see social links and payment information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Social Preview */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Social Links</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2">
                <div className="flex size-5 items-center justify-center rounded-full bg-[#37AEE2]">
                  <svg viewBox="0 0 24 24" className="size-3" fill="white">
                    <path d="M9 17l1-4 7-6.5c.4-.4.1-.7-.4-.4L7.5 13l-3.8-1.2c-.8-.2-.8-.8.2-1.2l14.5-5.6c.7-.3 1.3.2 1 1.2l-2.5 11.7c-.2.8-.7 1-1.2.6l-3-2.2-1.7 1.6c-.2.2-.4.3-.6.3l.3-2.5z" />
                  </svg>
                </div>
                <span className="text-xs font-medium">Telegram</span>
                {!isUrl(telegramLink) && (
                  <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-[9px] px-1">Soon</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2">
                <div className="flex size-5 items-center justify-center rounded-full bg-[#1877F2]">
                  <svg viewBox="0 0 24 24" className="size-3" fill="white">
                    <path d="M16.5 13l.5-3h-3V8c0-.83.4-1.5 1.68-1.5H17V3.86c-.5-.07-1.37-.22-2.32-.22C13.38 3.64 12 4.83 12 7.2V10H9v3h3v7h3.5v-7h2z" />
                  </svg>
                </div>
                <span className="text-xs font-medium">Facebook</span>
                {!isUrl(facebookLink) && (
                  <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-[9px] px-1">Soon</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Payment Preview */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Payment Methods</p>
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
