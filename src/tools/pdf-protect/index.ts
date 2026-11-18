import { defineTool } from '../tool';
import { Lock } from '@vicons/tabler';
export const tool = defineTool({
  name: 'PDF Protect & Unlock',
  path: '/pdf-protect',
  description: 'Unavailable: PDF encryption and unlocking are disabled. Previously generated files were not password-protected.',
  keywords: ['pdf', 'password', 'protect', 'encrypt', 'unlock', 'security'],
  component: () => import('./pdf-protect.vue'),
  icon: Lock,
  createdAt: new Date(),
});
