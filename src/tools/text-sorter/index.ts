import { defineTool } from '../tool';
import { SortAscending } from '@vicons/tabler';
export const tool = defineTool({
  name: 'Text Sorter & Deduplicator',
  path: '/text-sorter',
  description: 'Sort lines, remove duplicates, trim whitespace and clean text. Multiple sort options.',
  keywords: ['sort', 'deduplicate', 'lines', 'text', 'clean', 'trim', 'unique'],
  component: () => import('./text-sorter.vue'),
  icon: SortAscending,
  createdAt: new Date(),
});
