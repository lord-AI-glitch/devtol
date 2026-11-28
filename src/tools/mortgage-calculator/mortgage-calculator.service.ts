export interface MortgageInput {
  homeValue: number
  downPayment: number
  interestRate: number // annual %
  loanTermYears: number // years
  propertyTaxRate: number // annual %
  homeInsuranceYearly: number // yearly $
  pmiRate?: number // annual %
  hoaMonthly?: number // monthly $
}

export interface AmortizationPeriod {
  month: number
  payment: number
  principal: number
  interest: number
  totalInterest: number
  balance: number
}

export interface MortgageResult {
  loanAmount: number
  monthlyPrincipalAndInterest: number
  monthlyPropertyTax: number
  monthlyInsurance: number
  monthlyPMI: number
  monthlyHOA: number
  totalMonthlyPayment: number
  totalInterest: number
  totalPayment: number
  amortizationSchedule: AmortizationPeriod[]
}

export function calculateMortgage(input: MortgageInput): MortgageResult {
  const homeValue = Math.max(0, Number(input.homeValue) || 0);
  const downPayment = Math.min(homeValue, Math.max(0, Number(input.downPayment) || 0));
  const loanAmount = Math.max(0, homeValue - downPayment);
  const annualInterestRate = Math.max(0, Number(input.interestRate) || 0) / 100;
  const loanTermYears = Math.max(1, Number(input.loanTermYears) || 30);
  const totalMonths = Math.round(loanTermYears * 12);
  const monthlyInterestRate = annualInterestRate / 12;

  let monthlyPrincipalAndInterest = 0;
  if (loanAmount > 0) {
    if (monthlyInterestRate > 0) {
      const compoundFactor = (1 + monthlyInterestRate) ** totalMonths;
      monthlyPrincipalAndInterest = loanAmount * (monthlyInterestRate * compoundFactor) / (compoundFactor - 1);
    }
    else {
      monthlyPrincipalAndInterest = loanAmount / totalMonths;
    }
  }

  const monthlyPropertyTax = ((Number(input.propertyTaxRate) || 0) / 100 * homeValue) / 12;
  const monthlyInsurance = Math.max(0, Number(input.homeInsuranceYearly) || 0) / 12;
  const isPmiApplicable = homeValue > 0 && (downPayment / homeValue) < 0.20 && (Number(input.pmiRate) || 0) > 0;
  const monthlyPMI = isPmiApplicable ? (loanAmount * ((Number(input.pmiRate) || 0) / 100)) / 12 : 0;
  const monthlyHOA = Math.max(0, Number(input.hoaMonthly) || 0);

  const totalMonthlyPayment = monthlyPrincipalAndInterest + monthlyPropertyTax + monthlyInsurance + monthlyPMI + monthlyHOA;

  const amortizationSchedule: AmortizationPeriod[] = [];
  let remainingBalance = loanAmount;
  let accumulatedInterest = 0;

  for (let month = 1; month <= totalMonths; month++) {
    if (remainingBalance <= 0) {
      break;
    }

    const interestForMonth = remainingBalance * monthlyInterestRate;
    let principalForMonth = monthlyPrincipalAndInterest - interestForMonth;

    if (principalForMonth > remainingBalance || month === totalMonths) {
      principalForMonth = remainingBalance;
    }

    const actualPayment = principalForMonth + interestForMonth;
    accumulatedInterest += interestForMonth;
    remainingBalance = Math.max(0, remainingBalance - principalForMonth);

    amortizationSchedule.push({
      month,
      payment: Number(actualPayment.toFixed(2)),
      principal: Number(principalForMonth.toFixed(2)),
      interest: Number(interestForMonth.toFixed(2)),
      totalInterest: Number(accumulatedInterest.toFixed(2)),
      balance: Number(remainingBalance.toFixed(2)),
    });
  }

  return {
    loanAmount: Number(loanAmount.toFixed(2)),
    monthlyPrincipalAndInterest: Number(monthlyPrincipalAndInterest.toFixed(2)),
    monthlyPropertyTax: Number(monthlyPropertyTax.toFixed(2)),
    monthlyInsurance: Number(monthlyInsurance.toFixed(2)),
    monthlyPMI: Number(monthlyPMI.toFixed(2)),
    monthlyHOA: Number(monthlyHOA.toFixed(2)),
    totalMonthlyPayment: Number(totalMonthlyPayment.toFixed(2)),
    totalInterest: Number(accumulatedInterest.toFixed(2)),
    totalPayment: Number((loanAmount + accumulatedInterest).toFixed(2)),
    amortizationSchedule,
  };
}
