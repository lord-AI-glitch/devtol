import { defineTool } from '../tool';
import { Lock } from '@vicons/tabler';
export const tool = defineTool({
  name: 'PDF Protect & Unlock',
  path: '/pdf-protect',
  description: 'Password-protect or unlock PDF files directly in your browser. Zero server uploads.',
  keywords: ['pdf', 'password', 'protect', 'encrypt', 'unlock', 'security'],
  component: () => import('./pdf-protect.vue'),
  icon: Lock,
  createdAt: new Date(),
});
