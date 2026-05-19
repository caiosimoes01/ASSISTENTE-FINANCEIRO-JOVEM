import { describe, it, expect } from 'vitest';
import Decimal from 'decimal.js';
import {
  calculateEquivalentMonthlyRate,
  calculateCompoundInterest,
  calculateFutureValue,
  calculateRealRate,
  CompoundInterestEngine
} from '../../../src/core/finance';

describe('Financial Math Core', () => {
  describe('calculateEquivalentMonthlyRate', () => {
    it('returns zero for zero annual rate', () => {
      const annualRate = 0;
      const monthlyRate = calculateEquivalentMonthlyRate(annualRate);
      expect(monthlyRate.toNumber()).toBe(0);
    });

    it('accurately calculates monthly equivalent of 12.6825% (should be exactly 1%)', () => {
      // (1 + 0.12682503013)^1/12 - 1 = 0.01 (approx)
      const annualRate = 0.12682503013;
      const monthlyRate = calculateEquivalentMonthlyRate(annualRate);
      expect(monthlyRate.toNumber()).toBeCloseTo(0.01, 6);
    });

    it('accurately calculates monthly equivalent for 10.5% (CDI)', () => {
      // (1 + 0.105)^1/12 - 1 = 0.008355 (approx 0.835% per month)
      const annualRate = 0.105;
      const monthlyRate = calculateEquivalentMonthlyRate(annualRate);
      expect(monthlyRate.toNumber()).toBeCloseTo(0.008355, 6);
    });
  });

  describe('calculateCompoundInterest', () => {
    it('returns the same principal if rate or period is zero', () => {
      expect(calculateCompoundInterest(1000, 0.01, 0).toNumber()).toBe(1000);
      expect(calculateCompoundInterest(1000, 0, 12).toNumber()).toBe(1000);
    });

    it('accurately calculates compound interest on 1000 at 1% for 12 periods', () => {
      // 1000 * (1.01)^12 = 1126.825
      const fv = calculateCompoundInterest(1000, 0.01, 12);
      expect(fv.toNumber()).toBeCloseTo(1126.83, 2);
    });
  });

  describe('calculateFutureValue', () => {
    it('returns simple compound interest if monthly contribution is zero', () => {
      const fv = calculateFutureValue(1000, 0, 0.01, 12);
      const expected = calculateCompoundInterest(1000, 0.01, 12);
      expect(fv.toNumber()).toBe(expected.toNumber());
    });

    it('returns simple sum if monthly rate is zero', () => {
      const fv = calculateFutureValue(1000, 100, 0, 12);
      expect(fv.toNumber()).toBe(2200); // 1000 + 100 * 12
    });

    it('accurately calculates future value with recurrent contributions (PV=1000, PMT=100, i=1%, n=12)', () => {
      // 1000 * 1.01^12 + 100 * ((1.01^12 - 1) / 0.01)
      // = 1126.825 + 100 * 12.6825 = 1126.825 + 1268.25 = 2395.075
      const fv = calculateFutureValue(1000, 100, 0.01, 12);
      expect(fv.toNumber()).toBeCloseTo(2395.08, 2);
    });
  });

  describe('calculateRealRate (Fisher Equation)', () => {
    it('returns nominal rate directly if inflation is zero', () => {
      expect(calculateRealRate(0.105, 0).toNumber()).toBe(0.105);
    });

    it('accurately discounts nominal rate by inflation', () => {
      // nominal 10.5% (0.105), inflation 4.5% (0.045)
      // real = (0.105 - 0.045) / 1.045 = 0.06 / 1.045 = 0.057416
      const real = calculateRealRate(0.105, 0.045);
      expect(real.toNumber()).toBeCloseTo(0.057416, 6);
    });
  });

  describe('CompoundInterestEngine Projections', () => {
    it('runs projection correctly and produces expected output counts and values', () => {
      const outputs = CompoundInterestEngine.run({
        valorInicial: 5000,
        aporteMensal: 300,
        prazoAnos: 10,
        taxaAnual: 10.5,
        inflacaoAnual: 4.5
      });

      expect(outputs.tabelaMesAMes.length).toBe(121); // Month 0 to Month 120
      expect(outputs.totalInvestido).toBe(41000);    // 5000 + 300 * 120
      expect(outputs.patrimonioLiquido).toBeGreaterThan(outputs.totalInvestido);
      expect(outputs.patrimonioReal).toBeGreaterThan(outputs.totalInvestido);
      expect(outputs.patrimonioReal).toBeLessThan(outputs.patrimonioLiquido); // Real rate discounts inflation, so real total is smaller
      expect(outputs.totalJuros).toBe(outputs.patrimonioLiquido - outputs.totalInvestido);
    });
  });
});
