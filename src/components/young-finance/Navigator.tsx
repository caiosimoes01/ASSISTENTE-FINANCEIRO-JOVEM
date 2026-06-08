import React, { useState } from 'react';
import { Zap, BarChart2, Target, Calculator } from 'lucide-react';
import AssistantTab from './AssistantTab';
import { ScenariosTab } from './ScenariosTab';
import { InvestimentosTab } from './InvestimentosTab';
import { Hp12cTab } from './Hp12cTab';
import { cn } from './utils';

/**
 * Definição das abas do Navigator
 */
interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ComponentType;
}

const TABS: Tab[] = [
  {
    id: 'assistant',
    label: 'Assistente',
    icon: <Zap size={18} />,
    component: AssistantTab,
  },
  {
    id: 'scenarios',
    label: 'Cenários',
    icon: <BarChart2 size={18} />,
    component: ScenariosTab,
  },
  {
    id: 'investimentos',
    label: 'Investimentos',
    icon: <Target size={18} />,
    component: InvestimentosTab,
  },
  {
    id: 'hp12c',
    label: 'HP 12C',
    icon: <Calculator size={18} />,
    component: Hp12cTab,
  },
];

/**
 * Navigator - Sistema de abas com menu premium glassmorphism
 * Gerencia a navegação entre as 4 telas principais
 */
export const Navigator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('assistant');

  // Encontrar a aba ativa
  const activeTabData = TABS.find((tab) => tab.id === activeTab);
  const ActiveComponent = activeTabData?.component || AssistantTab;

  return (
    <div className="min-h-screen bg-youfing-primary">
      {/* Header Sticky com Glassmorphism */}
      <header
        className={cn(
          'sticky top-0 z-50',
          'backdrop-blur-md bg-youfing-primary/80',
          'border-b border-youfing-light',
          'shadow-youfing-md'
        )}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-8">
            {/* Logo YoungFinance */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div
                className={cn(
                  'w-10 h-10 rounded-lg',
                  'bg-gradient-accent',
                  'flex items-center justify-center',
                  'shadow-youfing-glow'
                )}
              >
                <span className="text-youfing-primary font-bold text-lg">
                  YF
                </span>
              </div>
              <h1 className="text-lg font-bold text-accent hidden sm:block">
                YoungFinance
              </h1>
            </div>

            {/* Abas Navigation */}
            <nav className="flex items-center gap-2">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'px-4 py-2 rounded-lg',
                      'flex items-center gap-2',
                      'text-sm font-medium',
                      'transition-all duration-300',
                      'flex-shrink-0',
                      isActive
                        ? 'bg-accent text-youfing-primary shadow-youfing-glow'
                        : cn(
                            'text-youfing-secondary',
                            'hover:text-accent hover:bg-youfing-secondary/50',
                            'hover:shadow-youfing-glow'
                          )
                    )}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Conteúdo da Aba Ativa */}
      <main className="w-full">
        <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
          <ActiveComponent />
        </div>
      </main>
    </div>
  );
};
