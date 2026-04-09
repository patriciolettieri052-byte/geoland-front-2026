'use client';

import { AssetMatchItem } from '@/types/geoland';
import { Layer1AssetCard } from './Layer1_AssetCard';
import { motion } from 'framer-motion';

interface Layer1GlassGridProps {
    assets: AssetMatchItem[];
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
            className="flex flex-col gap-3 w-full max-w-[1280px] mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {assets.map((asset, index) => (
                <motion.div 
                    key={asset.id} 
                    variants={itemVariants} 
                    className="w-full cursor-pointer"
                    onClick={() => onAssetClick(asset.id)}
                >
                    {/* onClick passed to card is a no-op since wrapper handles it */}
                    <Layer1AssetCard asset={asset as any} onClick={() => {}} rank={index + 1} />
                </motion.div>
            ))}
        </motion.div>
    );
}
