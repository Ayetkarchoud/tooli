import { createContext, useContext } from 'react'

// Must match the [data-palette] blocks in src/styles/tokens.css
export const PALETTES = [
  { id: 'blue', label: 'Blue', swatch: '#3B5BDB' },
  { id: 'yellow', label: 'Yellow', swatch: '#FACC15' },
  { id: 'green', label: 'Light green', swatch: '#4ADE80' },
  { id: 'red', label: 'Red', swatch: '#F43F5E' },
  { id: 'violet', label: 'Violet', swatch: '#7C3AED' },
]

export const ThemeContext = createContext(null)

// { theme, toggleTheme, palette, setPalette }
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
