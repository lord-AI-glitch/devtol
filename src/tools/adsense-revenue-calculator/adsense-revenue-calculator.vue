<script setup lang="ts">
import { computed, watch } from 'vue';
import { useStorage } from '@vueuse/core';
import {
  AD_NICHES,
  type CalculationMode,
  calculateAdSenseRevenue,
} from './adsense-revenue-calculator.service';

const dailyPageviews = useStorage('adsense-calc:pageviews', 10000);
const calculationMode = useStorage<CalculationMode>('adsense-calc:mode', 'cpc');
const selectedNicheId = useStorage('adsense-calc:niche', 'finance');
const ctrPercent = useStorage('adsense-calc:ctr', 2.2);
const cpc = useStorage('adsense-calc:cpc', 4.8);
const rpm = useStorage('adsense-calc:rpm', 35.0);

const nicheOptions = AD_NICHES.map(n => ({
  label: `${n.name} (Typical CPC: $${n.typicalCpc.toFixed(2)}, RPM: $${n.typicalRpm.toFixed(2)})`,
  value: n.id,
}));

const modeOptions = [
  { label: 'Calculate by CPC (Cost Per Click)', value: 'cpc' },
  { label: 'Calculate by RPM (Revenue Per 1000 Impressions)', value: 'rpm' },
];

watch(selectedNicheId, (newId) => {
  const niche = AD_NICHES.find(n => n.id === newId);
  if (niche && newId !== 'custom') {
    cpc.value = niche.typicalCpc;
    ctrPercent.value = niche.typicalCtr;
    rpm.value = niche.typicalRpm;
  }
});

const result = computed(() =>
  calculateAdSenseRevenue({
    dailyPageviews: dailyPageviews.value,
    calculationMode: calculationMode.value,
    ctrPercent: ctrPercent.value,
    cpc: cpc.value,
    rpm: rpm.value,
    nicheId: selectedNicheId.value,
  }),
);

function formatCurrency(val: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(val);
}

function formatNumber(val: number) {
  return new Intl.NumberFormat('en-US').format(val);
}
</script>

<template>
  <div style="max-width: 1000px; margin: 0 auto;">
    <n-grid :cols="24" :x-gap="16" :y-gap="16">
      <n-form-item-gi :span="24" label="Website Industry / Niche Benchmark">
        <n-select v-model:value="selectedNicheId" :options="nicheOptions" style="width: 100%" />
      </n-form-item-gi>

      <n-form-item-gi :span="24" :md="12" label="Calculation Method">
        <n-select v-model:value="calculationMode" :options="modeOptions" style="width: 100%" />
      </n-form-item-gi>

      <n-form-item-gi :span="24" :md="12" label="Daily Pageviews">
        <n-input-number v-model:value="dailyPageviews" :min="100" :step="1000" style="width: 100%" />
      </n-form-item-gi>

      <n-form-item-gi :span="24" :md="12" label="Average CTR (%)">
        <n-input-number v-model:value="ctrPercent" :min="0.1" :max="30" :step="0.1" style="width: 100%" />
      </n-form-item-gi>

      <n-form-item-gi v-if="calculationMode === 'cpc'" :span="24" :md="12" label="Average CPC ($)">
        <n-input-number v-model:value="cpc" :min="0.01" :step="0.5" style="width: 100%" />
      </n-form-item-gi>

      <n-form-item-gi v-else :span="24" :md="12" label="Page RPM ($ per 1,000 views)">
        <n-input-number v-model:value="rpm" :min="0.1" :step="1" style="width: 100%" />
      </n-form-item-gi>
    </n-grid>

    <div my-6>
      <n-grid :cols="24" :x-gap="12" :y-gap="12">
        <n-gi :span="24" :md="8">
          <c-card>
            <n-statistic label="Daily Revenue" :value="formatCurrency(result.dailyRevenue)" />
          </c-card>
        </n-gi>
        <n-gi :span="24" :md="8">
          <c-card>
            <n-statistic label="Monthly Revenue (Est.)" :value="formatCurrency(result.monthlyRevenue)" />
          </c-card>
        </n-gi>
        <n-gi :span="24" :md="8">
          <c-card>
            <n-statistic label="Yearly Revenue (Est.)" :value="formatCurrency(result.yearlyRevenue)" />
          </c-card>
        </n-gi>
      </n-grid>
    </div>

    <c-card title="Performance & Metric Estimates">
      <n-table :bordered="true" :single-line="false">
        <thead>
          <tr>
            <th>Metric</th>
            <th>Calculated Value</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td font-semibold>
              Estimated Daily Clicks
            </td>
            <td font-semibold>
              {{ formatNumber(result.dailyClicks) }}
            </td>
            <td op-80>
              Calculated as Pageviews × CTR%
            </td>
          </tr>
          <tr>
            <td font-semibold>
              Effective RPM
            </td>
            <td>{{ formatCurrency(result.effectiveRpm) }}</td>
            <td op-80>
              Revenue per 1,000 page impressions
            </td>
          </tr>
          <tr>
            <td font-semibold>
              Effective CPC
            </td>
            <td>{{ formatCurrency(result.effectiveCpc) }}</td>
            <td op-80>
              Revenue earned per ad click
            </td>
          </tr>
          <tr>
            <td font-semibold>
              Monthly Estimated Pageviews
            </td>
            <td>{{ formatNumber(dailyPageviews * 30.4167) }}</td>
            <td op-80>
              Projected monthly traffic volume
            </td>
          </tr>
        </tbody>
      </n-table>
    </c-card>
  </div>
</template>
