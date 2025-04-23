import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';
import { useAccessibility } from '@/providers/AccessibilityProvider';

const inputVariants = cva(
  'flex w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-input',
        error: 'border-destructive text-destructive',
      },
      size: {
        default: 'h-10',
        sm: 'h-8 px-2 text-xs',
        lg: 'h-12 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  error?: boolean | string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  label?: string;
  helpText?: string;
  required?: boolean;
  hideLabel?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    size, 
    error, 
    startIcon, 
    endIcon, 
    type = 'text',
    label,
    helpText,
    required,
    hideLabel = false,
    id,
    'aria-describedby': ariaDescribedby,
    ...props 
  }, ref) => {
    const { isKeyboardUser } = useAccessibility();
    const inputVariant = error ? 'error' : variant;
    
    // Generate unique IDs if not provided
    const inputId = id || React.useId();
    const errorId = `${inputId}-error`;
    const helpTextId = `${inputId}-help`;

    // Combine describedby IDs
    const describedbyIds = [
      helpText && helpTextId,
      error && typeof error === 'string' && errorId,
      ariaDescribedby,
    ].filter(Boolean).join(' ');

    return (
      <div className="relative">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'mb-2 block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
              hideLabel && 'sr-only'
            )}
          >
            {label}
            {required && (
              <span className="text-destructive" aria-hidden="true">
                {' '}*
              </span>
            )}
          </label>
        )}
        <div className="relative">
          {startIcon && (
            <div 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            >
              {startIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            className={cn(
              inputVariants({ variant: inputVariant, size }),
              startIcon && 'pl-10',
              endIcon && 'pr-10',
              isKeyboardUser && 'focus:ring-2 focus:ring-offset-2',
              className
            )}
            ref={ref}
            aria-invalid={!!error}
            aria-required={required}
            aria-describedby={describedbyIds || undefined}
            {...props}
          />
          {endIcon && (
            <div 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            >
              {endIcon}
            </div>
          )}
        </div>
        {helpText && !error && (
          <p 
            id={helpTextId}
            className="mt-1 text-sm text-muted-foreground"
          >
            {helpText}
          </p>
        )}
        {typeof error === 'string' && (
          <p 
            id={errorId}
            className="mt-1 text-sm text-destructive" 
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;