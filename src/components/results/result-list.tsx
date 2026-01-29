'use client';

import dayjs from 'dayjs';
import Link from 'next/link';
import { parseAsInteger, useQueryState } from 'nuqs';

import QuestCard, { QuestCardSkeketon } from '@/components/quest-card';
import { PaginationContainer } from '@/components/ui/pagination';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';
import { ROUTES } from '@/config/routes';
import { useGetTokenInfoSolana } from '@/hooks/use-get-token-info-solana';
import { useFetchQuests, useQuestsFilters } from '@/hooks/use-fetch-quests';
import { Env } from '@/libs/Env';
import type { Quest } from '@/types/schema';

// Component wrapper to fetch symbol for each quest
const QuestCardWithSymbol = ({ quest }: { quest: Quest }) => {
  const tokenAddress = quest.quest_betting_token_address || Env.NEXT_PUBLIC_BETTING_TOKEN_ADDRESS;
  const { symbol } = useGetTokenInfoSolana(tokenAddress);

  return (
    <Link
      href={quest.quest_status === 'MARKET_SUCCESS' ? ROUTES.RESULTS_DETAIL(quest.quest_key) : ROUTES.QUEST_DETAIL(quest.quest_key)}
    >
      <QuestCard
        name={quest.quest_title}
        image={quest?.quest_image_url}
        endAt={quest.quest_end_date}
        answers={quest.answers}
        total={quest.total_betting_amount}
        status={
          (!!quest.quest_finish_datetime && dayjs(quest.quest_finish_datetime).isBefore(dayjs()))
            || (!!quest.quest_end_date && dayjs(quest.quest_end_date).isBefore(dayjs()))
            ? 'ended'
            : 'in-progress'
        }
        symbol={symbol}
        mode="graph"
      />
    </Link>
  );
};

export const ResultList = () => {
  const [currentPage, setCurrentPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(1),
  );
  const { category, bettingToken } = useQuestsFilters();

  const { data, isLoading } = useFetchQuests({
    status: ['MARKET_SUCCESS'],
    category,
    bettingToken,
    page: currentPage,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 12 }).map((_, idx) => (
          <QuestCardSkeketon key={idx} />
        ))}
      </div>
    );
  }

  if (data?.data?.total === 0) {
    return <div className="flex items-center justify-center p-10">No data</div>;
  }

  return (
    <>
      <div className="app-container grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {data?.data?.quests?.map(quest => (
          <QuestCardWithSymbol key={quest.quest_key} quest={quest} />
        ))}
      </div>

      {(data?.data?.total ?? 0) > 0 && (
        <PaginationContainer
          className="my-12"
          currentPage={currentPage}
          totalPages={Math.ceil((data?.data?.total ?? 0) / DEFAULT_PAGE_SIZE)}
          onPageChange={setCurrentPage}
        />
      )}
    </>
  );
};
