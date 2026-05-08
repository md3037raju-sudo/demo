import NextAuth, { type NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { getSupabaseServer } from '@/lib/supabase-client'

export const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })]
      : []),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        try {
          // Check if user exists in Supabase
          const supabase = getSupabaseServer()
          const { data: existingUser } = await supabase
            .from('users')
            .select('id, role, status')
            .eq('email', user.email)
            .limit(1)

          if (existingUser && existingUser.length > 0) {
            // User exists — check if banned/suspended
            const dbUser = existingUser[0]
            if (dbUser.status === 'banned' || dbUser.status === 'suspended') {
              return false // Block login
            }
            // Update last_active
            await supabase
              .from('users')
              .update({ last_active: new Date().toISOString().split('T')[0] })
              .eq('id', dbUser.id)
          } else {
            // New user — create in Supabase
            const referralCode = `COREX-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
            await supabase.from('users').upsert({
              id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              name: user.name || user.email.split('@')[0],
              email: user.email,
              avatar: user.image || '',
              provider: 'google',
              balance: 0,
              referral_code: referralCode,
              total_referrals: 0,
              role: 'user',
              status: 'active',
              joined_at: new Date().toISOString().split('T')[0],
              subscriptions: 0,
              devices: 0,
              last_active: new Date().toISOString().split('T')[0],
            })
          }
        } catch (err) {
          console.warn('[NEXTAUTH] Supabase user check failed:', err)
          // Still allow login — local state will work
        }
      }
      return true
    },
    async jwt({ token, user }) {
      // Persist user info in the token on first sign in
      if (user) {
        token.id = user.id
        token.provider = 'google'
      }
      return token
    },
    async session({ session, token }) {
      // Add custom fields to the session
      if (session.user) {
        session.user.id = token.id as string
        session.user.provider = token.provider as string
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
