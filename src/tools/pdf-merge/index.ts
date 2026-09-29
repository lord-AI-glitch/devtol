import { defineTool } from '../tool';
import { FileZip } from '@vicons/tabler';

export const tool = defineTool({
  name: 'Merge PDF',
  path: '/pdf-merge',
  description: 'Merge multiple PDF files into one. 100% client-side - files never leave your browser.',
  keywords: ['pdf', 'merge', 'combine', 'join', 'document', 'دمج pdf', 'دمج ملفات pdf'],
  component: () => import('./pdf-merge.vue'),
  icon: FileZip,
  createdAt: new Date(),
});
