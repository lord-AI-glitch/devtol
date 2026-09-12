import { defineTool } from '../tool';
import { Movie } from '@vicons/tabler';
export const tool = defineTool({
  name: 'Video to GIF',
  path: '/video-to-gif',
  description: 'Convert video clips to animated GIF. Set start/end time, size and FPS. Client-side.',
  keywords: ['video', 'gif', 'convert', 'animate', 'mp4', 'webm'],
  component: () => import('./video-to-gif.vue'),
  icon: Movie,
  createdAt: new Date(),
});
