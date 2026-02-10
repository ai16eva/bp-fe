import { BN } from '@coral-xyz/anchor';
import { Transaction, PublicKey } from '@solana/web3.js';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import type { DAOQuestDraft, VoteDraftOption } from '@/types/schema';

export function useVoteDraft(quest: DAOQuestDraft, maxVote: number) {
  const { quest_key, total_vote } = quest;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { publicKey, sendTransaction } = usePrivyWallet();
  const { voteQuest, fetchVoterCheckpoints, updateVoterCheckpoint } =
    useGovernanceOperations();
  const { nfts, refetch } = useNFTBalance();

  const txService = new SolanaTransactionService(connection);

  const mutation = useMutation({
    mutationKey: ['vote-draft', quest_key],
    mutationFn: async (type: VoteDraftOption) => {
      if (!publicKey || !sendTransaction) {
        throw new Error('Wallet not connected');
      }

      const { data: voteDetail } = await api.getVoteDetail(
        quest_key,
        publicKey.toBase58()
      );

      if (voteDetail?.vote_draft_tx) {
        throw new Error(`You've already voted for this quest`);
      }

      let currentNfts = nfts;
      if (!currentNfts || currentNfts.length === 0) {
        currentNfts = await refetch();
      }
      if (!currentNfts || currentNfts.length === 0) {
        throw new Error("You don't have enough voting power (no NFTs)");
      }

      const votePower = currentNfts.length;
      if (votePower === 0) {
        throw new Error("You don't have enough voting power");
      }

      if (total_vote >= maxVote) {
        throw new Error('This quest has reached the maximum number of votes');
      }

      const remainingVotes = Math.max(0, maxVote - total_vote);
      const effectivePower = Math.min(votePower, remainingVotes);
      if (effectivePower <= 0) {
        throw new Error('This quest has reached the maximum number of votes');
      }

      const questKeyBN = new BN(quest_key);
      const voteChoice = type === 'approve' ? 'approve' : 'reject';

      const combinedTx = new Transaction();
      const nftTokenAccounts = currentNfts.map(
        (nft) => new PublicKey(nft.tokenAccount)
      );



      // Check on-chain checkpoint
      const checkpointAccount = await fetchVoterCheckpoints();
      const onChainCount =
        checkpointAccount?.checkpoints?.[
          checkpointAccount.checkpoints.length - 1
        ]?.nftCount || 0;

      // Update if mismatch
      if (onChainCount !== currentNfts.length) {
        console.log(
          `Checkpoint mismatch: On-chain ${onChainCount} vs Local ${currentNfts.length}. Updating...`
        );
        const checkpointTx = await updateVoterCheckpoint(nftTokenAccounts);
        if (checkpointTx) {
          combinedTx.add(...checkpointTx.instructions);
        }
      }

      const voteTx = await voteQuest(questKeyBN, voteChoice);
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
      });

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

      await api.voteQuest({
        quest_key: quest_key as string,
        voter: publicKey.toBase58(),
        tx: signature,
        power: effectivePower,
        option: type,
      });

      return signature;
    },
    onSuccess: () => {
      toast({
        title: 'Vote successful',
        variant: 'success',
      });

      queryClient.invalidateQueries({
        queryKey: [...appQueryKeys.quests.dao, 'draft'].filter(Boolean),
      });
    },
    onError: (error: Error) => {
      console.error('Vote draft error:', error);

      let errorMessage = 'Unable to process your vote. Please try again.';
      const errorMsgLower = error.message.toLowerCase();

      if (errorMsgLower.includes('insufficient voting power')) {
        errorMessage =
          'Please ensure you have delegated your Governance NFTs before this quest was created.';
      } else if (errorMsgLower.includes('already voted')) {
        errorMessage = 'You have already voted for this quest.';
      } else if (errorMsgLower.includes('maximum number of votes')) {
        errorMessage = 'This quest has reached the maximum number of votes.';
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
