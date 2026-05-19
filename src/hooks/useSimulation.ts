import { useState, useEffect, useMemo } from 'react';
import { fetchCDI, fetchIPCA } from '@services/financeApi';
import { CompoundInterestEngine } from '@core/finance/engine/CompoundInterestEngine';
import type { SimulationInputs, SimulationOutputs } from '../types/financeiro';

export function useSimulation() {
  const [valorInicial, setValorInicial] = useState<number>(5000);
  const [aporteMensal, setAporteMensal] = useState<number>(300);
  const [prazoAnos, setPrazoAnos] = useState<number>(10);
  const [taxaAnual, setTaxaAnual] = useState<number>(10.5);
  const [inflacaoAnual, setInflacaoAnual] = useState<number>(4.5);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;

    async function loadRates() {
      try {
        setIsLoading(true);
        const [cdi, ipca] = await Promise.all([fetchCDI(), fetchIPCA()]);
        
        if (active) {
          // fetchCDI and fetchIPCA return rates like 10.50 and 4.50 respectively.
          setTaxaAnual(cdi);
          setInflacaoAnual(ipca);
        }
      } catch (error) {
        console.error("Failed to load real market rates:", error);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadRates();

    return () => {
      active = false;
    };
  }, []);

  const inputs: SimulationInputs = useMemo(() => ({
    valorInicial,
    aporteMensal,
    prazoAnos,
    taxaAnual,
    inflacaoAnual
  }), [valorInicial, aporteMensal, prazoAnos, taxaAnual, inflacaoAnual]);

  const outputs: SimulationOutputs = useMemo(() => {
    return CompoundInterestEngine.run(inputs);
  }, [inputs]);

  return {
    inputs,
    setValorInicial,
    setAporteMensal,
    setPrazoAnos,
    setTaxaAnual,
    setInflacaoAnual,
    outputs,
    isLoading,
  };
}
export type UseSimulationReturn = ReturnType<typeof useSimulation>;
