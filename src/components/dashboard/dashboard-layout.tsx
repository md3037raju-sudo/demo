'use client'

import React, { useEffect } from 'react'
import { useNavigationStore, type Page } from '@/lib/navigation-store'
import { useAuthStore } from '@/lib/auth-store'
import { useIsMobile } from '@/hooks/use-mobile'
import { Button } from '@/components/ui/button'
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
  CreditCard,
  Smartphone,
  Wallet,
  Users,
  Settings,
  Download,
  FileText,
  LogOut,
  Menu,
  Shield,
  Palette,
  MessageSquare,
} from 'lucide-react'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { AnimateIn } from '@/components/shared/animate-in'
import { CoreXLogo, CoreXLogoIcon } from '@/components/shared/corex-logo'
import { OverviewPage } from './overview-page'
import { SubscriptionsPage } from './subscriptions-page'
import { ActiveDevicesPage } from './active-devices-page'
import { PaymentsPage } from './payments-page'
import { ReferralsPage } from './referrals-page'
import { SettingsPage } from './settings-page'
import { ThemePage } from './theme-page'
import { UserTicketsPage } from './user-tickets-page'

interface NavItem {
  label: string
  icon: React.ElementType
  page: Page
}

const mainNavItems: NavItem[] = [
  { label: 'Overview', icon: LayoutDashboard, page: 'dashboard' },
  { label: 'Subscriptions', icon: CreditCard, page: 'dashboard/subscriptions' },
  { label: 'Active Devices', icon: Smartphone, page: 'dashboard/activedevices' },
  { label: 'Payments', icon: Wallet, page: 'dashboard/payments' },
  { label: 'Referrals', icon: Users, page: 'dashboard/referrals' },
  { label: 'Themes', icon: Palette, page: 'dashboard/themes' },
  { label: 'Tickets', icon: MessageSquare, page: 'dashboard/tickets' },
  { label: 'Settings', icon: Settings, page: 'dashboard/settings' },
]

const extraNavItems: NavItem[] = [
  { label: 'Download', icon: Download, page: 'download' },
  { label: 'Docs', icon: FileText, page: 'docs' },
]

function getPageTitle(page: string): string {
  switch (page) {
    case 'dashboard':
      return 'Overview'
    case 'dashboard/subscriptions':
      return 'Subscription History'
    case 'dashboard/activedevices':
      return 'Active Devices'
    case 'dashboard/payments':
      return 'Payments'
    case 'dashboard/referrals':
      return 'Referrals'
    case 'dashboard/themes':
      return 'Themes'
    case 'dashboard/tickets':
      return 'Support Tickets'
    case 'dashboard/settings':
      return 'Settings'
    default:
      return 'Dashboard'
  }
}

function renderPage(page: string) {
  switch (page) {
    case 'dashboard':
      return <AnimateIn type="slide-up" key="dashboard"><OverviewPage /></AnimateIn>
    case 'dashboard/subscriptions':
      return <AnimateIn type="slide-up" key="subscriptions"><SubscriptionsPage /></AnimateIn>
    case 'dashboard/activedevices':
      return <AnimateIn type="slide-up" key="activedevices"><ActiveDevicesPage /></AnimateIn>
    case 'dashboard/payments':
      return <AnimateIn type="slide-up" key="payments"><PaymentsPage /></AnimateIn>
    case 'dashboard/referrals':
      return <AnimateIn type="slide-up" key="referrals"><ReferralsPage /></AnimateIn>
    case 'dashboard/themes':
      return <AnimateIn type="slide-up" key="themes"><ThemePage /></AnimateIn>
    case 'dashboard/tickets':
      return <AnimateIn type="slide-up" key="tickets"><UserTicketsPage /></AnimateIn>
    case 'dashboard/settings':
      return <AnimateIn type="slide-up" key="settings"><SettingsPage /></AnimateIn>
    default:
      return <AnimateIn type="slide-up" key="default"><OverviewPage /></AnimateIn>
  }
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
        <CoreXLogo height={28} />
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
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
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
          {extraNavItems.map((item) => {
            return (
              <Button
                key={item.page}
                variant="ghost"
                className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                onClick={() => handleNavigate(item.page)}
              >
                <item.icon className="size-4" />
                {item.label}
              </Button>
            )
          })}
        </nav>

        {/* Admin Access (visible only for admins) */}
        {user?.role === 'admin' && (
          <>
            <Separator className="my-3" />
            <nav className="flex flex-col gap-1">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-red-400/80 hover:text-red-400 hover:bg-red-500/10"
                onClick={() => handleNavigate('admin')}
              >
                <Shield className="size-4" />
                Admin Panel
              </Button>
            </nav>
          </>
        )}
      </ScrollArea>

      {/* User section */}
      <Separator />
      <div className="flex items-center gap-3 p-4">
        <Avatar className="size-9">
          <AvatarFallback className="bg-primary/20 text-primary text-sm">
            {user ? getInitials(user.name) : 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{user?.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    </div>
  )
}

export function DashboardLayout() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const { currentPage, navigate } = useNavigationStore()
  const isMobile = useIsMobile()
  const [sheetOpen, setSheetOpen] = React.useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('login')
    }
  }, [isAuthenticated, navigate])

  if (!isAuthenticated || !user) {
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
    <div className="flex h-screen overflow-hidden pb-safe">
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

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
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
          {renderPage(currentPage)}
        </main>
      </div>
    </div>
  )
}
