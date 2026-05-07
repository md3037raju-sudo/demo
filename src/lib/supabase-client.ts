/**
 * CoreX — Supabase Client (Crash-Resistant)
 *
 * Lazy-initialized clients that won't crash the app if credentials are missing.
 * - supabaseBrowser: client-side (anon key)
 * - supabaseServer: server-side (service role key)
 * - getSupabaseConfig(): check if Supabase is properly configured
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ── Config Check ──

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  const hasUrl = url.startsWith('https://') && url.includes('.supabase.co')
  // Supabase anon/service keys are JWTs (start with 'eyJ')
  const hasAnonKey = anonKey.startsWith('eyJ')
  const hasServiceKey = serviceKey.startsWith('eyJ')

  return {
    url,
    anonKey,
    serviceKey,
    configured: hasUrl && hasAnonKey && hasServiceKey,
    hasUrl,
    hasAnonKey,
    hasServiceKey,
    issues: [
      !hasUrl && 'NEXT_PUBLIC_SUPABASE_URL must be https://<project>.supabase.co',
      !hasAnonKey && 'NEXT_PUBLIC_SUPABASE_ANON_KEY must be a JWT (starts with eyJ...)',
      !hasServiceKey && 'SUPABASE_SERVICE_ROLE_KEY must be a JWT (starts with eyJ...)',
    ].filter(Boolean) as string[],
  }
}

// ── Lazy Browser Client ──

let _supabaseBrowser: SupabaseClient | null = null

export function getSupabaseBrowser(): SupabaseClient {
  if (_supabaseBrowser) return _supabaseBrowser

  const config = getSupabaseConfig()
  if (!config.configured) {
    console.warn('[Supabase] Browser client not initialized — missing or invalid credentials:', config.issues)
    // Return a dummy client that won't crash but logs warnings
    _supabaseBrowser = createClient('https://placeholder.supabase.co', 'eyJplaceholder', {
      realtime: { params: { eventsPerSecond: 10 } },
    })
    return _supabaseBrowser
  }

  _supabaseBrowser = createClient(config.url, config.anonKey, {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  })

  return _supabaseBrowser
}

// Legacy export (lazy getter — safe to import anywhere)
export const supabaseBrowser = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseBrowser() as any)[prop]
  },
})

// ── Lazy Server Client ──

let _supabaseServer: SupabaseClient | null = null

export function getSupabaseServer(): SupabaseClient {
  if (_supabaseServer) return _supabaseServer

  const config = getSupabaseConfig()
  if (!config.configured) {
    console.warn('[Supabase] Server client not initialized — missing or invalid credentials:', config.issues)
    _supabaseServer = createClient('https://placeholder.supabase.co', 'eyJplaceholder', {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    return _supabaseServer
  }

  _supabaseServer = createClient(config.url, config.serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return _supabaseServer
}

// Legacy export (lazy getter — safe to import anywhere)
export const supabaseServer = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseServer() as any)[prop]
  },
})
