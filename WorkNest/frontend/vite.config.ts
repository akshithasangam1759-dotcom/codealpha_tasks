import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://worknest-64im.onrender.com',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'https://worknest-64im.onrender.com',
        ws: true,
      }
    }
  }
})
