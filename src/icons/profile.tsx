import { cn } from '@/utils/cn';
import type { SVGProps } from 'react';

export const ProfileIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(className)}
        {...props}
    >
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
        <path d="M4 20C4 17.2386 6.23858 15 9 15H15C17.7614 15 20 17.2386 20 20V21H4V20Z" stroke="currentColor" strokeWidth="2"/>
    </svg>
);
