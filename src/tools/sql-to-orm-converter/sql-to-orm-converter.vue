<script setup lang="ts">
import { computed, ref } from 'vue';
import { Check, Code, Copy, Database, Download, Table } from '@vicons/tabler';
import {
  type OrmTarget,
  convertSqlToOrm,
  parseSqlSchema,
} from './sql-to-orm-converter.service';
import { useCopy } from '@/composable/copy';

const { copy, isCopied } = useCopy();

const PRESETS = {
  auth: `-- Users & Authentication Schema
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  is_verified BOOLEAN DEFAULT false,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
  id VARCHAR(64) PRIMARY KEY,
  user_id INT NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(id)
);`,

  ecommerce: `-- E-Commerce Store Schema
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(120) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  category_id INT NOT NULL,
  sku VARCHAR(64) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  inventory INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_product_cat FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_email VARCHAR(255) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(30) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);`,

  blog: `-- Blog & Publishing System
CREATE TABLE authors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  bio TEXT,
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE articles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  author_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(300) NOT NULL UNIQUE,
  content LONGTEXT NOT NULL,
  view_count INT DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_article_author FOREIGN KEY (author_id) REFERENCES authors(id)
);`,
};

const rawSql = ref<string>(PRESETS.auth);
const selectedTarget = ref<OrmTarget>('prisma');

const targets: { label: string; value: OrmTarget; ext: string; lang: string }[] = [
  { label: 'Prisma', value: 'prisma', ext: 'prisma', lang: 'prisma' },
  { label: 'SQLAlchemy 2.0', value: 'sqlalchemy', ext: 'py', lang: 'python' },
  { label: 'Drizzle ORM', value: 'drizzle', ext: 'ts', lang: 'typescript' },
  { label: 'TypeORM', value: 'typeorm', ext: 'ts', lang: 'typescript' },
  { label: 'Go GORM', value: 'gorm', ext: 'go', lang: 'go' },
  { label: 'TypeScript', value: 'typescript', ext: 'ts', lang: 'typescript' },
];

const parsedTables = computed(() => {
  try {
    return parseSqlSchema(rawSql.value);
  }
  catch (err) {
    return [];
  }
});

const totalColumns = computed(() => {
  return parsedTables.value.reduce((acc, t) => acc + t.columns.length, 0);
});

const generatedCode = computed(() => {
  if (!rawSql.value.trim()) {
    return '';
  }
  try {
    return convertSqlToOrm(rawSql.value, selectedTarget.value);
  }
  catch (err: any) {
    return `// Error converting SQL schema: ${err?.message || 'Syntax error'}`;
  }
});

function loadPreset(key: keyof typeof PRESETS) {
  rawSql.value = PRESETS[key];
}

function handleCopy() {
  if (generatedCode.value) {
    copy(generatedCode.value);
  }
}

