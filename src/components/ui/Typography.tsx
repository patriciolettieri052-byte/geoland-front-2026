import { cn } from '@/lib/utils';

interface TypographyProps extends React.HTMLAttributes<HTMLHeadingElement | HTMLParagraphElement> {
    variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'label' | 'metric';
    as?: React.ElementType;
}

export function Typography({ variant = 'p', className, as, children, ...props }: TypographyProps) {
    const Component = as || (variant === 'metric' ? 'div' : variant === 'label' ? 'span' : variant);

    const variants = {
        h1: 'text-4xl md:text-5xl lg:text-7xl font-light tracking-tight text-foreground',
        h2: 'text-3xl font-light tracking-tight text-foreground',
        h3: 'text-xl md:text-2xl font-normal tracking-wide text-foreground/90',
        h4: 'text-lg font-medium tracking-wide text-foreground/80',
        p: 'text-sm md:text-base font-light leading-relaxed text-foreground/70',
        label: 'text-xs md:text-sm font-medium tracking-widest uppercase text-foreground/50',
        metric: 'text-6xl md:text-8xl lg:text-[10rem] font-light tracking-tighter text-glow text-primary leading-none',
    };

    return (
        <Component className={cn(variants[variant], className)} {...props}>
            {children}
        </Component>
    );
}
