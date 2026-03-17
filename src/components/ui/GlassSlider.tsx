'use client';

import { cn } from '@/lib/utils';
import { Typography } from './Typography';

interface GlassSliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    formatValue?: (val: number) => string;
}

export function GlassSlider({
    label,
    value,
    min,
    max,
    step = 1,
    formatValue = (v) => v.toString(),
    className,
    ...props
}: GlassSliderProps) {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className={cn('flex flex-col space-y-3 w-full', className)}>
            <div className="flex justify-between items-end">
                <Typography variant="label">{label}</Typography>
                <Typography variant="h4" className="text-primary text-glow">
                    {formatValue(value)}
                </Typography>
            </div>

            <div className="relative h-2 w-full rounded-full bg-white/10 backdrop-blur-md">
                <div
                    className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.7)]"
                    style={{ width: `${percentage}%` }}
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    {...props}
                />
                <div
                    className="absolute top-1/2 -mt-2.5 h-5 w-5 rounded-full bg-white border-2 border-primary shadow-lg pointer-events-none transition-transform"
                    style={{ left: `calc(${percentage}% - 10px)` }}
                />
            </div>
        </div>
    );
}
