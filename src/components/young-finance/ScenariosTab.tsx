import { useMemo, useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
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
  const [isScenariosSimulated, setIsScenariosSimulated] = useState(false);

  const results = useMemo(
    () =>
      scenarios.map((s) => {
        const effectiveRate = s.ratePct - 4.5;
        return { s, r: simulate({ initial: s.initial, monthly: s.monthly, years: s.years, ratePct: effectiveRate }) };
      }),
    [scenarios]
  );

  // Sort scenarios by final projected amount (ascending)
  const sortedScenarios = useMemo(() => {
    const finalMap = new Map(results.map((it) => [it.s.id, it.r.finalAmount]));
    return [...scenarios].sort((a, b) => (finalMap.get(a.id) ?? 0) - (finalMap.get(b.id) ?? 0));
  }, [scenarios, results]);

  const chartData = useMemo(() => {
    const maxYears = Math.max(...scenarios.map((s) => s.years), 1);
    const rows: Record<string, number>[] = [];
    for (let y = 0; y <= maxYears; y++) {
      const row: Record<string, number> = { month: y };
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
      {
        id: crypto.randomUUID(),
        name: `Cenário ${letter}`,
        color,
        product: "Tesouro Selic",
        ratePct: 10.5,
        initial: 1000,
        monthly: 300,
        years: 10,
      },
    ]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">Comparar Cenários</h2>
        <p className="text-sm text-zinc-400 mt-1">Monte até 3 estratégias e compare a evolução.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {sortedScenarios.map((s) => { const result = results.find(it => it.s.id === s.id)!; const r = result.r; const c = COLORS[s.color];

            return (
              <motion.div
                key={s.id}
                layout
                initial={{ opacity: 0, scale: 0.92, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 10 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                className={`rounded-2xl bg-zinc-900/60 border ${c.border} backdrop-blur-sm p-5 transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.12)]`}
              >
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
                      {PRODUCTS.map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name} ({p.rate}%)
                        </option>
                      ))}
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

                  {isScenariosSimulated && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="w-full flex flex-col gap-3 pt-2"
                    >
                      <div className="rounded-xl bg-zinc-900/40 border border-zinc-800/50 p-3 flex gap-2 items-start w-full">
                        <span className="text-emerald-400 text-xs mt-0.5">ℹ️</span>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          Descontando automaticamente inflação de 4,5% a.a. para rendimento real.
                        </p>
                      </div>
                      <div className={`mt-2 rounded-xl ${c.bg} border ${c.border} p-4`}>
                        <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Valor final</div>
                        <div className={`font-mono font-bold text-2xl tabular-nums mt-1 ${c.text}`}>{fmtBRL(r.finalAmount)}</div>
                        <div className="text-xs text-zinc-500 mt-1">Juros: {fmtBRL(r.interest)}</div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}

          {scenarios.length < 3 && (
            <motion.button
              key="add-btn"
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={add}
              className="rounded-2xl border-2 border-dashed border-zinc-700 text-zinc-400 hover:border-emerald-500 hover:text-emerald-400 transition-all p-5 min-h-[200px] grid place-items-center"
            >
              <div className="flex flex-col items-center gap-2">
                <Plus className="h-6 w-6" />
                <span className="text-sm font-medium">Adicionar cenário</span>
              </div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="w-full flex justify-center py-2">
        <button
          onClick={() => setIsScenariosSimulated(true)}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_30px_rgba(16,185,129,0.35)]"
        >
          SIMULAR CENÁRIOS
        </button>
      </div>

      <AnimatePresence>
        {isScenariosSimulated && (
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.99 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm p-5"
          >
            <h3 className="text-lg font-bold text-zinc-100 tracking-tight mb-4">Comparação visual</h3>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 15, right: 40, left: 10, bottom: 15 }}>
                  <defs>
                    {sortedScenarios.map((s) => (
                      <linearGradient key={s.id} id={`g${s.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLORS[s.color].hex} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={COLORS[s.color].hex} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid stroke="#1E2D45" vertical={false} />
                  <XAxis dataKey="month" padding={{ left: 10, right: 20 }} stroke="#475569" tickLine={false} axisLine={false} fontSize={11} tickFormatter={(v) => `${v}a`} />
                  <YAxis
                    stroke="#475569"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                    width={55}
                  />
                  <Tooltip
                    contentStyle={{ background: "#111827", border: "1px solid #1E2D45", borderRadius: "0.75rem", fontSize: "12px", color: "#F1F5F9" }}
                    labelFormatter={(l) => `Ano ${l}`}
                    itemSorter={(item) => Number(item.value) * -1}
                    formatter={(value: any, name: any) => [fmtBRL(Number(value || 0)), name]}
                  />
                  {sortedScenarios.map((s) => (
                    <Area key={s.id} type="monotone" dataKey={s.id} stroke={COLORS[s.color].hex} strokeWidth={2.5} fill={`url(#g${s.id})`} />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="text-zinc-500 text-[11px] tracking-wide border-t border-zinc-800/40 pt-4 mt-8 w-full block">
        Simulação educativa baseada em taxas históricas estimadas. Rendimentos passados não garantem retornos futuros. O rendimento real exibido desconta o IPCA projetado médio de 4,5% a.a.
      </footer>
    </motion.div>
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

function NumInput({ 
  value, 
  onChange, 
  prefix, 
  suffix 
}: { 
  value: number; 
  onChange: (v: number) => void; 
  prefix?: string; 
  suffix?: string; 
}) {
  // Estado local de string para permitir digitação fluida e campo temporariamente vazio
  const [localValue, setLocalValue] = useState(value.toString());

  // Sincroniza o estado local apenas se o valor global mudar externamente
  useEffect(() => {
    if (Number(localValue) !== value) {
      setLocalValue(value.toString());
    }
  }, [value]);

  return (
    <div className="flex items-center gap-1.5 bg-[#0A0F1A] border border-zinc-800 rounded-lg px-2.5 py-2 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition">
      {prefix && <span className="text-xs text-zinc-500">{prefix}</span>}
      <input
        type="number"
        value={localValue}
        onChange={(e) => {
          const val = e.target.value;
          // Limpa zeros à esquerda indesejados (ex: "05" vira "5"), mas aceita o "0" isolado
          const cleaned = val.replace(/^0+(?=\d)/, '');
          
          setLocalValue(cleaned);
          // Atualiza o pai em tempo real (se o campo estiver vazio, assume 0)
          onChange(cleaned === '' ? 0 : Number(cleaned));
        }}
        onBlur={() => {
          // Se o usuário sair do campo deixando-o totalmente vazio, reseta visualmente para "0"
          if (localValue === '') {
            setLocalValue('0');
            onChange(0);
          }
        }}
        className="w-full bg-transparent outline-none text-sm font-mono font-bold text-zinc-100 tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      {suffix && <span className="text-xs text-zinc-500">{suffix}</span>}
    </div>
  );
}
