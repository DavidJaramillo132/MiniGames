import type { ReactNode } from 'react';

type BadgeVariant = 'success' | 'warning' | 'primary';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  isStatic?: boolean;
}

function Badge({ children, variant = 'success', isStatic = false }: BadgeProps) {
  const variantClassName = {
    success: 'border-[rgba(134,240,190,0.28)] bg-[rgba(134,240,190,0.1)] text-[#86f0be]',
    warning: 'border-[rgba(255,199,106,0.28)] bg-[rgba(255,199,106,0.1)] text-[#ffc76a]',
    primary: 'border-[rgba(120,230,255,0.28)] bg-[rgba(120,230,255,0.1)] text-[#8ce9ff]',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold tracking-[0.02em] ${variantClassName}`}
    >
      {!isStatic ? <span className="h-2 w-2 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}

export default Badge;
