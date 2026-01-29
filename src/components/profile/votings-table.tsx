'use client';

import type { CellContext, ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';

import { DataTable } from '@/components/ui/data-table';
import { useClaimReward } from '@/hooks/use-claim-vote-reward';
import { useDataTable } from '@/hooks/use-data-table';
import { useGetGovernanceConfig } from '@/hooks/use-get-govermance-config';
import { useGetMemberVotings } from '@/hooks/use-member';
import { usePrivyWallet } from '@/hooks/use-privy-wallet';
import type { MemberVoting, QuestStatus } from '@/types/schema';
import { formatNumber } from '@/utils/number';

import { Skeleton } from '../ui/skeleton';
import { Typography } from '../ui/typography';
import type { ClaimButtonProps } from './claim-button';
import { ClaimButton } from './claim-button';
import { StatusFlow } from './status-flow';

function getColumns({
  votingToken,
  reward,
}: {
  votingToken: string;
  reward: number;
}): ColumnDef<MemberVoting>[] {
  return [
    {
      id: 'select',
      header: 'Reward',
      cell: ClaimRewardCell,
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
      accessorKey: 'quest_category',
      header: 'Category',
      size: 180,
    },
    {
      accessorKey: 'quest_title',
      header: 'Title',
    },
    {
      accessorKey: 'statusFlow',
      header: 'Status Flow',
      cell: StatusFlowCell,
      meta: {
        style: {
          textAlign: 'center',
        },
      },
    },
    {
      accessorKey: 'quest_answer_title',
      header: 'My Answer',
      cell: ({ row }) => (
        <Typography className="text-center font-medium">
          {row.original.quest_answer_title}
        </Typography>
      ),
      meta: {
        style: {
          textAlign: 'center',
        },
      },
    },
    {
      header: 'Total Reward',
      cell: ({ row }) => (
        <Typography className="text-center font-medium">
          {formatNumber(reward * row.original.vote_power, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })}
          {' '}
          {votingToken}
        </Typography>
      ),
      meta: {
        style: {
          textAlign: 'center',
        },
      },
    },
  ];
}

export const VotingTable = () => {
  const { publicKey } = usePrivyWallet();
  const { data, isLoading } = useGetMemberVotings(publicKey?.toBase58() ?? '');
  const { symbol, reward } = useGetGovernanceConfig();

  const columns = useMemo(() => {
    const cols = getColumns({ votingToken: symbol, reward });

    return isLoading
      ? cols.map(column => ({
          ...column,
          cell: () => <Skeleton className="h-4 w-16" />,
        }))
      : cols;
  }, [isLoading, symbol, reward]);

  const quests = useMemo(
    () =>
      (isLoading
        ? Array.from({ length: 10 }).map((_, idx) => ({
            betting_key: Date.now() + idx,
          }))
        : data?.data?.votes ?? []) as MemberVoting[],
    [isLoading, data],
  );

  const { table } = useDataTable({
    data: quests,
    columns,
    pageCount: -1,
    initialState: {},
    getRowId: (originalRow: MemberVoting) => originalRow.quest_key,
  });

  return <DataTable table={table} />;
};

const ClaimRewardCell = ({ row }: CellContext<MemberVoting, unknown>) => {
  const quest = row.original;
  const { publicKey } = usePrivyWallet();
  const { mutate: claimReward, isPending: isClaiming } = useClaimReward();

  // Determine button variant
  const isCancel
    = quest?.quest_status === 'ADJOURN' || quest?.quest_status === 'REJECT';
  const hasClaimed
    = quest?.vote_reward !== null && quest?.vote_reward !== undefined;

  let variant: ClaimButtonProps['variant'] = 'unclaimable';

  if (isCancel) {
    variant = 'adjourn';
  } else if (quest?.quest_status === 'MARKET_SUCCESS') {
    variant = hasClaimed
      ? 'claimed'
      : String(quest.selected?.answer_key) === String(quest.quest_answer_key)
        ? 'claimable'
        : 'unclaimable';
  }

  const handleClaimReward = () => {
    if (!publicKey) {
      return;
    }

    if (isCancel) {
      return;
    }

    claimReward({
      questKey: quest.quest_key,
    });
  };

  return (
    <ClaimButton
      variant={variant}
      disabled={isCancel || isClaiming || variant !== 'claimable'}
      loading={isClaiming}
      onClick={handleClaimReward}
    />
  );
};

const questStatuses = [
  { name: 'Draft', value: 'draft' },
  { name: 'Success', value: 'success' },
  { name: 'Answer', value: 'answer' },
  { name: 'Done', value: 'done' },
];

const StatusFlowCell = ({ row }: CellContext<MemberVoting, unknown>) => {
  const quest = row.original;

  const isAdjourn
    = quest?.quest_status === 'ADJOURN' || quest?.quest_status === 'REJECT';

  const isChecked = (val: string): boolean => {
    const questStatus = quest.quest_status.toUpperCase() as QuestStatus;

    // Check if user has voted in each round
    const hasVotedDraft = !!quest.vote_draft_option;
    const hasVotedSuccess = !!quest.vote_success_option;
    const hasVotedAnswer = !!quest.quest_answer_key;

    switch (val) {
      case 'draft':
        // Show as completed if user has voted in draft OR quest has moved past draft
        return hasVotedDraft || [
          'APPROVE',
          'REJECT',
          'DAO_SUCCESS',
          'MARKET_SUCCESS',
          'FINISH',
        ].includes(questStatus);

      case 'success':
        // Show as completed if user has voted in success OR quest has moved past success
        return hasVotedSuccess || ['FINISH', 'DAO_SUCCESS', 'MARKET_SUCCESS'].includes(
          questStatus,
        );

      case 'answer':
        // Show as completed if user has voted answer OR quest is completed
        return hasVotedAnswer || ['DAO_SUCCESS', 'MARKET_SUCCESS'].includes(questStatus);

      case 'done':
        return questStatus === 'MARKET_SUCCESS';

      default:
        return false;
    }
  };

  return (
    <StatusFlow
      options={questStatuses}
      isAdjourn={isAdjourn}
      isChecked={isChecked}
    />
  );
};
