'use client'

import React from 'react'
import { useThemeStore } from '@/lib/theme-store'

type AnimationType = 'fade-in' | 'slide-up' | 'scale-in' | 'slide-right'

interface AnimateInProps {
  children: React.ReactNode
  type?: AnimationType
  delay?: number
  stagger?: boolean
  className?: string
}

/**
 * Wraps children with entrance animation when animations are enabled.
 * When animations are OFF, children render instantly with no animation.
 *
 * CSS keyframe animations trigger automatically on mount, so no
 * useState/useEffect trickery is needed — just apply the class.
 *
 * Usage:
 * <AnimateIn type="slide-up">
 *   <MyComponent />
 * </AnimateIn>
 *
 * <AnimateIn type="fade-in" stagger>
 *   {items.map(item => <Card key={item.id}>...</Card>)}
 * </AnimateIn>
 */
export function AnimateIn({ children, type = 'slide-up', delay, stagger, className = '' }: AnimateInProps) {
  const animationsEnabled = useThemeStore((s) => s.animationsEnabled)

  const animClass = animationsEnabled ? `anim-${type}` : ''
  const staggerClass = stagger && animationsEnabled ? 'anim-stagger' : ''
  const delayStyle = delay && animationsEnabled ? { animationDelay: `${delay}ms` } : undefined

  return (
    <div className={`${animClass} ${staggerClass} ${className}`.trim()} style={delayStyle}>
      {children}
    </div>
  )
}
