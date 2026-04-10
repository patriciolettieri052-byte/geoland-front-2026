import { cn } from '@/lib/utils';

interface TypographyProps extends React.HTMLAttributes<HTMLHeadingElement | HTMLParagraphElement> {
    variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'label' | 'metric';
    as?: React.ElementType;
}

export function Typography({ variant = 'p', className, as, children, ...props }: TypographyProps) {
    const Component = as || (variant === 'metric' ? 'div' : variant === 'label' ? 'span' : variant);

    const variants = {
        h1: 'text-4xl md:text-5xl lg:text-7xl font-light tracking-tight',
        h2: 'text-3xl font-light tracking-tight',
        h3: 'text-xl md:text-2xl font-normal tracking-wide',
        h4: 'text-lg font-semibold tracking-wide',
        p:  'text-sm md:text-base font-normal leading-relaxed',
        label: 'text-xs md:text-sm font-medium tracking-widest uppercase',
        metric: 'text-6xl md:text-8xl lg:text-[10rem] font-bold tracking-tighter leading-none num',
    };

    // Colores institucionales por variante (overrideable via className)
    const colors = {
        h1: 'text-[#0F1117]',
        h2: 'text-[#0F1117]',
        h3: 'text-[#374151]',
        h4: 'text-[#374151]',
        p:  'text-[#6B7280]',
        label: 'text-[#9CA3AF]',
        metric: 'text-[#1E3A5F]',
    };

    return (
        <Component className={cn(variants[variant], colors[variant], className)} {...props}>
            {children}
        </Component>
    );
}
