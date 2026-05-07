'use client'

import React, { useState } from 'react'
import { use2FAStore } from '@/lib/2fa-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  ShieldCheck,
  Shield,
  Key,
  Copy,
  RefreshCw,
  Check,
  AlertTriangle,
  Lock,
  Unlock,
} from 'lucide-react'

export function Admin2FASettings() {
  const {
    isEnabled,
    secret,
    isVerified,
    backupCodes,
    enable2FA,
    disable2FA,
    verifyCode,
    generateSecret,
    regenerateBackupCodes,
  } = use2FAStore()

  const [setupStep, setSetupStep] = useState<'idle' | 'setup' | 'verify'>('idle')
  const [verifyInput, setVerifyInput] = useState('')
  const [generatedSecret, setGeneratedSecret] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [disableConfirm, setDisableConfirm] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const handleBeginSetup = () => {
    const newSecret = generateSecret()
    setGeneratedSecret(newSecret)
    setSetupStep('setup')
  }

  const handleProceedToVerify = () => {
    setSetupStep('verify')
  }

  const handleVerify = () => {
    if (!/^\d{6}$/.test(verifyInput)) {
      toast.error('Invalid code', { description: 'Please enter a 6-digit verification code.' })
      return
    }
    const success = verifyCode(verifyInput)
    if (success) {
      enable2FA(generatedSecret)
      toast.success('2FA Enabled!', { description: 'Two-factor authentication is now active for your admin account.' })
      setSetupStep('idle')
      setVerifyInput('')
    } else {
      toast.error('Verification failed', { description: 'The code you entered is incorrect. Please try again.' })
    }
  }

  const handleDisable = () => {
    if (!disableConfirm) {
      setDisableConfirm(true)
      return
    }
    disable2FA()
    setDisableConfirm(false)
    toast.success('2FA Disabled', { description: 'Two-factor authentication has been turned off.' })
  }

  const handleRegenerateBackupCodes = () => {
    const newCodes = regenerateBackupCodes()
    setShowBackupCodes(true)
    toast.success('Backup codes regenerated', { description: `${newCodes.length} new backup codes generated.` })
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">2FA Security Settings</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Manage two-factor authentication for admin account security
        </p>
      </div>

      {/* ── Status Card ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isEnabled ? (
              <ShieldCheck className="size-5 text-emerald-500" />
            ) : (
              <Shield className="size-5 text-red-500" />
            )}
            Authentication Status
          </CardTitle>
          <CardDescription>
            Current two-factor authentication status for your admin account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className={`flex size-10 items-center justify-center rounded-full ${
                isEnabled ? 'bg-emerald-500/15' : 'bg-red-500/15'
              }`}>
                {isEnabled ? (
                  <Lock className="size-5 text-emerald-500" />
                ) : (
                  <Unlock className="size-5 text-red-500" />
                )}
              </div>
              <div>
                <p className="font-semibold">
                  {isEnabled ? 'Two-Factor Authentication is Enabled' : 'Two-Factor Authentication is Disabled'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isEnabled
                    ? 'Your admin account is protected with an additional security layer'
                    : 'Your account is not using two-factor authentication'}
                </p>
              </div>
            </div>
            <Badge className={
              isEnabled
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/20'
            }>
              {isEnabled ? 'Secured' : 'Vulnerable'}
            </Badge>
          </div>

          {isEnabled && isVerified && (
            <div className="flex items-start gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5">
              <Check className="size-4 text-emerald-500 mt-0.5 shrink-0" />
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Session verified — your current session has been authenticated with 2FA.
              </p>
            </div>
          )}

          {isEnabled && !isVerified && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5">
              <AlertTriangle className="size-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Session not verified — some sensitive operations may require 2FA verification.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Setup / Disable Card ── */}
      {!isEnabled && setupStep === 'idle' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="size-5" />
              Enable 2FA
            </CardTitle>
            <CardDescription>
              Set up two-factor authentication to add an extra layer of security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-amber-500" />
                <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">Recommended</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Two-factor authentication significantly reduces the risk of unauthorized access to your admin account.
                We strongly recommend enabling it for all admin users.
              </p>
            </div>
            <Button onClick={handleBeginSetup} className="gap-2">
              <ShieldCheck className="size-4" />
              Begin 2FA Setup
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Setup Step: Show Secret ── */}
      {!isEnabled && setupStep === 'setup' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="size-5" />
              Step 1: Save Your Secret Key
            </CardTitle>
            <CardDescription>
              Scan this secret in your authenticator app (e.g. Google Authenticator, Authy)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4 space-y-3">
              <label className="text-sm font-medium">Secret Key</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-md bg-muted px-3 py-2 text-sm font-mono tracking-wider">
                  {showSecret ? generatedSecret : '••••••••••••••••'}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowSecret(!showSecret)}
                >
                  {showSecret ? <Unlock className="size-4" /> : <Lock className="size-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(generatedSecret, 'secret')}
                >
                  {copiedField === 'secret' ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Click the eye icon to reveal, or copy it directly to your clipboard.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={handleProceedToVerify} className="gap-2">
                Next: Verify Code
              </Button>
              <Button variant="ghost" onClick={() => { setSetupStep('idle'); setGeneratedSecret('') }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Setup Step: Verify Code ── */}
      {!isEnabled && setupStep === 'verify' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-5" />
              Step 2: Verify Authentication
            </CardTitle>
            <CardDescription>
              Enter the 6-digit code from your authenticator app to complete setup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Verification Code</label>
              <Input
                placeholder="000000"
                value={verifyInput}
                onChange={(e) => setVerifyInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="max-w-[200px] text-center text-lg font-mono tracking-[0.5em]"
                maxLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleVerify} disabled={verifyInput.length !== 6} className="gap-2">
                <ShieldCheck className="size-4" />
                Verify & Enable 2FA
              </Button>
              <Button variant="ghost" onClick={() => { setSetupStep('setup'); setVerifyInput('') }}>
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Disable 2FA ── */}
      {isEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Unlock className="size-5" />
              Disable 2FA
            </CardTitle>
            <CardDescription>
              Remove two-factor authentication from your admin account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-red-500" />
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">Warning</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Disabling 2FA reduces the security of your admin account. This action will also invalidate all backup codes.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant={disableConfirm ? 'destructive' : 'outline'}
                onClick={handleDisable}
                className="gap-2"
              >
                <Unlock className="size-4" />
                {disableConfirm ? 'Click Again to Confirm Disable' : 'Disable 2FA'}
              </Button>
              {disableConfirm && (
                <Button variant="ghost" onClick={() => setDisableConfirm(false)}>
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Backup Codes ── */}
      {isEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="size-5" />
              Backup Codes
            </CardTitle>
            <CardDescription>
              Use these one-time backup codes if you lose access to your authenticator app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {backupCodes.length > 0 ? (
              <>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium">
                      {showBackupCodes ? 'Backup Codes (shown)' : 'Backup Codes (hidden)'}
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBackupCodes(!showBackupCodes)}
                    >
                      {showBackupCodes ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                  {showBackupCodes ? (
                    <div className="grid grid-cols-2 gap-2">
                      {backupCodes.map((code, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5">
                          <code className="text-sm font-mono tracking-wider">{code}</code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 ml-auto"
                            onClick={() => copyToClipboard(code, `backup-${i}`)}
                          >
                            {copiedField === `backup-${i}` ? (
                              <Check className="size-3 text-emerald-500" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {backupCodes.map((_, i) => (
                        <div key={i} className="rounded-md bg-muted px-3 py-1.5">
                          <code className="text-sm font-mono">••••••••</code>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={handleRegenerateBackupCodes} className="gap-2">
                    <RefreshCw className="size-4" />
                    Regenerate Backup Codes
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {backupCodes.length} codes remaining
                  </span>
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-4 text-amber-500" />
                  <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">No Backup Codes</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  You have used all your backup codes. Generate new ones to ensure you can recover access.
                </p>
                <Button variant="outline" size="sm" onClick={handleRegenerateBackupCodes} className="gap-2 mt-2">
                  <RefreshCw className="size-3.5" />
                  Generate New Backup Codes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── How 2FA Works ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="size-4" />
            How 2FA Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border p-3 space-y-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                <Key className="size-4 text-primary" />
              </div>
              <p className="text-sm font-medium">1. Generate Secret</p>
              <p className="text-xs text-muted-foreground">
                A unique secret key is generated and added to your authenticator app.
              </p>
            </div>
            <div className="rounded-lg border p-3 space-y-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                <ShieldCheck className="size-4 text-primary" />
              </div>
              <p className="text-sm font-medium">2. Verify Code</p>
              <p className="text-xs text-muted-foreground">
                Enter a time-based code from your authenticator to confirm setup.
              </p>
            </div>
            <div className="rounded-lg border p-3 space-y-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                <Lock className="size-4 text-primary" />
              </div>
              <p className="text-sm font-medium">3. Stay Protected</p>
              <p className="text-xs text-muted-foreground">
                Each login requires both your password and a fresh code from the authenticator.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
