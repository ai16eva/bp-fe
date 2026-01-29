'use client';

import * as TogglePrimitive from '@radix-ui/react-toggle';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/utils/cn';

const toggleVariants = cva(
  [
    'inline-flex items-center justify-center rounded-2xl font-medium transition-colors',
    'hover:bg-[#ECECEC] dark:hover:bg-[rgba(255,255,255,0.1)]',
    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black dark:focus-visible:ring-white',
    'disabled:pointer-events-none disabled:opacity-50',
    'data-[state=on]:bg-black data-[state=on]:text-white',
    'dark:data-[state=on]:bg-white dark:data-[state=on]:text-black',
    'dark:text-white',
  ],
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline: 'border border-border bg-transparent dark:border-[#2E2C3D]',
      },
      size: {
        default: 'h-12 px-6 py-3',
        sm: 'h-10 px-6 py-3',
        lg: 'h-4 px-6 py-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
));

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };
