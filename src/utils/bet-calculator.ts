import dayjs from 'dayjs';

import type { QuestDetail } from '@/types/schema';

export const calculatePotentialReward = (
  quest: QuestDetail,
  answerKey: string,
  betAmount: number,
): number => {
  const selectedAnswer = quest.answers.find(
    anw => anw.answer_key === answerKey,
  );

  if (!selectedAnswer) {
    return 0;
  }

  const userInputAmount = Number(betAmount);
  const totalAmount = Number(quest.total_betting_amount) + userInputAmount;
  const selectedAnswerAmount = selectedAnswer.total_betting_amount;

  if (
    totalAmount === 0
    || totalAmount < selectedAnswerAmount + userInputAmount
  ) {
    return 0;
  }

  const serviceFee = (totalAmount * Number(quest.season.service_fee)) / 100;
  const creatorFee = (totalAmount * Number(quest.season.creator_fee)) / 100;
  const charityFee = (totalAmount * Number(quest.season.charity_fee)) / 100;

  const rewardPool = totalAmount - serviceFee - creatorFee - charityFee;
  const multiplier
    = rewardPool / (userInputAmount + Number(selectedAnswerAmount));
  const potentialReward = multiplier * userInputAmount;

  return potentialReward;
};

export const getMinimumBet = (token: 'BOOM' | 'USDT'): number => {
  return token === 'BOOM' ? 1 : 1;
};

export const isQuestEnded = (quest: QuestDetail | undefined): boolean => {
  if (!quest) {
    return false;
  }

  return (
    (!!quest.quest_finish_datetime
      && dayjs(quest.quest_finish_datetime).isBefore(dayjs()))
    || (!!quest.quest_end_date && dayjs(quest.quest_end_date).isBefore(dayjs()))
  );
};
