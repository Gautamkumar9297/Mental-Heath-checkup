import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      process: 'process/browser',
      util: 'util',
    },
  },
  optimizeDeps: {
    include: [
      'simple-peer', 
      'socket.io-client',
      'buffer',
      'process/browser',
      'util',
      'events'
    ],
    exclude: ['@vite/client', '@vite/env']
  },
  build: {
    rollupOptions: {
      external: [],
    },
  },
})
