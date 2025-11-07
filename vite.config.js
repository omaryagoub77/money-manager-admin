import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'charting': ['recharts'],
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'lucide-icons': ['lucide-react']
        }
      }
    },
    chunkSizeWarningLimit: 1000 // Increase limit to reduce warnings
  }
})