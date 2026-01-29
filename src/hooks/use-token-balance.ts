import { getAccount, getAssociatedTokenAddress } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';

import { connection } from '@/config/solana';
import { usePrivyWallet } from '@/hooks/use-privy-wallet';

import { useGetTokenInfoSolana } from './use-get-token-info-solana';

export const useTokenBalance = (mintAddress: string | undefined) => {
  const { publicKey } = usePrivyWallet();

  const {
    decimals,
    symbol,
    name,
    isLoading: isLoadingTokenInfo,
  } = useGetTokenInfoSolana(mintAddress || '');

  const balanceQuery = useQuery({
    queryKey: ['tokenBalance', publicKey?.toBase58(), mintAddress],
    enabled: !!publicKey && !!mintAddress && !isLoadingTokenInfo,
    queryFn: async () => {
      if (!publicKey) {
        throw new Error('Wallet not connected');
      }

      if (!mintAddress) {
        throw new Error('Token mint address is required');
      }

      try {
        const mint = new PublicKey(mintAddress);
        const ata = await getAssociatedTokenAddress(mint, publicKey);
        const accountInfo = await getAccount(connection, ata);

        const rawBalance = accountInfo.amount;
        const uiAmount = (Number(rawBalance) / 10 ** decimals).toFixed(decimals);

        return {
          balance: rawBalance,
          decimals,
          uiAmount,
          symbol,
          name,
          ata: ata.toBase58(),
          mint: mintAddress,
        };
      } catch (error: any) {
        if (
          error.name === 'TokenAccountNotFoundError'
          || error.message?.includes('could not find account')
        ) {
          return {
            balance: BigInt(0),
            decimals,
            uiAmount: '0',
            symbol,
            name,
            ata: null,
            mint: mintAddress,
          };
        }
        throw error;
      }
    },
    refetchInterval: 10000,
    staleTime: 5000,
  });

  return {
    balance: balanceQuery.data?.balance,
    decimals: balanceQuery.data?.decimals ?? decimals,
    uiAmount: balanceQuery.data?.uiAmount ?? '0',
    symbol: balanceQuery.data?.symbol ?? symbol,
    name: balanceQuery.data?.name ?? name,
    ata: balanceQuery.data?.ata,
    mint: balanceQuery.data?.mint,
    isLoading: balanceQuery.isLoading || isLoadingTokenInfo,
    isError: balanceQuery.isError,
    error: balanceQuery.error,
    refetch: balanceQuery.refetch,
  };
};
