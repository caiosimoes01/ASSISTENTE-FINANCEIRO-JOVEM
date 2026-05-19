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
import { useSimulation } from "@hooks/useSimulation";
import { CompoundInterestEngine } from "@core/finance/engine/CompoundInterestEngine";
import { formatCurrency, formatPercentage, parseBRL, formatTimeSpan } from "@utils/formatadores";
import type { SnapshotMensal } from "../../types/financeiro";

// ─────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────
const C = {
  bg: "#0A0F1A",
  surface: "#111827",
  surfaceEl: "#1A2235",
  border: "#1E2D45",
  borderLt: "#2A3F5F",
  green: "#10B981",
  greenDark: "#059669",
  greenGlow: "rgba(16,185,129,0.15)",
  greenDim: "rgba(16,185,129,0.08)",
  blue: "#3B82F6",
  blueDim: "rgba(59,130,246,0.1)",
  amber: "#F59E0B",
  amberDim: "rgba(245,158,11,0.1)",
  red: "#EF4444",
  redDim: "rgba(239,68,68,0.1)",
  text: "#F1F5F9",
  textSoft: "#94A3B8",
  textMuted: "#475569",
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
  { id: "poupanca", nome: "Poupança", taxaAnualPadrao: 6.17, risco: 1, liquidez: "D+0", prazo: "Curto", fgc: true, ir: false, cor: "#6EE7B7", desc: "Segurança máxima, menor rendimento anual." },
  { id: "selic", nome: "Tesouro Selic", taxaAnualPadrao: 10.50, risco: 1, liquidez: "D+1", prazo: "Curto/Médio", fgc: false, ir: true, cor: "#3B82F6", desc: "Garantido pelo governo federal. Acompanha a Selic." },
  { id: "cdb", nome: "CDB 100% CDI", taxaAnualPadrao: 10.50, risco: 2, liquidez: "D+0/D+1", prazo: "Curto/Médio", fgc: true, ir: true, cor: "#818CF8", desc: "Coberto pelo FGC até R$ 250k por instituição financeira." },
  { id: "lci", nome: "LCI / LCA", taxaAnualPadrao: 9.45, risco: 2, liquidez: "90+ dias", prazo: "Médio", fgc: true, ir: false, cor: "#38BDF8", desc: "Isento de Imposto de Renda. Carência mínima obrigatória." },
  { id: "multi", nome: "Multimercado", taxaAnualPadrao: 12.68, risco: 3, liquidez: "D+30", prazo: "Médio/Longo", fgc: false, ir: true, cor: "#F59E0B", desc: "Diversificado. Rentabilidade varia conforme gestão do fundo." },
  { id: "fiis", nome: "FIIs (Fundos Imobiliários)", taxaAnualPadrao: 10.70, risco: 4, liquidez: "D+2", prazo: "Longo", fgc: false, ir: false, cor: "#A78BFA", desc: "Rendimento mensal isento de Imposto de Renda para pessoa física." },
  { id: "acoes", nome: "Ações / ETFs", taxaAnualPadrao: 15.39, risco: 5, liquidez: "D+2", prazo: "Longo (5+a)", fgc: false, ir: true, cor: "#F87171", desc: "Maior potencial de crescimento, sujeito à volatilidade da bolsa." },
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
function Badge({ children, cor = C.green }: BadgeProps) {
  return (
    <span style={{
      background: `${cor}20`,
      color: cor,
      border: `1px solid ${cor}40`,
      fontSize: "0.65rem",
      fontWeight: 700,
      padding: "2px 8px",
      borderRadius: 999,
      letterSpacing: "0.04em",
      whiteSpace: "nowrap"
    }}>
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
}
function NumInput({ label, hint, emoji, value, onChange, prefix = "R$", suffix = "", placeholder = "0" }: NumInputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ fontSize: "0.78rem", fontWeight: 600, color: C.text, display: "flex", alignItems: "center", gap: 6 }}>
          {emoji && <span style={{ fontSize: "0.9rem" }}>{emoji}</span>} {label}
          {hint && <span style={{ fontSize: "0.68rem", color: C.textMuted, fontWeight: 400 }}>{hint}</span>}
        </span>
      </div>
      <div style={{
        display: "flex",
        alignItems: "center",
        background: C.surfaceEl,
        border: `1.5px solid ${focused ? C.green : C.border}`,
        borderRadius: 10,
        overflow: "hidden",
        transition: "border-color 0.15s",
        boxShadow: focused ? `0 0 0 3px ${C.greenDim}` : "none",
      }}>
        {prefix && (
          <span style={{
            padding: "0 12px",
            fontSize: "0.85rem",
            color: C.textMuted,
            borderRight: `1px solid ${C.border}`,
            height: "100%",
            display: "flex",
            alignItems: "center",
            background: C.surface,
            paddingTop: 12,
            paddingBottom: 12
          }}>
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
          style={{
            flex: 1,
            padding: "12px 14px",
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: "1rem",
            fontFamily: "monospace",
            fontWeight: 700,
            color: C.text,
            minWidth: 0
          }}
        />
        {suffix && <span style={{ padding: "0 12px", fontSize: "0.78rem", color: C.textMuted }}>{suffix}</span>}
      </div>
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
      background: C.surface,
      border: `1.5px solid ${C.borderLt}`,
      borderRadius: 12,
      boxShadow: "0 20px 60px rgba(0,0,0,0.75)",
      zIndex: 99999,
    };
  };

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: "0.68rem", fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
        Investimento de Referência
      </div>

      <button
        ref={btnRef}
        type="button"
        onClick={handleToggle}
        style={{
          width: "100%",
          padding: "11px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: C.surfaceEl,
          border: `1.5px solid ${open ? inv.cor + "80" : C.border}`,
          borderRadius: 10,
          cursor: "pointer",
          transition: "border-color 0.15s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <div style={{ width: 9, height: 9, borderRadius: "50%", background: inv.cor, boxShadow: `0 0 6px ${inv.cor}`, flexShrink: 0 }} />
          <span style={{ fontWeight: 700, fontSize: "0.88rem", color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {inv.nome}
          </span>
          <Badge cor={RCOLORS[inv.risco]}>{RLABELS[inv.risco]}</Badge>
          {!inv.ir && <Badge cor={C.green}>Isento IR</Badge>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: 8 }}>
          <span style={{ fontFamily: "monospace", fontSize: "0.82rem", color: inv.cor, fontWeight: 700 }}>
            {formatPercentage(inv.taxaAnualPadrao, 2)} a.a.
          </span>
          {open ? <ChevronUp size={13} color={C.textMuted} /> : <ChevronDown size={13} color={C.textMuted} />}
        </div>
      </button>

      {open && (
        <div style={dropStyle()} onMouseDown={e => e.stopPropagation()}>
          {INVESTIMENTOS.map(i => (
            <button
              key={i.id}
              type="button"
              onClick={() => { onChange(i); setOpen(false); }}
              style={{
                width: "100%",
                padding: "11px 14px",
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                background: i.id === value ? `${i.cor}12` : "transparent",
                border: "none",
                borderBottom: `1px solid ${C.border}`,
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.1s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = `${i.cor}18`}
              onMouseLeave={e => e.currentTarget.style.background = i.id === value ? `${i.cor}12` : "transparent"}
            >
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: i.cor, flexShrink: 0, marginTop: 4 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 2 }}>
                  <span style={{ fontWeight: 700, fontSize: "0.82rem", color: C.text }}>{i.nome}</span>
                  <Badge cor={RCOLORS[i.risco]}>{RLABELS[i.risco]}</Badge>
                  {!i.ir && <Badge cor={C.green}>Isento IR</Badge>}
                </div>
                <div style={{ fontSize: "0.7rem", color: C.textMuted }}>{i.desc}</div>
              </div>
              <span style={{ fontFamily: "monospace", fontSize: "0.82rem", color: i.cor, fontWeight: 700, flexShrink: 0, marginLeft: 6 }}>
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
  tabela: SnapshotMensal[];
  viradaMes: number | null;
  dobrouMes: number | null;
}
function MainChart({ tabela, viradaMes, dobrouMes }: MainChartProps) {
  const step = Math.max(1, Math.floor(tabela.length / 72));
  const data = useMemo(() => {
    return tabela.map((snapshot) => ({
      ...snapshot,
      label: snapshot.mes % 12 === 0 ? (snapshot.mes === 0 ? "Hoje" : `Ano ${snapshot.mes / 12}`) : ""
    })).filter((_, i) => i % step === 0 || i === tabela.length - 1);
  }, [tabela, step]);

  const dobrouPt = useMemo(() => {
    if (dobrouMes === null) return null;
    const snap = tabela[Math.min(dobrouMes, tabela.length - 1)];
    return {
      label: snap.mes % 12 === 0 ? (snap.mes === 0 ? "Hoje" : `Ano ${snap.mes / 12}`) : "",
      total: snap.total
    };
  }, [dobrouMes, tabela]);

  const viradaPt = useMemo(() => {
    if (viradaMes === null) return null;
    const snap = tabela[Math.min(viradaMes, tabela.length - 1)];
    return snap.mes % 12 === 0 ? (snap.mes === 0 ? "Hoje" : `Ano ${snap.mes / 12}`) : `Mês ${snap.mes}`;
  }, [viradaMes, tabela]);

  const Tip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const cap = payload.find((p: any) => p.dataKey === "capital");
    const tot = payload.find((p: any) => p.dataKey === "total");
    const dataItem = payload[0]?.payload;
    return (
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 16px", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
        <div style={{ fontSize: "0.7rem", color: C.textMuted, marginBottom: 8 }}>{dataItem?.label || `Mês ${dataItem?.mes}`}</div>
        <div style={{ fontSize: "0.8rem", marginBottom: 3, display: "flex", justifyContent: "space-between", gap: 14 }}>
          <span style={{ color: C.blue }}>Capital</span>
          <strong style={{ color: C.text, fontFamily: "monospace" }}>{formatCurrency(cap?.value)}</strong>
        </div>
        <div style={{ fontSize: "0.8rem", marginBottom: 3, display: "flex", justifyContent: "space-between", gap: 14 }}>
          <span style={{ color: C.green }}>Juros</span>
          <strong style={{ color: C.text, fontFamily: "monospace" }}>{formatCurrency((tot?.value || 0) - (cap?.value || 0))}</strong>
        </div>
        <div style={{ fontSize: "0.88rem", fontWeight: 700, display: "flex", justifyContent: "space-between", gap: 14, borderTop: `1px solid ${C.border}`, paddingTop: 6, marginTop: 4 }}>
          <span style={{ color: C.textSoft }}>Total</span>
          <strong style={{ color: C.green, fontFamily: "monospace" }}>{formatCurrency(tot?.value)}</strong>
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 18, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={C.blue} stopOpacity={0.3} />
              <stop offset="95%" stopColor={C.blue} stopOpacity={0.03} />
            </linearGradient>
            <linearGradient id="gJ" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={C.green} stopOpacity={0.35} />
              <stop offset="95%" stopColor={C.green} stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: C.textMuted }} tickLine={false} interval="preserveStartEnd" />
          <YAxis
            tick={{ fontSize: 10, fill: C.textMuted }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
          />
          <Tooltip content={<Tip />} />
          {dobrouPt && dobrouPt.label && (
            <ReferenceDot x={dobrouPt.label} y={dobrouPt.total} r={7} fill={C.green} stroke={C.bg} strokeWidth={2}>
              <Label value="Dobrou!" position="top" fontSize={10} fill={C.green} fontWeight={700} />
            </ReferenceDot>
          )}
          {viradaPt && (
            <ReferenceLine x={viradaPt} stroke={C.amber} strokeDasharray="5 3" strokeWidth={1.5}>
              <Label value="Ponto Zero" position="insideTopRight" fontSize={10} fill={C.amber} fontWeight={700} />
            </ReferenceLine>
          )}
          <Area type="monotone" dataKey="capital" stroke={C.blue} fill="url(#gC)" strokeWidth={2} dot={false} />
          <Area type="monotone" dataKey="total" stroke={C.green} fill="url(#gJ)" strokeWidth={2.5} dot={false} />
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
    <div style={{ marginBottom: 20 }}>
      {/* Patrimônio Nominal */}
      <div style={{
        background: `linear-gradient(135deg,${C.surface},${C.surfaceEl})`,
        border: `1px solid ${C.green}40`,
        borderRadius: 16,
        padding: "24px",
        marginBottom: 12,
        boxShadow: `0 0 40px ${C.greenGlow}`
      }}>
        <div style={{ fontSize: "0.65rem", color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
          Patrimônio Nominal Final em {anos} {anos === 1 ? "ano" : "anos"}
        </div>
        <div style={{ fontFamily: "monospace", fontSize: "clamp(2rem,6vw,2.8rem)", fontWeight: 800, color: C.green, lineHeight: 1, marginBottom: 8 }}>
          {formatCurrency(patrimonioLiquido)}
        </div>
        <div style={{ fontSize: "0.8rem", color: C.textSoft }}>
          {mult}× seu capital inicial · {pctJuros}% desse valor vem puramente dos juros compostos!
        </div>
      </div>

      {/* Patrimônio Real vs Investido */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div style={{ background: C.surface, border: `1px solid ${C.blue}30`, borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ fontSize: "0.62rem", color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
            Capital Investido
          </div>
          <div style={{ fontFamily: "monospace", fontSize: "1.2rem", fontWeight: 700, color: C.blue }}>
            {formatCurrency(totalInvestido)}
          </div>
          <div style={{ fontSize: "0.68rem", color: C.textMuted, marginTop: 2 }}>Seu esforço acumulado</div>
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.amber}30`, borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ fontSize: "0.62rem", color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
            Poder de Compra Real
          </div>
          <div style={{ fontFamily: "monospace", fontSize: "1.2rem", fontWeight: 700, color: C.amber }}>
            {formatCurrency(patrimonioReal)}
          </div>
          <div style={{ fontSize: "0.68rem", color: C.textMuted, marginTop: 2 }}>Descontado a inflação</div>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <div style={{ background: C.greenDim, border: `1px solid ${C.green}30`, borderRadius: 999, padding: "5px 12px", fontSize: "0.72rem", color: C.green, fontWeight: 600 }}>
          Rendimento Nominal: +{pctJuros}% em Juros
        </div>
        <div style={{ background: C.blueDim, border: `1px solid ${C.blue}30`, borderRadius: 999, padding: "5px 12px", fontSize: "0.72rem", color: C.blue, fontWeight: 600 }}>
          Resgate em {anos * 12} meses
        </div>
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
    <div style={{ background: C.surface, border: `1px solid ${show ? C.amber + "60" : C.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 16, transition: "border-color 0.2s" }}>
      <button type="button" onClick={onToggle} style={{ width: "100%", padding: "13px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "transparent", border: "none", cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <AlertTriangle size={16} color={C.amber} />
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: C.amber }}>E se eu tivesse começado há 5 anos?</div>
            <div style={{ fontSize: "0.68rem", color: C.textMuted }}>O Custo da Espera / Procrastinação</div>
          </div>
        </div>
        <div style={{ width: 40, height: 22, borderRadius: 999, background: show ? C.amber : C.border, position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
          <div style={{ position: "absolute", top: 3, left: show ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
        </div>
      </button>
      {show && (
        <div style={{ borderTop: `1px solid ${C.amber}25`, padding: "18px 20px", background: `${C.amber}06` }}>
          <div style={{ fontFamily: "monospace", fontSize: "1.8rem", fontWeight: 800, color: C.amber, marginBottom: 6 }}>{formatCurrency(custo)}</div>
          <div style={{ fontSize: "0.8rem", color: C.textSoft, lineHeight: 1.65, marginBottom: 12 }}>
            Este é o valor aproximado que você deixou de ganhar por não ter começado a investir <strong style={{ color: C.text }}>5 anos atrás</strong>, mesmo fazendo os mesmos aportes depois.
          </div>
          <div style={{ background: `${C.amber}12`, border: `1px solid ${C.amber}30`, borderRadius: 8, padding: "8px 14px", fontSize: "0.78rem", color: C.amber, fontWeight: 600 }}>
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
    if (shiftF) return key.main === "f" ? "#F59E0B" : C.borderLt;
    if (shiftG) return key.main === "g" ? "#10B981" : C.borderLt;
    if (key.main === "f") return "#92400E";
    if (key.main === "g") return "#065F46";
    if (["PV", "PMT", "FV", "n", "i"].includes(key.main)) return "#1a3a6e";
    if (["+", "−", "×", "÷"].includes(key.main)) return "#3d2200";
    if (key.main === "ENTER") return "#1a2d4a";
    return "#1E2D45";
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: C.text, marginBottom: 4 }}>HP-12C — Modo Educativo Integrado</h2>
        <p style={{ fontSize: "0.8rem", color: C.textSoft, lineHeight: 1.6 }}>
          Explore e entenda o funcionamento da lendária calculadora do mercado financeiro. Clique em qualquer tecla para ver a explicação de sua função.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 20, marginBottom: 24 }}>
        {/* CALCULADORA */}
        <div style={{ background: "#1a1a2e", border: `2px solid ${C.border}`, borderRadius: 16, padding: 16, width: 260, flexShrink: 0 }}>
          {/* Display */}
          <div style={{ background: "#0a1a0a", border: `1px solid #1a3a1a`, borderRadius: 8, padding: "12px 16px", marginBottom: 12 }}>
            <div style={{ fontSize: "0.55rem", color: "#4a5568", letterSpacing: "0.1em", marginBottom: 4, display: "flex", gap: 12 }}>
              {shiftF && <span style={{ color: C.amber, fontWeight: 700 }}>● f</span>}
              {shiftG && <span style={{ color: C.green, fontWeight: 700 }}>● g</span>}
              {!shiftF && !shiftG && <span>RPN STACK REG</span>}
            </div>
            <div style={{ fontFamily: "'Courier New',monospace", fontSize: "1.6rem", fontWeight: 700, color: "#00ff88", textAlign: "right", letterSpacing: "0.05em" }}>
              {display}
            </div>
          </div>

          {/* Teclas em grid 5 colunas */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 5 }}>
            {HP_KEYS.map((key, idx) => {
              const isSelected = selectedKey?.main === key.main;
              const bg = getBtnCor(key);
              return (
                <button key={idx} type="button" onClick={() => handleKey(key)} style={{
                  background: isSelected ? `${C.green}30` : bg,
                  border: `1px solid ${isSelected ? C.green : C.border}`,
                  borderRadius: 6,
                  padding: "6px 4px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                  transition: "all 0.1s",
                  boxShadow: isSelected ? `0 0 8px ${C.green}50` : "none",
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = C.green}
                  onMouseLeave={e => e.currentTarget.style.borderColor = isSelected ? C.green : C.border}
                >
                  {key.f && <span style={{ fontSize: "0.42rem", color: shiftF ? "#F59E0B" : "#6b7280", fontWeight: 600, lineHeight: 1 }}>{key.f}</span>}
                  <span style={{ fontSize: "0.72rem", fontWeight: 800, color: C.text, lineHeight: 1 }}>{getBtnLabel(key)}</span>
                  {key.g && <span style={{ fontSize: "0.42rem", color: shiftG ? "#10B981" : "#6b7280", fontWeight: 600, lineHeight: 1 }}>{key.g}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* PAINEL EXPLICATIVO */}
        <div>
          {selectedKey ? (
            <div style={{ background: C.surfaceEl, border: `1px solid ${C.green}30`, borderRadius: 14, padding: "18px 20px", animation: "fadeUp 0.2s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ background: C.greenDim, border: `1px solid ${C.green}30`, borderRadius: 8, padding: "4px 12px", fontFamily: "monospace", fontSize: "1rem", fontWeight: 800, color: C.green }}>
                  {selectedKey.main}
                </div>
                {selectedKey.f && <Badge cor={C.amber}>{selectedKey.f}</Badge>}
                {selectedKey.g && <Badge cor={C.green}>{selectedKey.g}</Badge>}
              </div>
              <p style={{ fontSize: "0.85rem", color: C.text, lineHeight: 1.7 }}>{selectedKey.explicacao}</p>
            </div>
          ) : (
            <div style={{ background: C.surfaceEl, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px", display: "flex", alignItems: "center", gap: 12 }}>
              <ChevronRight size={20} color={C.amber} />
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.88rem", color: C.amber, marginBottom: 4 }}>Clique em qualquer tecla</div>
                <div style={{ fontSize: "0.78rem", color: C.textSoft, lineHeight: 1.5 }}>
                  Entenda a lógica de funcionamento e os cálculos por trás de cada botão.
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: 12, background: `${C.amber}08`, border: `1px solid ${C.amber}25`, borderRadius: 10, padding: "12px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <Lightbulb size={13} color={C.amber} />
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: C.amber, letterSpacing: "0.06em", textTransform: "uppercase" }}>Lógica RPN</span>
            </div>
            <div style={{ fontSize: "0.75rem", color: C.textSoft, lineHeight: 1.6 }}>
              A HP-12C usa **Notação Polonesa Reversa (RPN)**. Você insere os números primeiro e depois as operações.
              Ex: Para fazer 5 + 3, tecle: <code style={{ background: C.surface, padding: "1px 5px", borderRadius: 4, color: C.green }}>5 ENTER 3 +</code>.
            </div>
          </div>
        </div>
      </div>

      <div>
        <div style={{ fontSize: "0.78rem", fontWeight: 700, color: C.textSoft, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
          Exemplos Clássicos Passo a Passo
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {HP_EXEMPLOS.map((ex, i) => (
            <div key={i} style={{ background: C.surface, border: `1px solid ${activeExemplo === i ? C.green + "50" : C.border}`, borderRadius: 12, overflow: "hidden", transition: "border-color 0.2s" }}>
              <button type="button" onClick={() => setEx(activeExemplo === i ? null : i)} style={{ width: "100%", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "transparent", border: "none", cursor: "pointer" }}>
                <span style={{ fontWeight: 600, fontSize: "0.85rem", color: C.text }}>{ex.titulo}</span>
                {activeExemplo === i ? <ChevronUp size={15} color={C.textMuted} /> : <ChevronDown size={15} color={C.textMuted} />}
              </button>
              {activeExemplo === i && (
                <div style={{ borderTop: `1px solid ${C.border}`, padding: "14px 18px" }}>
                  {ex.passos.map((p, j) => (
                    <div key={j} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: C.greenDim, border: `1px solid ${C.green}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 700, color: C.green, flexShrink: 0 }}>
                        {j + 1}
                      </div>
                      <code style={{ fontSize: "0.8rem", color: C.green, fontFamily: "monospace", lineHeight: 1.5 }}>{p}</code>
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
const SCEN_COLORS = [C.blue, C.green, C.amber];
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
    <div style={{ background: C.surface, border: `1.5px solid ${cor}40`, borderRadius: 14, overflow: "hidden", marginBottom: 14, boxShadow: `0 4px 20px ${cor}15` }}>
      <div style={{ padding: "12px 18px", background: `${cor}10`, borderBottom: `1px solid ${cor}25`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: cor, boxShadow: `0 0 6px ${cor}` }} />
          <span style={{ fontWeight: 700, fontSize: "0.85rem", color: C.text }}>{SCEN_NAMES[index]}</span>
        </div>
        {canRemove && (
          <button type="button" onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", color: C.red, padding: 2 }}>
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div style={{ padding: "16px 18px" }}>
        <InvSelect value={s.invId} onChange={i => onChange({ ...s, invId: i.id })} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
          <NumInput label="Capital Inicial" emoji="💰" hint="Investimento inicial" value={s.pv} onChange={v => onChange({ ...s, pv: v })} placeholder="5000" />
          <NumInput label="Aporte Mensal" emoji="📅" hint="Investimento por mês" value={s.aporte} onChange={v => onChange({ ...s, aporte: v })} placeholder="300" />
          <NumInput label="Prazo" emoji="⏳" hint="Período total" value={s.anos} onChange={v => onChange({ ...s, anos: v })} prefix="" suffix="anos" placeholder="10" />
        </div>

        <div style={{ background: `${cor}08`, border: `1px solid ${cor}25`, borderRadius: 10, padding: "12px 16px", marginTop: 4 }}>
          <div style={{ fontSize: "0.62rem", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
            Resultado Projetado ({parseBRL(s.anos) || 1} anos) · {inv.nome}
          </div>
          <div style={{ fontFamily: "monospace", fontSize: "1.5rem", fontWeight: 800, color: cor }}>
            {formatCurrency(r.patrimonioLiquido)}
          </div>
          <div style={{ fontSize: "0.7rem", color: C.textMuted, marginTop: 3, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <span>Total Investido: <strong style={{ color: C.textSoft }}>{formatCurrency(r.totalInvestido)}</strong></span>
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
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
        {payload.map((p: any, i: number) => p.value != null && (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 14, fontSize: "0.8rem", marginBottom: 2 }}>
            <span style={{ color: SCEN_COLORS[i] }}>● {SCEN_NAMES[i]}</span>
            <strong style={{ color: C.text, fontFamily: "monospace" }}>{formatCurrency(p.value)}</strong>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ width: "100%", height: 240 }}>
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
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
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
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: C.text, marginBottom: 4 }}>Matriz Geral de Investimentos</h2>
        <p style={{ fontSize: "0.8rem", color: C.textSoft, lineHeight: 1.6 }}>
          Comparativo educacional simplificado baseado no mercado nacional. Sempre analise seu perfil antes de investir!
        </p>
      </div>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
            <thead>
              <tr style={{ background: C.surfaceEl, borderBottom: `1px solid ${C.border}` }}>
                {["Investimento", "Risco", "Liquidez", "Taxa Ref.", "Prazo", "FGC", "IR"].map(h => (
                  <th key={h} style={{ padding: "12px 14px", textAlign: "left", color: C.textMuted, fontWeight: 600, fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INVESTIMENTOS.map((inv, i) => (
                <tr key={inv.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? "transparent" : C.surfaceEl }}>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: inv.cor, boxShadow: `0 0 5px ${inv.cor}`, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 700, color: C.text }}>{inv.nome}</div>
                        <div style={{ fontSize: "0.67rem", color: C.textMuted, marginTop: 1 }}>{inv.desc}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px" }}><Badge cor={RCOLORS[inv.risco]}>{RLABELS[inv.risco]}</Badge></td>
                  <td style={{ padding: "12px 14px", color: C.textSoft, fontFamily: "monospace", fontSize: "0.77rem" }}>{inv.liquidez}</td>
                  <td style={{ padding: "12px 14px", fontFamily: "monospace", fontWeight: 700, color: inv.cor }}>{formatPercentage(inv.taxaAnualPadrao, 2)} a.a.</td>
                  <td style={{ padding: "12px 14px", color: C.textSoft, fontSize: "0.77rem" }}>{inv.prazo}</td>
                  <td style={{ padding: "12px 14px", textAlign: "center" }}>{inv.fgc ? <CheckCircle size={14} color={C.green} style={{ display: "inline" }} /> : <span style={{ color: C.textMuted }}>—</span>}</td>
                  <td style={{ padding: "12px 14px" }}>{inv.ir ? <span style={{ fontSize: "0.72rem", color: C.red, fontWeight: 600 }}>Sim (Regressivo)</span> : <Badge cor={C.green}>Isento</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
        {[
          { label: "Conservador", icon: Shield, cor: "#3B82F6", ativos: ["Poupança", "Tesouro Selic", "CDB"], desc: "Foco total na preservação do patrimônio e liquidez." },
          { label: "Moderado", icon: Target, cor: C.green, ativos: ["CDB", "LCI/LCA", "Multimercado"], desc: "Equilíbrio entre segurança e maior rentabilidade de médio prazo." },
          { label: "Arrojado", icon: TrendingUp, cor: C.amber, ativos: ["Multimercado", "FIIs", "Ações"], desc: "Horizonte de longo prazo visando à multiplicação patrimonial." },
        ].map(p => (
          <div key={p.label} style={{ background: `${p.cor}08`, border: `1.5px solid ${p.cor}30`, borderRadius: 12, padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <p.icon size={15} color={p.cor} />
              <span style={{ fontWeight: 700, fontSize: "0.88rem", color: C.text }}>{p.label}</span>
            </div>
            <p style={{ fontSize: "0.72rem", color: C.textSoft, lineHeight: 1.55, marginBottom: 10 }}>{p.desc}</p>
            {p.ativos.map(a => (
              <div key={a} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.72rem", color: C.textSoft, marginBottom: 4 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: p.cor }} />{a}
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
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "system-ui, -apple-system, sans-serif", color: C.text }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:${C.bg}}
        ::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px}
        input[type=text]:focus,input[type=number]:focus{outline:none}
        button{font-family:inherit}
      `}</style>

      {/* HEADER */}
      <div style={{ background: `${C.surface}F5`, borderBottom: `1px solid ${C.border}`, backdropFilter: "blur(16px)", position: "sticky", top: 0, zIndex: 100, padding: "12px 20px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg,${C.green},${C.greenDark})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 12px ${C.green}50` }}>
              <span style={{ color: "#fff", fontWeight: 900, fontSize: "0.8rem", letterSpacing: "-0.02em" }}>P0</span>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "1rem", letterSpacing: "-0.03em", color: C.text }}>Ponto Zero</div>
              <div style={{ fontSize: "0.62rem", color: C.textMuted }}>Simulador Financeiro</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 4, background: C.surfaceEl, borderRadius: 999, padding: 4, border: `1px solid ${C.border}`, flexWrap: "wrap" }}>
            {TABS.map(t => (
              <button key={t.id} type="button" onClick={() => { setTab(t.id); setResult(false); }} style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "7px 12px",
                borderRadius: 999,
                border: "none",
                background: tab === t.id ? C.green : "transparent",
                color: tab === t.id ? "#fff" : C.textMuted,
                fontSize: "0.73rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}>
                <t.icon size = {12} />{t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 16px 80px" }}>

        {/* ── ASSISTENTE ── */}
        {tab === "assistente" && (
          <>
            {!showResult ? (
              <div style={{ animation: "fadeUp 0.35s ease" }}>
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.greenDim, border: `1px solid ${C.green}40`, borderRadius: 999, padding: "5px 16px", marginBottom: 16 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, boxShadow: `0 0 6px ${C.green}` }} />
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, color: C.green, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      {isLoading ? "Carregando Taxas..." : "Taxas Reais Ativas"}
                    </span>
                  </div>
                  <h1 style={{ fontFamily: "Georgia,serif", fontSize: "clamp(1.8rem,5vw,2.6rem)", fontWeight: 800, color: C.text, lineHeight: 1.15, marginBottom: 10, letterSpacing: "-0.03em" }}>
                    Entenda seu <br /><em style={{ color: C.green, fontStyle: "italic" }}>dinheiro</em>
                  </h1>
                  <p style={{ fontSize: "0.88rem", color: C.textSoft, maxWidth: 420, margin: "0 auto", lineHeight: 1.65 }}>
                    Projete seu patrimônio usando o motor matemático com precisão monetária e taxas do Banco Central.
                  </p>
                </div>

                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "24px", marginBottom: 16 }}>
                  <InvSelect value={invId} onChange={handleInvestmentChange} />
                  
                  <NumInput label="Quanto você tem hoje?" emoji="💰" value={inputs.valorInicial} onChange={v => setValorInicial(parseBRL(v))} placeholder="5.000" />
                  
                  <NumInput label="Quanto coloca por mês?" emoji="📅" value={inputs.aporteMensal} onChange={v => setAporteMensal(parseBRL(v))} placeholder="300" />
                  
                  <NumInput label="Por quanto tempo?" emoji="⏳" value={inputs.prazoAnos} onChange={v => setPrazoAnos(parseBRL(v))} prefix="" suffix="anos" placeholder="10" />
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 6 }}>
                    <NumInput label="Taxa de Rendimento Anual" emoji="📈" value={inputs.taxaAnual} onChange={v => setTaxaAnual(parseBRL(v))} prefix="" suffix="% a.a." placeholder="10.5" />
                    <NumInput label="Estimativa de Inflação Anual" emoji="💸" value={inputs.inflacaoAnual} onChange={v => setInflacaoAnual(parseBRL(v))} prefix="" suffix="% a.a." placeholder="4.5" />
                  </div>

                  <div style={{ background: C.greenDim, border: `1px solid ${C.green}25`, borderRadius: 10, padding: "10px 16px", marginTop: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                    <span style={{ fontSize: "0.78rem", color: C.textSoft }}>Prévia do resgate líquido:</span>
                    <span style={{ fontFamily: "monospace", fontSize: "1.1rem", fontWeight: 800, color: C.green }}>{formatCurrency(outputs.patrimonioLiquido)}</span>
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

                <div style={{ background: C.surfaceEl, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 18px", marginBottom: 20, fontFamily: "monospace" }}>
                  <div style={{ fontSize: "0.62rem", color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Fórmulas de Cálculo Decoupled</div>
                  <div style={{ fontSize: "0.82rem", color: C.green, marginBottom: 4 }}>FV = PV × (1+i)ⁿ + PMT × [(1+i)ⁿ − 1] / i</div>
                  <div style={{ fontSize: "0.7rem", color: C.textMuted }}>Modo Real Fisher: r_real = (nom - inf) / (1 + inf)</div>
                </div>

                <button type="button" onClick={() => setResult(true)} style={{ width: "100%", padding: "16px", background: `linear-gradient(135deg,#10B981,#059669)`, border: "none", borderRadius: 12, fontSize: "1rem", fontWeight: 700, color: "#fff", cursor: "pointer", boxShadow: `0 4px 24px ${C.green}40`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  ✨ Visualizar evolução detalhada
                </button>
              </div>
            ) : (
              <div style={{ animation: "fadeUp 0.4s ease" }}>
                <button type="button" onClick={() => setResult(false)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: C.textMuted, fontSize: "0.8rem", marginBottom: 20, padding: 0 }}>
                  <RefreshCw size={13} /> Voltar e ajustar valores
                </button>
                
                <ResultCards
                  patrimonioLiquido={outputs.patrimonioLiquido}
                  patrimonioReal={outputs.patrimonioReal}
                  totalInvestido={outputs.totalInvestido}
                  totalJuros={outputs.totalJuros}
                  anos={inputs.prazoAnos}
                  valorInicial={inputs.valorInicial}
                />

                <div style={{ background: C.surfaceEl, border: `1px solid ${C.green}25`, borderRadius: 14, padding: "20px 22px", marginBottom: 20, display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ fontSize: 28, flexShrink: 0 }}>🧠</div>
                  <div>
                    <div style={{ fontSize: "0.8rem", color: C.green, fontWeight: 700, marginBottom: 6 }}>
                      {outputs.totalJuros > outputs.totalInvestido ? `O efeito dos juros compostos superou seus depósitos!` : `Os juros já representam boa parte do seu montante!`}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: C.textSoft, lineHeight: 1.65 }}>
                      Você acumulou <strong style={{ color: C.text }}>{formatCurrency(outputs.totalJuros)}</strong> apenas em juros reais.
                      {viradaMes && (
                        <>
                          {" "}Seu <strong style={{ color: C.amber }}>Ponto Zero</strong> (quando os juros rendem mais do que o seu aporte mensal) ocorrerá em <strong style={{ color: C.amber }}>{formatTimeSpan(viradaMes)}</strong>!
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                    <BarChart2 size={16} color={C.blue} />
                    <span style={{ fontWeight: 700, fontSize: "0.9rem", color: C.text }}>Linha do Tempo de Investimentos</span>
                    <div style={{ marginLeft: "auto", display: "flex", gap: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.72rem", color: C.textSoft }}><div style={{ width: 10, height: 10, borderRadius: 2, background: C.blue }} />Capital Investido</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.72rem", color: C.textSoft }}><div style={{ width: 10, height: 10, borderRadius: 2, background: C.green }} />Patrimônio Total</div>
                    </div>
                  </div>
                  <MainChart tabela={outputs.tabelaMesAMes} viradaMes={viradaMes} dobrouMes={dobrouMes} />
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
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: C.text, marginBottom: 4 }}>Comparador de Estratégias</h2>
              <p style={{ fontSize: "0.8rem", color: C.textSoft }}>Simule até 3 cenários diferentes de investimentos em paralelo.</p>
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
                style={{
                  width: "100%",
                  padding: "18px",
                  background: "transparent",
                  border: `2px dashed ${C.border}`,
                  borderRadius: 14,
                  cursor: "pointer",
                  color: C.textMuted,
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginBottom: 16,
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.green; e.currentTarget.style.color = C.green; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textMuted; }}
              >
                <Plus size={18} /> Adicionar outro cenário para comparar
              </button>
            )}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                <BarChart2 size={16} color={C.blue} />
                <span style={{ fontWeight: 700, fontSize: "0.88rem", color: C.text }}>Gráfico de Evolução Comparativa</span>
                <div style={{ marginLeft: "auto", display: "flex", gap: 12, flexWrap: "wrap" }}>
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
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <InvestTable />
          </div>
        )}

        {/* ── HP-12C ── */}
        {tab === "hp12c" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <HP12CMode />
          </div>
        )}
      </div>
    </div>
  );
}
export default Simulator;
