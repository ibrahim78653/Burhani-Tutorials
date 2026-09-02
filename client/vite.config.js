import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// Note: Vite 8 uses rolldown which requires manualChunks as a function
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Rolldown (Vite 8) requires manualChunks as a function, not an object
        manualChunks(id) {
          // Vendor: core React runtime — tiny initial payload, cached aggressively
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/')) {
            return 'vendor';
          }
          // Form libraries — only needed on admission/form pages
          if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('node_modules/zod/')) {
            return 'forms';
          }
          // UI helpers — icons, toasts
          if (id.includes('lucide-react') || id.includes('react-hot-toast')) {
            return 'ui';
          }
          // HTTP + date utils
          if (id.includes('node_modules/axios/') || id.includes('node_modules/date-fns/')) {
            return 'utils';
          }
        },
      },
    },
  },
})
