'use client';

import { Asset } from '@/lib/mockEngine';
import { Layer1AssetCard } from './Layer1_AssetCard';
import { motion } from 'framer-motion';

interface Layer1GlassGridProps {
    assets: Asset[];
    onAssetClick: (id: string) => void;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.12 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
    },
};

export function Layer1GlassGrid({ assets, onAssetClick }: Layer1GlassGridProps) {
    return (
        <motion.div
            className="flex flex-col gap-3 w-full max-w-[690px] mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {assets.map((asset, index) => (
                <motion.div key={asset.id} variants={itemVariants} className="w-full">
                    <Layer1AssetCard asset={asset} onClick={onAssetClick} rank={index + 1} />
                </motion.div>
            ))}
        </motion.div>
    );
}
