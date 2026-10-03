import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  actionLabel?: string;
  onActionClick?: () => void;
  helpText?: ReactNode;
}

function Input({
  label,
  value,
  onChange,
  actionLabel,
  onActionClick,
  helpText,
  className,
  ...props
}: InputProps) {
  return (
    <label className="grid gap-2">
      <span className="font-['Rajdhani'] text-xs font-bold uppercase tracking-[0.14em] text-[#8c8c9a]">{label}</span>
      <div
        className={`w-full rounded-[14px] border border-white/[0.1] bg-[#0d0d10] text-[#f4f4f6] transition duration-150 focus-within:border-[#d4ff00] focus-within:shadow-[0_0_16px_rgba(212,255,0,0.22)] ${actionLabel ? 'flex items-center' : ''}`}
      >
        <input
          {...props}
          className={`w-full bg-transparent px-4 py-3.5 text-[#f4f4f6] outline-none placeholder:text-[#8c8c9a]/40 ${className ?? ''}`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        {actionLabel ? (
          <button
            type="button"
            className="h-full border-0 bg-transparent px-4 font-['Rajdhani'] text-xs font-bold uppercase tracking-[0.14em] text-[#d4ff00] transition hover:text-[#e2ff33]"
            onClick={onActionClick}
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
      {helpText ? <span className="text-xs text-[#8c8c9a]">{helpText}</span> : null}
    </label>
  );
}

export default Input;
