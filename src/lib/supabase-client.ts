/**
 * CoreX — Supabase Client (Safe Lazy Init)
 *
 * Supports both new (sb_publishable/sb_secret) and legacy (eyJ JWT) key formats.
 * Clients are lazy-initialized on first actual use to prevent crashes.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ── Key Validation ──

function isValidKey(key: string): boolean {
  if (!key || key.length < 10) return false
  return key.startsWith('sb_publishable_') || key.startsWith('sb_secret_') || key.startsWith('eyJ')
}

// ── Config Check ──

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  const hasUrl = url.startsWith('https://') && url.includes('.supabase.co')
  const hasAnonKey = isValidKey(anonKey)
  const hasServiceKey = isValidKey(serviceKey)

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
      !hasUrl && 'NEXT_PUBLIC_SUPABASE_URL is missing or invalid',
      !hasAnonKey && 'NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or invalid',
      !hasServiceKey && 'SUPABASE_SERVICE_ROLE_KEY is missing or invalid',
    ].filter(Boolean) as string[],
  }
}

// ── Placeholder client (never crashes, but all operations fail gracefully) ──

function createPlaceholderClient(): SupabaseClient {
  // Use a minimal valid-looking URL/key so createClient doesn't throw
  return createClient('https://placeholder.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder', {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// ── Browser Client (lazy, safe) ──

let _supabaseBrowser: SupabaseClient | null = null
let _browserInitAttempted = false

export function getSupabaseBrowser(): SupabaseClient {
  if (_supabaseBrowser) return _supabaseBrowser
  if (_browserInitAttempted) return _supabaseBrowser!

  _browserInitAttempted = true

  try {
    const config = getSupabaseConfig()
    if (!config.configured) {
      console.warn('[Supabase] Browser: credentials not configured, using placeholder')
      _supabaseBrowser = createPlaceholderClient()
      return _supabaseBrowser
    }

    _supabaseBrowser = createClient(config.url, config.anonKey, {
      realtime: { params: { eventsPerSecond: 10 } },
    })
    console.log('[Supabase] Browser client ready', config.isModernKeys ? '(modern keys)' : '(legacy keys)')
  } catch (err) {
    console.error('[Supabase] Browser init failed:', err)
    _supabaseBrowser = createPlaceholderClient()
  }

  return _supabaseBrowser
}

/**
 * Browser client — import and call as a function.
 * DO NOT use at module top-level; call inside useEffect or event handlers.
 */
export { getSupabaseBrowser as supabaseBrowser }

// ── Server Client (lazy, safe) ──

let _supabaseServer: SupabaseClient | null = null
let _serverInitAttempted = false

export function getSupabaseServer(): SupabaseClient {
  if (_supabaseServer) return _supabaseServer
  if (_serverInitAttempted) return _supabaseServer!

  _serverInitAttempted = true

  try {
    const config = getSupabaseConfig()
    if (!config.configured) {
      console.warn('[Supabase] Server: credentials not configured, using placeholder')
      _supabaseServer = createPlaceholderClient()
      return _supabaseServer
    }

    _supabaseServer = createClient(config.url, config.serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    console.log('[Supabase] Server client ready', config.isModernKeys ? '(modern keys)' : '(legacy keys)')
  } catch (err) {
    console.error('[Supabase] Server init failed:', err)
    _supabaseServer = createPlaceholderClient()
  }

  return _supabaseServer
}

/**
 * Server client — import and call as a function.
 * Use inside API route handlers, NOT at module top-level.
 */
export { getSupabaseServer as supabaseServer }

// ── Reset (for testing / env change) ──

export function resetSupabaseClients() {
  _supabaseBrowser = null
  _supabaseServer = null
  _browserInitAttempted = false
  _serverInitAttempted = false
}
