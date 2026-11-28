<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useHead } from '@vueuse/head';
import { MessageType, composerize } from 'composerize-ts';
import { BrandDocker, Check } from '@vicons/tabler';
import { withDefaultOnError } from '@/utils/defaults';
import { useDownloadFileFromBase64 } from '@/composable/downloadBase64';
import { textToBase64 } from '@/utils/base64';
import TextareaCopyable from '@/components/TextareaCopyable.vue';

const DOCKER_PRESETS: Record<
  string,
  { name: string; slug: string; command: string; desc: string; tag: string }
> = {
  nginx: {
    name: 'Nginx',
    slug: 'nginx',
    command:
      'docker run -d --name nginx-server -p 80:80 -p 443:443 -v /var/www/html:/usr/share/nginx/html:ro -v /etc/nginx/conf.d:/etc/nginx/conf.d:ro --restart always nginx:alpine',
    desc: 'Web server & reverse proxy with HTTP/HTTPS ports and config mounts',
    tag: 'Web & Proxy',
  },
  postgres: {
    name: 'PostgreSQL',
    slug: 'postgres',
    command:
      'docker run -d --name postgres-db -p 5432:5432 -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=mysecretpassword -e POSTGRES_DB=devdb -v pgdata:/var/lib/postgresql/data --restart always postgres:16-alpine',
    desc: 'Postgres 16 SQL database with volume persistence and credentials',
    tag: 'Database',
  },
  redis: {
    name: 'Redis',
    slug: 'redis',
    command:
      'docker run -d --name redis-cache -p 6379:6379 -v redis-data:/data --restart always redis:7-alpine redis-server --appendonly yes --requirepass mysecretpassword',
    desc: 'In-memory cache & key-value store with AOF persistence',
    tag: 'Cache & Queue',
  },
  mysql: {
    name: 'MySQL',
    slug: 'mysql',
    command:
      'docker run -d --name mysql-db -p 3306:3306 -e MYSQL_ROOT_PASSWORD=supersecret -e MYSQL_DATABASE=app -e MYSQL_USER=appuser -e MYSQL_PASSWORD=appsecret -v mysql-data:/var/lib/mysql --restart always mysql:8.0',
    desc: 'MySQL 8.0 relational database with storage volume and auth',
    tag: 'Database',
  },
  mongodb: {
    name: 'MongoDB',
    slug: 'mongodb',
    command:
      'docker run -d --name mongo-db -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=root -e MONGO_INITDB_ROOT_PASSWORD=example -v mongodb-data:/data/db --restart always mongo:latest',
    desc: 'NoSQL document database with root credentials and persistent storage',
    tag: 'Database',
  },
  rabbitmq: {
    name: 'RabbitMQ',
    slug: 'rabbitmq',
    command:
      'docker run -d --name rabbitmq-broker -p 5672:5672 -p 15672:15672 -e RABBITMQ_DEFAULT_USER=rabbit -e RABBITMQ_DEFAULT_PASS=carrots rabbitmq:3-management-alpine',
    desc: 'Message broker with AMQP port 5672 and Web Management UI port 15672',
    tag: 'Cache & Queue',
  },
  wordpress: {
    name: 'WordPress',
    slug: 'wordpress',
    command:
      'docker run -d --name wordpress-site -p 8080:80 -e WORDPRESS_DB_HOST=db:3306 -e WORDPRESS_DB_USER=wp -e WORDPRESS_DB_PASSWORD=secret -e WORDPRESS_DB_NAME=wpdb -v wp-data:/var/www/html wordpress:latest',
    desc: 'Publishing platform linked to database with persistent media files',
    tag: 'Web & CMS',
  },
};

const route = useRoute();
const router = useRouter();

const activePresetKey = ref<string>('');
const dockerRun = ref(DOCKER_PRESETS.nginx.command);

function selectPreset(key: string, updateUrl = true) {
  if (DOCKER_PRESETS[key]) {
    activePresetKey.value = key;
    dockerRun.value = DOCKER_PRESETS[key].command;

    if (updateUrl) {
      const langPrefix = route.path.match(/^\/(ar|de|es|fr|no|pt|uk|vi|zh)/);
      const prefix = langPrefix ? `/${langPrefix[1]}` : '';
      router.replace(`${prefix}/docker-run-to-compose/${key}`);
    }
  }
}

// Check route params or path on load
onMounted(() => {
  const param = (route.params.preset as string) || '';
  if (param && DOCKER_PRESETS[param.toLowerCase()]) {
    selectPreset(param.toLowerCase(), false);
  }
  else {
    // Check if path ends with any preset slug
    const pathParts = route.path.split('/').filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1]?.toLowerCase();
    if (lastPart && DOCKER_PRESETS[lastPart]) {
      selectPreset(lastPart, false);
    }
  }
});

