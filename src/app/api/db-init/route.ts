import { NextRequest, NextResponse } from 'next/server'
import { COREX_SCHEMA_SQL, COREX_DROP_SQL, COREX_TABLES } from '@/lib/supabase-schema'
import { getSupabaseServer as supabaseServer } from '@/lib/supabase-client'

/**
 * POST /api/db-init
 * Body: { action: 'init' | 'reset' | 'seed' | 'status', databaseUrl?: string }
 *
 * - status: Checks which tables exist in Supabase
 * - init: Creates all tables using PostgreSQL direct connection
 * - reset: Drops all tables
 * - seed: Inserts mock data via Supabase REST API
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, databaseUrl } = body

    if (action === 'status') {
      return handleStatus()
    }

    if (action === 'init') {
      const dbUrl = databaseUrl || process.env.DATABASE_URL
      if (!dbUrl) {
        return NextResponse.json({
          success: false,
          message: 'Database connection URL is required. Enter your Supabase DB password to auto-construct it.',
          needsDbUrl: true,
        })
      }
      return handleInitWithPg(dbUrl)
    }

    if (action === 'reset') {
      const dbUrl = databaseUrl || process.env.DATABASE_URL
      if (!dbUrl) {
        return NextResponse.json({
          success: false,
          message: 'Database connection URL required for reset.',
          needsDbUrl: true,
        })
      }
      return handleReset(dbUrl)
    }

    if (action === 'seed') {
      return handleSeed()
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('[DB-INIT] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}

/**
 * Check which tables exist in Supabase
 */
async function handleStatus() {
  const tableStatus: Record<string, boolean> = {}

  for (const table of COREX_TABLES) {
    try {
      const { error } = await supabaseServer()
        .from(table)
        .select('id')
        .limit(1)

      tableStatus[table] = !error
    } catch {
      tableStatus[table] = false
    }
  }

  const existingCount = Object.values(tableStatus).filter(Boolean).length
  const allExist = existingCount === COREX_TABLES.length

  return NextResponse.json({
    connected: true,
    tables: tableStatus,
    existingCount,
    totalCount: COREX_TABLES.length,
    allExist,
    needsInit: !allExist,
  })
}

/**
 * Initialize tables using PostgreSQL direct connection
 */
async function handleInitWithPg(databaseUrl: string) {
  try {
    const { Client } = await import('pg')
    const client = new Client({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes('supabase') ? { rejectUnauthorized: false } : undefined,
    })

    await client.connect()

    // Execute the schema SQL in a transaction
    await client.query('BEGIN')
    try {
      await client.query(COREX_SCHEMA_SQL)
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    }

    await client.end()

    return NextResponse.json({
      success: true,
      message: `All ${COREX_TABLES.length} tables created successfully!`,
      tablesCreated: COREX_TABLES.length,
    })
  } catch (error) {
    console.error('[DB-INIT] PostgreSQL error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create tables',
        details: String(error),
      },
      { status: 500 }
    )
  }
}

/**
 * Reset (drop) all tables
 */
async function handleReset(databaseUrl: string) {
  try {
    const { Client } = await import('pg')
    const client = new Client({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes('supabase') ? { rejectUnauthorized: false } : undefined,
    })
    await client.connect()
    await client.query(COREX_DROP_SQL)
    await client.end()

    return NextResponse.json({
      success: true,
      message: 'All tables dropped successfully!',
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to drop tables',
        details: String(error),
      },
      { status: 500 }
    )
  }
}

/**
 * Seed mock data into tables via Supabase REST API
 */
