'use client';

import { Asset } from '@/lib/mockEngine';
import { motion } from 'framer-motion';
import { Bell, Heart } from 'lucide-react';

const STRATEGY_LABELS: Record<string, string> = {
    'FIX_FLIP': 'Fix and Flip',
    'RENTA': 'Renta',
    'FARMLAND': 'Farmland',
    'LIVESTOCK': 'Ganadería',
    'GREENFIELD': 'Greenfield',
    'DISTRESS': 'Distress',
    'NNN_COMERCIAL': 'NNN Comercial',
    'LAND_BANKING': 'Land Banking',
    'VALUE_ADD': 'Value Add',
};

const ZONA_LABELS: Record<string, string> = {
    'pampa_humeda': '🌾 Pampa Húmeda',
    'nea': '🌿 NEA',
    'noa': '⛰️ NOA',
    '_default': '📍 Zona Argentina',
};

const AGUA_LABELS: Record<string, string> = {
    'secano': '☁️ Secano',
    'riego_complementario': '💧 Riego Complementario',
    'riego_pleno': '🌊 Riego Pleno',
};

interface Layer1AssetCardProps {
    asset: Asset;
    onClick: (id: string) => void;
    rank?: number;
}

export function Layer1AssetCard({ asset, onClick, rank }: Layer1AssetCardProps) {
    const { expectedIrr, riskLevel, gScore, backgroundImageUrl } = asset.layer1;
    const precio = asset.layer2.metrics.baseCapex;
    const strategyLabel = STRATEGY_LABELS[asset.strategy] ?? asset.strategy;

    const getRiskColor = (level: string) => {
        const l = level.toLowerCase();
        if (l.includes('alto') || l.includes('max')) return 'text-red-500';
        if (l.includes('medio')) return 'text-amber-400';
        return 'text-emerald-400';
    };

    const formatPrecio = (n: number) => {
        if (!n || n === 0) return '—';
        return `${n.toLocaleString('es-ES')} USD`;
    };

    const isTop = rank === 1;

    return (
        <motion.div
            className={`flex flex-row items-stretch h-[110px] bg-white rounded-2xl overflow-hidden cursor-pointer group transition-all duration-200 hover:shadow-lg ${isTop ? 'ring-2 ring-amber-400/60' : 'ring-1 ring-black/8'}`}
            onClick={() => onClick(asset.id)}
            whileHover={{ scale: 1.015, y: -2 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        >
            {/* FOTO — 28% */}
            <div
                className="relative w-[28%] shrink-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${backgroundImageUrl})` }}
            >
                {/* TOP badge */}
                {isTop && (
                    <div className="absolute top-2 left-2 bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded tracking-widest uppercase">
                        TOP 1
                    </div>
                )}

                {/* Action icons */}
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

                {/* Risk badge sobre foto */}
                <div className="absolute bottom-2 left-2">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/50 backdrop-blur-sm ${getRiskColor(riskLevel)}`}>
                        ⊙ {riskLevel}
                    </span>
                </div>
            </div>

            {/* CONTENIDO CENTRAL — 47% */}
            <div className="flex flex-col justify-center px-4 w-[47%] shrink-0 border-r border-black/6">
                {/* Ciudad + país */}
                <p className="text-[9px] text-gray-400 uppercase tracking-[0.15em] font-medium mb-0.5">
                    📍 {asset.location}
                </p>

                {/* Nombre / título */}
                <p className="text-[13px] font-bold text-gray-900 leading-tight mb-2 truncate">
                    {asset.etiqueta_operacion ?? asset.location}
                </p>

                {/* Precio + Estrategia */}
                <div className="flex gap-4">
                    <div>
                        <p className="text-[8px] text-gray-400 uppercase tracking-widest font-semibold">Precio</p>
                        <p className="text-[12px] font-bold text-gray-800">{formatPrecio(precio)}</p>
                    </div>
                    <div>
                        <p className="text-[8px] text-gray-400 uppercase tracking-widest font-semibold">Estrategia</p>
                        <p className="text-[12px] font-semibold text-gray-700">{strategyLabel}</p>
                    </div>
                </div>

                {/* Tags agro (si aplica) */}
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

            {/* DERECHA — 25%: estrategia tag + G-Score + ROI */}
            <div className="flex flex-col items-end justify-center px-4 w-[25%] shrink-0 gap-2">
                {/* Strategy tag + G-Score en la misma línea como referencia */}
                <div className="flex items-center gap-2 w-full justify-end">
                    <span className="text-[8px] font-semibold text-gray-400 uppercase tracking-widest">
                        {strategyLabel.toUpperCase()}
                    </span>
                    <span className="bg-black text-white text-[11px] font-black px-2 py-0.5 rounded">
                        G {gScore}
                    </span>
                </div>

                {/* ROI */}
                <div className="text-right">
                    <p className="text-[8px] text-gray-400 uppercase tracking-widest font-semibold">ROI Est.</p>
                    <p className="text-[15px] font-black text-emerald-500 leading-tight">
                        ↗ {(expectedIrr * 100).toFixed(1)}%
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
