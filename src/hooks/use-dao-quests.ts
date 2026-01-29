import type { DefaultError, UseMutationOptions } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import { parseAsStringLiteral, useQueryState } from 'nuqs';

import { useAuth } from '@/app/auth-provider';
import { getAdminPollingInterval, isDocumentVisible } from '@/config/polling';
import { appQueryKeys, storageKey } from '@/config/query';
import api from '@/libs/api';
import type {
  AuthHeaderRequest,
  BaseResponse,
  GetAdminQuestsRequest,
} from '@/types/schema';

import { useSolanaWallet } from './use-solana-contract';
import { useSessionStorage } from './use-storage';

export const useFilterAdminQuests = () => {
  const filterOptions = [
    'draft',
    'publish',
    'decision',
    'answer',
    'success',
    'adjourn',
    'ongoing',
  ] as const;

  const [status, setStatus] = useQueryState(
    'status',
    parseAsStringLiteral(filterOptions).withDefault('ongoing'),
  );

  return {
    status,
    setStatus,
  };
};

export const useFetchDAOQuests = (
  params: Omit<GetAdminQuestsRequest, 'message' | 'signature'>,
) => {
  const [value] = useSessionStorage<AuthHeaderRequest>(
    storageKey.signedMessage,
    { message: '', signature: '' },
  );

  return useQuery({
    queryKey: [
      ...appQueryKeys.dao.root,
      params.status,
      params.page,
      params.size,
    ].filter(Boolean),
    queryFn: () =>
      api.getAdminQuests({
        message: value.message,
        signature: value.signature,
        ...params,
      }),
    refetchInterval: () => {
      if (!isDocumentVisible()) {
        return false;
      }
      return getAdminPollingInterval(params.status);
    },
    refetchIntervalInBackground: false,
  });
};

export function useAdminSetDraftQuestMutation(
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

  const [value] = useSessionStorage<AuthHeaderRequest>(
    storageKey.signedMessage,
    { message: '', signature: '' },
  );

  return useMutation({
    mutationKey: [...appQueryKeys.dao.setDraft, ...mutationKey],

    mutationFn: (questKey: string) => {
      return api.adminDraftSetQuest(questKey, value);
    },

    onMutate: (...args) => onMutate?.(...args),
    onSuccess: (...args) => onSuccess?.(...args),
    onError,
    onSettled: (...args) => onSettled?.(...args),
  });
}

export function useAdminCancelDraftQuestMutation(
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

  const [value] = useSessionStorage<AuthHeaderRequest>(
    storageKey.signedMessage,
    { message: '', signature: '' },
  );

  return useMutation({
    mutationKey: [...appQueryKeys.dao.cancelDraft, ...mutationKey],

    mutationFn: (questKey: string) => {
      return api.adminDraftCancelQuest(questKey, value);
    },

    onMutate: (...args) => onMutate?.(...args),
    onSuccess: (...args) => onSuccess?.(...args),
    onError,
    onSettled: (...args) => onSettled?.(...args),
  });
}

export function useAdminMakeDraftQuestMutation(
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
  const { mutationKey = [], ...rest } = options || {};

  const [value] = useSessionStorage<AuthHeaderRequest>(
    storageKey.signedMessage,
    { message: '', signature: '' },
  );

  return useMutation({
    mutationKey: [...appQueryKeys.dao.make, ...mutationKey],

    mutationFn: (questKey: string) => {
      return api.adminMakeDraftQuest(questKey, value);
    },

    ...rest,
  });
}

export function useAdminPublishQuestMutation(
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

  const [value] = useSessionStorage<AuthHeaderRequest>(
    storageKey.signedMessage,
    { message: '', signature: '' },
  );

  return useMutation({
    mutationKey: [...appQueryKeys.dao.publish, ...mutationKey],

    mutationFn: (questKey: string) => {
      return api.adminPublishQuest(questKey, value);
    },

    onMutate: (...args) => onMutate?.(...args),
    onSuccess: (...args) => onSuccess?.(...args),
    onError,
    onSettled: (...args) => onSettled?.(...args),
  });
}

