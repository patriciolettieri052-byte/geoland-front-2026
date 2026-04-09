'use client';

import React from 'react';
import { Asset } from '@/lib/mockEngine';
import { getMetricsSchema } from '@/lib/metricsSchema';
import { Typography } from '@/components/ui/Typography';
import { ChevronUp, FileText, Database, ShieldCheck, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Layer2DataRoomProps {
  asset: Asset;
  onScrollToTop?: () => void;
  onOpenLayer3?: () => void;
}

export function Layer2DataRoom({
  asset,
  onScrollToTop = () => {},
  onOpenLayer3 = () => {}
}: Layer2DataRoomProps) {
  const schema = getMetricsSchema(asset.strategy);
  const fidelity = Math.round((asset.confidence || 0.5) * 100);

  // Agrupar sources por count
  const sourceGroups: Record<string, number> = {};
  schema.forEach((metric) => {
    sourceGroups[metric.source] = (sourceGroups[metric.source] || 0) + 1;
  });

  const sourceLabels: Record<string, string> = {
    anuncio: 'Dato de Anuncio',
    city_master: 'Analítica City Master',
    live_api: 'API Mercado en Tiempo Real',
    vision: 'IA Computer Vision',
    estimado: 'Estimación Algorítmica'
  };

  return (
    <section className="min-h-full p-12 bg-background/80 backdrop-blur-xl border-t border-white/5 relative flex flex-col justify-between">
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-12">
          <Typography variant="label" className="opacity-50 mb-3 block">Transparencia Operativa</Typography>
          <h2 className="text-4xl font-light text-white tracking-tight">
            Data Room & <span className="font-medium text-emerald-400">Garantía</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Fidelidad & Metodología */}
          <div className="space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                   <ShieldCheck className="text-emerald-500" size={24} />
                   <Typography variant="h4" className="text-white font-medium">Fidelidad del Dataset</Typography>
                </div>
                <Typography variant="h3" className="text-emerald-400 font-bold">{fidelity}%</Typography>
              </div>
              
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-6">
                <div
                  className={cn(
                    "h-full transition-all duration-1000",
                    fidelity >= 80 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 
                    fidelity >= 60 ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 
                    'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                  )}
                  style={{ width: `${fidelity}%` }}
                />
              </div>
              
              <Typography variant="p" className="text-white/40 text-xs leading-relaxed">
                Este activo tiene una confianza del <span className="text-white/60 font-medium">{fidelity}%</span> basada en la validación cruzada de <span className="text-white/60 font-medium">{schema.length}</span> puntos de datos clave contra registros gubernamentales y APIs de mercado secundario.
              </Typography>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-xl border border-white/5 bg-white/[0.02]">
               <Database className="text-primary mt-1 shrink-0" size={20} />
               <div className="space-y-1">
                 <Typography variant="label" className="text-white/80 normal-case tracking-normal">Origen de Metadatos</Typography>
                 <Typography variant="p" className="text-xs text-white/40">
                   El 100% de la documentación técnica ha sido auditada por The Oracle mediante modelos de procesamiento de lenguaje natural optimizados para transacciones inmobiliarias.
                 </Typography>
               </div>
            </div>
          </div>

          {/* Sources Table */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md flex flex-col">
            <Typography variant="label" className="mb-6 opacity-60">Matriz de Procedencia</Typography>
            <div className="space-y-3 flex-grow">
              {Object.entries(sourceGroups).map(([source, count]) => (
                <div
                  key={source}
                  className="group flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-transparent hover:border-white/10 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      source === 'anuncio' ? 'bg-emerald-500' :
                      source === 'city_master' ? 'bg-blue-500' :
                      source === 'live_api' ? 'bg-amber-500' :
                      source === 'vision' ? 'bg-purple-500' : 'bg-red-500'
                    )} />
                    <span className="text-sm font-light text-white/80 tracking-wide">
                      {sourceLabels[source] || source}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-white/40 group-hover:text-white/80 transition-colors">
                    {count} {count === 1 ? 'métrica' : 'métricas'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <button
          onClick={onOpenLayer3}
          className="md:col-span-2 group flex items-center justify-between px-8 py-5 rounded-2xl bg-primary text-background font-bold text-lg hover:bg-emerald-400 transition-all active:scale-[0.98] shadow-2xl shadow-primary/20"
        >
          <div className="flex items-center gap-3">
            <FileText size={22} />
            <span>Acceder al Investment Memo Full</span>
          </div>
          <ExternalLink size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </button>

        <button
          onClick={onScrollToTop}
          className="flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all active:scale-[0.98]"
        >
          <ChevronUp size={20} className="text-primary animate-bounce-subtle" />
          <span className="font-medium">Volver Arriba</span>
        </button>
      </div>

      <style jsx>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce-subtle { animation: bounce-subtle 2s infinite ease-in-out; }
      `}</style>
    </section>
  );
}
