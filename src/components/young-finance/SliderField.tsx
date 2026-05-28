import React, { useState, useCallback } from 'react';
import { cn } from './utils';

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  prefix?: string;
}

export const SliderField: React.FC<SliderFieldProps> = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  prefix = '',
}) => {
  // Estado local para sincronização imediata do input
  const [inputValue, setInputValue] = useState(String(value));

  // Atualizar via slider
  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setInputValue(String(newValue));
    onChange(newValue);
  }, [onChange]);

  // Atualizar via input text
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Validar e aplicar mudança se for número válido
    const numValue = Number(newValue);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onChange(numValue);
    }
  }, [min, max, onChange]);

  // Sincronizar quando a prop `value` muda externamente
  React.useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  // Calcular porcentagem para o gradiente do slider
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Label e Input */}
      <div className="flex items-center justify-between gap-4">
        <label className="text-sm font-medium text-youfing-secondary">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-youfing-tertiary">{prefix}</span>
          <input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            min={min}
            max={max}
            step={step}
            className={cn(
              'w-24 rounded-lg px-3 py-2',
              'bg-youfing-tertiary text-youfing-primary',
              'border border-youfing-light',
              'text-right text-sm font-semibold',
              'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
              'transition-all duration-200'
            )}
          />
        </div>
      </div>

      {/* Slider Track com Gradient */}
      <div className="relative flex items-center w-full">
        {/* Background track */}
        <div className="absolute w-full h-2 bg-youfing-secondary rounded-full" />
        
        {/* Active track (gradiente) */}
        <div
          className="absolute h-2 bg-gradient-accent rounded-full pointer-events-none"
          style={{ width: `${percentage}%` }}
        />

        {/* Slider input (invisível, apenas para interação) */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          className={cn(
            'relative w-full h-2 appearance-none',
            'bg-transparent',
            'cursor-pointer',
            'rounded-full',
            /* Estilos para thumb (polegar) */
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:w-5',
            '[&::-webkit-slider-thumb]:h-5',
            '[&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:bg-accent',
            '[&::-webkit-slider-thumb]:cursor-pointer',
            '[&::-webkit-slider-thumb]:shadow-youfing-glow',
            '[&::-webkit-slider-thumb]:transition-all',
            '[&::-webkit-slider-thumb]:duration-200',
            '[&::-webkit-slider-thumb]:hover:shadow-youfing-glow-intense',
            /* Firefox */
            '[&::-moz-range-thumb]:w-5',
            '[&::-moz-range-thumb]:h-5',
            '[&::-moz-range-thumb]:rounded-full',
            '[&::-moz-range-thumb]:bg-accent',
            '[&::-moz-range-thumb]:border-0',
            '[&::-moz-range-thumb]:cursor-pointer',
            '[&::-moz-range-thumb]:shadow-youfing-glow'
          )}
        />
      </div>

      {/* Range text */}
      <div className="flex justify-between text-xs text-youfing-tertiary">
        <span>{prefix}{min.toLocaleString()}</span>
        <span>{prefix}{max.toLocaleString()}</span>
      </div>
    </div>
  );
};
