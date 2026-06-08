import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  ReferenceDot,
} from "recharts";
import { PiggyBank, Link as LinkIcon, TrendingUp, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SliderField } from "./SliderField";
import { fmtBRL, simulate } from "@/lib/yf";

export default function AssistantTab() {
  const [initial, setInitial] = useState(1000);
  const [monthly, setMonthly] = useState(300);
  const [years, setYears] = useState(10);
  const [rate, setRate] = useState(6.17);
  const [whatIf, setWhatIf] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState('Poupança');

  const assetRateMap: Record<string, number> = {
    "Poupança": 6.17,
    "Tesouro Selic": 10.43,
    "CDB 100% CDI": 10.43,
    "LCI / LCA": 9.5,
    "Multimercado": 13,
    "FIIs": 11,
    "Ações / ETFs": 15,
  };

  const effectiveRate = rate; 

  const result = useMemo(
    () => simulate({ initial, monthly, years, ratePct: effectiveRate }),
    [initial, monthly, years, effectiveRate]
  );

  const zeroMonth = result.zeroPointMonths;
  const zeroYear = zeroMonth !== null ? Math.ceil(zeroMonth / 12) : null;
  const doubleMonth = result.doubleMonths;
  const doubleYear = doubleMonth !== null ? Math.round(doubleMonth / 12) : null;
  const doubleValue = doubleYear !== null ? result.series.find(s => s.year === doubleYear)?.total : null;

  const past = useMemo(
    () => simulate({ initial, monthly, years: years + 5, ratePct: effectiveRate }),
    [initial, monthly, years, effectiveRate]
  );
  const costOfWaiting = Math.max(0, past.finalAmount - result.finalAmount);

  const returnPct = result.totalInvested > 0 ? (result.interest / result.totalInvested) * 100 : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="animate-fade-up"
    >
      {/* ═══════ HERO SECTION ═══════ */}
      <section className="relative pt-14 pb-6 text-center overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 40%, rgba(16,185,129,0.06) 0%, rgba(10,15,26,0) 65%)",
          }}
        />

        <div className="relative inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-emerald-400 mb-7">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Taxas Reais Ativas
        </div>

        <h1 className="relative font-bold text-4xl md:text-6xl tracking-tight leading-[0.95] text-zinc-100 mb-5">
          <span className="block">Entenda seu</span>
          <span className="block mt-2 italic font-extrabold text-[#10B981]">
            dinheiro
          </span>
        </h1>

        <p className="relative text-base md:text-lg text-zinc-300 max-w-xl mx-auto leading-relaxed">
          Projete seu patrimônio usando matemática financeira real, juros compostos e cenários inteligentes.
        </p>

        <div
          className="relative mt-8 h-px w-full max-3xl mx-auto"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.18) 50%, transparent 100%)",
          }}
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT — Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm p-5 space-y-4">
            <SliderField
              label="Valor inicial"
              hint="quanto você já tem"
              prefix="R$ "
              value={initial}
              onChange={setInitial}
              min={0}
              max={100000}
              step={100}
            />
            <SliderField
              label="Aporte mensal"
              hint="todo mês"
              prefix="R$ "
              value={monthly}
              onChange={setMonthly}
              min={0}
              max={10000}
              step={50}
            />
            <SliderField
              label="Tempo"
              hint="horizonte"
              suffix=" anos"
              value={years}
              onChange={setYears}
              min={1}
              max={40}
              step={1}
            />

            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-400 mb-1">Ativo base</label>
              <select
                value={selectedAsset}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedAsset(val);
                  if (assetRateMap[val]) {
                    setRate(assetRateMap[val]);
                  }
                }}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2 text-zinc-101 focus:outline-none focus:border-emerald-500"
              >
                <option value="Poupança">Poupança (6.17% a.a.)</option>
                <option value="CDB 100% CDI">CDB 100% CDI (10.43% a.a.)</option>
                <option value="Tesouro Selic">Tesouro Selic (10.43% a.a.)</option>
                <option value="LCI / LCA">LCI / LCA (9.5% a.a.)</option>
                <option value="Multimercado">Multimercado (13% a.a.)</option>
                <option value="FIIs">FIIs (11% a.a.)</option>
                <option value="Ações / ETFs">Ações / ETFs (15% a.a.)</option>
              </select>
            </div>
          </div>

          <div className="w-full flex flex-col gap-3 px-2">
            <div className="rounded-xl bg-zinc-900/40 border border-zinc-800/50 p-4 flex gap-3 items-start w-full">
              <span className="text-emerald-400 text-sm mt-0.5">ℹ️</span>
              <p className="text-xs text-zinc-400 leading-relaxed">
                O rendimento projetado avalia o crescimento exponencial baseado na taxa do ativo escolhido frente ao esforço dos seus aportes periódicos.
              </p>
            </div>
            
            <p className="text-zinc-500 text-[11px] mt-1">
              Fórmula: Saldo Atual = (Saldo Anterior + Aporte) × (1 + Taxa Mensal)
            </p>

            <div className="flex justify-between items-center w-full bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/50">
              <p className="text-sm font-medium text-zinc-100">E se eu tivesse começado há 5 anos?</p>
              <button
                role="switch"
                aria-checked={whatIf}
                onClick={() => setWhatIf(!whatIf)}
                className={`relative shrink-0 h-6 w-11 rounded-full transition-colors ${whatIf ? "bg-emerald-500" : "bg-zinc-700"}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${whatIf ? "translate-x-[22px]" : "translate-x-0.5"}`}
                />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {whatIf && (
              <motion.div 
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: "auto", scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="mt-3 overflow-hidden rounded-lg bg-gradient-to-br from-amber-500/15 to-emerald-500/10 border border-amber-500/30 p-3"
              >
                <div className="text-[10px] uppercase tracking-wider text-amber-400/80 font-semibold mb-1">Custo da espera</div>
                <p className="font-mono font-bold text-2xl text-zinc-100">+ {fmtBRL(costOfWaiting)}</p>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">É o quanto você teria a mais começando 5 anos antes. Cada ano conta.</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            className="w-full py-3 px-4 mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors tracking-wide text-sm" 
            onClick={() => setIsSimulated(true)}
          >
            SIMULAR PROJEÇÃO
          </button>
          
          <AnimatePresence>
            {isSimulated && (
              <motion.section 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-6 rounded-2xl bg-zinc-900/60 border border-amber-500/30 p-5 backdrop-blur-sm"
              >
                <h3 className="text-amber-400 font-medium mb-2">🧠 Insight</h3>
                <p className="text-zinc-300 text-sm leading-relaxed">
                  O Ponto Zero é o seu ponto de virada. No início, o patrimônio cresce pelo seu esforço (aportes). Mas quando chegas aqui, os juros mensais gerados sozinhos superam o que tu depositas. É a partir deste cruzamento que a dependência do teu suor diminui e o efeito exponencial assume o controlo absoluto.
                </p>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT — Resultados e Gráfico */}
        <div className="lg:col-span-7 space-y-6">
          <AnimatePresence mode="wait">
            {isSimulated && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-6"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <ResultCard
                    label="Total Investido"
                    value={fmtBRL(result.totalInvested)}
                    hint="O valor total que saiu do seu bolso ao longo de todo o período."
                    icon={<PiggyBank className="h-4 w-4" />}
                    iconColor="text-blue-400 bg-blue-500/15"
                  />
                  <ResultCard
                    label="Juros ganhos"
                    value={fmtBRL(result.interest)}
                    hint="O dinheiro que seu dinheiro fez por você — sem você levantar do sofá."
                    icon={<LinkIcon className="h-4 w-4" />}
                    iconColor="text-emerald-400 bg-emerald-500/15"
                  />
                </div>

                {/* Patrimônio final */}
                <div className="rounded-2xl bg-zinc-900 border border-emerald-500/30 p-6 transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
                      Patrimônio final
                    </span>
                    <div className="h-9 w-9 rounded-full bg-emerald-500/15 grid place-items-center text-emerald-400">
                      <TrendingUp className="h-4.5 w-4.5" />
                    </div>
                  </div>
                  <div className="font-mono font-bold text-4xl md:text-5xl text-zinc-100 tabular-nums flex flex-wrap items-center gap-2">
                    {fmtBRL(result.finalAmount)}
                    {zeroYear !== null && zeroYear <= years && (
                      <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded text-xs">
                        <Target className="h-3 w-3" />Ponto Zero: Ano {zeroYear}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-zinc-400 max-w-md leading-relaxed">
                    O total que você terá no fim do período — investido + juros compostos trabalhando 24/7.
                  </p>
                </div>

                {/* Milestone badges */}
                <div className="flex flex-wrap gap-2">
                  {doubleYear !== null && doubleYear <= years && (
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded text-xs">
                      Dobrou em: Ano {doubleYear}
                    </span>
                  )}
                  <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded text-xs">
                    Retorno: {returnPct.toFixed(1)}%
                  </span>
                  {zeroYear !== null && (
                    zeroYear <= years ? (
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded text-xs">
                        🎯 Ponto Zero: Ano {zeroYear}
                      </span>
                    ) : (
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded text-xs">
                        🎯 Ponto Zero: Fora do horizonte ({zeroYear}a)
                      </span>
                    )
                  )}
                </div>

                {/* Chart */}
                <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm p-5">
                  <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
                    <div>
                      <h3 className="text-lg font-bold text-zinc-100 tracking-tight">
                        Sua evolução patrimonial
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Visualize o efeito dos juros compostos ao longo do tempo.
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-zinc-400">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" /> Patrimônio total
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-zinc-500" /> Total investido
                      </span>
                    </div>
                  </div>

                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={result.series} margin={{ top: 15, right: 5, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10B981" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4b5563" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="#4b5563" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#1E2D45" vertical={false} />
                        <XAxis dataKey="year" stroke="#475569" tickLine={false} axisLine={false} fontSize={11} tickFormatter={(v) => `${v}a`} />
                        <YAxis stroke="#475569" tickLine={false} axisLine={false} fontSize={11} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} width={55} />
                        
                        <Tooltip
                          contentStyle={{
                            background: "#111827",
                            border: "1px solid #1E2D45",
                            borderRadius: "0.75rem",
                            fontSize: "12px",
                            color: "#F1F5F9",
                          }}
                          labelFormatter={(l) => `Ano ${l}`}
                          formatter={(value: any, name: any) => [fmtBRL(Number(value ?? 0)), name ?? '']}
                        />

                        <Area type="monotone" dataKey="total" name="Patrimônio Total" stroke="#10b981" strokeWidth={2} fill="url(#colorTotal)" order={2} />
                        <Area type="monotone" dataKey="invested" name="Investido" stroke="#4b5563" strokeWidth={1.5} fill="url(#colorInvested)" order={1} />
                        
                        {isSimulated && zeroYear !== null && zeroYear > 0 && zeroYear <= years && (
                          <ReferenceLine
                            x={zeroYear}
                            stroke="#f59e0b"
                            strokeDasharray="4 4"
                            strokeWidth={2}
                            label={{
                              value: 'O jogo virou 🔥',
                              fill: '#f59e0b',
                              position: 'insideTopLeft',
                              dy: 10,
                              fontSize: 11,
                              fontWeight: 'bold',
                            }}
                          />
                        )}
                        
                        {isSimulated && doubleYear !== null && doubleYear <= years && doubleValue !== undefined && (
                          <ReferenceDot
                            x={doubleYear}
                            y={doubleValue}
                            r={5}
                            fill="#10b981"
                            stroke="#111827"
                            strokeWidth={2}
                          />
                        )}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <footer className="text-zinc-500 text-[11px] tracking-wide border-t border-zinc-800/40 pt-4 mt-8 w-full block text-center">
        Simulação educativa baseada em taxas históricas estimadas. Rendimentos passados não garantem retornos futuros.
      </footer>
    </motion.div>
  );
}

function ResultCard({
  label,
  value,
  hint,
  icon,
  iconColor,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  iconColor: string;
}) {
  return (
    <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm p-5 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.12)]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">{label}</span>
        <div className={`h-8 w-8 rounded-full grid place-items-center ${iconColor}`}>{icon}</div>
      </div>
      <div className="font-mono font-bold text-2xl md:text-3xl text-zinc-100 tabular-nums">{value}</div>
      <p className="mt-2 text-xs text-zinc-400 leading-relaxed">{hint}</p>
    </div>
  );
}
