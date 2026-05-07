/**
 * CoreX — Supabase Client (Supports New & Legacy Key Formats)
 *
 * Supports:
 *   - New format: sb_publishable_* (anon) / sb_secret_* (service role)
 *   - Legacy format: eyJ... (JWT)
 *
 * Lazy-initialized clients that won't crash the app if credentials are missing.
 * - supabaseBrowser: client-side (publishable/anon key)
 * - supabaseServer: server-side (secret/service role key)
 * - getSupabaseConfig(): check if Supabase is properly configured
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ── Config Check ──

function isValidKey(key: string): boolean {
  if (!key || key.length < 10) return false
  // Accept both new format (sb_publishable_*, sb_secret_*) and legacy JWT (eyJ...)
  return key.startsWith('sb_publishable_') || key.startsWith('sb_secret_') || key.startsWith('eyJ')
}

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  const hasUrl = url.startsWith('https://') && url.includes('.supabase.co')
  const hasAnonKey = isValidKey(anonKey)
  const hasServiceKey = isValidKey(serviceKey)

  // Detect key format for display
  const anonKeyFormat = anonKey.startsWith('sb_publishable_') ? 'new' : anonKey.startsWith('eyJ') ? 'legacy' : 'invalid'
  const serviceKeyFormat = serviceKey.startsWith('sb_secret_') ? 'new' : serviceKey.startsWith('eyJ') ? 'legacy' : 'invalid'

  return {
    url,
    anonKey,
    serviceKey,
    configured: hasUrl && hasAnonKey && hasServiceKey,
    hasUrl,
    hasAnonKey,
    hasServiceKey,
    anonKeyFormat,
    serviceKeyFormat,
    isModernKeys: anonKeyFormat === 'new' && serviceKeyFormat === 'new',
    issues: [
      !hasUrl && 'NEXT_PUBLIC_SUPABASE_URL must be https://<project>.supabase.co',
      !hasAnonKey && 'NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or invalid (expected: sb_publishable_* or eyJ...)',
      !hasServiceKey && 'SUPABASE_SERVICE_ROLE_KEY is missing or invalid (expected: sb_secret_* or eyJ...)',
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

  console.log('[Supabase] Browser client initialized', config.isModernKeys ? '(modern keys)' : '(legacy keys)')
  return _supabaseBrowser
}

// Lazy export (safe to import anywhere)
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

  console.log('[Supabase] Server client initialized', config.isModernKeys ? '(modern keys)' : '(legacy keys)')
  return _supabaseServer
}

// Lazy export (safe to import anywhere)
export const supabaseServer = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseServer() as any)[prop]
  },
})

// ── Reset clients (useful when .env changes) ──

export function resetSupabaseClients() {
  _supabaseBrowser = null
  _supabaseServer = null
}
