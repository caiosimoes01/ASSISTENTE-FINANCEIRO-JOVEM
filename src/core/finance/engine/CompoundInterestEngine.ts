import Decimal from 'decimal.js';
import { calculateEquivalentMonthlyRate } from '../formulas/equivalentRates';
import type { SimulationInputs, SimulationOutputs, SnapshotMensal } from '../../../types/financeiro';

export class CompoundInterestEngine {
  /**
   * Generates a complete month-by-month financial projection.
   * Rates are provided as percentages (e.g. 10.5 for 10.5%) and converted to fractions in the engine.
   */
  static run(inputs: SimulationInputs): SimulationOutputs {
    const pv = new Decimal(inputs.valorInicial);
    const pmt = new Decimal(inputs.aporteMensal);
    const years = inputs.prazoAnos;
    const months = Math.round(years * 12);
    
    // Convert percentage rates to decimal fractions
    const annualRateFraction = new Decimal(inputs.taxaAnual).div(100);
    const annualInflationFraction = new Decimal(inputs.inflacaoAnual).div(100);
    
    
    // Get equivalent monthly rate
    const monthlyRate = calculateEquivalentMonthlyRate(annualRateFraction);
    
    const tabelaMesAMes: SnapshotMensal[] = [];
    let currentBalance = new Decimal(pv);
    
    for (let m = 0; m <= months; m++) {
      const capitalInvested = pv.add(pmt.mul(m));
      const jurosAccumulated = Decimal.max(0, currentBalance.sub(capitalInvested));
      
      tabelaMesAMes.push({
        mes: m,
        capital: Math.round(capitalInvested.toNumber()),
        juros: Math.round(jurosAccumulated.toNumber()),
        total: Math.round(currentBalance.toNumber()),
      });
      
      if (m < months) {
        // Balance compounded by monthly interest, then monthly aporte added
        currentBalance = currentBalance.mul(monthlyRate.add(1)).add(pmt);
      }
    }
    
    const patrimonioLiquido = currentBalance;
    const totalInvestido = pv.add(pmt.mul(months));
    const totalJuros = Decimal.max(0, patrimonioLiquido.sub(totalInvestido));
    
    // Patrimonio Real is Patrimonio Liquido discounted by cumulative inflation: (1 + inflation)^years
    // Or (1 + monthlyInflation)^months
    const inflationFactor = annualInflationFraction.add(1).pow(years);
    const patrimonioReal = inflationFactor.isZero() 
      ? patrimonioLiquido 
      : patrimonioLiquido.div(inflationFactor);
      
    return {
      patrimonioLiquido: Math.round(patrimonioLiquido.toNumber()),
      patrimonioReal: Math.round(patrimonioReal.toNumber()),
      totalInvestido: Math.round(totalInvestido.toNumber()),
      totalJuros: Math.round(totalJuros.toNumber()),
      tabelaMesAMes,
    };
  }
}
