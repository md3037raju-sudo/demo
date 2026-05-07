import { create } from 'zustand'

export type ThemeMode = 'dark' | 'light'
export type ThemePreset = 'emerald' | 'ocean' | 'rose' | 'midnight'

interface ThemeState {
  mode: ThemeMode
  preset: ThemePreset
  animationsEnabled: boolean
  setMode: (mode: ThemeMode) => void
  toggleMode: () => void
  setPreset: (preset: ThemePreset) => void
  setAnimationsEnabled: (enabled: boolean) => void
}

function applyThemeToDOM(mode: ThemeMode, preset: ThemePreset, animationsEnabled: boolean) {
  if (typeof document === 'undefined') return

  const root = document.documentElement

  // Mode
  if (mode === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }

  // Preset
  root.setAttribute('data-theme', preset)

  // Animations
  root.classList.toggle('animate-enabled', animationsEnabled)
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'dark',
  preset: 'emerald',
  animationsEnabled: false,

  setMode: (mode) => {
    set({ mode })
    const state = get()
    applyThemeToDOM(mode, state.preset, state.animationsEnabled)
  },

  toggleMode: () => {
    const newMode = get().mode === 'dark' ? 'light' : 'dark'
    set({ mode: newMode })
    const state = get()
    applyThemeToDOM(newMode, state.preset, state.animationsEnabled)
  },

  setPreset: (preset) => {
    set({ preset })
    const state = get()
    applyThemeToDOM(state.mode, preset, state.animationsEnabled)
  },

  setAnimationsEnabled: (enabled) => {
    set({ animationsEnabled: enabled })
    const state = get()
    applyThemeToDOM(state.mode, state.preset, enabled)
  },
}))

// Apply initial theme on load
if (typeof window !== 'undefined') {
  const state = useThemeStore.getState()
  applyThemeToDOM(state.mode, state.preset, state.animationsEnabled)
}
