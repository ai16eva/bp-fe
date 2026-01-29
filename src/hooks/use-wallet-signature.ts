import { useEffect, useRef } from 'react';

import { storageKey } from '@/config/query';
import { usePrivyWallet } from '@/hooks/use-privy-wallet';
import { useSessionStorage } from '@/hooks/use-storage';
import { WalletAuthService } from '@/services/wallet-auth.service';
import type { AuthHeaderRequest } from '@/types/schema';

export function useWalletSignature(autoCreate = false) {
  const { publicKey, signMessage } = usePrivyWallet();
  const [storedValue, setValue] = useSessionStorage<AuthHeaderRequest | null>(
    storageKey.signedMessage,
    null,
  );

  const isCreatingRef = useRef(false);

  useEffect(() => {
    if (!autoCreate) {
      return;
    }

    const walletAddress = publicKey?.toBase58();
    if (!walletAddress || !signMessage) {
      return;
    }

    if (storedValue?.message && storedValue?.signature) {
      return;
    }

    const creatingFlag = sessionStorage.getItem('__creating_signature__');
    if (creatingFlag === walletAddress) {
      return;
    }

    if (isCreatingRef.current) {
      return;
    }

    sessionStorage.setItem('__creating_signature__', walletAddress);
    isCreatingRef.current = true;

    WalletAuthService.createWalletSignature(publicKey!, signMessage)
      .then((result) => {
        setValue({ message: result.message, signature: result.signature });
      })
      .catch((error) => {
        console.error('[useWalletSignature] Failed to create signature:', error);
      })
      .finally(() => {
        isCreatingRef.current = false;
        sessionStorage.removeItem('__creating_signature__');
      });
  }, [storedValue, publicKey, signMessage, setValue, autoCreate]);

  const createSignature = async (): Promise<AuthHeaderRequest | null> => {
    if (storedValue?.message && storedValue?.signature) {
      return storedValue;
    }

    if (isCreatingRef.current) {
      for (let i = 0; i < 50; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        if (storedValue?.message && storedValue?.signature) {
          return storedValue;
        }
        if (!isCreatingRef.current) {
          break;
        }
      }
    }

    if (!publicKey || !signMessage) {
      throw new Error('Wallet not connected or signMessage not available');
    }

    try {
      isCreatingRef.current = true;
      const result = await WalletAuthService.createWalletSignature(publicKey, signMessage);
      const authHeaders = { message: result.message, signature: result.signature };
      setValue(authHeaders);
      return authHeaders;
    } catch (error) {
      console.error('Failed to create wallet signature:', error);
      throw error;
    } finally {
      isCreatingRef.current = false;
    }
  };

  return {
    signature: storedValue,
    createSignature,
    hasSignature: !!storedValue?.message && !!storedValue?.signature,
    isCreating: isCreatingRef.current,
  };
}
