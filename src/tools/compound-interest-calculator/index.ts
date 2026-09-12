import { ChartLine } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.compound-interest-calculator.title'),
  path: '/compound-interest-calculator',
  description: translate('tools.compound-interest-calculator.description'),
  keywords: ['compound', 'interest', 'calculator', 'investment', 'savings', 'growth', 'finance', 'wealth', 'yield', 'roi'],
  component: () => import('./compound-interest-calculator.vue'),
  icon: ChartLine,
  createdAt: new Date('2024-03-01'),
});
