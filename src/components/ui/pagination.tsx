import * as React from 'react';

import { cn } from '@/utils/cn';

const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn('mx-auto flex w-full justify-center', className)}
    {...props}
  />
);
Pagination.displayName = 'Pagination';

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn('flex flex-row items-center gap-2', className)}
    {...props}
  />
));
PaginationContent.displayName = 'PaginationContent';

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('', className)} {...props} />
));
PaginationItem.displayName = 'PaginationItem';

type PaginationButtonProps = {
  isActive?: boolean;
  disabled?: boolean;
} & React.ComponentProps<'button'>;

const PaginationButton = ({
  className,
  isActive,
  disabled,
  children,
  ...props
}: PaginationButtonProps) => (
  <button
    disabled={disabled}
    className={cn(
      'flex size-10 items-center justify-center rounded font-outfit text-base font-normal transition-colors',
      isActive
        ? 'bg-[#006FBC] text-white dark:bg-[#132030] dark:text-white'
        : 'bg-[#F6F6F6] text-black hover:bg-[#E8E8E8] dark:bg-[#132030]/40 dark:text-white dark:hover:bg-[#132030]/60',
      disabled && 'cursor-not-allowed',
      className,
    )}
    {...props}
  >
    {children}
  </button>
);
PaginationButton.displayName = 'PaginationButton';

const PaginationFirst = ({
  className,
  disabled,
  ...props
}: Omit<PaginationButtonProps, 'children'>) => (
  <PaginationButton
    aria-label="Go to first page"
    disabled={disabled}
    className={cn('text-[#006FBC] dark:text-[#149FFF]', className)}
    {...props}
  >
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 14L7 10L11 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 14L11 10L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </PaginationButton>
);
PaginationFirst.displayName = 'PaginationFirst';

const PaginationLast = ({
  className,
  disabled,
  ...props
}: Omit<PaginationButtonProps, 'children'>) => (
  <PaginationButton
    aria-label="Go to last page"
    disabled={disabled}
    className={cn('text-[#006FBC] dark:text-[#149FFF]', className)}
    {...props}
  >
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 6L13 10L9 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 6L9 10L5 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </PaginationButton>
);
PaginationLast.displayName = 'PaginationLast';

const PaginationPrevious = ({
  className,
  disabled,
  ...props
}: Omit<PaginationButtonProps, 'children'>) => (
  <PaginationButton
    aria-label="Go to previous page"
    disabled={disabled}
    className={cn('text-[#006FBC] dark:text-[#149FFF]', className)}
    {...props}
  >
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 15L7 10L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </PaginationButton>
);
PaginationPrevious.displayName = 'PaginationPrevious';

const PaginationNext = ({
  className,
  disabled,
  ...props
}: Omit<PaginationButtonProps, 'children'>) => (
  <PaginationButton
    aria-label="Go to next page"
    disabled={disabled}
    className={cn('text-[#006FBC] dark:text-[#149FFF]', className)}
    {...props}
  >
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 5L13 10L8 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </PaginationButton>
);
PaginationNext.displayName = 'PaginationNext';

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<'span'>) => (
  <span
    aria-hidden
    className={cn('flex size-8 items-center justify-center font-outfit text-base text-black dark:text-white', className)}
    {...props}
  >
    ...
  </span>
);
PaginationEllipsis.displayName = 'PaginationEllipsis';

type PaginationContainerProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
} & React.ComponentProps<'nav'>;

const PaginationContainer = ({
  currentPage,
  totalPages,
  onPageChange,
  ...rest
}: PaginationContainerProps) => {
  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;

    pages.push(
      <PaginationItem key="first">
        <PaginationFirst
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        />
      </PaginationItem>,
    );
    pages.push(
      <PaginationItem key="previous">
        <PaginationPrevious
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        />
      </PaginationItem>,
    );

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationButton
              onClick={() => onPageChange(i)}
              isActive={i === currentPage}
            >
              {i}
            </PaginationButton>
          </PaginationItem>,
        );
      }
    } else {
      pages.push(
        <PaginationItem key="1">
          <PaginationButton
            onClick={() => onPageChange(1)}
            isActive={1 === currentPage}
          >
            1
          </PaginationButton>
        </PaginationItem>,
      );

      if (currentPage > 3) {
        pages.push(<PaginationEllipsis key="start-ellipsis" />);
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(
            <PaginationItem key={i}>
              <PaginationButton
                onClick={() => onPageChange(i)}
                isActive={i === currentPage}
              >
                {i}
              </PaginationButton>
            </PaginationItem>,
          );
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push(<PaginationEllipsis key="end-ellipsis" />);
      }

      pages.push(
        <PaginationItem key={totalPages}>
          <PaginationButton
            onClick={() => onPageChange(totalPages)}
            isActive={totalPages === currentPage}
          >
            {totalPages}
          </PaginationButton>
        </PaginationItem>,
      );
    }

    pages.push(
      <PaginationItem key="next">
        <PaginationNext
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        />
      </PaginationItem>,
    );
    pages.push(
      <PaginationItem key="last">
        <PaginationLast
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        />
      </PaginationItem>,
    );

    return pages;
  };

  return (
    <Pagination {...rest}>
      <PaginationContent>{renderPagination()}</PaginationContent>
    </Pagination>
  );
};

export {
  Pagination,
  PaginationButton,
  PaginationContainer,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
};
