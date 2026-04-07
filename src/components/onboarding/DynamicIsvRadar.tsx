'use client';

import { useGeolandStore } from '@/store/useGeolandStore';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Typography } from '../ui/Typography';

export function DynamicIsvRadar() {
    const { isvV6 } = useGeolandStore();

    // Strategy score desde cluster length
    const strategyScore = (() => {
        const n = isvV6.strategy_cluster?.length ?? 0;
        if (n === 0) return 10;
        if (n === 1) return 40;
        if (n === 2) return 65;
        return 90;
    })();

    // Budget score desde amount_max
    const budgetScore = (() => {
        const max = isvV6.budget?.amount_max;
        if (!max) return 10;
        if (max <= 100000)  return 20;
        if (max <= 300000)  return 45;
        if (max <= 1000000) return 70;
        return 95;
    })();

    const HORIZON_MAP:  Record<string, number> = { short: 20, medium: 55, long: 90 };
    const EFFORT_MAP:   Record<string, number> = { low: 10, medium: 50, high: 90 };
    const TRADEOFF_MAP: Record<string, number> = { conservative: 20, balanced: 50, growth_tolerant: 90 };

    const mapVal = (val: string | null, map: Record<string, number>): number =>
        val && map[val] !== undefined ? map[val] : 10;

    const data = [
        { subject: 'Strategy', A: strategyScore,                                  fullMark: 100 },
        { subject: 'Horizon',  A: mapVal(isvV6.time_horizon, HORIZON_MAP),        fullMark: 100 },
        { subject: 'Involve',  A: mapVal(isvV6.effort_level, EFFORT_MAP),         fullMark: 100 },
        { subject: 'Risk',     A: mapVal(isvV6.decision_tradeoff, TRADEOFF_MAP),  fullMark: 100 },
        { subject: 'Budget',   A: budgetScore,                                    fullMark: 100 },
    ];

    const cs = isvV6.confidence_score ?? 0;
    const isConfident = cs >= 60;

    return (
        <div className="relative w-full h-full min-h-[500px] flex flex-col items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)] pointer-events-none" />

            {isvV6.user_name && (
                <div className="absolute top-4 text-center w-full z-10">
                    <Typography variant="label" className="text-white/50 text-xs tracking-widest uppercase">
                        Perfil de {isvV6.user_name}
                    </Typography>
                </div>
            )}

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

            <div className="absolute bottom-10 text-center bg-black/40 backdrop-blur-md border border-white/5 py-0.5 px-2.5 rounded-full">
                <Typography variant="label" className="text-white text-[5.5px] tracking-[0.15em] font-light uppercase">
                    Investor Strategy Vector
                </Typography>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 px-6 mt-3 justify-center">
                {isvV6.main_strategy && (
                    <span className="text-xs bg-emerald-900/30 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {isvV6.main_strategy.replace(/_/g, ' ')}
                    </span>
                )}
                {isvV6.effort_level && (
                    <span className="text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded-full border border-white/10">
                        {isvV6.effort_level === 'low' ? 'Pasivo' : isvV6.effort_level === 'medium' ? 'Semi-activo' : 'Activo'}
                    </span>
                )}
                {isvV6.budget?.currency && isvV6.budget?.amount_max && (
                    <span className="text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded-full border border-white/10">
                        {isvV6.budget.currency} {isvV6.budget.amount_max.toLocaleString()}
                    </span>
                )}
                {isvV6.time_horizon && (
                    <span className="text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded-full border border-white/10">
                        {isvV6.time_horizon === 'short' ? 'Corto plazo' : isvV6.time_horizon === 'medium' ? 'Medio plazo' : 'Largo plazo'}
                    </span>
                )}
                {isvV6.confirmed_by_user && (
                    <span className="text-xs bg-emerald-900/50 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/30">
                        ✓ Perfil confirmado
                    </span>
                )}
            </div>
        </div>
    );
}

