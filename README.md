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

More details: [client/README.md](client/README.md). Backend: build the routes described in
[docs/api.md](docs/api.md). Working with Claude Code? The project rules are in [CLAUDE.md](CLAUDE.md).

## Rules

- All colours come from `client/src/styles/tokens.css`. No raw hex colours in components.
- Never commit secrets (`.env` files): share them privately.
- Work on a branch, then open a pull request to merge into `main`.
