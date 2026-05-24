import { useState, useMemo, useRef, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceDot, ReferenceLine, Label
} from "recharts";
import {
  TrendingUp, Shield, Target, Zap, AlertTriangle, ChevronDown,
  ChevronUp, Plus, Trash2, CheckCircle, BarChart2,
  RefreshCw, Lightbulb, Calculator, ChevronRight
} from "lucide-react";
import { useSimulation, type ChartPoint } from "@hooks/useSimulation";
import { CompoundInterestEngine } from "@core/finance/engine/CompoundInterestEngine";
import { formatCurrency, formatPercentage, parseBRL, formatTimeSpan } from "@utils/formatadores";


// ─────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────
const C = {
  bg: "#09090B",
  surface: "rgba(24, 24, 27, 0.4)", // bg-zinc-900/40
  surfaceEl: "rgba(24, 24, 27, 0.6)", // bg-zinc-900/60
  border: "rgba(63, 63, 70, 0.8)", // border-zinc-800/80
  borderLt: "rgba(63, 63, 70, 0.5)", // border-zinc-800/50
  green: "#10B981", // emerald-500
  greenDark: "#047857", // emerald-700
  greenGlow: "rgba(16, 185, 129, 0.15)",
  greenDim: "rgba(16, 185, 129, 0.08)",
  blue: "#10B981",
  blueDim: "rgba(16, 185, 129, 0.08)",
  amber: "#F59E0B",
  amberDim: "rgba(245, 158, 11, 0.1)",
  red: "#EF4444",
  redDim: "rgba(239, 68, 68, 0.1)",
  text: "#FFFFFF",
  textSoft: "#A1A1AA",
  textMuted: "#71717A",
};

// ─────────────────────────────────────────────────────────
// INVESTIMENTOS
// ─────────────────────────────────────────────────────────
interface Investimento {
  id: string;
  nome: string;
  taxaAnualPadrao: number; // Em percentual (ex: 6.17 para 6.17% a.a.)
  risco: number;
  liquidez: string;
  prazo: string;
  fgc: boolean;
  ir: boolean;
  cor: string;
  desc: string;
}

const INVESTIMENTOS: Investimento[] = [
  { id: "poupanca", nome: "Poupança", taxaAnualPadrao: 6.17, risco: 1, liquidez: "D+0", prazo: "Curto", fgc: true, ir: false, cor: "#10B981", desc: "Segurança máxima, menor rendimento anual." },
  { id: "selic", nome: "Tesouro Selic", taxaAnualPadrao: 10.50, risco: 1, liquidez: "D+1", prazo: "Curto/Médio", fgc: false, ir: true, cor: "#10B981", desc: "Garantido pelo governo federal. Acompanha a Selic." },
  { id: "cdb", nome: "CDB 100% CDI", taxaAnualPadrao: 10.50, risco: 2, liquidez: "D+0/D+1", prazo: "Curto/Médio", fgc: true, ir: true, cor: "#34D399", desc: "Coberto pelo FGC até R$ 250k por instituição financeira." },
  { id: "lci", nome: "LCI / LCA", taxaAnualPadrao: 9.45, risco: 2, liquidez: "90+ dias", prazo: "Médio", fgc: true, ir: false, cor: "#059669", desc: "Isento de Imposto de Renda. Carência mínima obrigatória." },
  { id: "multi", nome: "Multimercado", taxaAnualPadrao: 12.68, risco: 3, liquidez: "D+30", prazo: "Médio/Longo", fgc: false, ir: true, cor: "#047857", desc: "Diversificado. Rentabilidade varia conforme gestão do fundo." },
  { id: "fiis", nome: "FIIs (Fundos Imobiliários)", taxaAnualPadrao: 10.70, risco: 4, liquidez: "D+2", prazo: "Longo", fgc: false, ir: false, cor: "#34D399", desc: "Rendimento mensal isento de Imposto de Renda para pessoa física." },
  { id: "acoes", nome: "Ações / ETFs", taxaAnualPadrao: 15.39, risco: 5, liquidez: "D+2", prazo: "Longo (5+a)", fgc: false, ir: true, cor: "#6EE7B7", desc: "Maior potencial de crescimento, sujeito à volatilidade da bolsa." },
];

const RLABELS = ["", "Mínimo", "Baixo", "Médio", "Médio-Alto", "Alto"];
const RCOLORS = ["", "#10B981", "#3B82F6", "#F59E0B", "#F97316", "#EF4444"];

// ─────────────────────────────────────────────────────────
// HP-12C — teclas e explicações
// ─────────────────────────────────────────────────────────
interface HpKey {
  main: string;
  f?: string;
  g?: string;
  cor: string;
  explicacao: string;
}

