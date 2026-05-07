'use client'

import { useState, useEffect } from 'react'
import {
  Shield,
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'
import { useNavigationStore } from '@/lib/navigation-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface DocArticle {
  id: string
  title: string
  description: string
  content: string
}

interface DocSection {
  id: string
  label: string
  icon: React.ReactNode
  articles: DocArticle[]
}

const docSections: DocSection[] = [
  {
    id: 'getting-started',
    label: 'Getting Started',
    icon: <BookOpen className="w-4 h-4" />,
    articles: [
      {
        id: 'gs-1',
        title: 'Welcome to CoreX',
        description: 'Learn what CoreX is and how it can protect your digital life.',
        content:
          'CoreX is a comprehensive security platform designed to safeguard your devices, data, and digital identity. With enterprise-grade encryption and real-time threat monitoring, CoreX provides peace of mind in an increasingly connected world. Our platform offers device management, secure browsing, identity protection, and much more—all from a single dashboard.',
      },
      {
        id: 'gs-2',
        title: 'Setting Up Your Account',
        description: 'Create your CoreX account and configure your initial settings.',
        content:
          'To get started with CoreX, visit our sign-up page and create an account using your email or social login (Google/Telegram). After verification, you\'ll be guided through the initial setup wizard which helps you configure your security preferences, enable two-factor authentication, and connect your first device. The entire process takes less than 5 minutes.',
      },
      {
        id: 'gs-3',
        title: 'System Requirements',
        description: 'Check the minimum requirements for running CoreX.',
        content:
          'CoreX supports Android 8.0 and above, iOS 14.0 and above, Windows 10+, macOS 11+, and major Linux distributions. A stable internet connection is required for real-time protection features. We recommend at least 2GB of free storage for full functionality including offline threat databases.',
      },
      {
        id: 'gs-4',
        title: 'Downloading & Installing CoreX',
        description: 'Step-by-step guide to download and install CoreX on your device.',
        content:
          'Visit the Download page in your dashboard to get the latest version of CoreX. For Android devices, download the APK and enable installation from unknown sources. For desktop platforms, run the installer and follow the on-screen instructions. After installation, launch the app and sign in with your CoreX credentials to activate protection.',
      },
    ],
  },
  {
    id: 'account-auth',
    label: 'Account & Authentication',
    icon: <Shield className="w-4 h-4" />,
    articles: [
      {
        id: 'aa-1',
        title: 'Managing Your Profile',
        description: 'Update your personal information and account details.',
        content:
          'Navigate to Settings → Profile to update your display name, email address, and avatar. Email changes require verification before taking effect. You can also manage your notification preferences and language settings from this page.',
      },
      {
        id: 'aa-2',
        title: 'Two-Factor Authentication',
        description: 'Enable 2FA for enhanced account security.',
        content:
          'We strongly recommend enabling two-factor authentication (2FA) for your CoreX account. Go to Settings → Security → Two-Factor Authentication and follow the setup wizard. CoreX supports TOTP authenticator apps (Google Authenticator, Authy) and SMS verification as a backup method. Once enabled, you\'ll need both your password and a verification code to sign in.',
      },
      {
        id: 'aa-3',
        title: 'Password Reset & Recovery',
        description: 'Recover your account if you forget your password.',
        content:
          'If you forget your password, click "Forgot Password" on the login screen. Enter your registered email address and we\'ll send a secure reset link valid for 30 minutes. If you\'ve also lost access to your email, contact our support team with your account verification details for manual recovery.',
      },
      {
        id: 'aa-4',
        title: 'Connected Accounts',
        description: 'Link or unlink your social accounts (Google, Telegram).',
        content:
          'CoreX allows you to connect your Google or Telegram accounts for faster sign-in. Go to Settings → Connected Accounts to manage your linked accounts. You can connect multiple social accounts and set one as your primary sign-in method. Disconnecting an account won\'t delete your CoreX data.',
      },
    ],
  },
  {
    id: 'subscriptions',
    label: 'Subscriptions',
    icon: <BookOpen className="w-4 h-4" />,
    articles: [
      {
        id: 'sub-1',
        title: 'Subscription Plans Overview',
        description: 'Compare CoreX Free, Pro, and Enterprise plans.',
        content:
          'CoreX offers three tiers: Free (basic protection for 1 device), Pro ($9.99/mo — up to 5 devices, real-time monitoring, priority support), and Enterprise (custom pricing — unlimited devices, dedicated account manager, SLA guarantees). All paid plans include a 14-day free trial. Upgrade or downgrade at any time from your dashboard.',
      },
      {
        id: 'sub-2',
        title: 'Upgrading Your Plan',
        description: 'How to switch to a higher subscription tier.',
        content:
          'To upgrade, go to Dashboard → Subscriptions and click "Upgrade Plan." Select your desired tier and complete the payment. Your new benefits activate immediately. If upgrading mid-cycle, you\'ll only be charged the prorated difference for the remaining days.',
      },
      {
        id: 'sub-3',
        title: 'Cancelling a Subscription',
        description: 'How to cancel and what happens to your data.',
        content:
          'You can cancel anytime from Dashboard → Subscriptions → Manage → Cancel. Your Pro/Enterprise features remain active until the end of your current billing period. After cancellation, your account reverts to the Free tier. Your data is retained for 90 days in case you decide to resubscribe.',
      },
    ],
  },
  {
    id: 'device-management',
    label: 'Device Management',
    icon: <Shield className="w-4 h-4" />,
    articles: [
      {
        id: 'dm-1',
        title: 'Adding a New Device',
        description: 'Install CoreX on additional devices and link them to your account.',
        content:
          'Download CoreX on your new device from the Download page. During setup, sign in with your existing CoreX account. The device will automatically appear in your Dashboard → Active Devices list. Each subscription plan has a device limit — Free (1), Pro (5), Enterprise (unlimited).',
      },
      {
        id: 'dm-2',
        title: 'Removing a Device',
        description: 'Unlink a device from your CoreX account.',
        content:
          'Go to Dashboard → Active Devices, find the device you want to remove, and click "Remove." This will unlink the device from your account and disable CoreX protection on it. The device can be re-added at any time by signing in again. Removing a device frees up a slot if you\'re on a device-limited plan.',
      },
      {
        id: 'dm-3',
        title: 'Device Status & Health',
        description: 'Monitor the protection status of your connected devices.',
        content:
          'Each device in your dashboard shows a real-time status indicator: Green (Protected), Yellow (Attention Needed), or Red (At Risk). Click on any device to see detailed health metrics including last scan time, threat detection count, and system compatibility status.',
      },
    ],
  },
  {
    id: 'payments-billing',
    label: 'Payments & Billing',
    icon: <BookOpen className="w-4 h-4" />,
    articles: [
      {
        id: 'pb-1',
        title: 'Payment Methods',
        description: 'Accepted payment methods and how to update your billing info.',
        content:
          'CoreX accepts all major credit/debit cards (Visa, Mastercard, Amex), PayPal, and cryptocurrency (BTC, ETH). Go to Dashboard → Payments → Payment Methods to add, update, or remove payment methods. All payment information is encrypted and stored securely with our PCI-compliant payment processor.',
      },
      {
        id: 'pb-2',
        title: 'Viewing Billing History',
        description: 'Access your past invoices and transaction records.',
        content:
          'Navigate to Dashboard → Payments → History to view all past transactions. You can filter by date range, amount, or payment method. Click any transaction to download a PDF invoice. If you notice any discrepancies, contact billing@corex.app within 30 days for investigation.',
      },
      {
        id: 'pb-3',
        title: 'Refund Policy',
        description: 'Our refund policy and how to request a refund.',
        content:
          'CoreX offers a 30-day money-back guarantee on all new subscriptions. Renewals are eligible for a prorated refund within 7 days of the charge date. To request a refund, go to Dashboard → Payments → Request Refund or email billing@corex.app. Refunds are processed within 5–10 business days.',
      },
    ],
  },
  {
    id: 'referrals',
    label: 'Referrals',
    icon: <BookOpen className="w-4 h-4" />,
    articles: [
      {
        id: 'ref-1',
        title: 'How the Referral Program Works',
        description: 'Earn rewards by inviting friends to CoreX.',
        content:
          'Share your unique referral code (found in Dashboard → Referrals) with friends. When they sign up using your code and complete their first month, you both earn a $5 account credit. There\'s no limit to how many people you can refer. Credits are automatically applied to your next billing cycle.',
      },
      {
        id: 'ref-2',
        title: 'Tracking Your Referrals',
        description: 'Monitor the status of your sent referrals.',
        content:
          'The Referrals dashboard shows all your referral activity: Pending (friend signed up but hasn\'t completed a month), Completed (reward earned), and Expired (referral link not used within 90 days). You can also resend referral invitations directly from this page.',
      },
      {
        id: 'ref-3',
        title: 'Referral Rewards & Payouts',
        description: 'Understand how and when you receive referral rewards.',
        content:
          'Referral credits are issued within 48 hours of your referral completing their first paid month. Credits appear in your account balance and are automatically applied to your next invoice. If your credit exceeds your bill, the remaining balance carries over. For Enterprise accounts, referral rewards can be converted to cash payouts upon request.',
      },
    ],
  },
  {
    id: 'security',
    label: 'Security',
    icon: <Shield className="w-4 h-4" />,
    articles: [
      {
        id: 'sec-1',
        title: 'CoreX Security Architecture',
        description: 'How CoreX protects your data and privacy.',
        content:
          'CoreX uses AES-256 encryption for data at rest and TLS 1.3 for data in transit. Our zero-knowledge architecture means we cannot access your encrypted data. Security audits are conducted quarterly by independent third-party firms. Our infrastructure runs on SOC 2 Type II certified data centers with 99.99% uptime guarantees.',
      },
      {
        id: 'sec-2',
        title: 'Real-Time Threat Detection',
        description: 'How CoreX identifies and blocks threats in real time.',
        content:
          'CoreX employs a multi-layered threat detection system: signature-based scanning for known threats, heuristic analysis for zero-day detection, and cloud-based machine learning models that update every 15 minutes. When a threat is detected, CoreX automatically quarantines the affected file and alerts you through push notification and dashboard alert.',
      },
      {
        id: 'sec-3',
        title: 'Reporting a Security Incident',
        description: 'What to do if you suspect a security breach.',
        content:
          'If you suspect unauthorized access to your account or a security vulnerability, immediately: 1) Change your password, 2) Enable 2FA if not already active, 3) Report the incident at security@corex.app. Our security team responds within 2 hours for critical issues. We also maintain a bug bounty program for responsible vulnerability disclosure.',
      },
      {
        id: 'sec-4',
        title: 'Data Privacy & GDPR',
        description: 'Your rights regarding personal data under privacy regulations.',
        content:
          'CoreX is fully compliant with GDPR, CCPA, and other major privacy regulations. You have the right to access, export, correct, or delete your personal data at any time from Settings → Privacy. We never sell your data to third parties. Our complete privacy policy is available at corex.app/privacy.',
      },
    ],
  },
]

