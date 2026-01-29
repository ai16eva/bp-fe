'use client';

import { BN } from '@coral-xyz/anchor';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { appQueryKeys } from '@/config/query';
import { connection } from '@/config/solana';
import { usePrivyWallet } from '@/hooks/use-privy-wallet';
import { useToast } from '@/hooks/use-toast';
import api from '@/libs/api';
import { GovernanceService } from '@/services/governance/claim-reward';

import { useGovernanceSDK } from './use-solana-contract';

interface ClaimRewardParams {
  questKey: string | number;
}

export function useClaimReward() {
  const { publicKey, sendTransaction } = usePrivyWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const governanceSDK = useGovernanceSDK();

  const governanceService = useMemo(
    () =>
      governanceSDK ? new GovernanceService(governanceSDK, connection) : null,
    [governanceSDK],
  );

  return useMutation({
    mutationKey: appQueryKeys.member.claimVotingReward,
    mutationFn: async ({ questKey }: ClaimRewardParams) => {
      if (!publicKey || !sendTransaction) {
        throw new Error('Please connect your wallet first');
      }

      if (!governanceService) {
        throw new Error('Governance service not ready');
      }

      const questKeyBN = new BN(questKey);
      const { canClaim, reason } = await governanceService.canClaimReward(
        questKeyBN,
        publicKey,
      );

      if (!canClaim) {
        throw new Error(reason || 'Cannot claim reward');
      }

      const transaction = await governanceService.prepareClaimRewardTransaction(
        questKeyBN,
        publicKey,
      );

      // Prepare transaction for Privy
      const { blockhash } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Send transaction using Privy
      const receipt = await sendTransaction({
        connection,
        transaction,
      });

      if (!receipt || !receipt.signature) {
        throw new Error('Transaction failed - no signature received');
      }

      const signature = receipt.signature;

      try {
        await connection.confirmTransaction(signature, 'confirmed');
      } catch {
        // Continue even if confirmation fails
      }

      if (!signature) {
        throw new Error('Failed to broadcast reward transaction');
      }

      const rewardData = await governanceService.parseRewardFromTransaction(
        signature,
        publicKey,
      );

      if (!rewardData) {
        throw new Error('Failed to parse reward amount');
      }

      const formattedReward = governanceService.formatReward(
        rewardData.rawAmount,
        9,
      );

      await api.claimVoteReward({
        quest_key: questKey.toString(),
        voter: publicKey.toBase58(),
        reward: formattedReward,
      });

      return {
        signature,
        reward: formattedReward,
        voteCount: rewardData.voteCount,
      };
    },

    onSuccess: (data) => {
      toast({
        title: 'Reward claimed successfully',
        description: `You received ${data.reward} tokens`,
        variant: 'success',
      });

      queryClient.invalidateQueries({
        queryKey: [
          ...appQueryKeys.member.votings,
          publicKey?.toBase58(),
        ].filter(Boolean),
      });

      queryClient.invalidateQueries({
        queryKey: ['token-balance'],
      });
    },

    onError: (error: Error) => {
      toast({
        title: 'Failed to claim reward',
        description: error.message,
        variant: 'danger',
      });
    },
  });
}
