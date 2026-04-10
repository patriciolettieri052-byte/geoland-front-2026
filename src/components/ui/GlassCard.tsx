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
                'inst-card overflow-hidden relative',
                hoverEffect && 'cursor-pointer transition-shadow duration-200',
                className
            )}
            whileHover={hoverEffect ? { y: -2, boxShadow: '0 4px 16px rgba(0,0,0,0.10)' } : undefined}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            {...props}
        >
            {/* Sin gradiente interno — superficie limpia */}
            <div className="relative z-10">{children}</div>
        </motion.div>
    );
}
