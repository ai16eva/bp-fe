import { useQueryClient } from '@tanstack/react-query';
import type { RowSelectionState, Table } from '@tanstack/react-table';
import { useMemo } from 'react';

import { appQueryKeys } from '@/config/query';
import {
  useAdminAdjournQuestMutation,
  useAdminCancelDraftQuestMutation,
  useAdminFinishQuestMutation,
  useAdminForceDraftEndMutation,
  useAdminForceSuccessEndMutation,
  useAdminMakeDaoSuccessMutation,
  useAdminMakeDraftQuestMutation,
  useAdminPublishQuestMutation,
  useAdminSetDAOAnswerMutation,
  useAdminSetDaoSuccessMutation,
  useAdminSetDraftQuestMutation,
  useAdminSetHotQuestSuccessMutation,
  useAdminSetQuestSuccessMutation,
  useAdminStartDAOSuccessQuestMutation,
} from '@/hooks/use-dao-quests';
import { useToast } from '@/hooks/use-toast';
// import { Env } from "@/libs/Env";
import type {
  AdminAnswerQuest,
  AdminDecisionQuest,
  AdminDraftQuest,
  AdminPubishQuest,
  AdminQuestStatus,
  BaseAdminQuest,
} from '@/types/schema';
import { now, parseToKST } from '@/utils/timezone';

import { Button } from '../ui/button';

