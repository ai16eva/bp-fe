'use client';

import { useEffect, useState } from 'react';

import { useAuth } from '@/app/auth-provider';
import { ActionButtonList } from '@/components/layouts/action-button-list';
import NewPredictionDialog from '@/components/new-prediction-dialog';
import { QuestList } from '@/components/quests/quests/quest-list';
import { Button } from '@/components/ui/button';
import { useNFTConfig } from '@/hooks/use-contract';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useToast } from '@/hooks/use-toast';
import { AddIcon } from '@/icons/icons';

const CreatePredictionButton = () => {
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
    <NewPredictionDialog open={open} onOpenChange={setOpen}>
      {showDesktopButton ? (
        <Button
          onClick={(e) => {
            if (nftBalance < mintRequiredNFT) {
              e.preventDefault();
              toast({
                title: "You don't have enough NFTs to create a quest",
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
      ) : (
        <Button
          onClick={(e) => {
            if (nftBalance < mintRequiredNFT) {
              e.preventDefault();
              toast({
                title: "You don't have enough NFTs to create a quest",
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
  );
};

export const QuestSection = () => {
  return (
    <div className="bg-background pb-10">
      <ActionButtonList title="Quest List" rightElement={<CreatePredictionButton />} />
      <QuestList />
    </div>
  );
};
