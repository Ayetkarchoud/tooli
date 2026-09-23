# tooli: frontend (React + Vite)

Part of the tooli MERN app. This folder is the **React** side; the Express/Node API
(and MongoDB) live in a separate `server/` folder.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:5173

## For the backend

- The frontend calls the API through `src/api/client.js`, always on paths starting with `/api`
  (for example `api.get('/professors')` → `GET /api/professors`).
- In development, Vite forwards every `/api/*` request to **http://localhost:5000**
  (see `vite.config.js`). Run Express on port 5000, or change that line.

## Colours and themes

- All colours live in `src/styles/tokens.css`: 5 palettes (blue, yellow, green, red, violet) + dark mode.
- Never write a hex colour in components or CSS. Use the tokens, e.g. `var(--color-primary)`.
- `useTheme()` (from `src/theme/themeContext.js`) gives: `{ theme, toggleTheme, palette, setPalette }`.
- `src/components/Logo.jsx` is the tooli logo; its colours follow the palette automatically.

## Folders

```
src/
  api/          calls to the Express backend
  components/   reusable UI (Logo, ThemeSwitcher, ...)
  styles/       tokens.css (colours) + global.css
  theme/        ThemeProvider (dark mode + palette)
  App.jsx       current home page (dashboard design coming next)
```
