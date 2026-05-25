import React from 'react';

interface InputFieldProps {
  label: string;
  prefix?: string;
  suffix?: string;
  value: number;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
  children?: React.ReactNode;
}

export function InputField({ label, prefix, suffix, value, onChange, min, max, step, hint, children }: InputFieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-muted-foreground">{label}</label>
      <div className="flex items-center space-x-2 rounded-md border border-border bg-surface p-2 focus-within:border-foreground">
        {prefix && <span className="text-muted-foreground">{prefix}</span>}
        <input
          type="number"
          className="flex-1 bg-transparent outline-none text-foreground"
          value={value}
          onChange={e => onChange(e.target.value)}
          min={min}
          max={max}
          step={step}
        />
        {suffix && <span className="text-muted-foreground">{suffix}</span>}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {children}
    </div>
  );
}
