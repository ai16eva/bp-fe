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


export function usePrivyWallet() {
  const { authenticated, ready, login, logout: privyLogout, user, connectWallet: privyConnectWallet, linkWallet } = usePrivy();
  const { wallets, activeWallet, disconnectWallet } = useSolanaWallets() as any;
  const { sendTransaction } = useSendTransaction();

  const privyWallet = useMemo(() => {
    if (activeWallet) {
      return activeWallet;
    }
    return getPrivySolanaWallet(wallets);
  }, [activeWallet, wallets]);

  const publicKey = useMemo(() => {
    if (!authenticated || !privyWallet) {
      return null;
    }
    const address = privyWallet.publicKey?.toBase58?.() || privyWallet.address;
    return address ? new PublicKey(address) : null;
  }, [privyWallet, authenticated]);

  const connected = useMemo(() => {
    return (
      authenticated === true && ready === true && !!privyWallet && !!publicKey
    );
  }, [authenticated, ready, privyWallet, publicKey]);

  const signMessage = useCallback(async (message: Uint8Array): Promise<Uint8Array> => {
    if (!privyWallet) {
      throw new Error('Wallet not connected');
    }
    return signMessageWithPrivy(privyWallet, message);
  }, [privyWallet]);

  const signTransaction = useCallback(async (transaction: any): Promise<any> => {
    if (!privyWallet) {
      throw new Error('Wallet not connected');
    }

    if (!privyWallet.signTransaction) {
      throw new Error('This wallet does not support signTransaction');
    }

    return privyWallet.signTransaction(transaction);
  }, [privyWallet]);

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

  const logout = useCallback(async () => {
    if (activeWallet && typeof disconnectWallet === 'function') {
      try {
        await disconnectWallet(activeWallet);
      } catch (e) {
        console.warn('Failed to disconnect external wallet:', e);
      }
    }

    await privyLogout();
  }, [activeWallet, disconnectWallet, privyLogout]);

  return {
    publicKey,
    connected,
    ready,
    authenticated,
    user,
    wallet: privyWallet,
    wallets,

    login,
    logout,
    connectWallet: privyConnectWallet,
    linkWallet,

    signMessage,
    signTransaction,
    sendTransaction: sendTransactionWithAddress,
  };
}
