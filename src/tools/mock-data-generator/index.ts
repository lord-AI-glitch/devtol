import { defineTool } from '../tool';
import { Database } from '@vicons/tabler';
export const tool = defineTool({
  name: 'Mock Data Generator',
  path: '/mock-data-generator',
  description: 'Generate realistic dummy data: names, emails, addresses, UUIDs, dates. Export as JSON or CSV.',
  keywords: ['mock', 'fake', 'data', 'dummy', 'generate', 'json', 'csv', 'test'],
  component: () => import('./mock-data-generator.vue'),
  icon: Database,
  createdAt: new Date(),
});
