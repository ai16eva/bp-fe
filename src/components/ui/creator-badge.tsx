import { cn } from '@/utils/cn';

type CreatorBadgeProps = {
  className?: string;
};

export const CreatorBadge = ({ className }: CreatorBadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 px-2.5 py-0.5 text-xs font-semibold text-black shadow-sm',
        className,
      )}
    >
      Creator
    </span>
  );
};
