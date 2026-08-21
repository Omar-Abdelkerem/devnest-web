/**
 * vite.config.js — Vite build configuration for DevNest
 *
 * @tailwindcss/vite is the official Tailwind v4 Vite plugin.
 * It replaces the old PostCSS workflow — no postcss.config.js needed.
 * Tailwind is processed as a first-class Vite transform.
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(), // Must come before the React plugin
    react(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
