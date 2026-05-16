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
  ...props
}: InputProps) {
  return (
    <label className="field-group">
      <span className="field-label">{label}</span>
      <div className={`input-shell${actionLabel ? ' is-with-action' : ''}`}>
        <input {...props} value={value} onChange={(event) => onChange(event.target.value)} />
        {actionLabel ? (
          <button type="button" className="input-action" onClick={onActionClick}>
            {actionLabel}
          </button>
        ) : null}
      </div>
      {helpText ? <span className="input-help">{helpText}</span> : null}
    </label>
  );
}

export default Input;
