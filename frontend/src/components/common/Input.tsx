import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-600 mb-1.5">{label}</label>}
        <div className="relative flex items-center">
          {icon && <div className="absolute left-3.5 text-stone-400 pointer-events-none">{icon}</div>}
          <input
            ref={ref}
            className={`w-full bg-white border border-[#E2DCD5] rounded-2xl px-3.5 py-2.5 text-sm text-[#1C130E] placeholder-stone-400 shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] ${
              icon ? 'pl-10' : ''
            } ${error ? 'border-rose-500 ring-1 ring-rose-500' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
