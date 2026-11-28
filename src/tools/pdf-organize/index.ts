import { LayoutGrid } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Organize PDF Pages',
  path: '/pdf-organize',
  description: 'Reorder and rotate PDF pages visually. Drag and rearrange pages then download.',
  keywords: ['pdf', 'reorder', 'rotate', 'organize', 'pages', 'rearrange'],
  component: () => import('./pdf-organize.vue'),
  icon: LayoutGrid,
  createdAt: new Date(),
});
