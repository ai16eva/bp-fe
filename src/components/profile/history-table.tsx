'use client';

import type { CellContext, ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { CheckIcon } from 'lucide-react';
import { useMemo } from 'react';
import { parseAsInteger, useQueryState } from 'nuqs';

import { DataTable } from '@/components/ui/data-table';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { useDataTable } from '@/hooks/use-data-table';
import { useGetMemberBettings } from '@/hooks/use-member';
import { usePrivyWallet } from '@/hooks/use-privy-wallet';
import { CopyIcon } from '@/icons/icons';
import { Env } from '@/libs/Env';
import type { MemberBetting } from '@/types/schema';
import { formatNumber } from '@/utils/number';
import { maskWalletAddress } from '@/utils/wallet';
import { PaginationContainer } from '../ui/pagination';

import { Skeleton } from '../ui/skeleton';
import { Typography } from '../ui/typography';

function getColumns(): ColumnDef<MemberBetting>[] {
  return [
    {
      header: 'Spender Address',
      cell: SpenderCell,
      size: 258,
    },
    {
      header: 'Recipient Address',
      cell: RecipientAddressCell,
      size: 258,
    },
    {
      header: 'Amount',
      size: 258,
      cell: ({ row }) => {
        if (row.original.reward_claimed) {
          return (
            <Typography className="font-outfit text-base font-normal dark:text-white">
              {formatNumber(row.original.reward_amount, {
                minimumFractionDigits: 0,
              })}
            </Typography>
          );
        }

        return (
          <Typography className="font-outfit text-base font-normal dark:text-white">
            {formatNumber(row.original.betting_amount, {
              minimumFractionDigits: 0,
            })}
          </Typography>
        );
      },
    },
    {
      header: 'Date DTTM',
      size: 258,
      cell: ({ row }) => {
        return (
          <Typography className="font-outfit text-base font-normal dark:text-white">
            {dayjs(row.original.betting_created_at).format('YYYY/MM/DD | hh:mm')}
          </Typography>
        );
      },
    },
  ];
}

const SpenderCell = ({ row }: CellContext<MemberBetting, unknown>) => {
  const [copiedText, copy, setCopiedText] = useCopyToClipboard();

  let content = '';
  if (row.original.reward_claimed) {
    content = Env.NEXT_PUBLIC_MARKET_ADDRESS;
  } else {
    content = row.original.betting_address;
  }

  return (
    <div className="flex items-center gap-3">
      <Typography level="body2" className="font-outfit text-base font-normal dark:text-white">
        {maskWalletAddress(content)}
      </Typography>
      <button
        type="button"
        onClick={() => {
          if (content) {
            copy(content).then(() =>
              setTimeout(() => {
                setCopiedText('');
              }, 1000),
            );
          }
        }}
        className="size-6 text-brand transition-colors hover:text-brand/80"
      >
        {copiedText
          ? (
            <CheckIcon className="size-6" />
          )
          : (
            <CopyIcon className="size-6" />
          )}
      </button>
    </div>
  );
};

const RecipientAddressCell = ({ row }: CellContext<MemberBetting, unknown>) => {
  const [copiedText, copy, setCopiedText] = useCopyToClipboard();

  let content = '';
  if (row.original.reward_claimed) {
    content = row.original.betting_address;
  } else {
    content = Env.NEXT_PUBLIC_MARKET_ADDRESS;
  }

  return (
    <div className="flex items-center gap-3">
      <Typography level="body2" className="font-outfit text-base font-normal dark:text-white">
        {maskWalletAddress(content)}
      </Typography>
      <button
        type="button"
        onClick={() => {
          if (content) {
            copy(content).then(() =>
              setTimeout(() => {
                setCopiedText('');
              }, 1000),
            );
          }
        }}
        className="size-6 text-brand transition-colors hover:text-brand/80"
      >
        {copiedText
          ? (
            <CheckIcon className="size-6" />
          )
          : (
            <CopyIcon className="size-6" />
          )}
      </button>
    </div>
  );
};

export const HistoryTable = () => {
  const { publicKey } = usePrivyWallet();
  const address = publicKey?.toBase58();
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const PAGE_SIZE = 50;
  const { data, isLoading } = useGetMemberBettings(address!, page, PAGE_SIZE);

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
      isLoading
        ? Array.from({ length: 10 }).map((_, idx) => ({
          betting_key: String(Date.now() + idx),
        }))
        : (data?.data?.bettings ?? []).filter(
          (item: MemberBetting) =>
            item.quest.quest_status === 'MARKET_SUCCESS',
        ),
    [isLoading, data],
  ) as MemberBetting[];

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

