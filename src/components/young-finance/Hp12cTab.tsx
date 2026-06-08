import { useState } from "react";
import { ChevronRight, Lightbulb, HelpCircle, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Key {
  main: string;
  f?: string;
  g?: string;
  desc: string;
  variant?: "fin" | "op" | "enter" | "f" | "g" | "default";
  wide?: boolean;
}

const KEYS: Key[][] = [
  [
    { main: "n", f: "AMORT", g: "12×", desc: "Número de períodos / parcelas acumuladas", variant: "fin" },
    { main: "i", f: "INT", g: "12÷", desc: "Taxa de juros nominal do período", variant: "fin" },
    { main: "PV", f: "NPV", g: "CFo", desc: "Valor Presente (Present Value / Capital Inicial)", variant: "fin" },
    { main: "PMT", f: "RND", g: "CFj", desc: "Valor da Parcela / Pagamento recorrente", variant: "fin" },
    { main: "FV", f: "IRR", g: "Nj", desc: "Valor Futuro (Future Value / Montante Final)", variant: "fin" },
    { main: "CHS", f: "RPN", g: "DATE", desc: "Change Sign — Inverte o sinal do número atual (positivo/negativo)" },
  ],
  [
    { main: "7", desc: "Dígito numérico 7" },
    { main: "8", desc: "Dígito numérico 8" },
    { main: "9", desc: "Dígito numérico 9" },
    { main: "÷", f: "y^x", g: "1/x", desc: "Divisão do valor de Y pelo valor de X", variant: "op" },
    { main: "f", desc: "Tecla Shift Laranja — Ativa a função superior das teclas", variant: "f" },
    { main: "g", desc: "Tecla Shift Azul — Ativa a função inferior das teclas", variant: "g" },
  ],
  [
    { main: "4", desc: "Dígito numérico 4" },
    { main: "5", desc: "Dígito numérico 5" },
    { main: "6", desc: "Dígito numérico 6" },
    { main: "×", f: "%", g: "Δ%", desc: "Multiplicação entre os valores de Y e X", variant: "op" },
    { main: "R↓", f: "PRGM", g: "x≤y", desc: "Roll Down — Rotaciona os quatro níveis da pilha (Stack RPN) para baixo" },
    { main: "x⇄y", f: "FIN", g: "x=0", desc: "Inverte as posições entre o valor de X e o valor de Y instantaneamente" },
  ],
  [
    { main: "1", desc: "Dígito numérico 1" },
    { main: "2", desc: "Dígito numérico 2" },
    { main: "3", desc: "Dígito numérico 3" },
    { main: "−", f: "x̄", g: "s", desc: "Subtração do valor de X do valor de Y", variant: "op" },
    { main: "ENTER", desc: "Confirma o valor de X e o empurra para cima na pilha RPN", variant: "enter", wide: true },
    { main: "CLx", f: "REG", g: "PREFIX", desc: "Clear X — Zera o display atual sem limpar o restante da memória" },
  ],
  [
    { main: "0", desc: "Dígito numérico 0" },
    { main: ".", desc: "Ponto para separação de casas decimais" },
    { main: "Σ+", desc: "Adiciona dados para análise estatística linear" },
    { main: "+", f: "Σ", g: "LSTx", desc: "Soma do valor de Y com o valor de X", variant: "op" },
    { main: "STO", desc: "Store — Armazena o valor do display em um registro de memória" },
    { main: "RCL", desc: "Recall — Recupera um valor armazenado anteriormente na memória" },
  ],
];

const VARIANT: Record<NonNullable<Key["variant"]>, string> = {
  fin: "bg-blue-950/80 hover:bg-blue-900 text-blue-300 border-blue-900/50",
  op: "bg-amber-950/70 hover:bg-amber-900 text-amber-300 border-amber-900/40",
  enter: "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border-zinc-700",
  f: "bg-orange-600 hover:bg-orange-500 text-zinc-950 border-orange-700 font-black",
  g: "bg-teal-600 hover:bg-teal-500 text-zinc-950 border-teal-700 font-black",
  default: "bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border-zinc-800",
};

export function Hp12cTab() {
  const [selectedKey, setSelectedKey] = useState<Key | null>(null);
  const [display, setDisplay] = useState("0");
  const [stack, setStack] = useState({ T: 0, Z: 0, Y: 0, X: 0 });
  const [modifier, setModifier] = useState<"f" | "g" | null>(null);
  const [isNewNumber, setIsNewNumber] = useState(true);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Registradores financeiros simulados
  const [finRegs, setFinRegs] = useState({ n: 0, i: 0, PV: 0, PMT: 0, FV: 0 });

  const executeMathOp = (op: string) => {
    const currentX = parseFloat(display) || 0;
    const y = stack.X; // Na nossa visualização simplificada, X está no topo visível
    let res = 0;

    switch (op) {
      case "+": res = y + currentX; break;
      case "−": res = y - currentX; break;
      case "×": res = y * currentX; break;
      case "÷": res = currentX !== 0 ? y / currentX : 0; break;
      default: return;
    }

    setDisplay(String(Number(res.toFixed(4))));
    setStack((s) => ({
      X: res,
      Y: s.Z,
      Z: s.T,
      T: s.T,
    }));
    setIsNewNumber(true);
  };

  const onPress = (k: Key) => {
    setSelectedKey(k);

    // Trata modificadores f e g
    if (k.main === "f") {
      setModifier(modifier === "f" ? null : "f");
      return;
    }
    if (k.main === "g") {
      setModifier(modifier === "g" ? null : "g");
      return;
    }

    // Execução com modificador f ativo
    if (modifier === "f") {
      if (k.main === "CLx") {
        // f + REG limpa tudo
        setStack({ T: 0, Z: 0, Y: 0, X: 0 });
        setFinRegs({ n: 0, i: 0, PV: 0, PMT: 0, FV: 0 });
        setDisplay("0");
      }
      setModifier(null);
      return;
    }

    // Teclas numéricas e ponto
    if (/^\d$/.test(k.main) || k.main === ".") {
      if (isNewNumber) {
        setDisplay(k.main === "." ? "0." : k.main);
        setIsNewNumber(false);
      } else {
        if (k.main === "." && display.includes(".")) return;
        setDisplay((d) => (d === "0" && k.main !== "." ? k.main : d + k.main));
      }
      setModifier(null);
      return;
    }

    // Lógica das Operações
    if (k.main === "ENTER") {
      const val = parseFloat(display) || 0;
      setStack((s) => ({
        T: s.Z,
        Z: s.Y,
        Y: s.X,
        X: val,
      }));
      setIsNewNumber(true);
    } else if (k.main === "CLx") {
      setDisplay("0");
    } else if (k.main === "CHS") {
      setDisplay((d) => (d.startsWith("-") ? d.slice(1) : "-" + d));
    } else if (["+", "−", "×", "÷"].includes(k.main)) {
      executeMathOp(k.main);
    } else if (["n", "i", "PV", "PMT", "FV"].includes(k.main)) {
      // Salva valor atual no registrador correspondente
      const val = parseFloat(display) || 0;
      setFinRegs((prev) => ({ ...prev, [k.main]: val }));
      setIsNewNumber(true);
    } else if (k.main === "x⇄y") {
      const oldX = parseFloat(display) || 0;
      const oldY = stack.X;
      setDisplay(String(oldY));
      setStack((s) => ({ ...s, X: oldX }));
    }

    setModifier(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="grid lg:grid-cols-12 gap-6 p-1 bg-transparent text-zinc-100"
    >
      {/* Esquerda: Calculadora Física Simulada (7 Colunas) */}
      <div className="lg:col-span-7 space-y-4">
        <div className="rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-black p-5 border border-zinc-800/80 shadow-2xl relative overflow-hidden">
          {/* Tarja Metálica Premium Decorativa de Topo */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-zinc-700 to-amber-600 opacity-40" />

          {/* Logo e Modelo */}
          <div className="flex justify-between items-center mb-3 px-1 text-zinc-500">
            <span className="text-[10px] uppercase font-mono tracking-widest font-bold flex items-center gap-1">
              <Cpu className="w-3 h-3 text-amber-500/70" /> Gold Standard RPN
            </span>
            <span className="text-xs font-serif font-bold italic tracking-wider text-zinc-400">HP 12C Premium</span>
          </div>

          {/* Visor LCD Retro */}
          <div className="bg-[#0f1912] border-2 border-zinc-800 rounded-xl p-4 mb-5 relative shadow-inner">
            {/* Indicadores de Modificadores ativos */}
            <div className="absolute top-2 left-4 flex gap-3 text-[9px] font-mono font-bold tracking-wider">
              <span className={`transition-opacity duration-200 ${modifier === "f" ? "text-orange-500 drop-shadow-[0_0_4px_rgba(249,115,22,0.4)]" : "opacity-5"}`}>f</span>
              <span className={`transition-opacity duration-200 ${modifier === "g" ? "text-teal-400 drop-shadow-[0_0_4px_rgba(45,212,191,0.4)]" : "opacity-5"}`}>g</span>
            </div>
            
            {/* Número Principal */}
            <div className="text-right font-mono text-3xl text-emerald-400 tracking-normal tabular-nums drop-shadow-[0_0_6px_rgba(52,211,153,0.3)] min-h-[36px]">
              {parseFloat(display).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            </div>
          </div>

          {/* Teclado Matricial */}
          <div className="space-y-2.5">
            {KEYS.map((row, ri) => (
              <div key={ri} className="grid grid-cols-6 gap-2">
                {row.map((k, ki) => {
                  const variantStyle = VARIANT[k.variant ?? "default"];
                  const isSelected = selectedKey?.main === k.main;
                  
                  return (
                    <button
                      key={ki}
                      onClick={() => onPress(k)}
                      className={`${variantStyle} ${k.wide ? "col-span-2" : ""} rounded-lg p-2 flex flex-col justify-between items-center transition-all border shadow-sm active:scale-95 focus:outline-none select-none min-h-[58px] ${
                        isSelected ? "ring-2 ring-orange-500 border-transparent scale-[0.97]" : ""
                      }`}
                    >
                      {/* Função Superior (f) */}
                      <span className="text-[9px] font-bold h-3 tracking-tighter text-orange-400/90 truncate max-w-full">
                        {k.f || " "}
                      </span>
                      
                      {/* Tecla Principal */}
                      <span className="text-xs font-black tracking-tight my-0.5">
                        {k.main}
                      </span>
                      
                      {/* Função Inferior (g) */}
                      <span className="text-[9px] font-bold h-3 tracking-tighter text-teal-400/90 truncate max-w-full">
                        {k.g || " "}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Pilhas de Registradores (Memória RPN Real) */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md p-4 grid grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Histórico da Pilha (Stack)
            </div>
            <div className="space-y-1.5 font-mono text-xs">
              {([ {label: "T (Topo)", key: "T"}, {label: "Z (Espera)", key: "Z"}, {label: "Y (Acumulado)", key: "Y"}, {label: "X (Último)", key: "X"} ] as const).map((item) => (
                <div key={item.key} className="flex justify-between items-center bg-black/20 px-2.5 py-1.5 rounded border border-zinc-800/40">
                  <span className="text-zinc-500">{item.label}</span>
                  <span className="text-emerald-400 font-semibold">{stack[item.key].toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Memória Financeira
            </div>
            <div className="space-y-1.5 font-mono text-xs">
              {([ {label: "n (Meses)", key: "n"}, {label: "i (Taxa %)", key: "i"}, {label: "PV (Capital)", key: "PV"}, {label: "PMT (Parcela)", key: "PMT"}, {label: "FV (Futuro)", key: "FV"} ] as const).map((item) => (
                <div key={item.key} className="flex justify-between items-center bg-black/20 px-2.5 py-1.5 rounded border border-zinc-800/40">
                  <span className="text-blue-400 font-bold">{item.key}</span>
                  <span className="text-zinc-300 font-semibold">{finRegs[item.key].toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Direita: Painel Educativo Guia (5 Colunas) */}
      <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Card Detalhe da Tecla Clicada */}
          <AnimatePresence mode="wait">
            {selectedKey ? (
              <motion.div
                key={selectedKey.main}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm p-4"
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="inline-flex items-center justify-center min-w-[36px] h-8 px-2.5 rounded-md bg-zinc-800 text-zinc-100 font-black text-sm border border-zinc-700 shadow">
                    {selectedKey.main}
                  </span>
                  {selectedKey.f && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">f: {selectedKey.f}</span>}
                  {selectedKey.g && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">g: {selectedKey.g}</span>}
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">{selectedKey.desc}</p>
              </motion.div>
            ) : (
              <div className="rounded-2xl bg-amber-500/5 border border-amber-500/20 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <HelpCircle className="h-5 w-5 text-amber-500/80 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-400">Laboratório HP 12C</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Toque em qualquer botão para entender sua mecânica.</p>
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* Card Conceitual RPN */}
          <div className="rounded-2xl bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-amber-400" />
              <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Como funciona o RPN?</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-3">
              Diferente de calculadoras comuns, você introduz os dados primeiro e depois diz o que fazer com eles. **Não existe tecla de igual (=)**.
            </p>
            <div className="bg-black/40 rounded-xl p-3 font-mono text-xs border border-zinc-800 flex flex-col gap-1">
              <div className="text-zinc-500">// Para somar 5 + 3:</div>
              <div><span className="text-zinc-200 font-bold">5</span> <span className="text-amber-400">ENTER</span></div>
              <div><span className="text-zinc-200 font-bold">3</span> <span className="text-emerald-400">+</span> <span className="text-zinc-500">→ Resultado: 8.00</span></div>
            </div>
          </div>

          {/* Guias Rápidos de Finanças */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-1">Casos Práticos Recomendados</div>
            {[
              {
                title: "1. Descobrir Parcela de Empréstimo (PMT)",
                content: "Digite o Capital inicial e aperte [PV]. Digite os meses e aperte [n]. Digite a taxa e aperte [i]. Limpe o futuro com 0 [FV]. Aperte [PMT] para calcular a parcela devida."
              },
              {
                title: "2. Projeção de Patrimônio Futuro (FV)",
                content: "Informe o aporte inicial e mude o sinal [CHS] [PV]. Informe os depósitos mensais [CHS] [PMT]. Coloque o tempo em [n] e juros em [i]. Clique em [FV] para o ver o montante final."
              },
              {
                title: "3. Master Reset (Limpar tudo)",
                content: "Para zerar completamente o acumulador estatístico, os registradores financeiros e o Stack de memória de uma só vez, pressione a sequência: [f] e depois [CLx] (REG)."
              }
            ].map((item, idx) => (
              <div key={idx} className="rounded-xl bg-zinc-900/30 border border-zinc-800/60 overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  className="w-full text-left p-3 text-xs font-semibold text-zinc-300 hover:text-zinc-100 transition flex justify-between items-center focus:outline-none"
                >
                  <span>{item.title}</span>
                  <ChevronRight className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${openIndex === idx ? "rotate-90 text-amber-400" : ""}`} />
                </button>
                {openIndex === idx && (
                  <div className="px-3 pb-3 pt-1 text-[11px] text-zinc-400 leading-relaxed border-t border-zinc-800/40 bg-black/10">
                    {item.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé Interno */}
        <footer className="text-zinc-600 text-[10px] tracking-wide border-t border-zinc-800/40 pt-4 mt-6 text-center lg:text-left">
          Interface conceitual emulando a arquitetura clássica RPN. Ideal para treinamento de conceitos macroeconômicos e simulação matemática básica de balanços.
        </footer>
      </div>
    </motion.div>
  );
}
