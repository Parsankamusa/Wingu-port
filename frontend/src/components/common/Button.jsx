import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  loadingText = 'Loading...',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold transition-all duration-300 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-primary-600 text-white shadow-sm hover:bg-primary-700',
    secondary: 'bg-secondary-100 text-secondary-800 hover:bg-secondary-200',
    outline: 'bg-transparent border border-secondary-300 hover:bg-secondary-50',
    link: 'bg-transparent text-primary-600 hover:text-primary-700 hover:underline focus:ring-0 shadow-none p-0',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
  };

  const sizeClasses = {
    sm: 'py-1.5 px-3 text-xs',
    md: 'py-2 px-4 text-sm',
    lg: 'py-2.5 px-6 text-base'
  };

  const iconSpacing = {
    sm: 'mr-1.5',
    md: 'mr-2',
    lg: 'mr-2'
  };

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`;

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{loadingText}</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className={iconSpacing[size]}>{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className={`ml-${iconSpacing[size].split('-')[1]}`}>{icon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
