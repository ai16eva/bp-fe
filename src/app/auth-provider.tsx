'use client';

import type { FC, ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

import WelcomeDialog from '@/components/landing/welcome-dialog';
import { useCreatorStatus } from '@/hooks/use-creator-status';
import { useGetMember } from '@/hooks/use-member';
import { usePrivyWallet } from '@/hooks/use-privy-wallet';
import { useNFTBalance } from '@/hooks/use-solana-contract';
import type { User } from '@/types/schema';
import { getActiveSolanaAddress } from '@/utils/privy-utils';

type AuthContextType = {
  user?: User;
  nftBalance: number;
  nftLoading: boolean;
  reloadUser: VoidFunction;
  address?: string | null;
  isLoggingOutRef?: React.MutableRefObject<boolean>;
  isCreator: boolean;
  isCreatorLoading: boolean;
  authenticated: boolean;
  ready: boolean;
  connectWallet: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const {
    publicKey,
    authenticated,
    ready,
    user: privyUser,
    connectWallet
  } = usePrivyWallet();

  const [mounted, setMounted] = useState(false);
  const isLoggingOutRef = useRef(false);

  const address = React.useMemo(() => {
    if (publicKey) return publicKey.toBase58();

    if (authenticated && privyUser) {
      return getActiveSolanaAddress(privyUser) || null;
    }

    return null;
  }, [publicKey, privyUser, authenticated]);

  const {
    balance: nftBalance,
    loading: nftLoading,
    refetch: refetchNFT
  } = useNFTBalance(undefined, address || undefined);

  const { data, refetch } = useGetMember(address || undefined);
  const { isCreator, isLoading: isCreatorLoading } = useCreatorStatus(address || undefined);

  const user = data?.data;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (ready && authenticated && address) {
      refetchNFT();
      refetch();
    }
  }, [ready, authenticated, address, refetchNFT, refetch]);

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
        address,
        isLoggingOutRef,
        isCreator,
        isCreatorLoading,
        authenticated,
        ready,
        connectWallet,
      }}
    >
      <WelcomeDialog address={address || undefined} />
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
