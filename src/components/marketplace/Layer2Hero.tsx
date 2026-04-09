import React from 'react';
import { ChevronDown, X } from 'lucide-react';
import { Asset } from '@/lib/mockEngine';
import { Typography } from '@/components/ui/Typography';
import { cn } from '@/lib/utils';

export interface Layer2HeroProps {
  asset: Asset;
  onClose: () => void;
}

export function Layer2Hero({ asset, onClose }: Layer2HeroProps) {
  return (
    <section className="min-h-full relative flex flex-col justify-between p-12 overflow-hidden">
      {/* Background image + overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
        style={{
          backgroundImage: `url(${
            asset.layer1.backgroundImageUrl || 'https://via.placeholder.com/1200x800'
          })`,
          opacity: 0.35
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />

      {/* Close button - TOP RIGHT */}
      <button
        onClick={onClose}
        className="absolute top-8 right-8 z-50 p-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
        aria-label="Close Layer 2"
      >
        <X className="w-5 h-5 text-white/50 group-hover:text-white" />
      </button>

      {/* HEADER CONTENT - TOP */}
      <div className="relative z-10 animate-fade-in-up">
        {/* Strategy badge */}
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6 backdrop-blur-sm">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em]">
            {asset.strategy.replace('_', ' ')}
          </span>
        </div>

        {/* Location / Title */}
        <Typography variant="h1" className="text-white mb-6 max-w-4xl tracking-tight leading-[0.9]">
          {asset.location}
        </Typography>

        {/* Rationale - cursiva con borde izquierdo */}
        <div className="border-l-2 border-emerald-500/50 pl-6 py-1 max-w-2xl">
          <p className="text-xl text-white/60 font-light italic leading-relaxed">
            "{asset.layer1.rationale || 'Oportunidad de inversión estratégica curada por The Oracle'}"
          </p>
        </div>
      </div>

      {/* KPI PRINCIPAL - BOTTOM */}
      <div className="relative z-10 flex flex-wrap justify-between items-end gap-12 pt-12 animate-fade-in">
        <div className="flex gap-16 items-end">
          {/* G-Score - LEFT */}
          <div className="group">
            <Typography variant="label" className="mb-2 opacity-50 group-hover:opacity-100 transition-opacity">
              G-Score
            </Typography>
            <div className="text-8xl font-thin tracking-tighter text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              {Math.round(asset.layer1.gScore || 0)}
            </div>
          </div>

          {/* IRR - RIGHT */}
          <div className="group">
            <Typography variant="label" className="mb-2 opacity-50 group-hover:opacity-100 transition-opacity">
              IRR Estimado
            </Typography>
            <div className="text-8xl font-thin tracking-tighter text-white">
              {(asset.layer1.expectedIrr * 100).toFixed(1)}<span className="text-4xl ml-1 opacity-50">%</span>
            </div>
          </div>
        </div>

        {/* SCROLL INDICATOR - RIGHT BOTTOM */}
        <div className="flex flex-col items-center gap-3 pb-4">
          <span className="text-[9px] uppercase tracking-widest text-white/30">Explorar análisis</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1/2 bg-emerald-500 animate-scroll-path" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scroll-path {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
        .animate-fade-in-up { animation: fade-in-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in { animation: fade-in 1.5s ease-out forwards; }
        .animate-scroll-path { animation: scroll-path 2s infinite cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </section>
  );
}
