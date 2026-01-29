'use client';

import { useRouter } from 'next/navigation';
import { useSelectedLayoutSegment } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { usePrivy } from '@privy-io/react-auth';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';

import { useAuth } from '@/app/auth-provider';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';
import { usePrivyLogin } from '@/hooks/use-privy-login';
import { usePrivyWallet } from '@/hooks/use-privy-wallet';
import { storageKey } from '@/config/query';
import { maskWalletAddress } from '@/utils/wallet';
import { cn } from '@/utils/cn';
import { 
  CloseIcon, 
  HomeIcon, 
  InfoIcon, 
  QuestIcon, 
  TrophyIcon, 
  BoardsIcon, 
  DaoIcon,
  CopyIcon,
  ProfileIcon,
  MoonIcon,
  LogoutIcon2
} from '@/icons';

type MobileMenuDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

const navLinks = [
  { href: ROUTES.HOME, label: 'Home', segment: null, Icon: HomeIcon },
  { href: ROUTES.ABOUT_US, label: 'AboutUs', segment: 'about-us', Icon: InfoIcon },
  { href: ROUTES.QUESTS, label: 'Quest', segment: 'quests', Icon: QuestIcon },
  { href: ROUTES.RESULTS, label: 'Result', segment: 'results', Icon: TrophyIcon },
  { href: ROUTES.BOARDS, label: 'Boards', segment: 'boards', Icon: BoardsIcon },
  { href: ROUTES.DAO, label: 'DAO', segment: 'dao', Icon: DaoIcon },
];

export function MobileMenuDrawer({ isOpen, onClose }: MobileMenuDrawerProps) {
  const segment = useSelectedLayoutSegment();
  const { ready } = usePrivy();
  const { login } = usePrivyLogin();
  const { user, address: sessionAddress, setAddress, isLoggingOutRef } = useAuth();
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
  const isLoggedIn = !!sessionAddress;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { logout: privyLogout } = usePrivyWallet();
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="fixed top-0 right-0 h-full w-[280px] bg-background z-50 shadow-xl lg:hidden animate-in slide-in-from-right duration-300">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Menu</h2>
            <button
              onClick={onClose}
              className="p-2"
              aria-label="Close menu"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              <nav className="space-y-1 pb-4 border-b border-border">
                {navLinks.map((link) => {
                  const isActive = link.segment === null 
                    ? !segment 
                    : segment === link.segment;
                  const Icon = link.Icon;
                  
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg font-outfit text-sm font-medium transition-colors",
                        isActive 
                          ? "bg-custom-blue-500/10 text-custom-blue-500" 
                          : "text-foreground hover:bg-gray-100 dark:hover:bg-white/10"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="pb-4 border-b border-border">
                {isLoggedIn ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                        <Image 
                          src="/assets/images/avatar.png" 
                          alt="Avatar" 
                          width={40} 
                          height={40}
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground truncate">
                          {maskWalletAddress(sessionAddress || '', 8, 8)}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(sessionAddress);
                      }}
                      className="w-full justify-center gap-2 border border-gray-300 bg-white text-black hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                    >
                      <CopyIcon className="w-4 h-4" />
                      Copy Address
                    </Button>
                    <Button
                      onClick={() => {
                        onClose();
                        router.push(isAdmin ? ROUTES.ADMIN_PLAY_GAME : ROUTES.PROFILE);
                      }}
                      className="w-full justify-center gap-2 border border-gray-300 bg-white text-black hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                    >
                      <ProfileIcon className="w-4 h-4" />
                      {isAdmin ? 'Admin Page' : 'My Account'}
                    </Button>
                    <Button
                      onClick={async (e) => {
                        e.preventDefault();
                        if (isLoggingOutRef) {
                          isLoggingOutRef.current = true;
                        }
                        
                        onClose();
                        
                        try {
                          setAddress(null);
                          if (typeof window !== 'undefined') {
                            window.localStorage.removeItem('bpl-selected-wallet');
                            window.sessionStorage.removeItem(storageKey.signedMessage);
                            window.sessionStorage.removeItem('__creating_signature__');
                          }

                          try {
                            await privyLogout();
                          } catch (error) {
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
                      }}
                      variant="outline"
                      className="w-full justify-center gap-2 text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <LogoutIcon2 className="w-4 h-4" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      login();
                      onClose();
                    }}
                    variant="solid"
                    disabled={!ready}
                    className="w-full h-10 rounded-full"
                  >
                    Login
                  </Button>
                )}
              </div>

              <button
                onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
                className="flex w-full items-center justify-between py-2 text-sm font-medium"
              >
                <div className="flex items-center gap-3">
                  <MoonIcon className="w-4 h-4" />
                  <span>Dark Mode</span>
                </div>
                <div className={cn(
                  "w-10 h-6 rounded-full relative transition-colors",
                  isDarkMode ? "bg-custom-blue-500" : "bg-gray-300"
                )}>
                  <div className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                    isDarkMode ? "translate-x-5" : "translate-x-1"
                  )} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
