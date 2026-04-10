'use client';

import { Asset } from '@/lib/mockEngine';
import { motion } from 'framer-motion';
import { Bell, Heart, HelpCircle } from 'lucide-react';
import { useGeolandStore } from '@/store/useGeolandStore';
import { translations } from '@/lib/translations';

const STRATEGY_LABELS: Record<string, string> = {
    'FIX_AND_FLIP':             'Fix & Flip',
    'VALUE_ADD':                'Value Add',
    'RENTAL_LONG_TERM':         'Renta',
    'RENTAL_SHORT_TERM':        'Renta Corta',
    'COMMERCIAL':               'Comercial',
    'DEVELOPMENT':              'Desarrollo',
    'DISTRESSED':               'Distressed',
    'LAND_BANKING':             'Land Banking',
    'AGRICULTURE':              'Agricultura',
    'LIVESTOCK':                'Ganadería',
    'MIXED_FARMLAND':           'Mixto',
    'FORESTRY':                 'Forestal',
    'BUY_AND_HOLD_APPRECIATION': 'Buy & Hold',
    'SUBDIVISION':              'Subdivisión',
    // ISV V6 values (minúsculas — por si llegan directamente)
    'fix_and_flip':              'Fix & Flip',
    'rental_long_term':          'Renta',
    'rental_short_term':         'Renta Corta',
    'buy_and_hold_appreciation': 'Buy & Hold',
    'development':               'Development',
    'commercial':                'Comercial',
    'agriculture':               'Agricultura',
    'livestock':                 'Ganadería',
    'mixed_farmland':            'Farmland Mixto',
    'land_banking':              'Land Banking',
    'subdivision':               'Subdivisión',
    'value_add':                 'Value Add',
    'distressed':                'Distressed',
    'forestry':                  'Forestal',
};

const ZONA_LABELS: Record<string, string> = {
    'pampa_humeda': '🌾 Pampa Húmeda',
    'nea': '🌿 NEA',
    'noa': '⛰️ NOA',
    '_default': 'Zona Argentina',
};

const AGUA_LABELS: Record<string, string> = {
    'secano': 'Secano',
    'riego_complementario': 'Riego Complementario',
    'riego_pleno': 'Riego Pleno',
};

const RANK_BADGES: Record<number, { label: string; className: string; ring: string }> = {
    1: {
        label: 'Gold',
        className: 'bg-yellow-100/90 text-yellow-700',
        ring: 'ring-0',
    },
    2: {
        label: 'Silver',
        className: 'bg-slate-100/90 text-slate-600',
        ring: 'ring-0',
    },
    3: {
        label: 'Bronze',
        className: 'bg-orange-100/90 text-orange-700',
        ring: 'ring-0',
    },
};

interface Layer1AssetCardProps {
    asset: Asset;
    onClick: (id: string) => void;
    rank?: number;
}

