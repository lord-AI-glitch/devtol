import { defineTool } from '../tool';
import { FileCheck } from '@vicons/tabler';
export const tool = defineTool({
  name: 'YAML Validator & Formatter',
  path: '/yaml-validator',
  description: 'Validate, format, and convert YAML to JSON. Get detailed syntax error messages.',
  keywords: ['yaml', 'validate', 'format', 'json', 'lint', 'syntax', 'prettify'],
  component: () => import('./yaml-validator.vue'),
  icon: FileCheck,
  createdAt: new Date(),
});
