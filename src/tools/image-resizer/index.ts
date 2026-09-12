import { defineTool } from '../tool';
import { Crop } from '@vicons/tabler';
export const tool = defineTool({
  name: 'Image Resizer & Cropper',
  path: '/image-resizer',
  description: 'Resize images to exact dimensions or crop to standard aspect ratios. No server uploads.',
  keywords: ['image', 'resize', 'crop', 'dimension', 'scale', 'aspect ratio'],
  component: () => import('./image-resizer.vue'),
  icon: Crop,
  createdAt: new Date(),
});
