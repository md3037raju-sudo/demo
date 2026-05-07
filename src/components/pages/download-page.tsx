'use client'

import { Shield, ArrowLeft, Download, CheckCircle2, AlertTriangle, Smartphone, FileCheck, Lock, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'
import { useNavigationStore } from '@/lib/navigation-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export function DownloadPage() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigationStore((s) => s.navigate)

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">CoreX</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('landing')}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Home
            </Button>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-6 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                <Lock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold">Authentication Required</h2>
              <p className="text-muted-foreground text-sm">
                Please sign in to download CoreX
              </p>
              <Button className="w-full" onClick={() => navigate('login')}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Bar */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="font-semibold text-lg">Download</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
        {/* Download Card */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-primary/20 via-primary/5 to-transparent p-6 sm:p-10">
            <div className="flex flex-col items-center text-center gap-6">
              {/* App Icon */}
              <div className="w-24 h-24 rounded-3xl bg-primary/20 border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/10">
                <Shield className="w-12 h-12 text-primary" />
              </div>

              {/* App Info */}
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">CoreX App</h2>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <Badge variant="secondary">v2.1.0</Badge>
                  <Badge variant="outline">24.5 MB</Badge>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg">
                <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
                  <Smartphone className="w-4 h-4 text-primary" />
                  <span>Android 8.0+</span>
                </div>
                <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
                  <FileCheck className="w-4 h-4 text-primary" />
                  <span>SHA-256 verified</span>
                </div>
                <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
                  <Lock className="w-4 h-4 text-primary" />
                  <span>Signed build</span>
                </div>
              </div>

              <Separator className="max-w-xs" />

              {/* Download Button */}
              <Button size="lg" className="w-full max-w-xs h-12 text-base font-semibold gap-2">
                <Download className="w-5 h-5" />
                Download APK
              </Button>

              <p className="text-xs text-muted-foreground">
                By downloading, you agree to the{' '}
                <span className="text-primary underline underline-offset-2 cursor-pointer">
                  Terms of Service
                </span>
              </p>
            </div>
          </div>
        </Card>

        {/* Installation Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Smartphone className="w-5 h-5 text-primary" />
              Installation Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  step: 1,
                  title: 'Download the APK file',
                  desc: 'Tap the download button above to save the CoreX APK to your device.',
                },
                {
                  step: 2,
                  title: 'Enable "Install from Unknown Sources"',
                  desc: 'Go to Settings → Security → Enable "Install from Unknown Sources" to allow APK installation.',
                },
                {
                  step: 3,
                  title: 'Open the downloaded file and tap Install',
                  desc: 'Locate the downloaded APK in your notifications or file manager, then tap Install.',
                },
                {
                  step: 4,
                  title: 'Launch CoreX and sign in',
                  desc: 'Open the app and sign in with your CoreX account to get started.',
                },
              ].map((item, idx) => (
                <div key={item.step} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary">{item.step}</span>
                    </div>
                    {idx < 3 && <div className="w-px flex-1 bg-border mt-2" />}
                  </div>
                  <div className="pb-5">
                    <h4 className="font-medium text-sm">{item.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              Security Notice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                'Only download CoreX from this official page. Third-party sources may distribute modified or malicious versions.',
                'Verify the SHA-256 checksum after download to ensure file integrity. The official checksum is displayed on the download confirmation.',
                'CoreX will never ask for your password outside the app. Report any suspicious requests to security@corex.app.',
              ].map((notice, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <span className="text-amber-100/80">{notice}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} CoreX. All rights reserved.</span>
          <Button
            variant="link"
            className="text-muted-foreground p-0 h-auto"
            onClick={() => navigate('dashboard')}
          >
            <ChevronRight className="w-3 h-3 mr-1" />
            Back to Dashboard
          </Button>
        </div>
      </footer>
    </div>
  )
}
