import { createContext, useContext } from 'react'

// Must match the [data-palette] blocks in src/styles/tokens.css
// and the PALETTES list in index.html's pre-load script
export const PALETTES = [
  { id: 'blue', label: 'Blue', swatch: 'var(--palette-blue)' },
  { id: 'yellow', label: 'Yellow', swatch: 'var(--palette-yellow)' },
  { id: 'green', label: 'Light green', swatch: 'var(--palette-green)' },
  { id: 'red', label: 'Red', swatch: 'var(--palette-red)' },
  { id: 'violet', label: 'Violet', swatch: 'var(--palette-violet)' },
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
