'use client';

import { useGeolandStore } from '@/store/useGeolandStore';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Typography } from '../ui/Typography';
import { translations } from '@/lib/translations';

export function DynamicIsvRadar() {
    const { isvV6, language } = useGeolandStore();
    const t = translations[language];

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
        { subject: t.radar.strategy, A: strategyScore,                                  fullMark: 100 },
        { subject: t.radar.horizon,  A: mapVal(isvV6.time_horizon, HORIZON_MAP),        fullMark: 100 },
        { subject: t.radar.involve,  A: mapVal(isvV6.effort_level, EFFORT_MAP),         fullMark: 100 },
        { subject: t.radar.risk,     A: mapVal(isvV6.decision_tradeoff, TRADEOFF_MAP),  fullMark: 100 },
        { subject: t.radar.budget,   A: budgetScore,                                    fullMark: 100 },
    ];

    const cs = isvV6.confidence_score ?? 0;
    const isConfident = cs >= 60;

    return (
        <div className="relative w-full h-full min-h-[500px] flex flex-col items-center justify-center" style={{ backgroundColor: '#FFFFFF' }}>
          {/* Heatmap glow de fondo — azul marino suave */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,0,0,0.07) 0%, rgba(37,99,235,0.04) 40%, transparent 70%)'
            }}
          />

            {isvV6.user_name && (
                <div className="absolute top-4 text-center w-full z-10">
                    <span className="text-xs tracking-widest uppercase font-medium" style={{ color: '#9CA3AF' }}>
                        {t.radar.userProfile.replace('{{name}}', isvV6.user_name)}
                    </span>
                </div>
            )}

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="w-full h-full max-h-[600px] z-10 pointer-events-none"
            >
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <defs>
                          <radialGradient id="isvGradient" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#000000" stopOpacity="0.8" />
                            <stop offset="50%" stopColor="#2563EB" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.1" />
                          </radialGradient>
                        </defs>
                        <PolarGrid stroke="rgba(0,0,0,0.12)" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: '#6B7280', fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', fontFamily: 'Inter, sans-serif' }}
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
                            stroke="none"
                            fill="url(#isvGradient)"
                            fillOpacity={0.35}
                            animationDuration={800}
                            animationEasing="ease-in-out"
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </motion.div>

            <div className="absolute bottom-12 flex flex-col items-center gap-2 mt-4">
                <div className="w-10 h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                <span className="text-[9px] tracking-[0.35em] font-medium uppercase font-sans" style={{ color: '#9CA3AF' }}>
                    {t.radar.investorVector}
                </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 px-6 mt-3 justify-center">
                {isvV6.main_strategy && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: '#EFF6FF', color: '#000000', border: '1px solid #BFDBFE' }}>
                        {isvV6.main_strategy.replace(/_/g, ' ')}
                    </span>
                )}
                {isvV6.effort_level && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB' }}>
                        {isvV6.effort_level === 'low' ? t.radar.passive : isvV6.effort_level === 'medium' ? t.radar.semiActive : t.radar.active}
                    </span>
                )}
                {isvV6.budget?.currency && isvV6.budget?.amount_max && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB' }}>
                        {isvV6.budget.currency} {isvV6.budget.amount_max.toLocaleString()}
                    </span>
                )}
                {isvV6.time_horizon && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB' }}>
                        {isvV6.time_horizon === 'short' ? t.radar.short : isvV6.time_horizon === 'medium' ? t.radar.medium : t.radar.long}
                    </span>
                )}
                {isvV6.confirmed_by_user && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' }}>
                        {t.radar.confirmed}
                    </span>
                )}
            </div>
        </div>
    );
}

