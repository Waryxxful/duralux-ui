import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname),
  publicDir: resolve(__dirname, 'public'),
  resolve: {
    alias: [
      { find: '@duralux/ui/charts/apex', replacement: resolve(__dirname, '../src/charts/apex.ts') },
      { find: '@duralux/ui/charts/recharts', replacement: resolve(__dirname, '../src/charts/recharts.ts') },
      { find: '@duralux/ui/charts', replacement: resolve(__dirname, '../src/charts/index.ts') },
      { find: '@duralux/ui', replacement: resolve(__dirname, '../src/index.ts') },
    ],
  },
  server: { port: 5200 },
})
