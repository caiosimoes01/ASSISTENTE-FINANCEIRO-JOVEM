import React from 'react';

/**
 * ScenariosTab - Mock da tela de Comparação de Cenários
 */
export const ScenariosTab: React.FC = () => {
  return (
    <div className="p-8 space-y-6">
      <div className="bg-youfing-secondary border border-youfing-light rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-accent mb-2">
          📊 Comparação de Cenários
        </h2>
        <p className="text-youfing-secondary text-sm">
          [Mock] Tela de Comparação de Cenários
        </p>
        <p className="text-youfing-tertiary text-xs mt-4">
          Simule múltiplos cenários financeiros e compare resultados lado a lado
        </p>
      </div>
    </div>
  );
};
