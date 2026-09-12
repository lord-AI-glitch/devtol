import { describe, expect, it } from 'vitest';
import { calculateCompoundInterest } from './compound-interest-calculator.service';

describe('compound-interest-calculator service', () => {
  it('calculates compound interest without monthly deposits correctly', () => {
    const result = calculateCompoundInterest({
      initialInvestment: 10000,
      monthlyContribution: 0,
      annualInterestRate: 10,
      years: 5,
      compoundFrequency: 'annually',
    });

    // 10,000 * (1.1)^5 = 16,105.10
    expect(result.finalBalance).toBeCloseTo(16105.10, 1);
    expect(result.totalPrincipal).toBe(10000);
    expect(result.totalContributions).toBe(0);
    expect(result.totalInterestEarned).toBeCloseTo(6105.10, 1);
    expect(result.yearlyBreakdown.length).toBe(5);
  });

  it('calculates compound interest with monthly contributions', () => {
    const result = calculateCompoundInterest({
      initialInvestment: 5000,
      monthlyContribution: 200,
      annualInterestRate: 7,
      years: 10,
      compoundFrequency: 'monthly',
    });

    expect(result.finalBalance).toBeGreaterThan(35000);
    expect(result.totalContributions).toBe(24000);
    expect(result.yearlyBreakdown.length).toBe(10);
  });
});