export function useAdminFinishQuestMutation(
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
  const { mutationKey = [], ...rest } = options || {};

  const [value] = useSessionStorage<AuthHeaderRequest>(
    storageKey.signedMessage,
    { message: '', signature: '' },
  );

  return useMutation({
    mutationKey: [...appQueryKeys.dao.finish, ...mutationKey],

    mutationFn: (questKey: string) => {
      return api.adminFinishQuest(questKey, value);
    },

    ...rest,
  });
}

export function useAdminStartDAOSuccessQuestMutation(
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
  const { mutationKey = [], ...rest } = options || {};

  const [value] = useSessionStorage<AuthHeaderRequest>(
    storageKey.signedMessage,
    { message: '', signature: '' },
  );

  return useMutation({
    mutationKey: [...appQueryKeys.dao.startDAOSuccess, ...mutationKey],

    mutationFn: (questKey: string) => {
      return api.adminStartDAOSuccessQuest(questKey, value);
    },

    ...rest,
  });
}

export function useAdminSetDaoSuccessMutation(
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
  const { mutationKey = [], ...rest } = options || {};

  const [value] = useSessionStorage<AuthHeaderRequest>(
    storageKey.signedMessage,
    { message: '', signature: '' },
  );

  return useMutation({
    mutationKey: [...appQueryKeys.dao.setDAOSuccess, ...mutationKey],

    mutationFn: (questKey: string) => {
      return api.adminSetDaoSuccess(questKey, value);
    },

    ...rest,
  });
}

export function useAdminAdjournQuestMutation(
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
  const { mutationKey = [], ...rest } = options || {};

  const [value] = useSessionStorage<AuthHeaderRequest>(
    storageKey.signedMessage,
    { message: '', signature: '' },
  );

  return useMutation({
    mutationKey: [...appQueryKeys.dao.adjournDAOSuccess, ...mutationKey],

    mutationFn: (questKey: string) => {
      return api.adminAdjournQuest(questKey, value);
    },

    ...rest,
  });
}

export function useAdminMakeDaoSuccessMutation(
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
  const { mutationKey = [], ...rest } = options || {};

  const [value] = useSessionStorage<AuthHeaderRequest>(
    storageKey.signedMessage,
    { message: '', signature: '' },
  );

  return useMutation({
    mutationKey: [...appQueryKeys.dao.makeDAOSuccess, ...mutationKey],

    mutationFn: (questKey: string) => {
      return api.adminMakeDaoSuccess(questKey, value);
    },

    ...rest,
  });
}

export function useAdminFinalizeAnswerMutation(
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
  const { mutationKey = [], ...rest } = options || {};

  const [value] = useSessionStorage<AuthHeaderRequest>(
    storageKey.signedMessage,
    { message: '', signature: '' },
  );

  return useMutation({
    mutationKey: [...appQueryKeys.dao.root, 'finalize-answer', ...mutationKey],

    mutationFn: (questKey: string) => {
      return api.adminFinalizeAnswer(questKey, value);
    },

    ...rest,
  });
}

export function useAdminSetDAOAnswerMutation(
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
  const { mutationKey = [], ...rest } = options || {};

  const [value] = useSessionStorage<AuthHeaderRequest>(
    storageKey.signedMessage,
    { message: '', signature: '' },
  );

  return useMutation({
    mutationKey: [...appQueryKeys.dao.setDAOAnswer, ...mutationKey],

    mutationFn: (questKey: string) => {
      return api.adminSetDAOAnswer(questKey, value);
    },

    ...rest,
  });
}

export function useAdminSetQuestSuccessMutation(
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
  const { mutationKey = [], ...rest } = options || {};

  const [value] = useSessionStorage<AuthHeaderRequest>(
    storageKey.signedMessage,
    { message: '', signature: '' },
  );

  return useMutation({
    mutationKey: [...appQueryKeys.dao.setSuccess, ...mutationKey],

    mutationFn: (questKey: string) => {
      return api.adminSetQuestSuccess(questKey, value);
    },

    ...rest,
  });
}

