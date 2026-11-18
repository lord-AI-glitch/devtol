import { defineTool } from '../tool';
import { EyeOff } from '@vicons/tabler';
export const tool = defineTool({
  name: 'PDF Redaction Tool',
  path: '/pdf-redact',
  description: 'Unavailable: PDF redaction is disabled. Previously generated files still contain the original sensitive text.',
  keywords: ['pdf', 'redact', 'censor', 'remove', 'sensitive', 'privacy', 'blackout'],
  component: () => import('./pdf-redact.vue'),
  icon: EyeOff,
  createdAt: new Date(),
});
