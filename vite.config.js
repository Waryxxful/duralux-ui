import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    dts({
      entryRoot: resolve(__dirname, 'src'),
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
      outDir: 'dist',
      rollupTypes: false,
      compilerOptions: {
        noEmitForJsFiles: true,
      },
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'charts/index': resolve(__dirname, 'src/charts/index.ts'),
        'charts/apex': resolve(__dirname, 'src/charts/apex.ts'),
        'charts/recharts': resolve(__dirname, 'src/charts/recharts.ts'),
        'antd/index': resolve(__dirname, 'src/antd/index.ts'),
      },
      name: 'DuraluxUI',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react-dom/client',
        'react-router-dom',
        'apexcharts',
        'react-apexcharts',
        'recharts',
        /^antd(\/|$)/,
        /^dayjs(\/|$)/,
        // Dependencias (no peers): el bundler del consumidor las resuelve y descarta si no se usan.
        /^@tanstack\/react-(table|virtual)(\/|$)/,
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
})
