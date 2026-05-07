'use client'

import { useEffect } from 'react'
import { useNavigationStore } from '@/lib/navigation-store'
import { useAuthStore } from '@/lib/auth-store'
import { syncAllStores } from '@/lib/sync-all'
import { LandingPage } from '@/components/pages/landing-page'
import { LoginPage } from '@/components/pages/login-page'
import { AboutPage } from '@/components/pages/about-page'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { AdminLayout } from '@/components/admin/admin-layout'
import { DownloadPage } from '@/components/pages/download-page'
import { DocsPage } from '@/components/pages/docs-page'

export default function Home() {
  const currentPage = useNavigationStore((s) => s.currentPage)
  const user = useAuthStore((s) => s.user)

  // Trigger Supabase sync once when the user enters an authenticated area
  // This prevents crashes from syncing on the landing page
  useEffect(() => {
    if (user && (currentPage.startsWith('admin') || currentPage === 'dashboard' || currentPage === 'overview' || currentPage === 'payments' || currentPage === 'subscriptions' || currentPage === 'download' || currentPage === 'docs')) {
      syncAllStores().catch(() => {
        // Silently ignore — stores use mock data as fallback
      })
    }
  }, [user, currentPage])

  // Admin pages (role-guarded)
  if (currentPage.startsWith('admin')) {
    if (user?.role !== 'admin') return <LoginPage />
    return <AdminLayout />
  }

  // Public pages
  if (currentPage === 'landing') return <LandingPage />
  if (currentPage === 'login') return <LoginPage />
  if (currentPage === 'about') return <AboutPage />

  // Auth-only pages
  if (currentPage === 'download') return <DownloadPage />
  if (currentPage === 'docs') return <DocsPage />

  // User dashboard pages (all wrapped in dashboard layout)
  return <DashboardLayout />
}