export const TableActions = ({
  table,
  status,
  rowSelection,
}: {
  table: Table<BaseAdminQuest>;
  status: AdminQuestStatus;
  rowSelection: RowSelectionState;
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const row = useMemo(() => {
    return table.getFilteredSelectedRowModel().rows?.[0]?.original;
  }, [rowSelection, table]);

  const invalidateQuestQueries = () => {
    queryClient.invalidateQueries({
      queryKey: [...appQueryKeys.dao.root].filter(Boolean),
    });

    table.resetRowSelection();
  };

  const handleError = (error: any) => {
    console.error(error);
    const errorMessage
      = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Unknown error';

    // Parse common error messages for better UX
    let userFriendlyMessage = errorMessage;
    let actionHint = '';

    if (errorMessage.includes('Draft result is not Approved') || errorMessage.includes('Draft result is not approved')) {
      userFriendlyMessage = 'Draft result is not approved.';
      actionHint = 'Please go to DRAFT tab and make draft result first, then come back to PUBLISH tab to start DAO success.';
    } else if (errorMessage.includes('Draft period has not ended yet')) {
      userFriendlyMessage = 'Draft period has not ended yet.';
      actionHint = 'Please wait for draft period to end or force end draft period in DRAFT tab.';
    } else if (errorMessage.includes('Governance item does not exist')) {
      userFriendlyMessage = 'Governance item does not exist.';
      actionHint = 'Please create governance item first.';
    } else if (errorMessage.includes('Cannot start decision')) {
      // Parse the detailed message
      if (errorMessage.includes('Please end draft')) {
        userFriendlyMessage = 'Cannot start decision: Draft period has not ended.';
        actionHint = 'Please go to DRAFT tab and end draft period, then make draft result.';
      } else if (errorMessage.includes('make draft result')) {
        userFriendlyMessage = 'Cannot start decision: Draft result is not approved.';
        actionHint = 'Please go to DRAFT tab and make draft result first.';
      } else {
        userFriendlyMessage = errorMessage;
      }
    }

    toast({
      title: 'Oops! Something went wrong',
      description: actionHint ? `${userFriendlyMessage} ${actionHint}` : userFriendlyMessage,
      variant: 'danger',
    });
  };

  const createMutation = (mutateFn: any, successMessage: string) => {
    return mutateFn({
      mutationKey: [],
      onSuccess: () => {
        toast({ title: successMessage });
        invalidateQuestQueries();
      },
      onError: handleError,
    });
  };

  const { mutate: setDraftQuest, isPending: isSettingDraft } = createMutation(
    useAdminSetDraftQuestMutation,
    'Draft quest set successfully',
  );

  const { mutate: cancelDraftQuest, isPending: isCancelingDraft }
    = createMutation(useAdminCancelDraftQuestMutation, 'Draft quest canceled');

  const { mutate: publishQuest, isPending: isPublishingQuest } = createMutation(
    useAdminPublishQuestMutation,
    'Quest published successfully',
  );

  const { mutate: makeDraftQuest, isPending: isMakingDraftQuest }
    = createMutation(
      useAdminMakeDraftQuestMutation,
      'Draft quest updated successfully',
    );

  const { mutate: finishQuest, isPending: isFinishingQuest } = createMutation(
    useAdminFinishQuestMutation,
    'Quest marked as finished',
  );

  const { mutate: startDaoSuccess, isPending: isStartingDaoSuccess } = createMutation(
    useAdminStartDAOSuccessQuestMutation,
    'DAO success started successfully',
  );

  const { mutate: setDaoSuccess, isPending: isSettingDaoSuccess }
    = createMutation(useAdminSetDaoSuccessMutation, 'DAO success set');

  const { mutate: adjournQuest, isPending: isAdjourning } = createMutation(
    useAdminAdjournQuestMutation,
    'Quest adjourned',
  );

  const { mutate: makeDaoSuccess, isPending: isMakingDaoSuccess }
    = createMutation(useAdminMakeDaoSuccessMutation, 'DAO success made');

  const { mutate: setAnswer, isPending: isSettingAnswer } = createMutation(
    useAdminSetDAOAnswerMutation,
    'Answer set successfully',
  );

  const { mutate: setSuccessQuest, isPending: isSettingSuccessQuest }
    = createMutation(useAdminSetQuestSuccessMutation, 'Answer set successfully');

  // ongoing
  const { mutate: adminSetHotQuest, isPending: isHotSetting }
    = useAdminSetHotQuestSuccessMutation({
      mutationKey: [],
      onSuccess: () => {
        toast({
          title: 'Update Quest Successfully',
          variant: 'success',
        });

        queryClient.invalidateQueries({
          queryKey: [...appQueryKeys.dao.root, status].filter(Boolean),
        });

        table.resetRowSelection();
      },
      onError: (error) => {
        console.error(error);
        toast({
          title: 'Oops! Something went wrong',
          description: error?.message,
          variant: 'danger',
        });
      },
    });

  const { mutate: forceDraftEnd, isPending: isForcingDraftEnd }
    = createMutation(useAdminForceDraftEndMutation, 'Draft forcibly ended');

  const { mutate: forceSuccessEnd, isPending: isForcingSuccessEnd }
    = createMutation(useAdminForceSuccessEndMutation, 'Success forcibly ended');

  let view: React.ReactNode = null;

  if (status === 'draft') {
    const quest = row as AdminDraftQuest | undefined;

    const isDraftEnded
      = !!quest
      && !!quest.dao_draft_end_at
      && now().isAfter(parseToKST(quest.dao_draft_end_at));

    const hasEnoughVote = quest && quest.total_vote >= 5;

    const isRejected = !!quest && quest.total_reject_power > quest.total_approve_power;

    const canSetDraftEnd
      = !!quest
      && quest.quest_status === 'DRAFT'
      && isDraftEnded
      && hasEnoughVote
      && !isRejected;

    const canPublish = isDraftEnded && quest.quest_status === 'APPROVE';

    const canForceDraft
      = !!quest && quest.total_approve_power === quest.total_reject_power;
    const canForceDraftEndNow = !!quest && quest.total_vote >= 5 && quest.quest_status === 'DRAFT';

    view = (
      <>
        <Button
          disabled={
            table.getFilteredSelectedRowModel().rows.length === 0
            || isCancelingDraft
            || isPublishingQuest
            || !canSetDraftEnd
          }
          onClick={() => {
            const row = table.getFilteredSelectedRowModel().rows?.[0];
            if (row && row.original) {
              if (canForceDraft) {
                makeDraftQuest(row.original.quest_key);
              } else {
                setDraftQuest(row.original.quest_key);
              }
            }
          }}
          loading={isSettingDraft || isMakingDraftQuest}
        >
          Set Draft Result
        </Button>
        <Button
          disabled={
            table.getFilteredSelectedRowModel().rows.length === 0
            || isSettingDraft
            || isMakingDraftQuest
            || isCancelingDraft
            || !canPublish
          }
          loading={isPublishingQuest}
          onClick={() => {
            const row = table.getFilteredSelectedRowModel().rows?.[0];
            if (row && row.original) {
              publishQuest(row.original.quest_key);
            }
          }}
        >
          Publish
        </Button>
        <Button
          disabled={
            table.getFilteredSelectedRowModel().rows.length === 0
            || isSettingDraft
            || isMakingDraftQuest
            || isPublishingQuest
          }
          loading={isCancelingDraft}
          onClick={() => {
            const row = table.getFilteredSelectedRowModel().rows?.[0];
            if (row && row.original) {
              cancelDraftQuest(row.original.quest_key);
            }
          }}
        >
          Reject
        </Button>
        {/* {Env.NEXT_PUBLIC_NETWORK === 'testnet' && (
          <Button
            disabled={table.getFilteredSelectedRowModel().rows.length === 0}
            loading={isForcingDraftEnd}
            onClick={() => {
              const row = table.getFilteredSelectedRowModel().rows?.[0];
              if (row && row.original) {
                forceDraftEnd(row.original.quest_key);
              }
            }}
          >
            Force End (For test)
          </Button>
        )} */}
        <Button
          disabled={
            table.getFilteredSelectedRowModel().rows.length === 0
            || !canForceDraftEndNow
          }
          loading={isForcingDraftEnd}
          onClick={() => {
            const row = table.getFilteredSelectedRowModel().rows?.[0];
            if (row && row.original) {
              forceDraftEnd(row.original.quest_key);
            }
          }}
        >
          Force End (For test)
        </Button>
      </>
    );
  } else if (status === 'publish') {
    const quest = row as AdminPubishQuest | undefined;
    const canFinish = quest && quest.quest_status === 'PUBLISH';
    const canStartDAOSuccess = quest && quest.quest_status === 'FINISH';

    view = (
      <>
        <Button
          disabled={
            table.getFilteredSelectedRowModel().rows.length === 0
            || isStartingDaoSuccess
            || !canFinish
          }
          onClick={() => {
            const row = table.getFilteredSelectedRowModel().rows?.[0];
            if (row && row.original) {
              finishQuest(row.original.quest_key);
            }
          }}
          loading={isFinishingQuest}
        >
          Finish
        </Button>

        <Button
          disabled={
            table.getFilteredSelectedRowModel().rows.length === 0
            || isFinishingQuest
            || !canStartDAOSuccess
          }
          onClick={() => {
            const row = table.getFilteredSelectedRowModel().rows?.[0];
            if (row && row.original) {
              startDaoSuccess(row.original.quest_key);
            }
          }}
          loading={isStartingDaoSuccess}
        >
          Start DAO Success
        </Button>
      </>
    );
  } else if (status === 'decision') {
    const quest = row as AdminDecisionQuest | undefined;

    const isSuccessEnded
      = !!quest
      && !!quest.dao_success_end_at
      && now().isAfter(parseToKST(quest.dao_success_end_at));

    const hasEnoughVote = quest && quest.total_vote >= 5;

    const canSetDecision
      = isSuccessEnded && hasEnoughVote && quest.quest_status === 'FINISH';
    const canSetAdjourn = quest && quest.quest_status === 'FINISH';
    const canForceSuccessEndNow = !!quest && quest.total_vote >= 5;

    view = (
      <>
        <Button
          disabled={
            table.getFilteredSelectedRowModel().rows.length === 0
            || isAdjourning
            || !canSetDecision
          }
          onClick={() => {
            const row = table.getFilteredSelectedRowModel().rows?.[0];

            if (!row || !row.original) {
              return;
            }

            const quest = row.original as AdminDecisionQuest;

            if (quest.total_adjourn_power === quest.total_success_power) {
              makeDaoSuccess(row.original.quest_key);
              return;
            }

            setDaoSuccess(row.original.quest_key);
          }}
          loading={isSettingDaoSuccess || isMakingDaoSuccess}
        >
          Set Decision
        </Button>

        <Button
          disabled={
            table.getFilteredSelectedRowModel().rows.length === 0
            || isSettingDaoSuccess
            || isMakingDaoSuccess
            || !canSetAdjourn
          }
          onClick={() => {
            const row = table.getFilteredSelectedRowModel().rows?.[0];
            if (row && row.original) {
              adjournQuest(row.original.quest_key);
            }
          }}
          loading={isAdjourning}
        >
          Adjourn
        </Button>
        {/* {Env.NEXT_PUBLIC_NETWORK === "testnet" && (
          <Button
            disabled={table.getFilteredSelectedRowModel().rows.length === 0}
            loading={isForcingSuccessEnd}
            onClick={() => {
              const row = table.getFilteredSelectedRowModel().rows?.[0];
              if (row && row.original) {
                forceSuccessEnd(row.original.quest_key);
              }
            }}
          >
            Force End (For test)
          </Button>
        )} */}
        <Button
          disabled={
            table.getFilteredSelectedRowModel().rows.length === 0
            || !canForceSuccessEndNow
          }
          loading={isForcingSuccessEnd}
          onClick={() => {
            const row = table.getFilteredSelectedRowModel().rows?.[0];
            if (row && row.original) {
              forceSuccessEnd(row.original.quest_key);
            }
          }}
        >
          Force End (For test)
        </Button>
      </>
    );
  } else if (status === 'answer') {
    const quest = row as AdminAnswerQuest | undefined;

    const hasEnoughVote = quest && quest.total_vote >= 5;

    const canSetAnswer
      = hasEnoughVote
      && quest.quest_status === 'DAO_SUCCESS'
      && !quest.answer_selected;

    const canSetSuccess
      = quest && quest.quest_status === 'DAO_SUCCESS' && !!quest.answer_selected;

    view = (
      <>
        <Button
          disabled={
            table.getFilteredSelectedRowModel().rows.length === 0
            || isAdjourning
            || isSettingSuccessQuest
            || !canSetAnswer
          }
          onClick={() => {
            const row = table.getFilteredSelectedRowModel().rows?.[0];
            if (row && row.original) {
              setAnswer(row.original.quest_key);
            }
          }}
          loading={isSettingAnswer}
        >
          Set Answer
        </Button>

        <Button
          disabled={
            table.getFilteredSelectedRowModel().rows.length === 0
            || isSettingAnswer
            || isSettingSuccessQuest
          }
          onClick={() => {
            const row = table.getFilteredSelectedRowModel().rows?.[0];
            if (row && row.original) {
              adjournQuest(row.original.quest_key);
            }
          }}
          loading={isAdjourning}
        >
          Cancel
        </Button>

        <Button
          disabled={
            table.getFilteredSelectedRowModel().rows.length === 0
            || isSettingAnswer
            || isAdjourning
            || !canSetSuccess
          }
          onClick={() => {
            const row = table.getFilteredSelectedRowModel().rows?.[0];
            if (row && row.original) {
              setSuccessQuest(row.original.quest_key);
            }
          }}
          loading={isSettingSuccessQuest}
        >
          Success
        </Button>
      </>
    );
  } else if (status === 'ongoing') {
    view = (
      <Button
        disabled={table.getFilteredSelectedRowModel().rows.length === 0}
        onClick={() => {
          const row = table.getFilteredSelectedRowModel().rows?.[0];
          if (row && row.original) {
            adminSetHotQuest(row.original.quest_key);
          }
        }}
        loading={isHotSetting}
      >
        HOT
      </Button>
    );
  }

  return <div className="mb-8 flex items-center gap-4">{view}</div>;
};
