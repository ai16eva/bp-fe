import * as React from 'react';

interface ClockIconProps extends React.SVGProps<SVGSVGElement> {
    size?: number;
}

export const ClockIcon: React.FC<ClockIconProps> = ({
    size = 14,
    className,
    ...props
}) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            {...props}
        >
            <path
                d="M7 0C3.136 0 0 3.136 0 7C0 10.864 3.136 14 7 14C10.864 14 14 10.864 14 7C14 3.136 10.864 0 7 0ZM7 12.6C3.906 12.6 1.4 10.094 1.4 7C1.4 3.906 3.906 1.4 7 1.4C10.094 1.4 12.6 3.906 12.6 7C12.6 10.094 10.094 12.6 7 12.6ZM7.35 3.5H6.3V7.7L9.905 9.905L10.5 8.932L7.35 7.035V3.5Z"
                fill="currentColor"
            />
        </svg>
    );
};

export default ClockIcon;
