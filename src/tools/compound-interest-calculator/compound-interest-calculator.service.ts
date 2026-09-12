export type CompoundFrequency = 'daily' | 'monthly' | 'quarterly' | 'semiannually' | 'annually';

export interface CompoundInterestInput {
  initialInvestment: number;
  monthlyContribution: number;
  annualInterestRate: number; // in percent, e.g. 7 for 7%
  years: number;
  compoundFrequency: CompoundFrequency;
}

export interface YearlyBreakdown {
  year: number;
  startingBalance: number;
  contributions: number;
  interestEarned: number;
  totalInterest: number;
  endBalance: number;
}

export interface CompoundInterestResult {
  finalBalance: number;
  totalPrincipal: number;
  totalContributions: number;
  totalInterestEarned: number;
  yearlyBreakdown: YearlyBreakdown[];
}

export function getCompoundPeriodsPerYear(freq: CompoundFrequency): number {
  switch (freq) {
    case 'daily': return 365;
    case 'monthly': return 12;
    case 'quarterly': return 4;
    case 'semiannually': return 2;
    case 'annually': return 1;
    default: return 12;
  }
}

export function calculateCompoundInterest(input: CompoundInterestInput): CompoundInterestResult {
  const principal = Math.max(0, Number(input.initialInvestment) || 0);
  const monthlyDeposit = Math.max(0, Number(input.monthlyContribution) || 0);
  const annualRate = Math.max(0, Number(input.annualInterestRate) || 0) / 100;
  const totalYears = Math.max(1, Number(input.years) || 1);
  const periodsPerYear = getCompoundPeriodsPerYear(input.compoundFrequency);

  let currentBalance = principal;
  let accumulatedContributions = 0;
  let accumulatedInterest = 0;
  const yearlyBreakdown: YearlyBreakdown[] = [];

  const ratePerPeriod = annualRate / periodsPerYear;
  const daysPerPeriod = 365 / periodsPerYear;

  for (let year = 1; year <= totalYears; year++) {
    const yearStartBalance = currentBalance;
    let yearContributions = 0;
    let yearInterest = 0;

    // Simulate month by month
    for (let month = 1; month <= 12; month++) {
      currentBalance += monthlyDeposit;
      yearContributions += monthlyDeposit;
      accumulatedContributions += monthlyDeposit;

      // Compound interest according to frequency
      if (periodsPerYear === 12) {
        // Monthly compounding
        const interest = currentBalance * ratePerPeriod;
        currentBalance += interest;
        yearInterest += interest;
        accumulatedInterest += interest;
      } else if (periodsPerYear === 4 && month % 3 === 0) {
        // Quarterly
        const interest = currentBalance * ratePerPeriod;
        currentBalance += interest;
        yearInterest += interest;
        accumulatedInterest += interest;
      } else if (periodsPerYear === 2 && month % 6 === 0) {
        // Semiannually
        const interest = currentBalance * ratePerPeriod;
        currentBalance += interest;
        yearInterest += interest;
        accumulatedInterest += interest;
      } else if (periodsPerYear === 1 && month === 12) {
        // Annually
        const interest = currentBalance * ratePerPeriod;
        currentBalance += interest;
        yearInterest += interest;
        accumulatedInterest += interest;
      } else if (periodsPerYear === 365) {
        // Daily: approximate 30.416 days per month
        const daysInMonth = (month === 2) ? 28 : (month === 4 || month === 6 || month === 9 || month === 11 ? 30 : 31);
        const monthlyFactor = Math.pow(1 + ratePerPeriod, daysInMonth);
        const newBal = currentBalance * monthlyFactor;
        const interest = newBal - currentBalance;
        currentBalance = newBal;
        yearInterest += interest;
        accumulatedInterest += interest;
      }
    }

    yearlyBreakdown.push({
      year,
      startingBalance: Number(yearStartBalance.toFixed(2)),
      contributions: Number(yearContributions.toFixed(2)),
      interestEarned: Number(yearInterest.toFixed(2)),
      totalInterest: Number(accumulatedInterest.toFixed(2)),
      endBalance: Number(currentBalance.toFixed(2)),
    });
  }

  return {
    finalBalance: Number(currentBalance.toFixed(2)),
    totalPrincipal: Number(principal.toFixed(2)),
    totalContributions: Number(accumulatedContributions.toFixed(2)),
    totalInterestEarned: Number(accumulatedInterest.toFixed(2)),
    yearlyBreakdown,
  };
}
