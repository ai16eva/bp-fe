'use client';

import { now, parseToKST } from '@/utils/timezone';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Typography } from '@/components/ui/typography';
import { useGetGovernanceConfig } from '@/hooks/use-get-govermance-config';
import { usePrivyWallet } from '@/hooks/use-privy-wallet';
import { useToast } from '@/hooks/use-toast';
import { useVoteAnswer } from '@/hooks/use-vote-answer';
import { useVoteDraft } from '@/hooks/use-vote-draft';
import { useVoteSuccess } from '@/hooks/use-vote-success';
// import { useClaimReward } from '@/hooks/use-claim-reward';
// import { useTreasuryBalance } from '@/hooks/use-treasury-balance';
import type {
  DAOQuestAnswer,
  DAOQuestDraft,
  DAOQuestSuccess,
  VoteDraftOption,
  VoteSuccessOption,
} from '@/types/schema';
import { formatNumber } from '@/utils/number';
import { extractDAOQuest } from '@/utils/quest';

type VotingTabProps =
  | { status: 'draft'; quest: DAOQuestDraft }
  | { status: 'success'; quest: DAOQuestSuccess }
  | { status: 'answer'; quest: DAOQuestAnswer };

export const VotingTab = ({ quest, status }: VotingTabProps) => {
  const { maxVote } = useGetGovernanceConfig();

  const { posVote, negVote, totalVote, endAt, isEnded } = extractDAOQuest(
    quest,
    status,
    maxVote
  );

  let view = null;

  const posVotePer = Number.isNaN(posVote / totalVote)
    ? 0
    : posVote / totalVote;

  const negVotePer = Number.isNaN(negVote / totalVote)
    ? 0
    : negVote / totalVote;

  if (status === 'answer') {
    view = <AnswerActions quest={quest} isEnded={isEnded} />;
  } else {
    view = (
      <div className="flex flex-col gap-6">
        <div className="flex-1">
          <div className="mb-3">
            <div className="mb-1 flex items-center justify-between">
              <Typography
                level="body2"
                className="font-medium text-foreground-70"
              >
                1. Approve
              </Typography>
              <div className="flex items-center gap-1">
                <Typography
                  level="body2"
                  className="font-medium text-foreground-70"
                >
                  {posVote}
                </Typography>
                <Badge>
                  {formatNumber(posVotePer * 100, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}
                  %
                </Badge>
              </div>
            </div>
            <Progress
              value={posVotePer * 100}
              variant="success"
              className="h-1.5 bg-[#006FBC1F] rounded-[20px] [&>div]:bg-[#006FBC] [&>div]:rounded-[20px]"
            />
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <Typography
                level="body2"
                className="font-medium text-foreground-70"
              >
                2. Reject
              </Typography>
              <div className="flex items-center gap-1">
                <Typography
                  level="body2"
                  className="font-medium text-foreground-70"
                >
                  {negVote}
                </Typography>
                <Badge>
                  {formatNumber(negVotePer * 100, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}
                  %
                </Badge>
              </div>
            </div>
            <Progress
              value={negVotePer * 100}
              variant="danger"
              className="h-1.5 bg-[#006FBC1F] rounded-[20px] [&>div]:bg-[#006FBC] [&>div]:rounded-[20px]"
            />
          </div>
        </div>
        {status === 'draft' && <DraftActions quest={quest} maxVote={maxVote} isEnded={isEnded} />}
        {status === 'success' && <SuccessActions quest={quest} isEnded={isEnded} />}
      </div>
    );
  }

  return (
    <>
      <TimeLeft endAt={endAt} />
      {view}
    </>
  );
};

const TimeLeft = ({ endAt }: { endAt: string }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  const calculateTimeLeft = (endAt: string) => {
    const current = now();
    const end = parseToKST(endAt);
    const diff = end.diff(current);
    return formatTimeLeft(diff);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endAt));
    }, 1000);

    return () => clearInterval(timer);
  }, [endAt]);

  return <Typography className="mb-4 h-6 font-medium">{timeLeft}</Typography>;
};

