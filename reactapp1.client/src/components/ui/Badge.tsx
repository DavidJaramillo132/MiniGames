import type { ReactNode } from 'react';

type BadgeVariant = 'success' | 'warning' | 'primary';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  isStatic?: boolean;
}

function Badge({ children, variant = 'success', isStatic = false }: BadgeProps) {
  const classes = ['ui-badge', `ui-badge--${variant}`, isStatic ? 'is-static' : '']
    .filter(Boolean)
    .join(' ');

  return <span className={classes}>{children}</span>;
}

export default Badge;
