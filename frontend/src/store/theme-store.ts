import { create } from 'zustand'

export type ThemeName = 'rose' | 'green' | 'black'

const THEME_STORAGE_KEY = 'the-volumn-theme'
const THEME_SEQUENCE: ThemeName[] = ['rose', 'green', 'black']

function isThemeName(value: string | null): value is ThemeName {
  return value === 'rose' || value === 'green' || value === 'black'
}

function readInitialTheme(): ThemeName {
  if (typeof window === 'undefined') {
    return 'rose'
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)

  return isThemeName(storedTheme) ? storedTheme : 'rose'
}

type ThemeStore = {
  theme: ThemeName
  cycleTheme: () => void
  setTheme: (theme: ThemeName) => void
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: readInitialTheme(),
  cycleTheme: () =>
    set((state) => {
      const themeIndex = THEME_SEQUENCE.indexOf(state.theme)
      const nextTheme = THEME_SEQUENCE[(themeIndex + 1) % THEME_SEQUENCE.length]
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
      return { theme: nextTheme }
    }),
  setTheme: (theme) => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    set({ theme })
  },
}))

