'use client';

import React, { useMemo } from 'react';
import { useGeolandStore } from '@/store/useGeolandStore';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, Tooltip
} from 'recharts';

/**
 * DynamicIsvRadar (V6)
 * Visualiza el Investor Strategy Vector v6 en 6 ejes estratégicos:
 * 1. Compromiso (Effort Level)
 * 2. Horizonte (Time Horizon)
 * 3. Tolerancia (Decision Tradeoff)
 * 4. Escala (Budget)
 * 5. Especialización (Asset Class / Strategy)
 * 6. Estabilidad (AI Confidence/Stability)
 */

const EFFORT_VALS: Record<string, number> = { low: 30, medium: 65, high: 95 };
const HORIZON_VALS: Record<string, number> = { short: 30, medium: 65, long: 95 };
const TRADEOFF_VALS: Record<string, number> = { conservative: 30, balanced: 65, growth_tolerant: 95 };

export function DynamicIsvRadar() {
    const isv = useGeolandStore((state) => state.isvV6);

    const data = useMemo(() => {
        // Normalización de valores para el radar (0-100)
        const budgetVal = isv.budget?.amount_max 
            ? Math.min(100, (isv.budget.amount_max / 1000000) * 100) 
            : 0;
            
        return [
            { subject: 'Compromiso', A: EFFORT_VALS[isv.effort_level ?? ''] ?? 10, fullMark: 100 },
            { subject: 'Horizonte',  A: HORIZON_VALS[isv.time_horizon ?? ''] ?? 10, fullMark: 100 },
            { subject: 'Tolerancia', A: TRADEOFF_VALS[isv.decision_tradeoff ?? ''] ?? 10, fullMark: 100 },
            { subject: 'Escala',     A: budgetVal || 10, fullMark: 100 },
            { subject: 'Estrategia', A: isv.main_strategy ? 90 : (isv.strategy_primary ? 60 : 10), fullMark: 100 },
            { subject: 'Estabilidad',A: isv.stability_score || 10, fullMark: 100 },
        ];
    }, [isv]);

    const tags = useMemo(() => {
        const t = [];
        if (isv.investment_mode === 'performance_driven') t.push('Alta Rentabilidad');
        if (isv.asset_class === 'real_estate') t.push('Inmobiliario');
        if (isv.asset_class === 'farmland') t.push('Agro/Ganadería');
        if (isv.market_mode === 'open_exploration') t.push('Exploración Abierta');
        if (isv.budget?.currency) t.push(isv.budget.currency);
        return t;
    }, [isv]);

    return (
        <div className="w-full flex flex-col items-center bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-2xl overflow-hidden min-h-[400px]">
            <div className="text-center mb-4">
                <h3 className="text-white font-bold text-lg tracking-tight uppercase">
                    Estrategia Vectorizada <span className="text-blue-400">v6</span>
                </h3>
                {isv.user_name && (
                    <p className="text-gray-400 text-sm mt-1">Inversor: <span className="text-white font-medium">{isv.user_name}</span></p>
                )}
            </div>

            <div className="w-full h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis 
                            dataKey="subject" 
                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} 
                        />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                            name="ISV v6"
                            dataKey="A"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fill="#3b82f6"
                            fillOpacity={0.4}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                            itemStyle={{ color: '#60a5fa' }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            {/* Tags dinámicos — Bottom Bar */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
                {tags.map((tag) => (
                    <span 
                        key={tag} 
                        className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[10px] font-bold uppercase rounded-full tracking-wider"
                    >
                        {tag}
                    </span>
                ))}
                {!isv.isv_sufficient && (
                    <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase rounded-full tracking-wider animate-pulse">
                        Perfilando...
                    </span>
                )}
                {isv.isv_sufficient && (
                    <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase rounded-full tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                        Vector Listo
                    </span>
                )}
            </div>

            {/* Confidence Bar */}
            <div className="w-full mt-6 bg-white/5 rounded-full h-1.5 overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-400 transition-all duration-1000 ease-out"
                    style={{ width: `${isv.confidence_score * 100}%` }}
                />
            </div>
            <div className="flex justify-between w-full mt-1 px-1">
                <span className="text-gray-500 text-[9px] uppercase font-bold tracking-tighter">Confianza de la IA</span>
                <span className="text-white text-[9px] font-bold tracking-tighter">{Math.round(isv.confidence_score * 100)}%</span>
            </div>
        </div>
    );
}

