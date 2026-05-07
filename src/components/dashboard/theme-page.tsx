'use client'

import React from 'react'
import { useThemeStore, type ThemePreset } from '@/lib/theme-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Sun,
  Moon,
  Palette,
  Sparkles,
  Check,
} from 'lucide-react'

const themePresets: {
  id: ThemePreset
  name: string
  description: string
  gradient: string
  previewColors: string[]
}[] = [
  {
    id: 'emerald',
    name: 'Emerald',
    description: 'Nature-inspired, calm and professional',
    gradient: 'from-emerald-500 to-teal-500',
    previewColors: ['#10b981', '#14b8a6', '#0d9488'],
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Deep blue, trust and reliability',
    gradient: 'from-cyan-500 to-teal-600',
    previewColors: ['#06b6d4', '#0891b2', '#0d9488'],
  },
  {
    id: 'rose',
    name: 'Rose',
    description: 'Warm accent, modern and bold',
    gradient: 'from-rose-400 to-pink-500',
    previewColors: ['#fb7185', '#f43f5e', '#ec4899'],
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Dark and mysterious, premium feel',
    gradient: 'from-violet-500 to-purple-600',
    previewColors: ['#8b5cf6', '#7c3aed', '#9333ea'],
  },
]

export function ThemePage() {
  const { mode, preset, animationsEnabled, setMode, toggleMode, setPreset, setAnimationsEnabled } = useThemeStore()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Themes</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Customize your CoreX experience with different themes and visual preferences
        </p>
      </div>

      {/* Mode Toggle Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="size-5" />
            Appearance
          </CardTitle>
          <CardDescription>
            Switch between light and dark mode
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              variant={mode === 'light' ? 'default' : 'outline'}
              className="gap-2 flex-1 h-16"
              onClick={() => setMode('light')}
            >
              <Sun className="size-5" />
              <div className="text-left">
                <div className="font-medium text-sm">Light</div>
                <div className="text-xs opacity-70">Bright and clean</div>
              </div>
            </Button>
            <Button
              variant={mode === 'dark' ? 'default' : 'outline'}
              className="gap-2 flex-1 h-16"
              onClick={() => setMode('dark')}
            >
              <Moon className="size-5" />
              <div className="text-left">
                <div className="font-medium text-sm">Dark</div>
                <div className="text-xs opacity-70">Easy on the eyes</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Theme Presets Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-5" />
            Theme Presets
          </CardTitle>
          <CardDescription>
            Choose a color scheme that matches your style
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {themePresets.map((tp) => {
              const isActive = preset === tp.id
              return (
                <button
                  key={tp.id}
                  onClick={() => setPreset(tp.id)}
                  className={`relative rounded-xl border-2 p-4 text-left transition-all hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                    isActive
                      ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute top-2 right-2">
                      <div className="flex size-5 items-center justify-center rounded-full bg-primary">
                        <Check className="size-3 text-primary-foreground" />
                      </div>
                    </div>
                  )}

                  {/* Color preview gradient */}
                  <div
                    className={`mb-3 h-20 rounded-lg bg-gradient-to-br ${tp.gradient} shadow-inner`}
                  />

                  {/* Theme info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{tp.name}</span>
                      {isActive && (
                        <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] px-1.5 py-0">
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{tp.description}</p>
                  </div>

                  {/* Color dots */}
                  <div className="flex gap-1.5 mt-3">
                    {tp.previewColors.map((color, i) => (
                      <div
                        key={i}
                        className="size-4 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Animation Toggle Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-5" />
            Animations
          </CardTitle>
          <CardDescription>
            Control motion and transition effects across the interface
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="font-medium">Enable Animations</Label>
              <p className="text-sm text-muted-foreground max-w-md">
                Enable smooth transitions and micro-animations for a premium experience.
                When disabled, all state changes will be instant.
              </p>
            </div>
            <Switch
              checked={animationsEnabled}
              onCheckedChange={setAnimationsEnabled}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-3">
            <div className={`rounded-lg border p-3 ${animationsEnabled ? 'border-primary/30 bg-primary/5' : 'border-border opacity-60'}`}>
              <p className="text-xs font-medium mb-1">Animations On</p>
              <p className="text-xs text-muted-foreground">
                Smooth hover effects, fade-ins, slide-ups, and scale transitions
              </p>
            </div>
            <div className={`rounded-lg border p-3 ${!animationsEnabled ? 'border-primary/30 bg-primary/5' : 'border-border opacity-60'}`}>
              <p className="text-xs font-medium mb-1">Animations Off</p>
              <p className="text-xs text-muted-foreground">
                Instant state changes, no transitions, reduced motion
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="size-5" />
            Live Preview
          </CardTitle>
          <CardDescription>
            See how your theme looks with actual UI components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border bg-card p-6 space-y-4">
            {/* Buttons preview */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Buttons</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm">Primary</Button>
                <Button size="sm" variant="secondary">Secondary</Button>
                <Button size="sm" variant="outline">Outline</Button>
                <Button size="sm" variant="destructive">Destructive</Button>
                <Button size="sm" variant="ghost">Ghost</Button>
              </div>
            </div>

            {/* Badges preview */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Badges</p>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Success</Badge>
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Warning</Badge>
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Error</Badge>
              </div>
            </div>

            {/* Text preview */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Typography</p>
              <div className="space-y-1">
                <p className="text-lg font-bold">Heading Text</p>
                <p className="text-sm text-muted-foreground">Body text with muted foreground color for secondary information</p>
                <p className="text-xs text-primary">Primary colored accent text</p>
              </div>
            </div>

            {/* Cards preview */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cards</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border bg-muted/50 p-3">
                  <p className="text-sm font-medium">Muted Card</p>
                  <p className="text-xs text-muted-foreground">With subtle background</p>
                </div>
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                  <p className="text-sm font-medium text-primary">Primary Card</p>
                  <p className="text-xs text-muted-foreground">With primary accent</p>
                </div>
              </div>
            </div>

            {/* Current theme info */}
            <div className="flex items-center gap-2 pt-2 border-t">
              <div className="size-3 rounded-full bg-primary" />
              <p className="text-xs text-muted-foreground">
                Current: <span className="font-medium text-foreground">{themePresets.find((t) => t.id === preset)?.name}</span> theme
                {' · '}
                <span className="font-medium text-foreground">{mode === 'dark' ? 'Dark' : 'Light'}</span> mode
                {' · '}
                Animations <span className="font-medium text-foreground">{animationsEnabled ? 'On' : 'Off'}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
