import { defineTool } from '../tool';
import { Edit } from '@vicons/tabler';

export const tool = defineTool({
  name: 'PDF Editor',
  path: '/pdf-editor',
  description: '100% Free Client-Side PDF Editor. Edit PDF text directly, find & replace text with full Arabic support, load system fonts, add signatures, draw, and redact PDFs securely in your browser.',
  keywords: ['pdf editor', 'edit pdf text', 'find and replace pdf', 'arabic pdf editor', 'free pdf editor', 'pdf signature', 'client-side pdf', 'redact pdf', 'تعديل pdf', 'تعديل نصوص pdf', 'بحث واستبدال pdf', 'تعديل pdf مجاني', 'محرر pdf عربي'],
  component: () => import('./pdf-editor.vue'),
  icon: Edit,
  createdAt: new Date(),
});
