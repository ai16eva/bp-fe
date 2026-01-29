import Image from 'next/image';
import { forwardRef, type PropsWithChildren } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Typography } from '@/components/ui/typography';
import type { Board } from '@/types/schema';

type BoardDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  board: Board;
} & PropsWithChildren;

const ForwardedButton = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  (props, ref) => <button type="button" ref={ref} {...props} className="w-full" />,
);

export default function BoardDialog({
  children,
  open,
  onOpenChange,
  board,
}: BoardDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <ForwardedButton>{children}</ForwardedButton>
      </DialogTrigger>
      <DialogContent
        className="max-h-[calc(100dvh-48px)] w-11/12 overflow-y-auto md:max-w-6xl"
      >
        <DialogHeader>
          <DialogTitle>Notice</DialogTitle>
          <DialogDescription className="sr-only">
            Notice
          </DialogDescription>
        </DialogHeader>

        <div>
          <Typography level="h4" className="my-10 font-normal">
            {board.board_title}
          </Typography>
          {board.board_image_url && !board.board_image_url.includes('.pdf') && (
            <Image
              alt={board.board_title}
              width={0}
              height={0}
              sizes="100vw"
              src={board.board_image_url}
              className="mb-4 size-full object-cover"
            />
          )}
          {board.board_image_url && board.board_image_url.includes('.pdf') && (
            <iframe
              width="100%"
              height="600px"
              src={board.board_image_url}
              title="PDF Viewer"
              className="mb-4 object-cover"
            />
          )}
          <Typography level="h5" className="whitespace-pre-line break-words font-normal">
            {board.board_description}
          </Typography>
        </div>
      </DialogContent>
    </Dialog>
  );
}
