'use client'

import React, { useState } from 'react'
import { useAuthStore } from '@/lib/auth-store'
import { useNavigationStore } from '@/lib/navigation-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  Shield,
  Mail,
  Send,
  Trash2,
  LogOut,
  CheckCircle2,
} from 'lucide-react'

export function SettingsPage() {
  const { user, logout } = useAuthStore()
  const { navigate } = useNavigationStore()

  const [googleLinked, setGoogleLinked] = useState(user?.provider === 'google')
  const [telegramLinked, setTelegramLinked] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [signOutAllDialogOpen, setSignOutAllDialogOpen] = useState(false)

  const handleLinkGoogle = () => {
    setGoogleLinked(true)
    toast.success('Google account linked successfully!')
  }

  const handleLinkTelegram = () => {
    setTelegramLinked(true)
    toast.success('Telegram account linked successfully!')
  }

  const handleDeleteAccount = () => {
    setDeleteDialogOpen(false)
    logout()
    navigate('login')
    toast.success('Account has been deleted.')
  }

  const handleSignOutAll = () => {
    setSignOutAllDialogOpen(false)
    logout()
    navigate('login')
    toast.success('Signed out of all devices.')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
      </div>

      {/* Security Backup Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-5" />
            Security Backup
          </CardTitle>
          <CardDescription>
            Link your accounts for security backup and recovery
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google Account */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-red-500/10">
                <Mail className="size-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Google Account</p>
                {googleLinked ? (
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Not linked</p>
                )}
              </div>
            </div>
            {googleLinked ? (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30 gap-1">
                <CheckCircle2 className="size-3" />
                Linked
              </Badge>
            ) : (
              <Button variant="outline" size="sm" onClick={handleLinkGoogle}>
                Link Google Account
              </Button>
            )}
          </div>

          {/* Telegram Account */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-sky-500/10">
                <Send className="size-5 text-sky-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Telegram Account</p>
                {telegramLinked ? (
                  <p className="text-xs text-muted-foreground">@{user?.name?.toLowerCase().replace(/\s/g, '_')}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Not linked</p>
                )}
              </div>
            </div>
            {telegramLinked ? (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30 gap-1">
                <CheckCircle2 className="size-3" />
                Linked
              </Badge>
            ) : (
              <Button variant="outline" size="sm" onClick={handleLinkTelegram}>
                Link Telegram Account
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Section */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm text-muted-foreground">Name</span>
              <span className="text-sm font-medium">{user?.name}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm font-medium">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm text-muted-foreground">Provider</span>
              <Badge variant="secondary" className="capitalize">{user?.provider}</Badge>
            </div>
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button
              variant="destructive"
              className="gap-2"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="size-4" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage your sessions and security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Current Session</p>
              <p className="text-xs text-muted-foreground">
                Active since {new Date().toLocaleDateString()} — This device
              </p>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30">
              Active
            </Badge>
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setSignOutAllDialogOpen(true)}
            >
              <LogOut className="size-4" />
              Sign out of all devices
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove all your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Sign Out All Dialog */}
      <Dialog open={signOutAllDialogOpen} onOpenChange={setSignOutAllDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign out of all devices?</DialogTitle>
            <DialogDescription>
              You will be signed out of all devices. You&apos;ll need to sign in
              again on each device.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSignOutAllDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSignOutAll}>
              Sign Out All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
