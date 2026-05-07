'use client'

import { useNavigationStore } from '@/lib/navigation-store'
import { LandingPage } from '@/components/pages/landing-page'
import { LoginPage } from '@/components/pages/login-page'
import { AboutPage } from '@/components/pages/about-page'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { DownloadPage } from '@/components/pages/download-page'
import { DocsPage } from '@/components/pages/docs-page'

export default function Home() {
  const currentPage = useNavigationStore((s) => s.currentPage)

  // Public pages
  if (currentPage === 'landing') return <LandingPage />
  if (currentPage === 'login') return <LoginPage />
  if (currentPage === 'about') return <AboutPage />

  // Auth-only pages
  if (currentPage === 'download') return <DownloadPage />
  if (currentPage === 'docs') return <DocsPage />

  // Dashboard pages (all wrapped in dashboard layout)
  return <DashboardLayout />
}
