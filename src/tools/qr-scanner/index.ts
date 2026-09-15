import { defineTool } from '../tool';
import { Qrcode } from '@vicons/tabler';
export const tool = defineTool({
  name: 'QR Code Scanner',
  path: '/qr-scanner',
  description: 'Scan QR codes from images or your camera. Detects URLs, WiFi, vCards and plain text.',
  keywords: ['qr', 'scan', 'decode', 'camera', 'barcode', 'reader'],
  component: () => import('./qr-scanner.vue'),
  icon: Qrcode,
  createdAt: new Date(),
});
