import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label?: string;
  error?: string;
  id?: string;
  name?: string;
  placeholder?: string;
  type?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      id,
      name,
      placeholder,
      type = 'text',
      value,
      defaultValue,
      onChange,
      onBlur,
      disabled = false,
      required = false,
      className = '',
      helperText,
      ...props
    },
    ref
  ) => {
    const inputId = id || name;

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
          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            placeholder={placeholder}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            className={`
              w-full h-11 px-3.5 rounded-lg bg-white text-sm text-slate-900
              placeholder:text-slate-400
              border shadow-[0_1px_0_rgba(15,23,42,0.04)]
              transition-all duration-150 ease-out
              will-change-transform
              focus-visible:outline-none
              disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200
              ${
                error
                  ? 'border-rose-300 bg-rose-50/40 focus-visible:border-rose-400 focus-visible:ring-4 focus-visible:ring-rose-500/10'
                  : 'border-slate-200 hover:border-slate-300 focus-visible:border-slate-400 focus-visible:ring-4 focus-visible:ring-slate-900/5'
              }
              ${className}
            `}
            {...props}
          />
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

Input.displayName = 'Input';
