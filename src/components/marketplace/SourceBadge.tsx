import React from 'react';

export interface SourceBadgeProps {
  source: 'anuncio' | 'city_master' | 'live_api' | 'vision' | 'estimado';
}

// Paleta de colores por source
const SOURCE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  anuncio: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    label: 'Anuncio'
  },
  city_master: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    label: 'City Master'
  },
  live_api: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    label: 'Live API'
  },
  vision: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    label: 'Visión'
  },
  estimado: {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    label: 'Estimado'
  }
};

export function SourceBadge({ source }: SourceBadgeProps) {
  const styles = SOURCE_STYLES[source] || SOURCE_STYLES.anuncio;
  
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border border-current opacity-80 ${styles.bg} ${styles.text}`}
    >
      {styles.label}
    </span>
  );
}
