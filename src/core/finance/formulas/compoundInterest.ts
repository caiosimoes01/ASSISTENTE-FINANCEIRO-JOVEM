import Decimal from 'decimal.js';

/**
 * Calculates the future value of compound interest for a single principal.
 * Formula: FV = P * (1 + i)^n
 * 
 * @param principal Initial capital in decimal
 * @param rate Rate per period in decimal
 * @param periods Number of periods (months/years)
 * @returns Future value amount in Decimal
 */
export function calculateCompoundInterest(
  principal: Decimal | number,
  rate: Decimal | number,
  periods: number
): Decimal {
  const p = new Decimal(principal);
  const r = new Decimal(rate);
  const n = new Decimal(periods);
  
  if (p.isZero() || n.isZero()) {
    return p;
  }
  
  // P * (1 + r)^n
  return p.mul(r.add(1).pow(n));
}
