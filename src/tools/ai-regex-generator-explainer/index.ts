import { Wand } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.ai-regex-generator-explainer.title'),
  path: '/ai-regex-generator-explainer',
  description: translate('tools.ai-regex-generator-explainer.description'),
  keywords: [
    'regex',
    'regular expression',
    'generator',
    'explainer',
    'ai',
    'tester',
    'pattern',
    'validator',
    'egyptian phone',
    'email regex',
    'password regex',
    'arabic regex',
  ],
  component: () => import('./ai-regex-generator-explainer.vue'),
  icon: Wand,
  createdAt: new Date('2025-02-18'),
});
