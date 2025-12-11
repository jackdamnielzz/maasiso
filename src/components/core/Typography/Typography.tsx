import React, { ElementType } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const typographyVariants = cva('', {
  variants: {
    variant: {
      h1: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
      h2: 'scroll-m-20 text-3xl font-semibold tracking-tight',
      h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
      h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
      p: 'leading-7 [&:not(:first-child)]:mt-6',
      blockquote: 'mt-6 border-l-2 pl-6 italic',
      list: 'my-6 ml-6 list-disc [&>li]:mt-2',
      lead: 'text-xl text-muted-foreground',
      large: 'text-lg font-semibold',
      small: 'text-sm font-medium leading-none',
      muted: 'text-sm text-muted-foreground',
      srOnly: 'sr-only',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
    emphasis: {
      normal: '',
      strong: 'font-bold',
      em: 'italic',
      mark: 'bg-yellow-200 dark:bg-yellow-800',
    },
  },
  defaultVariants: {
    variant: 'p',
    align: 'left',
    emphasis: 'normal',
  },
});

type VariantType = NonNullable<VariantProps<typeof typographyVariants>['variant']>;

const variantElementMap: Record<VariantType, ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  p: 'p',
  blockquote: 'blockquote',
  list: 'ul',
  lead: 'p',
  large: 'p',
  small: 'p',
  muted: 'p',
  srOnly: 'span',
};

const variantRoleMap: Partial<Record<VariantType, string>> = {
  blockquote: 'blockquote',
  list: 'list',
  lead: 'doc-introduction',
  muted: 'note',
};

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: ElementType;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  lang?: string;
  dir?: 'ltr' | 'rtl';
  visuallyHidden?: boolean;
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ 
    className, 
    variant = 'p', 
    align, 
    emphasis,
    as,
    level,
    lang,
    dir,
    visuallyHidden,
    role: providedRole,
    'aria-label': ariaLabel,
    ...props 
  }, ref) => {
    // Determine the appropriate element type
    let Component: ElementType;
    if (as) {
      Component = as;
    } else if (typeof variant === 'string' && variant.startsWith('h') && level) {
      Component = `h${level}` as ElementType;
    } else {
      const defaultVariant = variant || 'p';
      Component = variantElementMap[defaultVariant as VariantType] || 'p';
    }

    // Determine the appropriate role
    const defaultVariant = variant || 'p';
    const role = providedRole || variantRoleMap[defaultVariant as VariantType];

    // Handle emphasis variants
    if (emphasis === 'strong') {
      Component = 'strong';
    } else if (emphasis === 'em') {
      Component = 'em';
    } else if (emphasis === 'mark') {
      Component = 'mark';
    }

    // Handle visually hidden text
    const isHidden = visuallyHidden || variant === 'srOnly';

    return (
      <Component
        ref={ref}
        className={cn(
          typographyVariants({ 
            variant: isHidden ? 'srOnly' : variant, 
            align, 
            emphasis,
            className 
          })
        )}
        role={role}
        lang={lang}
        dir={dir}
        aria-label={ariaLabel}
        aria-hidden={isHidden ? undefined : props['aria-hidden']}
        {...props}
      />
    );
  }
);

Typography.displayName = 'Typography';

export default Typography;