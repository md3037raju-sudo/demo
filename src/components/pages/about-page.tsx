'use client'

import {
  Shield,
  Eye,
  ScanEye,
  Cpu,
  Users,
  ArrowRight,
  Lock,
  Globe,
  Code2,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useNavigationStore } from '@/lib/navigation-store'
import { CoreXLogo } from '@/components/shared/corex-logo'

function Navbar() {
  const navigate = useNavigationStore((s) => s.navigate)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <button
          onClick={() => navigate('landing')}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <CoreXLogo height={28} />
        </button>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-6">
          {['Features', 'Pricing', 'About'].map((item) => (
            <button
              key={item}
              onClick={() => item === 'About' ? navigate('about') : navigate('landing')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {item}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('login')}
            className="text-muted-foreground hover:text-foreground"
          >
            Login
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('login')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Get Started
          </Button>
        </div>
      </div>
    </header>
  )
}

export function AboutPage() {
  const navigate = useNavigationStore((s) => s.navigate)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28 text-center">
            <Badge
              variant="outline"
              className="mb-6 px-3 py-1 text-primary border-primary/30 bg-primary/5"
            >
              About CoreX
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground max-w-3xl mx-auto leading-tight">
              Building the future of{' '}
              <span className="text-primary">private browsing</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              CoreX was founded with a single mission: to make premium proxy
              access affordable and simple for everyone.
            </p>
          </div>
        </section>

        {/* Our Mission */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Our Mission
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Making premium proxy access affordable and simple
            </p>
          </div>
          <Card className="bg-card border-border/50 max-w-3xl mx-auto">
            <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-6">
              <div className="flex items-center justify-center size-14 rounded-xl bg-primary/10 shrink-0">
                <Globe className="size-7 text-primary" />
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">
                  Making Premium Proxy Access Affordable
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  We believe everyone deserves fast, private internet access
                  without paying a premium. Our Clash-powered platform removes
                  the complexity and cost barriers that have traditionally kept
                  quality proxy services out of reach. With CoreX, blazing-fast
                  proxy connections are just a few clicks away.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator className="max-w-6xl mx-auto opacity-30" />

        {/* Our Values */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Our Values
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              The principles that guide everything we build
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Security First */}
            <Card className="bg-card border-border/50 hover:border-primary/30 transition-colors group">
              <CardHeader className="gap-4">
                <div className="flex items-center justify-center size-12 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Shield className="size-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Privacy First</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  Your privacy is our top priority. We never log your browsing
                  activity, and our architecture is designed to keep your real
                  identity hidden at all times.
                </CardDescription>
              </CardContent>
            </Card>

            {/* User Privacy */}
            <Card className="bg-card border-border/50 hover:border-primary/30 transition-colors group">
              <CardHeader className="gap-4">
                <div className="flex items-center justify-center size-12 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Eye className="size-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Fast & Reliable</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  Load-balanced nodes and smart routing ensure you always get the
                  fastest connection. Our global server infrastructure delivers
                  consistent, low-latency performance.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Transparency */}
            <Card className="bg-card border-border/50 hover:border-primary/30 transition-colors group">
              <CardHeader className="gap-4">
                <div className="flex items-center justify-center size-12 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <ScanEye className="size-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Transparency</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  We are open about our practices and policies. From our server
                  status to our pricing, we believe trust is earned through
                  honesty and accountability.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="max-w-6xl mx-auto opacity-30" />

        {/* Technology Section */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Technology
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Built on Clash-based infrastructure for reliable proxy access
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border/50">
              <CardContent className="p-6 sm:p-8 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10">
                    <Cpu className="size-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Clash-Based Infrastructure
                  </h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  CoreX is built on Clash, the industry-standard proxy platform.
                  Our infrastructure supports multiple protocols including VLESS,
                  VMess, Trojan, and Shadowsocks, with load-balanced subgroups
                  across global server locations for reliable connectivity.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Clash Core', 'Multi-Protocol', 'Load Balancing', '99.9% Uptime'].map(
                    (tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs text-primary/80 border-primary/20 bg-primary/5"
                      >
                        {tag}
                      </Badge>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50">
              <CardContent className="p-6 sm:p-8 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10">
                    <Code2 className="size-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Multi-Protocol Support
                  </h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Support for all major proxy protocols including VLESS, VMess,
                  Trojan, Shadowsocks, and WireGuard. Smart routing with
                  load-balanced subgroups ensures you always connect to the
                  fastest available node automatically.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['VLESS', 'VMess', 'Trojan', 'WireGuard'].map(
                    (tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs text-primary/80 border-primary/20 bg-primary/5"
                      >
                        {tag}
                      </Badge>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="max-w-6xl mx-auto opacity-30" />

        {/* Team Section */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Our Team
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              The people behind the platform
            </p>
          </div>
          <Card className="bg-card border-border/50 max-w-3xl mx-auto">
            <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-6">
              <div className="flex items-center justify-center size-14 rounded-xl bg-primary/10 shrink-0">
                <Users className="size-7 text-primary" />
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">
                  Proxy & Network Engineers
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our team of network engineers, proxy infrastructure specialists,
                  and privacy advocates brings deep experience from leading
                  network and security companies. We are united by a shared
                  passion for making the internet faster and more private for
                  everyone.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
          <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/10 p-8 sm:p-12 text-center">
            <Lock className="size-8 text-primary mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Ready to browse privately?
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              Join thousands of users who trust CoreX for fast, secure proxy
              access.
            </p>
            <Button
              size="lg"
              className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8 text-base"
              onClick={() => navigate('login')}
            >
              Get Started
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </section>
      </main>

      {/* Sticky Footer */}
      <footer className="border-t border-border/40 bg-background mt-auto">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <CoreXLogo height={22} />
            <div className="flex items-center gap-6">
              {['Privacy', 'Terms', 'Security', 'Contact'].map((link) => (
                <button
                  key={link}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} CoreX. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
