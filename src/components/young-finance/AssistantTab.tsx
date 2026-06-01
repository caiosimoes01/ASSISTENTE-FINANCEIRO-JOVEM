import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { PiggyBank, Link as LinkIcon, TrendingUp, Zap } from "lucide-react";
import { SliderField } from "./SliderField";
import { fmtBRL, simulate, formatMonths } from "@/lib/yf";

const rateShortcuts = [
  { label: "Poupança", value: 6, sub: "~6%" },
  { label: "CDI", value: 11.5, sub: "~11.5%" },
];

export function AssistantTab() {
  const [initial, setInitial] = useState(1000);
  const [monthly, setMonthly] = useState(300);
  const [years, setYears] = useState(10);
  const [rate, setRate] = useState(11.5);
  const [whatIf, setWhatIf] = useState(false);

  const result = useMemo(
    () => simulate({ initial, monthly, years, ratePct: rate }),
    [initial, monthly, years, rate],
  );

  const past = useMemo(
    () => simulate({ initial, monthly, years: years + 5, ratePct: rate }),
    [initial, monthly, years, rate, whatIf],
  );
  const costOfWaiting = Math.max(0, past.finalAmount - result.finalAmount);

  const returnPct =
    result.totalInvested > 0 ? (result.interest / result.totalInvested) * 100 : 0;

  return (
    <div className="animate-fade-up">
      {/* ═══════ HERO SECTION ═══════ */}
      <section className="relative pt-14 pb-6 text-center overflow-hidden">
        {/* Radial gradient glow behind headline */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 40%, rgba(16,185,129,0.06) 0%, rgba(10,15,26,0) 65%)",
          }}
        />

        {/* Badge */}
        <div
          className="relative inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-emerald-400 mb-7 animate-hero-fade-up"
          style={{ animationDelay: "0.05s" }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Taxas Reais Ativas
        </div>

        {/* Headline */}
        <h1
          className="relative font-bold text-4xl md:text-6xl tracking-tight leading-[0.95] text-zinc-100 mb-5 animate-hero-fade-up"
          style={{ animationDelay: "0.15s" }}
        >
          <span className="block">Entenda seu</span>
          <span className="block mt-2 italic font-extrabold text-[#10B981] animate-hero-glow">
            dinheiro
          </span>
        </h1>

        {/* Subheadline */}
        <p
          className="relative text-base md:text-lg text-zinc-300 max-w-xl mx-auto leading-relaxed animate-hero-fade-up"
          style={{ animationDelay: "0.3s" }}
        >
          Projete seu patrimônio usando matemática financeira real, juros compostos e cenários inteligentes.
        </p>

        {/* Fade divider */}
        <div
          className="relative mt-8 h-px w-full max-w-3xl mx-auto animate-hero-fade-up"
          style={{
            animationDelay: "0.45s",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.18) 50%, transparent 100%)",
          }}
        />
      </section>

      <div className="grid lg:grid-cols-12 gap-5 lg:gap-7">
        {/* LEFT — Inputs */}
        <section className="lg:col-span-5 space-y-4">
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
            <SliderField
              label="Taxa de juros anual"
              hint="rendimento esperado"
              suffix="%"
              value={rate}
              onChange={setRate}
              min={0}
              max={20}
              step={0.1}
            >
              <div className="mt-3 flex flex-wrap gap-2">
                {rateShortcuts.map((s) => {
                  const active = Math.abs(rate - s.value) < 0.05;
                  return (
                    <button
                      key={s.label}
                      onClick={() => setRate(s.value)}
                      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                        active
                          ? "bg-zinc-100 text-zinc-900 border-zinc-100 font-semibold"
                          : "border-zinc-700 text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-400"
                      }`}
                    >
                      <span>{s.label}</span>
                      <span className={active ? "text-emerald-600" : "text-zinc-500"}>
                        {s.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
            </SliderField>

            {/* What-if toggle */}
            <div className="rounded-xl bg-zinc-900/40 border border-zinc-800/80 p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-100">
                    E se eu tivesse começado há 5 anos?
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">Calcula o custo da espera.</p>
                </div>
                <button
                  role="switch"
                  aria-checked={whatIf}
                  onClick={() => setWhatIf(!whatIf)}
                  className={`relative shrink-0 h-6 w-11 rounded-full transition-colors ${
                    whatIf ? "bg-emerald-500" : "bg-zinc-700"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
                      whatIf ? "translate-x-[22px]" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
              {whatIf && (
                <div className="mt-3 rounded-lg bg-gradient-to-br from-amber-500/15 to-emerald-500/10 border border-amber-500/30 p-3 animate-fade-up">
                  <div className="text-[10px] uppercase tracking-wider text-amber-400/80 font-semibold mb-1">
                    Custo da espera
                  </div>
                  <p className="font-mono font-bold text-2xl text-zinc-100">
                    + {fmtBRL(costOfWaiting)}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                    É o quanto você teria a mais começando 5 anos antes. Cada ano conta.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* RIGHT — Results */}
        <section className="lg:col-span-7 space-y-5">
          {/* Row 1 */}
          <div className="grid sm:grid-cols-2 gap-4">
            <ResultCard
              label="Total investido"
              value={fmtBRL(result.totalInvested)}
              hint="O dinheiro que saiu do seu bolso, somando aporte inicial e mensais."
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

          {/* Row 2 — Patrimônio final */}
          <div className="rounded-2xl bg-zinc-900 border border-emerald-500/30 p-6 transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
                Patrimônio final
              </span>
              <div className="h-9 w-9 rounded-full bg-emerald-500/15 grid place-items-center text-emerald-400">
                <TrendingUp className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="font-mono font-bold text-4xl md:text-5xl text-zinc-100 tabular-nums">
              {fmtBRL(result.finalAmount)}
            </div>
            <p className="mt-2 text-sm text-zinc-400 max-w-md leading-relaxed">
              O total que você terá no fim do período — investido + juros compostos trabalhando 24/7.
            </p>
          </div>

          {/* Row 3 — Milestone badges */}
          <div className="flex flex-wrap gap-2">
            <Milestone color="emerald" label={`Dobra em ${formatMonths(result.doubleMonths)}`} />
            <Milestone color="blue" label={`Retorno: ${returnPct.toFixed(1)}%`} />
            {result.zeroPointMonths !== null && (
              <Milestone color="amber" icon={<Zap className="h-3 w-3" />} label={`Ponto Zero: ${formatMonths(result.zeroPointMonths)}`} />
            )}
          </div>

          {/* Row 4 — Chart */}
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
                  <span className="h-2 w-2 rounded-full bg-zinc-400" /> Total investido
                </span>
              </div>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.series} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1E2D45" vertical={false} />
                  <XAxis dataKey="year" stroke="#475569" tickLine={false} axisLine={false} fontSize={11} tickFormatter={(v) => `${v}a`} />
                  <YAxis stroke="#475569" tickLine={false} axisLine={false} fontSize={11}
                    tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} width={55} />
                  <Tooltip
                    contentStyle={{
                      background: "#111827",
                      border: "1px solid #1E2D45",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                      color: "#F1F5F9",
                    }}
                    labelFormatter={(l) => `Ano ${l}`}
                    formatter={(v: number, name) => [fmtBRL(v), name === "total" ? "total" : "invested"]}
                  />
                  <Area type="monotone" dataKey="total" stroke="#10B981" strokeWidth={2.5} fill="url(#gTotal)" />
                  <Area type="monotone" dataKey="invested" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="4 2" fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </div>
    </div>
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

function Milestone({
  color,
  label,
  icon,
}: {
  color: "emerald" | "blue" | "amber";
  label: string;
  icon?: React.ReactNode;
}) {
  const map = {
    emerald: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300",
    blue: "bg-blue-500/15 border-blue-500/40 text-blue-300",
    amber: "bg-amber-500/15 border-amber-500/40 text-amber-300",
  } as const;
  const dot = { emerald: "bg-emerald-400", blue: "bg-blue-400", amber: "bg-amber-400" } as const;
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${map[color]}`}>
      {icon ?? <span className={`h-1.5 w-1.5 rounded-full ${dot[color]}`} />}
      {label}
    </span>
  );
}
