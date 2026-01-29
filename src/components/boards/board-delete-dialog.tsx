import { useQueryClient } from '@tanstack/react-query';
import { Loader2Icon, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { appQueryKeys } from '@/config/query';
import { useDeleteBoardMutation } from '@/hooks/use-board';
import { toast } from '@/hooks/use-toast';

type BoardDeleteDialogProps = {
  id: number;
};

const BoardDeleteDialog = ({ id }: BoardDeleteDialogProps) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: deleteBoard, isPending } = useDeleteBoardMutation({
    onSuccess: () => {
      toast({
        title: 'Post delete successfully',
        variant: 'success',
      });

      queryClient.invalidateQueries({
        queryKey: appQueryKeys.board.root,
      });

      setOpen(false);
    },
  });
  return (
    <Dialog open={open} onOpenChange={value => setOpen(value)}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="rounded-md p-1.5 transition-colors hover:bg-red-100 dark:hover:bg-red-900/30"
          title="Delete post"
        >
          <Trash2 className="h-5 w-5 cursor-pointer text-gray-600 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Board</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this board?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => deleteBoard({ board_id: id })} disabled={isPending}>
            {isPending && <Loader2Icon className="animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BoardDeleteDialog;
