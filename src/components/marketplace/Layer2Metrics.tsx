import React from 'react';
import { Asset } from '@/lib/mockEngine';
import { MetricModule } from './MetricModule';
import { getMetricsSchema } from '@/lib/metricsSchema';
import { Typography } from '@/components/ui/Typography';
import { cn } from '@/lib/utils';

export interface Layer2MetricsProps {
  asset: Asset;
}

function getSizeClass(size: string): string {
  switch (size) {
    case 'sm':
      return 'col-span-1';
    case 'md':
      return 'col-span-2';
    case 'lg':
      return 'col-span-3';
    case 'xl':
      return 'col-span-4';
    default:
      return 'col-span-1';
  }
}

export function Layer2Metrics({ asset }: Layer2MetricsProps) {
  const schema = getMetricsSchema(asset.strategy);

  return (
    <section className="min-h-full p-12 bg-background/40 backdrop-blur-sm border-t border-white/5">
      {/* Header */}
      <div className="mb-12">
        <Typography variant="label" className="opacity-50 mb-3 block">
          Análisis Financiero Detallado
        </Typography>
        <h2 className="text-4xl font-light text-white tracking-tight">
          Estrategia: <span className="font-medium text-emerald-400 capitalize">{asset.strategy.replace(/_/g, ' ')}</span>
        </h2>
      </div>

      {/* Grid - 4 columnas base */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {schema.map((metric) => {
          // Obtener valor del asset por metric.id
          const value = (asset as any)[metric.id] ?? null;

          return (
            <div key={metric.id} className={cn('flex flex-col h-full', getSizeClass(metric.size))}>
              <MetricModule
                metric={metric}
                value={value}
                highlight={metric.highlight}
              />
            </div>
          );
        })}
      </div>

      {/* Rationale contextual o footer de sección si es necesario */}
      <div className="mt-16 pt-8 border-t border-white/5 flex justify-between items-center opacity-40">
        <Typography variant="label" className="normal-case tracking-normal">
          * Datos procesados por el motor de análisis de The Oracle basado en {asset.confidence ? (asset.confidence * 100).toFixed(0) : '85'}% de fiabilidad de fuentes.
        </Typography>
        <div className="flex gap-4">
           {/* Placeholder para mini-logos o indicadores de fuentes */}
        </div>
      </div>
    </section>
  );
}
