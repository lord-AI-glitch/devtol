<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useHead } from '@vueuse/head';
import { useNow } from '@vueuse/core';
import {
  formatISO,
  formatISO9075,
  formatRFC3339,
  formatRFC7231,
  fromUnixTime,
  getTime,
  getUnixTime,
  isDate,
  isValid,
  parseISO,
  parseJSON,
} from 'date-fns';
import type { DateFormat, ToDateMapper } from './date-time-converter.types';
import {
  dateToExcelFormat,
  excelFormatToDate,
  isExcelFormat,
  isISO8601DateTimeString,
  isISO9075DateString,
  isMongoObjectId,
  isRFC3339DateString,
  isRFC7231DateString,
  isTimestamp,
  isUTCDateString,
  isUnixTimestamp,
} from './date-time-converter.models';
import { withDefaultOnError } from '@/utils/defaults';
import { useValidation } from '@/composable/validation';
import { Calendar, Check } from '@vicons/tabler';

const DATE_PAIRS: Record<
  string,
  { title: string; desc: string; defaultFormatIndex: number }
> = {
  'unix-timestamp-to-utc': {
    title: 'Unix Timestamp to UTC Converter',
    desc: 'Convert Unix epoch timestamp seconds to UTC human-readable format',
    defaultFormatIndex: 5,
  },
  'unix-timestamp-to-iso': {
    title: 'Unix Timestamp to ISO 8601 Converter',
    desc: 'Convert seconds since Unix epoch to standard ISO 8601 datetime format',
    defaultFormatIndex: 5,
  },
  'iso-to-unix-timestamp': {
    title: 'ISO 8601 to Unix Timestamp Converter',
    desc: 'Convert ISO 8601 date string to Unix epoch seconds and milliseconds',
    defaultFormatIndex: 1,
  },
};

const route = useRoute();
const router = useRouter();

const activePairKey = ref<string>('');
const inputDate = ref('');

const toDate: ToDateMapper = date => new Date(date);

const formats: DateFormat[] = [
  {
    name: 'JS locale date string',
    fromDate: date => date.toString(),
    toDate,
    formatMatcher: () => false,
  },
  {
    name: 'ISO 8601',
    fromDate: formatISO,
    toDate: parseISO,
    formatMatcher: date => isISO8601DateTimeString(date),
  },
  {
    name: 'ISO 9075',
    fromDate: formatISO9075,
    toDate: parseISO,
    formatMatcher: date => isISO9075DateString(date),
  },
  {
    name: 'RFC 3339',
    fromDate: formatRFC3339,
    toDate,
    formatMatcher: date => isRFC3339DateString(date),
  },
  {
    name: 'RFC 7231',
    fromDate: formatRFC7231,
    toDate,
    formatMatcher: date => isRFC7231DateString(date),
  },
  {
    name: 'Unix timestamp',
    fromDate: date => String(getUnixTime(date)),
    toDate: sec => fromUnixTime(+sec),
    formatMatcher: date => isUnixTimestamp(date),
  },
  {
    name: 'Timestamp',
    fromDate: date => String(getTime(date)),
    toDate: ms => parseJSON(+ms),
    formatMatcher: date => isTimestamp(date),
  },
  {
    name: 'UTC format',
    fromDate: date => date.toUTCString(),
    toDate,
    formatMatcher: date => isUTCDateString(date),
  },
  {
    name: 'Mongo ObjectID',
    fromDate: date => `${Math.floor(date.getTime() / 1000).toString(16)}0000000000000000`,
    toDate: objectId => new Date(Number.parseInt(objectId.substring(0, 8), 16) * 1000),
    formatMatcher: date => isMongoObjectId(date),
  },
  {
    name: 'Excel date/time',
    fromDate: date => dateToExcelFormat(date),
    toDate: excelFormatToDate,
    formatMatcher: isExcelFormat,
  },
];

const formatIndex = ref(6);
const now = useNow();

function selectPair(pairKey: string, updateUrl = true) {
  if (DATE_PAIRS[pairKey]) {
    activePairKey.value = pairKey;
    formatIndex.value = DATE_PAIRS[pairKey].defaultFormatIndex;
    if (updateUrl) {
      const langPrefix = route.path.match(/^\/(ar|de|es|fr|no|pt|uk|vi|zh)/);
      const prefix = langPrefix ? `/${langPrefix[1]}` : '';
      router.replace(`${prefix}/date-converter/${pairKey}`);
    }
  } else {
    activePairKey.value = '';
  }
}

