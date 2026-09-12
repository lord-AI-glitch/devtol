import {
  defineConfig,
  presetAttributify,
  presetTypography,
  presetUno,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss';

import { presetScrollbar } from 'unocss-preset-scrollbar';

export default defineConfig({
  presets: [presetUno(), presetAttributify({ ignoreAttributes: ['size'] }), presetTypography(), presetScrollbar()],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  theme: {
    colors: {
      primary: '#312E81',
      primaryHover: '#3730A3',
      primaryDeep: '#1E1B4B',
      accent: '#F97316',
      accentHover: '#EA580C',
      darkOledBg: '#0F0F23',
      darkOledCard: '#1B1B30',
      darkOledBorder: '#282845',
    },
    fontFamily: {
      sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    },
  },
  shortcuts: {
    'pretty-scrollbar': 'scrollbar scrollbar-rounded scrollbar-thumb-color-gray-300 scrollbar-track-color-gray-100 dark:scrollbar-thumb-color-#282845 dark:scrollbar-track-color-#15152a',
    'divider': 'h-1px bg-current op-10',
    'bg-surface': 'bg-#ffffff dark:bg-#1B1B30',
    'bg-background': 'bg-#f1f5f9 dark:bg-#0F0F23',
    'card-oled': 'bg-white dark:bg-#1B1B30 border border-gray-200 dark:border-#282845 rounded-xl transition-all duration-200',
  },
});
