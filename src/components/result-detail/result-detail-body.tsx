'use client';

import dayjs from 'dayjs';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { HistoryTab } from '@/components/quest-detail/history-tab';
import { QuestCard } from '@/components/quest-detail/quest-card';
import { VoteTab } from '@/components/quest-detail/vote-tab';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Typography } from '@/components/ui/typography';
import { ROUTES } from '@/config/routes';
import { useGetTokenInfoSolana } from '@/hooks/use-get-token-info-solana';
import { Env } from '@/libs/Env';
import type { QuestDetail } from '@/types/schema';
import { formatNumber } from '@/utils/number';

export const ResultDetailBody = ({ quest }: { quest: QuestDetail }) => {
  const selectedAnswer = quest.answers.find(ans => ans.answer_selected);

  const tokenAddress = quest.quest_betting_token_address || Env.NEXT_PUBLIC_BETTING_TOKEN_ADDRESS;
  const { symbol } = useGetTokenInfoSolana(tokenAddress);

  const status = (!!quest?.quest_finish_datetime && dayjs(quest.quest_finish_datetime).isBefore(dayjs()))
    || (!!quest?.quest_end_date && dayjs(quest.quest_end_date).isBefore(dayjs()))
    ? 'ended'
    : 'in-progress';

  return (
    <>
      <div className="mb-0 xl:mb-9 bg-background px-6 py-12 md:px-8 lg:px-0">
        <div className="app-container px-0">
          <div className="mb-6 flex items-center gap-1">
            <Link href={ROUTES.HOME} className="font-outfit text-base text-[#149FFF]">
              Home
            </Link>
            <ChevronRight className="size-[18px] text-white" />
            <Link href={ROUTES.RESULTS} className="font-outfit text-base text-[#149FFF]">
              Result
            </Link>
            <ChevronRight className="size-[18px] text-white" />
            <Typography className="truncate font-outfit text-base text-white/40">
              {quest.quest_title}
            </Typography>
          </div>
          <div className="flex w-full flex-col gap-5 lg:flex-row lg:justify-between lg:gap-8">  
            <div className="min-w-0 shrink-0">
              <QuestCard quest={quest} isCopyable={false} />
            </div>

            <div className="flex flex-1 flex-col gap-4"> 
              <div className="flex flex-col items-center gap-6 rounded-2xl bg-white/[0.04] p-5 dark:bg-white/[0.04] lg:rounded-3xl lg:p-8">
                <div className="flex w-full flex-col gap-4">
                  <Typography 
                    level="h2" 
                    className="font-outfit text-2xl font-medium leading-[140%] text-foreground lg:text-[32px]"
                  >
                    {quest.quest_title}
                  </Typography>
                  <Typography 
                    level="body2" 
                    className="font-outfit text-sm font-light leading-[140%] text-foreground/80 lg:text-base"
                  >
                    {quest.quest_description}
                  </Typography>
                </div>
                
                <div className="flex w-full items-center justify-between">
                  <Badge 
                    variant="filled" 
                    color={status === 'in-progress' ? 'good' : 'danger'} 
                    className="h-[26px] justify-center rounded-[10px] px-3 py-1 text-sm"
                  >
                    {status === 'in-progress' ? 'In Progress' : 'Close'}
                  </Badge>
                  <Typography className="font-poppins text-sm text-foreground">
                    {dayjs(quest.quest_end_date).format('YYYY/MM/DD - HH:mm:ss')}
                  </Typography>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex w-[120px] shrink-0 flex-col items-center justify-center gap-5 rounded-3xl bg-white/[0.04] p-4 dark:bg-white/[0.04] lg:w-[147px]">
                  <Typography className="font-poppins text-sm text-foreground">
                    Total
                  </Typography>
                  <Typography 
                    level="h1" 
                    className="flex flex-1 flex-col items-center justify-center text-center font-outfit text-5xl font-semibold leading-[140%] text-foreground"
                  >
                    {formatNumber(quest.total_betting_amount, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    <span className="text-2xl font-medium">{symbol}</span>
                  </Typography>
                  <Typography className="font-poppins text-sm text-foreground">
                    {dayjs(quest.quest_end_date).format('DD MMM YYYY')}
                  </Typography>
                </div>

                <div className="flex flex-1 flex-col items-center justify-center gap-5 rounded-3xl bg-white/[0.04] p-4 dark:bg-white/[0.04]">
                  <Typography className="font-poppins text-sm text-foreground">
                    The final outcome is...
                  </Typography>
                  <Typography 
                    level="h1" 
                    className="flex flex-1 items-center text-center font-outfit text-[28px] font-semibold leading-[140%] text-custom-blue-500 lg:text-[40px]"
                  >
                    {selectedAnswer?.answer_title}
                  </Typography>
                  <div className="w-full rounded-lg bg-[#0089E9] px-6 py-3.5">
                    <Typography className="text-center font-outfit text-sm font-semibold uppercase tracking-wide text-white">
                      {formatNumber(
                        ((selectedAnswer?.total_betting_amount ?? 0) * 100) / quest.total_betting_amount,
                        { minimumFractionDigits: 0, maximumFractionDigits: 2 },
                      )}% ({formatNumber(selectedAnswer?.total_betting_amount ?? 0, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} {symbol})
                    </Typography>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="app-container pb-20 max-xl:px-6">
        <Tabs defaultValue="voting">
          <TabsList className="gap-4 bg-transparent">
            <TabsTrigger
              value="voting"
              className="h-9 w-auto min-w-0 rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 py-2 font-outfit text-sm font-normal text-[#F1EBFB]/60 shadow-none ring-0 focus-visible:ring-0 data-[state=active]:border-[#0089E9] data-[state=active]:bg-transparent data-[state=active]:text-[#F1EBFB] data-[state=active]:shadow-none lg:h-12 lg:w-[126px] lg:rounded-xl lg:border-0 lg:px-6 lg:py-3.5 lg:text-base lg:font-medium lg:text-foreground lg:data-[state=active]:bg-[#0089E9] lg:data-[state=active]:text-white lg:data-[state=inactive]:bg-[#F6F6F61A]"
            >
              VOTING
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="h-9 w-auto min-w-0 rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 py-2 font-outfit text-sm font-normal text-[#F1EBFB]/60 shadow-none ring-0 focus-visible:ring-0 data-[state=active]:border-[#0089E9] data-[state=active]:bg-transparent data-[state=active]:text-[#F1EBFB] data-[state=active]:shadow-none lg:h-12 lg:w-[126px] lg:rounded-xl lg:border-0 lg:px-6 lg:py-3.5 lg:text-base lg:font-medium lg:text-foreground lg:data-[state=active]:bg-[#0089E9] lg:data-[state=active]:text-white lg:data-[state=inactive]:bg-[#F6F6F61A]"
            >
              HISTORY
            </TabsTrigger>
          </TabsList>
          <TabsContent value="voting">
            <VoteTab quest={quest} />
          </TabsContent>
          <TabsContent value="history">
            <HistoryTab quest={quest} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};
