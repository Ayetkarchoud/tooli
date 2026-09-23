import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Forward /api/* to the Express backend during development.
    // Change the port if the backend runs somewhere else.
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})
