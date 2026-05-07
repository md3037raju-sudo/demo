/**
 * CoreX — Supabase Sync Layer
 *
 * This module provides utilities for Zustand stores to:
 * 1. Fetch initial data from Supabase
 * 2. Subscribe to real-time changes
 * 3. Push local changes to Supabase
 *
 * Architecture:
 * - Zustand stores are the "local cache" (client-side state)
 * - Supabase is the "source of truth" (persistent database)
 * - On mount: fetch from Supabase → update store
 * - On change: update store → push to Supabase
 * - Real-time: Supabase changes → update store → UI re-renders
 */

import { supabaseBrowser } from './supabase-client'

// ── Types ──

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE'

export interface SyncConfig<T> {
  /** Supabase table name */
  table: string
  /** Zustand store setter for the full list */
  setAll: (items: T[]) => void
  /** Zustand store setter for adding one item */
  addOne?: (item: T) => void
  /** Zustand store setter for updating one item */
  updateOne?: (id: string, data: Partial<T>) => void
  /** Zustand store setter for removing one item */
  removeOne?: (id: string) => void
  /** Primary key field name (default: 'id') */
  primaryKey?: string
  /** Transform Supabase row → store item (snake_case → camelCase) */
  fromDb?: (row: Record<string, unknown>) => T
  /** Transform store item → Supabase row (camelCase → snake_case) */
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
    const { data, error } = await supabaseBrowser
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
    const { data, error } = await supabaseBrowser
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
    const { data, error } = await supabaseBrowser
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

// ── Subscribe to real-time changes ──

export function subscribeToTable<T>(
  table: string,
  callbacks: {
    onInsert?: (item: T) => void
    onUpdate?: (item: T) => void
    onDelete?: (id: string) => void
  },
  fromDb?: (row: Record<string, unknown>) => T
) {
  const channel = supabaseBrowser
    .channel(`${table}-changes`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      (payload) => {
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
      }
    )
    .subscribe()

  return channel
}

// ── Unsubscribe ──

export async function unsubscribeChannel(channel: ReturnType<typeof supabaseBrowser.channel>) {
  await supabaseBrowser.removeChannel(channel)
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

// ── Initialize Supabase DB ──

export async function initializeSupabaseDB(dbPassword: string): Promise<{
  success: boolean
  message: string
  needsPgConnection?: boolean
  sql?: string
}> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '')

    // Construct DATABASE_URL from project ref + password
    const databaseUrl = `postgresql://postgres.${projectRef}:${dbPassword}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`

    const res = await fetch('/api/db-init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'init', databaseUrl }),
    })

    const data = await res.json()

    if (data.needsPgConnection) {
      // Retry with the constructed DATABASE_URL
      const initRes = await fetch('/api/db-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'init', databaseUrl }),
      })

      // This won't work server-side since we need to set DATABASE_URL env var
      // Let's use a different approach - direct PostgreSQL connection
      return {
        success: false,
        message: 'Trying direct connection...',
        needsPgConnection: true,
      }
    }

    return {
      success: data.success ?? false,
      message: data.message ?? 'Unknown result',
    }
  } catch (err) {
    return {
      success: false,
      message: `Connection failed: ${String(err)}`,
    }
  }
}
