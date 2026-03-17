'use client';

import { Asset } from '@/lib/mockEngine';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, Lock } from 'lucide-react';
import { Typography } from '../ui/Typography';
import { SecureDocumentItem } from './SecureDocumentItem';
import { DOCUMENTS_MAP } from '@/lib/documentsMap';

interface Layer3DataRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    asset: Asset;
}

export function Layer3DataRoomModal({ isOpen, onClose, asset }: Layer3DataRoomModalProps) {
    if (!isOpen) return null;

    const docs = DOCUMENTS_MAP[asset.id] ?? [];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8"
            >
                {/* Extreme Blur Backdrop */}
                <div
                    className="absolute inset-0 bg-black/40 backdrop-blur-[40px] z-0"
                    onClick={onClose}
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ y: 50, scale: 0.95, opacity: 0 }}
                    animate={{ y: 0, scale: 1, opacity: 1 }}
                    exit={{ y: 20, scale: 0.95, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="relative z-10 w-full max-w-3xl bg-black/60 border border-white/10 rounded-3xl p-8 overflow-hidden shadow-2xl"
                >
                    {/* Decorative Top Gradient */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                    >
                        <X size={20} className="text-white/60" />
                    </button>

                    <div className="flex items-center space-x-4 mb-8">
                        <div className="p-3 bg-primary/10 rounded-full border border-primary/20">
                            <ShieldCheck className="text-primary" size={28} />
                        </div>
                        <div>
                            <Typography variant="h3" className="text-white/90">Institutional Data Room</Typography>
                            <Typography variant="label" className="text-white/50 tracking-wider">Accessing secure artifacts for: {asset.id}</Typography>
                        </div>
                    </div>

                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
                        {docs.map((doc, index) => (
                            <motion.div
                                key={doc.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <SecureDocumentItem document={doc} />
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                        <Typography variant="label" className="text-white/30 flex items-center space-x-2">
                            <Lock size={12} />
                            <span>END-TO-END ENCRYPTION ACTIVE</span>
                        </Typography>
                        <Typography variant="label" className="text-primary font-mono uppercase">
                            Clearance Level: VIP
                        </Typography>
                    </div>

                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
