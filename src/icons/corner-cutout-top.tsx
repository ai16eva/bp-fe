import { cn } from '@/utils/cn';
import type { SVGProps } from 'react';

export const CornerCutoutTopIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
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
            d="M100.056 0H0C11.9265 0 21.5948 9.66836 21.5948 21.5948V56.8663C21.5948 68.793 31.2632 78.4612 43.1897 78.4612H78.4612C90.388 78.4612 100.056 88.1295 100.056 100.056V0Z"
            fill="currentColor"
        />
    </svg>
);
