import Decimal from 'decimal.js';

/**
 * Calculates the monthly equivalent rate from an annual rate.
 * Uses compound interest regime.
 * Formula: i_monthly = (1 + i_annual)^(1/12) - 1
 * 
 * @param annualRate Annual rate in decimal fraction (e.g. 0.105 for 10.5%)
 * @returns Monthly rate in decimal fraction
 */
export function calculateEquivalentMonthlyRate(annualRate: Decimal | number): Decimal {
  const annual = new Decimal(annualRate);
  
  if (annual.isZero()) {
    return new Decimal(0);
  }
  
  // (1 + annualRate)^(1/12) - 1
  return annual
    .add(1)
    .pow(new Decimal(1).div(12))
    .sub(1);
}
