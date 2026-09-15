import { defineTool } from '../tool';
import { ShieldLock } from '@vicons/tabler';
export const tool = defineTool({
  name: 'Text Encrypt & Decrypt',
  path: '/text-encrypt',
  description: 'Encrypt and decrypt text with AES-GCM using a password. Runs 100% in your browser.',
  keywords: ['encrypt', 'decrypt', 'aes', 'password', 'text', 'secret', 'crypto'],
  component: () => import('./text-encrypt.vue'),
  icon: ShieldLock,
  createdAt: new Date(),
});
