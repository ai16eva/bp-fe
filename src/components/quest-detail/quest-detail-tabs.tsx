import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { QuestDetail } from '@/types/schema';

import { HistoryTab } from './history-tab';
import { VoteTab } from './vote-tab';

export const QuestDetailTabs = ({ quest }: { quest: QuestDetail }) => {
  return (
    <div className="w-full pb-20 ">
      <Tabs defaultValue="voting">
        <TabsList className="gap-4 bg-transparent">
          <TabsTrigger
            value="voting"
            className="h-9 w-auto min-w-0 rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 py-2 font-outfit text-sm font-normal text-[#F1EBFB]/60 shadow-none ring-0 focus-visible:ring-0 data-[state=active]:border-[#0089E9] data-[state=active]:bg-transparent data-[state=active]:text-[#F1EBFB] lg:h-12 lg:w-[126px] lg:rounded-xl lg:border-0 lg:px-6 lg:py-3.5 lg:text-base lg:font-medium lg:text-foreground lg:data-[state=active]:bg-[#0089E9] lg:data-[state=active]:text-white lg:data-[state=inactive]:bg-[#F6F6F61A]"
          >
            VOTING
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="h-9 w-auto min-w-0 rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 py-2 font-outfit text-sm font-normal text-[#F1EBFB]/60 shadow-none ring-0 focus-visible:ring-0 data-[state=active]:border-[#0089E9] data-[state=active]:bg-transparent data-[state=active]:text-[#F1EBFB] lg:h-12 lg:w-[126px] lg:rounded-xl lg:border-0 lg:px-6 lg:py-3.5 lg:text-base lg:font-medium lg:text-foreground lg:data-[state=active]:bg-[#0089E9] lg:data-[state=active]:text-white lg:data-[state=inactive]:bg-[#F6F6F61A]"
          >
            HISTORY
          </TabsTrigger>
        </TabsList>
        <TabsContent value="voting">
          <VoteTab quest={quest} />
        </TabsContent>
        <TabsContent value="history">
          <HistoryTab quest={quest} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
