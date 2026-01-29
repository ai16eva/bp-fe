import { BN } from '@coral-xyz/anchor';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { appQueryKeys } from '@/config/query';
import { connection } from '@/config/solana';
import { usePrivyWallet } from '@/hooks/use-privy-wallet';
import { useBPMarketSDK } from '@/hooks/use-solana-contract';
import { useToast } from '@/hooks/use-toast';
import api from '@/libs/api';
import { MarketService } from '@/services/bp-market/claim-reward';
import { SolanaTransactionService } from '@/services/solana-transaction.service';

export const useClaimRewardSolana = () => {
  const { publicKey, sendTransaction } = usePrivyWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const sdk = useBPMarketSDK();

  return useMutation({
    mutationFn: async ({
      marketKey,
      answerKey,
      bettingKey,
    }: {
      marketKey: string;
      answerKey: string;
      bettingKey: string;
    }) => {
      if (!publicKey || !sendTransaction) {
        throw new Error('Wallet not connected');
      }

      if (!sdk) {
        throw new Error('SDK not initialized');
      }

      const marketKeyBN = new BN(marketKey);
      const answerKeyBN = new BN(answerKey);

      const marketService = new MarketService(sdk);
      const transactionService = new SolanaTransactionService(connection);

      const tx = await marketService.claimReward(
        marketKeyBN,
        answerKeyBN,
        publicKey,
      );

      // Prepare transaction for Privy
      const preparedTx = await transactionService.prepareTransactionForPrivy(
        tx,
        publicKey,
      );

      // Send transaction using Privy
      const receipt = await sendTransaction({
        connection,
        transaction: preparedTx,
      });

      if (!receipt || !receipt.signature) {
        throw new Error('Transaction failed - no signature received');
      }

      const signature = receipt.signature;

      await api.claimBettingReward({
        betting_key: bettingKey,
        reward_tx: signature,
      });

      return { signature, success: true };
    },
    onSuccess: (data) => {
      toast({
        title: 'Reward claimed successfully',
        description: `Transaction: ${data.signature.slice(
          0,
          8,
        )}...${data.signature.slice(-8)}`,
        variant: 'success',
      });

      queryClient.invalidateQueries({
        queryKey: [
          ...appQueryKeys.member.bettings,
          publicKey?.toBase58(),
        ].filter(Boolean),
      });
    },
    onError: (error: Error) => {
      console.error('Claim reward error:', error);
      toast({
        title: 'Failed to claim reward',
        description: error.message,
        variant: 'danger',
      });
    },
  });
};
