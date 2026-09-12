import { defineTool } from '../tool';
import { Replace } from '@vicons/tabler';
export const tool = defineTool({
  name: 'Regex Find & Replace',
  path: '/regex-replace',
  description: 'Find and replace text using regular expressions with live preview and match highlighting.',
  keywords: ['regex', 'replace', 'find', 'pattern', 'regexp', 'substitute', 'text'],
  component: () => import('./regex-replace.vue'),
  icon: Replace,
  createdAt: new Date(),
});
