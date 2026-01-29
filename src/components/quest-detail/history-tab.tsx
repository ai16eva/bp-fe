
import { Typography } from '@/components/ui/typography';
import { useGetTokenInfoSolana } from '@/hooks/use-get-token-info-solana';
import { useFetchQuestBettings } from '@/hooks/use-quest';
import { Env } from '@/libs/Env';
import type { QuestDetail } from '@/types/schema';
import { formatNumber } from '@/utils/number';
import {
  getExplorerUrl,
  maskWalletAddress,
  truncateSignature,
} from '@/utils/wallet';

import { Skeleton } from '../ui/skeleton';

export const HistoryTab = ({ quest }: { quest: QuestDetail }) => {
  const { data, isFetching } = useFetchQuestBettings(quest.quest_key);
  const tokenAddress = quest.quest_betting_token_address || Env.NEXT_PUBLIC_BETTING_TOKEN_ADDRESS;
  const { symbol } = useGetTokenInfoSolana(tokenAddress);

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="min-w-[600px] space-y-4">
        {isFetching
          ? (
            <>
              {[...Array(8)].map((_, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between border-b border-brand pb-3"
                >
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </>
          )
          : (
            data?.data?.map((betting) => {
              const answer = quest.answers.find(
                ans => ans.answer_key === String(betting.answer_key),
              );
              if (!answer) {
                return null;
              }

              return (
                <HistoryItem
                  key={betting.betting_key}
                  better={betting.betting_address}
                  answer={answer.answer_title}
                  bettingTx={betting.betting_tx ?? ''}
                  bettingAmount={betting.betting_amount}
                  symbol={symbol}
                />
              );
            })
          )}
      </div>
    </div>
  );
};

type HistoryItemProps = {
  better: string;
  answer: string;
  bettingTx: string;
  bettingAmount: string | number;
  symbol: string;
};

const HistoryItem = ({
  better,
  answer,
  bettingTx,
  bettingAmount,
  symbol,
}: HistoryItemProps) => {
  return (
    <div className="flex items-start justify-between border-b border-brand pb-4">
      <div className="flex flex-1 items-center gap-2">
        <a target="_blank" href={getExplorerUrl('address', better)}>
          <Typography
            level="h5"
            className="text-brand underline underline-offset-4"
            asChild
          >
            <span>{maskWalletAddress(better)}</span>
          </Typography>
        </a>
        <Typography level="h5" asChild className="font-medium">
          <span>voting for:</span>
        </Typography>
        <Typography level="h5" asChild>
          <span>{answer}</span>
        </Typography>
      </div>

      <div className="flex flex-col items-end">
        <a target="_blank" href={getExplorerUrl('tx', bettingTx)}>
          <Typography level="h5" className="font-medium text-brand">
            {truncateSignature(bettingTx ?? '')}
          </Typography>
        </a>
        <div className="flex items-center gap-2">
          <Typography level="h5" className="font-medium">
            {answer}
            {' '}
            :
            {' '}
            {formatNumber(Number(bettingAmount), { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {symbol}
          </Typography>
        </div>
      </div>
    </div>
  );
};
