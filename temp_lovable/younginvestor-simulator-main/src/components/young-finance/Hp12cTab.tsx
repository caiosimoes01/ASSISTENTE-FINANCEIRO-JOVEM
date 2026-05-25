import { useState } from "react";
import { ChevronRight, Lightbulb } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Key {
  main: string;
  f?: string;
  g?: string;
  desc: string;
  fDesc?: string;
  gDesc?: string;
  variant?: "fin" | "op" | "enter" | "f" | "g" | "default";
  wide?: boolean;
}

const KEYS: Key[][] = [
  [
    { main: "n", f: "AMORT", g: "12×", desc: "Número de períodos", variant: "fin" },
    { main: "i", f: "INT", g: "12÷", desc: "Taxa de juros por período", variant: "fin" },
    { main: "PV", f: "NPV", g: "CFo", desc: "Valor Presente (Present Value)", variant: "fin" },
    { main: "PMT", f: "RND", g: "CFj", desc: "Pagamento (Payment)", variant: "fin" },
    { main: "FV", f: "IRR", g: "Nj", desc: "Valor Futuro (Future Value)", variant: "fin" },
    { main: "CHS", f: "RPN", g: "DATE", desc: "Inverte o sinal do número (Change Sign)" },
  ],
  [
    { main: "7", desc: "Dígito 7" },
    { main: "8", desc: "Dígito 8" },
    { main: "9", desc: "Dígito 9" },
    { main: "÷", f: "y^x", g: "1/x", desc: "Divisão", variant: "op" },
    { main: "f", desc: "Tecla shift laranja — ativa a função em laranja acima da tecla", variant: "f" },
    { main: "g", desc: "Tecla shift azul/verde — ativa a função em azul/verde abaixo da tecla", variant: "g" },
  ],
  [
    { main: "4", desc: "Dígito 4" },
    { main: "5", desc: "Dígito 5" },
    { main: "6", desc: "Dígito 6" },
    { main: "×", f: "%", g: "Δ%", desc: "Multiplicação", variant: "op" },
    { main: "R↓", f: "PRGM", g: "x≤y", desc: "Roll down — gira o stack para baixo" },
    { main: "x⇄y", f: "FIN", g: "x=0", desc: "Troca X com Y no stack" },
  ],
  [
    { main: "1", desc: "Dígito 1" },
    { main: "2", desc: "Dígito 2" },
    { main: "3", desc: "Dígito 3" },
    { main: "−", f: "x̄", g: "s", desc: "Subtração", variant: "op" },
    { main: "ENTER", desc: "Empilha o valor no stack RPN", variant: "enter", wide: true },
    { main: "CLx", f: "REG", g: "PREFIX", desc: "Limpa o registro X" },
  ],
  [
    { main: "0", desc: "Dígito 0" },
    { main: ".", desc: "Ponto decimal" },
    { main: "Σ+", desc: "Soma para estatística" },
    { main: "+", f: "Σ", g: "LSTx", desc: "Adição", variant: "op" },
    { main: "STO", desc: "Armazena valor em registro de memória" },
    { main: "RCL", desc: "Recupera valor de registro de memória" },
  ],
];

const VARIANT: Record<NonNullable<Key["variant"]>, string> = {
  fin: "bg-[#1a3a6e] hover:bg-[#234a82]",
  op: "bg-[#3d2200] hover:bg-[#4d2c00]",
  enter: "bg-[#1a2d4a] hover:bg-[#243d62]",
  f: "bg-[#92400E] hover:bg-[#a44d12]",
  g: "bg-[#065F46] hover:bg-[#067355]",
  default: "bg-zinc-800 hover:bg-zinc-700",
};

