'use client';

import type { CellContext, ColumnDef } from '@tanstack/react-table';
import { parseAsInteger, useQueryState } from 'nuqs';
import React, { useMemo } from 'react';

import { CustomCheckbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useClaimRewardSolana } from '@/hooks/use-claim-bet-reward';
import { useDataTable } from '@/hooks/use-data-table';
import { useGetTokenInfoSolana } from '@/hooks/use-get-token-info-solana';
import { useGetMemberBettings } from '@/hooks/use-member';
import { usePrivyWallet } from '@/hooks/use-privy-wallet';
import { useToast } from '@/hooks/use-toast';
import { Env } from '@/libs/Env';
import type { MemberBetting, QuestStatus } from '@/types/schema';
import { formatNumber } from '@/utils/number';

import type { ClaimButtonProps } from './claim-button';
import { ClaimButton } from './claim-button';
import { PaginationContainer } from '../ui/pagination';

const questStatuses = [
  { name: 'Draft', value: 'draft' },
  { name: 'Success', value: 'success' },
  { name: 'Answer', value: 'answer' },
  { name: 'Done', value: 'done' },
];

function getColumns(): ColumnDef<MemberBetting>[] {
  return [
    {
      id: 'select',
      header: 'Reward',
      cell: RewardButton,
      enableSorting: false,
      enableHiding: false,
      size: 64,
      meta: {
        style: {
          textAlign: 'center',
        },
      },
    },
    {
      header: 'Category',
      size: 180,
      cell: ({ row }) =>
        row.original.quest
          ? row.original.quest.quest_category.quest_category_title
          : 'N/A',
    },
    {
      accessorKey: 'quest.quest_title',
      header: 'Title',
      size: 240,
      cell: ({ row }) =>
        row.original.quest ? row.original.quest.quest_title : 'N/A',
    },
    {
      accessorKey: 'statusFlow',
      header: 'Status Flow',
      size: 280,
      cell: StatusFlow,
      meta: {
        style: {
          textAlign: 'center',
        },
      },
    },
    {
      accessorKey: 'answer_key',
      header: 'My Answer',
      cell: ({ row }) => (
        <p className="text-center">
          {row.original.quest ? row.original.answer.answer_title : 'N/A'}
        </p>
      ),
      meta: {
        style: {
          textAlign: 'center',
        },
      },
    },
    {
      accessorKey: 'betting_amount',
      header: 'My Vote',
      meta: {
        style: {
          textAlign: 'center',
        },
      },
      cell: ({ row }) => {
        const tokenAddress = row.original.quest?.quest_betting_token_address || Env.NEXT_PUBLIC_BETTING_TOKEN_ADDRESS;
        const { symbol } = useGetTokenInfoSolana(tokenAddress);
        return (
          <p className="text-center">
            {formatNumber(Number(row.original.betting_amount), {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            {' '}
            {symbol}
          </p>
        );
      },
    },
    {
      header: 'Potential Reward',
      cell: ({ row }) => {
        const tokenAddress = row.original.quest?.quest_betting_token_address || Env.NEXT_PUBLIC_BETTING_TOKEN_ADDRESS;
        const { symbol } = useGetTokenInfoSolana(tokenAddress);
        return (
          <p className="text-center">
            {formatNumber(calculatePotentialReward(row.original), {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            {' '}
            {symbol}
          </p>
        );
      },
      meta: {
        style: {
          textAlign: 'center',
        },
      },
    },
  ];
}

const StatusFlow = ({ row }: CellContext<MemberBetting, unknown>) => {
  const isChecked = (val: string): boolean => {
    const questStatus = row.original.quest.quest_status as QuestStatus;

    switch (val) {
      case 'draft':
        return ['PUBLISH', 'FINISH', 'DAO_SUCCESS', 'MARKET_SUCCESS'].includes(
          questStatus,
        );
      case 'success':
        return ['FINISH', 'DAO_SUCCESS', 'MARKET_SUCCESS'].includes(
          questStatus,
        );
      case 'answer':
        return ['DAO_SUCCESS', 'MARKET_SUCCESS'].includes(questStatus);
      case 'done':
        return questStatus === 'MARKET_SUCCESS';
      default:
        return false;
    }
  };

  return (
    <div className="relative flex items-center gap-6">
      {questStatuses.map(status => (
        <div
          key={status.value}
          className="flex w-full flex-col items-center gap-1"
        >
          <CustomCheckbox
            defaultChecked={isChecked(status.value)}
            id={status.value}
            className="pointer-events-none"
          />
          <Label htmlFor={status.value}>{status.name}</Label>
        </div>
      ))}

      {row.original?.quest?.quest_status === 'ADJOURN' && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl border border-border bg-black/60 font-medium text-white backdrop-blur">
          Adjourn
        </div>
      )}
    </div>
  );
};

const RewardButton = ({ row }: CellContext<MemberBetting, unknown>) => {
  const original = row.original;
  const quest = row.original.quest;

  const isAdjourn = quest?.quest_status === 'ADJOURN';
  const isRejected = quest?.quest_status === 'REJECT';
  const isWin = original.answer.answer_selected;

  let variant: ClaimButtonProps['variant'] = 'unclaimable';

  if (isAdjourn) {
    variant = 'claimable';
  } else if (quest?.quest_status === 'MARKET_SUCCESS') {
    variant = original.reward_claimed
      ? 'claimed'
      : isWin
        ? 'claimable'
        : 'unclaimable';
  }

  const { toast } = useToast();
  const { publicKey } = usePrivyWallet();
  const { mutate: claimReward, isPending: isClaiming } = useClaimRewardSolana();

  const handleClaimReward = () => {
    if (isRejected || original.reward_claimed) {
      return;
    }

    if (!publicKey) {
      toast({
        title: 'Please connect your wallet first',
        variant: 'danger',
      });
      return;
    }

    claimReward({
      marketKey: String(original.quest_key),
      answerKey: String(original.answer_key),
      bettingKey: original.betting_key,
    });
  };

  return (
    <ClaimButton
      variant={variant}
      disabled={isRejected || isClaiming}
      loading={isClaiming}
      onClick={handleClaimReward}
    />
  );
};

function calculatePotentialReward(betting: MemberBetting) {
  const {
    quest,
    betting_amount,
    total_betting_amount,
    selected_betting_amount,
  } = betting;

  const totalAmount = Number(total_betting_amount);

  const serviceFee = (totalAmount * Number(quest.season.service_fee)) / 100;
  const creatorFee = (totalAmount * Number(quest.season.creator_fee)) / 100;
  const charityFee = (totalAmount * Number(quest.season.charity_fee)) / 100;

  const multiply
    = quest.quest_status === 'ADJOURN'
      ? 1
      : (totalAmount - serviceFee - creatorFee - charityFee)
      / Number(selected_betting_amount);

  const predictionFee
    = quest.quest_status === 'ADJOURN'
      ? betting_amount
      : multiply * Number(betting_amount);

  return predictionFee;
}

export const GamesTable = () => {
  const { publicKey } = usePrivyWallet();
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const PAGE_SIZE = 50;

  const { data, isLoading } = useGetMemberBettings(
    publicKey?.toBase58() ?? '',
    page,
    PAGE_SIZE
  );

  const total = data?.data?.total ?? 0;
  const pageCount = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  const columns = useMemo(() => {
    const cols = getColumns();

    return isLoading
      ? cols.map(column => ({
        ...column,
        cell: () => <Skeleton className="h-4 w-16" />,
      }))
      : cols;
  }, [isLoading]);

  const quests = useMemo(
    () =>
      (isLoading
        ? Array.from({ length: 10 }).map((_, idx) => ({
          betting_key: Date.now() + idx,
        }))
        : data?.data?.bettings ?? []) as MemberBetting[],
    [isLoading, data],
  );

  const { table } = useDataTable({
    data: quests,
    columns,
    pageCount,
    initialState: {
      sorting: [{ id: 'betting_created_at', desc: true }],
    },
    getRowId: (originalRow: MemberBetting) => `${originalRow.betting_key}`,
  });

  return (
    <div className="space-y-4">
      <div className="flex h-12 items-center justify-between gap-4">
        <p className="font-outfit text-base font-normal text-[#062B3E] dark:text-white">
          Total: {total} items
        </p>
      </div>
      <DataTable table={table} />
      {total > 0 && (
        <PaginationContainer
          className="my-12"
          currentPage={page}
          totalPages={pageCount}
          onPageChange={p => setPage(p)}
        />
      )}
    </div>
  );
};
