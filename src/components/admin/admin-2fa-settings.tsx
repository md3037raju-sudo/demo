'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Shield,
  ShieldCheck,
  Key,
  Download,
  Copy,
  Check,
  RefreshCcw,
  AlertTriangle,
  QrCode,
} from 'lucide-react'
import { use2FAStore } from '@/lib/2fa-store'
import { toast } from 'sonner'

type SetupStep = 'qr' | 'verify' | 'backup'

function MockQRCode({ secret }: { secret: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative size-40 rounded-lg border-2 border-dashed border-border bg-muted/30 p-2">
        <div className="size-full grid grid-cols-8 grid-rows-8 gap-[2px] p-1">
          {Array.from({ length: 64 }).map((_, i) => {
            const hash = (secret.charCodeAt(i % secret.length) + i * 7) % 3
            return (
              <div
                key={i}
                className={`rounded-[1px] ${
                  hash === 0
                    ? 'bg-foreground'
                    : hash === 1
                    ? 'bg-foreground/60'
                    : 'bg-transparent'
                }`}
              />
            )
          })}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-background rounded-md p-1.5 border border-border">
            <QrCode className="size-5 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function Admin2faSettings() {
  const { isEnabled, secret, isVerified, backupCodes, enable2FA, disable2FA, verifyCode, generateSecret, regenerateBackupCodes } = use2FAStore()

  const [setupDialogOpen, setSetupDialogOpen] = useState(false)
  const [setupStep, setSetupStep] = useState<SetupStep>('qr')
  const [setupSecret, setSetupSecret] = useState<string>('')
  const [setupVerifyCode, setSetupVerifyCode] = useState('')
  const [setupBackupCodes, setSetupBackupCodes] = useState<string[]>([])
  const [verifyError, setVerifyError] = useState(false)
  const [copiedSecret, setCopiedSecret] = useState(false)
  const [copiedBackup, setCopiedBackup] = useState(false)

  // Disable 2FA dialog
  const [disableDialogOpen, setDisableDialogOpen] = useState(false)
  const [disableCode, setDisableCode] = useState('')
  const [disableCodeError, setDisableCodeError] = useState(false)

  // Regenerate backup codes dialog
  const [regenDialogOpen, setRegenDialogOpen] = useState(false)
  const [regenCode, setRegenCode] = useState('')
  const [regenCodeError, setRegenCodeError] = useState(false)
  const [newBackupCodes, setNewBackupCodes] = useState<string[]>([])
  const [showRegenCodes, setShowRegenCodes] = useState(false)

  // Manage menu
  const [manageMenuOpen, setManageMenuOpen] = useState(false)

  const handleStartSetup = () => {
    const newSecret = generateSecret()
    setSetupSecret(newSecret)
    setSetupStep('qr')
    setSetupVerifyCode('')
    setVerifyError(false)
    setCopiedSecret(false)
    setSetupDialogOpen(true)
  }

  const handleVerifySetup = () => {
    if (/^\d{6}$/.test(setupVerifyCode)) {
      enable2FA(setupSecret)
      const codes = use2FAStore.getState().backupCodes
      setSetupBackupCodes(codes)
      setSetupStep('backup')
      setVerifyError(false)
      toast.success('2FA enabled successfully!')
    } else {
      setVerifyError(true)
    }
  }

  const handleFinishSetup = () => {
    setSetupDialogOpen(false)
    setSetupVerifyCode('')
  }

  const handleCopySecret = async () => {
    try {
      await navigator.clipboard.writeText(setupSecret)
      setCopiedSecret(true)
      setTimeout(() => setCopiedSecret(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  const handleCopyBackupCodes = async (codes: string[]) => {
    try {
      await navigator.clipboard.writeText(codes.join('\n'))
      setCopiedBackup(true)
      setTimeout(() => setCopiedBackup(false), 2000)
      toast.success('Backup codes copied!')
    } catch {
      toast.error('Failed to copy')
    }
  }

  const handleDownloadBackupCodes = (codes: string[]) => {
    const content = `CoreX 2FA Backup Codes\nGenerated: ${new Date().toLocaleString()}\n\n${codes.join('\n')}\n\nIMPORTANT: Store these codes in a secure location.Each code can only be used once.`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'corex-2fa-backup-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Backup codes downloaded!')
  }

  const handleDisable2FA = () => {
    if (/^\d{6}$/.test(disableCode)) {
      disable2FA()
      setDisableDialogOpen(false)
      setDisableCode('')
      setDisableCodeError(false)
      toast.success('2FA has been disabled')
    } else {
      setDisableCodeError(true)
    }
  }

  const handleRegenerateBackupCodes = () => {
    if (/^\d{6}$/.test(regenCode)) {
      const codes = regenerateBackupCodes()
      setNewBackupCodes(codes)
      setShowRegenCodes(true)
      setRegenCode('')
      setRegenCodeError(false)
      toast.success('Backup codes regenerated!')
    } else {
      setRegenCodeError(true)
    }
  }

  return (
    <>
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/15">
                <Shield className="size-5 text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security to your admin account</CardDescription>
              </div>
            </div>
            {isEnabled ? (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-1">
                <ShieldCheck className="size-3" />
                2FA Enabled
              </Badge>
            ) : (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 gap-1">
                <Shield className="size-3" />
                2FA Disabled
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isEnabled ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Two-factor authentication adds an additional layer of security to your account by requiring more than just a password to sign in.
              </p>
              <Button onClick={handleStartSetup} className="gap-2">
                <Key className="size-4" />
                Enable Two-Factor Authentication
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
                <ShieldCheck className="size-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-emerald-300">Two-factor authentication is enabled</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Your account is protected with an authenticator app.
                    {isVerified ? ' Session is verified.' : ' Session not yet verified.'}
                  </p>
                </div>
              </div>

              {backupCodes.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Remaining backup codes: <span className="font-medium text-foreground">{backupCodes.length}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    setRegenCode('')
                    setRegenCodeError(false)
                    setShowRegenCodes(false)
                    setNewBackupCodes([])
                    setRegenDialogOpen(true)
                  }}
                >
                  <RefreshCcw className="size-3.5" />
                  Regenerate Backup Codes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  onClick={() => {
                    setDisableCode('')
                    setDisableCodeError(false)
                    setDisableDialogOpen(true)
                  }}
                >
                  <Shield className="size-3.5" />
                  Disable 2FA
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Dialog */}
      <Dialog open={setupDialogOpen} onOpenChange={(open) => { if (!open) setSetupDialogOpen(false) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="size-5 text-emerald-400" />
              {setupStep === 'qr' && 'Set Up Authenticator'}
              {setupStep === 'verify' && 'Verify Setup'}
              {setupStep === 'backup' && 'Backup Codes'}
            </DialogTitle>
            <DialogDescription>
              {setupStep === 'qr' && 'Scan the QR code with your authenticator app or enter the secret key manually.'}
              {setupStep === 'verify' && 'Enter the 6-digit code from your authenticator app to complete setup.'}
              {setupStep === 'backup' && 'Save these backup codes in a secure location.'}
            </DialogDescription>
          </DialogHeader>

          {setupStep === 'qr' && (
            <div className="space-y-4 py-2">
              <div className="flex justify-center">
                <MockQRCode secret={setupSecret} />
              </div>

              <div className="space-y-2">
                <Label>Secret Key</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-md bg-muted px-3 py-2 text-sm font-mono tracking-wider">
                    {setupSecret}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={handleCopySecret}
                  >
                    {copiedSecret ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
                  </Button>
                </div>
              </div>

              <Button onClick={() => { setSetupStep('verify'); setSetupVerifyCode(''); setVerifyError(false); }} className="w-full gap-2">
                Continue to Verification
              </Button>
            </div>
          )}

          {setupStep === 'verify' && (
            <div className="space-y-4 py-2">
              <div className="flex flex-col items-center gap-4">
                <Label>Enter 6-digit code</Label>
                <InputOTP
                  maxLength={6}
                  value={setupVerifyCode}
                  onChange={(value) => { setSetupVerifyCode(value); setVerifyError(false); }}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                {verifyError && (
                  <p className="text-sm text-red-400">Invalid code. Please enter a valid 6-digit code.</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setSetupStep('qr'); }} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleVerifySetup} className="flex-1 gap-2">
                  <Check className="size-4" />
                  Verify & Enable
                </Button>
              </div>
            </div>
          )}

          {setupStep === 'backup' && (
            <div className="space-y-4 py-2">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <AlertTriangle className="size-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-200">
                  Save these backup codes in a secure location. They can be used to access your account if you lose your authenticator device.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {setupBackupCodes.map((code, i) => (
                  <code
                    key={i}
                    className="rounded-md bg-muted px-3 py-2 text-sm font-mono text-center tracking-wider"
                  >
                    {code}
                  </code>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-1.5"
                  onClick={() => handleDownloadBackupCodes(setupBackupCodes)}
                >
                  <Download className="size-3.5" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-1.5"
                  onClick={() => handleCopyBackupCodes(setupBackupCodes)}
                >
                  {copiedBackup ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                  {copiedBackup ? 'Copied!' : 'Copy All'}
                </Button>
              </div>

              <Button onClick={handleFinishSetup} className="w-full">
                Done — I&apos;ve Saved My Backup Codes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Disable 2FA Dialog */}
      <Dialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="size-5 text-red-400" />
              Disable Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              This will remove the extra layer of security from your account. Enter your current authenticator code to confirm.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <AlertTriangle className="size-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">
                Disabling 2FA reduces your account security. This action cannot be undone.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <Label>Enter 6-digit code to confirm</Label>
              <InputOTP
                maxLength={6}
                value={disableCode}
                onChange={(value) => { setDisableCode(value); setDisableCodeError(false); }}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              {disableCodeError && (
                <p className="text-sm text-red-400">Invalid code. Please enter a valid 6-digit code.</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDisableDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDisable2FA} className="gap-1.5">
              <Shield className="size-4" />
              Disable 2FA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Regenerate Backup Codes Dialog */}
      <Dialog open={regenDialogOpen} onOpenChange={setRegenDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCcw className="size-5 text-emerald-400" />
              Regenerate Backup Codes
            </DialogTitle>
            <DialogDescription>
              {showRegenCodes
                ? 'Your new backup codes are ready. The old codes are no longer valid.'
                : 'Enter your authenticator code to regenerate backup codes. This will invalidate all existing backup codes.'}
            </DialogDescription>
          </DialogHeader>

          {!showRegenCodes ? (
            <div className="space-y-4 py-2">
              <div className="flex flex-col items-center gap-3">
                <Label>Enter 6-digit code to confirm</Label>
                <InputOTP
                  maxLength={6}
                  value={regenCode}
                  onChange={(value) => { setRegenCode(value); setRegenCodeError(false); }}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                {regenCodeError && (
                  <p className="text-sm text-red-400">Invalid code. Please enter a valid 6-digit code.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <AlertTriangle className="size-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-200">
                  Save these new backup codes. Your previous codes are no longer valid.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {newBackupCodes.map((code, i) => (
                  <code
                    key={i}
                    className="rounded-md bg-muted px-3 py-2 text-sm font-mono text-center tracking-wider"
                  >
                    {code}
                  </code>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-1.5"
                  onClick={() => handleDownloadBackupCodes(newBackupCodes)}
                >
                  <Download className="size-3.5" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-1.5"
                  onClick={() => handleCopyBackupCodes(newBackupCodes)}
                >
                  <Copy className="size-3.5" />
                  Copy All
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setRegenDialogOpen(false)}>
              {showRegenCodes ? 'Close' : 'Cancel'}
            </Button>
            {!showRegenCodes && (
              <Button onClick={handleRegenerateBackupCodes} className="gap-1.5">
                <RefreshCcw className="size-4" />
                Regenerate
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
