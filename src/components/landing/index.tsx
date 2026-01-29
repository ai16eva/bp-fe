'use client';

import { ActionButtonList } from '@/components/layouts/action-button-list';
import { QuestList } from '@/components/landing/quest-list';

export const AllQuests = () => {
  return (
    <div className="bg-background pb-10">
      <ActionButtonList />
      <QuestList />
    </div>
  );
};
