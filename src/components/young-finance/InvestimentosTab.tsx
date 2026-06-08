import React, { useState } from 'react';
import { Shield, TrendingUp, BarChart2, CheckCircle, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const InvestimentosTab: React.FC = () => {
  const [activeProfile, setActiveProfile] = useState<string>('conservador');

  const profiles = {
    conservador: {
      title: 'Conservador',
      gradient: 'from-blue-600/20 via-indigo-600/10 to-transparent',
      border: 'border-blue-500/40',
      shadow: 'shadow-[0_0_25px_rgba(59,130,246,0.2)]',
      glowColor: 'rgba(59, 130, 246, 0.15)',
      icon: <Shield className="w-6 h-6 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />, // blue glow
      description: 'Prioriza segurança absoluta e liquidez imediata. Foco total na preservação do seu patrimônio com ativos de baixo risco.',
      badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    },
    moderado: {
      title: 'Moderado',
      gradient: 'from-purple-600/20 via-pink-600/10 to-transparent',
      border: 'border-purple-500/40',
      shadow: 'shadow-[0_0_25px_rgba(168,85,247,0.2)]',
      glowColor: 'rgba(168, 85, 247, 0.15)',
      icon: <TrendingUp className="w-6 h-6 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />, // purple glow
      description: 'O equilíbrio perfeito entre segurança e rentabilidade. Aceita pequenas oscilações para ver o dinheiro crescer mais rápido.',
      badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    },
    arrojado: {
      title: 'Arrojado',
      gradient: 'from-red-600/20 via-orange-600/10 to-transparent',
      border: 'border-red-500/40',
      shadow: 'shadow-[0_0_25px_rgba(239,68,68,0.2)]',
      glowColor: 'rgba(239, 68, 68, 0.15)',
      icon: <BarChart2 className="w-6 h-6 text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />, // red glow
      description: 'Foco em multiplicação agressiva a longo prazo. Tolera alta volatilidade em busca dos maiores retornos do mercado.',
      badgeBg: 'bg-red-500/20 text-red-300 border-red-500/30'
    },
  };

  const assets = [
    { name: 'Poupança', risk: 'Mínimo', riskColor: 'bg-green-500/20 text-green-400 border-green-500/30', liquidity: 'D+0 (Imediata)', returnMonth: '0,50%', prazo: 'Curto', fgcs: true, ir: 'Isento', irBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    { name: 'Tesouro Selic', risk: 'Mínimo', riskColor: 'bg-green-500/20 text-green-400 border-green-500/30', liquidity: 'D+1 (1 dia útil)', returnMonth: '0,83%', prazo: 'Curto/Médio', fgcs: false, ir: 'Sim (Regressivo)', irBadge: 'bg-zinc-800 text-zinc-400 border-zinc-700' },
    { name: 'CDB 100% CDI', risk: 'Baixo', riskColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30', liquidity: 'D+0 / D+1', returnMonth: '0,83%', prazo: 'Curto/Médio', fgcs: true, ir: 'Sim (Regressivo)', irBadge: 'bg-zinc-800 text-zinc-400 border-zinc-700' },
    { name: 'LCI / LCA', risk: 'Baixo', riskColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30', liquidity: 'Após 90 dias', returnMonth: '0,75%', prazo: 'Médio', fgcs: true, ir: 'Isento', irBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    { name: 'Multimercado', risk: 'Médio', riskColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', liquidity: 'D+30 (30 dias)', returnMonth: '1,00%', prazo: 'Médio/Longo', fgcs: false, ir: 'Sim (Regressivo)', irBadge: 'bg-zinc-800 text-zinc-400 border-zinc-700' },
    { name: 'FIIs', risk: 'Médio‑Alto', riskColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30', liquidity: 'D+2 (2 dias)', returnMonth: '0,85%', prazo: 'Longo prazo', fgcs: false, ir: 'Isento (Dividendos)', irBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    { name: 'Ações / ETFs', risk: 'Alto', riskColor: 'bg-red-500/20 text-red-400 border-red-500/30', liquidity: 'D+2 (2 dias)', returnMonth: '1,20%', prazo: 'Longo (5+ anos)', fgcs: false, ir: 'Sim (No ganho)', irBadge: 'bg-zinc-800 text-zinc-400 border-zinc-700' },
  ];

  const profileAssetMap: Record<'conservador' | 'moderado' | 'arrojado', string[]> = {
    conservador: ['Poupança', 'Tesouro Selic', 'CDB 100% CDI'],
    moderado: ['Poupança', 'Tesouro Selic', 'CDB 100% CDI', 'LCI / LCA', 'Multimercado'],
    arrojado: ['CDB 100% CDI', 'LCI / LCA', 'Multimercado', 'FIIs', 'Ações / ETFs'],
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="p-6 lg:p-8 space-y-8 bg-transparent min-h-screen text-zinc-100"
    >
      {/* Título da Seção */}
      <div>
        <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">Radar de Alocação</h2>
        <p className="text-sm text-zinc-400 mt-1">Selecione o seu perfil de investidor abaixo para analisar os ativos recomendados.</p>
      </div>
      {/* Cards de Perfil */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(profiles).map(([key, profile]) => {
          const isSelected = activeProfile === key;
          return (
            <motion.button
              key={key}
              onClick={() => setActiveProfile(activeProfile === key ? '' : key)}
              whileHover={{ scale: 1.015, y: -2 }}
              whileTap={{ scale: 0.985 }}
              className={`p-5 rounded-2xl text-left relative transition-all duration-300 bg-zinc-900/40 backdrop-blur-sm border ${
                isSelected ? `${profile.border} ${profile.shadow}` : 'border-zinc-800/80 hover:border-zinc-700'
              }`}
              style={{
                background: isSelected 
                  ? `linear-gradient(135deg, ${profile.glowColor} 0%, rgba(24, 24, 27, 0.7) 50%)`
                  : undefined
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                {profile.icon}
                <h3 className="text-lg font-bold tracking-tight text-zinc-100">{profile.title}</h3>
              </div>
              
              <p className="text-xs text-zinc-400 leading-relaxed mb-4 min-h-[48px]">{profile.description}</p>
              
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                isSelected ? profile.badgeBg : 'bg-zinc-800/50 text-zinc-400 border-zinc-700/50'
              }`}>
                {isSelected ? 'Perfil Ativo' : profile.title}
              </span>
            </motion.button>
          );
        })}
      </div>
      

      {/* Tabela de Ativos com Glassmorphism */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-800/80 bg-zinc-900/20 backdrop-blur-md shadow-xl">
        <table className="w-full min-w-[800px] text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/60 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <th className="p-4 pl-6">Ativo sugerido</th>
              <th className="p-4">Risco</th>
              <th className="p-4">Liquidez</th>
              <th className="p-4">Retorno Estimado</th>
              <th className="p-4">Prazo Alvo</th>
              <th className="p-4 text-center">Garantia FGC</th>
              <th className="p-4 pr-6">Imposto (IR)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40 text-sm">
            <AnimatePresence>
              {assets.map((a) => {
                const isHighlighted = activeProfile ? profileAssetMap[activeProfile as 'conservador' | 'moderado' | 'arrojado'].includes(a.name) : true;
                
                return (
                  <motion.tr
                    key={a.name}
                    animate={{ 
                      opacity: isHighlighted ? 1 : 0.2,
                      filter: isHighlighted ? 'blur(0px)' : 'blur(1px)'
                    }}
                    transition={{ duration: 0.25 }}
                    className={`transition-colors hover:bg-zinc-800/20 ${!isHighlighted ? 'pointer-events-none' : ''}`}
                  >
                    <td className="p-4 pl-6 font-medium text-zinc-200 flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${isHighlighted && activeProfile ? profiles[activeProfile as 'conservador'].badgeBg : 'bg-zinc-800 text-zinc-500'}`}>
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <span className="font-semibold tracking-tight">{a.name}</span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${a.riskColor}`}> 
                        {a.risk}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-300 font-mono text-xs">{a.liquidity}</td>
                    <td className="p-4 font-mono font-bold text-emerald-400 text-base">{a.returnMonth} <span className="text-[10px] text-zinc-500 font-normal">/mês</span></td>
                    <td className="p-4 text-zinc-400">{a.prazo}</td>
                    <td className="p-4 text-center">
                      {a.fgcs ? (
                        <div className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md text-xs font-semibold border border-emerald-500/20">
                          <CheckCircle className="w-3.5 h-3.5" /> FGC Protege
                        </div>
                      ) : (
                        <span className="text-zinc-600 text-xs font-mono">—</span>
                      )}
                    </td>
                    <td className="p-4 pr-6">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${a.irBadge}`}> {a.ir} </span>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Rodapé de Disclaimer de Risco */}
      <footer className="text-zinc-500 text-[11px] tracking-wide border-t border-zinc-800/40 pt-4 mt-4 w-full block text-center">
        Painel estritamente educativo. Os retornos exibidos baseiam-se em estimativas correntes de mercado e taxas de juros simuladas. Rentabilidade passada não representa garantia de ganhos futuros.
      </footer>
    </motion.div>
  );
};
