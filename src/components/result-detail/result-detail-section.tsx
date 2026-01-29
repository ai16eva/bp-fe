'use client';

import { notFound, useParams } from 'next/navigation';

import { ResultDetailBody } from '@/components/result-detail/result-detail-body';
import { useFetchQuest } from '@/hooks/use-quest';

export function ResultDetailSection() {
  const { resultId } = useParams<{ resultId: string }>();
  const { data, isLoading, error } = useFetchQuest(resultId);

  const quest = data?.data;

  if (isLoading) {
    return 'loading...';
  }

  if (error || !quest) {
    return notFound();
  }

  return (<ResultDetailBody quest={quest} />);
}
