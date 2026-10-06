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
- Pages get their data from `src/services/` (courses, professors, tutor, notifications, vip, search, user, week).
  For now these return **fake data** after a short delay; each function has a `TODO(backend)` with the
  real call. Pages never import mock data directly.
- The frontend calls the API through `src/api/client.js`, always on paths starting with `/api`
  (for example `api.get('/professors')` → `GET /api/professors`).
- In development, Vite forwards every `/api/*` request to **http://localhost:5000**
  (see `vite.config.js`). Run Express on port 5000, or set `API_PROXY_TARGET` to another address.
  With Docker (`docker compose up --build` at the repo root) it points to the `server` service automatically.

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

- `useTheme()` (from `src/theme/themeContext.js`) gives: `{ theme, toggleTheme, themeChoice, setThemeChoice, palette, setPalette }`.
  `theme` is what's shown (`light` / `dark`); `themeChoice` is `light`, `dark` or `system` (no saved choice:
  follows the device setting live). Settings → Appearance uses `setThemeChoice` and `setPalette`.
- **Part of a page in another palette**: put `data-palette="green"` on any element. `tokens.css` recomputes
  the palette tokens there, so buttons, links and the mascot inside use that palette (Appearance previews).
- `src/components/Logo.jsx` (logo) and `src/components/Mascot.jsx` (mascot, poses in `mascotPoses.jsx`)
  are inline SVGs; their colours come from the `--logo-*` and `--mascot-*` tokens.

## Languages: English, Français, العربية

tooli runs in 3 languages with [react-i18next](https://react.i18next.com/). Arabic is right-to-left.

- **Texts**: `src/locales/{en,fr,ar}.json`, one section per page or feature (`common`, `nav`, `landing`, `auth`,
  `dashboard`, `tutor`, `courses`, `professors`, `booking`, `vip`, `notifications`, `search`, `settings`, `errors`…),
  plus the names of ids (`subjects`, `levels`, `sections`, `cities`, `languageNames`, `titles`). Each file is
  downloaded only when that language is used. Add every new key to the 3 files.
- **In a component**: `const { t } = useTranslation()` → `t('courses.lessons')`, `t('auth.welcome', { name })`.
  Plurals: `t('courses.count', { count })` picks `count_one` / `count_other` (English, French) or
  `_zero` / `_one` / `_two` / `_few` / `_many` / `_other` (Arabic). Outside React: `i18n.t(…)` from `src/lib/i18n.js`.
- **Which language**: the saved choice (`localStorage 'tooli-lang'`, and `user.language` after login) → the
  browser's language (fr / ar / en) → French. `index.html` sets `<html lang dir>` before React starts (no flash).
- **Switching**: `<LanguageSwitcher />` (🌐 menu: landing header, login/signup), the avatar menu → Language,
  and Settings → Appearance & language. All use `useChangeLanguage()` (`src/lib/useChangeLanguage.js`):
  it applies at once and, when logged in, saves `language` in the profile.
- **Data from services** comes in the current language (the real API reads the `Accept-Language` header that
  `src/api/client.js` sends). `useAsync` reloads the data when the language changes. Fixed lists come as ids
  (`subject: 'mathematics'`) and are translated in the page: `t(`subjects.${course.subject}`)`.
- **Dates, numbers, prices**: always through `src/lib/time.js` (`formatSlotStart`, `formatDuration`, `timeAgo`…),
  `src/lib/numbers.js` (`formatRating`, `formatPercent`) and `src/lib/money.js` (`formatTND`). Locales:
  en-GB, fr-TN, ar-TN with Latin digits.
- **Browser tab title**: `PageHeader` sets it from its title; other pages call `usePageTitle(t('…'))`.

### Right-to-left (Arabic)

- Use **logical classes**, never left/right: `ms-*` / `me-*`, `ps-*` / `pe-*`, `start-*` / `end-*`, `text-start` /
  `text-end`, `border-s` / `border-e`, `rounded-s-*` / `rounded-e-*` (corners: `rounded-ss-md`, `rounded-ee-md`).
- **Mirror directional icons** with `rtl:-scale-x-100` (arrows, chevrons, send). A hover nudge needs its mirror too:
  `group-hover:translate-x-1 rtl:group-hover:-translate-x-1`. Never mirror the logo, the mascot, clocks or media icons.
- **Motion slides**: multiply x by `useDirectionSign()` (`src/lib/motion.js`): `x: 12 * dir`.
- **Sheets** open from the start side: `side={i18n.dir() === 'rtl' ? 'right' : 'left'}`.
- **Mixed text**: put `dir="auto"` (or `<bdi>`) on text people typed (questions, chat titles, names); code is
  always `dir="ltr"`. In Arabic translations, wrap formulas like `2x + 5 = 13` in U+2066 … U+2069 so they stay
  left-to-right.
- **Font**: Poppins has no Arabic letters, so Arabic text uses **Tajawal** (400/500/700/800, same rounded feel),
  with a taller line height under `:lang(ar)` (`tailwind.css`). Latin text and numbers stay in Poppins.

## Shared helpers worth knowing

- `useNotifications()` (member area only): `{ unread, refresh, setUnread }`. The 🔔 dot reads it; call
  `refresh()` after an action that creates a notification, `setUnread(...)` after marking some as read.
- `useAuth().updateUser({ firstName, lastName })`: update the logged-in user after the API saved it.
- `useChangeLanguage()`: switch the language (and save it in the profile when logged in).
- `<Highlight text={…} query={q} />` (`src/lib/highlight.jsx`): marks the matching words, ignoring case and
  accents, as React elements (never HTML strings). `hasWord` / `matches` / `normalise` in `src/lib/text.js`.
- `api.get(path, { …query })` (`src/api/client.js`) builds the query string and skips empty values.

## Folders

```
src/
  api/          calls to the Express backend
  auth/         who is logged in (fake for now) + route guards
  components/   reusable UI (Logo, Mascot, MascotMessage, LoadState, PageLoader, ThemeSwitcher, …)
    ui/         shadcn/ui components
  data/         static app content (the list of tooli services, profile choices as ids)
  layout/       member area frame (sidebar, top bar, mobile menu, tab bar)
  lib/          i18n.js (languages), motion.js (animations), useAsync.js (load data), time.js / numbers.js /
                money.js (formatting per language), people.js, utils.js (cn)
  locales/      en.json, fr.json, ar.json: every text the user sees
  pages/        one file per page; folders per area (auth/, tutor/, courses/, professors/, settings/)
  services/     data functions the pages call (fake for now, see docs/api.md)
  styles/       tokens.css, shadcn-theme.css, tailwind.css
  theme/        ThemeProvider (dark mode + palette)
  App.jsx       routes
```
