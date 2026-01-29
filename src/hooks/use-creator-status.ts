import { useQuery } from '@tanstack/react-query';

import api from '@/libs/api';

type CreatorInfo = {
  wallet_address: string;
  name?: string;
  created_at?: string;
};

export const useCreatorStatus = (walletAddress?: string | null) => {
  const { data, isLoading } = useQuery({
    queryKey: ['creator-status', walletAddress],
    queryFn: () => api.getCreatorStatus(walletAddress!),
    enabled: !!walletAddress,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  const isCreator = data?.data?.is_creator ?? false;
  const creatorInfo: CreatorInfo | undefined = data?.data?.creator_info ?? undefined;

  return {
    isCreator,
    creatorInfo,
    isLoading,
  };
};
