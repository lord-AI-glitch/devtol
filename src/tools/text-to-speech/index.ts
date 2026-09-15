import { defineTool } from '../tool';
import { Volume } from '@vicons/tabler';
export const tool = defineTool({
  name: 'Text to Speech',
  path: '/text-to-speech',
  description: 'Convert text to audio with browser-native speech synthesis. Adjust voice, speed, and pitch.',
  keywords: ['tts', 'text', 'speech', 'voice', 'speak', 'audio', 'synthesize'],
  component: () => import('./text-to-speech.vue'),
  icon: Volume,
  createdAt: new Date(),
});
