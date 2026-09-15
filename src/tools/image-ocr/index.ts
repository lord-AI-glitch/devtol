import { defineTool } from '../tool';
import { Scan } from '@vicons/tabler';
export const tool = defineTool({
  name: 'Image OCR Text Extractor',
  path: '/image-ocr',
  description: 'Extract text from images using OCR. Supports English, Arabic, French, German and more.',
  keywords: ['ocr', 'image', 'text', 'extract', 'scan', 'recognition', 'tesseract'],
  component: () => import('./image-ocr.vue'),
  icon: Scan,
  createdAt: new Date(),
});
