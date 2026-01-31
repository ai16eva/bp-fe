import { BN } from '@coral-xyz/anchor';
import { Transaction } from '@solana/web3.js';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { appQueryKeys } from '@/config/query';
import { connection } from '@/config/solana';
import { usePrivyWallet } from '@/hooks/use-privy-wallet';
import {
  useGovernanceOperations,
  useNFTBalance,
} from '@/hooks/use-solana-contract';
import { useToast } from '@/hooks/use-toast';
import api from '@/libs/api';
import { SolanaTransactionService } from '@/services/solana-transaction.service';
import type { DAOQuestAnswer } from '@/types/schema';

export function useVoteAnswer(quest: DAOQuestAnswer) {
  const { quest_key } = quest;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { publicKey, sendTransaction } = usePrivyWallet();
  const { voteAnswer } = useGovernanceOperations();
  const { nfts, refetch } = useNFTBalance();

  const txService = useMemo(() => new SolanaTransactionService(connection), []);

  const mutation = useMutation({
    mutationKey: ['vote-answer', quest_key],
    mutationFn: async (answerKey: string) => {
      if (!publicKey || !sendTransaction) {
        throw new Error('Wallet not connected');
      }

      const { data: voteDetail } = await api.getVoteDetail(
        quest_key,
        publicKey.toBase58()
      );

      if (
        !voteDetail ||
        !voteDetail.vote_draft_tx ||
        !voteDetail.vote_success_tx
      ) {
        throw new Error('You are not allowed to vote for this quest');
      }

      if (voteDetail.vote_answer_tx) {
        throw new Error("You've already voted for this quest");
      }

      let currentNfts = nfts;
      if (!currentNfts || currentNfts.length === 0) {
        currentNfts = await refetch();
      }
      if (!currentNfts || currentNfts.length === 0) {
        throw new Error("You don't have enough voting power (no NFTs)");
      }

      const questKeyBN = new BN(quest_key);
      const answerKeyBN = new BN(answerKey);

      // DISABLED due to On-chain Error: "AccountDidNotSerialize" (3004).
      /*
      const nftTokenAccounts = currentNfts.map(
        (nft) => new PublicKey(nft.tokenAccount)
      );
      const combinedTx = new Transaction();

      const checkpointTx = await updateVoterCheckpoint(nftTokenAccounts);
      if (checkpointTx) {
        combinedTx.add(...checkpointTx.instructions);
      }
      */
      const combinedTx = new Transaction();

      const voteTx = await voteAnswer(questKeyBN, answerKeyBN);
      if (!voteTx) {
        throw new Error('Failed to create vote transaction');
      }
      combinedTx.add(...voteTx.instructions);

      const preparedTx = await txService.prepareTransactionForPrivy(
        combinedTx,
        publicKey
      );

      const receipt = await sendTransaction({
        connection,
        transaction: preparedTx,
      } as any);

      if (!receipt || !receipt.signature) {
        throw new Error('Transaction failed - no signature received');
      }

      const signature = receipt.signature;

      try {
        await connection.confirmTransaction(signature, 'finalized');
      } catch {
        const status = await connection.getSignatureStatus(signature);
        if (status?.value?.err) {
          throw new Error(
            `Vote transaction failed: ${JSON.stringify(status.value.err)}`
          );
        }
      }

      const txInfo = await connection.getTransaction(signature, {
        commitment: 'finalized',
      });
      if (txInfo?.meta?.err) {
        throw new Error(
          `Vote transaction failed: ${JSON.stringify(txInfo.meta.err)}`
        );
      }

      await api.voteAnswerQuest({
        quest_key,
        voter: publicKey.toBase58(),
        tx: signature,
        answer_key: answerKey,
      });

      return signature;
    },
    onSuccess: () => {
      toast({
        title: 'Vote successful',
        variant: 'success',
      });

      queryClient.invalidateQueries({
        queryKey: [...appQueryKeys.quests.dao, 'answer'].filter(Boolean),
      });
    },
    onError: (error: Error) => {
      console.error('Vote answer error:', error);

      let errorMessage = 'Unable to process your vote. Please try again.';
      const errorMsgLower = error.message.toLowerCase();

      if (errorMsgLower.includes('insufficient voting power')) {
        errorMessage =
          'Please ensure you have delegated your Governance NFTs before this quest was created.';
      } else if (errorMsgLower.includes('already voted')) {
        errorMessage = 'You have already voted for this quest.';
      } else if (errorMsgLower.includes('not allowed')) {
        errorMessage =
          'You are not allowed to vote for this quest. Please vote in draft and success phases first.';
      }

      toast({
        title: 'Vote failed',
        description: errorMessage,
        variant: 'danger',
      });
    },
  });

  return mutation;
}
