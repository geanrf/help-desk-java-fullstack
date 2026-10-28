import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, '.', '')
  const configuredPort = Number(environment.VITE_DEV_PORT || 5174)

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: Number.isInteger(configuredPort) ? configuredPort : 5174,
      strictPort: true,
      proxy: {
        '/api': {
          target: environment.VITE_PROXY_TARGET || 'http://127.0.0.1:8080',
          changeOrigin: true,
        },
      },
    },
  }
})
