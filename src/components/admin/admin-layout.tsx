'use client'

import React, { useEffect } from 'react'
import { useNavigationStore, type Page } from '@/lib/navigation-store'
import { useAuthStore } from '@/lib/auth-store'
import { useIsMobile } from '@/hooks/use-mobile'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Globe,
  Package,
  Wallet,
  ShieldAlert,
  ScrollText,
  Smartphone,
  Database,
  Megaphone,
  MessageSquare,
  FileEdit,
  LogOut,
  Menu,
  Shield,
  Settings,
  ArrowLeft,
  Ticket,
  ShieldCheck,
  Settings2,
} from 'lucide-react'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { AnimateIn } from '@/components/shared/animate-in'
import { CoreXLogo } from '@/components/shared/corex-logo'
import { AdminDashboard } from './admin-dashboard'
import { AdminUsers } from './admin-users'
import { AdminSubscriptions } from './admin-subscriptions'
import { AdminProxiesPreset } from './admin-proxies-preset'
import { AdminPlans } from './admin-plans'
import { AdminPayments } from './admin-payments'
import { AdminRules } from './admin-rules'
import { AdminLogs } from './admin-logs'
import { AdminDevices } from './admin-devices'
import { AdminDbInitPage as AdminDbInit } from './admin-db-init'
import { AdminBroadcastPage as AdminBroadcast } from './admin-broadcast'
import { AdminTicketsPage as AdminTickets } from './admin-tickets'
import { AdminCmsPage as AdminCMS } from './admin-cms'
import { AdminCoupons } from './admin-coupons'
import { AdminUtility } from './admin-utility'
import { Admin2FASettings } from './admin-2fa-settings'
import { use2FAStore } from '@/lib/2fa-store'

interface NavItem {
  label: string
  icon: React.ElementType
  page: Page
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, page: 'admin' },
  { label: 'Users', icon: Users, page: 'admin/users' },
  { label: 'Subscriptions', icon: CreditCard, page: 'admin/subscriptions' },
  { label: 'Proxy Presets', icon: Globe, page: 'admin/proxiespreset' },
  { label: 'Plans', icon: Package, page: 'admin/plans' },
  { label: 'Payments', icon: Wallet, page: 'admin/payments' },
  { label: 'Rules', icon: ShieldAlert, page: 'admin/rules' },
  { label: 'Logs', icon: ScrollText, page: 'admin/logs' },
  { label: 'Devices', icon: Smartphone, page: 'admin/devices' },
  { label: 'DB Init', icon: Database, page: 'admin/db-init' },
]

const secondaryNavItems: NavItem[] = [
  { label: 'Broadcast', icon: Megaphone, page: 'admin/broadcast' },
  { label: 'Tickets', icon: MessageSquare, page: 'admin/tickets' },
  { label: 'Coupons', icon: Ticket, page: 'admin/coupons' },
  { label: 'CMS', icon: FileEdit, page: 'admin/cms' },
  { label: 'Utility', icon: Settings2, page: 'admin/utility' },
  { label: '2FA Security', icon: ShieldCheck, page: 'admin/2fa' },
]

function getPageTitle(page: string): string {
  switch (page) {
    case 'admin':
      return 'Dashboard'
    case 'admin/users':
      return 'User Management'
    case 'admin/subscriptions':
      return 'Subscription Management'
    case 'admin/proxiespreset':
      return 'Proxy Presets'
    case 'admin/plans':
      return 'Plan Management'
    case 'admin/payments':
      return 'Payment Management'
    case 'admin/rules':
      return 'Rules & Configuration'
    case 'admin/logs':
      return 'Activity Logs'
    case 'admin/devices':
      return 'Device Management'
    case 'admin/db-init':
      return 'Database Initialization'
    case 'admin/broadcast':
      return 'Broadcast Messages'
    case 'admin/tickets':
      return 'Support Tickets'
    case 'admin/cms':
      return 'CMS Management'
    case 'admin/coupons':
      return 'Coupon Management'
    case 'admin/utility':
      return 'Utility Settings'
    case 'admin/2fa':
      return '2FA Security Settings'
    default:
      return 'Admin Panel'
  }
}

