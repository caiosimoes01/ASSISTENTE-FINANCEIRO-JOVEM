import React from 'react';

/**
 * Hp12cTab - Mock do Simulador Financeiro HP 12C
 */
export const Hp12cTab: React.FC = () => {
  return (
    <div className="p-8 space-y-6">
      <div className="bg-youfing-secondary border border-youfing-light rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-accent mb-2">
          🧮 Simulador Financeiro HP 12C
        </h2>
        <p className="text-youfing-secondary text-sm">
          [Mock] Simulador Financeiro HP 12C
        </p>
        <p className="text-youfing-tertiary text-xs mt-4">
          Cálculos avançados de fluxo de caixa, TIR, VPL e análise financeira profissional
        </p>
      </div>
    </div>
  );
};
