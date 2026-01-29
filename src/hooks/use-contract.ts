import { useEffect, useState } from 'react';

import { useGovernanceSDK } from './use-solana-contract';

export const useGetGovernanceConfig = () => {
  const governance = useGovernanceSDK();
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!governance) {
      return;
    }

    const fetchConfig = async () => {
      setLoading(true);
      try {
        const cfg = await governance.fetchConfig();
        setConfig(cfg);
      } catch (e) {
        console.error('Failed to fetch governance config:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [governance]);

  // Handle both BN and number types
  const getMinVote = () => {
    if (!config?.minTotalVote) {
      return 0;
    }
    if (typeof config.minTotalVote === 'number') {
      return config.minTotalVote;
    }
    if (typeof config.minTotalVote?.toNumber === 'function') {
      return config.minTotalVote.toNumber();
    }
    return Number(config.minTotalVote) || 0;
  };

  const getMaxVote = () => {
    if (!config?.maxTotalVote) {
      return 0;
    }
    if (typeof config.maxTotalVote === 'number') {
      return config.maxTotalVote;
    }
    if (typeof config.maxTotalVote?.toNumber === 'function') {
      return config.maxTotalVote.toNumber();
    }
    return Number(config.maxTotalVote) || 0;
  };

  const getQuestDuration = () => {
    if (!config?.durationHours) {
      return 0;
    }
    if (typeof config.durationHours === 'number') {
      return config.durationHours;
    }
    if (typeof config.durationHours?.toNumber === 'function') {
      return config.durationHours.toNumber();
    }
    return Number(config.durationHours) || 0;
  };

  const getReward = () => {
    if (!config?.constantRewardToken) {
      return 0;
    }
    if (typeof config.constantRewardToken === 'number') {
      return config.constantRewardToken;
    }
    if (typeof config.constantRewardToken?.toNumber === 'function') {
      return config.constantRewardToken.toNumber();
    }
    return Number(config.constantRewardToken) || 0;
  };

  return {
    minVote: getMinVote(),
    maxVote: getMaxVote(),
    questDuration: getQuestDuration(),
    reward: getReward(),
    data: config,
    isLoading: loading,
  };
};

export const useNFTConfig = () => {
  const governance = useGovernanceSDK();
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!governance) {
      return;
    }

    const fetchConfig = async () => {
      setLoading(true);
      try {
        const cfg = await governance.fetchConfig();
        setConfig(cfg);
      } catch (e) {
        console.error('Failed to fetch governance config:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [governance]);

  // Handle both BN and number types
  const getMaxVotableNFT = () => {
    if (!config?.maxVotableNft) {
      return 0;
    }
    if (typeof config.maxVotableNft === 'number') {
      return config.maxVotableNft;
    }
    if (typeof config.maxVotableNft?.toNumber === 'function') {
      return config.maxVotableNft.toNumber();
    }
    return Number(config.maxVotableNft) || 0;
  };

  const getMintRequiredNFT = () => {
    if (!config?.minRequiredNft) {
      return 0;
    }
    if (typeof config.minRequiredNft === 'number') {
      return config.minRequiredNft;
    }
    if (typeof config.minRequiredNft?.toNumber === 'function') {
      return config.minRequiredNft.toNumber();
    }
    return Number(config.minRequiredNft) || 0;
  };

  return {
    maxVotableNFT: getMaxVotableNFT(),
    mintRequiredNFT: getMintRequiredNFT(),
    data: config,
    isLoading: loading,
  };
};

export const useTokenBalance = (_address?: string) => ({
  balance: BigInt(0),
  decimals: 0,
  uiAmount: '0',
  symbol: '',
  data: undefined,
  isLoading: false,
  // Keep API-compatible with old hooks usage
  refetch: () => Promise.resolve({ data: undefined }),
  getQueryKeys: (_tokenAddress?: string) => [],
  queryKey: [],
});

export const useBettingTokenBalance = () => ({
  balance: BigInt(0),
  decimals: 0,
  uiAmount: '0',
  symbol: '',
  data: undefined,
  isLoading: false,
  refetch: () => Promise.resolve({ data: undefined }),
  getQueryKeys: (_tokenAddress?: string) => [],
  queryKey: [],
});

export const usePointTokenBalance = () => ({
  balance: BigInt(0),
  decimals: 0,
  uiAmount: '0',
  symbol: '',
  data: undefined,
  isLoading: false,
  refetch: () => Promise.resolve({ data: undefined }),
  getQueryKeys: (_tokenAddress?: string) => [],
  queryKey: [],
});

export const useGetTokenInfo = (_address?: string) => ({
  decimals: 0,
  symbol: '',
});

export const useNFTBalance = () => ({
  balance: 0,
});

export const useExchangeRatio = (_type?: 'BMP' | 'USDT') => ({
  ratio: 0,
});
