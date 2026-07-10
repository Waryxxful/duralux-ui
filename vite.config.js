import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    // Genera declaraciones reales a partir de los .ts/.tsx (contract, tokens,
    // ShellHeader/ShellNav, etc.) — reemplaza el .d.ts escrito a mano que existía
    // en grancrm-ui/scripts/write-dts.mjs, que se desincronizaba del código real.
    // Sin rollupTypes: no traza el grafo completo desde el entry (evita forzar
    // typecheck de los ~26 componentes .jsx legacy, nunca tipados, fuera de
    // alcance de este merge). scripts/write-index-dts.mjs junta esto con un
    // `any` explícito para lo legacy.
    dts({ include: ['src/**/*.ts', 'src/**/*.tsx'], rollupTypes: false }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'DuraluxUI',
      formats: ['es', 'cjs'],
      fileName: (format) => format === 'es' ? 'index.js' : 'index.cjs',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react-router-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
})
