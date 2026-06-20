import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',      // ← дозволити зовнішні підключення
    port: 5173,
    strictPort: true,      // ← не міняти порт якщо зайнятий
  },
  build: {
    outDir: 'dist',
  },
})