const DraftActions = ({
  quest,
  maxVote,
  isEnded
}: {
  quest: DAOQuestDraft;
  maxVote: number;
  isEnded: boolean;
}) => {
  const { toast } = useToast();
  const { publicKey } = usePrivyWallet();
  const [voteType, setVoteType] = useState<VoteDraftOption | null>(null);

  const { mutate: voteDraft, isPending: isVoting } = useVoteDraft(
    quest,
    maxVote
  );

  const handleAction = (type: VoteDraftOption) => {
    if (!publicKey) {
      toast({
        title: 'Please connect your wallet first',
        variant: 'danger',
      });
      return;
    }

    setVoteType(type);
    voteDraft(type, {
      onSettled: () => setVoteType(null),
    });
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        onClick={() => handleAction('reject')}
        loading={isVoting && voteType === 'reject'}
        variant="outline"
        disabled={isEnded || voteType === 'approve'}
        className="flex-1 h-12 px-6 py-3.5 rounded-xl bg-[#F0F0F0] dark:bg-[#F6F6F61A] border-none text-foreground"
      >
        Reject
      </Button>
      <Button
        onClick={() => handleAction('approve')}
        loading={isVoting && voteType === 'approve'}
        variant="outline"
        disabled={isEnded || voteType === 'reject'}
        className="flex-1 h-12 px-6 py-3.5 rounded-xl bg-[#0089E9] border-none text-white"
      >
        Approve
      </Button>
    </div>
  );
};

const SuccessActions = ({
  quest,
  isEnded,
}: {
  quest: DAOQuestSuccess;
  isEnded: boolean;
}) => {
  const { toast } = useToast();
  const { publicKey } = usePrivyWallet();
  const [voteType, setVoteType] = useState<VoteSuccessOption | null>(null);

  const { mutate: voteSuccess, isPending: isVoting } = useVoteSuccess(quest);

  const handleAction = (type: VoteSuccessOption) => {
    if (!publicKey) {
      toast({
        title: 'Please connect your wallet first',
        variant: 'danger',
      });
      return;
    }

    setVoteType(type);
    voteSuccess(type, {
      onSettled: () => setVoteType(null),
    });
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        onClick={() => handleAction('adjourn')}
        loading={isVoting && voteType === 'adjourn'}
        variant="outline"
        disabled={isEnded || voteType === 'success'}
        className="flex-1 h-12 px-6 py-3.5 rounded-xl bg-[#F0F0F0] dark:bg-[#F6F6F61A] border-none text-foreground"
      >
        Adjourn
      </Button>
      <Button
        onClick={() => handleAction('success')}
        loading={isVoting && voteType === 'success'}
        variant="outline"
        disabled={isEnded || voteType === 'adjourn'}
        className="flex-1 h-12 px-6 py-3.5 rounded-xl bg-[#0089E9] border-none text-white"
      >
        Success
      </Button>
    </div>
  );
};

