'use client';

import { Asset } from '@/lib/mockEngine';
import { motion, AnimatePresence } from 'framer-motion';
import { Layer2MetricsPanel } from './Layer2_MetricsPanel';
import { SensitivityPanel } from './SensitivitySlider';
import { Typography } from '../ui/Typography';
import { X, ArrowRight } from 'lucide-react';
import { useGeolandStore } from '@/store/useGeolandStore';
import { useEffect, useState } from 'react';
import { Layer3DataRoomModal } from '../transparency/Layer3_DataRoomModal';

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

interface Layer2ImmersionProps {
    asset: Asset;
    onClose: () => void;
}

export function Layer2Immersion({ asset, onClose }: Layer2ImmersionProps) {
    const { updateSensitivity } = useGeolandStore();
    const [isDataRoomOpen, setIsDataRoomOpen] = useState(false);

    // Reset sliders when entering a new asset
    useEffect(() => {
        updateSensitivity('exitCapRate', asset.layer2.sensitivityConfig.exitRateRange[0]);
        updateSensitivity('capexOverrun', 0);
        updateSensitivity('timeOnMarket', 6);
    }, [asset, updateSensitivity]);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="fixed inset-0 z-50 flex flex-col items-center justify-center p-8 bg-black"
            >
                <motion.div
                    className="absolute inset-0 bg-cover bg-center z-0"
                    style={{ backgroundImage: `url(${asset.layer1.backgroundImageUrl})` }}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20 z-10" />

                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 z-50 p-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all group"
                >
                    <X className="text-white/70 group-hover:text-white" size={24} />
                </button>

                <div className="relative z-20 w-full h-full max-w-[1920px] mx-auto flex flex-col">
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="mt-12 max-w-2xl"
                    >
                        <Typography variant="label" className="text-primary mb-2 block tracking-[0.2em]">{asset.strategy}</Typography>
                        <Typography variant="h1" className="mb-4">{asset.location}</Typography>

                        {(asset.strategy === 'FARMLAND' || asset.strategy === 'LIVESTOCK') && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {asset.zona_agroecologica && (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] md:text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">{ZONA_LABELS[asset.zona_agroecologica]}</span>
                                )}
                                {asset.clase_coneat && (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] md:text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]">{CONEAT_LABELS[asset.clase_coneat]}</span>
                                )}
                                {asset.acceso_agua && (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] md:text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]">{AGUA_LABELS[asset.acceso_agua]}</span>
                                )}
                            </div>
                        )}

                        <Typography variant="p" className="text-xl text-white/80 border-l-4 border-primary pl-4 py-1 italic">
                            "{asset.layer1.rationale}"
                        </Typography>
                    </motion.div>

                    {/* Floating Panels Container */}
                    <div className="flex-1 w-full flex items-end justify-between pb-12 mt-auto">
                        <motion.div
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.7, duration: 0.8 }}
                        >
                            <Layer2MetricsPanel metrics={asset.layer2.metrics} />
                        </motion.div>

                        <motion.div
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.9, duration: 0.8 }}
                            className="flex flex-col items-end gap-6"
                        >
                            <SensitivityPanel config={asset.layer2.sensitivityConfig} />

                            <button
                                onClick={() => setIsDataRoomOpen(true)}
                                className="flex items-center space-x-3 bg-primary text-primary-foreground px-8 py-4 rounded-full font-medium hover:bg-primary/90 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.6)]"
                            >
                                <span>View Data Room Artifacts</span>
                                <ArrowRight size={18} />
                            </button>
                        </motion.div>
                    </div>
                </div>

                {/* Layer 3 - Modal Injection */}
                <Layer3DataRoomModal
                    isOpen={isDataRoomOpen}
                    onClose={() => setIsDataRoomOpen(false)}
                    asset={asset}
                />
            </motion.div>
        </AnimatePresence>
    );
}
