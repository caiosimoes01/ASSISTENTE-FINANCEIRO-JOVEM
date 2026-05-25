import { ReactNode } from "react";

interface Props {
  label: string;
  hint?: string;
  prefix?: string;
  suffix?: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  children?: ReactNode;
}

export function SliderField({
  label,
  hint,
  prefix,
  suffix,
  value,
  onChange,
  min,
  max,
  step = 1,
  children,
}: Props) {
  return (
    <div className="rounded-xl bg-zinc-900/40 border border-zinc-800/80 p-4 transition-all duration-300 hover:border-emerald-500/30">
      <div className="flex items-baseline justify-between mb-3">
        <label className="text-sm font-medium text-zinc-100">{label}</label>
        {hint && <span className="text-xs text-zinc-500">{hint}</span>}
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-[#0A0F1A] border border-zinc-800 px-3 py-2 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
        {prefix && <span className="text-xs text-zinc-500 font-medium">{prefix}</span>}
        <input
          type="number"
          value={Number.isFinite(value) ? value : 0}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 bg-transparent outline-none border-0 text-base font-mono font-bold text-zinc-100 tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {suffix && <span className="text-xs text-zinc-500 font-medium">{suffix}</span>}
      </div>

      <div className="mt-4">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-emerald-500"
        />
        <div className="mt-1.5 flex justify-between text-[10px] text-zinc-600 font-mono tabular-nums">
          <span>{prefix}{min}{suffix}</span>
          <span>{prefix}{max}{suffix}</span>
        </div>
      </div>

      {children}
    </div>
  );
}
