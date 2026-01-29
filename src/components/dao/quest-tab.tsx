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

type QuestTabProps =
  | { status: 'draft'; quest: DAOQuestDraft }
  | { status: 'success'; quest: DAOQuestSuccess }
  | { status: 'answer'; quest: DAOQuestAnswer };

export const QuestTab = ({ status, quest }: QuestTabProps) => {
  // Sort answers by answer_key to maintain consistent order (option 1 before option 2)
  const sortedAnswers = [...quest.answers].sort((a, b) =>
    String(a.answer_key).localeCompare(String(b.answer_key))
  );

  return (
    <ScrollArea className="h-[126px]">
      {sortedAnswers.map((answer, index) => (
        <div className="mb-2" key={answer.answer_key}>
          <div className="flex items-center justify-between">
            <Typography
              level="body2"
              className="font-medium text-foreground-70"
            >
              {index + 1}.{answer.answer_title}
            </Typography>

            {(status === 'success' || status === 'answer') && (
              <div className="flex items-center gap-1">
                <Typography
                  level="body2"
                  className="font-medium text-foreground-70"
                >
                  0
                </Typography>
                <Badge>0%</Badge>
              </div>
            )}
          </div>
          <Progress
            className="mt-1 h-1.5 bg-[#006FBC1F] rounded-[20px] [&>div]:bg-[#006FBC] [&>div]:rounded-[20px]"
            value={status === 'draft' ? 0 : 100}
          />
        </div>
      ))}
    </ScrollArea>
  );
};
