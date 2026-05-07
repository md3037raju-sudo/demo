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
          <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
            <Shield className="size-5 text-primary" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            CoreX
          </span>
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
    <div className="dark min-h-screen flex flex-col bg-background">
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
              <span className="text-primary">enterprise security</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              CoreX was founded with a single mission: to make world-class
              security accessible to every organization, regardless of size or
              budget.
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
              Democratizing security for the modern enterprise
            </p>
          </div>
          <Card className="bg-card border-border/50 max-w-3xl mx-auto">
            <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-6">
              <div className="flex items-center justify-center size-14 rounded-xl bg-primary/10 shrink-0">
                <Globe className="size-7 text-primary" />
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">
                  Making Enterprise Security Accessible
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  We believe that every organization deserves the same level of
                  security protection that Fortune 500 companies enjoy. Our
                  platform removes the complexity and cost barriers that have
                  traditionally kept advanced security solutions out of reach for
                  small and mid-sized businesses. With CoreX, enterprise-grade
                  security is just a few clicks away.
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
                <CardTitle className="text-lg">Security First</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  Every feature we build has security at its core. We never
                  compromise on protection, and our architecture is designed with
                  defense-in-depth from the ground up.
                </CardDescription>
              </CardContent>
            </Card>

            {/* User Privacy */}
            <Card className="bg-card border-border/50 hover:border-primary/30 transition-colors group">
              <CardHeader className="gap-4">
                <div className="flex items-center justify-center size-12 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Eye className="size-6 text-primary" />
                </div>
                <CardTitle className="text-lg">User Privacy</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  Your data belongs to you, always. We practice minimal data
                  collection, never sell user information, and provide full
                  transparency about what we store and why.
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
                  We are open about our practices and policies. From our security
                  audits to our incident response, we believe trust is earned
                  through honesty and accountability.
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
              Built on a foundation of modern, secure architecture
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
                    Infrastructure
                  </h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  CoreX runs on a distributed, zero-trust architecture with
                  end-to-end encryption for all data in transit and at rest. Our
                  microservices are containerized and deployed across multiple
                  regions for maximum availability and fault tolerance.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Zero-Trust', 'E2E Encryption', 'Multi-Region', '99.99% Uptime'].map(
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
                    Security Architecture
                  </h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Our security stack includes real-time threat detection,
                  automated vulnerability scanning, and AI-powered anomaly
                  detection. Every API request is authenticated and rate-limited,
                  with comprehensive audit logging for compliance readiness.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Threat Detection', 'AI Monitoring', 'SOC 2', 'Audit Logs'].map(
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
                  Security Experts & Engineers
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our team of security experts, distributed systems engineers,
                  and privacy advocates brings decades of combined experience
                  from leading cybersecurity firms and enterprise technology
                  companies. We are united by a shared passion for making the
                  digital world safer for everyone.
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
              Ready to secure your workspace?
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              Join thousands of organizations that trust CoreX for their
              enterprise security needs.
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
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center size-7 rounded-md bg-primary/10">
                <Shield className="size-4 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                CoreX
              </span>
            </div>
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