const HP_KEYS: HpKey[] = [
  { main: "n", f: "AMORT", g: "12×", cor: "#4A5568", explicacao: "n — Número de períodos. Ex: 12 para 12 meses. Com f-AMORT calcula amortização. Com g-12× converte anos em meses." },
  { main: "i", f: "INT", g: "12÷", cor: "#4A5568", explicacao: "i — Taxa de juros por período. Em %. Ex: 1 para 1% ao mês. Com g-12÷ converte taxa anual para mensal." },
  { main: "PV", f: "NPV", g: "CFo", cor: "#2B6CB0", explicacao: "PV (Valor Presente) — Valor atual do dinheiro. Num financiamento: quanto você está tomando emprestado hoje." },
  { main: "PMT", f: "PMT", g: "CFj", cor: "#2B6CB0", explicacao: "PMT (Pagamento) — Valor da parcela periódica. Pode ser entrada (positivo) ou saída (negativo). Use CHS para mudar o sinal." },
  { main: "FV", f: "FV", g: "Nj", cor: "#2B6CB0", explicacao: "FV (Valor Futuro) — Valor do dinheiro no futuro após juros. Para investimentos: quanto você terá ao final." },
  { main: "CHS", f: "DATE", g: "ΔDYS", cor: "#4A5568", explicacao: "CHS (Change Sign) — Inverte o sinal do número na tela. Essencial para indicar saídas de caixa (pagamentos)." },
  { main: "7", f: "BEG", g: "END", cor: "#2D3748", explicacao: "Tecla 7. Com f-BEG: pagamentos no início do período (ex: aluguel pago antecipado). Com g-END: pagamentos no final." },
  { main: "8", f: "MEM", g: "CLx", cor: "#2D3748", explicacao: "Tecla 8. Com f-MEM: gerencia memórias de cálculo. Com g-CLx: apaga apenas o número na tela (sem perder o histórico RPN)." },
  { main: "9", f: "%T", g: "LAST×", cor: "#2D3748", explicacao: "Tecla 9. Com f-%T: calcula porcentagem do total. Com g-LAST×: recupera o último resultado para multiplicar." },
  { main: "÷", f: "ΔTVM", g: "x", cor: "#744210", explicacao: "Divisão. Com f-ΔTVM: analisa variação do valor do dinheiro no tempo. Com g-x: raiz quadrada do número na tela." },
  { main: "STO", f: "IRR", g: "RND", cor: "#4A5568", explicacao: "STO (Store) — Guarda o valor exibido em memória. Ex: STO 1 guarda na memória 1. Com f-IRR: calcula Taxa Interna de Retorno (TIR)." },
  { main: "4", f: "FV", g: "CFo", cor: "#2D3748", explicacao: "Tecla 4. Usada em conjunto com funções financeiras. O contexto muda conforme as teclas de shift f ou g ativas." },
  { main: "5", f: "NPV", g: "CFj", cor: "#2D3748", explicacao: "Tecla 5. Com f-NPV: calcula Valor Presente Líquido (VPL) de fluxos de caixa irregulares. Fundamental em análise de projetos." },
  { main: "6", f: "PMT", g: "Nj", cor: "#2D3748", explicacao: "Tecla 6. Com g-Nj: define o número de repetições de um fluxo de caixa no cálculo do VPL/TIR." },
  { main: "×", f: "%", g: "Δ%", cor: "#744210", explicacao: "Multiplicação. Com f-%: calcula porcentagem (x% de y). Com g-Δ%: variação percentual entre dois números." },
  { main: "RCL", f: "PV", g: "INT", cor: "#4A5568", explicacao: "RCL (Recall) — Recupera valor da memória. Ex: RCL 1 traz o que foi guardado. Com f-PV: calcula Valor Presente." },
  { main: "1", f: "CLtvm", g: "P/R", cor: "#2D3748", explicacao: "Tecla 1. Com f-CLtvm: apaga todos os registros financeiros (n, i, PV, PMT, FV). Sempre faça isso antes de um novo cálculo!" },
  { main: "2", f: "CLEAR", g: "ST+", cor: "#2D3748", explicacao: "Tecla 2. Com f-CLEAR: apaga toda a calculadora. Com g-ST+: soma o valor atual ao número guardado em memória." },
  { main: "3", f: "R↓", g: "T", cor: "#2D3748", explicacao: "Tecla 3. Com f-R↓: rola o stack RPN para baixo (visualiza os 4 registros). Com g-T: recupera o topo do stack." },
  { main: "−", f: "SOLVE", g: "√x", cor: "#744210", explicacao: "Subtração. Com f-SOLVE: resolve iterativamente para uma variável desconhecida. Com g-√x: raiz quadrada." },
  { main: "ENTER", f: "CLEAR Σ", g: "CLx", cor: "#1A365D", explicacao: "ENTER — Fundamental na lógica RPN! Separa dois números antes de uma operação. Ex: para calcular 5+3: tecle 5, ENTER, 3, +. Não precisa de parênteses!" },
  { main: "f", cor: "#92400E", explicacao: "f (shift laranja) — Ativa a função secundária laranja de cada tecla. Pressione f, depois a tecla desejada." },
  { main: "g", cor: "#065F46", explicacao: "g (shift verde) — Ativa a função terciária verde de cada tecla. Pressione g, depois a tecla desejada." },
  { main: "0", f: "CFo", g: "x!", cor: "#2D3748", explicacao: "Tecla 0. Com f-CFo: registra o fluxo de caixa inicial (investimento t=0) para cálculo de VPL/TIR." },
  { main: "·", f: "CFj", g: "ŷ,r", cor: "#2D3748", explicacao: "Ponto decimal. Com f-CFj: registra fluxos de caixa futuros para VPL/TIR. Com g-ŷ,r: estimativa e correlação linear." },
  { main: "+", f: "Σ+", g: "Σ−", cor: "#744210", explicacao: "Adição. Com f-Σ+: acumula par de dados (x,y) para estatísticas. Com g-Σ−: remove o último par acumulado." },
];

const HP_EXEMPLOS = [
  {
    titulo: "Calcular parcela de financiamento (PMT)",
    passos: [
      "f CLtvm  → limpa registros anteriores",
      "360 n    → 360 parcelas (30 anos)",
      "1 i      → 1% ao mês de juros",
      "200000 PV → R$ 200.000 financiados",
      "0 FV     → saldo final = zero (quitado)",
      "PMT      → resultado: R$ -2.057,23/mês",
    ],
  },
  {
    titulo: "Calcular valor futuro (investimento)",
    passos: [
      "f CLtvm  → limpa registros",
      "120 n    → 120 meses (10 anos)",
      "0.83 i   → 0,83% ao mês (CDI ~10% a.a.)",
      "10000 PV → R$ 10.000 iniciais",
      "500 CHS PMT → aportar R$ 500/mês",
      "FV       → resultado: patrimônio final",
    ],
  },
  {
    titulo: "Descobrir a taxa de juros (i)",
    passos: [
      "f CLtvm  → limpa registros",
      "36 n     → 36 parcelas",
      "15000 PV → R$ 15.000 financiados",
      "0 FV",
      "520 CHS PMT → parcela de R$ 520",
      "i        → taxa real ao mês",
    ],
  },
];

// ─────────────────────────────────────────────────────────
// COMPONENTES BASE
// ─────────────────────────────────────────────────────────
interface BadgeProps {
  children: React.ReactNode;
  cor?: string;
}
function Badge({ children, cor = "#10B981" }: BadgeProps) {
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider whitespace-nowrap border transition-all duration-300"
      style={{
        backgroundColor: `${cor}15`,
        color: cor,
        borderColor: `${cor}30`
      }}
    >
      {children}
    </span>
  );
}

interface NumInputProps {
  label: string;
  hint?: string;
  emoji?: string;
  value: string | number;
  onChange: (val: string) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  benchmarks?: { label: string; value: number }[];
}

