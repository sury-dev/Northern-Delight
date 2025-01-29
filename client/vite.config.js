import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api' : {
        target: 'http://localhost:9000',
        changeOrigin: true, // Ensures that the proxy target's origin is used
        secure: false,   
      }
    }
  },
  plugins: [
    react(),
    tailwindcss()
  ],
  base: '/',
})
