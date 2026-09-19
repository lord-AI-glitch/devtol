import { Cpu } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.ai-token-cost-calculator.title'),
  path: '/ai-token-cost-calculator',
  description: translate('tools.ai-token-cost-calculator.description'),
  keywords: [
    'ai',
    'token',
    'counter',
    'calculator',
    'llm',
    'cost',
    'pricing',
    'openai',
    'gpt-4o',
    'claude',
    'gemini',
    'deepseek',
    'bpe',
    'prompt',
  ],
  component: () => import('./ai-token-cost-calculator.vue'),
  icon: Cpu,
  createdAt: new Date('2025-02-15'),
});
