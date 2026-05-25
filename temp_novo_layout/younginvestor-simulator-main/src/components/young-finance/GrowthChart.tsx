import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const mockData = Array.from({ length: 13 }, (_, i) => {
  const year = i;
  const invested = 1000 + i * 3600;
  const total = Math.round(1000 * Math.pow(1.115, year) + 300 * ((Math.pow(1.115, year) - 1) / 0.115) * 12);
  return {
    year: `${year}a`,
    invested,
    total,
  };
});

export function GrowthChart() {
  return (
    <div className="rounded-3xl bg-surface border border-border/70 p-5 md:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h3 className="font-display text-2xl md:text-3xl text-foreground">
            Sua evolução patrimonial
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Visualize o efeito dos juros compostos ao longo do tempo.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-accent" />
            Patrimônio total
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-foreground" />
            Total investido
          </span>
        </div>
      </div>

      <div className="h-[280px] md:h-[340px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.78 0.18 145)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="oklch(0.78 0.18 145)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="investedFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.22 0.02 250)" stopOpacity={0.15} />
                <stop offset="100%" stopColor="oklch(0.22 0.02 250)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="oklch(0.92 0.008 95)" vertical={false} />
            <XAxis dataKey="year" stroke="oklch(0.5 0.015 250)" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis
              stroke="oklch(0.5 0.015 250)"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
              width={55}
            />
            <Tooltip
              contentStyle={{
                background: "white",
                border: "1px solid oklch(0.92 0.008 95)",
                borderRadius: "0.75rem",
                fontSize: "12px",
              }}
              formatter={(v: number) =>
                v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
              }
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="oklch(0.55 0.18 145)"
              strokeWidth={2.5}
              fill="url(#growthFill)"
            />
            <Area
              type="monotone"
              dataKey="invested"
              stroke="oklch(0.22 0.02 250)"
              strokeWidth={2}
              strokeDasharray="4 4"
              fill="url(#investedFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
