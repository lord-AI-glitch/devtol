import { defineTool } from '../tool';
import { VectorBezier } from '@vicons/tabler';
export const tool = defineTool({
  name: 'SVG to PNG/JPG Converter',
  path: '/svg-converter',
  description: 'Convert SVG vector files to PNG, JPG at any scale. Upload file or paste SVG code.',
  keywords: ['svg', 'png', 'jpg', 'convert', 'vector', 'rasterize', 'export'],
  component: () => import('./svg-converter.vue'),
  icon: VectorBezier,
  createdAt: new Date(),
});
