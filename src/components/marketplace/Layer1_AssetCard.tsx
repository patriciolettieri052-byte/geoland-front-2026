'use client';

import { Asset } from '@/lib/mockEngine';
import { motion } from 'framer-motion';
import { Bell, Heart } from 'lucide-react';
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

    return (
        <motion.div
            className="flex flex-row items-stretch h-[110px] bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden cursor-pointer group transition-all duration-200 hover:shadow-lg hover:bg-white/15"
            onClick={() => onClick(asset.id)}
            whileHover={{ scale: 1.015, y: -2 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        >
            {/* FOTO — 28% */}
            <div className="relative w-[28%] shrink-0">
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-85"
                    style={{ backgroundImage: `url(${backgroundImageUrl})` }}
                />
                {badge && (
                    <div className={`absolute top-2 left-2 text-[9px] font-medium px-2 py-0.5 rounded tracking-widest uppercase shadow-md ${badge.className}`}>
                        {t.header.rank[badge.label as keyof typeof t.header.rank] || badge.label}
                    </div>
                )}

                <div className="absolute top-2 right-2 flex gap-1">
                    <button
                        onClick={(e) => e.stopPropagation()}
                        className="w-6 h-6 flex items-center justify-center bg-white/20 backdrop-blur rounded-full hover:bg-white transition-colors"
                    >
                        <Bell size={10} className="text-white" />
                    </button>
                    <button
                        onClick={(e) => e.stopPropagation()}
                        className="w-6 h-6 flex items-center justify-center bg-white/20 backdrop-blur rounded-full hover:bg-white transition-colors"
                    >
                        <Heart size={10} className="text-white" />
                    </button>
                </div>

                {/* Strategy badge sobre foto */}
                <div className="absolute bottom-2 left-2">
                    <span className="text-[9px] font-normal px-1.5 py-0.5 rounded bg-black/55 backdrop-blur-sm text-white/90">
                        {strategyLabel}
                    </span>
                </div>
            </div>

            <div className="flex flex-col justify-center px-4 w-[47%] shrink-0 border-r border-white/10">
                <p className="text-[9px] text-white uppercase tracking-[0.15em] font-bold mb-0.5">
                    {asset.location}
                </p>

                <p className="text-[13px] font-bold text-white leading-tight mb-1 truncate">
                    {asset.etiqueta_operacion ?? asset.location}
                </p>

                {(asset as any).assetType && (
                    <div className="mb-2">
                        <span className="inline-block bg-white/5 text-white text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">
                            {(asset as any).assetType}
                        </span>
                    </div>
                )}

                <div>
                    <p className="text-[8px] text-white/70 uppercase tracking-widest font-bold">{t.assetCard.price}</p>
                    <p className="text-[12px] font-bold text-white">{formatPrecio(precio)}</p>
                </div>

                {(asset.strategy === 'FARMLAND' || asset.strategy === 'LIVESTOCK') && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                        {asset.zona_agroecologica && (
                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#7BA99D]/20 text-[#618E84] border border-[#7BA99D]/30">
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

            {/* DERECHA — 25%: G-Score + ROI */}
            <div className="flex flex-col items-end justify-center px-4 w-[25%] shrink-0 gap-1.5">
                <div className="flex flex-col items-end gap-1">
                    <span className="bg-[#5a4282] text-white text-[9px] font-normal px-2 py-0.5 rounded-full tracking-wide">
                        G-Score {gScore}
                    </span>
                    
                    {/* NUEVO: Confidence % con color dinámico */}
                    {((asset as any).confidenceScore !== undefined || asset.confidence !== undefined) && (
                        <div className={`flex items-center gap-1 border rounded-full px-1.5 py-0.5 ${
                            ((asset as any).confidenceScore ?? (asset.confidence ? asset.confidence * 100 : 0)) >= 80 ? 'border-[#7BA99D]/50 text-[#618E84]' :
                            ((asset as any).confidenceScore ?? (asset.confidence ? asset.confidence * 100 : 0)) >= 50 ? 'border-amber-500/50 text-amber-600' : 'border-rose-500/50 text-rose-600'
                        }`}>
                            <span className="text-[7px] uppercase tracking-tighter opacity-70">{t.assetCard.confidence}</span>
                            <span className="text-[9px] font-normal">
                                {((asset as any).confidenceScore ?? (asset.confidence ? asset.confidence * 100 : 0)).toFixed(0)}%
                            </span>
                        </div>
                    )}
                </div>

                <div className="text-right">
                    <p className="text-[8px] text-white/70 uppercase tracking-widest font-bold">{t.assetCard.roiEst}</p>
                    <p className="text-[15px] font-bold text-[#7BA99D] leading-tight">
                        {(expectedIrr * 100).toFixed(1)}%
                    </p>
                </div>

                {/* NUEVO: Cap Rate */}
                {(asset as any).capRate !== undefined && (
                    <div className="text-right border-t border-white/10 pt-1 w-full mt-0.5">
                        <p className="text-[9px] text-white font-bold">
                            {t.assetCard.capRate} {((asset as any).capRate * 100).toFixed(1)}%
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
