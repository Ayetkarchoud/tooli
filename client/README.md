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

- The full API contract (every endpoint with request and response examples) is in [docs/api.md](../docs/api.md).
- Pages get their data from `src/services/` (courses, professors, tutor, notifications, vip, search, user).
  For now these return **fake data** after a short delay; each function has a `TODO(backend)` with the
  real call. Pages never import mock data directly.
- The frontend calls the API through `src/api/client.js`, always on paths starting with `/api`
  (for example `api.get('/professors')` → `GET /api/professors`).
- In development, Vite forwards every `/api/*` request to **http://localhost:5000**
  (see `vite.config.js`). Run Express on port 5000, or change that line.

## Styling: Tailwind CSS + shadcn/ui + Motion

- **Tailwind CSS v4** styles everything with classes in the JSX. There are no per-page CSS files.
  Setup: `@tailwindcss/vite` in `vite.config.js`, entry file `src/styles/tailwind.css`.
- **shadcn/ui** components (Button, Card, Input, DropdownMenu, Sheet, Tooltip, ...) are copied into
  `src/components/ui`. They are our code: edit them freely. Button, Card and Badge are already
  restyled to the tooli look (extra variants: `highlight`, `pill`, `tile`).
- **Motion** (`import { motion } from 'motion/react'`) does the animations. Shared settings
  (fade-up, stagger, card lift) live in `src/lib/motion.js`.
- Imports use the `@` alias for `src`: `import { Button } from '@/components/ui/button'`.

### Where the colours live

| File | What it does |
| --- | --- |
| `src/styles/tokens.css` | **The only place with colour values.** 5 palettes (`<html data-palette="yellow|green|red|violet">`, blue = no attribute) and dark mode (`<html data-theme="dark">`). |
| `src/styles/shadcn-theme.css` | Points shadcn's variables (`--primary`, `--card`, `--border`, ...) to our tokens. No colours of its own. |
| `src/styles/tailwind.css` | Turns those variables into Tailwind classes, adds breakpoints and base styles. |

Useful classes: `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `bg-primary`,
`text-primary-foreground`, `border-border`, plus tooli extras: `bg-highlight` / `bg-highlight-soft`
(amber accent), `text-primary-text` (primary that stays readable on light palettes), `shadow-lift`.
Careful: shadcn's `bg-accent` is the *soft primary tint*, not our amber accent.
Any token also works directly: `bg-(--color-primary-soft)`.

Breakpoints: `xs` 480px, `md` 768px, `nav` 860px (sidebar ↔ bottom tab bar), `lg` 1024px.
`dark:` classes follow `data-theme="dark"`.

### The rule: no hex colours outside tokens.css

Never write `#3B5BDB`, `rgb(...)` or Tailwind's built-in colours (`bg-blue-500`, `text-white`) in
components or CSS. Use a token class (`bg-primary`) or a token variable (`var(--color-primary)`).
New colour? Add a token to `tokens.css` (and its dark-mode / palette versions if needed).
The only exceptions are files browsers read before our CSS exists: `public/favicon.svg` and the
`theme-color` meta tag in `index.html` (both use the navy `--brand-ink`).

All text colours pass WCAG AA contrast (4.5:1) in all 5 palettes, light and dark.
If you change a token, keep text readable on the yellow and green palettes too.

### Add a shadcn component

```bash
npx shadcn@latest add dialog        # or: tabs, select, switch, ...
```

It lands in `src/components/ui/` and already uses our tokens through `shadcn-theme.css`.
Check the new file for built-in colour classes (`bg-black/50`, `text-white`) and swap them for tokens.

### Animations and reduced motion

- Use the helpers in `src/lib/motion.js`: `useEntrance()` (on load), `useInView()` (on scroll),
  `fadeUp` + `stagger()` variants, `liftOnHover` for cards.
- People who turn on "reduce motion" in their OS get no animations: `<MotionConfig reducedMotion="user">`
  in `main.jsx`, the helpers skip the fade, the mascot stays still, and `tailwind.css` switches off
  CSS animations and transitions.

## Theme and palette in code

- `useTheme()` (from `src/theme/themeContext.js`) gives: `{ theme, toggleTheme, palette, setPalette }`.
- `src/components/Logo.jsx` (logo) and `src/components/Mascot.jsx` (mascot, poses in `mascotPoses.jsx`)
  are inline SVGs; their colours come from the `--logo-*` and `--mascot-*` tokens.

## Folders

```
src/
  api/          calls to the Express backend
  auth/         who is logged in (fake for now) + route guards
  components/   reusable UI (Logo, Mascot, MascotMessage, LoadState, PageLoader, ThemeSwitcher, …)
    ui/         shadcn/ui components
  data/         static app content (the list of tooli services)
  layout/       member area frame (sidebar, top bar, mobile menu, tab bar)
  lib/          motion.js (animations), useAsync.js (load data), people.js, utils.js (cn)
  pages/        one file per page; folders per area (auth/, tutor/, courses/, professors/, settings/)
  services/     data functions the pages call (fake for now, see docs/api.md)
  styles/       tokens.css, shadcn-theme.css, tailwind.css
  theme/        ThemeProvider (dark mode + palette)
  App.jsx       routes
```
