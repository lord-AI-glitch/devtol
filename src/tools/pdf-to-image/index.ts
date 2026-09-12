import { defineTool } from '../tool';
import { Photo } from '@vicons/tabler';

export const tool = defineTool({
  name: 'PDF to Image',
  path: '/pdf-to-image',
  description: 'Convert PDF pages to PNG or JPG images. Download all pages as a ZIP. Client-side only.',
  keywords: ['pdf', 'image', 'png', 'jpg', 'convert', 'export', 'pages'],
  component: () => import('./pdf-to-image.vue'),
  icon: Photo,
  createdAt: new Date(),
});
