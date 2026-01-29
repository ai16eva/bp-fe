import type { DefaultError, UseMutationOptions } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';

import { appQueryKeys } from '@/config/query';
import api from '@/libs/api';
import type {
  AddQuestRequest,
  AddQuestResponse,
  BaseResponse,
  DraftQuestRequest,
  VoteQuestBody,
} from '@/types/schema';

export const useFetchQuest = (questId: string) => {
  return useQuery({
    queryKey: [...appQueryKeys.quest.root, questId].filter(Boolean),
    queryFn: () => api.getQuest(questId),
  });
};

export function useAddQuestMutation(
  options?: Pick<
    UseMutationOptions<
      Awaited<BaseResponse<AddQuestResponse>>,
      DefaultError,
      unknown,
      unknown
    >,
    'mutationKey' | 'onMutate' | 'onSuccess' | 'onError' | 'onSettled'
  >,
) {
  const {
    mutationKey = [],
    onMutate,
    onSuccess,
    onError,
    onSettled,
  } = options || {};

  return useMutation({
    mutationKey: [...appQueryKeys.quest.create, ...mutationKey],

    mutationFn: (quest: AddQuestRequest) => {
      return api.addQuest(quest);
    },

    onMutate: (...args) => onMutate?.(...args),
    onSuccess: (...args) => onSuccess?.(...args),
    onError,
    onSettled: (...args) => onSettled?.(...args),
  });
}

export function useDraftQuestMutation(
  options?: Pick<
    UseMutationOptions<
      Awaited<BaseResponse<string>>,
      DefaultError,
      unknown,
      unknown
    >,
    'mutationKey' | 'onMutate' | 'onSuccess' | 'onError' | 'onSettled'
  >,
) {
  const {
    mutationKey = [],
    onMutate,
    onSuccess,
    onError,
    onSettled,
  } = options || {};

  return useMutation({
    mutationKey: [...appQueryKeys.quest.draft, ...mutationKey],

    mutationFn: (params: DraftQuestRequest) => {
      return api.draftQuest(params);
    },

    onMutate: (...args) => onMutate?.(...args),
    onSuccess: (...args) => onSuccess?.(...args),
    onError,
    onSettled: (...args) => onSettled?.(...args),
  });
}

export function useVoteQuest(
  options?: Pick<
    UseMutationOptions<
      Awaited<BaseResponse<AddQuestResponse>>,
      DefaultError,
      unknown,
      unknown
    >,
    'mutationKey' | 'onMutate' | 'onSuccess' | 'onError' | 'onSettled'
  >,
) {
  const {
    mutationKey = [],
    onMutate,
    onSuccess,
    onError,
    onSettled,
  } = options || {};

  return useMutation({
    mutationKey: [...appQueryKeys.quest.vote, ...mutationKey],

    mutationFn: (body: VoteQuestBody) => {
      return api.voteQuest(body);
    },

    onMutate: (...args) => onMutate?.(...args),
    onSuccess: (...args) => onSuccess?.(...args),
    onError,
    onSettled: (...args) => onSettled?.(...args),
  });
}

export const useFetchQuestBettings = (questId: string) => {
  return useQuery({
    queryKey: [...appQueryKeys.quest.bettings, questId].filter(Boolean),
    queryFn: () => api.getQuestBettings(questId),
  });
};
