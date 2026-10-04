# tooli client: DEVELOPMENT image (Vite dev server with hot reload).
# Used by docker-compose.yml at the repo root: the source folder is mounted over /app,
# while node_modules stays inside the container (Linux packages, not the Windows ones).

FROM node:24-alpine

WORKDIR /app

# Install dependencies first, so this layer is cached until package*.json change
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 5173

# --host 0.0.0.0: listen on all interfaces so the browser on your computer can reach it
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
