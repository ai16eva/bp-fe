'use client';

import { useEffect, useState } from 'react';

import { useAuth } from '@/app/auth-provider';
import NewPredictionDialog from '@/components/new-prediction-dialog';
import { Button } from '@/components/ui/button';
import { useNFTConfig } from '@/hooks/use-contract';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useToast } from '@/hooks/use-toast';
import { AddIcon } from '@/icons/icons';

export const QuestHeader = () => {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();
  const { nftBalance, nftLoading, address } = useAuth();
  const { mintRequiredNFT } = useNFTConfig();

  const md = useMediaQuery('(min-width: 768px)', {
    defaultValue: false,
    initializeWithValue: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const showDesktopButton = mounted && md;
  const shouldDisable = !address || (!nftLoading && nftBalance === 0);

  return (
    <div className="bg-background mb-4 xl:mb-6">
      <div className="app-container mt-8 flex items-center justify-end gap-4">
        <NewPredictionDialog open={open} onOpenChange={setOpen}>
          {showDesktopButton
            ? (
              <Button
                onClick={(e) => {
                  if (nftBalance < mintRequiredNFT) {
                    e.preventDefault();
                    toast({
                      title: 'You don\'t have enough NFTs to create a quest',
                      variant: 'danger',
                    });
                  }
                }}
                disabled={shouldDisable}
                loading={nftLoading && !!address}
                startDecorator={<AddIcon />}
                variant="ghost"
                className="rounded-full border-none font-bold shadow-lg"
              >
                Create New Prediction
              </Button>
            )
            : (
              <Button
                onClick={(e) => {
                  if (nftBalance < mintRequiredNFT) {
                    e.preventDefault();
                    toast({
                      title: 'You don\'t have enough NFTs to create a quest',
                      variant: 'danger',
                    });
                  }
                }}
                variant="ghost"
                size="icon"
                disabled={shouldDisable}
                loading={nftLoading && !!address}
                className="rounded-full border-none shadow-lg"
              >
                <AddIcon />
                <span className="sr-only">Create New Prediction</span>
              </Button>
            )}
        </NewPredictionDialog>
        {/* <SeasonDialog> */}
        {/*  {md */}
        {/*    ? ( */}
        {/*        <Button */}
        {/*          startDecorator={<NotificationIcon className="text-[32px]" />} */}
        {/*          variant="ghost" */}
        {/*          className="rounded-full border-none font-bold shadow-lg" */}
        {/*        > */}
        {/*          Season Info */}
        {/*        </Button> */}
        {/*      ) */}
        {/*    : ( */}
        {/*        <Button */}
        {/*          variant="ghost" */}
        {/*          size="icon" */}
        {/*          className="rounded-full border-none shadow-lg" */}
        {/*        > */}
        {/*          <NotificationIcon className="text-[32px]" /> */}
        {/*          <span className="sr-only">Season</span> */}
        {/*        </Button> */}
        {/*      )} */}
        {/* </SeasonDialog> */}
      </div>
    </div>
  );
};
