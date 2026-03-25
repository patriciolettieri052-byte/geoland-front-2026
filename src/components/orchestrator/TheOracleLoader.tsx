'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Typography } from '../ui/Typography';

interface TheOracleLoaderProps {
    onComplete: () => void;
}

export function TheOracleLoader({ onComplete }: TheOracleLoaderProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 4000); // 4 segundos fijos — independiente de Framer Motion

        return () => clearTimeout(timer); // cleanup si se desmonta antes
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center p-8 w-full h-full"
        >
            <div className="relative flex items-center justify-center mb-6">
                <motion.div
                    className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
            </div>

            <motion.div
                className="text-center z-20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Typography variant="p" className="text-white/60 tracking-wider font-light">
                    analizando los activos recomendados para ti
                </Typography>
            </motion.div>
        </motion.div>
    );
}
