'use client';

import type { PropsWithChildren } from 'react';
import React from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useGetTokenInfo } from '@/hooks/use-contract';
import { useFetchActiveSeason } from '@/hooks/use-seasons';
import { Env } from '@/libs/Env';
import { formatNumber } from '@/utils/number';

import { Skeleton } from './ui/skeleton';
import { Typography } from './ui/typography';

type SeasonInfoDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
} & PropsWithChildren;

export default function SeasonInfoDialog({
  children,
  open,
  onOpenChange,
}: SeasonInfoDialogProps) {
  const { data, isFetching } = useFetchActiveSeason();

  const { symbol } = useGetTokenInfo(Env.NEXT_PUBLIC_BETTING_TOKEN_ADDRESS);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="max-h-[calc(100dvh-48px)] w-11/12 md:max-w-3xl"
      >
        <DialogHeader className="mb-6">
          <DialogTitle>{data?.data?.title}</DialogTitle>
          <DialogDescription className="sr-only">
            Boom Play Season Info
          </DialogDescription>
        </DialogHeader>

        {isFetching
          ? (
              <div className="rounded-3xl">
                {[...Array(4)].map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4"
                  >
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            )
          : (
              <div className="divide-y rounded-3xl border border-foreground-30 bg-foreground-10 px-6 py-4">
                <div className="flex items-center justify-between gap-4 pb-4">
                  <Typography level="body1">Prediction Fee:</Typography>
                  <Typography className="font-bold" level="body1">
                    {formatNumber(data?.data?.serviceFee ?? 0, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 1,
                    })}
                    %
                  </Typography>
                </div>
                <div className="flex items-center justify-between gap-4 py-4">
                  <Typography level="body1">Boomplay Fee:</Typography>
                  <Typography className="font-bold" level="body1">
                    {formatNumber(data?.data?.creatorFee ?? 0, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 1,
                    })}
                    %
                  </Typography>
                </div>
                <div className="flex items-center justify-between gap-4 py-4">
                  <Typography level="body1">Charity Fee:</Typography>
                  <Typography className="font-bold" level="body1">
                    {formatNumber(data?.data?.charityFee ?? 0, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 1,
                    })}
                    %
                  </Typography>
                </div>
                <div className="flex items-center justify-between gap-4 pt-4">
                  <Typography level="body1">Minimum Vote:</Typography>
                  <Typography className="font-bold" level="body1">
                    {formatNumber(data?.data?.minPay ?? 0, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}
                    {' '}
                    {symbol}
                  </Typography>
                </div>
              </div>
            )}
      </DialogContent>
    </Dialog>
  );
}
