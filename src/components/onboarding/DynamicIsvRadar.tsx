'use client';

import { useGeolandStore } from '@/store/useGeolandStore';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Typography } from '../ui/Typography';

const INVESTOR_TYPE_LABELS: Record<string, string> = {
    retail_exploratorio: '👤 Retail',
    retail_activo: '👤 Retail Activo',
    profesional_independiente: '💼 Profesional',
    advisor_wealth_manager: '🤝 Advisor',
    family_office: '🏛️ Family Office',
    fondo_institucional: '🏦 Institucional',
};

export function DynamicIsvRadar() {
    const { filtrosBlandosIsv, isvExpandido } = useGeolandStore();

    const mapStr = (val: string | null, def: number, map: Record<string, number>) => val && map[val] ? map[val] : def;

    const data = [
        { subject: 'Strategy', A: mapStr(filtrosBlandosIsv.estrategiaObjetivo, 10, { "Renta": 30, "Buy & Hold": 50, "Fix & Flip": 90, "Farmland": 20 }), fullMark: 100 },
        { subject: 'Horizon', A: mapStr(filtrosBlandosIsv.horizonteAnos, 10, { "1-2": 20, "3-5": 50, ">5": 90, "Flexible": 50 }), fullMark: 100 },
        { subject: 'Involve', A: mapStr(filtrosBlandosIsv.involucramiento, 10, { "Activo": 90, "Medio": 50, "Pasivo": 10 }), fullMark: 100 },
        { subject: 'Risk', A: mapStr(filtrosBlandosIsv.riesgoTolerancia, 10, { "Bajo": 20, "Medio": 50, "Alto": 90 }), fullMark: 100 },
        { subject: 'Finance', A: mapStr(filtrosBlandosIsv.financiacion, 10, { "100% Propio": 10, "Con Deuda": 90, "Depende": 50 }), fullMark: 100 },
        { subject: 'Market', A: mapStr(filtrosBlandosIsv.mercadoPreferencia, 10, { "Consolidados": 20, "Emergentes": 80, "Ambos": 50 }), fullMark: 100 },
    ];

    const cs = isvExpandido.confidenceScore;
    const isConfident = cs >= 60;

    return (
        <div className="relative w-full h-full min-h-[500px] flex flex-col items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="w-full h-full max-h-[600px] z-10"
            >
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 300, letterSpacing: '0.1em' }}
                        />
                        <PolarRadiusAxis
                            angle={30}
                            domain={[0, 100]}
                            tick={false}
                            axisLine={false}
                        />
                        <Radar
                            name="ISV"
                            dataKey="A"
                            stroke="#ffffff"
                            strokeWidth={2}
                            fill="#ffffff"
                            fillOpacity={0.2}
                            animationDuration={800}
                            animationEasing="ease-in-out"
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </motion.div>

            <div className="absolute bottom-8 text-center bg-black/40 backdrop-blur-md border border-white/5 py-3 px-8 rounded-full">
                <Typography variant="label" className="text-white">Investor Strategy Vector</Typography>
            </div>

            {/* ── CONFIDENCE BAR (FRONT-ISV-EXP-05) ─────────────────── */}
            <div className="w-full px-6 mt-4">
                <div className="flex justify-between text-xs text-white/50 mb-1">
                    <span>Confianza del perfil</span>
                    <span>{cs.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                    <motion.div
                        className={`h-1.5 rounded-full transition-colors duration-300 ${isConfident ? 'bg-emerald-400' : 'bg-orange-400'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${cs}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                </div>
            </div>

            {/* ── ISV EXPANDED TAGS (FRONT-ISV-EXP-05) ──────────────── */}
            <div className="flex flex-wrap gap-1.5 px-6 mt-3 justify-center">
                {isvExpandido.investorType && (
                    <span className="text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded-full border border-white/10">
                        {INVESTOR_TYPE_LABELS[isvExpandido.investorType] ?? isvExpandido.investorType}
                    </span>
                )}
                {isvExpandido.experienceLevel && (
                    <span className="text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded-full border border-white/10">
                        {isvExpandido.experienceLevel}
                    </span>
                )}
                {isvExpandido.liquidityNeed && (
                    <span className="text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded-full border border-white/10">
                        Liquidez {isvExpandido.liquidityNeed}
                    </span>
                )}
                {isvExpandido.avoidedGeographies?.map(g => (
                    <span key={g} className="text-xs bg-red-900/40 text-red-300 px-2 py-0.5 rounded-full border border-red-500/20">
                        Evita: {g}
                    </span>
                ))}
                {isvExpandido.subStrategies?.map(s => (
                    <span key={s} className="text-xs bg-emerald-900/30 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {s}
                    </span>
                ))}
            </div>
        </div>
    );
}

