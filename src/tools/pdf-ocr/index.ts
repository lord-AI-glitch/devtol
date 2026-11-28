import { Scan } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'PDF OCR Text Extractor',
  path: '/pdf-ocr',
  description: 'Extract text from scanned PDFs and images using OCR. Supports multiple languages.',
  keywords: ['pdf', 'ocr', 'text', 'extract', 'scan', 'tesseract', 'recognize'],
  component: () => import('./pdf-ocr.vue'),
  icon: Scan,
  createdAt: new Date(),
});
