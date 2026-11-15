import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '127.0.0.1',
    strictPort: true,
    fs: {
      strict: true,
      deny: ['.env', '.env.*', '**/.env*', '**/.git/**'],
    },
  },
})
