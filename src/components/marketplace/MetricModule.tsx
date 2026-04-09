import React from 'react';
import { MetricModule as MetricModuleType, MetricValue } from '@/types/schemas';
import { SourceBadge } from './SourceBadge';
import { Typography } from '@/components/ui/Typography';
import { cn } from '@/lib/utils';

export interface MetricModuleProps {
  metric: MetricModuleType;
  value: MetricValue;
  highlight?: boolean; 
}

// Formateadores de valor
function formatValue(value: MetricValue, format: string): string {
  if (value === null || value === undefined) {
    return '---';
  }

  switch (format) {
    case 'currency': {
      const num = typeof value === 'number' ? value : 0;
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(num);
    }

    case 'percent': {
      const num = typeof value === 'number' ? value : 0;
      return `${num.toFixed(1)}%`;
    }

    case 'number': {
      const num = typeof value === 'number' ? value : 0;
      return new Intl.NumberFormat('es-ES').format(num);
    }

    case 'text':
    case 'badge':
      return String(value);

    default:
      return String(value);
  }
}

// Tipografía según tamaño - adaptado para caber en grid
function getTitleVariant(size: string): string {
  switch (size) {
    case 'sm':
      return 'text-lg';
    case 'md':
      return 'text-2xl';
    case 'lg':
      return 'text-4xl';
    case 'xl':
      return 'text-5xl';
    default:
      return 'text-2xl';
  }
}

export function MetricModule({
  metric,
  value,
  highlight
}: MetricModuleProps) {
  const isHighlighted = highlight !== undefined ? highlight : metric.highlight;
  const formattedValue = formatValue(value, metric.format);
  const sizeClass = getTitleVariant(metric.size);

  return (
    <div
      className={cn(
        'p-5 rounded-xl glass-panel relative flex flex-col justify-between h-full min-h-[140px]',
        'transition-all duration-300 border',
        isHighlighted 
          ? 'border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
          : 'border-white/10 hover:border-white/20'
      )}
    >
      {/* Label */}
      <Typography variant="label" className="text-[10px] opacity-70 mb-2">
        {metric.label}
      </Typography>

      {/* Valor formateado */}
      <div className={cn('font-light tracking-tight text-white flex-grow flex items-center', sizeClass)}>
        {metric.format === 'badge' ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {formattedValue}
          </span>
        ) : (
          formattedValue
        )}
      </div>

      {/* Source Badge - esquina inferior derecha */}
      <div className="mt-4 flex justify-end">
        <SourceBadge source={metric.source} />
      </div>
    </div>
  );
}
