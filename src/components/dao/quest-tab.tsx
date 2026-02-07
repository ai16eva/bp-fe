'use client';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Typography } from '@/components/ui/typography';
import type {
  DAOQuestAnswer,
  DAOQuestDraft,
  DAOQuestSuccess,
} from '@/types/schema';
import { formatNumber } from '@/utils/number';

type QuestTabProps =
  | { status: 'draft'; quest: DAOQuestDraft }
  | { status: 'success'; quest: DAOQuestSuccess }
  | { status: 'answer'; quest: DAOQuestAnswer };

export const QuestTab = ({ status, quest }: QuestTabProps) => {
  // Sort answers by answer_key to maintain consistent order (option 1 before option 2)
  const sortedAnswers = [...quest.answers].sort((a, b) =>
    String(a.answer_key).localeCompare(String(b.answer_key)),
  );

  const totalQuestBetting = sortedAnswers.reduce((sum, answer) => {
    const bettingAmount = Number(
      (answer as { total_betting_amount?: number }).total_betting_amount,
    );

    return sum + (Number.isFinite(bettingAmount) ? bettingAmount : 0);
  }, 0);

  return (
    <ScrollArea className="h-[126px]">
      {sortedAnswers.map((answer, index) => {
        const amount = Number(
          (answer as { total_betting_amount?: number }).total_betting_amount,
        ) || 0;
        const percent = totalQuestBetting > 0 ? (amount * 100) / totalQuestBetting : 0;

        return (
          <div className="mb-2" key={answer.answer_key}>
            <div className="flex items-center justify-between">
              <Typography
                level="body2"
                className="font-medium text-foreground-70"
              >
                {index + 1}
                .
                {answer.answer_title}
              </Typography>

              {(status === 'success' || status === 'answer') && (
                <div className="flex items-center gap-1">
                  <Typography
                    level="body2"
                    className="font-medium text-foreground-70"
                  >
                    {formatNumber(amount, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}
                  </Typography>
                  <Badge>
                    {formatNumber(percent, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}
                    %
                  </Badge>
                </div>
              )}
            </div>
            <Progress
              className="mt-1 h-1.5 rounded-[20px] bg-[#006FBC1F] [&>div]:rounded-[20px] [&>div]:bg-[#006FBC]"
              value={status === 'draft' ? 0 : (totalQuestBetting > 0 ? percent : 100)}
            />
          </div>
        );
      })}
    </ScrollArea>
  );
};
