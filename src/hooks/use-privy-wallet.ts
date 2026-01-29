'use client';

import { usePrivy } from '@privy-io/react-auth';
import {
  useSendTransaction,
  useSolanaWallets,
} from '@privy-io/react-auth/solana';
import { PublicKey } from '@solana/web3.js';
import { useCallback, useMemo } from 'react';

import {
  getPrivySolanaWallet,
  signMessageWithPrivy,
} from '@/utils/privy-utils';

/**
 * Custom hook that wraps Privy hooks to provide an interface similar to useWallet()
 * This makes migration from wallet-adapter easier
 */
export function usePrivyWallet() {
  const { authenticated, ready, login, logout, user, connectWallet, linkWallet } = usePrivy();
  const { wallets, activeWallet } = useSolanaWallets() as any;
  const { sendTransaction } = useSendTransaction();

  const privyWallet = useMemo(() => {
    if (activeWallet) {
      return activeWallet;
    }
    return getPrivySolanaWallet(wallets);
  }, [activeWallet, wallets]);

  const publicKey = useMemo(() => {
    if (!privyWallet) {
      return null;
    }
    const address = privyWallet.publicKey?.toBase58?.() || privyWallet.address;
    return address ? new PublicKey(address) : null;
  }, [privyWallet]);

  const connected = useMemo(() => {
    // Ensure all values are truthy (not undefined/null/false)
    return (
      authenticated === true && ready === true && !!privyWallet && !!publicKey
    );
  }, [authenticated, ready, privyWallet, publicKey]);

  const signMessage = async (message: Uint8Array): Promise<Uint8Array> => {
    if (!privyWallet) {
      throw new Error('Wallet not connected');
    }
    return signMessageWithPrivy(privyWallet, message);
  };

  const signTransaction = async (transaction: any): Promise<any> => {
    if (!privyWallet) {
      throw new Error('Wallet not connected');
    }

    if (!privyWallet.signTransaction) {
      throw new Error('This wallet does not support signTransaction');
    }

    return privyWallet.signTransaction(transaction);
  };

  const disconnect = async () => {
    await logout();
  };

  const connect = async () => {
    await login();
  };

  const sendTransactionWithAddress = useCallback<typeof sendTransaction>(
    async (input) => {
      const address =
        privyWallet?.publicKey?.toBase58?.() || privyWallet?.address;
      if (!address) {
        throw new Error('Wallet not connected');
      }

      return sendTransaction({
        ...input,
        address,
      });
    },
    [privyWallet, sendTransaction]
  );

  return {
    publicKey,
    connected,
    ready,
    authenticated,
    signMessage,
    signTransaction,
    disconnect,
    connect,
    login,
    logout,
    sendTransaction: sendTransactionWithAddress,
    wallet: privyWallet,
    wallets,
    user,
    connectWallet,
    linkWallet,
  };
}
