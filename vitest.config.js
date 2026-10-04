import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './test/setup.js',
    // Worktrees de agentes y herramientas viven dentro del repo: sus tests no son de esta rama.
    exclude: ['**/node_modules/**', '**/dist/**', '.claude/**', '.superpowers/**'],
  },
})
