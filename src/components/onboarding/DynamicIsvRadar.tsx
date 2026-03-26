'use client';

import { useGeolandStore } from '@/store/useGeolandStore';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Typography } from '../ui/Typography';

export function DynamicIsvRadar() {
    const { isvV4 } = useGeolandStore();

    const mapValue = (val: string | null, map: Record<string, number>) => (val && map[val] ? map[val] : 10);

    const data = [
        { 
            subject: 'Strategy', 
            A: isvV4.strategy_cluster.length > 0 ? 80 : (isvV4.strategy_intent ? 40 : 10), 
            fullMark: 100 
        },
        { 
            subject: 'Effort', 
            A: mapValue(isvV4.effort_level, { "low": 20, "medium": 60, "high": 100 }), 
            fullMark: 100 
        },
        { 
            subject: 'Budget', 
            A: mapValue(isvV4.budget_range, { "low": 20, "medium": 60, "high": 100 }), 
            fullMark: 100 
        },
        { 
            subject: 'Tradeoff', 
            A: mapValue(isvV4.decision_tradeoff, { "yield": 20, "balanced": 60, "appreciation": 100 }), 
            fullMark: 100 
        },
        { 
            subject: 'Horizon', 
            A: mapValue(isvV4.time_horizon, { "short": 20, "medium": 60, "long": 100 }), 
            fullMark: 100 
        },
    ];

    // Cálculo de confianza agregada (ISV-V4-05)
    const confMap: Record<string, number> = { 'high': 100, 'medium': 60, 'low': 20 };
    const confFields = Object.values(isvV4.confidence_by_field);
    const definedConf = confFields.filter(v => v !== null) as string[];
    const cs = definedConf.length > 0 
        ? definedConf.reduce((acc, val) => acc + (confMap[val] || 0), 0) / definedConf.length
        : 0;

    const isConfident = isvV4.isv_sufficient;

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

            {/* ISV label removed */}

            {/* ── CONFIDENCE BAR ─────────────────── */}
            <div className="w-full px-6 mt-4">
                <div className="flex justify-between text-xs text-white/50 mb-1">
                    <span>Confianza del vector</span>
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

            {/* ── ISV V4 TAGS ──────────────── */}
            <div className="flex flex-wrap gap-1.5 px-6 mt-3 justify-center">
                {isvV4.final_strategy && (
                    <span className="text-xs bg-emerald-900/40 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        🎯 {isvV4.final_strategy}
                    </span>
                )}
                {isvV4.effort_level && (
                    <span className="text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded-full border border-white/10">
                        Esfuerzo: {isvV4.effort_level}
                    </span>
                )}
                {isvV4.budget_range && (
                    <span className="text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded-full border border-white/10">
                        Presupuesto: {isvV4.budget_range}
                    </span>
                )}
                {isvV4.time_horizon && (
                    <span className="text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded-full border border-white/10">
                        Plazo: {isvV4.time_horizon}
                    </span>
                )}
                {isvV4.isv_sufficient && (
                    <span className="text-xs bg-blue-900/40 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/20">
                        ✅ Perfil Completo
                    </span>
                )}
            </div>
        </div>
    );
}

