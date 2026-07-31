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
    'inline-flex min-h-12 items-center justify-center gap-2.5 rounded-[18px] border px-5 py-3 text-sm font-semibold tracking-[0.01em] transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78e6ff]/50 disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-65';

  const variantClassName = {
    primary:
      'border-[#86d9ff]/30 bg-[linear-gradient(135deg,#71e4ff_0%,#3b82f6_55%,#2646c7_100%)] text-[#02111e] shadow-[0_16px_32px_rgba(59,130,246,0.28)] hover:-translate-y-0.5 hover:shadow-[0_24px_42px_rgba(120,230,255,0.22)]',
    surface:
      'border-[rgba(141,232,255,0.22)] bg-[rgba(7,19,34,0.84)] text-[#edf6ff] backdrop-blur-md hover:-translate-y-0.5 hover:border-[rgba(141,232,255,0.38)] hover:bg-[rgba(10,25,44,0.92)]',
    ghost:
      'min-h-0 rounded-none border-transparent bg-transparent px-0 py-0 text-[#90dcff] hover:bg-transparent hover:text-[#d7f7ff]',
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
