import { cn } from '@/utils/cn';
import type { SVGProps } from 'react';

export const CornerCutoutIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
    <svg
        width="101"
        height="101"
        viewBox="0 0 101 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("dark:text-background", className)}
        {...props}
    >
        <path
            d="M100.056 100.056H0C11.9265 100.056 21.5948 90.388 21.5948 78.4612V43.1897C21.5948 31.2632 31.2632 21.5948 43.1897 21.5948H78.4612C90.388 21.5948 100.056 11.9265 100.056 0V100.056Z"
            fill="currentColor"
        />
    </svg>
);
