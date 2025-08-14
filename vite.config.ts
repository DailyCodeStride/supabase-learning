import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Force Vite to use a specific port; change this if you prefer another
  server: {
    port: 5176, // chosen new port to clearly see change
    strictPort: true, // fail instead of silently picking another port
    host: '127.0.0.1', // bind explicitly to loopback
  }
})