onMounted(() => {
  const param = (route.params.pair as string) || '';
  if (param && DATE_PAIRS[param.toLowerCase()]) {
    selectPair(param.toLowerCase(), false);
  } else {
    const pathParts = route.path.split('/').filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1]?.toLowerCase();
    if (lastPart && DATE_PAIRS[lastPart]) {
      selectPair(lastPart, false);
    }
  }
});

watch(
  () => route.params.pair,
  newPair => {
    if (newPair && typeof newPair === 'string' && DATE_PAIRS[newPair.toLowerCase()]) {
      activePairKey.value = newPair.toLowerCase();
      formatIndex.value = DATE_PAIRS[newPair.toLowerCase()].defaultFormatIndex;
    }
  },
);

const activePair = computed(() => DATE_PAIRS[activePairKey.value]);

useHead(
  computed(() => {
    if (!activePair.value) return {};
    return {
      title: `${activePair.value.title} | DevTol`,
      meta: [
        {
          name: 'description',
          content: `${activePair.value.desc}. Accurate, instant, 100% client-side date & time converter.`,
        },
      ],
    };
  }),
);

const normalizedDate = computed(() => {
  if (!inputDate.value) {
    return now.value;
  }

  const { toDate } = formats[formatIndex.value];

  try {
    return toDate(inputDate.value);
  } catch (_ignored) {
    return undefined;
  }
});

function onDateInputChanged(value: string) {
  const matchingIndex = formats.findIndex(({ formatMatcher }) => formatMatcher(value));
  if (matchingIndex !== -1) {
    formatIndex.value = matchingIndex;
  }
}

const validation = useValidation({
  source: inputDate,
  watch: [formatIndex],
  rules: [
    {
      message: 'This date is invalid for this format',
      validator: value =>
        withDefaultOnError(() => {
          if (value === '') {
            return true;
          }

          const maybeDate = formats[formatIndex.value].toDate(value);
          return isDate(maybeDate) && isValid(maybeDate);
        }, false),
    },
  ],
});

function formatDateUsingFormatter(formatter: (date: Date) => string, date?: Date) {
  if (!date || !validation.isValid) {
    return '';
  }

  return withDefaultOnError(() => formatter(date), '');
}
</script>

<template>
  <div class="space-y-4">
    <!-- Quick Date Scenario Chips -->
    <div class="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <n-icon :size="18" class="text-primary-500"><Calendar /></n-icon>
          <span class="text-xs font-semibold text-slate-700 dark:text-slate-200">
            Frequent Date Conversions:
          </span>
        </div>
        <span v-if="activePair" class="text-xs text-primary-600 dark:text-primary-400 font-medium">
          {{ activePair.title }}
        </span>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button
          v-for="(pair, key) in DATE_PAIRS"
          :key="key"
          type="button"
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all"
          :class="[
            activePairKey === key
              ? 'bg-primary-600 text-white shadow-sm font-semibold'
              : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:border-primary-400'
          ]"
          @click="selectPair(key as string)"
        >
          <n-icon v-if="activePairKey === key" :size="12"><Check /></n-icon>
          <span>{{ pair.title.replace(' Converter', '') }}</span>
        </button>
      </div>
    </div>

    <!-- Main Date Converter Inputs -->
    <div>
      <div flex gap-2>
        <c-input-text
          v-model:value="inputDate"
          autofocus
          placeholder="Put your date string or timestamp here..."
          clearable
          test-id="date-time-converter-input"
          :validation="validation"
          @update:value="onDateInputChanged"
        />

        <c-select
          v-model:value="formatIndex"
          style="flex: 0 0 170px"
          :options="formats.map(({ name }, i) => ({ label: name, value: i }))"
          data-test-id="date-time-converter-format-select"
        />
      </div>

      <n-divider />

      <input-copyable
        v-for="{ name, fromDate } in formats"
        :key="name"
        :label="name"
        label-width="150px"
        label-position="left"
        label-align="right"
        :value="formatDateUsingFormatter(fromDate, normalizedDate)"
        placeholder="Invalid date..."
        :test-id="name"
        readonly
        mt-2
      />
    </div>
  </div>
</template>
