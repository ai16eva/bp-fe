import { Typography } from '@/components/ui/typography';
import { useGetTokenInfoSolana } from '@/hooks/use-get-token-info-solana';
import { Env } from '@/libs/Env';
import type { QuestDetail } from '@/types/schema';
import { formatNumber } from '@/utils/number';

export const VoteTab = ({ quest }: { quest: QuestDetail }) => {
  // Sort answers by answer_key to maintain consistent order (option 1 before option 2)
  const sortedAnswers = [...quest.answers].sort((a, b) =>
    String(a.answer_key).localeCompare(String(b.answer_key))
  );

  return (
    <div className="w-full space-y-4">
      {sortedAnswers.map((answer) => {
        const percent =
          quest.total_betting_amount > 0
            ? (answer.total_betting_amount * 100) / quest.total_betting_amount
            : 0;

        return (
          <VoteItem
            key={answer.answer_key}
            option={answer.answer_title}
            tokenAddress={
              quest.quest_betting_token_address ||
              Env.NEXT_PUBLIC_BETTING_TOKEN_ADDRESS
            }
            amount={answer.total_betting_amount}
            percent={percent}
          />
        );
      })}
    </div>
  );
};

export const VoteItem = ({
  option,
  amount,
  percent,
  tokenAddress,
}: {
  option: string;
  amount: string | number;
  percent: string | number;
  tokenAddress: string;
}) => {
  const { symbol } = useGetTokenInfoSolana(tokenAddress);

  return (
    <div>
      <div className="mb-1 mt-10 flex items-center justify-between gap-2">
        <Typography
          level="h5"
          className="mb-2 text-sm font-normal leading-[100%] text-white"
          style={{ fontFamily: 'Poppins' }}
        >
          {option}
        </Typography>
        <div className="flex flex-wrap items-center justify-end gap-1">
          <Typography level="h6" className="font-medium">
            {formatNumber(Number(percent), {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}
            %
          </Typography>
          <Typography level="h6" className="text-nowrap font-medium">
            (
            {formatNumber(Number(amount), {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}{' '}
            {symbol} )
          </Typography>
        </div>
      </div>
      <div
        className="relative w-full h-2.5 rounded-[20px] overflow-hidden"
        style={{ backgroundColor: '#006FBC1F' }}
      >
        <div
          className="h-full rounded-[20px] transition-all"
          style={{
            width: `${percent}%`,
            background:
              'linear-gradient(256.17deg, #149FFF -0.9%, #035288 100%)',
          }}
        />
      </div>
    </div>
  );
};
