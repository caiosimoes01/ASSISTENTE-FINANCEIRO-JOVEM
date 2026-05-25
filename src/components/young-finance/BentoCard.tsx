import { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface BentoCardProps {
  label: string;
  value: string;
  hint: string;
  icon?: ReactNode;
  highlight?: boolean;
  className?: string;
}

export function BentoCard({ label, value, hint, icon, highlight, className }: BentoCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-3xl border p-6 flex flex-col justify-between min-h-[180px] overflow-hidden transition-all",
        highlight ? "bg-foreground text-background border-foreground" : "bg-surface border-border/70 hover:border-foreground/30",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "text-xs font-medium uppercase tracking-wider",
            highlight ? "text-background/60" : "text-muted-foreground",
          )}
        >
          {label}
        </span>
        {icon && (
          <div
            className={cn(
              "h-8 w-8 rounded-full grid place-items-center",
              highlight ? "bg-background/10 text-accent" : "bg-accent/15 text-accent-foreground",
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="font-display text-4xl md:text-5xl leading-none tabular-nums">
          {value}
        </div>
        <p
          className={cn(
            "mt-3 text-sm leading-relaxed max-w-[28ch]",
            highlight ? "text-background/70" : "text-muted-foreground",
          )}
        >
          {hint}
        </p>
      </div>
    </div>
  );
}
