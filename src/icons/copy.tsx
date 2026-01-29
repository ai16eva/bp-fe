import { cn } from '@/utils/cn';
import type { SVGProps } from 'react';

export const CopyIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(className)}
        {...props}
    >
        <path d="M8 4V16C8 17.1046 8.89543 18 10 18H18C19.1046 18 20 17.1046 20 16V7.24162C20 6.7034 19.7831 6.18789 19.3982 5.81161L16.0832 2.56999C15.7107 2.20548 15.2098 2 14.685 2H10C8.89543 2 8 2.89543 8 4Z" stroke="currentColor" strokeWidth="2"/>
        <path d="M16 18V20C16 21.1046 15.1046 22 14 22H6C4.89543 22 4 21.1046 4 20V9C4 7.89543 4.89543 7 6 7H8" stroke="currentColor" strokeWidth="2"/>
    </svg>
);
