'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Asset } from '@/lib/mockEngine';
import { useGeolandStore } from '@/store/useGeolandStore';
import { Layer2Hero } from './Layer2Hero';
import { Layer2Metrics } from './Layer2Metrics';
import { Layer2Sensitivity } from './Layer2Sensitivity';
import { Layer2DataRoom } from './Layer2DataRoom';
import { cn } from '@/lib/utils';

export interface Layer2ContainerProps {
  asset: Asset;
  onClose: () => void;
}

export function Layer2Container({ asset, onClose }: Layer2ContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(0);
  const { scrollPosition, setScrollPosition } = useGeolandStore();

  // Restaurar scroll position al montar
  useEffect(() => {
    const saved = scrollPosition[asset.id];
    if (saved !== undefined && scrollRef.current) {
      scrollRef.current.scrollTop = saved;
    }
  }, [asset.id, scrollPosition]);

  // Guardar scroll position y detectar sección activa
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const scrollTop = target.scrollTop;
    
    // Guardar en Store (debounced o throttle idealmente, pero aqui directo para simplicidad segun ticket)
    setScrollPosition(asset.id, scrollTop);

    // Detectar qué sección está visible
    // Asumimos que cada sección es min-h-full. Usamos el scrollHeight / numSecciones
    if (scrollRef.current) {
       const sections = scrollRef.current.children;
       let currentSection = 0;
       let accumulatedHeight = 0;
       
       for (let i = 0; i < sections.length; i++) {
         const sectionHeight = sections[i].clientHeight;
         if (scrollTop >= accumulatedHeight - 100) { // -100 threshold
           currentSection = i;
         }
         accumulatedHeight += sectionHeight;
       }
       setActiveSection(currentSection);
    }
  };

  const scrollToSection = (index: number) => {
    if (!scrollRef.current) return;
    const sections = scrollRef.current.children;
    if (sections[index]) {
      sections[index].scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-background overflow-hidden animate-in fade-in duration-700">
      {/* Container de Scroll Confinado */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scroll-smooth hide-scrollbar"
        onScroll={handleScroll}
      >
        <Layer2Hero asset={asset} onClose={onClose} />
        <Layer2Metrics asset={asset} />
        <Layer2Sensitivity asset={asset} />
        <Layer2DataRoom 
          asset={asset} 
          onScrollToTop={() => scrollToSection(0)}
          onOpenLayer3={() => console.log('OPEN LAYER 3 - INVESTMENT MEMO')}
        />
      </div>

      {/* Navegación Lateral (Dots) */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-40 bg-white/5 backdrop-blur-xl p-3 py-6 rounded-full border border-white/10 shadow-2xl">
        {['HERO', 'KPIs', 'SENS', 'DATA'].map((label, i) => (
          <button
            key={i}
            onClick={() => scrollToSection(i)}
            className="group relative flex items-center justify-center h-4 w-4"
            aria-label={`Ir a sección ${label}`}
          >
            {/* Label Tooltip */}
            <span className={cn(
               "absolute right-10 px-2 py-1 rounded bg-black/80 text-[10px] text-white font-bold tracking-widest opacity-0 scale-90 translate-x-2 transition-all group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 pointer-events-none whitespace-nowrap border border-white/10",
               activeSection === i && "opacity-100 scale-100 translate-x-0 text-emerald-400"
            )}>
              {label}
            </span>
            
            {/* Dot */}
            <div className={cn(
              "w-2 h-2 rounded-full transition-all duration-500",
              activeSection === i 
                ? "bg-emerald-400 scale-150 shadow-[0_0_10px_rgba(52,211,153,0.8)]" 
                : "bg-white/20 hover:bg-white/50"
            )} />
          </button>
        ))}
      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
