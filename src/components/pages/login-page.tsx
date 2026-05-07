'use client'

import { useState } from 'react'
import { Shield, ArrowLeft, KeyRound, UserCog, User, Lock, ArrowRight, Gift, SkipForward } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useNavigationStore } from '@/lib/navigation-store'
import { useAuthStore } from '@/lib/auth-store'
import { use2FAStore } from '@/lib/2fa-store'
import { useReferralStore } from '@/lib/referral-store'

function GoogleIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

function TelegramIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  )
}

export function LoginPage() {
  const navigate = useNavigationStore((s) => s.navigate)
  const login = useAuthStore((s) => s.login)
  const loginAsAdmin = useAuthStore((s) => s.loginAsAdmin)
  const loginAsUser = useAuthStore((s) => s.loginAsUser)
  const { isEnabled: is2FAEnabled, isVerified: is2FAVerified, verifyCode: verify2FACode } = use2FAStore()
  const { applyReferralCode, settings } = useReferralStore()

  const [adminDialogOpen, setAdminDialogOpen] = useState(false)
  const [twoFADialogOpen, setTwoFADialogOpen] = useState(false)
  const [twoFACode, setTwoFACode] = useState('')
  const [twoFAError, setTwoFAError] = useState(false)
  const [useBackupCode, setUseBackupCode] = useState(false)
  const [backupCodeInput, setBackupCodeInput] = useState('')

  // Referral code state
  const [referralDialogOpen, setReferralDialogOpen] = useState(false)
  const [referralCodeInput, setReferralCodeInput] = useState('')
  const [referralError, setReferralError] = useState('')
  const [referralSuccess, setReferralSuccess] = useState(false)

  const handleLogin = (provider: 'google' | 'telegram') => {
    const role = login(provider)
    if (role === 'admin') {
      setAdminDialogOpen(true)
    } else {
      // Show referral code dialog for regular users
      setReferralDialogOpen(true)
    }
  }

  const handleAdminAccess = () => {
    loginAsAdmin()
    setAdminDialogOpen(true)
  }

  const handleLoginAsAdmin = () => {
    setAdminDialogOpen(false)
    // Check if 2FA is enabled and not yet verified
    if (is2FAEnabled && !is2FAVerified) {
      setTwoFADialogOpen(true)
      setTwoFACode('')
      setTwoFAError(false)
      setUseBackupCode(false)
      setBackupCodeInput('')
    } else {
      navigate('admin')
    }
  }

  const handleLoginAsUser = () => {
    loginAsUser()
    setAdminDialogOpen(false)
    // Show referral dialog for admin-choosing-user too
    setReferralDialogOpen(true)
  }

  const handle2FAVerify = () => {
    if (!useBackupCode) {
      if (/^\d{6}$/.test(twoFACode) && verify2FACode(twoFACode)) {
        setTwoFADialogOpen(false)
        navigate('admin')
      } else {
        setTwoFAError(true)
      }
    } else {
      if (backupCodeInput.length >= 8 && verify2FACode(backupCodeInput)) {
        setTwoFADialogOpen(false)
        navigate('admin')
      } else {
        setTwoFAError(true)
      }
    }
  }

  const handle2FACancel = () => {
    setTwoFADialogOpen(false)
    setTwoFACode('')
    setTwoFAError(false)
    setUseBackupCode(false)
    setBackupCodeInput('')
    setAdminDialogOpen(true)
  }

  const handleApplyReferral = () => {
    if (!referralCodeInput.trim()) {
      setReferralError('Please enter a referral code')
      return
    }

    const user = useAuthStore.getState().user
    if (!user) return

    const result = applyReferralCode(referralCodeInput.trim(), user.id, user.name)
    if (result.success) {
      setReferralSuccess(true)
      setReferralError('')
    } else {
      setReferralError(result.error || 'Invalid referral code')
    }
  }

  const handleSkipReferral = () => {
    setReferralDialogOpen(false)
    setReferralCodeInput('')
    setReferralError('')
    setReferralSuccess(false)
    navigate('dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      {/* Back to landing */}
      <button
        onClick={() => navigate('landing')}
        className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
      >
        <ArrowLeft className="size-4" />
        Back to home
      </button>

      {/* Login Card */}
      <Card className="w-full max-w-md bg-card border-border/50 shadow-2xl">
        <CardHeader className="items-center text-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10">
              <Shield className="size-6 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              CoreX
            </span>
          </div>

          <div className="space-y-1.5 pt-2">
            <CardTitle className="text-2xl font-bold">
              Welcome to CoreX
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Sign in to your secure workspace
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <Separator className="opacity-50" />

          {/* Auth Buttons */}
          <div className="space-y-3">
            {/* Google Auth */}
            <Button
              variant="outline"
              size="lg"
              className="w-full bg-white hover:bg-gray-50 text-gray-800 border-gray-300 hover:border-gray-400 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-800 dark:border-gray-300 h-12 text-base font-medium"
              onClick={() => handleLogin('google')}
            >
              <GoogleIcon />
              Continue with Google
            </Button>

            {/* Telegram Auth */}
            <Button
              size="lg"
              className="w-full bg-[#2AABEE] hover:bg-[#229ED9] text-white border-0 h-12 text-base font-medium shadow-md"
              onClick={() => handleLogin('telegram')}
            >
              <TelegramIcon />
              Continue with Telegram
            </Button>
          </div>

          <Separator className="opacity-50" />

          {/* Terms */}
          <p className="text-xs text-muted-foreground text-center leading-relaxed px-2">
            By signing in, you agree to our{' '}
            <span className="text-primary hover:underline cursor-pointer">
              Terms of Service
            </span>{' '}
            and{' '}
            <span className="text-primary hover:underline cursor-pointer">
              Privacy Policy
            </span>
          </p>

          {/* Admin Login (Dev/Testing) */}
          <Separator className="opacity-50" />
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-primary"
              onClick={handleAdminAccess}
            >
              <KeyRound className="size-3.5" />
              Admin Access
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Admin Detection Dialog */}
      <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex items-center justify-center size-8 rounded-lg bg-amber-500/10">
                <Shield className="size-4 text-amber-400" />
              </div>
              Admin Account Detected
            </DialogTitle>
            <DialogDescription>
              This account has admin privileges. How would you like to proceed?
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-2">
            <Button
              variant="outline"
              className="h-auto py-4 px-4 justify-start gap-4 border-border/50 hover:bg-amber-500/10 hover:border-amber-500/30 transition-colors"
              onClick={handleLoginAsAdmin}
            >
              <div className="flex items-center justify-center size-10 rounded-lg bg-amber-500/10 shrink-0">
                <UserCog className="size-5 text-amber-400" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-sm">Login as Admin</div>
                <div className="text-xs text-muted-foreground">
                  Access the admin dashboard and management tools
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 px-4 justify-start gap-4 border-border/50 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-colors"
              onClick={handleLoginAsUser}
            >
              <div className="flex items-center justify-center size-10 rounded-lg bg-emerald-500/10 shrink-0">
                <User className="size-5 text-emerald-400" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-sm">Login as User</div>
                <div className="text-xs text-muted-foreground">
                  Continue to your personal dashboard and subscriptions
                </div>
              </div>
            </Button>
          </div>

          <DialogFooter className="sm:justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setAdminDialogOpen(false)
                useAuthStore.getState().logout()
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2FA Verification Dialog */}
      <Dialog open={twoFADialogOpen} onOpenChange={(open) => { if (!open) handle2FACancel() }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex items-center justify-center size-8 rounded-lg bg-emerald-500/10">
                <Lock className="size-4 text-emerald-400" />
              </div>
              Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              {!useBackupCode
                ? 'Enter the 6-digit code from your authenticator app'
                : 'Enter one of your backup codes'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {!useBackupCode ? (
              <div className="flex flex-col items-center gap-4">
                <Label className="text-sm text-muted-foreground">Authentication Code</Label>
                <InputOTP
                  maxLength={6}
                  value={twoFACode}
                  onChange={(value) => { setTwoFACode(value); setTwoFAError(false); }}
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
                {twoFAError && (
                  <p className="text-sm text-red-400">Invalid code. Please try again.</p>
                )}
                <button
                  className="text-xs text-primary hover:underline"
                  onClick={() => {
                    setUseBackupCode(true)
                    setTwoFAError(false)
                    setBackupCodeInput('')
                  }}
                >
                  Use Backup Code
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <Label className="text-sm text-muted-foreground">Backup Code</Label>
                <Input
                  value={backupCodeInput}
                  onChange={(e) => { setBackupCodeInput(e.target.value.toUpperCase()); setTwoFAError(false); }}
                  placeholder="Enter 8-character backup code"
                  className="text-center font-mono tracking-widest text-lg h-12 max-w-xs"
                  maxLength={8}
                />
                {twoFAError && (
                  <p className="text-sm text-red-400">Invalid backup code. Please try again.</p>
                )}
                <button
                  className="text-xs text-primary hover:underline"
                  onClick={() => {
                    setUseBackupCode(false)
                    setTwoFAError(false)
                    setTwoFACode('')
                  }}
                >
                  Use Authenticator Code
                </button>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={handle2FACancel}>
              Cancel
            </Button>
            <Button onClick={handle2FAVerify} className="gap-1.5">
              <ArrowRight className="size-4" />
              Verify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Referral Code Dialog */}
      <Dialog open={referralDialogOpen} onOpenChange={(open) => { if (!open) handleSkipReferral() }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
                <Gift className="size-4 text-primary" />
              </div>
              {referralSuccess ? 'Welcome Bonus Applied!' : 'Have a Referral Code?'}
            </DialogTitle>
            <DialogDescription>
              {referralSuccess
                ? `A welcome bonus of ৳${settings.referredReward.toFixed(2)} has been added to your account!`
                : `Enter a referral code to receive a ৳${settings.referredReward.toFixed(2)} welcome bonus. You can skip this step and add a code later from your dashboard.`}
            </DialogDescription>
          </DialogHeader>

          {!referralSuccess ? (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-sm">Referral Code</Label>
                <Input
                  value={referralCodeInput}
                  onChange={(e) => {
                    setReferralCodeInput(e.target.value.toUpperCase())
                    setReferralError('')
                  }}
                  placeholder="e.g., COREX-7K9M2"
                  className="font-mono"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleApplyReferral()
                  }}
                />
                {referralError && (
                  <p className="text-sm text-red-400">{referralError}</p>
                )}
              </div>
            </div>
          ) : null}

          <DialogFooter className="gap-2 sm:gap-2">
            {!referralSuccess ? (
              <>
                <Button variant="ghost" onClick={handleSkipReferral} className="gap-1.5">
                  <SkipForward className="size-4" />
                  Skip
                </Button>
                <Button onClick={handleApplyReferral} className="gap-1.5">
                  <Gift className="size-4" />
                  Apply Code
                </Button>
              </>
            ) : (
              <Button onClick={handleSkipReferral} className="gap-1.5">
                <ArrowRight className="size-4" />
                Continue to Dashboard
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subtle branding at bottom */}
      <p className="mt-8 text-xs text-muted-foreground/60">
        Protected by enterprise-grade encryption
      </p>
    </div>
  )
}
