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
      <span className="text-[0.92rem] font-medium tracking-[0.02em] text-[#d4ecff]/74">{label}</span>
      <div
        className={`w-full rounded-[18px] border border-[rgba(141,232,255,0.16)] bg-[rgba(7,18,32,0.82)] text-[#edf6ff] backdrop-blur-md transition duration-200 focus-within:border-[rgba(120,230,255,0.68)] focus-within:shadow-[0_0_0_4px_rgba(120,230,255,0.14)] ${actionLabel ? 'flex items-center' : ''}`}
      >
        <input
          {...props}
          className={`w-full bg-transparent px-4 py-[15px] text-[#edf6ff] outline-none placeholder:text-[#d9e9ff]/28 ${className ?? ''}`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        {actionLabel ? (
          <button
            type="button"
            className="h-full border-0 bg-transparent px-[14px] text-[#c7e8ff]/68 transition hover:text-[#edf6ff]"
            onClick={onActionClick}
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
      {helpText ? <span className="text-[0.86rem] text-[#d4ecff]/62">{helpText}</span> : null}
    </label>
  );
}

export default Input;
