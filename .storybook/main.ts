import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(ts|tsx|jsx)'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    // Config de Vite propia: la del repo es de build de librería (lib + dts).
    options: { builder: { viteConfigPath: '.storybook/vite.config.ts' } },
  },
  docs: { defaultName: 'Documentación' },
}

export default config
