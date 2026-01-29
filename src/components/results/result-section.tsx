'use client';

import { ActionButtonList } from '@/components/layouts/action-button-list';
import { ResultList } from '@/components/results/result-list';

export function ResultSection() {
  return (
    <div className="bg-background pb-10">
      <ActionButtonList title="Result List" />
      <ResultList />
    </div>
  );
}
