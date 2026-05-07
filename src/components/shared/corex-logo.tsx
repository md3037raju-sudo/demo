'use client'

import { useTheme } from 'next-themes'
import Image from 'next/image'

interface CoreXLogoProps {
  /** Height of the logo image in pixels. Width auto-scales. Default: 32 */
  height?: number
  /** Additional CSS classes */
  className?: string
  /** Show "Admin" badge text after logo */
  showAdminBadge?: boolean
  /** Show "CoreX" text after logo */
  showText?: boolean
}

export function CoreXLogo({
  height = 32,
  className = '',
  showAdminBadge = false,
  showText = true,
}: CoreXLogoProps) {
  const { resolvedTheme } = useTheme()

  const logoSrc = resolvedTheme === 'dark'
    ? '/corex-logo-dark.png'
    : '/corex-logo-light.png'

  // Calculate width to maintain aspect ratio (assuming ~4:1 aspect for horizontal logos)
  const width = height * 4

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src={logoSrc}
        alt="CoreX Logo"
        width={width}
        height={height}
        className="object-contain"
        priority
      />
      {showText && (
        <span className="text-lg font-bold tracking-tight">
          Core<span className="text-primary">X</span>
        </span>
      )}
      {showAdminBadge && (
        <span className="ml-1 rounded-md bg-red-500/20 border border-red-500/30 px-2 py-0.5 text-[10px] font-medium text-red-400">
          Admin
        </span>
      )}
    </div>
  )
}

/** Compact logo icon only (no text) — for small spaces like sidebar top bar */
export function CoreXLogoIcon({ size = 32, className = '' }: { size?: number; className?: string }) {
  const { resolvedTheme } = useTheme()

  const logoSrc = resolvedTheme === 'dark'
    ? '/corex-logo-dark.png'
    : '/corex-logo-light.png'

  return (
    <Image
      src={logoSrc}
      alt="CoreX"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      priority
    />
  )
}
