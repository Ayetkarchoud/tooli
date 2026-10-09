# Contributing to tooli

tooli is a MERN learning platform for students in Tunisia: an AI tutor, partner e-learning
courses and private classes with VIP professors. This repo: `client/` (frontend, built here),
`server/` (Express + MongoDB, built by a teammate from `docs/api.md`), `logo/`, `design/` (old demo).

## Stack (client/)

- React 19 + Vite, **JavaScript only (no TypeScript)**, react-router-dom, lucide-react icons.
- Tailwind CSS v4: classes in JSX, no page CSS files. Entry: `src/styles/tailwind.css`.
- shadcn/ui components in `src/components/ui` (our code, restyled to tooli). Add more with
  `npx shadcn@latest add <name>`, then replace any built-in colours with tokens.
- Motion (`import { motion } from 'motion/react'`); shared helpers in `src/lib/motion.js`.
- Import alias: `@/` = `client/src/`.

## Colours: tokens only

- Every colour lives in `client/src/styles/tokens.css`: 5 palettes via `<html data-palette="yellow|green|red|violet">`
  (blue = no attribute) and dark mode via `<html data-theme="dark">`.
- **Never write a hex/rgb colour or a Tailwind built-in colour (`bg-blue-500`, `text-white`) anywhere else.**
  Use token classes (`bg-primary`, `text-muted-foreground`, `bg-card`, `border-border`, `bg-highlight`,
  `text-primary-text`) or `var(--color-…)`. Need a new colour? Add a token (plus dark/palette versions).
- Only exceptions: `public/favicon.svg` and the `theme-color` meta in `index.html`.
- Text must stay readable (WCAG AA 4.5:1) in all 5 palettes, light and dark. Yellow and green are the risky ones.

## Design

- Original tooli design: friendly and playful, but clean. Never copy layouts, illustrations or
  branding from other sites or products; derive visuals from the tooli logo and mascot.
- Use the mascot (`src/components/Mascot.jsx`, poses: waving, thinking, explaining, celebrating,
  sleepy, oops) for empty, loading, error and success moments. `MascotMessage`, `NotFoundState` and
  `ErrorState` in `src/components/MascotMessage.jsx` cover the common cases.
- Font: Poppins (400, 500, 600, 700, 800 are loaded; use only these weights). Arabic text uses Tajawal
  (400, 500, 700, 800), applied automatically.

## Languages: en / fr / ar (Arabic is right-to-left)

- **All user-facing text goes through i18n (`t('…')`) in en/fr/ar; use logical properties (ms/me/ps/pe/start/end),
  never left/right; test every page in Arabic (RTL).**
- Texts live in `client/src/locales/{en,fr,ar}.json` (one section per page/feature); add every key to the 3 files,
  with plural forms (`_one`/`_other`; Arabic `_zero`/`_one`/`_two`/`_few`/`_many`/`_other`). That includes aria-labels,
  tooltips, toasts, validation messages and page titles (`PageHeader` / `usePageTitle`).
- Natural, friendly wording for students in Tunisia (tutoiement in French), not word-for-word translation.
- Mirror directional icons with `rtl:-scale-x-100` (never the logo or the mascot); Motion x offsets × `useDirectionSign()`.
- Dates, numbers and prices only through `lib/time.js`, `lib/numbers.js`, `lib/money.js` (they follow the language).
- Services return content in the current language (fake: `pick()` in `services/fake.js`; real API: `Accept-Language`).
  Fixed lists (subjects, levels, cities, languages, titles) are ids, translated in the page. See `docs/api.md` → Languages.

## UX checklist for every page

- [ ] **Loading**: skeletons shaped like the content (`Skeleton`, `PageSkeleton`, `CardGridSkeleton`), no layout jump.
- [ ] **Empty**: a friendly mascot message with a next step.
- [ ] **Error**: `ErrorState` (or a small inline error) with a "Try again" button.
- [ ] **Success**: clear confirmation after an action (mascot "celebrating" for big moments).
- [ ] **Mobile first**: check 375px, 768px and 1280px. Sidebar ↔ bottom tab bar switches at 860px (`nav:`).
- [ ] **Languages**: no hard-coded text; check the page in Français and العربية (right-to-left), where texts run longer.
- [ ] **Accessible**: keyboard reachable, visible focus, labels on icon-only buttons (+ Tooltip),
      real headings, `role="status"` / `aria-live` for loading and updates, `role="alert"` for errors.
- [ ] **Page header**: `PageHeader` (title, subtitle, optional mascot/badge/actions) inside `Page`
      (`width="narrow"` for reading pages). Cards: `rounded-2xl` (heroes `rounded-3xl`).
- [ ] **Celebrate** big actions with `Celebration` (inline) or a toast with the celebrating mascot.
- [ ] **Motion**: use `src/lib/motion.js` helpers (`liftOnHover` only on links/buttons, `hoverLift` on other
      cards: Motion's press effect makes elements focusable); everything must stop for reduced motion
      (`useReducedMotion`, `MotionConfig reducedMotion="user"` is already set in `main.jsx`).
- [ ] **One clear main action** per page (the primary `Button`).

## Data

- **Pages never import mock data.** They call async functions from `client/src/services/`
  (`courses`, `professors`, `tutor`, `notifications`, `vip`, `search`, `user`, `week`).
- Services are fake for now (mock data + 300–600 ms delay). Each function has a `TODO(backend)` with the
  real `api.*` call (`src/api/client.js`). The contract is `docs/api.md`: keep it in sync when a service changes.
- Load data with `useAsync` (`src/lib/useAsync.js`) → `{ data, error, loading, reload }`;
  pages that load one item by id use `LoadState` (`src/components/LoadState.jsx`).
- Not found: services return `null`; show `NotFoundState` inside the layout.
- Unread notifications count: `useNotifications()` (`refresh()` after actions that create notifications).
- Search highlighting: `<Highlight>` from `src/lib/highlight.jsx` (React elements only, never HTML strings).
- Static app content (the list of tooli services, nav items) lives in `src/data/` and `src/layout/navItems.js`.

## Routes

- All in `client/src/App.jsx`, every page lazy-loaded (`React.lazy`). Member pages go under
  `/dashboard` (inside `PrivateRoute` + `AppLayout`); unknown `/dashboard/*` paths show `MissingPage`.

## Before you finish

```bash
cd client
npm run lint
npm run build
```

Fix every error. The 2 `only-export-components` warnings in `components/ui/button.jsx` and `badge.jsx` are expected.
Keep `client/README.md` and `docs/api.md` up to date with what you changed.
