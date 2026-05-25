import { useSimulation } from '@hooks/useSimulation';
import { saveSimulation } from '../../services/historyService';
import { auth, signInWithGoogle } from '../../services/firebase';
import { useState } from 'react';
import { InputField } from "./InputField";
import { BentoCard } from "./BentoCard";
import { GrowthChart } from "./GrowthChart";
import { Switch } from "../../components/ui/switch";
import { Sparkles, TrendingUp, Wallet, Coins, Clock, ArrowUpRight } from "lucide-react";
import { cn } from "../../lib/utils";

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export function Simulator() {
  const {
    inputs,
    setValorInicial,
    setAporteMensal,
    setPrazoAnos,
    setTaxaAnual,
    chartData,
  } = useSimulation();

  const [whatIf, setWhatIf] = useState(false);
  const [saving, setSaving] = useState(false);

  // Simple derived calculations (can be replaced by outputs if needed)
  const totalInvested = inputs.valorInicial + inputs.aporteMensal * 12 * inputs.prazoAnos;
  const finalAmount = Math.round(
    inputs.valorInicial * Math.pow(1 + inputs.taxaAnual / 100, inputs.prazoAnos) +
      inputs.aporteMensal * ((Math.pow(1 + inputs.taxaAnual / 100, inputs.prazoAnos) - 1) / (inputs.taxaAnual / 100)) * 12
  );
  const interest = Math.max(0, finalAmount - totalInvested);

  const rateShortcuts = [
    { label: "Poupança", value: 6, sub: "~6%" },
    { label: "CDI", value: 11.5, sub: "~11.5%" },
  ];

  const handleSave = async () => {
    try {
      setSaving(true);
      let user = auth.currentUser;
      if (!user) {
        user = await signInWithGoogle();
      }
      await saveSimulation(user.uid, {
        inputs,
        results: { totalInvested, finalAmount, interest },
      });
      alert("Simulação salva com sucesso!");
    } catch (e) {
      console.error(e);
      alert("Falha ao salvar a simulação.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-foreground text-background grid place-items-center">
              <Sparkles className="h-4 w-4 text-accent" />
            </div>
            <span className="font-display text-xl">YoungFinance</span>
          </div>
          <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <a className="hover:text-foreground transition" href="#">Simulador</a>
            <a className="hover:text-foreground transition" href="#">Aprender</a>
            <a className="hover:text-foreground transition" href="#">Metas</a>
          </nav>
          <button className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-foreground text-background text-sm px-4 py-2 hover:bg-foreground/90 transition">
            Entrar <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-14">
        {/* Hero */}
        <div className="max-w-2xl mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/15 text-foreground text-xs font-medium px-3 py-1 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Simulador interativo
          </div>
  <h1 className="font-display text-4xl md:text-6xl text-foreground leading-[1.05]">Entenda seu dinheiro</h1>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-xl">
            Ajuste os valores, escolha sua taxa e descubra o poder dos juros compostos — sem planilha, sem complicação.
          </p>
        </div>

        <div className="grid lg:grid-cols-[420px_1f] gap-6 lg:gap-8">
          {/* Form */}
          <section className="space-y-4">
            <InputField
              label="Valor inicial"
              prefix="R$"
              value={inputs.valorInicial}
              onChange={v => setValorInicial(Number(v))}
              min={0}
              max={100000}
              step={100}
              hint="quanto você já tem"
            />
            <InputField
              label="Aporte mensal"
              prefix="R$"
              value={inputs.aporteMensal}
              onChange={v => setAporteMensal(Number(v))}
              min={0}
              max={10000}
              step={50}
              hint="todo mês"
            />
            <InputField
              label="Tempo"
              suffix="anos"
              value={inputs.prazoAnos}
              onChange={v => setPrazoAnos(Number(v))}
              min={1}
              max={40}
              step={1}
              hint="horizonte"
            />
            <InputField
              label="Taxa de juros anual"
              suffix="%"
              value={inputs.taxaAnual}
              onChange={v => setTaxaAnual(Number(v))}
              min={0}
              max={20}
              step={0.1}
              hint="rendimento esperado"
            >
              <div className="mt-4 flex flex-wrap gap-2">
                {rateShortcuts.map(s => {
                  const active = Math.abs(inputs.taxaAnual - s.value) < 0.05;
                  return (
                    <button
                      key={s.label}
                      onClick={() => setTaxaAnual(s.value)}
                      className={cn(
                        "group flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all",
                        active ? "bg-foreground text-background border-foreground" : "bg-surface border-border hover:border-foreground/40"
                      )}
                    >
                      <span>{s.label}</span>
                      <span className={cn("text-[11px] tabular-nums", active ? "text-accent" : "text-muted-foreground")}> {s.sub}</span>
                    </button>
                  );
                })}
              </div>
            </InputField>

            {/* What-if toggle */}
            <div className="rounded-2xl bg-surface border border-border/70 p-5">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-warning/20 grid place-items-center shrink-0">
                  <Clock className="h-4.5 w-4.5 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">
                      E se eu tivesse começado há 5 anos?
                    </p>
                    <Switch checked={whatIf} onCheckedChange={setWhatIf} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Calcula o custo da espera.</p>
                </div>
              </div>

              {whatIf && (
                <div className="mt-4 rounded-xl bg-gradient-to-br from-warning/15 to-accent/10 border border-warning/30 p-4 animate-in fade-in slide-in-from-top-1 duration-300">
                  <div className="flex items-center gap-2 text-xs font-medium text-foreground/70 uppercase tracking-wider mb-2">
                    <Clock className="h-3.5 w-3.5" />
                    Custo da espera
                  </div>
                  <p className="font-display text-3xl text-foreground">
                    + {formatBRL(Math.round(finalAmount * 0.6))}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    É o quanto você teria a mais no patrimônio final se tivesse começado 5 anos antes. Cada ano conta.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Results */}
          <section className="space-y-6">
            {/* Bento grid */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <BentoCard
                className="md:col-span-3"
                label="Total investido"
                value={formatBRL(totalInvested)}
                hint="O dinheiro que saiu do seu bolso, somando aporte inicial e mensais."
                icon={<Wallet className="h-4 w-4" />}
              />
              <BentoCard
                className="md:col-span-3"
                label="Juros ganhos"
                value={formatBRL(interest)}
                hint="O dinheiro que seu dinheiro fez por você — sem você levantar do sofá."
                icon={<Coins className="h-4 w-4" />}
              />
              <BentoCard
                className="md:col-span-6"
                label="Patrimônio final"
                value={formatBRL(finalAmount)}
                hint="O total que você terá no fim do período — investido + juros compostos trabalhando 24/7."
                icon={<TrendingUp className="h-4 w-4" />}
                highlight
              />
            </div>

            {/* Chart */}
            <GrowthChart data={chartData} />
            {/* Save button */}
            <div className="flex justify-end mt-4">
              <button
                disabled={saving}
                onClick={handleSave}
                className="px-6 py-2 rounded-full bg-foreground text-background hover:bg-foreground/90 transition disabled:opacity-50"
              >
                {saving ? "Salvando..." : "Salvar Simulação"}
              </button>
            </div>
          </section>
        </div>

        <footer className="mt-16 pt-6 border-t border-border/60 flex flex-col md:flex-row gap-2 items-center justify-between text-xs text-muted-foreground">
          <span>© 2026 YoungFinance — finanças que falam a sua língua.</span>
          <span>Os resultados são simulações educacionais e não constituem recomendação de investimento.</span>
        </footer>
      </main>
    </div>
  );
}