async function handleSeed() {
  const { mockUsers, mockPlans, mockSubscriptions, mockProxies, mockProxyPresets, mockCoupons } = await import('@/lib/mock-data')

  const results: string[] = []

  // Seed users
  for (const u of mockUsers) {
    const { error } = await supabaseServer().from('users').upsert({
      id: u.id,
      name: u.name,
      email: u.email,
      provider: u.provider,
      balance: u.balance,
      referral_code: `COREX-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      total_referrals: 0,
      role: u.role,
      status: u.status,
      joined_at: u.joinedAt,
      subscriptions: u.subscriptions,
      devices: u.devices,
      last_active: u.lastActive,
    })
    if (error) results.push(`users: ${error.message}`)
  }

  // Seed plans
  for (const p of mockPlans) {
    const { error } = await supabaseServer().from('plans').upsert({
      id: p.id,
      name: p.name,
      description: p.description,
      speed: p.speed,
      bandwidth_type: p.bandwidthType,
      bandwidth_limit: p.bandwidthLimit,
      duration: p.duration,
      base_price: p.basePrice,
      device_pricing: p.devicePricing,
      max_devices: p.maxDevices,
      is_active: p.isActive,
      is_featured: p.isFeatured,
      subscribers: p.subscribers,
      proxy_preset_id: p.proxyPresetId,
      features: p.features,
      created_at: p.createdAt,
    })
    if (error) results.push(`plans: ${error.message}`)
  }

  // Seed subscriptions
  for (const s of mockSubscriptions) {
    const { error } = await supabaseServer().from('subscriptions').upsert({
      id: s.id,
      user_id: s.userId,
      user_name: s.userName,
      name: s.name,
      plan: s.plan,
      status: s.status,
      start_date: s.startDate,
      expiry_date: s.expiryDate,
      price: s.price,
      bandwidth_used: s.bandwidthUsed,
      bandwidth_limit: s.bandwidthLimit,
      deep_link: s.deepLink,
      devices: (s as Record<string, unknown>).devices ?? 1,
    })
    if (error) results.push(`subscriptions: ${error.message}`)
  }

  // Seed proxies
  for (const p of mockProxies) {
    const { error } = await supabaseServer().from('proxies').upsert({
      id: p.id,
      protocol: p.protocol,
      address: p.address,
      port: p.port,
      uuid: p.uuid,
      password: p.password,
      username: p.username,
      flow: p.flow,
      network: p.network,
      tls: p.tls,
      sni: p.sni,
      alpn: p.alpn,
      cipher: p.cipher,
      alter_id: p.alterId,
      skip_cert_verify: p.skipCertVerify,
      reality_public_key: p.realityPublicKey,
      reality_short_id: p.realityShortId,
      client_fingerprint: p.clientFingerprint,
      grpc_service: p.grpcService,
      ws_path: p.wsPath,
      ws_host: p.wsHost,
      udp: p.udp,
      plugin: p.plugin,
      plugin_opts_mode: p.pluginOptsMode,
      plugin_opts_host: p.pluginOptsHost,
      ssr_protocol: p.ssrProtocol,
      obfs: p.obfs,
      obfs_param: p.obfsParam,
      private_key: p.privateKey,
      public_key: p.publicKey,
      preshared_key: p.presharedKey,
      dns: p.dns,
      mtu: p.mtu,
      status: p.status,
      latency: p.latency,
    })
    if (error) results.push(`proxies: ${error.message}`)
  }

  // Seed proxy presets
  for (const p of mockProxyPresets) {
    const { error } = await supabaseServer().from('proxy_presets').upsert({
      id: p.id,
      name: p.name,
      description: p.description,
      is_active: p.isActive,
      assigned_users: p.assignedUsers,
    })
    if (error) results.push(`proxy_presets: ${error.message}`)

    // Seed subgroups
    for (const sg of p.subgroups) {
      const { error: sgError } = await supabaseServer().from('proxy_preset_subgroups').upsert({
        id: sg.id,
        preset_id: p.id,
        name: sg.name,
        proxy_count: sg.proxyCount,
        status: sg.status,
        image: sg.image,
        image_width: sg.imageWidth,
        image_height: sg.imageHeight,
        proxy_ids: sg.proxyIds,
      })
      if (sgError) results.push(`proxy_preset_subgroups: ${sgError.message}`)
    }
  }

  // Seed coupons
  for (const c of mockCoupons) {
    const { error } = await supabaseServer().from('coupons').upsert({
      id: c.id,
      code: c.code,
      description: c.description,
      type: c.type,
      value: c.value,
      min_purchase: c.minPurchase,
      max_discount: c.maxDiscount,
      max_claims: c.maxClaims,
      current_claims: c.currentClaims,
      applicable_plans: c.applicablePlans,
      expires_at: c.expiresAt,
      created_at: c.createdAt,
      is_active: c.isActive,
      claimed_by: c.claimedBy,
    })
    if (error) results.push(`coupons: ${error.message}`)
  }

  const successCount = results.length === 0
    ? 'All data seeded successfully'
    : `${results.length} error(s) occurred`

  return NextResponse.json({
    success: results.length === 0,
    message: successCount,
    errors: results.length > 0 ? results : undefined,
  })
}
