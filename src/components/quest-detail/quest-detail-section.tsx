'use client';

import { notFound, useParams } from 'next/navigation';

import { QuestDetailBody } from '@/components/quest-detail/quest-detail-body';
import { Skeleton } from '@/components/ui/skeleton';
import { useFetchQuest } from '@/hooks/use-quest';

export function QuestDetailSection() {
  const { questId } = useParams<{ questId: string }>();
  const { data, isLoading, error } = useFetchQuest(questId);

  const quest = data?.data;

  if (isLoading) {
    return <QuestDetailSkeleton />;
  }

  if (error || !quest) {
    return notFound();
  }

  if (!['PUBLISH', 'DAO_SUCCESS', 'FINISH'].includes(quest.quest_status)) {
    return notFound();
  }

  return (<QuestDetailBody quest={quest} />);
}

const QuestDetailSkeleton = () => {
  return (
    <div className="w-full space-y-6 p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-6 w-40" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      <div className="space-y-4 rounded-lg border p-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/4" />
      </div>

      <div className="flex space-x-4">
        <div className="w-1/2 space-y-2">
          <Skeleton className="h-6 w-1/3" />
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="aspect-square w-1/2">
          <Skeleton className="size-full rounded-lg" />
        </div>
      </div>
    </div>
  );
};
