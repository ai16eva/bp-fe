'use client';

import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/app/auth-provider';
import { storageKey } from '@/config/query';
import { ROUTES } from '@/config/routes';
import { usePrivyWallet } from '@/hooks/use-privy-wallet';
import { useToast } from '@/hooks/use-toast';
import { CopyIcon, ProfileIcon, SunIcon, MoonIcon, LogoutIcon2 } from '@/icons';

interface DesktopAccountDropdownProps {
  address: string;
}

export const DesktopAccountDropdown = ({ address }: DesktopAccountDropdownProps) => {
  const { user, isLoggingOutRef } = useAuth();
  const { logout } = usePrivyWallet();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
  const displayName = isAdmin ? 'Admin' : 'User';
  const isDarkMode = theme === 'dark';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      toast({
        title: 'Address copied!',
        variant: 'success',
      });
    } catch {
      toast({
        title: 'Failed to copy address',
        variant: 'danger',
      });
    }
    setIsOpen(false);
  };

  const handleLogout = async () => {
    if (isLoggingOutRef) {
      isLoggingOutRef.current = true;
    }
    try {
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(storageKey.signedMessage);
        window.sessionStorage.removeItem('__creating_signature__');
      }

      try {
        await logout();
      } catch {
        // External wallets don't support Privy logout - this is expected
      }

      queryClient.clear();
      router.replace(ROUTES.HOME);
      router.refresh();
    } finally {
      if (isLoggingOutRef) {
        setTimeout(() => {
          isLoggingOutRef.current = false;
        }, 1000);
      }
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 items-center gap-4 rounded bg-gray-100 dark:bg-[#13121C] px-4 py-3"
      >
        <div className="flex items-center gap-4">
          <div className="h-6 w-6 overflow-hidden rounded-full">
            <Image
              src="/assets/images/avatar.png"
              alt="Avatar"
              width={24}
              height={24}
              className="object-cover"
            />
          </div>
          <span className="font-outfit text-base font-medium text-gray-900 dark:text-white">
            {displayName}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-lg bg-white dark:bg-[#13121C] py-2 shadow-lg border border-gray-200 dark:border-white/10">
          <button
            onClick={handleCopyAddress}
            className="flex w-full items-center gap-3 px-4 py-3 text-left font-outfit text-sm text-gray-700 dark:text-white transition-colors hover:bg-gray-100 dark:hover:bg-white/10"
          >
            <CopyIcon className="h-4 w-4" />
            Copy Address
          </button>

          <Link
            href={isAdmin ? ROUTES.ADMIN_PLAY_GAME : ROUTES.PROFILE}
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left font-outfit text-sm text-gray-700 dark:text-white transition-colors hover:bg-gray-100 dark:hover:bg-white/10"
          >
            <ProfileIcon className="h-4 w-4" />
            {isAdmin ? 'Admin Page' : 'My Account'}
          </Link>

          <button
            onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
            className="flex w-full items-center gap-3 px-4 py-3 text-left font-outfit text-sm text-gray-700 dark:text-white transition-colors hover:bg-gray-100 dark:hover:bg-white/10"
          >
            {isDarkMode ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>

          <div className="my-1 border-t border-gray-200 dark:border-white/10" />

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-left font-outfit text-sm text-red-500 dark:text-red-400 transition-colors hover:bg-gray-100 dark:hover:bg-white/10"
          >
            <LogoutIcon2 className="h-4 w-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

