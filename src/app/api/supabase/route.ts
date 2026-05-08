import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer as supabaseServer } from '@/lib/supabase-client'

/**
 * GET /api/supabase?table=<table>&id=<id>&userId=<userId>&status=<status>
 * Fetch data from Supabase tables
 *
 * Query params:
 * - table: required, table name
 * - id: optional, fetch single row by id
 * - userId: optional, filter by user_id
 * - status: optional, filter by status
 * - limit: optional, limit rows
 * - order: optional, order by column (default: created_at)
 * - ascending: optional, order direction (default: false)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const table = searchParams.get('table')

    if (!table) {
      return NextResponse.json({ error: 'Table name is required' }, { status: 400 })
    }

    let query = supabaseServer().from(table).select('*')

    // Apply filters
    const id = searchParams.get('id')
    if (id) {
      query = query.eq('id', id)
    }

    const userId = searchParams.get('userId')
    if (userId) {
      query = query.eq('user_id', userId)
    }

    const email = searchParams.get('email')
    if (email) {
      query = query.eq('email', email)
    }

    const status = searchParams.get('status')
    if (status) {
      query = query.eq('status', status)
    }

    const limit = searchParams.get('limit')
    if (limit) {
      query = query.limit(parseInt(limit))
    }

    const order = searchParams.get('order') || 'created_at'
    const ascending = searchParams.get('ascending') === 'true'
    query = query.order(order, { ascending })

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Convert snake_case to camelCase for frontend compatibility
    const camelData = data ? data.map(snakeToCamel) : []

    return NextResponse.json({ data: camelData })
  } catch (error) {
    console.error('[SUPABASE GET] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/supabase
 * Insert data into a Supabase table
 * Body: { table: string, data: object | object[] }
 */
export async function POST(req: NextRequest) {
  try {
    const { table, data } = await req.json()

    if (!table || !data) {
      return NextResponse.json({ error: 'Table and data are required' }, { status: 400 })
    }

    // Convert camelCase to snake_case for database
    const snakeData = Array.isArray(data)
      ? data.map(camelToSnake)
      : camelToSnake(data)

    const { data: result, error } = await supabaseServer()
      .from(table)
      .insert(snakeData)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      data: Array.isArray(result) ? result.map(snakeToCamel) : snakeToCamel(result),
    })
  } catch (error) {
    console.error('[SUPABASE POST] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/supabase
 * Update data in a Supabase table
 * Body: { table: string, id: string, data: object }
 */
export async function PUT(req: NextRequest) {
  try {
    const { table, id, data } = await req.json()

    if (!table || !id || !data) {
      return NextResponse.json({ error: 'Table, id, and data are required' }, { status: 400 })
    }

    const snakeData = camelToSnake(data)

    // Add updated_at timestamp
    snakeData.updated_at = new Date().toISOString()

    const { data: result, error } = await supabaseServer()
      .from(table)
      .update(snakeData)
      .eq('id', id)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      data: Array.isArray(result) ? result.map(snakeToCamel) : snakeToCamel(result),
    })
  } catch (error) {
    console.error('[SUPABASE PUT] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/supabase
 * Delete data from a Supabase table
 * Body: { table: string, id: string | string[] }
 */
export async function DELETE(req: NextRequest) {
  try {
    const { table, id } = await req.json()

    if (!table || !id) {
      return NextResponse.json({ error: 'Table and id are required' }, { status: 400 })
    }

    if (Array.isArray(id)) {
      const { error } = await supabaseServer()
        .from(table)
        .delete()
        .in('id', id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    } else {
      const { error } = await supabaseServer()
        .from(table)
        .delete()
        .eq('id', id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[SUPABASE DELETE] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── Snake_case ↔ CamelCase converters ──

function snakeToCamel(obj: Record<string, unknown>): Record<string, unknown> {
  if (!obj || typeof obj !== 'object') return obj
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    result[camelKey] = value
  }
  return result
}

function camelToSnake(obj: Record<string, unknown>): Record<string, unknown> {
  if (!obj || typeof obj !== 'object') return obj
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
    result[snakeKey] = value
  }
  return result
}
