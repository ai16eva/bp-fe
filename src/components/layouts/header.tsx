'use client';

import { usePrivy } from '@privy-io/react-auth';
import Image from 'next/image';
import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import { useState } from 'react';

import { useAuth } from '@/app/auth-provider';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';
import { usePrivyLogin } from '@/hooks/use-privy-login';

import { CreatorBadge } from '../ui/creator-badge';
import { MobileMenuDrawer } from './mobile-menu-drawer';
import { DesktopAccountDropdown } from './desktop-account-dropdown';

export const Header = () => {
  const segment = useSelectedLayoutSegment();
  const { ready } = usePrivy();
  const { login } = usePrivyLogin();
  const { address: sessionAddress, isCreator } = useAuth();
  const isLoggedIn = !!sessionAddress;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="min-h-[82px] w-full bg-white dark:bg-[#15172C] px-6 py-4 min-[840px]:px-10 xl:px-12 2xl:px-[60px]">
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex min-w-fit items-center gap-10">
            <Link href={ROUTES.HOME} className="shrink-0">
              <Image src="/logo.svg" alt="Boom Play" width={196} height={48} />
            </Link>
            {isCreator && <CreatorBadge />}
            <nav className="hidden items-center gap-2 min-[840px]:flex">
              <Link href={ROUTES.ABOUT_US}>
                <Button
                  variant={
                    segment === ROUTES.ABOUT_US.replace('/', '')
                      ? 'underline'
                      : 'link'
                  }
                  className="font-medium max-[980px]:px-2"
                >
                  AboutUs
                </Button>
              </Link>
              <Link href={ROUTES.QUESTS}>
                <Button
                  variant={
                    segment === ROUTES.QUESTS.replace('/', '')
                      ? 'underline'
                      : 'link'
                  }
                  className="font-medium  max-[980px]:px-2"
                >
                  Quest
                </Button>
              </Link>
              <Link href={ROUTES.RESULTS}>
                <Button
                  variant={
                    segment === ROUTES.RESULTS.replace('/', '')
                      ? 'underline'
                      : 'link'
                  }
                  className="font-medium max-[980px]:px-2"
                >
                  Result
                </Button>
              </Link>
              <Link href={ROUTES.BOARDS}>
                <Button
                  variant={
                    segment === ROUTES.BOARDS.replace('/', '')
                      ? 'underline'
                      : 'link'
                  }
                  className="font-medium max-[980px]:px-2"
                >
                  Boards
                </Button>
              </Link>
              <Link href={ROUTES.DAO}>
                <Button
                  variant={
                    segment === ROUTES.DAO.replace('/', '')
                      ? 'underline'
                      : 'link'
                  }
                  className="font-medium max-[980px]:px-2"
                >
                  Dao
                </Button>
              </Link>
            </nav>
          </div>
          
          <div className="hidden min-[840px]:flex items-center gap-4">
            {isLoggedIn && sessionAddress ? (
              <DesktopAccountDropdown address={sessionAddress} />
            ) : (
              <Button
                onClick={login}
                variant="solid"
                disabled={!ready || isLoggedIn}
                className="h-10 w-20 rounded-xl text-sm min-[840px]:w-[140px] dark:bg-[#0089E9]"
              >
                LOGIN
              </Button>
            )}
          </div>

          <div className="flex min-[840px]:hidden items-center gap-3">
            {isLoggedIn && (
              <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                <Image 
                  src="/assets/images/avatar.png" 
                  alt="Avatar" 
                  width={40} 
                  height={40}
                  className="object-cover"
                />
              </div>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-foreground"
              aria-label="Open menu"
            >
              <svg 
                width="25" 
                height="21" 
                viewBox="0 0 25 21" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="text-black dark:text-white"
              >
                <path 
                  d="M0 1.3125C0 0.601562 0.546875 0 1.3125 0H23.1875C23.8984 0 24.5 0.601562 24.5 1.3125C24.5 2.07812 23.8984 2.625 23.1875 2.625H1.3125C0.546875 2.625 0 2.07812 0 1.3125ZM0 10.0625C0 9.35156 0.546875 8.75 1.3125 8.75H23.1875C23.8984 8.75 24.5 9.35156 24.5 10.0625C24.5 10.8281 23.8984 11.375 23.1875 11.375H1.3125C0.546875 11.375 0 10.8281 0 10.0625ZM24.5 18.8125C24.5 19.5781 23.8984 20.125 23.1875 20.125H1.3125C0.546875 20.125 0 19.5781 0 18.8125C0 18.1016 0.546875 17.5 1.3125 17.5H23.1875C23.8984 17.5 24.5 18.1016 24.5 18.8125Z" 
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <MobileMenuDrawer 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </>
  );
};
