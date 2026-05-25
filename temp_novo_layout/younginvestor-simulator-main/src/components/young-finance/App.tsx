import { useState, useEffect } from "react";
import { Zap, BarChart2, Target, Calculator } from "lucide-react";
import { AssistantTab } from "./AssistantTab";
import { ScenariosTab } from "./ScenariosTab";
import { InvestmentsTab } from "./InvestmentsTab";
import { Hp12cTab } from "./Hp12cTab";

const TABS = [
  { id: "assistant", label: "Assistente", icon: Zap, Comp: AssistantTab },
  { id: "scenarios", label: "Cenários", icon: BarChart2, Comp: ScenariosTab },
  { id: "investments", label: "Investimentos", icon: Target, Comp: InvestmentsTab },
  { id: "hp12c", label: "HP-12C", icon: Calculator, Comp: Hp12cTab },
] as const;

export function App() {
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("assistant");
  const ActiveComp = TABS.find((t) => t.id === active)!.Comp;

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0F1A] text-zinc-100">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-zinc-900/80 border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="font-extrabold text-2xl md:text-3xl text-zinc-100 tracking-tight">
                YoungFinance
              </h1>
            </div>

            <nav className="grid grid-cols-2 md:flex gap-1.5 bg-zinc-900/60 border border-zinc-800 rounded-xl p-1">
              {TABS.map((t) => {
                const Icon = t.icon;
                const isActive = active === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActive(t.id)}
                    className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? "bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                        : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <ActiveComp key={active} />
      </main>

      <footer className="max-w-7xl mx-auto px-4 md:px-6 py-6 mt-8 border-t border-zinc-800/60 text-xs text-zinc-500 flex flex-col md:flex-row gap-2 items-center justify-between">
        <span>© 2026 YoungFinance — finanças que falam a sua língua.</span>
        <span>Simulações educacionais. Não constituem recomendação de investimento.</span>
      </footer>
    </div>
  );
}
