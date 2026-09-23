import { PALETTES, useTheme } from '../theme/themeContext.js'

export default function ThemeSwitcher() {
  const { theme, toggleTheme, palette, setPalette } = useTheme()

  return (
    <div className="theme-switcher">
      {PALETTES.map((p) => (
        <button
          key={p.id}
          type="button"
          className={`swatch${palette === p.id ? ' is-active' : ''}`}
          style={{ background: p.swatch }}
          onClick={() => setPalette(p.id)}
          aria-label={`${p.label} palette`}
          aria-pressed={palette === p.id}
          title={p.label}
        />
      ))}
      <button
        type="button"
        className="mode-toggle"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </div>
  )
}
