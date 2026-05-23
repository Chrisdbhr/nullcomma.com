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
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'markdown': ['react-markdown', 'rehype-raw', 'rehype-slug'],
          'syntax-highlighter': ['react-syntax-highlighter'],
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
