import { defineTool } from '../tool';
import { BuildingBridge } from '@vicons/tabler';
export const tool = defineTool({
  name: 'JWT Builder & Signer',
  path: '/jwt-builder',
  description: 'Build, sign and decode JSON Web Tokens with custom header, payload and HMAC-SHA256 secret.',
  keywords: ['jwt', 'token', 'sign', 'encode', 'hmac', 'json', 'auth'],
  component: () => import('./jwt-builder.vue'),
  icon: BuildingBridge,
  createdAt: new Date(),
});
