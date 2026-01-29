'use client';

import type { FC, ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

import WelcomeDialog from '@/components/landing/welcome-dialog';
import { useCreatorStatus } from '@/hooks/use-creator-status';
import { useGetMember } from '@/hooks/use-member';
import { usePrivyWallet } from '@/hooks/use-privy-wallet';
import { useNFTBalance } from '@/hooks/use-solana-contract';
import type { User } from '@/types/schema';

type AuthContextType = {
  user?: User;
  nftBalance: number;
  nftLoading: boolean;
  reloadUser: VoidFunction;
  address?: string | null;
  setAddress: (value: string | null) => void;
  isLoggingOutRef?: React.MutableRefObject<boolean>;
  isCreator: boolean;
  isCreatorLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

const SESSION_KEY = 'bpl-selected-wallet';

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const { publicKey, authenticated, ready, logout } = usePrivyWallet();
  const [mounted, setMounted] = useState(false);
  const isLoggingOutRef = useRef(false);
  const [sessionAddress, setSessionAddress] = useState<string | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    return window.localStorage.getItem(SESSION_KEY);
  });

  const { balance: nftBalance, loading: nftLoading, refetch: refetchNFT } = useNFTBalance(undefined, sessionAddress);

  const currentAddress = publicKey?.toBase58() || null;
  const address = sessionAddress ?? undefined;

  const { data, refetch } = useGetMember(address);
  const { isCreator, isLoading: isCreatorLoading } = useCreatorStatus(sessionAddress);

  const user = data?.data;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isLoggingOutRef.current) {
      return;
    }
    if (authenticated && currentAddress && !sessionAddress) {
      setSessionAddress(currentAddress);
    }
  }, [authenticated, currentAddress, sessionAddress]);

  useEffect(() => {
    if (mounted && ready && publicKey) {
      const timer = setTimeout(() => {
        refetchNFT();
      }, 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [mounted, ready, publicKey]);

  useEffect(() => {
    if (!sessionAddress || publicKey || !ready || !authenticated) {
      return;
    }

    const retryTimer = setTimeout(() => { }, 3000);

    return () => clearTimeout(retryTimer);
  }, [sessionAddress, publicKey, ready, authenticated]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (sessionAddress) {
      window.localStorage.setItem(SESSION_KEY, sessionAddress);
    } else {
      window.localStorage.removeItem(SESSION_KEY);
    }
  }, [sessionAddress]);

  useEffect(() => {
    if (ready && authenticated && publicKey) {
      const timer = setTimeout(() => {
        refetchNFT();
      }, 500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [ready, authenticated, publicKey, refetchNFT]);

  useEffect(() => {
    if (!ready || !authenticated || !publicKey) {
      return;
    }

    const handleVisibilityChange = () => {
      if (!document.hidden && ready && authenticated && publicKey) {
        setTimeout(() => {
          refetchNFT();
        }, 300);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [ready, authenticated, publicKey, refetchNFT]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleSessionExpired = async () => {
      if (isLoggingOutRef.current) {
        return;
      }

      isLoggingOutRef.current = true;

      try {
        setSessionAddress(null);
        window.localStorage.removeItem(SESSION_KEY);

        await logout();
      } catch (error) {
        console.error('[AuthProvider] Error during session expired logout:', error);
      } finally {
        isLoggingOutRef.current = false;
        window.location.href = '/';
      }
    };

    window.addEventListener('session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('session-expired', handleSessionExpired);
    };
  }, [logout, setSessionAddress]);

  if (!mounted) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        nftBalance,
        nftLoading,
        reloadUser: refetch,
        address: sessionAddress,
        setAddress: setSessionAddress,
        isLoggingOutRef,
        isCreator,
        isCreatorLoading,
      }}
    >
      <WelcomeDialog address={sessionAddress ?? currentAddress ?? undefined} />
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
