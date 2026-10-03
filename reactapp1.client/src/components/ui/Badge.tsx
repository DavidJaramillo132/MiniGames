import type { ReactNode } from 'react';

type BadgeVariant = 'success' | 'warning' | 'primary';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  isStatic?: boolean;
}

function Badge({ children, variant = 'success', isStatic = false }: BadgeProps) {
  const variantClassName = {
    success: 'border border-[#00f5a0]/35 bg-[#00f5a0]/10 text-[#00f5a0] shadow-[0_0_10px_rgba(0,245,160,0.15)]',
    warning: 'border border-[#ffaa00]/35 bg-[#ffaa00]/10 text-[#ffaa00] shadow-[0_0_10px_rgba(255,170,0,0.15)]',
    primary: 'border border-[#d4ff00]/35 bg-[#d4ff00]/10 text-[#d4ff00] shadow-[0_0_10px_rgba(212,255,0,0.18)]',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-['Rajdhani'] text-xs font-bold uppercase tracking-[0.14em] ${variantClassName}`}
    >
      {!isStatic ? <span className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_6px_currentColor] animate-pulse" /> : null}
      {children}
    </span>
  );
}

export default Badge;
