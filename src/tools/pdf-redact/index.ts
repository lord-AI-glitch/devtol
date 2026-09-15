import { defineTool } from '../tool';
import { EyeOff } from '@vicons/tabler';
export const tool = defineTool({
  name: 'PDF Redaction Tool',
  path: '/pdf-redact',
  description: 'Permanently redact sensitive text from PDF files. Client-side privacy guaranteed.',
  keywords: ['pdf', 'redact', 'censor', 'remove', 'sensitive', 'privacy', 'blackout'],
  component: () => import('./pdf-redact.vue'),
  icon: EyeOff,
  createdAt: new Date(),
});
