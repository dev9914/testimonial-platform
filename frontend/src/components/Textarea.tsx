import { forwardRef, useState } from 'react';
import type { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  label?: string;
  error?: string;
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  helperText?: string;
  rows?: number;
  showCounter?: boolean;
  maxLength?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      id,
      name,
      placeholder,
      value,
      defaultValue,
      onChange,
      onBlur,
      disabled = false,
      required = false,
      className = '',
      helperText,
      rows = 5,
      showCounter = false,
      maxLength,
      ...props
    },
    ref
  ) => {
    const inputId = id || name;
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<string>(
      defaultValue ?? ''
    );
    const currentLength = (isControlled ? value ?? '' : internalValue).length;
    const nearLimit = maxLength ? currentLength > maxLength * 0.92 : false;
    const atLimit = maxLength ? currentLength >= maxLength : false;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!isControlled) {
        setInternalValue(e.target.value);
      }
      onChange?.(e);
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[13px] font-semibold text-slate-800 mb-1.5 tracking-tight"
          >
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative group">
          <textarea
            ref={ref}
            id={inputId}
            name={name}
            placeholder={placeholder}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            rows={rows}
            maxLength={maxLength}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helperText
                ? `${inputId}-helper`
                : undefined
            }
            className={`
              w-full px-3.5 py-3 rounded-lg bg-white text-sm text-slate-900 leading-relaxed
              placeholder:text-slate-400
              border shadow-[0_1px_0_rgba(15,23,42,0.04)]
              transition-all duration-150 ease-out
              focus-visible:outline-none
              resize-y min-h-[120px]
              disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200
              ${showCounter ? 'pb-7' : ''}
              ${
                error
                  ? 'border-rose-300 bg-rose-50/40 focus-visible:border-rose-400 focus-visible:ring-4 focus-visible:ring-rose-500/10'
                  : 'border-slate-200 hover:border-slate-300 focus-visible:border-slate-400 focus-visible:ring-4 focus-visible:ring-slate-900/5'
              }
              ${className}
            `}
            {...props}
          />
          {showCounter && (
            <div className="absolute bottom-1.5 right-3 select-none pointer-events-none">
              <span
                className={`text-[11px] font-medium tabular-nums ${
                  atLimit
                    ? 'text-rose-600'
                    : nearLimit
                    ? 'text-amber-600'
                    : 'text-slate-400'
                }`}
              >
                {currentLength}
                {maxLength ? ` / ${maxLength}` : ''}
              </span>
            </div>
          )}
        </div>
        {error ? (
          <p id={`${inputId}-error`} className="text-[12px] text-rose-600 mt-1.5 font-medium">
            {error}
          </p>
        ) : helperText ? (
          <p id={`${inputId}-helper`} className="text-[12px] text-slate-500 mt-1.5">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
