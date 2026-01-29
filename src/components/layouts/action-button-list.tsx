'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useFetchCategories } from '@/hooks/use-categories';
import { useQuestsFilters } from '@/hooks/use-fetch-quests';
import { cn } from '@/utils/cn';

const ABOUT_US_SECTIONS = [
  { label: 'About Us', value: 'aboutUsSection' },
  { label: 'BOOM PLAY Service', value: 'serviceSection' },
  { label: 'What is BOOM PLAY', value: 'whatIsBoomPlay' },
];

const TOKEN_FILTERS = [
  { label: 'All Coins', value: 'all' },
  { label: 'BOOM', value: 'BOOM' },
  { label: 'USDC', value: 'USDC' },
  { label: 'USDT', value: 'USDT' },
  { label: 'WSOL', value: 'WSOL' },
] as const;

type ActionButtonListProps = {
  title?: string;
  rightElement?: ReactNode;
};

export const ActionButtonList = ({ rightElement }: ActionButtonListProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { bettingToken, setBettingToken } = useQuestsFilters();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [activeSection, setActiveSection] = useState('aboutUsSection');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeCategory = searchParams.get('category');
  const { data } = useFetchCategories();

  // Get current token label for display
  const currentTokenLabel = TOKEN_FILTERS.find(t => t.value === bettingToken)?.label || 'All Coins';

  const CATEGORIES = [
    { label: 'All', value: 'all', hasDropdown: false },
    { label: 'Soon', value: 'soon', hasDropdown: false },
    ...(data?.data ?? []).map(({ title }) => ({
      label: title,
      value: title.toLowerCase(),
      hasDropdown: false,
    })),
  ];

  const buttons = pathname === '/about-us' ? ABOUT_US_SECTIONS : CATEGORIES;

  // Update dropdown position when opening
  useEffect(() => {
    if (isDropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
  }, [isDropdownOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [isDropdownOpen]);

  // IntersectionObserver for about-us page sections
  useEffect(() => {
    if (pathname !== '/about-us') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    ABOUT_US_SECTIONS.forEach(({ value }) => {
      const element = document.getElementById(value);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [pathname]);

  const handleButtonClick = (value: string) => {
    if (pathname === '/about-us') {
      const sectionElement = document.getElementById(value);
      sectionElement?.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(value);
    } else {
      const encodedValue = encodeURIComponent(value).replace(/%20/g, '+');
      // Preserve the current token filter when changing categories
      const tokenParam = bettingToken !== 'all' ? `&token=${bettingToken}` : '';
      router.push(`/quests?category=${encodedValue}${tokenParam}`);
    }
  };

  const handleTokenFilterClick = (value: string) => {
    setBettingToken(value as 'all' | 'BOOM' | 'USDC' | 'USDT' | 'WSOL');
    setIsDropdownOpen(false);
  };

  if (pathname === '/about-us') {
    return (
      <div className="max-lg:pl-4 mb-4 mt-2 flex w-full justify-start gap-2 overflow-x-auto bg-background py-4 md:justify-center lg:mb-6 lg:gap-4 xl:mb-8">
        {buttons.map(({ label, value }) => {
          const isActive = value === activeSection;

          return (
            <button
              key={label}
              onClick={() => handleButtonClick(value)}
              className={cn(
                'w-auto min-w-[120px] lg:w-[190px] px-6 lg:px-0 h-[44px] rounded-xl text-sm font-semibold transition-colors flex items-center justify-center whitespace-nowrap shrink-0',
                isActive
                  ? 'bg-[#0089E9] text-white border-none hover:bg-[#0089E9]/90'
                  : 'bg-black/10 text-black border-none hover:bg-black/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20'
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="app-container mb-8 flex flex-col gap-5 border-b border-foreground-30 bg-background pb-8 pt-6 dark:border-[#2E2C3D]">
      {/* Category Filter Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto">
        {/* Token Dropdown Button */}
        <button
          ref={buttonRef}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={cn(
            'flex h-8 shrink-0 items-center justify-center gap-[5px] rounded-[10px] px-5 py-1.5 font-outfit text-base font-normal leading-5 transition-colors',
            bettingToken !== 'all'
              ? 'bg-[#006FBC] text-white'
              : 'bg-[#F6F6F6] text-black hover:bg-[#E8E8E8] dark:bg-[rgba(246,246,246,0.1)] dark:text-white dark:hover:bg-[rgba(246,246,246,0.2)]'
          )}
        >
          {currentTokenLabel}
          <svg
            width="12"
            height="7"
            viewBox="0 0 12 7"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn('ml-0.5 transition-transform', isDropdownOpen && 'rotate-180')}
          >
            <path
              d="M1 1L6 6L11 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Dropdown Menu - Rendered via Portal to appear on top of everything */}
        {isDropdownOpen && typeof document !== 'undefined' && createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[9999] min-w-[140px] overflow-hidden rounded-[10px] border border-[rgba(0,111,188,0.16)] bg-white shadow-lg dark:border-[#2E2C3D] dark:bg-[#1A1A2E]"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
            }}
          >
            {TOKEN_FILTERS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => handleTokenFilterClick(value)}
                className={cn(
                  'flex w-full items-center px-4 py-2 text-left font-outfit text-sm font-normal transition-colors',
                  bettingToken === value
                    ? 'bg-[#006FBC] text-white'
                    : 'text-black hover:bg-[#F6F6F6] dark:text-white dark:hover:bg-[rgba(246,246,246,0.1)]'
                )}
              >
                {label}
              </button>
            ))}
          </div>,
          document.body
        )}

        {/* Other Category Buttons */}
        {CATEGORIES.map(({ label, value, hasDropdown }) => {
          const isActive = value === activeCategory || (value === 'all' && !activeCategory);

          return (
            <button
              key={label}
              onClick={() => handleButtonClick(value)}
              className={cn(
                'flex h-8 shrink-0 items-center justify-center gap-[5px] rounded-[10px] px-5 py-1.5 font-outfit text-base font-normal leading-5 transition-colors',
                isActive
                  ? 'bg-[#006FBC] text-white'
                  : 'bg-[#F6F6F6] text-black hover:bg-[#E8E8E8] dark:bg-[rgba(246,246,246,0.1)] dark:text-white dark:hover:bg-[rgba(246,246,246,0.2)]'
              )}
            >
              {label}
              {hasDropdown && (
                <svg
                  width="12"
                  height="7"
                  viewBox="0 0 12 7"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-0.5"
                >
                  <path
                    d="M1 1L6 6L11 1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {/* Right Element (e.g., Create New Prediction button) - Moved below action buttons */}
      {rightElement && (
        <div className="flex items-center justify-end">
          {rightElement}
        </div>
      )}
    </div>
  );
};
