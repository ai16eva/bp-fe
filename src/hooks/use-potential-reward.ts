import { useMemo } from 'react';

import type { QuestDetail } from '@/types/schema';
import { calculatePotentialReward } from '@/utils/bet-calculator';

export const usePotentialReward = (
  quest: QuestDetail | undefined,
  selectedAnswerKey: string,
  betAmount: number,
) => {
  return useMemo(() => {
    if (!quest || !selectedAnswerKey || !betAmount) {
      return 0;
    }

    return calculatePotentialReward(quest, selectedAnswerKey, betAmount);
  }, [quest, selectedAnswerKey, betAmount]);
};
