'use client';

import { AssetMatchItem } from '@/types/geoland';
import { Layer1AssetCard } from './Layer1_AssetCard';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useGeolandStore } from '@/store/useGeolandStore';

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
    const { user } = useAuth();
    const setAuthModalOpen = useGeolandStore((state) => state.setAuthModalOpen);
    const setAuthModalView = useGeolandStore((state) => state.setAuthModalView);

    const handleClick = (assetId: string) => {
        // C1-FIX: guard de auth en el Grid — única fuente de verdad para el click
        if (!user) {
            setAuthModalView('register');
            setAuthModalOpen(true);
            return;
        }
        onAssetClick(assetId);
    };

    return (
        <motion.div
            className="flex flex-col gap-3 w-full max-w-[1700px] mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {assets.map((asset, index) => (
                <motion.div 
                    key={asset.id || asset.asset_id || index} 
                    variants={itemVariants} 
                    className="w-full cursor-pointer"
                    onClick={() => handleClick(asset.id || (asset as any).asset_id)}
                >
                    {/* C1-FIX: onClick no-op al Card — el auth guard vive en el Grid */}
                    <Layer1AssetCard asset={asset as any} onClick={() => {}} rank={index + 1} />
                </motion.div>
            ))}
        </motion.div>
    );
}
