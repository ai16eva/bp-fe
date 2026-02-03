import dayjs from 'dayjs';

import { Badge } from '@/components/ui/badge';
import { Typography } from '@/components/ui/typography';
import { useGetTokenInfoSolana } from '@/hooks/use-get-token-info-solana';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Env } from '@/libs/Env';
import type { QuestDetail } from '@/types/schema';
import { formatNumber } from '@/utils/number';

export const QuestInfo = ({ quest }: { quest?: QuestDetail }) => {
  const lg = useMediaQuery('(min-width: 1280px)');
  const tokenAddress =
    quest?.quest_betting_token_address || Env.NEXT_PUBLIC_BETTING_TOKEN_ADDRESS;
  const { symbol } = useGetTokenInfoSolana(tokenAddress);

  const status =
    (!!quest?.quest_finish_datetime &&
      dayjs(quest.quest_finish_datetime).isBefore(dayjs())) ||
      (!!quest?.quest_end_date && dayjs(quest.quest_end_date).isBefore(dayjs()))
      ? 'ended'
      : 'in-progress';

  return (
    <div className="w-full">
      <Typography
        asChild
        level="h5"
        className="mb-2 lg:mb-6 font-outfit font-medium text-[32px] leading-[140%] text-foreground"
      >
        <h3>{quest?.quest_title}</h3>
      </Typography>

      <div className="flex flex-col justify-between gap-2.5 md:flex-row mb-6">
        <Typography
          level="body2"
          className="md:flex-1 font-outfit font-light text-[16px] leading-[140%] text-foreground/80"
        >
          {quest?.quest_description}
        </Typography>

        <Typography level="body2" className="font-medium lg:hidden">
          Total:{' '}
          <span className="text-2xl font-bold">
            {formatNumber(quest?.total_betting_amount ?? 0, {
              minimumFractionDigits: 0,
            })}{' '}
            {symbol}
          </span>
        </Typography>
      </div>

      {!!lg && (
        <div
          className="flex items-center justify-between"
          style={{ width: '336px' }}
        >
          <Badge
            variant="filled"
            className={`
    flex justify-center items-center
    text-[13px] font-normal leading-[100%]
    rounded-[10px] py-1 px-3
    border-none
    ${status === 'in-progress' ? 'text-[#00C21D]' : 'text-[#FF0000]'}
  `}
            style={{
              width: '95px',
              height: '28px',
              backgroundColor:
                status === 'in-progress' ? '#00C21D1A' : '#FF00001A',
              fontFamily: 'Poppins',
            }}
          >
            {status === 'in-progress' ? 'In Progress' : 'Close'}
          </Badge>

          <Typography
            level="body1"
            className="text-sm font-normal leading-[100%] text-right text-foreground font-[Poppins]"
          >
            {dayjs(quest?.quest_end_date ?? '').format('YYYY/MM/DD - hh:mm:ss A')}
          </Typography>
        </div>
      )}
    </div>
  );
};