export function Layer1AssetCard({ asset, onClick, rank }: Layer1AssetCardProps) {
    const { language } = useGeolandStore();
    const t = translations[language];

    const layer1 = asset?.layer1 || {};
    const layer2 = asset?.layer2 || { metrics: { baseCapex: 0 } };
    
    // El backend v1.3 devuelve aqs_score, en el front lo mapeamos a gScore
    const gScore = layer1.gScore ?? (asset as any).aqs_score ?? 0;
    const expectedIrr = layer1.expectedIrr ?? 0;
    const backgroundImageUrl = layer1.backgroundImageUrl ?? "";
    
    const precio = layer2.metrics?.baseCapex ?? 0;
    const strategyLabel = STRATEGY_LABELS[asset.strategy] ?? asset.strategy;

    const formatPrecio = (n: number) => {
        if (!n || n === 0) return '—';
        return `${n.toLocaleString('es-ES')} USD`;
    };

    const badge = rank && rank <= 3 ? RANK_BADGES[rank] : null;

    // Lógica de color pastel para G-Score
    const getGScoreColor = (score: number) => {
        if (score >= 80) return 'bg-[#A7F3D0]'; // Emerald 200
        if (score >= 60) return 'bg-[#FDE68A]'; // Amber 200
        if (score >= 40) return 'bg-[#FED7AA]'; // Orange 200
        return 'bg-[#FECACA]'; // Rose 200
    };

    const getGScoreBorderColor = (score: number) => {
        if (score >= 80) return 'border-[#6ee7b7]'; 
        if (score >= 60) return 'border-[#fcd34d]';
        if (score >= 40) return 'border-[#fdba74]';
        return 'border-[#fca5a5]';
    };

    return (
        <motion.div
            className="flex flex-row items-stretch h-[128px] rounded-xl overflow-hidden cursor-pointer group transition-all duration-200"
            style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
            }}
            whileHover={{ scale: 1.008, y: -1, boxShadow: '0 4px 16px rgba(0,0,0,0.10)' }}
            onClick={() => onClick(asset.id)}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        >
            {/* FOTO — 28% */}
            <div className="relative w-[28%] shrink-0">
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-85"
                    style={{ backgroundImage: `url(${backgroundImageUrl})` }}
                />
                {badge && (
                    <div className={`absolute top-2 left-2 text-[9px] font-semibold px-2 py-0.5 rounded-md tracking-widest uppercase shadow-sm ${badge.className}`}>
                        {t.header.rank[badge.label as keyof typeof t.header.rank] || badge.label}
                    </div>
                )}

                <div className="absolute top-2 right-2 flex gap-1">
                    <button
                        onClick={(e) => e.stopPropagation()}
                        className="w-6 h-6 flex items-center justify-center rounded-full transition-colors"
                        style={{ backgroundColor: 'rgba(255,255,255,0.85)' }}
                    >
                        <Bell size={10} style={{ color: '#374151' }} />
                    </button>
                    <button
                        onClick={(e) => e.stopPropagation()}
                        className="w-6 h-6 flex items-center justify-center rounded-full transition-colors"
                        style={{ backgroundColor: 'rgba(255,255,255,0.85)' }}
                    >
                        <Heart size={10} style={{ color: '#374151' }} />
                    </button>
                </div>

                {/* Strategy badge sobre foto */}
                <div className="absolute bottom-2 left-2">
                    <span className="text-[9px] font-normal px-1.5 py-0.5 rounded bg-black/55 backdrop-blur-sm text-white/90">
                        {strategyLabel}
                    </span>
                </div>
            </div>

            <div className="flex flex-col justify-center px-4 w-[47%] shrink-0" style={{ borderRight: '1px solid #F3F4F6' }}>
                <p className="text-[9px] uppercase tracking-[0.15em] font-semibold mb-0.5" style={{ color: '#9CA3AF' }}>
                    {asset.location}
                </p>

                <p className="text-[13px] font-semibold leading-tight mb-1 truncate" style={{ color: '#0F1117' }}>
                    {asset.etiqueta_operacion ?? asset.location}
                </p>

                {(asset as any).assetType && (
                    <div className="mb-2">
                        <span className="inline-block text-[8px] px-1.5 py-0.5 rounded-md uppercase tracking-wider font-semibold" style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>
                            {(asset as any).assetType}
                        </span>
                    </div>
                )}

                <div>
                    <p className="text-[8px] uppercase tracking-widest font-semibold" style={{ color: '#9CA3AF' }}>{t.assetCard.price}</p>
                    <p className="text-[12px] font-bold num" style={{ color: '#0F1117' }}>{formatPrecio(precio)}</p>
                </div>

                {(asset.strategy === 'FARMLAND' || asset.strategy === 'LIVESTOCK') && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                        {asset.zona_agroecologica && (
                            <span className="text-[8px] px-1.5 py-0.5 rounded-md font-medium" style={{ backgroundColor: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' }}>
                                {ZONA_LABELS[asset.zona_agroecologica]}
                            </span>
                        )}
                        {asset.acceso_agua && (
                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-blue-100/50 text-blue-800 border border-blue-200">
                                {AGUA_LABELS[asset.acceso_agua]}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* DERECHA — 32%: G-Score + ROI + Confidence */}
            <div className="flex flex-col items-center justify-center px-6 w-[32%] shrink-0 gap-4">
                <div className="flex items-center justify-between w-full">
                    {/* G-Score Group */}
                    <div className="flex flex-col items-center flex-1">
                        <div className="flex items-center gap-1 mb-1.5" title="G-Score">
                            <span className="text-[9px] uppercase font-bold tracking-[0.05em]" style={{ color: '#9CA3AF' }}>G-Score</span>
                            <HelpCircle size={9} style={{ color: '#9CA3AF' }} />
                        </div>
                        <div className="text-[32px] font-bold num leading-none" style={{ color: gScore >= 80 ? '#059669' : gScore >= 60 ? '#D97706' : '#DC2626' }}>
                            {gScore}
                        </div>
                    </div>

                    {/* Fina línea sutil vertical */}
                    <div className="w-[1px] h-10 bg-gray-100 mx-2" />

                    {/* ROI Group */}
                    <div className="flex flex-col items-center flex-1">
                        <span className="text-[9px] uppercase font-bold tracking-[0.05em] mb-1.5" style={{ color: '#9CA3AF' }}>{t.assetCard.roiEst}</span>
                        <div className="text-[32px] font-bold leading-none num" style={{ color: '#16A34A' }}>
                            {(expectedIrr * 100).toFixed(1)}%
                        </div>
                    </div>
                </div>

                {/* Confidence Badge - Premium Pill */}
                {((asset as any).confidenceScore !== undefined || asset.confidence !== undefined) && (
                    <div className={`w-full flex items-center justify-center gap-2 border-2 rounded-full py-1.5 px-4 ${getGScoreBorderColor((asset as any).confidenceScore ?? (asset.confidence ? asset.confidence * 100 : 0))} transition-all`} style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">{t.assetCard.confidence}</span>
                        <span className="text-[13px] font-extrabold num text-slate-800">
                            {((asset as any).confidenceScore ?? (asset.confidence ? asset.confidence * 100 : 0)).toFixed(0)}%
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
