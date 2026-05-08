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
import { CoreXLogo } from '@/components/shared/corex-logo'
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
        description: 'Learn what CoreX is and how it powers your private browsing.',
        content:
          'CoreX is a Clash-based proxy app for Android that delivers blazing-fast, secure internet access. With support for multiple protocols including VLESS, VMess, Trojan, and Shadowsocks, CoreX provides load-balanced proxy connections through our global server network. Browse privately, bypass restrictions, and enjoy seamless connectivity — all from a single app.',
      },
      {
        id: 'gs-2',
        title: 'Setting Up Your Account',
        description: 'Create your CoreX account and configure your proxy subscription.',
        content:
          'To get started with CoreX, visit our sign-up page and create an account using Google or Telegram login. After signing in, you\'ll be guided through the subscription setup where you can choose a plan, configure your proxy protocols, and connect your first device. The entire process takes less than 5 minutes.',
      },
      {
        id: 'gs-3',
        title: 'System Requirements',
        description: 'Check the minimum requirements for running CoreX.',
        content:
          'CoreX supports Android 8.0 and above. A stable internet connection is required for proxy connectivity. We recommend at least 100MB of free storage for the app and proxy configuration files. For the best experience, a Wi-Fi or 4G/5G connection is recommended.',
      },
      {
        id: 'gs-4',
        title: 'Downloading & Installing CoreX',
        description: 'Step-by-step guide to download and install CoreX on your device.',
        content:
          'Visit the Download page in your dashboard to get the latest version of CoreX. Download the APK and enable installation from unknown sources in your Android settings. After installation, launch the app and sign in with your CoreX account to activate your proxy subscription.',
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
        title: 'Authentication Methods',
        description: 'Understanding CoreX login via Google and Telegram.',
        content:
          'CoreX uses Google and Telegram as the only authentication methods — no passwords required. This approach eliminates phishing vectors and password reuse risks. Go to Settings → Connected Accounts to manage your linked accounts. You can connect both Google and Telegram and set one as your primary sign-in method.',
      },
      {
        id: 'aa-3',
        title: 'Account Recovery',
        description: 'Recover your account if you lose access to your login method.',
        content:
          'If you lose access to your Google or Telegram account, contact our support team with your account verification details for manual recovery. We recommend linking both Google and Telegram to your CoreX account so you always have a backup login method available.',
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
        description: 'Compare CoreX proxy subscription plans.',
        content:
          'CoreX offers multiple subscription tiers with varying proxy bandwidth, device limits, and protocol access. All plans include access to our global proxy network with load-balanced nodes. Browse available plans from your dashboard, choose the one that fits your needs, and start browsing privately within minutes.',
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
        description: 'Install CoreX on additional Android devices and bind them to your account.',
        content:
          'Download CoreX on your new Android device from the Download page. During setup, sign in with your existing CoreX account. The device will be bound to your subscription automatically. Each subscription plan has a device binding limit — check your plan details for the specific number.',
      },
      {
        id: 'dm-2',
        title: 'Removing a Device',
        description: 'Unbind a device from your CoreX account.',
        content:
          'Go to Dashboard → Active Devices, find the device you want to remove, and click "Remove." This will unbind the device from your subscription and disable proxy access on it. The device can be re-added at any time by signing in again. Removing a device frees up a binding slot if you\'re on a device-limited plan.',
      },
      {
        id: 'dm-3',
        title: 'Device Status & Health',
        description: 'Monitor the proxy status of your connected devices.',
        content:
          'Each device in your dashboard shows a real-time status indicator: Green (Connected), Yellow (Attention Needed), or Red (Disconnected). Click on any device to see detailed connection metrics including current protocol, bandwidth usage, and server node information.',
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
          'Share your unique referral code (found in Dashboard → Referrals) with friends. When they sign up using your code and complete their first month, you both earn a ৳5 account credit. There\'s no limit to how many people you can refer. Credits are automatically applied to your next billing cycle.',
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
        title: 'CoreX Proxy Architecture',
        description: 'How CoreX routes and secures your proxy traffic.',
        content:
          'CoreX is built on the Clash proxy core, supporting multiple protocols including VLESS, VMess, Trojan, Shadowsocks, and WireGuard. All proxy connections use AES-256 encryption. Our infrastructure features load-balanced subgroups with automatic failover, ensuring 99.9% uptime. DNS and WebRTC leak protection is enabled by default on all connections.',
      },
      {
        id: 'sec-2',
        title: 'Protocol Selection & Routing',
        description: 'How to choose the right protocol and configure smart routing.',
        content:
          'CoreX supports VLESS, VMess, Trojan, Shadowsocks, and WireGuard protocols. Each protocol has different strengths: VLESS for speed, VMess for reliability, Trojan for TLS camouflage, Shadowsocks for compatibility, and WireGuard for modern performance. Use the load-balanced subgroup feature to let CoreX automatically select the best protocol and node for your current network conditions.',
      },
      {
        id: 'sec-3',
        title: 'Troubleshooting Connection Issues',
        description: 'What to do if your proxy connection drops or fails.',
        content:
          'If you experience connection issues: 1) Switch to a different proxy protocol in the app settings, 2) Try a different server node or subgroup, 3) Check your internet connection, 4) Restart the CoreX app. If issues persist, contact support at support@corex.app. Our team monitors server health 24/7 and resolves infrastructure issues promptly.',
      },
      {
        id: 'sec-4',
        title: 'Data Privacy & No-Log Policy',
        description: 'How CoreX protects your browsing privacy.',
        content:
          'CoreX operates a strict no-log policy — we never record your browsing activity, DNS queries, or connection destinations. Our servers only store minimal connection metadata required for load balancing and billing. You have the right to access, export, or delete your account data at any time from Settings → Privacy. Our complete privacy policy is available at corex.app/privacy.',
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
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    )
  }

  const currentSection = docSections.find((s) => s.id === activeSection) ?? docSections[0]

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Bar */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CoreXLogo height={28} />
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
