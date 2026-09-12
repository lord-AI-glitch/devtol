import { ReportMoney } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.adsense-revenue-calculator.title'),
  path: '/adsense-revenue-calculator',
  description: translate('tools.adsense-revenue-calculator.description'),
  keywords: ['adsense', 'revenue', 'calculator', 'earnings', 'cpc', 'rpm', 'ctr', 'monetization', 'ads', 'google', 'traffic', 'finance'],
  component: () => import('./adsense-revenue-calculator.vue'),
  icon: ReportMoney,
  createdAt: new Date('2024-03-01'),
});
