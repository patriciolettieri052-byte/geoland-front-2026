'use client';

import { useGeolandStore } from '@/store/useGeolandStore';
import { GlassCard } from '../ui/GlassCard';
import { GlassSlider } from '../ui/GlassSlider';
import { Typography } from '../ui/Typography';
import { fetchRecalculate } from '@/lib/api/geolandService';
import { SensitivityConfig } from '@/lib/mockEngine';
import { Settings2 } from 'lucide-react';

const USE_LIVE = process.env.NEXT_PUBLIC_USE_LIVE_BACKEND === 'true';

interface SensitivitySliderProps {
    config: SensitivityConfig;
}

export function SensitivityPanel({ config }: SensitivitySliderProps) {
    const { sensitivity, updateSensitivity, activeAssetId, setLiveBackendMetrics } = useGeolandStore();

    const handleRecalculate = async () => {
        if (!USE_LIVE || !activeAssetId) return;

        try {
            const data = await fetchRecalculate(activeAssetId, sensitivity);
            setLiveBackendMetrics({
                irr: data.layer1.expectedIrr,
                netMargin: data.layer2.metrics.netMargin,
                baseCapex: data.layer2.metrics.baseCapex
            });
        } catch (error) {
            console.error('Recalculate error:', error);
        }
    };

    return (
        <GlassCard className="p-6 w-80">
            <div className="flex items-center space-x-2 mb-6 border-b border-white/10 pb-4">
                <Settings2 className="text-primary w-5 h-5" />
                <Typography variant="h4">Sensitivity Engine</Typography>
            </div>

            <div className="space-y-8">
                <GlassSlider
                    label="Capex Overrun (€)"
                    min={config.capexRange[0]}
                    max={config.capexRange[1]}
                    step={1000}
                    value={sensitivity.capexOverrun}
                    onChange={(e) => updateSensitivity('capexOverrun', Number(e.target.value))}
                    onMouseUp={handleRecalculate}
                    onTouchEnd={handleRecalculate}
                    formatValue={(v) => `+€${v.toLocaleString()}`}
                />

                <GlassSlider
                    label="Exit Cap Rate (%)"
                    min={config.exitRateRange[0]}
                    max={config.exitRateRange[1]}
                    step={0.1}
                    value={sensitivity.exitCapRate}
                    onChange={(e) => updateSensitivity('exitCapRate', Number(e.target.value))}
                    onMouseUp={handleRecalculate}
                    onTouchEnd={handleRecalculate}
                    formatValue={(v) => `${v.toFixed(1)}%`}
                />

                <GlassSlider
                    label="Time on Market (Months)"
                    min={3}
                    max={24}
                    step={1}
                    value={sensitivity.timeOnMarket}
                    onChange={(e) => updateSensitivity('timeOnMarket', Number(e.target.value))}
                    onMouseUp={handleRecalculate}
                    onTouchEnd={handleRecalculate}
                    formatValue={(v) => `${v}m`}
                />
            </div>
        </GlassCard>
    );
}
