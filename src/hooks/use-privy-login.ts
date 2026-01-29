'use client';

import { useLogin } from '@privy-io/react-auth';
import { useSolanaWallets } from '@privy-io/react-auth/solana';

import { useToast } from '@/hooks/use-toast';
import api from '@/libs/api';
import {
  getPrivySolanaWallet,
  getPrivySolanaWalletType,
} from '@/utils/privy-utils';

export const usePrivyLogin = () => {
  const { toast } = useToast();
  const { wallets } = useSolanaWallets();

  const getReferralCode = (): string | undefined => {
    if (typeof window === 'undefined') {
      return undefined;
    }
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('referral') || undefined;
  };

  const { login } = useLogin({
    onComplete: async () => {
      const privyWallet = getPrivySolanaWallet(wallets);
      const address = privyWallet?.address || privyWallet?.publicKey?.toBase58?.();

      if (address) {
        try {
          const existingUserResponse = await api.getMember(address);

          if (existingUserResponse?.data) {
            // Member already exists
          }
        } catch (error: any) {
          if (error?.message && error.message.includes('Member not found')) {
            const referralCode = getReferralCode();
            const walletType = getPrivySolanaWalletType(privyWallet);

            try {
              await api.createMemberV2(address, walletType, referralCode);
            } catch (createError: any) {
              if (
                createError?.statusCode !== 409
                && createError?.status !== 409
                && !createError?.message?.includes('Wallet address duplicate')
              ) {
                handleError(createError);
              }
            }
          } else {
            handleError(error);
          }
        }
      }
    },
    onError: (error: any) => {
      handleError(error);
    },
  });

  const handleError = (error: any) => {
    const errorMessage = error?.message?.toLowerCase() || '';

    // Ignore user cancellation errors (user closed modal or rejected)
    const isUserCancellation
      = !errorMessage
        || errorMessage.includes('exited_auth_flow')
        || errorMessage.includes('user rejected')
        || errorMessage.includes('user closed')
        || errorMessage.includes('modal closed')
        || errorMessage.includes('user denied')
        || errorMessage.includes('cancelled')
        || errorMessage.includes('canceled')
        || errorMessage.includes('wallet address duplicate');

    if (isUserCancellation) {
      return;
    }

    toast({
      title: 'Oops! Something went wrong',
      description: error?.message,
      variant: 'danger',
    });
  };

  return {
    login,
  };
};
