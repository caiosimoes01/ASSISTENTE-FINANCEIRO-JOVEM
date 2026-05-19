import Decimal from 'decimal.js';
import { calculateCompoundInterest } from './compoundInterest';

/**
 * Calculates the future value with recurring contributions.
 * Formula: FV = P*(1+i)^n + PMT * [((1+i)^n - 1) / i]
 * 
 * @param principal Initial capital (P) in decimal
 * @param monthlyContribution Monthly recurring aporte (PMT) in decimal
 * @param monthlyRate Monthly rate (i) in decimal fraction
 * @param periods Number of months (n)
 * @returns Future value amount in Decimal
 */
export function calculateFutureValue(
  principal: Decimal | number,
  monthlyContribution: Decimal | number,
  monthlyRate: Decimal | number,
  periods: number
): Decimal {
  const p = new Decimal(principal);
  const pmt = new Decimal(monthlyContribution);
  const r = new Decimal(monthlyRate);
  
  const fvPrincipal = calculateCompoundInterest(p, r, periods);
  
  if (pmt.isZero() || periods === 0) {
    return fvPrincipal;
  }
  
  if (r.isZero()) {
    return fvPrincipal.add(pmt.mul(periods));
  }
  
  // PMT * [((1+r)^n - 1) / r]
  const factor = r.add(1).pow(periods).sub(1).div(r);
  const fvContribution = pmt.mul(factor);
  
  return fvPrincipal.add(fvContribution);
}
