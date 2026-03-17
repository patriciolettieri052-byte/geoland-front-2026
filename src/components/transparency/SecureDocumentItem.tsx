'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, FileSpreadsheet, Lock, Unlock, Download, FileBox, ShieldAlert } from 'lucide-react';
import { DocumentItem } from '@/lib/mockEngine';
import { GlassCard } from '../ui/GlassCard';
import { Typography } from '../ui/Typography';

interface SecureDocumentItemProps {
    document: DocumentItem;
}

export function SecureDocumentItem({ document }: SecureDocumentItemProps) {
    const [status, setStatus] = useState<'locked' | 'verifying' | 'decrypting' | 'ready'>('locked');
    const [progress, setProgress] = useState(0);

    const handleAccess = () => {
        if (status !== 'locked') return;

        setStatus('verifying');

        // Simular flujo de encriptación institucional
        setTimeout(() => {
            setStatus('decrypting');

            let currentProgress = 0;
            const interval = setInterval(() => {
                currentProgress += Math.random() * 15;
                if (currentProgress >= 100) {
                    currentProgress = 100;
                    clearInterval(interval);
                    setStatus('ready');
                }
                setProgress(currentProgress);
            }, 100);

        }, 800);
    };

    const getIcon = () => {
        switch (document.type) {
            case 'pdf': return <FileText className="text-red-400" size={24} />;
            case 'xls': return <FileSpreadsheet className="text-emerald-400" size={24} />;
            case 'dwg': return <FileBox className="text-blue-400" size={24} />;
            case 'model': return <ShieldAlert className="text-amber-400" size={24} />;
        }
    };

    return (
        <GlassCard
            hoverEffect={status === 'locked' || status === 'ready'}
            className={`p-4 overflow-hidden relative transition-all duration-300 ${status === 'ready' ? 'border-primary/50 bg-primary/5' : 'border-white/10 bg-white/5'}`}
        >
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                        {getIcon()}
                    </div>
                    <div>
                        <Typography variant="p" className="font-medium text-white/90 truncate max-w-[200px] md:max-w-xs block">
                            {document.name}
                        </Typography>
                        <div className="flex items-center space-x-3 mt-1">
                            <Typography variant="label" className="text-white/40 uppercase tracking-wider">{document.type}</Typography>
                            <span className="w-1 h-1 rounded-full bg-white/20" />
                            <Typography variant="label" className="text-white/40">{document.size}</Typography>
                        </div>
                    </div>
                </div>

                <div className="flex items-center">
                    <AnimatePresence mode="wait">
                        {status === 'locked' && (
                            <motion.button
                                key="locked"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={handleAccess}
                                className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors"
                            >
                                <Lock size={14} className="text-white/60" />
                                <span className="text-xs text-white/80 font-medium tracking-wide">REQUEST ACCESS</span>
                            </motion.button>
                        )}

                        {(status === 'verifying' || status === 'decrypting') && (
                            <motion.div
                                key="processing"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex flex-col items-end"
                            >
                                <div className="flex items-center space-x-2 mb-2">
                                    <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    <span className="text-xs text-primary font-mono tracking-widest uppercase">
                                        {status === 'verifying' ? 'Verifying ISV...' : 'Decrypting...'}
                                    </span>
                                </div>
                            </motion.div>
                        )}

                        {status === 'ready' && (
                            <motion.button
                                key="ready"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-3 bg-primary text-black rounded-full hover:bg-primary/80 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                            >
                                <Download size={18} />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Progress Bar Background */}
            {status === 'decrypting' && (
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="absolute bottom-0 left-0 h-1 bg-primary/50"
                />
            )}
        </GlassCard>
    );
}
