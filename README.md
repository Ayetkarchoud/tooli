# tooli

A learning platform: an AI tutor, recommended e-learning partner platforms, and VIP courses with the best professors in Tunisia.

Built with the **MERN** stack (MongoDB, Express, React, Node).

## Project structure

| Folder | What | Who |
|---|---|---|
| `client/` | React + Vite frontend | frontend |
| `server/` | Express + Node API, MongoDB | backend |
| `logo/` | Logo source (Affinity) + `tooli-logo.svg` | design |
| `docs/` | [API contract](docs/api.md) between frontend and backend | both |
| `design/` | Old colour palette demo (the real tokens are in `client/src/styles/tokens.css`) | design |

## Getting started

```bash
cd client
npm install
npm run dev
```

The frontend runs on http://localhost:5173 and forwards every `/api/*` request
to the backend on http://localhost:5000 (see `client/vite.config.js`).

## Run with Docker

Runs the whole stack (React client + MongoDB, and the Express API once `server/` exists) with one command.
No Node.js or MongoDB needed on your computer.

1. Install **Docker Desktop**: https://www.docker.com/products/docker-desktop/ and start it.
2. (Optional) copy `.env.example` to `.env` to change ports or settings. Every value has a default.
3. From the repo root:

   ```bash
   docker compose up --build
   ```

   The first run takes a few minutes (it downloads images and installs dependencies).

| What | URL |
|---|---|
| Website (hot reload: edit files in `client/`, the page updates) | http://localhost:5173 |
| API (when the `server` service is enabled) | http://localhost:5000 |
| MongoDB (for Compass or mongosh) | `mongodb://localhost:27017/tooli` |

- **Stop**: `Ctrl + C`, then `docker compose down` (or `docker compose down` from another terminal).
- **Run in the background**: `docker compose up --build -d`, logs with `docker compose logs -f client`.
- **Reset the database** (deletes all its data): `docker compose down -v` (the `-v` removes the `mongo-data` volume).
- **After changing `package.json`**: `docker compose up --build` again, so the container installs the new packages.
- **The API**: the `server` service is commented out in `docker-compose.yml` until the Express app exists.
  Uncomment it (and `depends_on` in `client`) once `server/` has a Dockerfile that starts Express on port 5000.

More details: [client/README.md](client/README.md). Backend: build the routes described in

## Route map

| Route | Page | Who |
|---|---|---|
| `/` | Landing: hero with a live tutor preview, services, how it works | everyone |
| `/login`, `/signup` | Log in / create an account (fake for now: any email works) | visitors |
| `/about`, `/contact`, `/privacy` | Small info pages (landing footer) | everyone |
| `/dashboard` | Home: greeting, "Your week", ask bar, services, continue learning, tip, top professors | members |
| `/dashboard/tutor` · `/dashboard/tutor/:chatId` | AI tutor: chat history, welcome, conversation (`?q=` asks at once) | members |
| `/dashboard/courses` · `/dashboard/courses/:courseId` | Course catalogue (filters in the URL) · one course, lessons, "Mark as done" | members |
| `/dashboard/professors` · `/dashboard/professors/:profId` | VIP professors (filters) · profile, reviews, booking | members |
| `/dashboard/vip` | VIP plans, FAQ | members |
| `/dashboard/notifications` | Notifications (All / Unread, mark as read) | members |
| `/dashboard/search?q=` | Search courses, professors and tips | members |
| `/dashboard/settings/:tab` | Settings: `profile`, `appearance`, `notifications` | members |
| `/mascot` | Every mascot pose (development only) | dev |

Unknown addresses show a friendly "not found" page (inside the dashboard for `/dashboard/*`).

## How to demo

Everything runs in the browser with fake data (no backend needed), so the demo always works.

1. `cd client && npm install && npm run dev` (or `docker compose up --build`), then open http://localhost:5173.
2. **Landing**: watch the tutor preview answer a question. Try the 5 colour dots and the 🌙 button.
3. **Sign up** with any name and email (password: 8+ characters). You land on the dashboard.
4. **Dashboard**: the greeting changes with the time of day; "Your week" shows your activity.
5. **Ask** "How do I solve 2x + 5 = 13?" in the ask bar → the tutor answers step by step; try "Explain simpler".
6. **Courses**: filter by Mathematics, open *Algebra basics*, click **Done** on the next lesson → celebration.
7. **Professors**: open a professor, pick a day, a time and 1 h 30 → **Book this class** → confetti.
   The 🔔 shows a new notification; "Your week" shows your next class.
8. **Settings → Appearance**: pick a palette and Light / Dark / System; **Profile**: change your first name →
   the avatar and greeting update.

Good to know: reloading the page resets the fake data (bookings, chats, lesson progress), while your login,
name, palette and theme stay saved in the browser. To start completely fresh, clear the site data.

## Rules

- All colours come from `client/src/styles/tokens.css`. No raw hex colours in components.
- Never commit secrets (`.env` files): share them privately.
- Work on a branch, then open a pull request to merge into `main`.
