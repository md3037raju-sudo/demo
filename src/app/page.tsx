'use client'

import { useNavigationStore } from '@/lib/navigation-store'
import { useAuthStore } from '@/lib/auth-store'
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
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  // Admin pages (role-guarded)
  if (currentPage.startsWith('admin')) {
    if (user?.role !== 'admin') return <LoginPage />
    return <AdminLayout />
  }

  // Public pages
  if (currentPage === 'landing') return <LandingPage />
  if (currentPage === 'login') return <LoginPage />
  if (currentPage === 'about') return <AboutPage />

  // Auth-only pages — must be logged in
  if (currentPage === 'download') {
    if (!isAuthenticated) return <LoginPage />
    return <DownloadPage />
  }
  if (currentPage === 'docs') {
    if (!isAuthenticated) return <LoginPage />
    return <DocsPage />
  }

  // User dashboard pages (all wrapped in dashboard layout)
  if (!isAuthenticated) return <LoginPage />
  return <DashboardLayout />
}
