import { createContext, useContext } from 'react'

// Must match the [data-palette] blocks in src/styles/tokens.css
export const PALETTES = [
  { id: 'blue', label: 'Blue', swatch: 'var(--palette-blue)' },
  { id: 'yellow', label: 'Yellow', swatch: 'var(--palette-yellow)' },
  { id: 'green', label: 'Light green', swatch: 'var(--palette-green)' },
  { id: 'red', label: 'Red', swatch: 'var(--palette-red)' },
  { id: 'violet', label: 'Violet', swatch: 'var(--palette-violet)' },
]

export const ThemeContext = createContext(null)

// { theme, toggleTheme, palette, setPalette }
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
