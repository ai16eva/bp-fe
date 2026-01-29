'use client';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Typography } from '@/components/ui/typography';
import { useFilterAdminQuests } from '@/hooks/use-dao-quests';

import { withAdmin } from '../with-admin';
import { AdminTable } from './data-table';

export type GameType = {
  no: string;
  category: string;
  title: string;
  questEndDate: string;
  questStatus: string;
  answerPending: string;
  questPending: string;
};

const questStatusOptions = [
  { name: 'ONGOING', value: 'ongoing' },
  { name: 'DRAFT', value: 'draft' },
  { name: 'PUBLISH', value: 'publish' },
  { name: 'DECISION', value: 'decision' },
  { name: 'SUCCESS', value: 'success' },
  { name: 'ANSWER', value: 'answer' },
  { name: 'ADJOURN', value: 'adjourn' },
  // { name: 'ONGOING', value: 'adjourn' },
];

export default withAdmin(() => {
  const { status, setStatus } = useFilterAdminQuests();

  return (
    <div className="overflow-hidden rounded-8 bg-background px-12 shadow-light dark:bg-[#1A1825] dark:shadow-none dark:border dark:border-[#2E2C3D]">
      <div className="flex py-10">
        <div className="flex items-center gap-6">
          <Typography level="h4" className="text-foreground dark:text-white">BOOM PLAY VOTES:</Typography>
        </div>
        <div className="flex flex-1 items-center justify-end">
          <ToggleGroup
            value={status}
            onValueChange={val => setStatus(val as any)}
            type="single"
            className="gap-4"
          >
            {questStatusOptions.map(option => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                variant="outline"
                className="rounded-lg px-4"
              >
                {option.name}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>

      <AdminTable status={status} />
    </div>
  );
});
