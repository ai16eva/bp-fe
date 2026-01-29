'use client';

import { Loader2Icon } from 'lucide-react';

import { cn } from '@/utils/cn';

export type ClaimButtonProps = {
  variant: 'claimable' | 'claimed' | 'adjourn' | 'unclaimable';
  disabled?: boolean;
  loading?: boolean;
  onClick: VoidFunction;
};

export const ClaimButton = ({
  variant,
  disabled,
  onClick,
  loading = false,
}: ClaimButtonProps) => {
  return (
    <div className="mr-2 flex items-center justify-center">
      {loading
        ? (
            <Loader2Icon className="size-6 animate-spin text-primary" />
          )
        : (
            <button
              type="button"
              className={cn(
                'inline-flex w-6 h-6 items-center justify-center whitespace-nowrap border rounded-md text-base font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:shadow-none',
                { 'border-foreground-30': variant === 'unclaimable' },
                { 'border-border': variant !== 'unclaimable' },
              )}
              disabled={disabled
              || (variant !== 'claimable' && variant !== 'adjourn')}
              onClick={onClick}
            >
              <span
                className={cn('w-[14px] h-[14px] rounded-[4px]', {
                  'bg-primary': variant === 'claimable',
                  'bg-sup-orange': variant === 'claimed',
                  'bg-foreground-30': variant === 'unclaimable',
                })}
              />
              <span className="sr-only">Reward</span>
            </button>
          )}
    </div>
  );
};
