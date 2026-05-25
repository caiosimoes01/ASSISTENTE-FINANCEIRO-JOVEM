import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { ReactNode } from "react";

interface InputFieldProps {
  label: string;
  prefix?: string;
  suffix?: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  hint?: string;
  children?: ReactNode;
}

export function InputField({
  label,
  prefix,
  suffix,
  value,
  onChange,
  min,
  max,
  step = 1,
  hint,
  children,
}: InputFieldProps) {
  return (
    <div className="rounded-2xl bg-surface border border-border/70 p-5 transition-shadow hover:shadow-[0_2px_20px_-12px_rgba(0,0,0,0.15)]">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <label className="text-sm font-medium text-foreground">{label}</label>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>

      <div className="flex items-center gap-2 rounded-xl bg-surface-muted border border-border/60 px-3 py-2 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 transition">
        {prefix && (
          <span className="text-sm text-muted-foreground font-medium">{prefix}</span>
        )}
        <Input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-0 h-7 text-base font-semibold tabular-nums"
        />
        {suffix && (
          <span className="text-sm text-muted-foreground font-medium">{suffix}</span>
        )}
      </div>

      <div className="mt-4 px-1">
        <Slider
          value={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={(v) => onChange(v[0])}
        />
        <div className="mt-2 flex justify-between text-[11px] text-muted-foreground tabular-nums">
          <span>{prefix}{min}{suffix}</span>
          <span>{prefix}{max}{suffix}</span>
        </div>
      </div>

      {children}
    </div>
  );
}