export function DocsPage() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigationStore((s) => s.navigate)
  const [activeSection, setActiveSection] = useState('getting-started')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('login')
    }
  }, [isAuthenticated, navigate])

  if (!isAuthenticated) {
    return (
      <div className="dark min-h-screen flex items-center justify-center bg-background text-foreground">
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    )
  }

  const currentSection = docSections.find((s) => s.id === activeSection) ?? docSections[0]

  return (
    <div className="dark min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Bar */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="font-semibold text-lg">Documentation</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 border-r border-border">
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <nav className="p-4 space-y-1">
              {docSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                    activeSection === section.id
                      ? 'bg-primary/15 text-primary border border-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {section.icon}
                  {section.label}
                </button>
              ))}
            </nav>
          </ScrollArea>
        </aside>

        {/* Mobile Sidebar (slide-down) */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-16 z-10 bg-background/95 backdrop-blur-sm">
            <nav className="p-4 space-y-1 max-w-md mx-auto">
              {docSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id)
                    setMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                    activeSection === section.id
                      ? 'bg-primary/15 text-primary border border-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {section.icon}
                  {section.label}
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
              {/* Section Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {currentSection.articles.length} articles
                  </Badge>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {currentSection.label}
                </h2>
              </div>

              <Separator className="mb-6" />

              {/* Mobile: show as accordion for section selection */}
              <div className="lg:hidden mb-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="sections">
                    <AccordionTrigger className="text-sm font-medium">
                      Jump to section
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-1 pt-1">
                        {docSections.map((section) => (
                          <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-left ${
                              activeSection === section.id
                                ? 'bg-primary/15 text-primary font-medium'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                            }`}
                          >
                            {section.icon}
                            {section.label}
                          </button>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* Articles */}
              <div className="space-y-4">
                {currentSection.articles.map((article) => (
                  <Card key={article.id} className="overflow-hidden">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value={article.id} className="border-b-0">
                        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/30 transition-colors">
                          <div className="text-left">
                            <h3 className="font-semibold text-sm sm:text-base">
                              {article.title}
                            </h3>
                            <p className="text-muted-foreground text-xs sm:text-sm mt-1 font-normal">
                              {article.description}
                            </p>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-4">
                          <Separator className="mb-4" />
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {article.content}
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </Card>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-12 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground text-center">
                  Can&apos;t find what you&apos;re looking for?{' '}
                  <span className="text-primary underline underline-offset-2 cursor-pointer">
                    Contact Support
                  </span>
                </p>
              </div>
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  )
}