const AnswerActions = ({
  quest,
  isEnded
}: {
  quest: DAOQuestAnswer;
  isEnded: boolean;
}) => {
  const { toast } = useToast();
  const { publicKey } = usePrivyWallet();
  const [answer, setAnswer] = useState('');

  const { mutate: voteAnswerMutation, isPending: isVoting } =
    useVoteAnswer(quest);

  const totalAnswerVotes = quest.answers.reduce(
    (acc, curr) => acc + (curr.total_answer_vote_power || 0),
    0
  );

  const handleAction = () => {
    if (!publicKey) {
      toast({
        title: 'Please connect your wallet first',
        variant: 'danger',
      });
      return;
    }

    if (!answer) {
      toast({
        title: 'Please choose your answer',
        variant: 'danger',
      });
      return;
    }

    voteAnswerMutation(answer, {
      onSuccess: () => setAnswer(''),
    });
  };

  const AnswerResults = () => (
    <div className="flex flex-col gap-4 mb-6">
      {[...quest.answers]
        .sort((a, b) =>
          String(a.answer_key).localeCompare(String(b.answer_key))
        )
        .map((ans) => {
          const votePower = ans.total_answer_vote_power || 0;
          const percentage =
            totalAnswerVotes > 0 ? votePower / totalAnswerVotes : 0;

          return (
            <div key={ans.answer_key}>
              <div className="mb-1 flex items-center justify-between">
                <Typography
                  level="body2"
                  className="font-medium text-foreground-70"
                >
                  {ans.answer_title}
                </Typography>
                <div className="flex items-center gap-1">
                  <Typography
                    level="body2"
                    className="font-medium text-foreground-70"
                  >
                    {votePower}
                  </Typography>
                  <Badge>
                    {formatNumber(percentage * 100, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}
                    %
                  </Badge>
                </div>
              </div>
              <Progress
                value={percentage * 100}
                variant="success" // Using success variant for positive indication
                className="h-1.5 bg-[#006FBC1F] rounded-[20px] [&>div]:bg-[#006FBC] [&>div]:rounded-[20px]"
              />
            </div>
          );
        })}
    </div>
  );

  if (isEnded) {
    // return <ClaimActions quest={quest} />;
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <AnswerResults />

      <div className="space-y-2">
        <Select value={answer} onValueChange={setAnswer}>
          <SelectTrigger>
            <SelectValue placeholder="Please choose your answer" />
          </SelectTrigger>
          <SelectContent>
            {[...quest.answers].sort((a, b) =>
              String(a.answer_key).localeCompare(String(b.answer_key))
            ).map((answer) => (
              <SelectItem key={answer.answer_key} value={answer.answer_key}>
                {answer.answer_title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Typography>Please choose your answer in here.</Typography>
      </div>

      <div className="flex items-center gap-4">
        <Button
          loading={isVoting}
          onClick={handleAction}
          disabled={!answer || isEnded}
          variant="outline"
          className="flex-1 h-12 px-6 py-3.5 rounded-xl bg-[#0089E9] border-none text-white"
        >
          Approve
        </Button>
      </div>
    </div>
  );
};

// const ClaimActions = ({ quest }: { quest: DAOQuestAnswer }) => {
//   const { data: configDetails, reward } = useGetGovernanceConfig();
//   const { data: treasuryBalance } = useTreasuryBalance();
//   const { mutate: claimReward, isPending: isClaiming } = useClaimReward(
//     String(quest.quest_key)
//   );

//   const rewardBN = configDetails?.rawConfig?.constantRewardToken;

//   // Check if treasury has enough balance for the reward (using BN comparison)
//   const canClaim = treasuryBalance && rewardBN
//     ? treasuryBalance.gte(rewardBN)
//     : false;

//   if (!canClaim) {
//     return (
//       <div className="flex items-center justify-center p-4 rounded-xl bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400">
//         <Typography>Reward pool is currently empty.</Typography>
//       </div>
//     );
//     // Alternatively, return null to completely hide it as requested:
//     // return null;
//   }

//   return (
//     <div className="flex items-center gap-4">
//       <Button
//         onClick={() => claimReward()}
//         loading={isClaiming}
//         className="flex-1 h-12 px-6 py-3.5 rounded-xl bg-[#00C853] hover:bg-[#00E676] border-none text-white"
//       >
//         Claim Reward ({reward} BOOM)
//       </Button>
//     </div>
//   );
// };

const formatTimeLeft = (diff: number): string => {
  if (diff <= 0) {
    return '';
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hrs = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  const timeString = `${hrs.toString().padStart(2, '0')}:${mins
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return `${days > 0 ? `${days}d ` : ''}${timeString}s will be close this vote.`;
};
