export interface NicheBenchmark {
  id: string;
  name: string;
  typicalCpc: number;
  typicalCtr: number;
  typicalRpm: number;
}

export const AD_NICHES: NicheBenchmark[] = [
  { id: 'custom', name: 'Custom / Other', typicalCpc: 1.50, typicalCtr: 2.0, typicalRpm: 15.00 },
  { id: 'finance', name: 'Finance & Banking', typicalCpc: 4.80, typicalCtr: 2.2, typicalRpm: 35.00 },
  { id: 'insurance', name: 'Insurance & Claims', typicalCpc: 18.50, typicalCtr: 2.0, typicalRpm: 80.00 },
  { id: 'mortgage', name: 'Mortgage & Real Estate', typicalCpc: 7.20, typicalCtr: 2.1, typicalRpm: 45.00 },
  { id: 'tech', name: 'Technology & Software', typicalCpc: 2.50, typicalCtr: 1.8, typicalRpm: 22.00 },
  { id: 'crypto', name: 'Crypto & Forex', typicalCpc: 3.80, typicalCtr: 2.4, typicalRpm: 32.00 },
  { id: 'legal', name: 'Law & Legal Services', typicalCpc: 9.50, typicalCtr: 1.9, typicalRpm: 55.00 },
  { id: 'health', name: 'Health & Fitness', typicalCpc: 1.90, typicalCtr: 2.3, typicalRpm: 18.00 },
  { id: 'education', name: 'Online Education & Degrees', typicalCpc: 3.20, typicalCtr: 2.0, typicalRpm: 26.00 },
  { id: 'travel', name: 'Travel & Hospitality', typicalCpc: 1.20, typicalCtr: 2.5, typicalRpm: 12.00 },
];

export type CalculationMode = 'cpc' | 'rpm';

export interface AdSenseInput {
  dailyPageviews: number;
  calculationMode: CalculationMode;
  ctrPercent: number; // Click-Through Rate %
  cpc: number; // Cost Per Click $
  rpm: number; // Revenue Per Mille (1000 views) $
  nicheId: string;
}

export interface AdSenseResult {
  dailyClicks: number;
  dailyRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  effectiveRpm: number;
  effectiveCpc: number;
}

export function calculateAdSenseRevenue(input: AdSenseInput): AdSenseResult {
  const dailyPageviews = Math.max(0, Number(input.dailyPageviews) || 0);
  const ctrPercent = Math.max(0, Number(input.ctrPercent) || 0);
  const cpc = Math.max(0, Number(input.cpc) || 0);
  const rpm = Math.max(0, Number(input.rpm) || 0);

  let dailyRevenue = 0;
  let dailyClicks = 0;
  let effectiveRpm = 0;
  let effectiveCpc = 0;

  if (input.calculationMode === 'cpc') {
    dailyClicks = (dailyPageviews * (ctrPercent / 100));
    dailyRevenue = dailyClicks * cpc;
    effectiveCpc = cpc;
    effectiveRpm = dailyPageviews > 0 ? (dailyRevenue / dailyPageviews) * 1000 : 0;
  } else {
    // RPM mode
    dailyRevenue = (dailyPageviews / 1000) * rpm;
    effectiveRpm = rpm;
    dailyClicks = (dailyPageviews * (ctrPercent / 100));
    effectiveCpc = dailyClicks > 0 ? dailyRevenue / dailyClicks : 0;
  }

  const monthlyRevenue = dailyRevenue * 30.4167; // average days in a month
  const yearlyRevenue = dailyRevenue * 365;

  return {
    dailyClicks: Math.round(dailyClicks),
    dailyRevenue: Number(dailyRevenue.toFixed(2)),
    monthlyRevenue: Number(monthlyRevenue.toFixed(2)),
    yearlyRevenue: Number(yearlyRevenue.toFixed(2)),
    effectiveRpm: Number(effectiveRpm.toFixed(2)),
    effectiveCpc: Number(effectiveCpc.toFixed(2)),
  };
}
