/**
 * CoreX — Supabase Sync Layer (API-Only, No Client-Side Supabase Import)
 *
 * IMPORTANT: This module MUST NOT import @supabase/supabase-js.
 * All database operations go through Next.js API routes via fetch().
 * This prevents Turbopack crashes from bundling the Supabase JS client.
 *
 * Real-time subscriptions are NOT supported client-side.
 * If you need real-time, use a WebSocket mini-service instead.
 */

// ── Types ──

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE'

export interface SyncConfig<T> {
  table: string
  setAll: (items: T[]) => void
  addOne?: (item: T) => void
  updateOne?: (id: string, data: Partial<T>) => void
  removeOne?: (id: string) => void
  primaryKey?: string
  fromDb?: (row: Record<string, unknown>) => T
  toDb?: (item: T) => Record<string, unknown>
}

// ── CamelCase / Snake_case converters ──

export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

export function snakeToCamelObj<T>(obj: Record<string, unknown>): T {
  if (!obj || typeof obj !== 'object') return obj as T
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    result[snakeToCamel(key)] = value
  }
  return result as T
}

export function camelToSnakeObj(obj: Record<string, unknown>): Record<string, unknown> {
  if (!obj || typeof obj !== 'object') return obj
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    result[camelToSnake(key)] = value
  }
  return result
}

// ── Fetch all rows from a table (via API route) ──

export async function fetchTable<T>(
  table: string,
  fromDb?: (row: Record<string, unknown>) => T,
  orderBy: string = 'created_at',
  ascending: boolean = false
): Promise<T[]> {
  try {
    const params = new URLSearchParams({
      table,
      order: orderBy,
      ascending: String(ascending),
    })

    const res = await fetch(`/api/supabase?${params}`)

    if (!res.ok) {
      console.warn(`[SYNC] Failed to fetch ${table}: HTTP ${res.status}`)
      return []
    }

    const result = await res.json()

    if (!result.data || !Array.isArray(result.data)) return []

    return result.data.map((row: Record<string, unknown>) =>
      fromDb ? fromDb(row) : snakeToCamelObj<T>(row)
    )
  } catch (err) {
    console.warn(`[SYNC] Exception fetching ${table}:`, err)
    return []
  }
}

// ── Fetch single row ──

export async function fetchOne<T>(
  table: string,
  id: string,
  fromDb?: (row: Record<string, unknown>) => T
): Promise<T | null> {
  try {
    const params = new URLSearchParams({
      table,
      id,
      limit: '1',
    })

    const res = await fetch(`/api/supabase?${params}`)

    if (!res.ok) return null

    const result = await res.json()

    if (!result.data || !Array.isArray(result.data) || result.data.length === 0) return null

    const row = result.data[0]
    return fromDb ? fromDb(row) : snakeToCamelObj<T>(row)
  } catch {
    return null
  }
}

// ── Fetch single-row config tables ──

export async function fetchConfig<T>(
  table: string,
  fromDb?: (row: Record<string, unknown>) => T
): Promise<T | null> {
  try {
    const params = new URLSearchParams({
      table,
      limit: '1',
    })

    const res = await fetch(`/api/supabase?${params}`)

    if (!res.ok) return null

    const result = await res.json()

    if (!result.data || !Array.isArray(result.data) || result.data.length === 0) return null

    const row = result.data[0]
    return fromDb ? fromDb(row) : snakeToCamelObj<T>(row)
  } catch {
    return null
  }
}

// ── Insert row via API route ──

export async function insertRow<T>(
  table: string,
  item: T,
  toDb?: (item: T) => Record<string, unknown>
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const snakeData = toDb ? toDb(item) : camelToSnakeObj(item as Record<string, unknown>)

    const res = await fetch('/api/supabase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table, data: snakeData }),
    })

    const result = await res.json()

    if (!res.ok) {
      return { success: false, error: result.error || 'Insert failed' }
    }

    return { success: true, data: result.data?.[0] || result.data }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

// ── Update row via API route ──

export async function updateRow<T>(
  table: string,
  id: string,
  data: Partial<T>,
  toDb?: (item: Partial<T>) => Record<string, unknown>
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const snakeData = toDb ? toDb(data) : camelToSnakeObj(data as Record<string, unknown>)

    const res = await fetch('/api/supabase', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table, id, data: snakeData }),
    })

    const result = await res.json()

    if (!res.ok) {
      return { success: false, error: result.error || 'Update failed' }
    }

    return { success: true, data: result.data?.[0] || result.data }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

// ── Delete row(s) via API route ──

export async function deleteRows(
  table: string,
  ids: string | string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/supabase', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table, id: ids }),
    })

    const result = await res.json()

    if (!res.ok) {
      return { success: false, error: result.error || 'Delete failed' }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

// ── Real-time subscription stubs (NO-OP on client side) ──
// Real-time requires WebSocket connection which would need @supabase/supabase-js.
// To keep the app crash-proof, we stub these out.
// If you need real-time, implement it via a WebSocket mini-service.

export function subscribeToTable<T>(
  _table: string,
  _callbacks: {
    onInsert?: (item: T) => void
    onUpdate?: (item: T) => void
    onDelete?: (id: string) => void
  },
  _fromDb?: (row: Record<string, unknown>) => T
): null {
  // No-op: real-time not supported on client side
  return null
}

export async function unsubscribeChannel(_channel: unknown): Promise<void> {
  // No-op
}

export async function unsubscribeAllChannels(): Promise<void> {
  // No-op
}

// ── Check Supabase connection ──

export async function checkSupabaseConnection(): Promise<{
  connected: boolean
  tablesExist: boolean
  tableStatus?: Record<string, boolean>
}> {
  try {
    const res = await fetch('/api/db-init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'status' }),
    })

    const data = await res.json()

    return {
      connected: data.connected ?? false,
      tablesExist: data.allExist ?? false,
      tableStatus: data.tables,
    }
  } catch {
    return { connected: false, tablesExist: false }
  }
}
