'use client';

import React, { useState } from 'react';
import { Asset } from '@/lib/mockEngine';
import { getSensitivitySchema } from '@/lib/sensitivitySchema';
import { Typography } from '@/components/ui/Typography';
import { GlassSlider } from '@/components/ui/GlassSlider';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, RotateCcw } from 'lucide-react';

export interface Layer2SensitivityProps {
  asset: Asset;
}

export function Layer2Sensitivity({ asset }: Layer2SensitivityProps) {
  const schema = getSensitivitySchema(asset.strategy);
  const baseIrr = (asset.layer1.expectedIrr * 100) || 0;

  // Estado de sliders: { [id]: valor }
  const [sliderValues, setSliderValues] = useState<Record<string, number>>(
    Object.fromEntries(schema.map((s) => [s.id, s.default]))
  );

  // Calcular IRR ajustado (lógica lineal simple)
  const calculateAdjustedIrr = (): number => {
    let adjustment = 0;

    schema.forEach((variable) => {
      const currentValue = sliderValues[variable.id] ?? variable.default;
      const deltaFromDefault = currentValue - variable.default;
      const range = (variable.max - variable.min) || 1;

      // Impacto lineal: ~2% IRR por cada 10% del rango del slider
      const impact = (deltaFromDefault / range) * 2;

      if (variable.impact === 'irr_negative') {
        adjustment -= Math.abs(impact);
      } else {
        adjustment += Math.abs(impact);
      }
    });

    return baseIrr + adjustment;
  };

  const adjustedIrr = calculateAdjustedIrr();
  const deltaIrr = adjustedIrr - baseIrr;
  const isPositive = deltaIrr >= 0;

  const handleReset = () => {
    setSliderValues(
      Object.fromEntries(schema.map((s) => [s.id, s.default]))
    );
  };

  return (
    <section className="min-h-full p-12 bg-background/60 backdrop-blur-md border-t border-white/5 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -ml-48 -mb-48" />

      {/* Header */}
      <div className="relative z-10 mb-12">
        <Typography variant="label" className="opacity-50 mb-3 block">Análisis de Sensibilidad</Typography>
        <h2 className="text-4xl font-light text-white tracking-tight mb-8">
          Simulación de <span className="font-medium text-primary">Escenarios</span>
        </h2>

        {/* IRR Comparison Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
          <div className="space-y-1">
            <Typography variant="label" className="opacity-40 normal-case tracking-normal">IRR Original (The Oracle Base)</Typography>
            <div className="text-5xl font-extralight text-white opacity-40 italic">
               {baseIrr.toFixed(1)}%
            </div>
          </div>
          
          <div className="flex items-center gap-8">
             <div className="h-12 w-px bg-white/10 hidden md:block" />
             <div className="space-y-1">
                <Typography variant="label" className="opacity-70 normal-case tracking-normal">IRR Ajustado (Tu Escenario)</Typography>
                <div className="flex items-end gap-3">
                  <div className="text-7xl font-bold text-white tracking-tighter">
                    {adjustedIrr.toFixed(1)}%
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 mb-2 px-2 py-1 rounded text-xs font-bold",
                    isPositive ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                  )}>
                    {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {isPositive ? '+' : ''}{deltaIrr.toFixed(1)}%
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
        {schema.map((variable) => (
          <GlassSlider
            key={variable.id}
            label={variable.label}
            min={variable.min}
            max={variable.max}
            step={variable.step}
            value={sliderValues[variable.id] ?? variable.default}
            onChange={(e) =>
              setSliderValues((prev) => ({
                ...prev,
                [variable.id]: parseFloat(e.target.value)
              }))
            }
            formatValue={(v) => `${v.toFixed(variable.step < 1 ? 2 : 0)}${variable.unit}`}
          />
        ))}
      </div>

      {/* Footer / Controls */}
      <div className="relative z-10 mt-16 flex justify-between items-center">
        <div className="max-w-md">
           <Typography variant="label" className="normal-case tracking-normal opacity-40 leading-relaxed">
             * Este simulador aplica un modelo de sensibilidad lineal sobre el IRR base. Los resultados son proyecciones estimadas sujetas a condiciones de mercado.
           </Typography>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm font-medium hover:bg-white/10 hover:text-white transition-all active:scale-95"
        >
          <RotateCcw size={16} />
          Restablecer Valores Base
        </button>
      </div>
    </section>
  );
}
