'use client';

import type {
  ColumnDef,
} from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Typography } from '@/components/ui/typography';

const grants = [
  {
    no: '01',
    walletAddress: 'CL367Jo8mHhLrXn9NxQi9kwAhpTCyCAPggLQymaagEme',
    finishStatus: 'Active',
  },
  {
    no: '02',
    walletAddress: 'CL367Jo8mHhLrXn9NxQi9kwAhpTCyCAPggLQymaagEme',
    finishStatus: 'Inactive',
  },
  {
    no: '03',
    walletAddress: 'CL367Jo8mHhLrXn9NxQi9kwAhpTCyCAPggLQymaagEme',
    finishStatus: 'Active',
  },
  {
    no: '04',
    walletAddress: 'CL367Jo8mHhLrXn9NxQi9kwAhpTCyCAPggLQymaagEme',
    finishStatus: 'Inactive',
  },
  {
    no: '05',
    walletAddress: 'CL367Jo8mHhLrXn9NxQi9kwAhpTCyCAPggLQymaagEme',
    finishStatus: 'Inactive',
  },
  {
    no: '06',
    walletAddress: 'CL367Jo8mHhLrXn9NxQi9kwAhpTCyCAPggLQymaagEme',
    finishStatus: 'Inactive',
  },
  {
    no: '07',
    walletAddress: 'CL367Jo8mHhLrXn9NxQi9kwAhpTCyCAPggLQymaagEme',
    finishStatus: 'Inactive',
  },
  {
    no: '08',
    walletAddress: 'CL367Jo8mHhLrXn9NxQi9kwAhpTCyCAPggLQymaagEme',
    finishStatus: 'Inactive',
  },
  {
    no: '09',
    walletAddress: 'CL367Jo8mHhLrXn9NxQi9kwAhpTCyCAPggLQymaagEme',
    finishStatus: 'Inactive',
  },
];

export type GrantType = {
  no: string;
  walletAddress: string;
  finishStatus: string;
};

export default function GrantsTableWrapper() {
  return (
    <div className="overflow-hidden rounded-8 bg-background shadow-light dark:bg-[#1A1825] dark:shadow-none dark:border dark:border-[#2E2C3D]">
      <div className="flex px-12 py-10">
        <div className="flex items-center gap-6">
          <Typography level="h4" className="text-foreground dark:text-white">Grants Admin:</Typography>
        </div>
      </div>

      <ScrollArea className="h-[535px] px-12 pb-10">
        <GrantsTable />
      </ScrollArea>
    </div>
  );
}

const columns: ColumnDef<GrantType>[] = [
  {
    accessorKey: 'no',
    header: 'No',
  },
  {
    accessorKey: 'walletAddress',
    header: 'Wallet Address',
  },
  {
    accessorKey: 'finishStatus',
    header: 'Finish',
  },
];

export const GrantsTable = () => {
  const table = useReactTable({
    data: grants,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map(headerGroup => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length
          ? (
            table.getRowModel().rows.map(row => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )
          : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
      </TableBody>
    </Table>
  );
};
