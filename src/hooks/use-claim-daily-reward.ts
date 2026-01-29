import { useMutation, useQueryClient } from '@tanstack/react-query';

import { appQueryKeys } from '@/config/query';
import { usePrivyWallet } from '@/hooks/use-privy-wallet';
import { useToast } from '@/hooks/use-toast';
import { DailyRewardService } from '@/services/daily-reward.service';

export const useClaimDailyReward = () => {
  const { publicKey, signMessage } = usePrivyWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: claimReward, isPending: isClaiming } = useMutation({
    mutationFn: async () => {
      if (!publicKey || !signMessage) {
        throw new Error('Wallet not connected');
      }

      await DailyRewardService.claimReward(publicKey, signMessage);
    },

    onSuccess: () => {
      toast({
        title: 'Check-in successful!',
        description: 'You received 1 BOOM token',
        variant: 'success',
      });

      queryClient.invalidateQueries({
        queryKey: appQueryKeys.member.getDailyReward,
      });

      queryClient.invalidateQueries({
        queryKey: ['token-balance'],
      });

      queryClient.invalidateQueries({
        queryKey: appQueryKeys.member.getCheckIn,
      });
    },

    onError: (error: Error) => {
      console.error('[Daily Reward] Error:', error);
      toast({
        title: 'Oops! Something went wrong',
        description: error?.message,
        variant: 'danger',
      });
    },
  });

  const handleClaimReward = () => {
    if (!publicKey) {
      toast({
        title: 'Please connect your wallet first',
        variant: 'danger',
      });
      return;
    }

    claimReward();
  };

  return {
    handleClaimReward,
    isClaiming,
  };
};
