'use client';

import { parseAsStringLiteral, useQueryState } from 'nuqs';

import { useAuth } from '@/app/auth-provider';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Typography } from '@/components/ui/typography';
import { ClockIcon, MenuBoardIcon } from '@/icons/icons';

import { GamesTable } from './games-table';
import { HistoryTable } from './history-table';
import { VotingTable } from './votings-table';

export const ProfileActivities = () => {
  const { user } = useAuth();

  const options
    = user && user.delegatedTx
      ? [
        {
          key: 'games',
          name: 'Votes',
          icon: <MenuBoardIcon />,
        },
        {
          key: 'votings',
          name: 'Dao',
          icon: <MenuBoardIcon />,
        },
        // {
        //   key: 'mygames',
        //   name: 'My Games',
        //   icon: <MenuBoardIcon />,
        // },
        {
          key: 'history',
          name: 'History',
          icon: <ClockIcon className="text-3xl" />,
        },
      ]
      : [
        {
          key: 'games',
          name: 'Votes',
          icon: <MenuBoardIcon />,
        },
        {
          key: 'history',
          name: 'History',
          icon: <ClockIcon className="text-3xl" />,
        },
      ];

  const filterOptions = ['games', 'votings', 'mygames', 'history'] as const;

  const [type, setType] = useQueryState(
    'type',
    parseAsStringLiteral(filterOptions).withDefault('games'),
  );

  return (
    <div className="bg-secondary py-16 dark:bg-[#030617]">
      <div className="app-container overflow-hidden bg-background shadow-light lg:rounded-12 dark:bg-transparent">
        {/* Tabs Container */}
        <div className="flex">
          {options.map(option => (
            <button
              key={option.key}
              onClick={() => setType(option.key as any)}
              className={`flex items-center gap-2 rounded-t-lg px-8 py-5 font-outfit text-base font-medium transition-colors ${type === option.key
                ? 'bg-foreground-10 text-brand dark:bg-[rgba(255,255,255,0.1)] dark:text-[#149FFF]'
                : 'bg-transparent text-foreground-50 hover:bg-foreground-10/50 dark:text-[#B8B8B8] dark:hover:bg-[rgba(255,255,255,0.05)]'
                }`}
            >
              <span className={type === option.key ? 'text-brand dark:text-[#149FFF]' : 'text-foreground-50 dark:text-[#B8B8B8]'}>
                {option.icon}
              </span>
              {option.name}
            </button>
          ))}
        </div>

        {/* Table Header - matches Figma design */}
        <div className="rounded-tr-lg bg-foreground-10 px-4 py-7 dark:bg-[rgba(255,255,255,0.1)] md:px-8">
          <Typography level="h4" asChild className="font-outfit text-2xl font-medium dark:text-white md:text-[32px]">
            <h3>
              {type === 'games' && 'Votes'}
              {type === 'votings' && 'Dao'}
              {type === 'history' && 'History'}
            </h3>
          </Typography>
        </div>

        {/* Table Content */}
        <div className="rounded-b-lg bg-white pb-10 dark:bg-[rgba(255,255,255,0.04)]">
          <ScrollArea className="h-[550px] overflow-auto px-4 md:px-8">
            {type === 'games' && <GamesTable />}
            {type === 'votings' && <VotingTable />}
            {type === 'history' && <HistoryTable />}
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

