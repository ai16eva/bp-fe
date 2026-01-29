'use client';

import React, { useEffect } from 'react';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLocalStorage } from '@/hooks/use-storage';
import { Env } from '@/libs/Env';

const WelcomeDialog = ({
  address,
}: {
  address: string | undefined;
}) => {
  const [open, setOpen] = React.useState(false);
  const [, setFirstLogin] = useLocalStorage<boolean | null>(`fl-${address}`, true);

  useEffect(() => {
    if (!address) {
      return;
    }

    const fl = window.localStorage.getItem(`fl-${address}`);

    if (fl === null) {
      setOpen(true);
      setFirstLogin(false);
    }
  }, [address, setFirstLogin]);

  if (!address) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="max-h-full"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Notice</DialogTitle>
          {Env.NEXT_PUBLIC_NOTICE_MESSAGE && (
            <DialogDescription className="max-h-[80vh] overflow-auto whitespace-pre-line pr-4">
              {Env.NEXT_PUBLIC_NOTICE_MESSAGE}
            </DialogDescription>
          )}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeDialog;
