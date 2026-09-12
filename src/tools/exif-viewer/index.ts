import { defineTool } from '../tool';
import { Camera } from '@vicons/tabler';
export const tool = defineTool({
  name: 'EXIF Metadata Viewer',
  path: '/exif-viewer',
  description: 'View and strip EXIF metadata from photos. See camera settings, GPS location and more.',
  keywords: ['exif', 'metadata', 'photo', 'gps', 'camera', 'strip', 'privacy'],
  component: () => import('./exif-viewer.vue'),
  icon: Camera,
  createdAt: new Date(),
});
