'use client';

import { cn } from '@/lib/utils';
import { HTMLMotionProps, motion } from 'framer-motion';
import React from 'react';

interface GlassCardProps extends HTMLMotionProps<'div'> {
    hoverEffect?: boolean;
    children?: React.ReactNode;
}

export function GlassCard({ className, hoverEffect = false, children, ...props }: GlassCardProps) {
    return (
        <motion.div
            className={cn(
                'glass-panel rounded-2xl overflow-hidden',
                hoverEffect && 'hover:bg-card/60 transition-colors duration-500 ease-out cursor-pointer',
                className
            )}
            whileHover={hoverEffect ? { scale: 1.02, y: -5 } : undefined}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            {...props}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <div className="relative z-10">{children}</div>
        </motion.div>
    );
}
