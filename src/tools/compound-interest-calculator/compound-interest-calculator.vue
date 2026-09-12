<script setup lang="ts">
import { computed } from 'vue';
import { useStorage } from '@vueuse/core';
import { calculateCompoundInterest, type CompoundFrequency } from './compound-interest-calculator.service';

const initialInvestment = useStorage('compound-calc:initial', 10000);
const monthlyContribution = useStorage('compound-calc:monthly', 500);
const annualInterestRate = useStorage('compound-calc:rate', 8);
const years = useStorage('compound-calc:years', 10);
const compoundFrequency = useStorage<CompoundFrequency>('compound-calc:freq', 'monthly');

const frequencyOptions = [
  { label: 'Daily (365/yr)', value: 'daily' },
  { label: 'Monthly (12/yr)', value: 'monthly' },
  { label: 'Quarterly (4/yr)', value: 'quarterly' },
  { label: 'Semiannually (2/yr)', value: 'semiannually' },
  { label: 'Annually (1/yr)', value: 'annually' },
];

const result = computed(() =>
  calculateCompoundInterest({
    initialInvestment: initialInvestment.value,
    monthlyContribution: monthlyContribution.value,
    annualInterestRate: annualInterestRate.value,
    years: years.value,
    compoundFrequency: compoundFrequency.value,
  }),
);

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(val);

const pagination = {
  pageSize: 10,
};

const columns = [
  { title: 'Year', key: 'year', width: 80 },
  { title: 'Starting Balance', key: 'startingBalance', render: (row: any) => formatCurrency(row.startingBalance) },
  { title: 'Annual Contribution', key: 'contributions', render: (row: any) => formatCurrency(row.contributions) },
  { title: 'Interest Earned', key: 'interestEarned', render: (row: any) => formatCurrency(row.interestEarned) },
  { title: 'Total Interest', key: 'totalInterest', render: (row: any) => formatCurrency(row.totalInterest) },
  { title: 'Ending Balance', key: 'endBalance', render: (row: any) => formatCurrency(row.endBalance) },
];
</script>

<template>
  <div style="max-width: 1000px; margin: 0 auto;">
    <n-grid :cols="24" :x-gap="16" :y-gap="16">
      <n-form-item-gi :span="24" :md="12" label="Initial Investment ($)">
        <n-input-number v-model:value="initialInvestment" :min="0" :step="1000" style="width: 100%" />
      </n-form-item-gi>

      <n-form-item-gi :span="24" :md="12" label="Monthly Contribution ($)">
        <n-input-number v-model:value="monthlyContribution" :min="0" :step="50" style="width: 100%" />
      </n-form-item-gi>

      <n-form-item-gi :span="24" :md="8" label="Estimated Annual Return (%)">
        <n-input-number v-model:value="annualInterestRate" :min="0" :max="100" :step="0.5" style="width: 100%" />
      </n-form-item-gi>

      <n-form-item-gi :span="24" :md="8" label="Investment Horizon (Years)">
        <n-input-number v-model:value="years" :min="1" :max="50" :step="1" style="width: 100%" />
      </n-form-item-gi>

      <n-form-item-gi :span="24" :md="8" label="Compound Frequency">
        <n-select v-model:value="compoundFrequency" :options="frequencyOptions" style="width: 100%" />
      </n-form-item-gi>
    </n-grid>

    <div my-6>
      <n-grid :cols="24" :x-gap="12" :y-gap="12">
        <n-gi :span="24" :md="6">
          <c-card>
            <n-statistic label="Final Balance" :value="formatCurrency(result.finalBalance)" />
          </c-card>
        </n-gi>
        <n-gi :span="24" :md="6">
          <c-card>
            <n-statistic label="Initial Principal" :value="formatCurrency(result.totalPrincipal)" />
          </c-card>
        </n-gi>
        <n-gi :span="24" :md="6">
          <c-card>
            <n-statistic label="Total Contributions" :value="formatCurrency(result.totalContributions)" />
          </c-card>
        </n-gi>
        <n-gi :span="24" :md="6">
          <c-card>
            <n-statistic label="Total Interest Earned" :value="formatCurrency(result.totalInterestEarned)" />
          </c-card>
        </n-gi>
      </n-grid>
    </div>

    <c-card title="Annual Growth Schedule">
      <n-data-table
        :columns="columns"
        :data="result.yearlyBreakdown"
        :pagination="pagination"
        :bordered="false"
      />
    </c-card>
  </div>
</template>
