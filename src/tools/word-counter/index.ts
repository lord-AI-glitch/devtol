import { defineTool } from '../tool';
import { AlignJustified } from '@vicons/tabler';
export const tool = defineTool({
  name: 'Word & Character Counter',
  path: '/word-counter',
  description: 'Count words, characters, sentences, paragraphs and estimate reading time in real-time.',
  keywords: ['word', 'character', 'counter', 'count', 'text', 'reading time', 'statistics'],
  component: () => import('./word-counter.vue'),
  icon: AlignJustified,
  createdAt: new Date(),
});