// Watch for route changes
watch(
  () => route.params.preset,
  (newPreset) => {
    if (newPreset && typeof newPreset === 'string' && DOCKER_PRESETS[newPreset.toLowerCase()]) {
      activePresetKey.value = newPreset.toLowerCase();
      dockerRun.value = DOCKER_PRESETS[newPreset.toLowerCase()].command;
    }
  },
);

// Dynamic SEO Head metadata when a specific preset is active
const activePreset = computed(() => DOCKER_PRESETS[activePresetKey.value]);

useHead(
  computed(() => {
    if (!activePreset.value) {
      return {};
    }
    const name = activePreset.value.name;
    return {
      title: `Convert Docker Run ${name} to Docker Compose YML | DevTol`,
      meta: [
        {
          name: 'description',
          content: `Instantly convert ${name} docker run command into a production-ready docker-compose.yml file. ${activePreset.value.desc}. 100% client-side privacy.`,
        },
      ],
    };
  }),
);

const conversionResult = computed(() =>
  withDefaultOnError(() => composerize(dockerRun.value.trim()), { yaml: '', messages: [] }),
);

const dockerCompose = computed(() => conversionResult.value.yaml);
const notImplemented = computed(() =>
  conversionResult.value.messages.filter(msg => msg.type === MessageType.notImplemented).map(msg => msg.value),
);
const notComposable = computed(() =>
  conversionResult.value.messages.filter(msg => msg.type === MessageType.notTranslatable).map(msg => msg.value),
);
const errors = computed(() =>
  conversionResult.value.messages
    .filter(msg => msg.type === MessageType.errorDuringConversion)
    .map(msg => msg.value),
);

const dockerComposeBase64 = computed(() => `data:application/yaml;base64,${textToBase64(dockerCompose.value)}`);
const { download } = useDownloadFileFromBase64({ source: dockerComposeBase64, filename: 'docker-compose.yml' });
</script>

<template>
  <div class="space-y-6">
    <!-- Presets bar -->
    <div class="border border-slate-200 rounded-xl bg-slate-50 p-4 space-y-3 dark:border-slate-700/60 dark:bg-slate-800/60">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <n-icon :size="20" class="text-blue-500">
            <BrandDocker />
          </n-icon>
          <span class="text-sm text-slate-700 font-semibold dark:text-slate-200">
            Popular Service Presets:
          </span>
        </div>
        <span v-if="activePreset" class="text-xs text-blue-600 font-medium dark:text-blue-400">
          {{ activePreset.desc }}
        </span>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button
          v-for="(preset, key) in DOCKER_PRESETS"
          :key="key"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
          :class="[
            activePresetKey === key
              ? 'bg-blue-600 text-white shadow-sm font-semibold'
              : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500',
          ]"
          @click="selectPreset(key as string)"
        >
          <n-icon v-if="activePresetKey === key" :size="13">
            <Check />
          </n-icon>
          <span>{{ preset.name }}</span>
          <span
            class="rounded px-1.5 py-0.2 text-[10px]"
            :class="[
              activePresetKey === key
                ? 'bg-blue-700 text-blue-100'
                : 'bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-300',
            ]"
          >
            {{ preset.tag }}
          </span>
        </button>
      </div>
    </div>

    <!-- Main conversion area -->
    <div>
      <c-input-text
        v-model:value="dockerRun"
        label="Your docker run command:"
        style="font-family: monospace"
        multiline
        raw-text
        monospace
        placeholder="Your docker run command to convert..."
        rows="4"
      />

      <n-divider />

      <TextareaCopyable :value="dockerCompose" language="yaml" />

      <div mt-5 flex justify-center>
        <c-button :disabled="dockerCompose === ''" secondary @click="download">
          Download docker-compose.yml
        </c-button>
      </div>

      <div v-if="notComposable.length > 0">
        <n-alert title="These options are not translatable to docker-compose" type="info" mt-5>
          <ul>
            <li v-for="(message, index) of notComposable" :key="index">
              {{ message }}
            </li>
          </ul>
        </n-alert>
      </div>

      <div v-if="notImplemented.length > 0">
        <n-alert
          title="These options are not yet implemented and therefore haven't been translated to docker-compose"
          type="warning"
          mt-5
        >
          <ul>
            <li v-for="(message, index) of notImplemented" :key="index">
              {{ message }}
            </li>
          </ul>
        </n-alert>
      </div>

      <div v-if="errors.length > 0">
        <n-alert title="The following errors occurred" type="error" mt-5>
          <ul>
            <li v-for="(message, index) of errors" :key="index">
              {{ message }}
            </li>
          </ul>
        </n-alert>
      </div>
    </div>
  </div>
</template>
