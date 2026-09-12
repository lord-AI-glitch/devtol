import { Home } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.mortgage-calculator.title'),
  path: '/mortgage-calculator',
  description: translate('tools.mortgage-calculator.description'),
  keywords: ['mortgage', 'calculator', 'loan', 'home', 'real estate', 'finance', 'interest', 'amortization', 'down payment', 'property tax'],
  component: () => import('./mortgage-calculator.vue'),
  icon: Home,
  createdAt: new Date('2024-03-01'),
});
