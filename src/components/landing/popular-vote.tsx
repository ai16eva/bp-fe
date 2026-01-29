'use client';

import dayjs from 'dayjs';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { ROUTES } from '@/config/routes';
import { useGetTokenInfo } from '@/hooks/use-contract';
import { useFetchPopularQuests } from '@/hooks/use-fetch-quests';
import { ArrowTopRightIcon } from '@/icons/icons';
import { Env } from '@/libs/Env';

import QuestCard from '../quest-card';

export const PopularVote = () => {
  const { data } = useFetchPopularQuests();
  const popularQuests = data?.data ?? [];
  const { symbol } = useGetTokenInfo(Env.NEXT_PUBLIC_BETTING_TOKEN_ADDRESS);

  return (
    <div className="app-container py-20">
      <Typography
        className="mb-4 text-center font-bold md:text-left"
        level="h2"
      >
        Popular Vote
      </Typography>
      <div className="mb-7 items-center justify-between md:flex">
        <Typography level="h5" className="text-center font-normal md:text-left">
          Innovative Knowledge Platform for Collective Intelligence Prediction
        </Typography>
        <Link href={ROUTES.QUESTS} className="hidden md:inline">
          <Button variant="link" endDecorator={<ArrowTopRightIcon />}>
            View all
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {popularQuests.map(quest => (
          <Link
            href={ROUTES.QUEST_DETAIL(quest.quest_key)}
            key={quest.quest_key}
          >
            <QuestCard
              name={quest.quest_title}
              image={quest?.quest_image_url}
              endAt={quest.quest_end_date}
              answers={quest.answers}
              total={quest.total_betting_amount}
              status={
                (!!quest.quest_finish_datetime
                  && dayjs(quest.quest_finish_datetime).isBefore(dayjs()))
                  || (quest.quest_end_date && dayjs(quest.quest_end_date).isBefore(dayjs()))
                  ? 'ended'
                  : 'in-progress'
              }
              symbol={symbol}
            />
          </Link>
        ))}
      </div>

      <div className="mt-7 flex items-center justify-center md:hidden">
        <Link href={ROUTES.QUESTS} className="">
          <Button variant="outline" endDecorator={<ArrowTopRightIcon />}>
            View All
          </Button>
        </Link>
      </div>
    </div>
  );
};
