import type { ColumnDef } from '@tanstack/react-table';
import { formatKST, parseToKST, now } from '@/utils/timezone';

import type {
  AdminQuest,
  AdminQuestStatus,
  BaseAdminQuest,
} from '@/types/schema';
import { formatNumber } from '@/utils/number';

import { Checkbox } from '../ui/checkbox';

const baseColumns: ColumnDef<BaseAdminQuest>[] = [
  {
    id: 'select',
    cell: ({ row }) => (
      <div className="mr-2 flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 64,
  },
  {
    header: 'No',
    id: 'id',
    cell: ({ row }) => {
      return row.index + 1;
    },
    size: 64,
  },
  {
    accessorKey: 'quest_category',
    header: 'Category',
  },
  {
    accessorKey: 'quest_title',
    header: 'Title',
  },
  {
    id: 'quest_end_date',
    accessorKey: 'quest_end_date',
    header: 'Quest End Date',
    cell: ({ row }) => {
      return formatKST(row.getValue('quest_end_date') as string, 'YYYY/MM/DD');
    },
  },
  {
    accessorKey: 'quest_status',
    header: 'Quest Status',
    size: 160,
    meta: {
      style: {
        textAlign: 'center',
      },
    },
    cell: ({ row }) => (
      <p className="text-center">
        {row.original.quest_status === 'PUBLISH'
          ? !!row.original.quest_end_date && parseToKST(row.original.quest_end_date).isBefore(now())
            ? 'CLOSE'
            : 'IN PROGRESS'
          : row.original.quest_status}
      </p>
    ),
  },
];

function insertArrayAt<T>(
  targetArray: Array<T>,
  insertArray: Array<T>,
  index: number,
) {
  return [
    ...targetArray.slice(0, index),
    ...insertArray,
    ...targetArray.slice(index),
  ];
}

export const getColumns = (status: AdminQuestStatus): ColumnDef<any>[] => {
  if (status === 'ongoing') {
    return insertArrayAt(
      baseColumns,
      [
        {
          accessorKey: 'quest_hot',
          header: 'Hot',
          size: 64,
          cell: ({ row }) => {
            const hot = row.getValue('quest_hot');
            return <p className="text-center">{hot ? 'T' : 'F'}</p>;
          },
          meta: {
            style: {
              textAlign: 'center',
            },
          },
        },
      ],
      5,
    );
  } else if (status === 'draft') {
    return [
      ...baseColumns
        .slice(0, 5)
        .filter(column => column.id !== 'quest_end_date'),
      {
        accessorKey: 'dao_draft_end_at',
        header: 'Draft End Date',
        cell: ({ row }) => {
          return formatKST(row.getValue('dao_draft_end_at') as string, 'YYYY/MM/DD');
        },
      },
      {
        accessorKey: 'total_vote',
        header: 'Total Vote',
        meta: {
          style: {
            textAlign: 'center',
          },
        },
        cell: ({ row }) => (
          <p className="text-center">{row.original.total_vote}</p>
        ),
      },
      ...baseColumns.slice(5),
      {
        accessorKey: 'total_approve_power',
        header: 'Approval Vote',
        meta: {
          style: {
            textAlign: 'center',
          },
        },
        cell: ({ row }) => (
          <p className="text-center">{row.original.total_approve_power}</p>
        ),
      },
      {
        accessorKey: 'total_reject_power',
        header: 'Reject Vote',
        meta: {
          style: {
            textAlign: 'center',
          },
        },
        cell: ({ row }) => (
          <p className="text-center">{row.original.total_reject_power}</p>
        ),
      },
    ];
  } else if (status === 'publish') {
    return [
      ...baseColumns.slice(0, 5),
      {
        accessorKey: 'total_betting_amount',
        header: 'Total Amount of Bet',
        meta: {
          style: {
            textAlign: 'center',
          },
        },
        cell: ({ row }) => (
          <p className="text-center">
            {formatNumber(row.original.total_betting_amount, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}
          </p>
        ),
      },
      ...baseColumns.slice(5),
    ];
  } else if (status === 'decision') {
    return [
      ...baseColumns.slice(0, 4),
      {
        accessorKey: 'dao_success_end_at',
        header: 'DAO-Success End Date',
        cell: ({ row }) => {
          return formatKST(row.getValue('dao_success_end_at') as string, 'YYYY/MM/DD');
        },
        size: 180,
      },
      {
        accessorKey: 'total_vote',
        header: 'Total Vote',
        meta: {
          style: {
            textAlign: 'center',
          },
        },
        cell: ({ row }) => (
          <p className="text-center">{row.original.total_vote}</p>
        ),
      },
      ...baseColumns.slice(5),
      {
        accessorKey: 'total_success_power',
        header: 'Success Vote',
        meta: {
          style: {
            textAlign: 'center',
          },
        },
        cell: ({ row }) => (
          <p className="text-center">{row.original.total_success_power}</p>
        ),
      },
      {
        accessorKey: 'total_adjourn_power',
        header: 'Adjourn Vote',
        meta: {
          style: {
            textAlign: 'center',
          },
        },
        cell: ({ row }) => (
          <p className="text-center">{row.original.total_adjourn_power}</p>
        ),
      },
    ];
  } else if (status === 'answer') {
    return [
      ...baseColumns.slice(0, 4),
      {
        accessorKey: 'dao_answer_end_at',
        header: 'Answer End Date',
        cell: ({ row }) => {
          return formatKST(row.getValue('dao_answer_end_at') as string, 'YYYY/MM/DD');
        },
      },
      {
        accessorKey: 'total_vote',
        header: 'Total Vote',
      },
      ...baseColumns.slice(5),
      {
        accessorKey: 'answers',
        header: 'Answer List',
        cell: ({ row }) => {
          return (row.original as AdminQuest<'answer'>)?.answers?.length;
        },
      },
      {
        accessorKey: 'answer_selected',
        header: 'Selected Answer',
      },
    ];
  } else if (status === 'success') {
    return [
      ...baseColumns.slice(0, 5),
      {
        accessorKey: 'total_betting_amount',
        header: 'Total Amount of Bet',
      },
      ...baseColumns.slice(5),
      {
        accessorKey: 'total_vote',
        header: 'Total Vote',
        meta: {
          style: {
            textAlign: 'center',
          },
        },
        cell: ({ row }) => (
          <p className="text-center">{row.original.total_vote}</p>
        ),
      },
    ];
  } else if (status === 'adjourn') {
    return [
      ...baseColumns.slice(0, 5),
      {
        accessorKey: 'total_betting_amount',
        header: 'Betting Amount',
        meta: {
          style: {
            textAlign: 'center',
          },
        },
        cell: ({ row }) => (
          <p className="text-center">
            {formatNumber(row.original.total_betting_amount, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}
          </p>
        ),
      },
      ...baseColumns.slice(5),
    ];
  }

  return baseColumns;
};