export function useAdminSetHotQuestSuccessMutation(
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
  const { mutationKey = [], ...rest } = options || {};

  const [value] = useSessionStorage<AuthHeaderRequest>(
    storageKey.signedMessage,
    { message: '', signature: '' },
  );

  return useMutation({
    mutationKey: [...appQueryKeys.dao.setSuccess, ...mutationKey],

    mutationFn: (questKey: string) => {
      return api.adminSetHotQuest(questKey, value);
    },

    ...rest,
  });
}

// for testing
export function useAdminForceDraftEndMutation(
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
  const { mutationKey = [], ...rest } = options || {};

  const [value] = useSessionStorage<AuthHeaderRequest>(
    storageKey.signedMessage,
    { message: '', signature: '' },
  );

  return useMutation({
    mutationKey: ['admin-force-draft-end', ...mutationKey],

    mutationFn: (questKey: string) => {
      return api.adminForceDraftEnd(questKey, value);
    },

    ...rest,
  });
}

export function useAdminForceSuccessEndMutation(
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
  const { mutationKey = [], ...rest } = options || {};

  const [value] = useSessionStorage<AuthHeaderRequest>(
    storageKey.signedMessage,
    { message: '', signature: '' },
  );

  return useMutation({
    mutationKey: ['admin-force-success-end', ...mutationKey],

    mutationFn: (questKey: string) => {
      return api.adminForceSuccessEnd(questKey, value);
    },

    ...rest,
  });
}

export function useAdminForceAnswerEndMutation(
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
  const { mutationKey = [], ...rest } = options || {};

  const [value] = useSessionStorage<AuthHeaderRequest>(
    storageKey.signedMessage,
    { message: '', signature: '' },
  );

  return useMutation({
    mutationKey: ['admin-force-answer-end', ...mutationKey],

    mutationFn: (questKey: string) => {
      return api.adminForceAnswerEnd(questKey, value);
    },

    ...rest,
  });
}

export function useCreateGovernanceItemMutation(
  options?: Pick<
    UseMutationOptions<
      Awaited<BaseResponse<string>>,
      DefaultError,
      { questKey: string; creatorNftAccount: string },
      unknown
    >,
    'mutationKey' | 'onMutate' | 'onSuccess' | 'onError' | 'onSettled'
  >,
) {
  const { mutationKey = [], ...rest } = options || {};

  const [value] = useSessionStorage<AuthHeaderRequest>(
    storageKey.signedMessage,
    { message: '', signature: '' },
  );
  const { connection, sendTransaction, publicKey } = useSolanaWallet();
  const { user } = useAuth();

  return useMutation({
    mutationKey: [...appQueryKeys.dao.root, 'create-governance-item', ...mutationKey],

    mutationFn: async ({ questKey, creatorNftAccount }: { questKey: string; creatorNftAccount: string }) => {
      if (!value?.message || !value?.signature || value.message.trim() === '' || value.signature.trim() === '') {
        throw new Error('Authentication headers are missing. Please ensure you are logged in and wallet is connected.');
      }

      const isAdmin = user?.role?.toLowerCase() === 'admin';
      const useUserEndpoint = !isAdmin;

      const resp = await api.createGovernanceItem(questKey, creatorNftAccount, value, useUserEndpoint) as unknown as BaseResponse<any>;
      const data: any = (resp as any)?.data ?? (resp as any);
      const txBase64: string | undefined = data?.transactionBase64;
      if (!txBase64) {
        return resp as any;
      }

      if (!connection || !sendTransaction) {
        throw new Error('Wallet not connected');
      }

      const raw = Uint8Array.from(atob(txBase64), c => c.charCodeAt(0));
      const { Transaction } = await import('@solana/web3.js');
      const tx = Transaction.from(raw);

      const { blockhash } = await connection.getLatestBlockhash('confirmed');

      if (publicKey) {
        tx.feePayer = publicKey;
        tx.recentBlockhash = blockhash;
      }

      const receipt = await sendTransaction({ transaction: tx, connection });

      if (!receipt || !receipt.signature) {
        throw new Error('Transaction failed - no signature received');
      }

      const sig = receipt.signature;

      return { success: 1, data: sig, message: 'Governance item submitted' } as any;
    },

    ...rest,
  });
}
