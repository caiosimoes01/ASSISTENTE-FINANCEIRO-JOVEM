import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { fmtBRL, simulate } from "@/lib/yf";

interface Scenario {
  id: string;
  name: string;
  color: "blue" | "emerald" | "amber";
  product: string;
  ratePct: number;
  initial: number;
  monthly: number;
  years: number;
}

const COLORS = {
  blue: { hex: "#3B82F6", dot: "bg-blue-500", text: "text-blue-400", border: "border-blue-500/40", bg: "bg-blue-500/10" },
  emerald: { hex: "#10B981", dot: "bg-emerald-500", text: "text-emerald-400", border: "border-emerald-500/40", bg: "bg-emerald-500/10" },
  amber: { hex: "#F59E0B", dot: "bg-amber-500", text: "text-amber-400", border: "border-amber-500/40", bg: "bg-amber-500/10" },
};

const PRODUCTS = [
  { name: "Poupança", rate: 6 },
  { name: "Tesouro Selic", rate: 10.5 },
  { name: "CDB 100% CDI", rate: 11.5 },
  { name: "LCI / LCA", rate: 9.5 },
  { name: "Multimercado", rate: 13 },
  { name: "FIIs", rate: 11 },
  { name: "Ações / ETFs", rate: 15 },
];

const PALETTE: Array<Scenario["color"]> = ["blue", "emerald", "amber"];

export function ScenariosTab() {
  const [scenarios, setScenarios] = useState<Scenario[]>([
    { id: "a", name: "Cenário A", color: "blue", product: "Poupança", ratePct: 6, initial: 1000, monthly: 300, years: 10 },
    { id: "b", name: "Cenário B", color: "emerald", product: "CDB 100% CDI", ratePct: 11.5, initial: 1000, monthly: 300, years: 10 },
  ]);

  const results = useMemo(
    () => scenarios.map((s) => ({ s, r: simulate({ initial: s.initial, monthly: s.monthly, years: s.years, ratePct: s.ratePct }) })),
    [scenarios],
  );

  const chartData = useMemo(() => {
    const maxYears = Math.max(...scenarios.map((s) => s.years), 1);
    const rows: Record<string, number>[] = [];
    for (let y = 0; y <= maxYears; y++) {
      const row: Record<string, number> = { year: y };
      results.forEach(({ s, r }) => {
        const point = r.series.find((p) => p.year === y);
        if (point) row[s.id] = point.total;
      });
      rows.push(row);
    }
    return rows;
  }, [scenarios, results]);

  const update = (id: string, patch: Partial<Scenario>) =>
    setScenarios((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const remove = (id: string) => setScenarios((prev) => prev.filter((s) => s.id !== id));

  const add = () => {
    if (scenarios.length >= 3) return;
    const usedColors = scenarios.map((s) => s.color);
    const color = PALETTE.find((c) => !usedColors.includes(c)) ?? "amber";
    const letter = String.fromCharCode(65 + scenarios.length);
    setScenarios((p) => [
      ...p,
      { id: crypto.randomUUID(), name: `Cenário ${letter}`, color, product: "Tesouro Selic", ratePct: 10.5, initial: 1000, monthly: 300, years: 10 },
    ]);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">Comparar Cenários</h2>
        <p className="text-sm text-zinc-400 mt-1">Monte até 3 estratégias e compare a evolução.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {results.map(({ s, r }) => {
          const c = COLORS[s.color];
          return (
            <div key={s.id} className={`rounded-2xl bg-zinc-900/60 border ${c.border} backdrop-blur-sm p-5 transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.12)]`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${c.dot}`} />
                  <span className="font-semibold text-zinc-100">{s.name}</span>
                </div>
                <button onClick={() => remove(s.id)} className="text-red-400/70 hover:text-red-400 transition">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <Field label="Investimento">
                  <select
                    value={s.product}
                    onChange={(e) => {
                      const p = PRODUCTS.find((p) => p.name === e.target.value)!;
                      update(s.id, { product: p.name, ratePct: p.rate });
                    }}
                    className="w-full bg-[#0A0F1A] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                  >
                    {PRODUCTS.map((p) => <option key={p.name} value={p.name}>{p.name} ({p.rate}%)</option>)}
                  </select>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Capital inicial">
                    <NumInput value={s.initial} onChange={(v) => update(s.id, { initial: v })} prefix="R$" />
                  </Field>
                  <Field label="Aporte mensal">
                    <NumInput value={s.monthly} onChange={(v) => update(s.id, { monthly: v })} prefix="R$" />
                  </Field>
                </div>
                <Field label="Prazo (anos)">
                  <NumInput value={s.years} onChange={(v) => update(s.id, { years: v })} suffix="a" />
                </Field>
              </div>

              <div className={`mt-4 rounded-xl ${c.bg} border ${c.border} p-4`}>
                <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Valor final</div>
                <div className={`font-mono font-bold text-2xl tabular-nums mt-1 ${c.text}`}>{fmtBRL(r.finalAmount)}</div>
                <div className="text-xs text-zinc-500 mt-1">Juros: {fmtBRL(r.interest)}</div>
              </div>
            </div>
          );
        })}

        {scenarios.length < 3 && (
          <button
            onClick={add}
            className="rounded-2xl border-2 border-dashed border-zinc-700 text-zinc-400 hover:border-emerald-500 hover:text-emerald-400 transition-all p-5 min-h-[200px] grid place-items-center"
          >
            <div className="flex flex-col items-center gap-2">
              <Plus className="h-6 w-6" />
              <span className="text-sm font-medium">Adicionar cenário</span>
            </div>
          </button>
        )}
      </div>

      {/* Comparative chart */}
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm p-5">
        <h3 className="text-lg font-bold text-zinc-100 tracking-tight mb-4">Comparação visual</h3>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                {scenarios.map((s) => (
                  <linearGradient key={s.id} id={`g${s.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS[s.color].hex} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={COLORS[s.color].hex} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid stroke="#1E2D45" vertical={false} />
              <XAxis dataKey="year" stroke="#475569" tickLine={false} axisLine={false} fontSize={11} tickFormatter={(v) => `${v}a`} />
              <YAxis stroke="#475569" tickLine={false} axisLine={false} fontSize={11}
                tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} width={55} />
              <Tooltip
                contentStyle={{ background: "#111827", border: "1px solid #1E2D45", borderRadius: "0.75rem", fontSize: "12px", color: "#F1F5F9" }}
                labelFormatter={(l) => `Ano ${l}`}
                formatter={(v: number, key) => {
                  const s = scenarios.find((sc) => sc.id === key);
                  return [fmtBRL(v), s?.name ?? key];
                }}
              />
              {scenarios.map((s) => (
                <Area key={s.id} type="monotone" dataKey={s.id} stroke={COLORS[s.color].hex} strokeWidth={2.5} fill={`url(#g${s.id})`} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-1.5">{label}</div>
      {children}
    </div>
  );
}

function NumInput({ value, onChange, prefix, suffix }: { value: number; onChange: (v: number) => void; prefix?: string; suffix?: string }) {
  return (
    <div className="flex items-center gap-1.5 bg-[#0A0F1A] border border-zinc-800 rounded-lg px-2.5 py-2 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition">
      {prefix && <span className="text-xs text-zinc-500">{prefix}</span>}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-transparent outline-none text-sm font-mono font-bold text-zinc-100 tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      {suffix && <span className="text-xs text-zinc-500">{suffix}</span>}
    </div>
  );
}
