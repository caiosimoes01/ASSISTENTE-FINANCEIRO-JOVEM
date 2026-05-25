import { CheckCircle, Shield, Target, TrendingUp } from "lucide-react";

type Risk = "Mínimo" | "Baixo" | "Médio" | "Médio-Alto" | "Alto";

const ROWS: { name: string; risk: Risk; liq: string; ret: string; prazo: string; fgc: boolean; ir: string }[] = [
  { name: "Poupança", risk: "Mínimo", liq: "D+0", ret: "0,50%", prazo: "Curto", fgc: true, ir: "Isento" },
  { name: "Tesouro Selic", risk: "Mínimo", liq: "D+1", ret: "0,83%", prazo: "Curto/Médio", fgc: false, ir: "Sim" },
  { name: "CDB 100% CDI", risk: "Baixo", liq: "D+0/D+1", ret: "0,83%", prazo: "Curto/Médio", fgc: true, ir: "Sim" },
  { name: "LCI / LCA", risk: "Baixo", liq: "90+dias", ret: "0,75%", prazo: "Médio", fgc: true, ir: "Isento" },
  { name: "Multimercado", risk: "Médio", liq: "D+30", ret: "1,00%", prazo: "Médio/Longo", fgc: false, ir: "Sim" },
  { name: "FIIs", risk: "Médio-Alto", liq: "D+2", ret: "0,85%", prazo: "Longo", fgc: false, ir: "Isento" },
  { name: "Ações / ETFs", risk: "Alto", liq: "D+2", ret: "1,20%", prazo: "Longo (5+a)", fgc: false, ir: "Sim" },
];

const RISK_STYLE: Record<Risk, string> = {
  "Mínimo": "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  "Baixo": "bg-blue-500/15 text-blue-300 border-blue-500/40",
  "Médio": "bg-amber-500/15 text-amber-300 border-amber-500/40",
  "Médio-Alto": "bg-orange-500/15 text-orange-300 border-orange-500/40",
  "Alto": "bg-red-500/15 text-red-300 border-red-500/40",
};

export function InvestmentsTab() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">Matriz de Investimentos</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Referência: Selic 14,75% a.a. · Consulte um assessor certificado antes de investir.
        </p>
      </div>

      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-zinc-800/60">
              <tr className="text-zinc-400 uppercase text-[10px] tracking-wider">
                <th className="text-left font-semibold px-4 py-3">Investimento</th>
                <th className="text-left font-semibold px-4 py-3">Risco</th>
                <th className="text-left font-semibold px-4 py-3">Liquidez</th>
                <th className="text-left font-semibold px-4 py-3">Retorno/mês</th>
                <th className="text-left font-semibold px-4 py-3">Prazo</th>
                <th className="text-center font-semibold px-4 py-3">FGC</th>
                <th className="text-left font-semibold px-4 py-3">IR</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => (
                <tr key={r.name} className={`${i % 2 === 1 ? "bg-zinc-900/30" : ""} hover:bg-zinc-800/40 transition-colors`}>
                  <td className="px-4 py-3.5 font-medium text-zinc-100">{r.name}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${RISK_STYLE[r.risk]}`}>{r.risk}</span>
                  </td>
                  <td className="px-4 py-3.5 text-zinc-300 font-mono">{r.liq}</td>
                  <td className="px-4 py-3.5 text-zinc-100 font-mono font-semibold">{r.ret}</td>
                  <td className="px-4 py-3.5 text-zinc-400">{r.prazo}</td>
                  <td className="px-4 py-3.5 text-center">
                    {r.fgc ? <CheckCircle className="h-4 w-4 text-emerald-400 inline" /> : <span className="text-zinc-600">—</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    {r.ir === "Isento"
                      ? <span className="inline-flex rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 text-xs">Isento</span>
                      : <span className="text-zinc-400">Sim</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <ProfileCard
          icon={<Shield className="h-5 w-5" />}
          title="Conservador"
          color="blue"
          items={["Poupança", "Tesouro Selic", "CDB"]}
        />
        <ProfileCard
          icon={<Target className="h-5 w-5" />}
          title="Moderado"
          color="emerald"
          items={["CDB", "LCI/LCA", "Multimercado"]}
        />
        <ProfileCard
          icon={<TrendingUp className="h-5 w-5" />}
          title="Arrojado"
          color="amber"
          items={["Multimercado", "FIIs", "Ações"]}
        />
      </div>
    </div>
  );
}

function ProfileCard({ icon, title, color, items }: { icon: React.ReactNode; title: string; color: "blue" | "emerald" | "amber"; items: string[] }) {
  const map = {
    blue: "border-blue-500/40 bg-blue-500/5 text-blue-300",
    emerald: "border-emerald-500/40 bg-emerald-500/5 text-emerald-300",
    amber: "border-amber-500/40 bg-amber-500/5 text-amber-300",
  } as const;
  return (
    <div className={`rounded-2xl border ${map[color]} p-5 transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.12)]`}>
      <div className="flex items-center gap-2.5 mb-3">
        <div className="h-10 w-10 rounded-xl bg-zinc-900/60 grid place-items-center">{icon}</div>
        <h3 className="font-bold text-lg text-zinc-100">{title}</h3>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span key={item} className="text-xs px-2.5 py-1 rounded-full bg-zinc-900/60 text-zinc-300 border border-zinc-800">{item}</span>
        ))}
      </div>
    </div>
  );
}
