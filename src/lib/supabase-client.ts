/**
 * CoreX — Supabase Client (Crash-Proof Lazy Init)
 *
 * IMPORTANT: All consumers must call supabaseBrowser() / supabaseServer()
 * as FUNCTIONS, not use them as objects. This ensures lazy initialization.
 *
 * - Clients are created on first actual use
 * - If credentials are missing/invalid, a no-op placeholder is used
 * - Placeholder client never crashes but all operations fail gracefully
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ── Config Check ──

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  const hasUrl = url.startsWith('https://') && url.includes('.supabase.co')
  const hasAnonKey = !!(anonKey && anonKey.length > 20)
  const hasServiceKey = !!(serviceKey && serviceKey.length > 20)

  return {
    url,
    anonKey,
    serviceKey,
    configured: hasUrl && hasAnonKey && hasServiceKey,
    hasUrl,
    hasAnonKey,
    hasServiceKey,
    issues: [
      !hasUrl && 'NEXT_PUBLIC_SUPABASE_URL is missing or invalid',
      !hasAnonKey && 'NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or invalid',
      !hasServiceKey && 'SUPABASE_SERVICE_ROLE_KEY is missing or invalid',
    ].filter(Boolean) as string[],
  }
}

// ── Placeholder client (never crashes, all operations return empty/error) ──

let _placeholder: SupabaseClient | null = null

function getPlaceholderClient(): SupabaseClient {
  if (_placeholder) return _placeholder
  _placeholder = createClient('https://placeholder.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder', {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return _placeholder
}

// ── Browser Client (lazy, safe) ──

let _browserClient: SupabaseClient | null = null
let _browserInitAttempted = false

export function getSupabaseBrowser(): SupabaseClient {
  if (_browserClient) return _browserClient
  if (_browserInitAttempted) return _browserClient || getPlaceholderClient()

  _browserInitAttempted = true

  try {
    const config = getSupabaseConfig()
    if (!config.configured) {
      console.warn('[Supabase] Browser: credentials not configured, using placeholder')
      return getPlaceholderClient()
    }

    _browserClient = createClient(config.url, config.anonKey, {
      realtime: {
        params: { eventsPerSecond: 10 },
      },
    })
    console.log('[Supabase] Browser client ready')
    return _browserClient
  } catch (err) {
    console.error('[Supabase] Browser init failed:', err)
    return getPlaceholderClient()
  }
}

/** Browser client — call as function: supabaseBrowser() */
export { getSupabaseBrowser as supabaseBrowser }

// ── Server Client (lazy, safe) ──

let _serverClient: SupabaseClient | null = null
let _serverInitAttempted = false

export function getSupabaseServer(): SupabaseClient {
  if (_serverClient) return _serverClient
  if (_serverInitAttempted) return _serverClient || getPlaceholderClient()

  _serverInitAttempted = true

  try {
    const config = getSupabaseConfig()
    if (!config.configured) {
      console.warn('[Supabase] Server: credentials not configured, using placeholder')
      return getPlaceholderClient()
    }

    _serverClient = createClient(config.url, config.serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    console.log('[Supabase] Server client ready')
    return _serverClient
  } catch (err) {
    console.error('[Supabase] Server init failed:', err)
    return getPlaceholderClient()
  }
}

/** Server client — call as function: supabaseServer() */
export { getSupabaseServer as supabaseServer }

// ── Reset (for testing / env change) ──

export function resetSupabaseClients() {
  _browserClient = null
  _serverClient = null
  _browserInitAttempted = false
  _serverInitAttempted = false
}
