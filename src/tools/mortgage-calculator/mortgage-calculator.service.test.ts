import { describe, expect, it } from 'vitest';
import { calculateMortgage } from './mortgage-calculator.service';

describe('mortgage-calculator service', () => {
  it('calculates standard 30-year fixed mortgage correctly', () => {
    const result = calculateMortgage({
      homeValue: 400000,
      downPayment: 80000,
      interestRate: 6,
      loanTermYears: 30,
      propertyTaxRate: 1.2,
      homeInsuranceYearly: 1200,
      pmiRate: 0.5,
      hoaMonthly: 0,
    });

    expect(result.loanAmount).toBe(320000);
    expect(result.monthlyPrincipalAndInterest).toBeCloseTo(1918.56, 1);
    expect(result.monthlyPropertyTax).toBe(400);
    expect(result.monthlyInsurance).toBe(100);
    expect(result.monthlyPMI).toBe(0);
    expect(result.totalMonthlyPayment).toBeCloseTo(2418.56, 1);
    expect(result.amortizationSchedule.length).toBe(360);
    expect(result.amortizationSchedule[result.amortizationSchedule.length - 1].balance).toBe(0);
  });

  it('includes PMI when down payment is less than 20%', () => {
    const result = calculateMortgage({
      homeValue: 500000,
      downPayment: 50000,
      interestRate: 7,
      loanTermYears: 30,
      propertyTaxRate: 1.0,
      homeInsuranceYearly: 1200,
      pmiRate: 0.8,
      hoaMonthly: 50,
    });

    expect(result.loanAmount).toBe(450000);
    expect(result.monthlyPMI).toBeCloseTo((450000 * 0.008) / 12, 1);
  });
});
