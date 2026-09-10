import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendTarget = (env.VITE_BACKEND_URL || env.BACKEND_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '')

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: true, // Listen on all network addresses (0.0.0.0) for LAN/WiFi access
      cors: true,
      proxy: {
        /**
         * Proxy all backend API calls through Vite dev server.
         * Eliminates browser CORS issues and resolves 127.0.0.1 vs localhost mismatches.
         */
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
        '/chat': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
        '/health': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
        '/models': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
        '/metrics': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
        '/explain': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
