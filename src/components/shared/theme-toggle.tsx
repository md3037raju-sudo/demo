'use client'

import { useThemeStore } from '@/lib/theme-store'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { mode, toggleMode } = useThemeStore()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-9 rounded-full"
      onClick={toggleMode}
      title={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {mode === 'dark' ? (
        <Sun className="size-4 text-amber-400" />
      ) : (
        <Moon className="size-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
