import { cn } from '@/utils/cn';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted dark:bg-[rgba(255,255,255,0.1)]', className)}
      {...props}
    />
  );
}

export { Skeleton };
