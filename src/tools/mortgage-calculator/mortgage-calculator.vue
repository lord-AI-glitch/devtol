<script setup lang="ts">
import { computed } from 'vue';
import { useStorage } from '@vueuse/core';
import { calculateMortgage } from './mortgage-calculator.service';

const homeValue = useStorage('mortgage-calc:homeValue', 350000);
const downPayment = useStorage('mortgage-calc:downPayment', 70000);
const interestRate = useStorage('mortgage-calc:interestRate', 6.5);
const loanTermYears = useStorage('mortgage-calc:loanTermYears', 30);
const propertyTaxRate = useStorage('mortgage-calc:propertyTaxRate', 1.2);
const homeInsuranceYearly = useStorage('mortgage-calc:homeInsuranceYearly', 1200);
const pmiRate = useStorage('mortgage-calc:pmiRate', 0.5);
const hoaMonthly = useStorage('mortgage-calc:hoaMonthly', 0);

const termOptions = [
  { label: '10 Years', value: 10 },
  { label: '15 Years', value: 15 },
  { label: '20 Years', value: 20 },
  { label: '30 Years', value: 30 },
];

const result = computed(() =>
  calculateMortgage({
    homeValue: homeValue.value,
    downPayment: downPayment.value,
    interestRate: interestRate.value,
    loanTermYears: loanTermYears.value,
    propertyTaxRate: propertyTaxRate.value,
    homeInsuranceYearly: homeInsuranceYearly.value,
    pmiRate: pmiRate.value,
    hoaMonthly: hoaMonthly.value,
  }),
);

function formatCurrency(val: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(val);
}

function formatNumber(val: number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(val);
}

const pagination = {
  pageSize: 12,
};

const columns = [
  { title: 'Month', key: 'month', width: 80 },
  { title: 'Payment', key: 'payment', render: (row: any) => formatCurrency(row.payment) },
  { title: 'Principal', key: 'principal', render: (row: any) => formatCurrency(row.principal) },
  { title: 'Interest', key: 'interest', render: (row: any) => formatCurrency(row.interest) },
  { title: 'Total Interest', key: 'totalInterest', render: (row: any) => formatCurrency(row.totalInterest) },
  { title: 'Balance', key: 'balance', render: (row: any) => formatCurrency(row.balance) },
];
</script>

<template>
  <div style="max-width: 1000px; margin: 0 auto;">
    <n-grid :cols="24" :x-gap="16" :y-gap="16">
      <n-form-item-gi :span="24" :md="12" label="Home Value ($)">
        <n-input-number v-model:value="homeValue" :min="1000" :step="5000" style="width: 100%" />
      </n-form-item-gi>

      <n-form-item-gi :span="24" :md="12" label="Down Payment ($)">
        <n-input-number v-model:value="downPayment" :min="0" :step="1000" style="width: 100%" />
      </n-form-item-gi>

      <n-form-item-gi :span="24" :md="12" label="Annual Interest Rate (%)">
        <n-input-number v-model:value="interestRate" :min="0" :max="30" :step="0.1" style="width: 100%" />
      </n-form-item-gi>

      <n-form-item-gi :span="24" :md="12" label="Loan Term">
        <n-select v-model:value="loanTermYears" :options="termOptions" style="width: 100%" />
      </n-form-item-gi>

      <n-form-item-gi :span="24" :md="12" label="Property Tax Rate (%/year)">
        <n-input-number v-model:value="propertyTaxRate" :min="0" :step="0.1" style="width: 100%" />
      </n-form-item-gi>

      <n-form-item-gi :span="24" :md="12" label="Home Insurance ($/year)">
        <n-input-number v-model:value="homeInsuranceYearly" :min="0" :step="50" style="width: 100%" />
      </n-form-item-gi>

      <n-form-item-gi :span="24" :md="12" label="PMI Rate (%/year, if down < 20%)">
        <n-input-number v-model:value="pmiRate" :min="0" :step="0.1" style="width: 100%" />
      </n-form-item-gi>

      <n-form-item-gi :span="24" :md="12" label="HOA Fees ($/month)">
        <n-input-number v-model:value="hoaMonthly" :min="0" :step="10" style="width: 100%" />
      </n-form-item-gi>
    </n-grid>

    <div my-6>
      <n-grid :cols="24" :x-gap="12" :y-gap="12">
        <n-gi :span="24" :md="6">
          <c-card>
            <n-statistic label="Monthly Payment" :value="formatCurrency(result.totalMonthlyPayment)" />
          </c-card>
        </n-gi>
        <n-gi :span="24" :md="6">
          <c-card>
            <n-statistic label="Loan Amount" :value="formatCurrency(result.loanAmount)" />
          </c-card>
        </n-gi>
        <n-gi :span="24" :md="6">
          <c-card>
            <n-statistic label="Total Interest" :value="formatCurrency(result.totalInterest)" />
          </c-card>
        </n-gi>
        <n-gi :span="24" :md="6">
          <c-card>
            <n-statistic label="Total Cost" :value="formatCurrency(result.totalPayment)" />
          </c-card>
        </n-gi>
      </n-grid>
    </div>

    <c-card title="Monthly Payment Breakdown" mb-6>
      <n-table :bordered="true" :single-line="false">
        <thead>
          <tr>
            <th>Component</th>
            <th>Monthly Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Principal & Interest</td>
            <td font-semibold>
              {{ formatCurrency(result.monthlyPrincipalAndInterest) }}
            </td>
          </tr>
          <tr>
            <td>Property Tax</td>
            <td>{{ formatCurrency(result.monthlyPropertyTax) }}</td>
          </tr>
          <tr>
            <td>Home Insurance</td>
            <td>{{ formatCurrency(result.monthlyInsurance) }}</td>
          </tr>
          <tr v-if="result.monthlyPMI > 0">
            <td>PMI (Private Mortgage Insurance)</td>
            <td>{{ formatCurrency(result.monthlyPMI) }}</td>
          </tr>
          <tr v-if="result.monthlyHOA > 0">
            <td>HOA Fees</td>
            <td>{{ formatCurrency(result.monthlyHOA) }}</td>
          </tr>
        </tbody>
      </n-table>
    </c-card>

    <c-card title="Amortization Schedule">
      <n-data-table
        :columns="columns"
        :data="result.amortizationSchedule"
        :pagination="pagination"
        :bordered="false"
      />
    </c-card>
  </div>
</template>
