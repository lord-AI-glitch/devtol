import { Terminal } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.curl-to-code-converter.title'),
  path: '/curl-to-code-converter',
  description: translate('tools.curl-to-code-converter.description'),
  keywords: [
    'curl',
    'converter',
    'python',
    'requests',
    'httpx',
    'javascript',
    'fetch',
    'axios',
    'go',
    'rust',
    'php',
    'java',
    'dart',
    'http',
    'api',
    'rest',
  ],
  component: () => import('./curl-to-code-converter.vue'),
  icon: Terminal,
  createdAt: new Date('2025-02-15'),
});
