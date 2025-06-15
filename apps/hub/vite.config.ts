import path from 'node:path'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/auth/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/trpc': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      verboseFileRoutes: false,
    }),
    react(),
  ],
  resolve: {
    alias: {
      '@chad-chat/ui': path.resolve(__dirname, '../../packages/shared/ui/src'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    postcss: path.resolve(__dirname, './postcss.config.mjs'),
  },
})
