// Light/dark mode + colour palette for the whole app.
// The actual colours live in src/styles/tokens.css; this only sets
// data-theme / data-palette on <html> and remembers the user's choice.
// Until the user clicks the toggle, the theme follows the system setting (live).
// index.html's pre-load script applies the same rules before React starts.
// Later: also save the choice to the user's profile through the API.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ThemeContext, isPalette } from './themeContext.js'

const THEME_KEY = 'tooli-theme'
const PALETTE_KEY = 'tooli-palette'
const systemDark = window.matchMedia('(prefers-color-scheme: dark)')

function read(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null // storage blocked (private mode)
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // storage blocked (private mode): the choice just won't be remembered
  }
}

// The theme the user picked, or null if they never chose (then we follow the system)
function readChosenTheme() {
  const saved = read(THEME_KEY)
  return saved === 'dark' || saved === 'light' ? saved : null
}

export function ThemeProvider({ children }) {
  const root = document.documentElement
  const [chosenTheme, setChosenTheme] = useState(readChosenTheme)
  const [systemIsDark, setSystemIsDark] = useState(() => systemDark.matches)
  const [palette, setPaletteState] = useState(() => {
    const saved = read(PALETTE_KEY)
    return isPalette(saved) ? saved : 'blue'
  })

  const theme = chosenTheme ?? (systemIsDark ? 'dark' : 'light')

  // No choice yet: follow the system setting when it changes
  useEffect(() => {
    if (chosenTheme) return
    const onChange = (e) => setSystemIsDark(e.matches)
    systemDark.addEventListener('change', onChange)
    return () => systemDark.removeEventListener('change', onChange)
  }, [chosenTheme])

  useEffect(() => {
    if (theme === 'dark') root.dataset.theme = 'dark'
    else delete root.dataset.theme
  }, [theme, root])

  useEffect(() => {
    if (palette === 'blue') delete root.dataset.palette
    else root.dataset.palette = palette
  }, [palette, root])

  // Saving happens only here, when the user actually picks something
  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setChosenTheme(next)
    save(THEME_KEY, next)
  }, [theme])

  const setPalette = useCallback((id) => {
    const next = isPalette(id) ? id : 'blue'
    setPaletteState(next)
    save(PALETTE_KEY, next)
  }, [])

  const value = useMemo(
    () => ({ theme, toggleTheme, palette, setPalette }),
    [theme, toggleTheme, palette, setPalette],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
