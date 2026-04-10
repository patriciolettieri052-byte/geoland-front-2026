'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Typography } from '../ui/Typography';

interface TheOracleLoaderProps {
    onComplete: () => void;
}

const LOADING_PHRASES = [
    "Analizando ISV",
    "Buscando activos con mayor potencial",
    "Calculando G-Scores personalizados"
];

const PHRASE_DURATION = 2000; // 2 segundos por frase
const TOTAL_DURATION = 6000; // 6 segundos total

export function TheOracleLoader({ onComplete }: TheOracleLoaderProps) {
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

    useEffect(() => {
        // Rotación de frases cada 2 segundos
        const phraseInterval = setInterval(() => {
            setCurrentPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
        }, PHRASE_DURATION);

        // Completar loader después de 6 segundos
        const timer = setTimeout(() => {
            onComplete();
        }, TOTAL_DURATION);

        return () => {
            clearInterval(phraseInterval);
            clearTimeout(timer);
        };
    }, [onComplete]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center p-8 w-full h-full"
        >
            <div className="relative flex items-center justify-center mb-10">
                <motion.div
                    className="w-16 h-16 rounded-full border-2 border-gray-200 border-t-[#1E3A5F]"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
            </div>

            <div className="h-8 flex items-center justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentPhraseIndex}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Typography variant="p" className="text-[#374151] tracking-[0.2em] font-medium text-xs uppercase opacity-80">
                            {LOADING_PHRASES[currentPhraseIndex]}
                        </Typography>
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
