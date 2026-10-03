import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Spinner from './Spinner';

type ButtonVariant = 'primary' | 'surface' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  isLoading?: boolean;
}

function Button({
  children,
  className = '',
  variant = 'primary',
  fullWidth = false,
  isLoading = false,
  disabled,
  ...props
}: ButtonProps) {
  const baseClassName =
    'inline-flex min-h-12 cursor-pointer items-center justify-center gap-2.5 rounded-[14px] px-5 py-3 text-sm font-bold tracking-[0.02em] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4ff00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080a] disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-40';

  const variantClassName = {
    primary:
      'border border-[#e2ff33] bg-[#d4ff00] text-[#08080a] font-bold shadow-[0_0_20px_rgba(212,255,0,0.35)] hover:bg-[#e2ff33] hover:shadow-[0_0_28px_rgba(212,255,0,0.55)] active:scale-[0.97]',
    surface:
      'border border-white/[0.1] bg-[#17171d] text-[#f4f4f6] hover:border-white/[0.22] hover:bg-[#1f1f27] active:scale-[0.97] shadow-[0_4px_16px_rgba(0,0,0,0.5)]',
    ghost:
      'min-h-0 rounded-lg border border-transparent bg-transparent px-3 py-1.5 text-[#8c8c9a] hover:border-white/[0.1] hover:bg-white/[0.04] hover:text-[#f4f4f6] active:scale-[0.97]',
  }[variant];

  const classes = [
    baseClassName,
    variantClassName,
    fullWidth ? 'w-full' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button {...props} className={classes} disabled={disabled || isLoading}>
      {isLoading && <Spinner />}
      {children}
    </button>
  );
}

export default Button;
