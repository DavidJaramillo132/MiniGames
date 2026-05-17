import type { ReactNode } from 'react';

type BadgeVariant = 'success' | 'warning' | 'primary';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  isStatic?: boolean;
}

function Badge({ children, variant = 'success', isStatic = false }: BadgeProps) {
  const variantClassName = {
    success: 'border-[rgba(93,202,165,0.35)] bg-[rgba(93,202,165,0.12)] text-[#5dcaa5]',
    warning: 'border-[rgba(183,115,74,0.35)] bg-[rgba(183,115,74,0.12)] text-[#b7734a]',
    primary: 'border-[rgba(83,74,183,0.35)] bg-[rgba(83,74,183,0.12)] text-[#a8a0ff]',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold ${variantClassName}`}
    >
      {!isStatic ? <span className="h-2 w-2 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}

export default Badge;