export function Hp12cTab() {
  const [selected, setSelected] = useState<Key | null>(null);
  const [display, setDisplay] = useState("0.00");
  const [stack, setStack] = useState({ T: 0, Z: 0, Y: 0, X: 0 });

  const onPress = (k: Key) => {
    setSelected(k);
    if (/^\d$/.test(k.main)) {
      setDisplay((d) => (d === "0.00" ? k.main : d + k.main));
    } else if (k.main === "ENTER") {
      const x = parseFloat(display) || 0;
      setStack((s) => ({ T: s.Z, Z: s.Y, Y: s.X, X: x }));
      setDisplay("0.00");
    } else if (k.main === "CLx") {
      setDisplay("0.00");
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6 animate-fade-up">
      {/* Calculator */}
      <div className="space-y-4">
        <div className="rounded-2xl bg-[#1a1a2e] border border-zinc-700 p-5 shadow-2xl">
          {/* Display */}
          <div className="bg-[#0a1a0a] border border-[#1a3a1a] rounded-lg p-4 mb-4 relative">
            <div className="absolute top-1.5 left-3 flex gap-2 text-[10px] font-bold">
              <span className="text-amber-500">{selected?.f ? "f" : ""}</span>
              <span className="text-emerald-500">{selected?.g ? "g" : ""}</span>
            </div>
            <div className="text-right font-mono text-3xl text-[#00ff88] tracking-wider tabular-nums">
              {display}
            </div>
          </div>

          {/* Keys */}
          <div className="space-y-2">
            {KEYS.map((row, ri) => (
              <div key={ri} className="grid grid-cols-6 gap-1.5">
                {row.map((k, ki) => {
                  const variant = VARIANT[k.variant ?? "default"];
                  return (
                    <button
                      key={ki}
                      onClick={() => onPress(k)}
                      className={`${variant} ${k.wide ? "col-span-1" : ""} rounded-md p-1.5 text-center transition-all border border-black/40 active:scale-95 ${selected?.main === k.main ? "ring-2 ring-emerald-400" : ""}`}
                    >
                      {k.f && <div className="text-[8px] text-amber-400 leading-none">{k.f}</div>}
                      <div className="text-xs font-bold text-white leading-tight my-0.5">{k.main}</div>
                      {k.g && <div className="text-[8px] text-emerald-400 leading-none">{k.g}</div>}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Stack RPN */}
        <div className="rounded-xl bg-[#0a1a0a] border border-[#1a3a1a] p-4">
          <div className="text-[10px] uppercase tracking-wider text-emerald-500/60 font-semibold mb-2">Stack RPN</div>
          <div className="grid grid-cols-4 gap-2 font-mono text-emerald-400 text-sm">
            {(["T", "Z", "Y", "X"] as const).map((k) => (
              <div key={k} className="bg-black/30 rounded p-2">
                <div className="text-[10px] text-emerald-500/60">{k}</div>
                <div className="tabular-nums">{stack[k].toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Explanation panel */}
      <div className="space-y-4">
        {selected ? (
          <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm p-5 animate-fade-up">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center justify-center min-w-[40px] h-10 px-3 rounded-lg bg-emerald-500 text-white font-bold text-base">{selected.main}</span>
              {selected.f && <span className="text-xs px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">f: {selected.f}</span>}
              {selected.g && <span className="text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">g: {selected.g}</span>}
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">{selected.desc}</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-5 flex items-center justify-between">
            <div>
              <div className="font-semibold text-amber-300">Clique em uma tecla</div>
              <p className="text-sm text-amber-200/70 mt-1">Veja a explicação completa de cada função.</p>
            </div>
            <ChevronRight className="h-5 w-5 text-amber-400" />
          </div>
        )}

        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-amber-400" />
            <h3 className="font-bold text-zinc-100">Lógica RPN</h3>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed mb-3">
            A HP-12C usa <strong>Notação Polonesa Reversa</strong>: você empilha valores antes de aplicar a operação.
          </p>
          <div className="bg-black/40 rounded-lg p-3 font-mono text-sm text-emerald-400 border border-emerald-500/20">
            5 ENTER 3 + <span className="text-zinc-500">// → 8</span>
          </div>
        </div>

        <Accordion type="single" collapsible className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm px-5">
          <AccordionItem value="1" className="border-zinc-800">
            <AccordionTrigger className="text-sm font-semibold text-zinc-100 hover:no-underline">
              1. Calcular parcela de financiamento (PMT)
            </AccordionTrigger>
            <AccordionContent className="text-sm text-zinc-400 space-y-1 font-mono">
              <div>100000 PV</div>
              <div>120 n</div>
              <div>1 i</div>
              <div>0 FV</div>
              <div>PMT → parcela mensal</div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="2" className="border-zinc-800">
            <AccordionTrigger className="text-sm font-semibold text-zinc-100 hover:no-underline">
              2. Calcular valor futuro (investimento)
            </AccordionTrigger>
            <AccordionContent className="text-sm text-zinc-400 space-y-1 font-mono">
              <div>1000 CHS PV</div>
              <div>120 n</div>
              <div>0.95 i</div>
              <div>300 CHS PMT</div>
              <div>FV → patrimônio final</div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="3" className="border-b-0">
            <AccordionTrigger className="text-sm font-semibold text-zinc-100 hover:no-underline">
              3. Descobrir a taxa de juros (i)
            </AccordionTrigger>
            <AccordionContent className="text-sm text-zinc-400 space-y-1 font-mono">
              <div>1000 CHS PV</div>
              <div>2000 FV</div>
              <div>60 n</div>
              <div>i → taxa mensal</div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
