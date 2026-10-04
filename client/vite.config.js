import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // "@/..." = "src/..." (shadcn/ui components import this way)
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // Forward /api/* to the Express backend during development.
    // API_PROXY_TARGET: in Docker it's http://server:5000 (see docker-compose.yml); otherwise localhost.
    proxy: {
      '/api': process.env.API_PROXY_TARGET || 'http://localhost:5000',
    },
    // In Docker on Windows/macOS, file changes in the mounted folder don't reach the container as
    // events, so hot reload needs polling (WATCH_POLLING=true is set in docker-compose.yml)
    watch: process.env.WATCH_POLLING === 'true' ? { usePolling: true, interval: 300 } : undefined,
  },
})
