import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname),
  publicDir: resolve(__dirname, '../../duralux-admin'),
  resolve: {
    alias: {
      '@duralux/ui': resolve(__dirname, '../src/index.js'),
    },
  },
  server: { port: 5200 },
})
