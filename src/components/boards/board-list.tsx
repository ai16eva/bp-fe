import dayjs from 'dayjs';
import { Pencil } from 'lucide-react';
import { useState } from 'react';

import BoardDialog from '@/components/board-dialog';
import BoardDeleteDialog from '@/components/boards/board-delete-dialog';
import EditBoardDialog from '@/components/boards/edit-board-dialog';
import { BoardItem } from '@/components/boards/board-item';
import { Skeleton } from '@/components/ui/skeleton';
import type { Board } from '@/types/schema';

interface BoardListProps {
  data: Board[] | undefined;
  isLoading: boolean;
  isAdmin: boolean;
}

export const BoardList = ({ data, isLoading, isAdmin }: BoardListProps) => {
  const [openBoardId, setOpenBoardId] = useState<number | null>(null);
  const [editBoardId, setEditBoardId] = useState<number | null>(null);

  return (
    <>
      {isLoading && (
        <div>
          {Array.from({ length: 12 }).map((_, idx) => (
            <Skeleton className="my-4 h-10 w-full" key={idx} />
          ))}
        </div>
      )}
      {!isLoading && data?.length === 0 && (
        <div className="flex items-center justify-center p-10 text-gray-500 dark:text-gray-400">
          No posts available
        </div>
      )}
      {!isLoading && data?.map((item: Board) => (
        <div className="group flex items-center gap-2" key={item.board_id}>
          <BoardDialog
            open={openBoardId === item.board_id}
            onOpenChange={() => setOpenBoardId(item.board_id === openBoardId ? null : item.board_id)}
            board={item}
          >
            <BoardItem
              name={item.board_title}
              date={dayjs(item.board_created_at).format('YYYY. MM. DD HH:mm:ss')}
            />
          </BoardDialog>
          {isAdmin && (
            <div className="flex items-center gap-2 opacity-70 transition-opacity group-hover:opacity-100">
              <EditBoardDialog
                open={editBoardId === item.board_id}
                onOpenChange={(open) => setEditBoardId(open ? item.board_id : null)}
                board={item}
              >
                <button
                  type="button"
                  className="rounded-md p-1.5 transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/30"
                  title="Edit post"
                >
                  <Pencil className="h-5 w-5 cursor-pointer text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400" />
                </button>
              </EditBoardDialog>
              <BoardDeleteDialog id={item.board_id} />
            </div>
          )}
        </div>
      ))}
    </>
  );
};
