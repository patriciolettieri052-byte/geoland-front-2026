'use client';

import { Asset } from '@/lib/mockEngine';
import { motion } from 'framer-motion';
import { Bell, Heart } from 'lucide-react';

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
        className: 'bg-gradient-to-r from-yellow-500 to-amber-400 text-black',
        ring: 'ring-2 ring-amber-400/70',
    },
    2: {
        label: 'Silver',
        className: 'bg-gradient-to-r from-slate-300 to-gray-400 text-black',
        ring: 'ring-2 ring-slate-300/60',
    },
    3: {
        label: 'Bronze',
        className: 'bg-gradient-to-r from-orange-700 to-amber-700 text-white',
        ring: 'ring-2 ring-orange-600/50',
    },
};

interface Layer1AssetCardProps {
    asset: Asset;
    onClick: (id: string) => void;
    rank?: number;
}

export function Layer1AssetCard({ asset, onClick, rank }: Layer1AssetCardProps) {
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
    const ringClass = badge ? badge.ring : 'ring-1 ring-black/8';

    return (
        <motion.div
            className={`flex flex-row items-stretch h-[110px] bg-white/85 backdrop-blur-sm rounded-2xl overflow-hidden cursor-pointer group transition-all duration-200 hover:shadow-lg hover:bg-white/95 ${ringClass}`}
            onClick={() => onClick(asset.id)}
            whileHover={{ scale: 1.015, y: -2 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        >
            {/* FOTO — 28% */}
            <div
                className="relative w-[28%] shrink-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${backgroundImageUrl})` }}
            >
                {badge && (
                    <div className={`absolute top-2 left-2 text-[9px] font-black px-2 py-0.5 rounded tracking-widest uppercase shadow-md ${badge.className}`}>
                        {badge.label}
                    </div>
                )}

                <div className="absolute top-2 right-2 flex gap-1">
                    <button
                        onClick={(e) => e.stopPropagation()}
                        className="w-6 h-6 flex items-center justify-center bg-white/80 backdrop-blur rounded-full hover:bg-white transition-colors"
                    >
                        <Bell size={10} className="text-black/60" />
                    </button>
                    <button
                        onClick={(e) => e.stopPropagation()}
                        className="w-6 h-6 flex items-center justify-center bg-white/80 backdrop-blur rounded-full hover:bg-white transition-colors"
                    >
                        <Heart size={10} className="text-black/60" />
                    </button>
                </div>

                {/* Strategy badge sobre foto */}
                <div className="absolute bottom-2 left-2">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/55 backdrop-blur-sm text-white/90">
                        {strategyLabel}
                    </span>
                </div>
            </div>

            {/* CONTENIDO CENTRAL — 47% */}
            <div className="flex flex-col justify-center px-4 w-[47%] shrink-0 border-r border-black/6">
                <p className="text-[9px] text-gray-400 uppercase tracking-[0.15em] font-medium mb-0.5">
                    {asset.location}
                </p>

                <p className="text-[13px] font-bold text-gray-900 leading-tight mb-2 truncate">
                    {asset.etiqueta_operacion ?? asset.location}
                </p>

                <div>
                    <p className="text-[8px] text-gray-400 uppercase tracking-widest font-semibold">Precio</p>
                    <p className="text-[12px] font-bold text-gray-800">{formatPrecio(precio)}</p>
                </div>

                {(asset.strategy === 'FARMLAND' || asset.strategy === 'LIVESTOCK') && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                        {asset.zona_agroecologica && (
                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                                {ZONA_LABELS[asset.zona_agroecologica]}
                            </span>
                        )}
                        {asset.acceso_agua && (
                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                                {AGUA_LABELS[asset.acceso_agua]}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* DERECHA — 25%: G-Score + ROI */}
            <div className="flex flex-col items-end justify-center px-4 w-[25%] shrink-0 gap-2">
                <span className="bg-black text-white text-[10px] font-black px-2 py-0.5 rounded tracking-wide">
                    G-Score {gScore}
                </span>

                <div className="text-right">
                    <p className="text-[8px] text-gray-400 uppercase tracking-widest font-semibold">ROI Est.</p>
                    <p className="text-[15px] font-black text-emerald-500 leading-tight">
                        {(expectedIrr * 100).toFixed(1)}%
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
