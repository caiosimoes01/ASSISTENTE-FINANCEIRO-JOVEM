import React from 'react';

/**
 * AssistantTab - Mock da tela do Assistente IA
 * Será substituído pela tela real com Bento Grid + Componentes
 */
export const AssistantTab: React.FC = () => {
  return (
    <div className="p-8 space-y-6">
      <div className="bg-youfing-secondary border border-youfing-light rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-accent mb-2">
          🤖 Assistente IA - YoungFinance
        </h2>
        <p className="text-youfing-secondary text-sm">
          [Mock] Tela do Assistente IA com Bento Grid
        </p>
        <p className="text-youfing-tertiary text-xs mt-4">
          Aqui ficarão os componentes BentoCard, SliderField e GrowthChart integrados
        </p>
      </div>
    </div>
  );
};
