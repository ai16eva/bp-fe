import type { QuestDetail } from '@/types/schema';

import { QuestCard } from './quest-card';
import { QuestDetailTabs } from './quest-detail-tabs';
import { QuestInfo } from './quest-info';
import { VoteForm } from './vote-form';

export const QuestDetailBody = ({ quest }: { quest: QuestDetail }) => {
  return (
    <>
      <div className="mb-9 mt-4 bg-background px-6 py-12 md:px-8 lg:px-0">
        <div className="app-container flex flex-col gap-5 px-0 lg:flex-row lg:gap-16">
          <div>
            <QuestCard quest={quest} />
          </div>

          <div className="w-full lg:w-[400px] rounded-[24px] p-5 xl:p-8 space-y-6 bg-black/5 dark:bg-white/[0.04]">
            <QuestInfo quest={quest} />
            <VoteForm quest={quest} />
          </div>
        </div>
      </div>

      <div className="app-container">
        <QuestDetailTabs quest={quest} />
      </div>
    </>
  );
};
