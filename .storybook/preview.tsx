import type { Decorator, Preview } from '@storybook/react-vite'
import { ThemeSync } from './ThemeSync'
import { parseTheme } from './parseTheme'
// Mismo orden de estilos que una app: Bootstrap, adaptación Duralux, capa GranCRM + tokens.
import '../scss/bootstrap/bootstrap.scss'
import '../scss/theme.scss'
import '../src/styles/grancrm-ui.css'
import './preview.css'

const withTheme: Decorator = (Story, context) => (
  <>
    <ThemeSync theme={parseTheme(String(context.globals.theme ?? 'light'))} />
    <Story />
  </>
)

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Tema del sistema',
      toolbar: {
        title: 'Tema',
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Claro' },
          { value: 'dark', title: 'Oscuro' },
          { value: 'navy', title: 'Navy' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },
  decorators: [withTheme],
  parameters: {
    layout: 'padded',
    a11y: { test: 'error' },
    options: { storySort: { order: ['Introducción', 'Fundamentos', '*'] } },
  },
}

export default preview
