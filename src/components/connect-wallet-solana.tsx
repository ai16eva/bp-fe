'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useQueryClient } from '@tanstack/react-query';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { useAuth } from '@/app/auth-provider';
import { storageKey } from '@/config/query';
import { ROUTES } from '@/config/routes';
import { useMediaQuery } from '@/hooks/use-media-query';
import { usePrivyLogin } from '@/hooks/use-privy-login';
import { usePrivyWallet } from '@/hooks/use-privy-wallet';
import { LogoutIcon, UserIcon } from '@/icons/icons';

import { maskWalletAddress } from '@/utils/wallet';

import { Button } from './ui/button';
import { WalletAddressPopover } from './wallet-address-popover';

export function Account() {
  const { authenticated: _authenticated } = usePrivy();
  const { publicKey: _publicKey, connected: _connected, logout } = usePrivyWallet();
  const { user, address: sessionAddress, setAddress, isLoggingOutRef } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const sm = useMediaQuery('(min-width: 640px)');

  const address = sessionAddress || '';
  const hasSession = !!sessionAddress;
  const isLoggedIn = hasSession;

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      {sm
        ? (
          <>
            {!!address && user?.role?.toUpperCase() !== 'ADMIN' && (
              <Link href={ROUTES.PROFILE}>
                <Button
                  type="button"
                  variant="solid"
                  className="h-10 rounded-full px-6 text-lg font-semibold text-white md:h-11"
                >
                  {maskWalletAddress(address)}
                </Button>
              </Link>
            )}
            {user?.role?.toUpperCase() === 'ADMIN' && !!address && (
              <Link href={ROUTES.ADMIN_PLAY_GAME}>
                <Button
                  type="button"
                  variant="solid"
                  className="h-10 rounded-full px-6 text-lg font-semibold text-white md:h-11"
                >
                  Admin
                </Button>
              </Link>
            )}
          </>
        )
        : (
          <Link href={ROUTES.PROFILE}>
            <Button type="button" size="icon" variant="highlight">
              <UserIcon className="size-9" />
            </Button>
          </Link>
        )}
      {/* Wallet Address Popover - Shows full Solana address with copy button */}
      {!!address && <WalletAddressPopover address={address} />}
      <Button
        type="button"
        onClick={async (e) => {
          e.preventDefault();
          if (isLoggingOutRef) {
            isLoggingOutRef.current = true;
          }
          try {
            setAddress(null);
            if (typeof window !== 'undefined') {
              window.localStorage.removeItem('bpl-selected-wallet');
              window.sessionStorage.removeItem(storageKey.signedMessage);
              window.sessionStorage.removeItem('__creating_signature__');
            }

            try {
              await logout();
            } catch (error) {
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
        }}
        size="icon"
        className="size-6 border-none bg-transparent text-brand hover:bg-transparent sm:size-12"
      >
        <LogoutIcon className="size-6" />
      </Button>
    </div>
  );
}

type WalletOptionsDialogProps = React.ComponentProps<typeof Button>;

export function WalletOptionsDialog({
  children,
  onClick,
  disabled,
  ...rest
}: WalletOptionsDialogProps) {
  const { login } = usePrivyLogin();
  const { ready, authenticated, logout } = usePrivy();
  const [isResettingSession, setIsResettingSession] = React.useState(false);
  const computedDisabled = (disabled ?? !ready) || isResettingSession;

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) {
      return;
    }
    if (authenticated) {
      setIsResettingSession(true);
      try {
        await logout();
      } catch {
        // ignore, still attempt login
      } finally {
        setIsResettingSession(false);
      }
    }
    login();
  };

  return (
    <Button
      type="button"
      {...rest}
      disabled={computedDisabled}
      onClick={handleClick}
    >
      {children ?? 'Connect Wallet'}
    </Button>
  );
}
