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
              return 'react-router';
            }
            if (id.includes('lucide-react')) {
              return 'lucide-icons';
            }
            // Split large node_modules into smaller chunks
            if (id.includes('react-dom')) {
              return 'react-dom';
            }
            if (id.includes('react')) {
              return 'react';
            }
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1500, // Increased limit
    // Add memory optimization settings
    minify: 'esbuild',
    // Limit concurrent transforms to reduce memory usage
    assetsInlineLimit: 4096,
    cssCodeSplit: true
  },
  // Add optimization to reduce memory usage during build
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  },
  // Limit concurrency to reduce memory pressure
  worker: {
    format: 'es'
  }
})