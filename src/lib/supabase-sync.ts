/**
 * CoreX — Supabase Sync Layer (Crash-Proof)
 *
 * Provides utilities for Zustand stores to:
 * 1. Fetch initial data from Supabase
 * 2. Subscribe to real-time changes (with graceful fallback)
 * 3. Push local changes to Supabase via API routes
 *
 * All operations are wrapped in try/catch to prevent crashes.
 * If Supabase is not configured, all operations fail gracefully.
 */

import { getSupabaseBrowser } from './supabase-client'

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

// ── Fetch all rows from a table ──

export async function fetchTable<T>(
  table: string,
  fromDb?: (row: Record<string, unknown>) => T,
  orderBy: string = 'created_at',
  ascending: boolean = false
): Promise<T[]> {
  try {
    const client = getSupabaseBrowser()
    const { data, error } = await client
      .from(table)
      .select('*')
      .order(orderBy, { ascending })

    if (error) {
      console.warn(`[SYNC] Failed to fetch ${table}:`, error.message)
      return []
    }

    if (!data) return []

    return data.map((row) => fromDb ? fromDb(row) : snakeToCamelObj<T>(row))
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
    const client = getSupabaseBrowser()
    const { data, error } = await client
      .from(table)
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null

    return fromDb ? fromDb(data) : snakeToCamelObj<T>(data)
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
    const client = getSupabaseBrowser()
    const { data, error } = await client
      .from(table)
      .select('*')
      .limit(1)
      .single()

    if (error || !data) return null

    return fromDb ? fromDb(data) : snakeToCamelObj<T>(data)
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

// ── Subscribe to real-time changes (CRASH-PROOF) ──
//
// This is the most dangerous part — WebSocket/realtime connections can crash
// the entire Next.js process. We wrap EVERYTHING in try/catch and use
// setTimeout to prevent synchronous errors from bubbling up.

let _activeChannels: unknown[] = []

export function subscribeToTable<T>(
  table: string,
  callbacks: {
    onInsert?: (item: T) => void
    onUpdate?: (item: T) => void
    onDelete?: (id: string) => void
  },
  fromDb?: (row: Record<string, unknown>) => T
  // Return type is Supabase RealtimeChannel or null
): ReturnType<typeof getSupabaseBrowser>['channel'] | null {
  try {
    const client = getSupabaseBrowser()

    const channel = client
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          try {
            const { eventType, new: newRow, old } = payload

            if (eventType === 'INSERT' && callbacks.onInsert && newRow) {
              const item = fromDb ? fromDb(newRow as Record<string, unknown>) : snakeToCamelObj<T>(newRow as Record<string, unknown>)
              callbacks.onInsert(item)
            }

            if (eventType === 'UPDATE' && callbacks.onUpdate && newRow) {
              const item = fromDb ? fromDb(newRow as Record<string, unknown>) : snakeToCamelObj<T>(newRow as Record<string, unknown>)
              callbacks.onUpdate(item)
            }

            if (eventType === 'DELETE' && callbacks.onDelete && old) {
              callbacks.onDelete((old as Record<string, unknown>).id as string)
            }
          } catch (err) {
            console.warn(`[SYNC] Error in ${table} realtime callback:`, err)
          }
        }
      )
      .subscribe((status: string) => {
        // Log but never crash on subscription status changes
        console.log(`[SYNC] ${table} channel status:`, status)
      })

    _activeChannels.push(channel)
    return channel
  } catch (err) {
    console.warn(`[SYNC] Failed to subscribe to ${table}:`, err)
    return null
  }
}

// ── Unsubscribe ──

export async function unsubscribeChannel(channel: any) {
  try {
    if (!channel) return
    const client = getSupabaseBrowser()
    await client.removeChannel(channel)
    _activeChannels = _activeChannels.filter((c) => c !== channel)
  } catch (err) {
    console.warn('[SYNC] Failed to unsubscribe channel:', err)
  }
}

// ── Unsubscribe all channels (for cleanup) ──

export async function unsubscribeAllChannels() {
  try {
    const client = getSupabaseBrowser()
    for (const channel of _activeChannels) {
      try {
        await client.removeChannel(channel)
      } catch {
        // ignore
      }
    }
    _activeChannels = []
  } catch (err) {
    console.warn('[SYNC] Failed to unsubscribe all channels:', err)
  }
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
