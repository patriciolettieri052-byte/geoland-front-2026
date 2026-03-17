'use client';

import { useGeolandStore } from '@/store/useGeolandStore';
import { GlassCard } from '../ui/GlassCard';
import { Typography } from '../ui/Typography';
import { TrendingUp, RefreshCw, Layers } from 'lucide-react';
import { AssetMetrics } from '@/lib/mockEngine';

interface Layer2MetricsPanelProps {
    metrics: AssetMetrics;
}

export function Layer2MetricsPanel({ metrics }: Layer2MetricsPanelProps) {
    const { sensitivity, liveBackendMetrics } = useGeolandStore();

    // "Lógica matemática en vivo" as requested in architecture (Zero Latency)
    // Base values adjusted by sliders
    const adjustedCapex = liveBackendMetrics?.baseCapex ?? (metrics.baseCapex + sensitivity.capexOverrun);

    // Simulated IRR hit from Exit Cap Rate (e.g. higher exit cap = lower sale price = lower IRR)
    const capRateImpact = (sensitivity.exitCapRate - 5.0) * -0.05;
    const timeOnMarketImpact = (sensitivity.timeOnMarket - 6) * -0.01; // longer time = lower IRR

    const liveIrr = liveBackendMetrics?.irr ?? Math.max(0.01, metrics.roiTotal + capRateImpact + timeOnMarketImpact);
    const liveMargin = liveBackendMetrics?.netMargin ?? Math.max(0.01, metrics.netMargin - (sensitivity.capexOverrun / 1000000));

    return (
        <GlassCard className="p-6 w-80 space-y-6">
            <div className="flex items-center space-x-2 border-b border-white/10 pb-4">
                <TrendingUp className="text-primary w-5 h-5" />
                <Typography variant="h4">Live Analytics</Typography>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Typography variant="label">Adjusted TIR / IRR</Typography>
                    <div className="flex items-end">
                        <Typography variant="h2" className="text-primary text-glow">
                            {(liveIrr * 100).toFixed(1)}%
                        </Typography>
                    </div>
                </div>

                <div className="space-y-1">
                    <Typography variant="label">Net Margin</Typography>
                    <div className="flex items-end">
                        <Typography variant="h2">
                            {(liveMargin * 100).toFixed(1)}%
                        </Typography>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="flex justify-between items-center text-white/70">
                    <div className="flex items-center space-x-2">
                        <Layers size={14} />
                        <span className="text-sm font-light">Total Capex</span>
                    </div>
                    <span className="font-mono">€{adjustedCapex.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center text-white/70">
                    <div className="flex items-center space-x-2">
                        <RefreshCw size={14} />
                        <span className="text-sm font-light">Hold Period</span>
                    </div>
                    <span className="font-mono">{sensitivity.timeOnMarket} mo</span>
                </div>
            </div>
        </GlassCard>
    );
}
