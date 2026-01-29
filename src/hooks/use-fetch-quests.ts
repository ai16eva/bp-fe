import { useQuery } from '@tanstack/react-query';
import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryState,
} from 'nuqs';

import { isDocumentVisible, POLLING_CONFIG } from '@/config/polling';
import { appQueryKeys } from '@/config/query';
import api from '@/libs/api';
import type { GetDAOQuestsRequest, GetQuestsParams } from '@/types/schema';

export const useFetchQuests = (params: GetQuestsParams = {}) => {
  return useQuery({
    queryKey: [
      ...appQueryKeys.quests.root,
      params.status,
      params.category,
      params.bettingToken,
      params.page,
      params.size,
    ].filter(Boolean),
    queryFn: () => api.getQuests(params),
    refetchInterval: () => {
      if (!isDocumentVisible()) {
        return false;
      }
      return POLLING_CONFIG.quest.detail;
    },
    refetchIntervalInBackground: false,
  });
};

const BETTING_TOKEN_OPTIONS = ['all', 'BOOM', 'USDC', 'USDT', 'WSOL'] as const;

export const useQuestsFilters = () => {
  const [category, setCategory] = useQueryState(
    'category',
    parseAsString.withDefault('all'),
  );

  const [bettingToken, setBettingToken] = useQueryState(
    'token',
    parseAsStringLiteral(BETTING_TOKEN_OPTIONS).withDefault('all'),
  );

  const [currentPage, setCurrentPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(1),
  );

  return {
    currentPage,
    setCurrentPage,
    category,
    setCategory,
    bettingToken,
    setBettingToken,
  };
};

export const useFetchFeaturedQuests = () => {
  return useQuery({
    queryKey: [...appQueryKeys.quests.featured],
    queryFn: () => api.getFeaturedQuests(),
  });
};

export const useFetchPopularQuests = () => {
  return useQuery({
    queryKey: [...appQueryKeys.quests.popular],
    queryFn: () => api.getPopularQuests(),
  });
};

export const useFilterDAOQuests = () => {
  const filterOptions = ['draft', 'success', 'answer'] as const;

  const [status, setStatus] = useQueryState(
    'status',
    parseAsStringLiteral(filterOptions).withDefault('draft'),
  );

  const [currentPage, setCurrentPage] = useQueryState('page', parseAsInteger);

  return {
    currentPage,
    setCurrentPage,
    status,
    setStatus,
  };
};

export const useFetchDAOQuests = (params: GetDAOQuestsRequest) => {
  return useQuery({
    queryKey: [
      ...appQueryKeys.quests.dao,
      params.status,
      params.page,
      params.size,
    ].filter(Boolean),
    queryFn: () => api.getDAOQuests(params),
    refetchInterval: () => {
      if (!isDocumentVisible()) {
        return false;
      }
      return POLLING_CONFIG.dao.default;
    },
    refetchIntervalInBackground: false,
  });
};
