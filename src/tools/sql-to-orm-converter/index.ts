import { Database } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.sql-to-orm-converter.title'),
  path: '/sql-to-orm-converter',
  description: translate('tools.sql-to-orm-converter.description'),
  keywords: [
    'sql',
    'orm',
    'converter',
    'prisma',
    'sqlalchemy',
    'drizzle',
    'typeorm',
    'gorm',
    'typescript',
    'schema',
    'database',
    'ddl',
    'create table',
  ],
  component: () => import('./sql-to-orm-converter.vue'),
  icon: Database,
  createdAt: new Date('2025-02-18'),
});
