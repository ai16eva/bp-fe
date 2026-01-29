import { cn } from '@/utils/cn';
import type { SVGProps } from 'react';

export const DotsIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
    <svg
        width="12"
        height="3"
        viewBox="0 0 12 3"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(className)}
        {...props}
    >
        <path
            d="M8.75 1.3125C8.75 0.601563 9.32422 0 10.0625 0C10.7734 0 11.375 0.601563 11.375 1.3125C11.375 2.05078 10.7734 2.625 10.0625 2.625C9.32422 2.625 8.75 2.05078 8.75 1.3125ZM4.375 1.3125C4.375 0.601563 4.94922 0 5.6875 0C6.39844 0 7 0.601563 7 1.3125C7 2.05078 6.39844 2.625 5.6875 2.625C4.94922 2.625 4.375 2.05078 4.375 1.3125ZM2.625 1.3125C2.625 2.05078 2.02344 2.625 1.3125 2.625C0.574219 2.625 0 2.05078 0 1.3125C0 0.601562 0.574219 0 1.3125 0C2.02344 0 2.625 0.601563 2.625 1.3125Z"
            fill="currentColor"
        />
    </svg>
);
