import { NextResponse } from 'next/server'
import { getSupabaseConfig } from '@/lib/supabase-client'

/**
 * GET /api/supabase/config
 * Returns the current Supabase configuration status (safe to expose — no secrets)
 */
export async function GET() {
  const config = getSupabaseConfig()

  return NextResponse.json({
    configured: config.configured,
    hasUrl: config.hasUrl,
    hasAnonKey: config.hasAnonKey,
    hasServiceKey: config.hasServiceKey,
    anonKeyFormat: config.anonKeyFormat,
    serviceKeyFormat: config.serviceKeyFormat,
    isModernKeys: config.isModernKeys,
    // Show masked URL
    urlMasked: config.url
      ? `${config.url.slice(0, 30)}...`
      : 'Not set',
    // Show key format hint (mask the actual key)
    anonKeyHint: config.anonKey
      ? `${config.anonKey.slice(0, 16)}...`
      : 'Not set',
    issues: config.issues,
  })
}