function NumInput({
  label,
  hint,
  emoji,
  value,
  onChange,
  prefix = "R$",
  suffix = "",
  placeholder = "0",
  min,
  max,
  step = 1,
  benchmarks
}: NumInputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="mb-4 text-left">
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
          {emoji && <span className="text-sm">{emoji}</span>} {label}
          {hint && <span className="text-[10px] text-zinc-400 font-normal">({hint})</span>}
        </span>
      </div>
      
      <div className={`flex items-center bg-zinc-950/60 border rounded-xl overflow-hidden transition-all duration-300 ${
        focused
          ? "border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
          : "border-zinc-800/80 hover:border-zinc-700"
      }`}>
        {prefix && (
          <span className="px-3 text-xs font-semibold text-zinc-500 border-r border-zinc-800/80 h-10 flex items-center bg-zinc-900/40">
            {prefix}
          </span>
        )}
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 bg-transparent border-none outline-none text-sm font-mono font-bold text-zinc-100 min-w-0"
        />
        {suffix && (
          <span className="px-3 text-xs font-semibold text-zinc-500">
            {suffix}
          </span>
        )}
      </div>

      {min !== undefined && max !== undefined && (
        <div className="mt-2.5 space-y-1.5">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={Number(value) || 0}
            onChange={e => onChange(e.target.value)}
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 transition-all duration-300"
          />
          {benchmarks && benchmarks.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {benchmarks.map(b => (
                <button
                  key={b.label}
                  type="button"
                  onClick={() => onChange(b.value.toString())}
                  className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-800/30 hover:border-emerald-500/50 transition-all duration-300"
                >
                  {b.label}: {b.value}%
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface InvSelectProps {
  value: string;
  onChange: (inv: Investimento) => void;
}
function InvSelect({ value, onChange }: InvSelectProps) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const inv = INVESTIMENTOS.find(i => i.id === value) || INVESTIMENTOS[1];

  const handleToggle = () => {
    if (!open && btnRef.current) {
      setRect(btnRef.current.getBoundingClientRect());
    }
    setOpen(v => !v);
  };

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const dropStyle = (): React.CSSProperties => {
    if (!rect) return {};
    const dropH = Math.min(INVESTIMENTOS.length * 57, 420);
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < dropH + 8 && rect.top > dropH;
    return {
      position: "fixed",
      top: openUp ? rect.top - dropH - 4 : rect.bottom + 4,
      left: rect.left,
      width: Math.max(rect.width, 300),
      maxHeight: dropH,
      overflowY: "auto",
      background: "#09090b", // bg-zinc-950
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(63, 63, 70, 0.8)", // border-zinc-800/80
      borderRadius: 12,
      boxShadow: "0 20px 60px rgba(0,0,0,0.75)",
      zIndex: 99999,
    };
  };

  return (
    <div className="mb-4">
      <div className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase mb-1.5">
        Investimento de Referência
      </div>

      <button
        ref={btnRef}
        type="button"
        onClick={handleToggle}
        className="w-full px-3.5 py-2.5 flex items-center justify-between bg-zinc-950/60 border rounded-xl cursor-pointer transition-all duration-300 border-zinc-800/80 hover:border-zinc-700 hover:shadow-[0_0_12px_rgba(16,185,129,0.05)]"
        style={open ? { borderColor: `${inv.cor}80`, boxShadow: `0 0 12px ${inv.cor}20` } : {}}
      >
        <div className="flex items-center gap-2.5 min-width-0">
          <div className="width-2 height-2 rounded-full flex-shrink-0" style={{ width: 8, height: 8, background: inv.cor, boxShadow: `0 0 6px ${inv.cor}` }} />
          <span className="font-bold text-sm text-zinc-100 overflow-hidden text-ellipsis whitespace-nowrap">
            {inv.nome}
          </span>
          <Badge cor={RCOLORS[inv.risco]}>{RLABELS[inv.risco]}</Badge>
          {!inv.ir && <Badge cor="#10B981">Isento IR</Badge>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <span className="font-mono text-xs font-bold" style={{ color: inv.cor }}>
            {formatPercentage(inv.taxaAnualPadrao, 2)} a.a.
          </span>
          {open ? <ChevronUp size={13} className="text-zinc-500" /> : <ChevronDown size={13} className="text-zinc-500" />}
        </div>
      </button>

      {open && (
        <div style={dropStyle()} onMouseDown={e => e.stopPropagation()}>
          {INVESTIMENTOS.map(i => (
            <button
              key={i.id}
              type="button"
              onClick={() => { onChange(i); setOpen(false); }}
              className="w-full px-3.5 py-2.5 flex items-start gap-2.5 border-b border-zinc-800/80 cursor-pointer text-left transition-all duration-300 last:border-b-0"
              style={{
                background: i.id === value ? `${i.cor}12` : "transparent",
              }}
              onMouseEnter={e => e.currentTarget.style.background = `${i.cor}18`}
              onMouseLeave={e => e.currentTarget.style.background = i.id === value ? `${i.cor}12` : "transparent"}
            >
              <div className="width-2 height-2 rounded-full flex-shrink-0 mt-1" style={{ width: 8, height: 8, background: i.cor }} />
              <div className="flex-1 min-width-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                  <span className="font-bold text-xs text-zinc-100">{i.nome}</span>
                  <Badge cor={RCOLORS[i.risco]}>{RLABELS[i.risco]}</Badge>
                  {!i.ir && <Badge cor="#10B981">Isento IR</Badge>}
                </div>
                <div className="text-[10px] text-zinc-500 leading-tight">{i.desc}</div>
              </div>
              <span className="font-mono text-xs font-bold flex-shrink-0 ml-2" style={{ color: i.cor }}>
                {formatPercentage(i.taxaAnualPadrao, 2)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// GRÁFICO PRINCIPAL
// ─────────────────────────────────────────────────────────
interface MainChartProps {
  chartData: ChartPoint[];
  viradaMes: number | null;
  dobrouMes: number | null;
}
function MainChart({ chartData, viradaMes, dobrouMes }: MainChartProps) {
  const step = Math.max(1, Math.floor(chartData.length / 72));
  const data = useMemo(() => {
    return chartData.map((point) => ({
      ...point,
      label: point.mes % 12 === 0 ? (point.mes === 0 ? "Hoje" : `Ano ${point.mes / 12}`) : ""
    })).filter((_, i) => i % step === 0 || i === chartData.length - 1);
  }, [chartData, step]);

  const dobrouPt = useMemo(() => {
    if (dobrouMes === null) return null;
    const snap = chartData[Math.min(dobrouMes, chartData.length - 1)];
    return {
      label: snap.mes % 12 === 0 ? (snap.mes === 0 ? "Hoje" : `Ano ${snap.mes / 12}`) : "",
      total: snap["Patrimônio Nominal"]
    };
  }, [dobrouMes, chartData]);

  const viradaPt = useMemo(() => {
    if (viradaMes === null) return null;
    const snap = chartData[Math.min(viradaMes, chartData.length - 1)];
    return snap.mes % 12 === 0 ? (snap.mes === 0 ? "Hoje" : `Ano ${snap.mes / 12}`) : `Mês ${snap.mes}`;
  }, [viradaMes, chartData]);

  const Tip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const nominal = payload.find((p: any) => p.dataKey === "Patrimônio Nominal");
    const real = payload.find((p: any) => p.dataKey === "Patrimônio Real descontado a Inflação");
    const dataItem = payload[0]?.payload;
    const cap = dataItem?.capital;
    
    return (
      <div className="bg-zinc-900/90 backdrop-blur-md border border-zinc-800/80 rounded-xl p-4 shadow-xl text-left">
        <div className="text-[10px] text-zinc-500 font-bold uppercase mb-2 tracking-wider">{dataItem?.label || `Mês ${dataItem?.mes}`}</div>
        <div className="text-xs mb-1.5 flex justify-between gap-6">
          <span className="text-zinc-400">Capital Investido</span>
          <strong className="text-zinc-100 font-mono">{formatCurrency(cap)}</strong>
        </div>
        <div className="text-xs mb-1.5 flex justify-between gap-6">
          <span className="text-zinc-400">Rendimento Nominal</span>
          <strong className="text-emerald-400 font-mono">{formatCurrency(nominal?.value)}</strong>
        </div>
        <div className="text-xs mb-1.5 flex justify-between gap-6">
          <span className="text-zinc-400">Rendimento Real (IPCA)</span>
          <strong className="text-amber-500 font-mono">{formatCurrency(real?.value)}</strong>
        </div>
        <div className="text-xs font-bold flex justify-between gap-6 border-t border-zinc-800/80 pt-2 mt-2">
          <span className="text-zinc-200">Total Nominal</span>
          <strong className="text-emerald-400 font-mono">{formatCurrency(nominal?.value)}</strong>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 18, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: C.textMuted }} tickLine={false} interval="preserveStartEnd" />
          <YAxis
            tick={{ fontSize: 10, fill: C.textMuted }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
          />
          <Tooltip content={<Tip />} />
          {dobrouPt && dobrouPt.label && (
            <ReferenceDot x={dobrouPt.label} y={dobrouPt.total} r={7} fill="#10b981" stroke="#09090b" strokeWidth={2}>
              <Label value="Dobrou!" position="top" fontSize={10} fill="#10b981" fontWeight={700} />
            </ReferenceDot>
          )}
          {viradaPt && (
            <ReferenceLine x={viradaPt} stroke={C.amber} strokeDasharray="5 3" strokeWidth={1.5}>
              <Label value="Ponto Zero" position="insideTopRight" fontSize={10} fill={C.amber} fontWeight={700} />
            </ReferenceLine>
          )}
          <Area
            type="monotone"
            dataKey="Patrimônio Real descontado a Inflação"
            stroke="#047857"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            fill="url(#gReal)"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="Patrimônio Nominal"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#gNominal)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// CARDS DE RESULTADO
// ─────────────────────────────────────────────────────────
interface ResultCardsProps {
  patrimonioLiquido: number;
  patrimonioReal: number;
  totalInvestido: number;
  totalJuros: number;
  anos: number;
  valorInicial: number;
}
function ResultCards({ patrimonioLiquido, patrimonioReal, totalInvestido, totalJuros, anos, valorInicial }: ResultCardsProps) {
  const pctJuros = patrimonioLiquido > 0 ? Math.round((totalJuros / patrimonioLiquido) * 100) : 0;
  const mult = valorInicial > 0 ? (patrimonioLiquido / valorInicial).toFixed(1) : "—";
  
  return (
    <div className="space-y-4 mb-5">
      {/* Patrimônio Nominal */}
      <div className="bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 backdrop-blur-md border border-emerald-800/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(16,185,129,0.15)] text-left transition-all duration-300 hover:shadow-[0_0_40px_rgba(16,185,129,0.25)] hover:border-emerald-500/50">
        <div className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase mb-1.5">
          Patrimônio Nominal Final em {anos} {anos === 1 ? "ano" : "anos"}
        </div>
        <div className="font-mono text-3xl md:text-5xl font-black text-emerald-400 leading-none mb-2">
          {formatCurrency(patrimonioLiquido)}
        </div>
        <div className="text-xs text-zinc-400">
          {mult}× seu capital inicial · <span className="text-emerald-400 font-semibold">{pctJuros}%</span> desse valor vem puramente dos juros compostos!
        </div>
      </div>

      {/* Patrimônio Real vs Investido */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-xl p-4 transition-all duration-300 hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] hover:border-emerald-500/30">
          <div className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase mb-1">
            Capital Investido
          </div>
          <div className="font-mono text-lg font-bold text-zinc-100">
            {formatCurrency(totalInvestido)}
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5">Seu esforço acumulado</div>
        </div>
        
        <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-xl p-4 transition-all duration-300 hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] hover:border-emerald-500/30">
          <div className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase mb-1">
            Poder de Compra Real
          </div>
          <div className="font-mono text-lg font-bold text-amber-500">
            {formatCurrency(patrimonioReal)}
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5">Descontado a inflação</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="bg-emerald-950/40 border border-emerald-800/30 rounded-full px-3 py-1 text-xs text-emerald-400 font-semibold transition-all duration-300 hover:border-emerald-500/50">
          Rendimento Nominal: +{pctJuros}% em Juros
        </span>
        <span className="bg-zinc-900/60 border border-zinc-800/80 rounded-full px-3 py-1 text-xs text-zinc-300 font-semibold transition-all duration-300 hover:border-zinc-500/50">
          Resgate em {anos * 12} meses
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// CUSTO DA ESPERA
// ─────────────────────────────────────────────────────────
interface ProcrastCardProps {
  valorInicial: number;
  aporteMensal: number;
  taxaAnual: number;
  inflacaoAnual: number;
  anos: number;
  show: boolean;
  onToggle: () => void;
}
function ProcrastCard({ valorInicial, aporteMensal, taxaAnual, inflacaoAnual, anos, show, onToggle }: ProcrastCardProps) {
  const r1 = useMemo(() => {
    return CompoundInterestEngine.run({
      valorInicial,
      aporteMensal,
      prazoAnos: anos,
      taxaAnual,
      inflacaoAnual
    });
  }, [valorInicial, aporteMensal, anos, taxaAnual, inflacaoAnual]);

  const r2 = useMemo(() => {
    return CompoundInterestEngine.run({
      valorInicial: 0,
      aporteMensal,
      prazoAnos: Math.max(anos - 5, 1),
      taxaAnual,
      inflacaoAnual
    });
  }, [aporteMensal, anos, taxaAnual, inflacaoAnual]);

  const custo = Math.max(0, r1.patrimonioLiquido - r2.patrimonioLiquido);
  const dia = Math.round(custo / (5 * 365));
  
  return (
    <div className={`bg-zinc-900/40 backdrop-blur-md border rounded-2xl overflow-hidden mb-4 transition-all duration-300 ${
      show
        ? "border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
        : "border-zinc-800/80 hover:border-zinc-700 hover:shadow-[0_0_15px_rgba(16,185,129,0.05)]"
    }`}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between bg-transparent border-none cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <AlertTriangle size={18} className="text-amber-500 animate-pulse" />
          <div className="text-left">
            <div className="text-sm font-bold text-amber-500">E se eu tivesse começado há 5 anos?</div>
            <div className="text-[10px] text-zinc-500 tracking-wider uppercase font-semibold">O Custo da Espera / Procrastinação</div>
          </div>
        </div>
        
        <div className={`w-10 h-5.5 rounded-full relative transition-all duration-300 flex items-center px-0.5 cursor-pointer ${
          show ? "bg-amber-500" : "bg-zinc-850"
        }`}>
          <div className={`w-4 h-4 rounded-full bg-white transition-all duration-300 shadow ${
            show ? "translate-x-4.5" : "translate-x-0"
          }`} />
        </div>
      </button>
      
      {show && (
        <div className="border-t border-amber-500/20 px-5 py-4 bg-amber-500/5 text-left transition-all duration-300">
          <div className="font-mono text-2xl font-black text-amber-500 mb-1.5">
            {formatCurrency(custo)}
          </div>
          <div className="text-xs text-zinc-400 leading-relaxed mb-3">
            Este é o valor aproximado que você deixou de ganhar por não ter começado a investir <strong className="text-zinc-200">5 anos atrás</strong>, mesmo fazendo os mesmos aportes depois.
          </div>
          <div className="bg-amber-950/30 border border-amber-900/40 rounded-lg px-3 py-2 text-xs text-amber-500 font-semibold inline-block">
            ≈ {formatCurrency(dia)} perdidos por cada dia de atraso!
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// HP-12C MODO EDUCATIVO
// ─────────────────────────────────────────────────────────
function HP12CMode() {
  const [display, setDisplay] = useState("0.00");
  const [shiftF, setShiftF] = useState(false);
  const [shiftG, setShiftG] = useState(false);
  const [selectedKey, setKey] = useState<HpKey | null>(null);
  const [activeExemplo, setEx] = useState<number | null>(null);

  const handleKey = (key: HpKey) => {
    setKey(key);
    if (key.main === "f") { setShiftF(!shiftF); setShiftG(false); return; }
    if (key.main === "g") { setShiftG(!shiftG); setShiftF(false); return; }
    
    if (!isNaN(Number(key.main)) || key.main === "·") {
      setDisplay(prev => prev === "0.00" ? key.main : prev + key.main);
    }
    if (key.main === "ENTER") setDisplay("0.00");
    if (key.main === "CHS") setDisplay(prev => prev.startsWith("-") ? prev.slice(1) : "-" + prev);
    setShiftF(false); setShiftG(false);
  };

  const getBtnLabel = (key: HpKey) => {
    if (shiftF && key.f) return key.f;
    if (shiftG && key.g) return key.g;
    return key.main;
  };

  const getBtnCor = (key: HpKey) => {
    if (shiftF) return key.main === "f" ? "#F59E0B" : "rgba(63, 63, 70, 0.4)";
    if (shiftG) return key.main === "g" ? "#10B981" : "rgba(63, 63, 70, 0.4)";
    if (key.main === "f") return "#92400E";
    if (key.main === "g") return "#065F46";
    if (["PV", "PMT", "FV", "n", "i"].includes(key.main)) return "#1a3a6e";
    if (["+", "−", "×", "÷"].includes(key.main)) return "#3d2200";
    if (key.main === "ENTER") return "#1a2d4a";
    return "rgba(63, 63, 70, 0.2)";
  };

  return (
    <div className="text-left">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-white mb-1">HP-12C — Modo Educativo Integrado</h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Explore e entenda o funcionamento da lendária calculadora do mercado financeiro. Clique em qualquer tecla para ver a explicação de sua função.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-5 mb-6">
        {/* CALCULADORA */}
        <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-4.5 w-[260px] mx-auto md:mx-0 flex-shrink-0 shadow-lg hover:border-emerald-800/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.05)] transition-all duration-300">
          {/* Display */}
          <div className="bg-[#0b1c0b] border border-[#1a3a1a] rounded-xl p-3 mb-3">
            <div className="text-[9px] text-[#4a5f4a] font-bold tracking-widest mb-1 flex gap-3">
              {shiftF && <span className="text-amber-500">● f</span>}
              {shiftG && <span className="text-emerald-400">● g</span>}
              {!shiftF && !shiftG && <span>RPN STACK REG</span>}
            </div>
            <div className="font-mono text-2xl font-bold text-[#00ff88] text-right tracking-wide">
              {display}
            </div>
          </div>

          {/* Teclas em grid 5 colunas */}
          <div className="grid grid-cols-5 gap-1.5">
            {HP_KEYS.map((key, idx) => {
              const isSelected = selectedKey?.main === key.main;
              const bg = getBtnCor(key);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleKey(key)}
                  className="border rounded-lg py-1.5 px-0.5 cursor-pointer flex flex-col items-center gap-0.5 transition-all duration-300 hover:border-emerald-500"
                  style={{
                    backgroundColor: isSelected ? "rgba(16, 185, 129, 0.15)" : bg,
                    borderColor: isSelected ? "#10B981" : "rgba(63, 63, 70, 0.4)",
                    boxShadow: isSelected ? "0 0 10px rgba(16, 185, 129, 0.25)" : "none",
                  }}
                >
                  {key.f && <span className={`text-[7px] font-bold leading-none ${shiftF ? "text-amber-500" : "text-zinc-500"}`}>{key.f}</span>}
                  <span className="text-[10px] font-extrabold text-zinc-100 leading-none">{getBtnLabel(key)}</span>
                  {key.g && <span className={`text-[7px] font-bold leading-none ${shiftG ? "text-emerald-400" : "text-zinc-500"}`}>{key.g}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* PAINEL EXPLICATIVO */}
        <div className="space-y-3.5">
          {selectedKey ? (
            <div className="bg-zinc-900/40 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-5 animate-[fadeUp_0.2s_ease-out] text-left">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="bg-emerald-950/40 border border-emerald-800/30 rounded-lg px-3 py-1 font-mono text-sm font-black text-emerald-400">
                  {selectedKey.main}
                </div>
                {selectedKey.f && <Badge cor="#F59E0B">{selectedKey.f}</Badge>}
                {selectedKey.g && <Badge cor="#10B981">{selectedKey.g}</Badge>}
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">{selectedKey.explicacao}</p>
            </div>
          ) : (
            <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-5 flex items-center gap-3">
              <ChevronRight size={18} className="text-amber-500" />
              <div>
                <div className="font-bold text-xs text-amber-500 mb-0.5">Clique em qualquer tecla</div>
                <div className="text-[11px] text-zinc-400 leading-relaxed">
                  Entenda a lógica de funcionamento e os cálculos por trás de cada botão.
                </div>
              </div>
            </div>
          )}

          <div className="bg-amber-950/10 border border-amber-900/25 rounded-2xl p-4.5">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Lightbulb size={13} className="text-amber-500" />
              <span className="text-[9px] font-bold text-amber-500 tracking-wider uppercase">Lógica RPN</span>
            </div>
            <div className="text-xs text-zinc-400 leading-relaxed">
              A HP-12C usa <strong className="text-zinc-300">Notação Polonesa Reversa (RPN)</strong>. Você insere os números primeiro e depois as operações.
              Ex: Para fazer 5 + 3, tecle: <code className="bg-zinc-950 px-1.5 py-0.5 rounded font-mono text-emerald-400 text-[11px]">5 ENTER 3 +</code>.
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase mb-3">
          Exemplos Clássicos Passo a Passo
        </div>
        <div className="flex flex-col gap-2.5">
          {HP_EXEMPLOS.map((ex, i) => (
            <div
              key={i}
              className={`bg-zinc-900/40 backdrop-blur-md border rounded-xl overflow-hidden transition-all duration-300 ${
                activeExemplo === i ? "border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.05)]" : "border-zinc-800/80 hover:border-zinc-700"
              }`}
            >
              <button
                type="button"
                onClick={() => setEx(activeExemplo === i ? null : i)}
                className="w-full px-4.5 py-3.5 flex justify-between items-center bg-transparent border-none cursor-pointer"
              >
                <span className="font-bold text-xs text-zinc-200">{ex.titulo}</span>
                {activeExemplo === i ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
              </button>
              {activeExemplo === i && (
                <div className="border-t border-zinc-800/80 px-4.5 py-3.5 bg-zinc-950/20">
                  {ex.passos.map((p, j) => (
                    <div key={j} className="flex gap-2.5 items-start mb-2 last:mb-0">
                      <div className="w-4.5 h-4.5 rounded-full bg-emerald-950/40 border border-emerald-800/30 flex items-center justify-center text-[9px] font-bold text-emerald-400 flex-shrink-0">
                        {j + 1}
                      </div>
                      <code className="text-xs text-emerald-400 font-mono leading-relaxed">{p}</code>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// CENÁRIOS
// ─────────────────────────────────────────────────────────
const SCEN_COLORS = ["#3B82F6", "#10B981", "#F59E0B"];
const SCEN_NAMES = ["Cenário A", "Cenário B", "Cenário C"];

interface ScenarioItem {
  invId: string;
  pv: string;
  aporte: string;
  anos: string;
}

interface ScenarioRowProps {
  index: number;
  s: ScenarioItem;
  onChange: (s: ScenarioItem) => void;
  onRemove: () => void;
  canRemove: boolean;
}
function ScenarioRow({ index, s, onChange, onRemove, canRemove }: ScenarioRowProps) {
  const inv = INVESTIMENTOS.find(i => i.id === s.invId) || INVESTIMENTOS[1];
  const cor = SCEN_COLORS[index];
  
  // Calculate results using functional core and decimal engine
  const r = useMemo(() => {
    return CompoundInterestEngine.run({
      valorInicial: parseBRL(s.pv),
      aporteMensal: parseBRL(s.aporte),
      prazoAnos: parseBRL(s.anos) || 1,
      taxaAnual: inv.taxaAnualPadrao,
      inflacaoAnual: 4.5
    });
  }, [s.pv, s.aporte, s.anos, inv.taxaAnualPadrao]);

  return (
    <div
      className="bg-zinc-900/40 backdrop-blur-md rounded-2xl overflow-hidden mb-4 border transition-all duration-300 text-left"
      style={{
        borderColor: `${cor}30`,
        boxShadow: `0 4px 20px ${cor}10`
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${cor}60`;
        e.currentTarget.style.boxShadow = `0 8px 30px ${cor}20`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = `${cor}30`;
        e.currentTarget.style.boxShadow = `0 4px 20px ${cor}10`;
      }}
    >
      <div
        className="px-4.5 py-3 flex items-center justify-between border-b"
        style={{
          backgroundColor: `${cor}08`,
          borderColor: `${cor}20`
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cor, boxShadow: `0 0 8px ${cor}` }} />
          <span className="font-bold text-xs text-zinc-200">{SCEN_NAMES[index]}</span>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="bg-transparent border-none cursor-pointer text-red-500 hover:text-red-400 transition-colors p-0.5"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="p-4.5 space-y-4">
        <InvSelect value={s.invId} onChange={i => onChange({ ...s, invId: i.id })} />
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <NumInput
            label="Capital Inicial"
            emoji="💰"
            hint="Investimento inicial"
            value={s.pv}
            onChange={v => onChange({ ...s, pv: v })}
            placeholder="5000"
            min={0}
            max={100000}
            step={1000}
          />
          <NumInput
            label="Aporte Mensal"
            emoji="📅"
            hint="Investimento por mês"
            value={s.aporte}
            onChange={v => onChange({ ...s, aporte: v })}
            placeholder="300"
            min={0}
            max={20000}
            step={100}
          />
          <NumInput
            label="Prazo"
            emoji="⏳"
            hint="Período total"
            value={s.anos}
            onChange={v => onChange({ ...s, anos: v })}
            prefix=""
            suffix="anos"
            placeholder="10"
            min={1}
            max={40}
            step={1}
          />
        </div>

        <div
          className="border rounded-xl p-3.5 mt-1 text-left"
          style={{
            backgroundColor: `${cor}05`,
            borderColor: `${cor}15`
          }}
        >
          <div className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase mb-1">
            Resultado Projetado ({parseBRL(s.anos) || 1} anos) · {inv.nome}
          </div>
          <div className="font-mono text-xl font-extrabold" style={{ color: cor }}>
            {formatCurrency(r.patrimonioLiquido)}
          </div>
          <div className="text-[10px] text-zinc-400 mt-1.5 flex gap-4 flex-wrap">
            <span>Total Investido: <strong className="text-zinc-300">{formatCurrency(r.totalInvestido)}</strong></span>
            <span>Juros Ganhos: <strong style={{ color: cor }}>{formatCurrency(r.totalJuros)}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CompareChartProps {
  scenarios: ScenarioItem[];
}
function CompareChart({ scenarios }: CompareChartProps) {
  const data = useMemo(() => {
    const results = scenarios.map(s => {
      const inv = INVESTIMENTOS.find(i => i.id === s.invId) || INVESTIMENTOS[1];
      return CompoundInterestEngine.run({
        valorInicial: parseBRL(s.pv),
        aporteMensal: parseBRL(s.aporte),
        prazoAnos: parseBRL(s.anos) || 1,
        taxaAnual: inv.taxaAnualPadrao,
        inflacaoAnual: 4.5
      });
    });

    const maxLen = Math.max(...results.map(r => r.tabelaMesAMes.length));
    const step = Math.max(1, Math.floor(maxLen / 60));
    
    return Array.from({ length: Math.ceil(maxLen / step) }, (_, idx) => {
      const ri = idx * step;
      const snapshotSample = results[0]?.tabelaMesAMes[Math.min(ri, results[0].tabelaMesAMes.length - 1)];
      const row: any = {
        label: snapshotSample?.mes % 12 === 0 ? (snapshotSample?.mes === 0 ? "Hoje" : `Ano ${snapshotSample?.mes / 12}`) : ""
      };
      
      results.forEach((r, i) => {
        const pt = r.tabelaMesAMes[Math.min(ri, r.tabelaMesAMes.length - 1)];
        row[`s${i}`] = pt ? pt.total : null;
      });
      return row;
    });
  }, [scenarios]);

  const Tip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-3.5 shadow-xl text-left">
        {payload.map((p: any, i: number) => p.value != null && (
          <div key={i} className="flex justify-between gap-6 text-xs mb-1.5 last:mb-0">
            <span style={{ color: SCEN_COLORS[i] }}>● {SCEN_NAMES[i]}</span>
            <strong className="text-zinc-100 font-mono">{formatCurrency(p.value)}</strong>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
          <defs>
            {SCEN_COLORS.map((cor, i) => (
              <linearGradient key={i} id={`gs${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={cor} stopOpacity={0.2} />
                <stop offset="95%" stopColor={cor} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: C.textMuted }} tickLine={false} interval="preserveStartEnd" />
          <YAxis
            tick={{ fontSize: 10, fill: C.textMuted }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
          />
          <Tooltip content={<Tip />} />
          {scenarios.map((_, i) => (
            <Area key={i} type="monotone" dataKey={`s${i}`} stroke={SCEN_COLORS[i]} fill={`url(#gs${i})`} strokeWidth={2.5} dot={false} connectNulls />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MATRIZ DE INVESTIMENTOS
// ─────────────────────────────────────────────────────────
function InvestTable() {
  return (
    <div className="text-left">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-white mb-1">Matriz Geral de Investimentos</h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Comparativo educacional simplificado baseado no mercado nacional. Sempre analise seu perfil antes de investir!
        </p>
      </div>
      
      <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-2xl overflow-hidden mb-5 transition-all duration-300 hover:border-emerald-800/30">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-950/60 border-b border-zinc-800/80">
                {["Investimento", "Risco", "Liquidez", "Taxa Ref.", "Prazo", "FGC", "IR"].map(h => (
                  <th key={h} className="px-3.5 py-3 text-left text-zinc-500 font-bold tracking-wider uppercase text-[10px] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INVESTIMENTOS.map((inv, i) => (
                <tr key={inv.id} className={`border-b border-zinc-800/80 hover:bg-zinc-850/30 transition-all duration-300 last:border-b-0 ${i % 2 === 0 ? "bg-transparent" : "bg-zinc-950/20"}`}>
                  <td className="px-3.5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: inv.cor, boxShadow: `0 0 5px ${inv.cor}` }} />
                      <div>
                        <div className="font-bold text-zinc-200">{inv.nome}</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5 leading-tight">{inv.desc}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3.5 py-3"><Badge cor={RCOLORS[inv.risco]}>{RLABELS[inv.risco]}</Badge></td>
                  <td className="px-3.5 py-3 text-zinc-400 font-mono text-[11px]">{inv.liquidez}</td>
                  <td className="px-3.5 py-3 font-mono font-bold" style={{ color: inv.cor }}>{formatPercentage(inv.taxaAnualPadrao, 2)} a.a.</td>
                  <td className="px-3.5 py-3 text-zinc-400 text-[11px]">{inv.prazo}</td>
                  <td className="px-3.5 py-3 text-center">{inv.fgc ? <CheckCircle size={14} className="text-emerald-500 inline" /> : <span className="text-zinc-600">—</span>}</td>
                  <td className="px-3.5 py-3">{inv.ir ? <span className="text-[10px] text-red-400 font-bold">Sim (Regressivo)</span> : <Badge cor="#10B981">Isento</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Conservador", icon: Shield, cor: "#3B82F6", ativos: ["Poupança", "Tesouro Selic", "CDB"], desc: "Foco total na preservação do patrimônio e liquidez." },
          { label: "Moderado", icon: Target, cor: C.green, ativos: ["CDB", "LCI/LCA", "Multimercado"], desc: "Equilíbrio entre segurança e maior rentabilidade de médio prazo." },
          { label: "Arrojado", icon: TrendingUp, cor: C.amber, ativos: ["Multimercado", "FIIs", "Ações"], desc: "Horizonte de longo prazo visando à multiplicação patrimonial." },
        ].map(p => (
          <div key={p.label} className="bg-zinc-900/20 border border-zinc-800/80 hover:border-emerald-800/30 rounded-xl p-4 transition-all duration-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.05)]">
            <div className="flex items-center gap-2 mb-2">
              <p.icon size={15} style={{ color: p.cor }} />
              <span className="font-bold text-sm text-zinc-200">{p.label}</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-3.5">{p.desc}</p>
            {p.ativos.map(a => (
              <div key={a} className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1 last:mb-0">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.cor }} />
                {a}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN SIMULATOR CONTAINER
// ─────────────────────────────────────────────────────────
const DEFAULT_S: ScenarioItem = { invId: "selic", pv: "5000", aporte: "300", anos: "10" };

export function Simulator() {
  const [tab, setTab] = useState<string>("assistente");
  const [invId, setInvId] = useState<string>("selic");
  const [showEspera, setEspera] = useState(false);
  const [showResult, setResult] = useState(false);
  const [scenarios, setScen] = useState<ScenarioItem[]>([{ ...DEFAULT_S }]);

  // Reactive simulation hook connected to the core engine and Bacen API
  const {
    inputs,
    setValorInicial,
    setAporteMensal,
    setPrazoAnos,
    setTaxaAnual,
    setInflacaoAnual,
    outputs,
    chartData,
    isLoading
  } = useSimulation();

  // Handle Investment selection that updates taxaAnual inside the hook
  const handleInvestmentChange = (selectedInv: Investimento) => {
    setInvId(selectedInv.id);
    setTaxaAnual(selectedInv.taxaAnualPadrao);
  };

  // Encontrar Mês de Dobra e Mês de Ponto Zero
  const dobrouMes = useMemo(() => {
    let doubleMonth: number | null = null;
    for (const snapshot of outputs.tabelaMesAMes) {
      if (snapshot.mes > 0 && snapshot.total >= snapshot.capital * 2 && snapshot.capital > 0) {
        doubleMonth = snapshot.mes;
        break;
      }
    }
    return doubleMonth;
  }, [outputs.tabelaMesAMes]);

  const viradaMes = useMemo(() => {
    let crossoverMonth: number | null = null;
    const monthlyRateFraction = inputs.taxaAnual / 12 / 100;
    
    for (let i = 1; i < outputs.tabelaMesAMes.length; i++) {
      const balanceBeforeAporte = outputs.tabelaMesAMes[i - 1].total;
      const monthlyYield = balanceBeforeAporte * monthlyRateFraction;
      
      if (inputs.aporteMensal > 0 && monthlyYield >= inputs.aporteMensal) {
        crossoverMonth = outputs.tabelaMesAMes[i].mes;
        break;
      }
    }
    return crossoverMonth;
  }, [outputs.tabelaMesAMes, inputs.taxaAnual, inputs.aporteMensal]);

  const TABS = [
    { id: "assistente", label: "Assistente", icon: Zap },
    { id: "cenarios", label: "Cenários", icon: BarChart2 },
    { id: "tabela", label: "Investimentos", icon: Target },
    { id: "hp12c", label: "HP-12C", icon: Calculator },
  ];

  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-100 font-sans">
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:#09090b}
        ::-webkit-scrollbar-thumb{background:rgba(63,63,70,0.5);border-radius:2px}
        input[type=text]:focus,input[type=number]:focus{outline:none}
        button{font-family:inherit}
        .animate-spin-slow { animation: spin 4s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* HEADER */}
      <div className="bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-800/80 sticky top-0 z-50 py-3 px-5 transition-all duration-300">
        <div className="max-w-[860px] mx-auto flex items-center justify-between flex-wrap gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8.5 h-8.5 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              <span className="color-[#fff] font-black text-xs tracking-tighter">P0</span>
            </div>
            <div className="text-left">
              <div className="font-extrabold text-sm tracking-tight text-white">Ponto Zero</div>
              <div className="text-[9px] text-zinc-500">Simulador Financeiro</div>
            </div>
          </div>
          <div className="flex gap-1 bg-zinc-900/60 rounded-full p-1 border border-zinc-800/60 flex-wrap">
            {TABS.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => { setTab(t.id); setResult(false); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                  tab === t.id
                    ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
              >
                <t.icon size={12} />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[860px] mx-auto px-4 py-7 pb-20">

        {/* ── ASSISTENTE ── */}
        {tab === "assistente" && (
          <>
            {!showResult ? (
              <div className="animate-[fadeUp_350ms_ease-out]">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-950/30 border border-emerald-800/30 rounded-full px-4 py-1.5 mb-4.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                    <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">
                      {isLoading ? "Carregando Taxas..." : "Taxas Reais Ativas"}
                    </span>
                  </div>
                  <h1 className="font-sans text-3xl md:text-5xl font-black text-white leading-tight mb-3.5 tracking-tight">
                    Entenda seu <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500 font-extrabold italic">dinheiro</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-zinc-400 max-w-[420px] mx-auto leading-relaxed">
                    Projete seu patrimônio usando o motor matemático com precisão monetária e taxas do Banco Central.
                  </p>
                </div>

                <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 mb-4 transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:border-emerald-800/30">
                  <InvSelect value={invId} onChange={handleInvestmentChange} />
                  
                  <NumInput
                    label="Quanto você tem hoje?"
                    emoji="💰"
                    value={inputs.valorInicial}
                    onChange={v => setValorInicial(parseBRL(v))}
                    placeholder="5.000"
                    min={0}
                    max={250000}
                    step={1000}
                  />
                  
                  <NumInput
                    label="Quanto coloca por mês?"
                    emoji="📅"
                    value={inputs.aporteMensal}
                    onChange={v => setAporteMensal(parseBRL(v))}
                    placeholder="300"
                    min={0}
                    max={50000}
                    step={100}
                  />
                  
                  <NumInput
                    label="Por quanto tempo?"
                    emoji="⏳"
                    value={inputs.prazoAnos}
                    onChange={v => setPrazoAnos(parseBRL(v))}
                    prefix=""
                    suffix="anos"
                    placeholder="10"
                    min={1}
                    max={50}
                    step={1}
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5">
                    <NumInput
                      label="Taxa de Rendimento Anual"
                      emoji="📈"
                      value={inputs.taxaAnual}
                      onChange={v => setTaxaAnual(parseBRL(v))}
                      prefix=""
                      suffix="% a.a."
                      placeholder="10.5"
                      min={0}
                      max={30}
                      step={0.1}
                      benchmarks={[
                        { label: "Poupança", value: 6.17 },
                        { label: "CDI", value: 10.50 }
                      ]}
                    />
                    <NumInput
                      label="Estimativa de Inflação Anual"
                      emoji="💸"
                      value={inputs.inflacaoAnual}
                      onChange={v => setInflacaoAnual(parseBRL(v))}
                      prefix=""
                      suffix="% a.a."
                      placeholder="4.5"
                      min={0}
                      max={20}
                      step={0.1}
                      benchmarks={[
                        { label: "Meta IPCA", value: 3.00 },
                        { label: "IPCA Atual", value: 4.50 }
                      ]}
                    />
                  </div>

                  <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-xl p-3.5 mt-2 flex justify-between items-center flex-wrap gap-2">
                    <span className="text-xs text-zinc-400 font-semibold">Prévia do resgate líquido:</span>
                    <span className="font-mono text-base font-extrabold text-emerald-400">{formatCurrency(outputs.patrimonioLiquido)}</span>
                  </div>
                </div>

                <ProcrastCard
                  valorInicial={inputs.valorInicial}
                  aporteMensal={inputs.aporteMensal}
                  taxaAnual={inputs.taxaAnual}
                  inflacaoAnual={inputs.inflacaoAnual}
                  anos={inputs.prazoAnos}
                  show={showEspera}
                  onToggle={() => setEspera(!showEspera)}
                />

                <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-xl p-4 mb-5 font-mono text-left transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                  <div className="text-[9px] text-zinc-400 font-bold tracking-widest uppercase mb-1.5">Fórmulas de Cálculo Decoupled</div>
                  <div className="text-xs text-emerald-400 font-semibold mb-1">FV = PV × (1+i)ⁿ + PMT × [(1+i)ⁿ − 1] / i</div>
                  <div className="text-[10px] text-zinc-400">Modo Real Fisher: r_real = (nom - inf) / (1 + inf)</div>
                </div>

                <button
                  type="button"
                  onClick={() => setResult(true)}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl text-sm font-bold text-white cursor-pointer shadow-[0_4px_20px_rgba(16,185,129,0.25)] hover:shadow-[0_4px_30px_rgba(16,185,129,0.4)] hover:brightness-110 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  ✨ Visualizar evolução detalhada
                </button>
              </div>
            ) : (
              <div className="animate-[fadeUp_400ms_ease-out]">
                <button
                  type="button"
                  onClick={() => setResult(false)}
                  className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer text-zinc-500 hover:text-zinc-300 text-xs font-semibold transition-all duration-300 mb-5 p-0"
                >
                  <RefreshCw size={12} className="animate-spin-slow" /> Voltar e ajustar valores
                </button>
                
                <ResultCards
                  patrimonioLiquido={outputs.patrimonioLiquido}
                  patrimonioReal={outputs.patrimonioReal}
                  totalInvestido={outputs.totalInvestido}
                  totalJuros={outputs.totalJuros}
                  anos={inputs.prazoAnos}
                  valorInicial={inputs.valorInicial}
                />

                <div className="bg-zinc-900/40 backdrop-blur-md border border-emerald-800/30 rounded-2xl p-5 mb-5 flex gap-3.5 items-start text-left transition-all duration-300 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                  <div className="text-2xl select-none flex-shrink-0">🧠</div>
                  <div>
                    <div className="text-xs font-bold text-emerald-400 mb-1.5">
                      {outputs.totalJuros > outputs.totalInvestido ? `O efeito dos juros compostos superou seus depósitos!` : `Os juros já representam boa parte do seu montante!`}
                    </div>
                    <div className="text-xs text-zinc-400 leading-relaxed">
                      Você acumulou <strong className="text-zinc-200">{formatCurrency(outputs.totalJuros)}</strong> apenas em juros reais.
                      {viradaMes && (
                        <>
                          {" "}Seu <strong className="text-amber-500">Ponto Zero</strong> (quando os juros rendem mais do que o seu aporte mensal) ocorrerá em <strong className="text-amber-500 font-semibold">{formatTimeSpan(viradaMes)}</strong>!
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-5 mb-4 text-left transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]">
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <BarChart2 size={16} className="text-emerald-500" />
                    <span className="font-bold text-sm text-zinc-100">Linha do Tempo de Investimentos</span>
                    <div className="sm:ml-auto flex gap-3.5 mt-2 sm:mt-0">
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                        <div className="w-2.5 h-2.5 rounded-sm bg-emerald-700" style={{ border: "1px dashed rgba(255,255,255,0.2)" }} />
                        Poder de Compra Real
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                        <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                        Patrimônio Nominal
                      </div>
                    </div>
                  </div>
                  <MainChart chartData={chartData} viradaMes={viradaMes} dobrouMes={dobrouMes} />
                </div>

                <ProcrastCard
                  valorInicial={inputs.valorInicial}
                  aporteMensal={inputs.aporteMensal}
                  taxaAnual={inputs.taxaAnual}
                  inflacaoAnual={inputs.inflacaoAnual}
                  anos={inputs.prazoAnos}
                  show={showEspera}
                  onToggle={() => setEspera(!showEspera)}
                />
              </div>
            )}
          </>
        )}

        {/* ── CENÁRIOS ── */}
        {tab === "cenarios" && (
          <div className="animate-[fadeUp_300ms_ease-out]">
            <div className="mb-5 text-left">
              <h2 className="text-lg font-bold text-white mb-1">Comparador de Estratégias</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">Simule até 3 cenários diferentes de investimentos em paralelo.</p>
            </div>
            {scenarios.map((s, i) => (
              <ScenarioRow
                key={i}
                index={i}
                s={s}
                onChange={u => setScen(prev => prev.map((x, j) => j === i ? u : x))}
                onRemove={() => setScen(prev => prev.filter((_, j) => j !== i))}
                canRemove={scenarios.length > 1}
              />
            ))}
            {scenarios.length < 3 && (
              <button
                type="button"
                onClick={() => {
                  const base = scenarios[scenarios.length - 1];
                  const nextIndex = (INVESTIMENTOS.findIndex(i => i.id === base.invId) + 2) % INVESTIMENTOS.length;
                  const next = INVESTIMENTOS[nextIndex];
                  setScen(prev => [...prev, { ...base, invId: next.id }]);
                }}
                className="w-full py-4 bg-transparent border-2 border-dashed border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-950/10 rounded-2xl cursor-pointer text-zinc-550 hover:text-emerald-400 text-xs font-bold flex items-center justify-center gap-2 mb-4 transition-all duration-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.05)]"
              >
                <Plus size={18} /> Adicionar outro cenário para comparar
              </button>
            )}
            
            <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-5 text-left transition-all duration-300 hover:border-emerald-800/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.05)]">
              <div className="flex items-center gap-2 mb-4.5 flex-wrap">
                <BarChart2 size={16} className="text-emerald-500" />
                <span className="font-bold text-xs sm:text-sm text-zinc-100">Gráfico de Evolução Comparativa</span>
                <div className="sm:ml-auto flex gap-3 mt-2 sm:mt-0 flex-wrap">
                  {scenarios.map((_, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.72rem", color: C.textSoft }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: SCEN_COLORS[i] }} />{SCEN_NAMES[i]}
                    </div>
                  ))}
                </div>
              </div>
              <CompareChart scenarios={scenarios} />
            </div>
          </div>
        )}

        {/* ── INVESTIMENTOS ── */}
        {tab === "tabela" && (
          <div className="animate-[fadeUp_300ms_ease-out]">
            <InvestTable />
          </div>
        )}

        {/* ── HP-12C ── */}
        {tab === "hp12c" && (
          <div className="animate-[fadeUp_300ms_ease-out]">
            <HP12CMode />
          </div>
        )}
      </div>
    </div>
  );
}
export default Simulator;
