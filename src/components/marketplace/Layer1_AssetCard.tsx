'use client';

import { Asset } from '@/lib/mockEngine';
import { motion } from 'framer-motion';
import { Typography } from '../ui/Typography';
import { ShieldAlert } from 'lucide-react';

const ZONA_LABELS: Record<string, string> = {
    'pampa_humeda': '🌾 Pampa Húmeda',
    'nea': '🌿 NEA',
    'noa': '⛰️ NOA',
    '_default': '📍 Zona Argentina',
};

const CONEAT_LABELS: Record<number, string> = {
    1: 'Suelo Premium (Clase 1)',
    2: 'Suelo Muy Bueno (Clase 2)',
    3: 'Suelo Bueno (Clase 3)',
    4: 'Suelo Regular (Clase 4)',
    5: 'Suelo Moderado (Clase 5)',
    6: 'Suelo Pobre (Clase 6)',
    7: 'Suelo Marginal (Clase 7)',
    8: 'Suelo Muy Marginal (Clase 8)',
};

const AGUA_LABELS: Record<string, string> = {
    'secano': '☁️ Secano',
    'riego_complementario': '💧 Riego Complementario',
    'riego_pleno': '🌊 Riego Pleno',
};

interface Layer1AssetCardProps {
    asset: Asset;
    onClick: (id: string) => void;
}

export function Layer1AssetCard({ asset, onClick }: Layer1AssetCardProps) {
    const { expectedIrr, riskLevel } = asset.layer1;
    const getRiskColor = (level: string) => {
        const lower = level.toLowerCase();
        if (lower.includes('alto') || lower.includes('max')) return '!text-red-600';
        if (lower.includes('medio')) return '!text-amber-500';
        if (lower.includes('bajo') || lower.includes('min')) return '!text-emerald-600';
        return '!text-black/80';
    };

    return (
        <motion.div
            className="flex flex-row items-stretch h-[110px] bg-white/90 backdrop-blur-xl rounded-2xl border border-black/10 shadow-sm overflow-hidden group transition-all duration-300 hover:shadow-md cursor-pointer hover:bg-white"
            onClick={() => onClick(asset.id)}
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            {/* Foto Izquierda - 30% */}
            <div
                className="w-[30%] h-full shrink-0 bg-cover bg-center border-r border-black/5 opacity-90 group-hover:opacity-100 transition-opacity"
                style={{ backgroundImage: `url(${asset.layer1.backgroundImageUrl})` }}
            />

            {/* Contenido Central - 45% */}
            <div className="flex flex-col justify-center px-4 md:px-6 w-[45%] shrink-0 bg-white">
                <Typography variant="h4" className="!text-black font-semibold truncate text-[14px] md:text-[16px] leading-tight mb-1">
                    {asset.strategy}
                </Typography>
                <div className="flex items-center gap-1.5 !text-[#999999] truncate">
                    <Typography variant="label" className="!text-[#999999] text-[9px] md:text-[10px] uppercase tracking-[0.15em] font-medium truncate">
                        {asset.location}
                    </Typography>
                </div>
                {(asset.strategy === 'FARMLAND' || asset.strategy === 'LIVESTOCK') && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {asset.zona_agroecologica && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] md:text-[9px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">{ZONA_LABELS[asset.zona_agroecologica]}</span>
                        )}
                        {asset.clase_coneat && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] md:text-[9px] font-medium bg-amber-100 text-amber-800 border border-amber-200">{CONEAT_LABELS[asset.clase_coneat]}</span>
                        )}
                        {asset.acceso_agua && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] md:text-[9px] font-medium bg-blue-100 text-blue-800 border border-blue-200">{AGUA_LABELS[asset.acceso_agua]}</span>
                        )}
                    </div>
                )}
            </div>

            {/* Indicadores Derecha - 25% */}
            <div className="flex flex-col items-center justify-center w-[25%] shrink-0 border-l border-black/5 bg-[#EEEEEE] group-hover:bg-[#E5E5E5] transition-colors py-2">
                <Typography variant="label" className="text-[8px] md:text-[9px] !text-[#777777] uppercase font-bold tracking-[0.1em] mb-0.5 text-center leading-tight">
                    ROI<br />ESPERADO
                </Typography>
                <Typography variant="h3" className="!text-black font-extrabold text-[16px] md:text-xl leading-none mb-1.5 md:mb-2">
                    {(expectedIrr * 100).toFixed(1)}%
                </Typography>

                <div className="flex items-center gap-1.5 bg-transparent px-2 py-0.5 md:px-3 md:py-1 rounded border border-[#CCCCCC]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`hidden md:block ${getRiskColor(riskLevel)}`}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                    <Typography variant="label" className={`text-[7px] md:text-[8px] font-extrabold uppercase tracking-widest ${getRiskColor(riskLevel)}`}>
                        {riskLevel}
                    </Typography>
                </div>
            </div>
        </motion.div>
    );
}
