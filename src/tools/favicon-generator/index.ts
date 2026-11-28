import { Star } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Favicon Generator',
  path: '/favicon-generator',
  description: 'Generate all favicon sizes (16x16 to 512x512) and app icons from a single image. Download as ZIP.',
  keywords: ['favicon', 'icon', 'png', 'ico', 'pwa', 'apple', 'android', 'generator'],
  component: () => import('./favicon-generator.vue'),
  icon: Star,
  createdAt: new Date(),
});
