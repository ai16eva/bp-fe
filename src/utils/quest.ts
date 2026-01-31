import dayjs from 'dayjs';

import { Env } from '@/libs/Env';
import type {
  DAOQuestAnswer,
  DAOQuestCategory,
  DAOQuestDraft,
  DAOQuestSuccess,
} from '@/types/schema';

export const extractDAOQuest = (
  quest: DAOQuestDraft | DAOQuestSuccess | DAOQuestAnswer,
  status: DAOQuestCategory,
  maxDraftVote: number,
) => {
  const startAtMapping = {
    draft: (quest as DAOQuestDraft).dao_draft_start_at,
    success: (quest as DAOQuestSuccess).dao_success_start_at,
    answer: (quest as DAOQuestAnswer).dao_answer_start_at,
  };

  const startAt = startAtMapping[status];

  const endAtMapping = {
    draft: (quest as DAOQuestDraft).dao_draft_end_at,
    success: (quest as DAOQuestSuccess).dao_success_end_at,
    answer: (quest as DAOQuestAnswer).dao_answer_end_at,
  };

  let endAt = endAtMapping[status];

  if (endAt && startAt && dayjs(endAt).diff(dayjs(startAt), 'minute') < 5) {
    endAt = dayjs(startAt).add(24, 'hour').toISOString();
  }

  const voteCountsMapping = {
    draft: {
      posVote: (quest as DAOQuestDraft).total_approve_power,
      negVote: (quest as DAOQuestDraft).total_reject_power,
      total: (quest as DAOQuestDraft).total_vote,
    },
    success: {
      posVote: (quest as DAOQuestSuccess).total_success_power,
      negVote: (quest as DAOQuestSuccess).total_adjourn_power,
      total: (quest as DAOQuestSuccess).total_vote,
    },
    answer: {
      posVote: 0,
      negVote: 0,
      total: (quest as DAOQuestAnswer).answers.reduce(
        (prev, curr) => prev + curr.total_answer_vote_power,
        0,
      ),
    },
  };

  const { posVote, negVote, total: totalVote } = voteCountsMapping[status];

  const maxVoteMapping = {
    draft: Number(maxDraftVote ?? 0),
    success: voteCountsMapping.draft.total,
    answer: voteCountsMapping.success.total,
  };

  const maxVote = maxVoteMapping[status];

  const isDraftEnd = endAtMapping.draft
    ? dayjs(endAtMapping.draft).isBefore(dayjs())
    : false;

  const isEndTime = endAt && dayjs(endAt).isBefore(dayjs());

  const isEnded = isEndTime || (status === 'draft' && totalVote >= maxVote);

  return {
    startAt,
    endAt,
    posVote,
    negVote,
    totalVote,
    canDraftVote: totalVote < maxVote && !isEndTime,
    canSuccessVote: totalVote < maxVote && !isEndTime,
    canAnswerVote: totalVote < maxVote && !isEndTime,
    isEndTime,
    isEnded,
    isDraftEnd,
  };
};

export const getQuestUrl = (key: string) =>
  `${Env.NEXT_PUBLIC_FE_URL}/quests/${key}`;
