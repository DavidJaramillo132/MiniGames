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
    'inline-flex min-h-12 items-center justify-center gap-2.5 rounded-[8px] border px-5 py-3 text-sm font-semibold transition duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-65';

  const variantClassName = {
    primary:
      'border-transparent bg-gradient-to-br from-[#534ab7] to-[#6f65db] text-[#f8f8ff] shadow-[0_14px_24px_rgba(83,74,183,0.28)] hover:-translate-y-0.5',
    surface:
      'border-[#2a2a3a] bg-[#1a1a24] text-[#f5f7ff] hover:-translate-y-0.5 hover:border-[#4a4a63]',
    ghost:
      'min-h-0 border-transparent bg-transparent px-0 py-0 text-[#a7a2f0] hover:bg-transparent hover:text-[#c0bcff]',
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
