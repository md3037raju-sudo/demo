'use client'

import Image from 'next/image'
import { useThemeStore } from '@/lib/theme-store'

interface CoreXLogoProps {
  /** Height of the logo image in pixels. Width auto-scales. Default: 32 */
  height?: number
  /** Additional CSS classes */
  className?: string
  /** Show "Admin" badge text after logo */
  showAdminBadge?: boolean
  /** Show "CoreX" text after logo */
  showText?: boolean
  /** Enable thunder glow animation on the logo */
  animate?: boolean
}

export function CoreXLogo({
  height = 32,
  className = '',
  showAdminBadge = false,
  showText = true,
  animate = false,
}: CoreXLogoProps) {
  const mode = useThemeStore((s) => s.mode)

  const logoSrc = mode === 'dark'
    ? '/corex-logo-dark.png'
    : '/corex-logo-light.png'

  // Logos are square (1:1 aspect ratio)
  const width = height

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`relative ${animate ? 'thunder-glow' : ''}`}>
        <Image
          src={logoSrc}
          alt="CoreX Logo"
          width={width}
          height={height}
          className="object-contain"
          priority
        />
        {animate && (
          <div className="absolute inset-0 rounded-full thunder-flash pointer-events-none" />
        )}
      </div>
      {showText && (
        <span className="font-bold tracking-tight" style={{ fontSize: `${Math.max(14, height * 0.65)}px` }}>
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

/** Compact logo icon only (no text) — for small spaces like hero section or sidebar top bar */
export function CoreXLogoIcon({ size = 32, className = '', animate = false }: { size?: number; className?: string; animate?: boolean }) {
  const mode = useThemeStore((s) => s.mode)

  const logoSrc = mode === 'dark'
    ? '/corex-logo-dark.png'
    : '/corex-logo-light.png'

  return (
    <div className={`relative ${animate ? 'thunder-glow' : ''}`}>
      <Image
        src={logoSrc}
        alt="CoreX"
        width={size}
        height={size}
        className={`object-contain ${className}`}
        priority
      />
      {animate && (
        <div className="absolute inset-0 rounded-full thunder-flash pointer-events-none" />
      )}
    </div>
  )
}