function renderAdminPage(page: string) {
  switch (page) {
    case 'admin':
      return <AnimateIn type="slide-up" key="admin-dashboard"><AdminDashboard /></AnimateIn>
    case 'admin/users':
      return <AnimateIn type="slide-up" key="admin-users"><AdminUsers /></AnimateIn>
    case 'admin/subscriptions':
      return <AnimateIn type="slide-up" key="admin-subs"><AdminSubscriptions /></AnimateIn>
    case 'admin/proxiespreset':
      return <AnimateIn type="slide-up" key="admin-proxies"><AdminProxiesPreset /></AnimateIn>
    case 'admin/plans':
      return <AnimateIn type="slide-up" key="admin-plans"><AdminPlans /></AnimateIn>
    case 'admin/payments':
      return <AnimateIn type="slide-up" key="admin-payments"><AdminPayments /></AnimateIn>
    case 'admin/rules':
      return <AnimateIn type="slide-up" key="admin-rules"><AdminRules /></AnimateIn>
    case 'admin/logs':
      return <AnimateIn type="slide-up" key="admin-logs"><AdminLogs /></AnimateIn>
    case 'admin/devices':
      return <AnimateIn type="slide-up" key="admin-devices"><AdminDevices /></AnimateIn>
    case 'admin/db-init':
      return <AnimateIn type="slide-up" key="admin-dbinit"><AdminDbInit /></AnimateIn>
    case 'admin/broadcast':
      return <AnimateIn type="slide-up" key="admin-broadcast"><AdminBroadcast /></AnimateIn>
    case 'admin/tickets':
      return <AnimateIn type="slide-up" key="admin-tickets"><AdminTickets /></AnimateIn>
    case 'admin/cms':
      return <AnimateIn type="slide-up" key="admin-cms"><AdminCMS /></AnimateIn>
    case 'admin/coupons':
      return <AnimateIn type="slide-up" key="admin-coupons"><AdminCoupons /></AnimateIn>
    case 'admin/utility':
      return <AnimateIn type="slide-up" key="admin-utility"><AdminUtility /></AnimateIn>
    case 'admin/2fa':
      return <AnimateIn type="slide-up" key="admin-2fa"><Admin2FASettings /></AnimateIn>
    default:
      return <AnimateIn type="slide-up" key="admin-default"><AdminDashboard /></AnimateIn>
  }
}

function TwoFAShieldIndicator() {
  const { isEnabled, isVerified } = use2FAStore()

  if (isEnabled && isVerified) {
    return (
      <div className="flex items-center gap-1 rounded-md px-2 py-1 bg-emerald-500/15 border border-emerald-500/30">
        <ShieldCheck className="size-3.5 text-emerald-400" />
        <span className="text-[10px] font-medium text-emerald-400">2FA</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 rounded-md px-2 py-1 bg-red-500/15 border border-red-500/30">
      <Shield className="size-3.5 text-red-400" />
      <span className="text-[10px] font-medium text-red-400">2FA</span>
    </div>
  )
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { currentPage, navigate } = useNavigationStore()
  const { user, logout } = useAuthStore()

  const handleNavigate = (page: Page) => {
    navigate(page)
    onNavigate?.()
  }

  const handleLogout = () => {
    logout()
    navigate('login')
    onNavigate?.()
  }

  const handleBackToDashboard = () => {
    navigate('dashboard')
    onNavigate?.()
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4">
        <CoreXLogo height={28} showAdminBadge />
      </div>

      <Separator />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-2">
        <nav className="flex flex-col gap-1">
          {mainNavItems.map((item) => {
            const isActive = currentPage === item.page
            return (
              <Button
                key={item.page}
                variant={isActive ? 'secondary' : 'ghost'}
                className={`w-full justify-start gap-3 ${
                  isActive
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                }`}
                onClick={() => handleNavigate(item.page)}
              >
                <item.icon className="size-4" />
                {item.label}
              </Button>
            )
          })}
        </nav>

        <Separator className="my-3" />

        <nav className="flex flex-col gap-1">
          {secondaryNavItems.map((item) => {
            const isActive = currentPage === item.page
            return (
              <Button
                key={item.page}
                variant={isActive ? 'secondary' : 'ghost'}
                className={`w-full justify-start gap-3 ${
                  isActive
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                }`}
                onClick={() => handleNavigate(item.page)}
              >
                <item.icon className="size-4" />
                {item.label}
              </Button>
            )
          })}
        </nav>
      </ScrollArea>

      {/* User section */}
      <Separator />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarFallback className="bg-primary/20 text-primary text-sm">
              {user ? getInitials(user.name) : 'A'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 text-xs"
          onClick={handleBackToDashboard}
        >
          <ArrowLeft className="size-3.5" />
          Back to User Dashboard
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-xs text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="size-3.5" />
          Sign out
        </Button>
      </div>
    </div>
  )
}

export function AdminLayout() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const { currentPage, navigate } = useNavigationStore()
  const isMobile = useIsMobile()
  const [sheetOpen, setSheetOpen] = React.useState(false)

  // Auth guard: redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated || (user && user.role !== 'admin')) {
      navigate('login')
    }
  }, [isAuthenticated, user, navigate])

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return null
  }

  const handleLogout = () => {
    logout()
    navigate('login')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="hidden md:flex w-64 shrink-0 border-r border-sidebar-border flex-col">
          <SidebarContent />
        </aside>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-background px-4 md:px-6">
          {/* Mobile menu trigger */}
          {isMobile && (
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="size-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <SidebarContent onNavigate={() => setSheetOpen(false)} />
              </SheetContent>
            </Sheet>
          )}

          <h1 className="text-lg font-semibold">{getPageTitle(currentPage)}</h1>
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px]">Admin</Badge>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <TwoFAShieldIndicator />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative size-9 rounded-full">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('dashboard')}>
                  <ArrowLeft className="mr-2 size-4" />
                  Back to User Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('dashboard/settings')}>
                  <Settings className="mr-2 size-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {renderAdminPage(currentPage)}
        </main>
      </div>
    </div>
  )
}
