import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle =
    'inline-flex items-center justify-center font-bold transition-all duration-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:ring-offset-2 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none disabled:transform-none';

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-[#10B981] to-[#059669] text-white font-extrabold shadow-md shadow-emerald-600/20 hover:brightness-105 active:scale-95',
    secondary:
      'bg-[#F0EAE1] hover:bg-[#E5DDCF] text-[#2C1E18] border border-[#E2DCD5] font-bold',
    outline:
      'border border-[#D4C9BD] text-[#2C1E18] hover:bg-[#F5EFE6] hover:border-[#10B981]/60 font-bold',
    danger:
      'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-md',
    ghost:
      'text-stone-600 hover:bg-[#F5EFE6] hover:text-[#1C130E]',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs font-medium',
    md: 'px-4 py-2 text-sm font-semibold',
    lg: 'px-6 py-3 text-base font-semibold',
  };

  return (
    <button
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4 animate-spin text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
