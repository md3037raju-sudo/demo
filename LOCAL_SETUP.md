# CoreX — Local Setup Guide

## Quick Start

```bash
# 1. Extract the zip
unzip corex-website.zip -d corex

# 2. Go to project folder
cd corex

# 3. Install dependencies
npm install
# or: bun install

# 4. Create .env.local file (see below)

# 5. Run the dev server
npm run dev
# or: bun run dev

# 6. Open http://localhost:3000 in your browser
```

## .env.local Configuration

Create a `.env.local` file in the project root:

```env
# Supabase Project URL
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co

# Supabase Anon Key (JWT format — from Settings > API)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Supabase Service Role Key (JWT format — from Settings > API)
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Supabase Management API Access Token (for DB Init — from Account > Access Tokens)
SUPABASE_ACCESS_TOKEN=sbp_...
```

### Where to get Supabase keys:
1. Go to **supabase.com** → Your Project → **Settings** → **API**
2. Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
3. Copy **anon/public** key (eyJ... format) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy **service_role** key (eyJ... format) → `SUPABASE_SERVICE_ROLE_KEY`
5. Go to **Account Settings** → **Access Tokens** → Create token → `SUPABASE_ACCESS_TOKEN`

> ⚠️ **Important**: Use JWT keys (starting with `eyJ...`), NOT the `sb_publishable_*`/`sb_secret_*` keys. The new format keys don't work with the Supabase JS client.

## Without Supabase

The app works **100% without Supabase** using local Zustand state (mock data). Just skip the `.env.local` file and run directly. Supabase is optional persistence — the app uses in-memory stores as default.

## Login Info

- **Google Login** → Admin account (admin@corex.io)
- **Telegram Login** → Regular user account

## After First Run with Supabase

1. Login as Admin → Go to **DB Init** page
2. Click **"Initialize Database"** → Creates all 19 tables
3. Click **"Seed Mock Data"** → Populates tables with sample data
4. Done! Your website is now connected with Supabase.

## Tech Stack

- **Framework**: Next.js 16 (App Router + Turbopack)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **State**: Zustand (client stores)
- **Database**: Supabase (optional)
- **Auth**: Custom OAuth (Google + Telegram mock)
