import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { cn } from './utils';

interface GrowthChartDataPoint {
  [key: string]: string | number;
}

interface GrowthChartProps {
  data: GrowthChartDataPoint[];
  dataKeyY?: string;
  dataKeyX?: string;
  title?: string;
  height?: number;
  className?: string;
}

/**
 * Componente de gráfico de área para visualizar crescimento financeiro
 * Usa Recharts com gradiente neon e tema dark mode
 */
export const GrowthChart: React.FC<GrowthChartProps> = ({
  data,
  dataKeyY = 'valor',
  dataKeyX = 'mes',
  title,
  height = 300,
  className,
}) => {
  // Customizar tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-youfing-secondary border border-youfing-light rounded-lg p-3 shadow-youfing-lg">
          <p className="text-youfing-secondary text-xs">
            {dataKeyX}: {dataPoint[dataKeyX]}
          </p>
          <p className="text-accent font-semibold text-sm">
            R$ {Number(dataPoint[dataKeyY]).toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      );
    }
    return null;
  };

  // Se não há dados, mostrar placeholder
  if (!data || data.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-2xl',
          'bg-youfing-secondary border border-youfing-light',
          'text-youfing-tertiary',
          className
        )}
        style={{ height: `${height}px` }}
      >
        <p className="text-sm">Nenhum dado disponível para exibição</p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-4 w-full', className)}>
      {title && (
        <h3 className="text-sm font-semibold text-youfing-secondary">
          {title}
        </h3>
      )}

      <div
        className="rounded-2xl bg-youfing-secondary p-4 border border-youfing-light shadow-youfing-md"
        style={{ height: `${height}px` }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            {/* Grid customizado */}
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              vertical={false}
            />

            {/* Eixo X */}
            <XAxis
              dataKey={dataKeyX}
              stroke="var(--color-text-tertiary)"
              style={{ fontSize: '12px' }}
              tickLine={false}
              axisLine={false}
            />

            {/* Eixo Y */}
            <YAxis
              stroke="var(--color-text-tertiary)"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) =>
                `R$ ${(value / 1000).toFixed(0)}k`
              }
              tickLine={false}
              axisLine={false}
              width={60}
            />

            {/* Tooltip customizado */}
            <Tooltip content={<CustomTooltip />} cursor={false} />

            {/* Área com gradiente neon */}
            <defs>
              <linearGradient
                id="colorGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-accent-primary)"
                  stopOpacity={0.6}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-accent-primary)"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>

            <Area
              type="monotone"
              dataKey={dataKeyY}
              stroke="var(--color-accent-primary)"
              strokeWidth={2}
              fill="url(#colorGradient)"
              isAnimationActive={true}
              animationDuration={800}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
