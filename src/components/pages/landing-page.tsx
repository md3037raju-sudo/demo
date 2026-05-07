'use client'

import { useState } from 'react'
import { useNavigationStore } from '@/lib/navigation-store'
import { useAuthStore } from '@/lib/auth-store'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'
import {
  Lock,
  Smartphone,
  Activity,
  Menu,
  ArrowRight,
  CheckCircle2,
  Eye,
  Fingerprint,
  ShieldCheck,
  Zap,
  Globe,
} from 'lucide-react'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { AnimateIn } from '@/components/shared/animate-in'
import { CoreXLogo, CoreXLogoIcon } from '@/components/shared/corex-logo'

export function LandingPage() {
  const navigate = useNavigationStore((s) => s.navigate)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { label: 'About', page: 'about' as const },
    { label: 'Pricing', page: 'about' as const },
    { label: 'Docs', page: 'docs' as const },
  ]

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('dashboard')
    } else {
      navigate('login')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <button
            onClick={() => navigate('landing')}
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <CoreXLogo height={28} />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Button
                key={link.label}
                variant="ghost"
                size="sm"
                onClick={() => navigate(link.page)}
                className="text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </Button>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('login')}
            >
              Login
            </Button>
            <Button size="sm" onClick={handleGetStarted}>
              Get Started
              <ArrowRight className="size-4" />
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="size-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <CoreXLogo height={24} />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4 pt-4">
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.label}>
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => navigate(link.page)}
                    >
                      {link.label}
                    </Button>
                  </SheetClose>
                ))}
                <Separator className="my-2" />
                <div className="flex items-center justify-between px-2">
                  <span className="text-sm text-muted-foreground">Theme</span>
                  <ThemeToggle />
                </div>
                <Separator className="my-2" />
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => navigate('login')}
                  >
                    Login
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button className="w-full" onClick={handleGetStarted}>
                    Get Started
                    <ArrowRight className="size-4" />
                  </Button>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative flex-1 overflow-hidden">
        {/* Background decorations */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-20 -left-20 size-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-40 -right-20 size-80 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="flex flex-col items-center text-center">
            {/* Logo above badge */}
            <AnimateIn type="scale-in" className="relative mb-8">
              <div className="relative flex items-center justify-center">
                <div className="absolute size-36 rounded-full bg-primary/10 animate-pulse" />
                <div className="absolute size-28 rounded-full bg-primary/15" />
                <CoreXLogoIcon size={64} className="relative" animate />
              </div>
              {/* Orbiting dots */}
              <div className="absolute inset-0 animate-[spin_12s_linear_infinite]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 size-2 rounded-full bg-primary/60" />
              </div>
              <div className="absolute inset-0 animate-[spin_8s_linear_infinite_reverse]">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 size-1.5 rounded-full bg-primary/40" />
              </div>
            </AnimateIn>

            <AnimateIn type="fade-in" delay={100}>
              <Badge variant="secondary" className="mb-6 gap-1.5 px-3 py-1 text-sm">
                <ShieldCheck className="size-3.5" />
                Clash-Powered VPN
              </Badge>
            </AnimateIn>

            <AnimateIn type="slide-up" delay={200}>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Fast & Secure Proxy,{' '}
                <span className="text-primary">Simplified</span>
              </h1>
            </AnimateIn>

            <AnimateIn type="slide-up" delay={350}>
              <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                CoreX delivers blazing-fast proxy servers with military-grade
                encryption. Browse privately with our Clash-powered app — multiple
                protocols, load-balanced nodes, and seamless connectivity.
              </p>
            </AnimateIn>

            <AnimateIn type="slide-up" delay={500}>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Button size="lg" onClick={handleGetStarted} className="gap-2">
                  Get CoreX
                  <ArrowRight className="size-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('about')}
                  className="gap-2"
                >
                  Learn More
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </AnimateIn>

            {/* Trust indicators */}
            <AnimateIn type="fade-in" delay={650}>
              <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-primary" />
                  No credit card required
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-primary" />
                  Setup in 2 minutes
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-primary" />
                  Works with Clash
                </div>
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="border-t bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <AnimateIn type="slide-up" delay={100}>
            <div className="text-center mb-14">
              <Badge variant="outline" className="mb-4">
                Features
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything You Need to{' '}
                <span className="text-primary">Browse Privately</span>
              </h2>
              <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
                From multi-protocol support to load-balanced nodes, CoreX
                provides everything you need for fast, private browsing.
              </p>
            </div>
          </AnimateIn>

          <AnimateIn type="slide-up" stagger delay={200}>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: Globe,
                  title: 'Multi-Protocol Support',
                  description:
                    'VLESS, VMess, Trojan, Shadowsocks, WireGuard, and more. All major protocols supported with full auth configuration.',
                },
                {
                  icon: Activity,
                  title: 'Load-Balanced Nodes',
                  description:
                    'Smart proxy selection with load-balanced subgroups. Always connect to the fastest available server automatically.',
                },
                {
                  icon: Fingerprint,
                  title: 'Seamless Authentication',
                  description:
                    'Secure login via Google & Telegram only. No passwords to remember, no phishing vectors.',
                },
                {
                  icon: Activity,
                  title: 'Real-time Monitoring',
                  description:
                    'Track your subscription status, bandwidth usage, and connected devices in real-time.',
                },
              ].map((feature) => (
                <Card
                  key={feature.title}
                  className="group relative overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
                >
                  <CardHeader>
                    <div className="mb-2 flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                      <feature.icon className="size-6" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ── Security Highlights Section ── */}
      <section className="border-t bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <AnimateIn type="slide-up" delay={100}>
            <div className="text-center mb-14">
              <Badge variant="outline" className="mb-4">
                Infrastructure
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Built on a Foundation of{' '}
                <span className="text-primary">Reliability</span>
              </h2>
              <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
                Robust infrastructure ensures your proxy connections stay fast,
                secure, and always available.
              </p>
            </div>
          </AnimateIn>

          <AnimateIn type="slide-up" stagger delay={200}>
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                {
                  icon: Lock,
                  badge: 'Encryption',
                  title: '256-bit Encryption',
                  description:
                    'AES-256 encryption on all proxy connections. Your traffic stays private and secure.',
                },
                {
                  icon: Eye,
                  badge: 'Privacy',
                  title: 'Zero Data Leaks',
                  description:
                    'No DNS leaks, no WebRTC leaks. Your real IP stays hidden — guaranteed.',
                },
                {
                  icon: ShieldCheck,
                  badge: 'Reliability',
                  title: '99.9% Uptime',
                  description:
                    'Redundant server infrastructure ensures you\'re always connected. Auto-failover to backup nodes.',
                },
              ].map((item) => (
                <Card
                  key={item.title}
                  className="group transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                >
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                        <item.icon className="size-5" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                    <CardDescription className="leading-relaxed">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="border-t">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          {/* Background glow */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="size-96 rounded-full bg-primary/5 blur-3xl" />
          </div>

          <div className="relative flex flex-col items-center text-center">
            <AnimateIn type="scale-in">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6">
                <Zap className="size-8" />
              </div>
            </AnimateIn>
            <AnimateIn type="slide-up" delay={100}>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to Browse Privately?
              </h2>
            </AnimateIn>
            <AnimateIn type="slide-up" delay={200}>
              <p className="mt-4 text-muted-foreground text-lg max-w-xl">
                Join thousands of users who trust CoreX for fast, secure proxy
                access. Get started in minutes.
              </p>
            </AnimateIn>
            <AnimateIn type="slide-up" delay={350}>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button size="lg" onClick={handleGetStarted} className="gap-2">
                  Get CoreX
                  <ArrowRight className="size-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('about')}
                >
                  Learn More
                </Button>
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="mt-auto border-t bg-secondary/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            {/* Brand */}
            <div className="flex flex-col gap-3">
              <CoreXLogo height={28} />
              <p className="max-w-xs text-sm text-muted-foreground">
                Fast, secure proxy subscriptions for the CoreX app. Browse
                privately with confidence.
              </p>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 gap-x-16 gap-y-3 text-sm">
              <div className="flex flex-col gap-2">
                <span className="font-medium">Product</span>
                <button
                  onClick={() => navigate('about')}
                  className="text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  About
                </button>
                <button
                  onClick={() => navigate('docs')}
                  className="text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  Docs
                </button>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-medium">Legal</span>
                <button className="text-muted-foreground hover:text-foreground transition-colors text-left">
                  Privacy Policy
                </button>
                <button className="text-muted-foreground hover:text-foreground transition-colors text-left">
                  Terms of Service
                </button>
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              &copy; 2025 CoreX. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Globe className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Available worldwide
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
