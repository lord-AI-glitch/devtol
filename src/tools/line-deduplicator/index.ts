import { ListCheck } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Line Deduplicator',
  path: '/line-deduplicator',
  description: 'Remove duplicate lines, sort, trim whitespace and clean text lists instantly.',
  keywords: ['duplicate', 'lines', 'remove', 'unique', 'sort', 'clean', 'list'],
  component: () => import('./line-deduplicator.vue'),
  icon: ListCheck,
  createdAt: new Date(),
});
