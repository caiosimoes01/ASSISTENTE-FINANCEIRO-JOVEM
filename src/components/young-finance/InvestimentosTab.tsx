import React from 'react';

/**
 * InvestimentosTab - Mock da tela de Alocação de Investimentos
 */
export const InvestimentosTab: React.FC = () => {
  return (
    <div className="p-8 space-y-6">
      <div className="bg-youfing-secondary border border-youfing-light rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-accent mb-2">
          💼 Alocação de Investimentos
        </h2>
        <p className="text-youfing-secondary text-sm">
          [Mock] Tela de Alocação de Investimentos
        </p>
        <p className="text-youfing-tertiary text-xs mt-4">
          Gerencie sua carteira de investimentos com recomendações personalizadas
        </p>
      </div>
    </div>
  );
};
