import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils/cn';
import { useAccessibility } from '@/providers/AccessibilityProvider';

const cardVariants = cva(
  'rounded-lg border bg-card text-card-foreground shadow-sm',
  {
    variants: {
      variant: {
        default: 'bg-background',
        secondary: 'bg-secondary/10',
        outline: 'border-2',
      },
      size: {
        default: 'p-6',
        sm: 'p-4',
        lg: 'p-8',
      },
      hover: {
        default: 'hover:shadow-md transition-shadow duration-200',
        none: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      hover: 'default',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
  interactive?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant, 
    size, 
    hover, 
    asChild = false,
    interactive = false,
    expanded,
    onToggle,
    role: providedRole,
    tabIndex: providedTabIndex,
    onClick,
    onKeyDown,
    'aria-expanded': providedAriaExpanded,
    'aria-controls': providedAriaControls,
    ...props 
  }, ref) => {
    const { isKeyboardUser } = useAccessibility();

    // Determine if the card is expandable
    const isExpandable = expanded !== undefined && onToggle !== undefined;

    // Determine appropriate role
    const role = providedRole || (isExpandable ? 'button' : (interactive ? 'article' : undefined));

    // Handle keyboard interaction for interactive/expandable cards
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (isExpandable || interactive) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle?.();
          onClick?.(e as any);
        }
      }
      onKeyDown?.(e);
    };

    // Handle click for interactive/expandable cards
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (isExpandable) {
        onToggle?.();
      }
      onClick?.(e);
    };

    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({ variant, size, hover, className }),
          (interactive || isExpandable) && isKeyboardUser && 'focus:ring-2 focus:ring-ring focus:ring-offset-2',
          (interactive || isExpandable) && 'cursor-pointer'
        )}
        role={role}
        tabIndex={providedTabIndex ?? ((interactive || isExpandable) ? 0 : undefined)}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-expanded={providedAriaExpanded ?? (isExpandable ? expanded : undefined)}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5', className)}
    {...props}
  />
));

CardHeader.displayName = 'CardHeader';

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, level = 3, ...props }, ref) => {
    const headingProps = {
      ref,
      className: cn('text-2xl font-semibold leading-none tracking-tight', className),
      ...props,
    };

    switch (level) {
      case 1:
        return <h1 {...headingProps} />;
      case 2:
        return <h2 {...headingProps} />;
      case 3:
        return <h3 {...headingProps} />;
      case 4:
        return <h4 {...headingProps} />;
      case 5:
        return <h5 {...headingProps} />;
      case 6:
        return <h6 {...headingProps} />;
      default:
        return <h3 {...headingProps} />;
    }
  }
);

CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));

CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn('pt-0', className)}
    role="region"
    {...props} 
  />
));

CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4', className)}
    {...props}
  />
));

CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
};