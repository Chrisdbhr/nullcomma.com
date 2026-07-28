import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const SITE_URL = 'https://nullcomma.com'

export default defineConfig({
  plugins: [
    react(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/react-router')) return 'react-vendor'
          if (id.includes('node_modules/react-markdown') || id.includes('node_modules/rehype')) return 'markdown'
          if (id.includes('node_modules/react-syntax-highlighter')) return 'syntax-highlighter'
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: ['**/performance/**', '**/e2e/**', '**/node_modules/**'],
  },
})