function handleDownload() {
  if (!generatedCode.value) {
    return;
  }
  const currentTarget = targets.find(t => t.value === selectedTarget.value);
  const ext = currentTarget?.ext || 'txt';
  const blob = new Blob([generatedCode.value], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `schema.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
}

function clearSql() {
  rawSql.value = '';
}
</script>

<template>
  <div class="space-y-6">
    <!-- Top presets bar -->
    <div class="flex flex-wrap items-center justify-between gap-3 border border-slate-200 rounded-xl bg-slate-50 p-4 dark:border-slate-700/60 dark:bg-slate-800/60">
      <div class="flex items-center gap-2">
        <n-icon :size="20" class="text-primary-500">
          <Database />
        </n-icon>
        <span class="text-sm text-slate-700 font-semibold dark:text-slate-200">Load Template Preset:</span>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <n-button size="small" secondary @click="loadPreset('auth')">
          Users & Auth
        </n-button>
        <n-button size="small" secondary @click="loadPreset('ecommerce')">
          E-Commerce
        </n-button>
        <n-button size="small" secondary @click="loadPreset('blog')">
          Blog & CMS
        </n-button>
        <n-button size="small" quaternary @click="clearSql">
          Clear
        </n-button>
      </div>
    </div>

    <!-- Main 2-column grid -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- Left: SQL Input -->
      <div class="flex flex-col space-y-3">
        <div class="flex items-center justify-between">
          <label class="flex items-center gap-2 text-sm text-slate-800 font-semibold dark:text-slate-200">
            <n-icon :size="16"><Code /></n-icon>
            <span>Raw SQL DDL (CREATE TABLE)</span>
          </label>
          <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span v-if="parsedTables.length > 0" class="rounded bg-emerald-100 px-2 py-0.5 text-emerald-700 font-medium dark:bg-emerald-950/60 dark:text-emerald-400">
              {{ parsedTables.length }} Table{{ parsedTables.length > 1 ? 's' : '' }} ({{ totalColumns }} Cols)
            </span>
          </div>
        </div>

        <n-input
          v-model:value="rawSql"
          type="textarea"
          placeholder="Paste raw SQL CREATE TABLE statements here..."
          :rows="18"
          class="text-xs font-mono"
        />

        <!-- Detected tables badges -->
        <div v-if="parsedTables.length > 0" class="flex flex-wrap gap-2 pt-1">
          <div
            v-for="t in parsedTables"
            :key="t.name"
            class="inline-flex items-center gap-1.5 border border-slate-200 rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-700 font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <n-icon :size="12" class="text-primary-500">
              <Table />
            </n-icon>
            <span class="font-semibold">{{ t.name }}</span>
            <span class="text-slate-400">({{ t.columns.length }})</span>
          </div>
        </div>
      </div>

      <!-- Right: Target ORM Selector & Output -->
      <div class="flex flex-col space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <label class="text-sm text-slate-800 font-semibold dark:text-slate-200">
            Target ORM / Framework
          </label>
          <div class="flex items-center gap-2">
            <n-button
              size="small"
              type="primary"
              secondary
              :disabled="!generatedCode"
              @click="handleCopy"
            >
              <template #icon>
                <n-icon><Check v-if="isCopied" /><Copy v-else /></n-icon>
              </template>
              {{ isCopied ? 'Copied!' : 'Copy Code' }}
            </n-button>
            <n-button
              size="small"
              quaternary
              :disabled="!generatedCode"
              @click="handleDownload"
            >
              <template #icon>
                <n-icon><Download /></n-icon>
              </template>
              Download
            </n-button>
          </div>
        </div>

        <!-- ORM Target Tabs -->
        <div class="flex flex-wrap gap-1 border border-slate-200 rounded-lg bg-slate-100 p-1 dark:border-slate-700/60 dark:bg-slate-800/80">
          <button
            v-for="t in targets"
            :key="t.value"
            type="button"
            class="rounded-md px-3 py-1.5 text-xs font-medium transition-all"
            :class="[
              selectedTarget === t.value
                ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100',
            ]"
            @click="selectedTarget = t.value"
          >
            {{ t.label }}
          </button>
        </div>

        <n-input
          :value="generatedCode"
          type="textarea"
          readonly
          placeholder="ORM code will appear here automatically..."
          :rows="18"
          class="text-xs font-mono"
        />
      </div>
    </div>

    <!-- Feature highlights -->
    <div class="grid grid-cols-1 gap-4 border-t border-slate-200 pt-4 md:grid-cols-3 dark:border-slate-800">
      <div class="border border-slate-200/80 rounded-xl bg-slate-50 p-4 dark:border-slate-700/50 dark:bg-slate-800/40">
        <h4 class="mb-1 text-sm text-slate-800 font-semibold dark:text-slate-200">
          Zero-Server Client-Side
        </h4>
        <p class="text-xs text-slate-600 dark:text-slate-400">
          Your SQL database schemas are parsed 100% locally in your browser. No schema structures or table names ever touch external servers.
        </p>
      </div>

      <div class="border border-slate-200/80 rounded-xl bg-slate-50 p-4 dark:border-slate-700/50 dark:bg-slate-800/40">
        <h4 class="mb-1 text-sm text-slate-800 font-semibold dark:text-slate-200">
          Modern Frameworks
        </h4>
        <p class="text-xs text-slate-600 dark:text-slate-400">
          Outputs idiomatic code for modern Prisma 5, SQLAlchemy 2.0 (with <code class="text-xs">Mapped[...]</code> typing), Drizzle ORM, TypeORM, and Go GORM.
        </p>
      </div>

      <div class="border border-slate-200/80 rounded-xl bg-slate-50 p-4 dark:border-slate-700/50 dark:bg-slate-800/40">
        <h4 class="mb-1 text-sm text-slate-800 font-semibold dark:text-slate-200">
          Relationship-Aware
        </h4>
        <p class="text-xs text-slate-600 dark:text-slate-400">
          Automatically translates inline & table-level Foreign Keys, composite primary keys, unique constraints, and SQL type variations.
        </p>
      </div>
    </div>
  </div>
</template>
