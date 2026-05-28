import React from 'react';
import { cn } from './utils';

interface BentoCardProps {
  label: string;
  value: string;
  hint: string;
  icon?: React.ReactNode;
  highlight?: boolean;
  className?: string;
}

export const BentoCard: React.FC<BentoCardProps> = ({
  label,
  value,
  hint,
  icon,
  highlight = false,
  className,
}) => {
  return (
    <div
      className={cn(
        'rounded-2xl p-6 transition-all duration-300',
        'flex flex-col gap-3',
        'border border-youfing',
        highlight
          ? 'bg-accent text-youfing-primary shadow-youfing-glow-intense'
          : 'bg-youfing-secondary text-youfing-primary shadow-youfing-md hover:shadow-youfing-lg hover:border-accent',
        className
      )}
    >
      {/* Header com icon e label */}
      <div className="flex items-center justify-between gap-2">
        {icon && (
          <div
            className={cn(
              'flex-shrink-0',
              highlight
                ? 'text-youfing-primary'
                : 'text-accent'
            )}
          >
            {icon}
          </div>
        )}
        <span className={cn(
          'text-sm font-medium',
          highlight ? 'text-youfing-primary' : 'text-youfing-secondary'
        )}>
          {label}
        </span>
      </div>

      {/* Valor principal */}
      <div className="flex flex-col gap-1">
        <p className={cn(
          'text-2xl font-bold tracking-tight',
          highlight ? 'text-youfing-primary' : 'text-accent'
        )}>
          {value}
        </p>
        <p className={cn(
          'text-xs',
          highlight ? 'text-youfing-primary opacity-80' : 'text-youfing-tertiary'
        )}>
          {hint}
        </p>
      </div>
    </div>
  );
};
