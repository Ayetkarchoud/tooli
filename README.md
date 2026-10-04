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

## Rules

- All colours come from `client/src/styles/tokens.css`. No raw hex colours in components.
- Never commit secrets (`.env` files): share them privately.
- Work on a branch, then open a pull request to merge into `main`.
