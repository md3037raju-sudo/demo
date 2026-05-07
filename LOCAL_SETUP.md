# 🔑 CoreX — Supabase JWT Keys গাইড

## ⚠️ গুরুত্বপূর্ণ: কোন Key ব্যবহার করবেন

Supabase-এ ২ ধরনের Key আছে:

| Key টাইপ | ফরম্যাট | কাজ করবে? |
|-----------|---------|-----------|
| **JWT Key (Legacy)** | `eyJhbGciOiJIUzI1NiIs...` | ✅ হ্যাঁ |
| **Publishable Key** | `sb_publishable_...` | ❌ না |
| **Secret Key** | `sb_secret_...` | ❌ না |

> **নতুন Supabase ড্যাশবোর্ডে "Publishable" ও "Secret" key দেখায় — এগুলো কাজ করবে না!** আপনাকে **JWT format (eyJ...)** key ব্যবহার করতে হবে।

---

## 📋 Step-by-Step Guide

### Step 1: Supabase Dashboard-এ যান

1. **https://supabase.com** ওপেন করুন
2. আপনার Account-এ Login করুন
3. আপনার **Project**-এ ক্লিক করুন

### Step 2: API Settings-এ যান

1. বামদিকের সাইডবারে **⚙️ Settings** ক্লিক করুন
2. **API** সেকশনে ক্লিক করুন

### Step 3: Keys কপি করুন

আপনি এই পেজে ৩টি জিনিস পাবেন:

#### 🔗 Project URL
```
https://your-project-ref.supabase.co
```
এটি কপি করে `NEXT_PUBLIC_SUPABASE_URL`-এ বসান

#### 🔓 anon / public Key (JWT)
সবার উপরে **"Project API keys"** সেকশনে দেখবেন:

| Name | Key |
|------|-----|
| **anon public** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3Mi...` |

> ⚠️ যদি `sb_publishable_...` দেখায়, তাহলে নিচের **"Legacy keys"** সেকশনে স্ক্রল করুন!

এটি কপি করে `NEXT_PUBLIC_SUPABASE_ANON_KEY`-এ বসান

#### 🔐 service_role Key (JWT)

| Name | Key |
|------|-----|
| **service_role secret** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3Mi...` |

> ⚠️ যদি `sb_secret_...` দেখায়, তাহলে নিচের **"Legacy keys"** সেকশনে স্ক্রল করুন!

এটি কপি করে `SUPABASE_SERVICE_ROLE_KEY`-এ বসান

### Step 4: Access Token (DB Init-এর জন্য)

1. উপরে ডানদিকে আপনার **Profile Photo** ক্লিক করুন
2. **Account Settings** ক্লিক করুন
3. বামদিকে **Access Tokens** ক্লিক করুন
4. **"Generate New Token"** ক্লিক করুন
5. Token-এর নাম দিন (যেমন: "CoreX Dev")
6. কপি করে `SUPABASE_ACCESS_TOKEN`-এ বসান

> ⚠️ Access Token শুধু একবারই দেখাবে! কপি করে রাখুন।

---

## 🤔 "Legacy keys" কোথায়?

নতুন Supabase Dashboard-এ হয়তো "Legacy keys" দেখাবে না। সেক্ষেত্রে:

### Option A: Supabase Management API দিয়ে বের করুন

আপনার Access Token দিয়ে API call করুন:

```bash
curl -s -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  "https://api.supabase.com/v1/projects/YOUR_PROJECT_REF/api-keys"
```

ফলাফলে আপনি পাবেন:
```json
[
  { "name": "anon", "api_key": "eyJhbGciOi...", "type": "legacy" },
  { "name": "service_role", "api_key": "eyJhbGciOi...", "type": "legacy" },
  { "name": "default", "api_key": "sb_publishable_...", "type": "publishable" },
  { "name": "default", "api_key": "sb_secret_...", "type": "secret" }
]
```

**`"type": "legacy"` ওয়ালা key-ই আপনার দরকার!** 🎯

### Option B: আমাকে দিন

আপনার **Access Token** (`sbp_...`) আমাকে দিলে আমি JWT key বের করে `.env.local` সেট করে দিব!

---

## ✅ Final `.env.local` ফাইল

প্রজেক্ট রুটে `.env.local` ফাইল তৈরি করুন:

```env
# Supabase Project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co

# Supabase Anon Key (eyJ... format — NOT sb_publishable_...)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3Mi...

# Supabase Service Role Key (eyJ... format — NOT sb_secret_...)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3Mi...

# Supabase Access Token (for DB Init — from Account > Access Tokens)
SUPABASE_ACCESS_TOKEN=sbp_...
```

---

## 💡 মনে রাখুন

- **`.env.local` কখনো GitHub-এ push করবেন না!** (gitignore-এ আছে)
- **Supabase ছাড়াও ওয়েবসাইট কাজ করবে** — mock data দিয়ে চলবে
- **Google Login → Admin** | **Telegram Login → User**
- Supabase কানেক্ট করার পর: Admin → DB Init → Initialize → Seed Data
