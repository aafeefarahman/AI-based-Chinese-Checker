import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  optimizeDeps: {
    // Pre-bundle these on startup so first page load is instant
    include: ['react', 'react-dom', 'react-router-dom', 'axios'],
  },
  build: {
    sourcemap: false,
  }
})
