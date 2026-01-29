'use client';

import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';
import React, { type ReactNode } from 'react';

import { getRpcEndpoint, getSolanaNetwork } from '@/config/solana';
import { Env } from '@/libs/Env';

interface PrivyProviderWrapperProps {
  children: ReactNode;
}

const PrivyProviderWrapper = ({ children }: PrivyProviderWrapperProps) => {
  const appId = Env.NEXT_PUBLIC_PRIVY_APP_ID;
  const clientId = Env.NEXT_PUBLIC_PRIVY_CLIENT_ID;

  const network = getSolanaNetwork();
  const solanaCluster =
    Env.NEXT_PUBLIC_SOLANA_CLUSTER ||
    (network === 'mainnet-beta'
      ? 'mainnet-beta'
      : network === 'testnet'
        ? 'testnet'
        : 'devnet');
  const solanaRpcUrl = getRpcEndpoint();

  const solanaConnectors = toSolanaWalletConnectors({
    shouldAutoConnect: true,
  });

  const privyClientConfig: any = {
    appearance: {
      showWalletLoginFirst: true,
      walletChainType: 'solana-only',
      walletList: ['phantom', 'metamask'],
    },
    debug: false,
    embeddedWallets: {
      createOnLogin: 'users-without-wallets',
      recoveryMethod: 'privy',
      showWalletUIs: true,
      solana: {
        createOnLogin: 'users-without-wallets',
      },
    },
    externalWallets: {
      solana: {
        connectors: solanaConnectors,
      },
    },
    loginMethods: ['google', 'wallet'],
    solana: {
      cluster: solanaCluster,
      rpcUrl: solanaRpcUrl,
    },
    solanaClusters: [{ name: solanaCluster, rpcUrl: solanaRpcUrl }],
  };

  if (!appId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-red-600">
            Configuration Error
          </h1>
          <p className="text-gray-600">
            NEXT_PUBLIC_PRIVY_APP_ID is not defined in environment variables
          </p>
        </div>
      </div>
    );
  }

  return (
    <PrivyProvider appId={appId} clientId={clientId} config={privyClientConfig}>
      <ReadySignal />
      {children}
    </PrivyProvider>
  );
};

export default PrivyProviderWrapper;

const ReadySignal = () => {
  const { ready } = usePrivy();
  React.useEffect(() => {
    if (ready) {
      try {
        (window as any).__privyReady = true;
        window.dispatchEvent(new CustomEvent('privy:ready'));
      } catch {
        // ignore
      }
    }
  }, [ready]);
  return null;
};
