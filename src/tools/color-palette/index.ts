import { Palette } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Color Palette Generator',
  path: '/color-palette',
  description: 'Generate color palettes, convert between HEX/RGB/HSL/CMYK and check WCAG contrast ratios.',
  keywords: ['color', 'palette', 'hex', 'rgb', 'hsl', 'wcag', 'contrast', 'design'],
  component: () => import('./color-palette.vue'),
  icon: Palette,
  createdAt: new Date(),
});
