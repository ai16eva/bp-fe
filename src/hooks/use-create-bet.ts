import { BN } from '@coral-xyz/anchor';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { appQueryKeys } from '@/config/query';
import { connection } from '@/config/solana';
import { usePrivyWallet } from '@/hooks/use-privy-wallet';
import { useBPMarketSDK } from '@/hooks/use-solana-contract';
import api from '@/libs/api';
import { SolanaTransactionService } from '@/services/solana-transaction.service';
import type { CreateBetRequest, QuestDetail } from '@/types/schema';

export const useCreateBet = (quest: QuestDetail | undefined) => {
  const { publicKey, sendTransaction } = usePrivyWallet();
  const queryClient = useQueryClient();
  const sdk = useBPMarketSDK();

  return useMutation({
    mutationKey: [...appQueryKeys.bettings.create],
    mutationFn: async (params: CreateBetRequest) => {
      if (!publicKey || !sendTransaction) {
        throw new Error('Wallet not connected');
      }
      if (!quest) {
        throw new Error('Quest not found');
      }
      if (!sdk) {
        throw new Error('SDK not initialized');
      }

      const response = await api.createBet(params);
      if (response.success === 0 || !response.data?.betting_key) {
        throw new Error(response.error || 'Failed to create bet');
      }

      const marketKey = new BN(params.quest_key);
      const answerKey = new BN(params.answer_key);
      const amount = new BN(Number(params.betting_amount) * 1e9);

      const transaction = await sdk.bet(
        marketKey,
        answerKey,
        amount,
        publicKey,
      );

      const txService = new SolanaTransactionService(connection);

      // Prepare transaction for Privy
      const preparedTx = await txService.prepareTransactionForPrivy(
        transaction,
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

      // Wait for transaction confirmation before calling backend
      const latestBlockhash = await connection.getLatestBlockhash('confirmed');
      await connection.confirmTransaction(
        {
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
        'confirmed',
      );

      await api.confirmBet(response.data.betting_key, signature);

      return { signature, bettingKey: response.data.betting_key };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...appQueryKeys.quest.root, quest?.quest_key].filter(
          Boolean,
        ),
      });
    },
    onError: (error: Error) => {
      console.error(' Failed to place bet:', error);
    },
  });
};
