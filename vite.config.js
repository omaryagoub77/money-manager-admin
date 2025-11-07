import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) {
              return 'firebase';
            }
            if (id.includes('recharts')) {
              return 'charting';
            }
            if (id.includes('react') && id.includes('router')) {
              return 'react-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'lucide-icons';
            }
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000 // Increase limit to reduce warnings
  }
})