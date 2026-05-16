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
  const classes = [
    'ui-button',
    `ui-button--${variant}`,
    fullWidth ? 'is-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button {...props} className={classes} disabled={disabled || isLoading}>
      {isLoading && <Spinner />}
      <span>{children}</span>
    </button>
  );
}

export default Button;
