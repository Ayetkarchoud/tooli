// Light/dark mode + colour palette for the whole app.
// The actual colours live in src/styles/tokens.css; this only sets
// data-theme / data-palette on <html> and remembers the user's choice.
// Later: also save the choice to the user's profile through the API.

import { useEffect, useState } from 'react'
import { ThemeContext } from './themeContext.js'

const THEME_KEY = 'tooli-theme'
const PALETTE_KEY = 'tooli-palette'

function save(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // storage blocked (private mode): the choice just won't be remembered
  }
}

export function ThemeProvider({ children }) {
  // index.html already applied the saved choice before React loaded,
  // so read the starting values back from <html>
  const root = document.documentElement
  const [theme, setTheme] = useState(root.dataset.theme === 'dark' ? 'dark' : 'light')
  const [palette, setPalette] = useState(root.dataset.palette || 'blue')

  useEffect(() => {
    if (theme === 'dark') root.dataset.theme = 'dark'
    else delete root.dataset.theme
    save(THEME_KEY, theme)
  }, [theme, root])

  useEffect(() => {
    if (palette === 'blue') delete root.dataset.palette
    else root.dataset.palette = palette
    save(PALETTE_KEY, palette)
  }, [palette, root])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, palette, setPalette }}>
      {children}
    </ThemeContext.Provider>
  )
}
