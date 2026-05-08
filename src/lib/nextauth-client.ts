/**
 * CoreX — Client-side Google OAuth Helper
 *
 * Tries to initiate Google OAuth via NextAuth.
 * If NextAuth is not configured (no GOOGLE_CLIENT_ID), falls back gracefully.
 */

/**
 * Attempt to sign in with Google via NextAuth.
 * Returns 'oauth_redirect' if the redirect was initiated,
 * or 'fallback' if NextAuth is not available/configured.
 */
export async function signInWithGoogle(): Promise<'oauth_redirect' | 'fallback'> {
  try {
    // Check if NextAuth Google provider is configured
    if (!process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED) {
      return 'fallback'
    }

    // Dynamic import to avoid bundling NextAuth if not needed
    const { signIn } = await import('next-auth/react')

    const result = await signIn('google', {
      callbackUrl: '/',
      redirect: false,
    })

    if (result?.error) {
      console.warn('[AUTH] Google OAuth error:', result.error)
      return 'fallback'
    }

    if (result?.url) {
      // NextAuth initiated the OAuth redirect
      window.location.href = result.url
      return 'oauth_redirect'
    }

    // If signIn with redirect: false returns ok without URL,
    // it means the user is already authenticated
    if (result?.ok) {
      return 'fallback'
    }

    return 'fallback'
  } catch (err) {
    console.warn('[AUTH] Google OAuth not available, using fallback:', err)
    return 'fallback'
  }
}

/**
 * Get the current NextAuth session (if available)
 */
export async function getNextAuthSession() {
  try {
    const { getSession } = await import('next-auth/react')
    return await getSession()
  } catch {
    return null
  }
}

/**
 * Sign out of NextAuth (if authenticated via OAuth)
 */
export async function signOutNextAuth() {
  try {
    const { signOut } = await import('next-auth/react')
    await signOut({ redirect: false })
  } catch {
    // Ignore — not authenticated via NextAuth
  }
}
