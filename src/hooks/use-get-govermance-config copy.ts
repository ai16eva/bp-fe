import { useQuery } from '@tanstack/react-query';

import { useGetTokenInfoSolana } from '@/hooks/use-get-token-info-solana';
import { useGovernanceSDK } from '@/hooks/use-solana-contract';

export const useGetGovernanceConfig = () => {
  const sdk = useGovernanceSDK();

  const { data: configData, ...rest } = useQuery({
    queryKey: ['governance-config'],
    queryFn: async () => {
      if (!sdk) {
        throw new Error('SDK not initialized');
      }

      const config = await sdk.fetchConfig();

      if (!config) {
        throw new Error('Failed to fetch governance config');
      }

      return {
        minVote: config.minTotalVote.toNumber(),
        maxVote: config.maxTotalVote.toNumber(),
        questDuration: config.durationHours.toNumber(),
        reward: config.constantRewardToken.toNumber(),
        baseTokenMint: config.baseTokenMint.toBase58(),
        rawConfig: config,
      };
    },
    enabled: !!sdk,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const { symbol } = useGetTokenInfoSolana(configData?.baseTokenMint ?? '');

  return {
    minVote: configData?.minVote ?? 0,
    maxVote: configData?.maxVote ?? 0,
    questDuration: configData?.questDuration ?? 0,
    reward: configData?.reward ?? 0,
    symbol: symbol ?? 'BOOM',
    data: configData,
    ...rest,
  };
};
