'use client';

import dayjs from 'dayjs';
import Image from 'next/image';

import { Card } from '@/components/ui/card';
import type { Quest } from '@/types/schema';
import { formatNumber } from '@/utils/number';
import { cn } from '@/utils/cn';

import { Skeleton } from './ui/skeleton';

type QuestCardProps = {
  name: string;
  image?: string;
  status: 'in-progress' | 'ended';
  endAt: string | Date;
  answers: Quest['answers'];
  total: number;
  symbol: string;
  mode?: 'default' | 'graph';
};

export default function QuestCard({
  name,
  image,
  status,
  endAt,
  answers,
  total,
  symbol,
}: QuestCardProps) {
  const sortedAnswers = [...(answers || [])].sort(
    (a, b) => {
      // Primary sort by total_betting_amount (descending)
      const amountDiff = b.total_betting_amount - a.total_betting_amount;
      if (amountDiff !== 0) return amountDiff;
      // Secondary sort by answer_key (ascending) to maintain original order when amounts are equal
      return String(a.answer_key).localeCompare(String(b.answer_key));
    }
  ).slice(0, 4);

  return (
    <div className="market-card-wrapper">
      <Card className="market-card flex w-full flex-col overflow-hidden rounded-2xl border border-[rgba(0,111,188,0.16)] bg-white dark:bg-[rgba(255,255,255,0.04)]">
        <div className="flex flex-row items-center gap-3 p-4">
          <div className="relative size-12 flex-shrink-0 overflow-hidden rounded-[10px]">
            <Image
              alt={name}
              width={48}
              height={48}
              src={image ?? '/placeholder-quest.png'}
              className="size-full object-cover"
            />
          </div>

          <h3 className="font-outfit line-clamp-2 flex-1 text-xl font-semibold leading-[120%] text-black dark:text-white">
            {name}
          </h3>

          <div
            className={cn(
              'flex flex-shrink-0 items-center justify-center rounded-[10px] px-3 py-1',
              status === 'in-progress'
                ? 'bg-[rgba(40,175,61,0.1)] text-[#008714] dark:bg-[rgba(0,194,29,0.1)] dark:text-[#00C21D]'
                : 'bg-[rgba(220,38,38,0.1)] text-[#DC2626]'
            )}
          >
            <span className="font-outfit text-sm font-normal leading-[18px]">
              {status === 'in-progress' ? 'In Progress' : 'Closed'}
            </span>
          </div>
        </div>

        {/* Options section with fixed min-height for consistent card heights */}
        <div className="flex flex-1 flex-col justify-start gap-1.5 min-h-[140px]">
          {sortedAnswers.map((answer) => {
            const percent =
              total === 0 ? 0 : (answer.total_betting_amount * 100) / total;

            return (
              <div key={answer.answer_key} className="flex flex-col gap-1 px-4">
                <div className="flex items-center justify-between">
                  <span className="font-outfit text-sm font-normal leading-[18px] text-[#1F1F1F] dark:text-white">
                    {answer.answer_title}
                  </span>
                  <span className="font-outfit text-sm font-normal leading-[18px] text-[#606060] dark:text-[#8C8C8C]">
                    {formatNumber(percent, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    % ({formatNumber(answer.total_betting_amount, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })} {symbol})
                  </span>
                </div>

                <div className="relative h-1.5 w-full overflow-hidden rounded-[20px] bg-[rgba(0,111,188,0.12)]">
                  <div
                    className="absolute left-0 top-0 h-full rounded-[20px] bg-[#006FBC] transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-auto flex items-center justify-between p-4">
          <div className="flex items-center justify-center rounded-lg bg-[rgba(0,111,188,0.08)] px-3 py-1 dark:bg-[rgba(255,255,255,0.1)]">
            <span className="font-outfit text-sm font-normal leading-[18px] text-[#006FBC] dark:text-white">
              {symbol}
            </span>
          </div>

          <span className="font-outfit text-sm font-normal leading-[18px] text-[#353535] dark:text-[#E4E4E4]">
            {dayjs(endAt).format('YYYY/MM/DD - HH:mm:ss')}
          </span>
        </div>
      </Card>
    </div>
  );
}

export const QuestCardSkeketon = () => {
  return (
    <Card className="flex w-full flex-col overflow-hidden rounded-2xl border border-[rgba(0,111,188,0.16)] bg-[rgba(0,111,188,0.02)]">
      <div className="flex flex-row items-center gap-3 p-4">
        <Skeleton className="size-12 rounded-[10px]" />
        <Skeleton className="h-6 flex-1" />
        <Skeleton className="h-6 w-20 rounded-[10px]" />
      </div>
      <div className="flex flex-col gap-2 px-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="mt-auto flex items-center justify-between p-4">
        <Skeleton className="h-6 w-16 rounded-lg" />
        <Skeleton className="h-4 w-32" />
      </div>
    </Card>
  );
};
