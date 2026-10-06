import { createContext, useContext } from 'react'

// Must match the [data-palette] blocks in src/styles/tokens.css
// and the PALETTES list in index.html's pre-load script. Names: t(`theme.palettes.${id}`)
export const PALETTES = [
  { id: 'blue', swatch: 'var(--palette-blue)' },
  { id: 'yellow', swatch: 'var(--palette-yellow)' },
  { id: 'green', swatch: 'var(--palette-green)' },
  { id: 'red', swatch: 'var(--palette-red)' },
  { id: 'violet', swatch: 'var(--palette-violet)' },
]

// A saved palette id we still know about (old or hand-edited values fall back to blue)
export const isPalette = (id) => PALETTES.some((p) => p.id === id)

export const ThemeContext = createContext(null)

// { theme (light|dark, what is shown), toggleTheme, themeChoice (light|dark|system), setThemeChoice, palette, setPalette }
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
