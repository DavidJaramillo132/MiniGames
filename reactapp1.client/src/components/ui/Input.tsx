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
      <span className="text-[0.92rem] text-[#f5f7ff]/68">{label}</span>
      <div
        className={`w-full rounded-[8px] border border-[#2a2a3a] bg-[rgba(15,15,19,0.88)] text-[#f5f7ff] transition duration-200 focus-within:border-[rgba(116,106,235,0.85)] focus-within:shadow-[0_0_0_4px_rgba(83,74,183,0.18)] ${actionLabel ? 'flex items-center' : ''}`}
      >
        <input
          {...props}
          className={`w-full bg-transparent px-4 py-[14px] text-[#f5f7ff] outline-none placeholder:text-white/28 ${className ?? ''}`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        {actionLabel ? (
          <button
            type="button"
            className="h-full border-0 bg-transparent px-[14px] text-[#f5f7ff]/68 transition hover:text-[#f5f7ff]"
            onClick={onActionClick}
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
      {helpText ? <span className="text-[0.86rem] text-[#f5f7ff]/68">{helpText}</span> : null}
    </label>
  );
}

export default Input;
