import { describe, expect, it } from 'vitest';
import { calculateAdSenseRevenue } from './adsense-revenue-calculator.service';

describe('adsense-revenue-calculator service', () => {
  it('calculates revenue based on CPC & CTR correctly', () => {
    const result = calculateAdSenseRevenue({
      dailyPageviews: 10000,
      calculationMode: 'cpc',
      ctrPercent: 2.5,
      cpc: 3.0,
      rpm: 0,
      nicheId: 'custom',
    });

    // 10,000 * 2.5% = 250 clicks
    expect(result.dailyClicks).toBe(250);
    // 250 * 3.00 = 750 daily
    expect(result.dailyRevenue).toBe(750);
    // RPM = (750 / 10000) * 1000 = 75
    expect(result.effectiveRpm).toBe(75);
    expect(result.yearlyRevenue).toBe(750 * 365);
  });

  it('calculates revenue based on RPM correctly', () => {
    const result = calculateAdSenseRevenue({
      dailyPageviews: 50000,
      calculationMode: 'rpm',
      ctrPercent: 2.0,
      cpc: 0,
      rpm: 20,
      nicheId: 'tech',
    });

    // 50,000 / 1000 * 20 = 1,000 daily
    expect(result.dailyRevenue).toBe(1000);
    expect(result.effectiveRpm).toBe(20);
    expect(result.dailyClicks).toBe(1000);
    expect(result.effectiveCpc).toBe(1.0);
  });
});
