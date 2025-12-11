import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';
import { useAccessibility } from '@/providers/AccessibilityProvider';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'default' | 'lg' | 'icon';
  loading?: boolean;
  pressed?: boolean;
  iconOnly?: boolean;
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'default',
  className,
  disabled,
  loading,
  pressed,
  iconOnly,
  'aria-label': ariaLabel,
  children,
  ...props
}, ref) => {
  const { isKeyboardUser } = useAccessibility();

  const baseStyles = cn(
    'inline-flex items-center justify-center rounded-md font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    loading && 'cursor-wait opacity-70',
    isKeyboardUser && 'focus:ring-2 focus:ring-offset-2'
  );

  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
    outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'underline-offset-4 hover:underline text-primary',
  };

  const sizes = {
    sm: 'h-9 px-3',
    default: 'h-10 px-4 py-2',
    lg: 'h-11 px-8',
    icon: 'h-10 w-10',
  };

  // Determine the appropriate role based on variant and pressed state
  const role = variant === 'link' ? 'link' : pressed !== undefined ? 'switch' : undefined;

  // Determine aria-label for icon buttons
  const buttonAriaLabel = iconOnly
    ? ariaLabel || (typeof children === 'string' ? children : undefined)
    : ariaLabel;

  return (
    <button
      ref={ref}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      aria-pressed={pressed}
      aria-label={buttonAriaLabel}
      role={role}
      {...props}
    >
      {loading ? (
        <>
          <span className="sr-only">Loading</span>
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </>
      ) : children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;