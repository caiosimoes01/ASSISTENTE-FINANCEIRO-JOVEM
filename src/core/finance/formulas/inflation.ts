import Decimal from 'decimal.js';

/**
 * Calculates the real rate of interest discounted by inflation using the Fisher equation.
 * Formula: (1 + r_real) = (1 + i_nominal) / (1 + i_inflation)
 *          r_real = (i_nominal - i_inflation) / (1 + i_inflation)
 * 
 * @param nominalRate Nominal annual rate in decimal (e.g. 0.105 for 10.5%)
 * @param inflationRate Inflation annual rate in decimal (e.g. 0.045 for 4.5%)
 * @returns Real rate in decimal
 */
export function calculateRealRate(
  nominalRate: Decimal | number,
  inflationRate: Decimal | number
): Decimal {
  const nom = new Decimal(nominalRate);
  const inf = new Decimal(inflationRate);
  
  if (inf.isZero()) {
    return nom;
  }
  
  // (nom - inf) / (1 + inf)
  return nom.sub(inf).div(inf.add(1));
}
