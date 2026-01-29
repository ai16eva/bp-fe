'use client';

import { useMemo, useState } from 'react';

import { useAuth } from '@/app/auth-provider';
import { BoardList } from '@/components/boards/board-list';
import { ActionButtonList } from '@/components/layouts/action-button-list';
import NewPostDialog from '@/components/new-post-dialog';
import { Button } from '@/components/ui/button';
import { PaginationContainer } from '@/components/ui/pagination';
import { Typography } from '@/components/ui/typography';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';
import { useFetchBoards } from '@/hooks/use-board';
import { useQuestsFilters } from '@/hooks/use-fetch-quests';
import { useWalletSignature } from '@/hooks/use-wallet-signature';
import { AddIcon } from '@/icons/icons';

export const BoardWrapper = () => {
  const [open, setOpen] = useState(false);
  const { currentPage, setCurrentPage } = useQuestsFilters();
  const { data, isLoading } = useFetchBoards({ page: currentPage });

  const { user } = useAuth();
  const isAdmin = useMemo(() => user?.role.toLowerCase() === 'admin', [user]);

  // Sort boards by creation date (newest first)
  const sortedBoards = useMemo(() => {
    if (!data?.data) return [];
    return [...data.data].sort((a, b) => {
      const dateA = new Date(a.board_created_at).getTime();
      const dateB = new Date(b.board_created_at).getTime();
      return dateB - dateA; // Descending order (newest first)
    });
  }, [data?.data]);

  // Use wallet signature hook for admin authentication
  // Auto-create signature for admins
  const { hasSignature } = useWalletSignature(isAdmin);

  // Admin can perform actions if they have a valid signature
  const canAdminAction = isAdmin && hasSignature;

  return (
    <div className="bg-background pb-16 dark:bg-[#01060C]">
      <ActionButtonList title="Boards" />
      <div className="app-container pt-8 xl:w-[1200px]">
        <div className="mb-12 rounded-2xl bg-card px-10 pb-10 pt-8 shadow-[0px_5px_10px_0px_rgba(0,0,0,0.2)] md:px-16 md:pb-16 lg:px-24 dark:bg-transparent dark:shadow-none dark:p-0">
          <div className="relative flex items-center justify-start">
            <Typography level="h4" className="text-left dark:hidden">Boards</Typography>
            {isAdmin && (
              <NewPostDialog open={open} onOpenChange={setOpen}>
                <Button
                  startDecorator={<AddIcon />}
                  variant="ghost"
                  className="absolute right-0 rounded-full border-none font-bold shadow-[0px_5px_10px_0px_rgba(0,0,0,0.2)] dark:bg-[#13121C] dark:text-white dark:shadow-none dark:static dark:w-full dark:justify-center dark:mt-4 md:dark:absolute md:dark:mt-0 md:dark:w-auto"
                >
                  Create New Post
                </Button>
              </NewPostDialog>
            )}
          </div>

          <div className="mt-10">
            <BoardList data={sortedBoards} isLoading={isLoading} isAdmin={canAdminAction} />
          </div>
        </div>

        {sortedBoards.length > 0 && (
          <PaginationContainer
            className="mt-12"
            currentPage={currentPage}
            totalPages={Math.ceil((sortedBoards.length ?? 0) / DEFAULT_PAGE_SIZE)}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};
