import type { ReactNode } from 'react';

type Base = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  id?: string;
};

function Shell({ label, hint, error, id, children, required }: { label: string; hint?: string; error?: string; id?: string; children: ReactNode; required?: boolean }) {
  return (
    <label htmlFor={id} className="block">
      <span className="field-label">
        {label}
        {required && <span className="ml-1 text-danger">*</span>}
      </span>
      {children}
      {error ? (
        <span className="mt-1.5 block text-xs font-semibold text-danger">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs text-ink-faint">{hint}</span>
      ) : null}
    </label>
  );
}

const invalid = 'border-danger/70 focus:!border-danger focus:!shadow-[0_0_0_4px_rgba(180,77,61,.16)]';

export function TextField({ label, value, onChange, placeholder, hint, error, required, type = 'text', id }: Base & { type?: string }) {
  return (
    <Shell label={label} hint={hint} error={error} id={id} required={required}>
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={`field-input ${error ? invalid : ''}`}
      />
    </Shell>
  );
}

export function SelectField({ label, value, onChange, options, hint, error, required, id }: Base & { options: string[] }) {
  return (
    <Shell label={label} hint={hint} error={error} id={id} required={required}>
      <select
        id={id}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        className={`field-input appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236d847a%22 stroke-width=%222%22%3E%3Cpath d=%22M6 9l6 6 6-6%22/%3E%3C/svg%3E')] bg-[length:16px_16px] bg-[right_14px_center] bg-no-repeat pr-10 ${error ? invalid : ''}`}
      >
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </Shell>
  );
}

export function TextAreaField({ label, value, onChange, placeholder, hint, error, required, rows = 4, id }: Base & { rows?: number }) {
  return (
    <Shell label={label} hint={hint} error={error} id={id} required={required}>
      <textarea
        id={id}
        rows={rows}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={`field-input resize-none ${error ? invalid : ''}`}
      />
    </Shell>
  );
}
