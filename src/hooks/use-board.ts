import type { DefaultError, UseMutationOptions } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';

import { appQueryKeys, storageKey } from '@/config/query';
import { useSessionStorage } from '@/hooks/use-storage';
import api from '@/libs/api';
import type {
  AddBoardRequest,
  AuthHeaderRequest,
  BaseResponse,
  DeleteBoardRequest,
  PaginationRequest,
} from '@/types/schema';

export const useFetchBoards = (params: PaginationRequest = {}) => {
  return useQuery({
    queryKey: [
      ...appQueryKeys.board.root,
      params.page,
      params.size,
    ].filter(Boolean),
    queryFn: () => api.getBoards(params),
  });
};

export function useDeleteBoardMutation(
  options?: Pick<
    UseMutationOptions<
      Awaited<BaseResponse<AddBoardRequest>>,
      DefaultError,
      unknown,
      unknown
    >,
    'mutationKey' | 'onMutate' | 'onSuccess' | 'onError'
  >,
) {
  const {
    mutationKey = [],
    onSuccess,
    onError,
  } = options || {};

  const [value] = useSessionStorage<AuthHeaderRequest>(
    storageKey.signedMessage,
    { message: '', signature: '' },
  );

  return useMutation({
    mutationKey: [...appQueryKeys.board.delete, ...mutationKey],

    mutationFn: (board: DeleteBoardRequest) => {
      return api.deleteBoard(board.board_id, value);
    },

    onSuccess: async (...args) => {
      await onSuccess?.(...args);
    },

    onError,
  });
}

export function useAddBoardMutation(
  options?: Pick<
    UseMutationOptions<
      Awaited<BaseResponse<AddBoardRequest>>,
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
    mutationKey: [...appQueryKeys.board.create, ...mutationKey],

    mutationFn: (board: AddBoardRequest) => {
      return api.addBoard(board);
    },

    onMutate: async (...args) => {
      return onMutate?.(...args);
    },

    onSuccess: async (...args) => {
      await onSuccess?.(...args);
    },

    onError,

    onSettled: async (...args) => {
      await onSettled?.(...args);
    },
  });
}

export type UpdateBoardRequest = {
  board_id: number;
  board_title?: string;
  board_description?: string;
};

export function useUpdateBoardMutation(
  options?: Pick<
    UseMutationOptions<
      Awaited<BaseResponse<any>>,
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

  const [value] = useSessionStorage<AuthHeaderRequest>(
    storageKey.signedMessage,
    { message: '', signature: '' },
  );

  return useMutation({
    mutationKey: [...appQueryKeys.board.root, 'update', ...mutationKey],

    mutationFn: (board: UpdateBoardRequest) => {
      return api.updateBoard(
        board.board_id,
        {
          board_title: board.board_title,
          board_description: board.board_description,
        },
        value
      );
    },

    onMutate: async (...args) => {
      return onMutate?.(...args);
    },

    onSuccess: async (...args) => {
      await onSuccess?.(...args);
    },

    onError,

    onSettled: async (...args) => {
      await onSettled?.(...args);
    },
  });
}
