'use client';

import Image from 'next/image';

import { useAuth } from '@/app/auth-provider';
import { WalletOptionsDialog } from '@/components/connect-wallet-solana';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Typography } from '@/components/ui/typography';
import { useBetForm } from '@/hooks/use-bet-form';
import { useCreateBet } from '@/hooks/use-create-bet';
import { useMarketToken } from '@/hooks/use-market-token';
import { usePotentialReward } from '@/hooks/use-potential-reward';
import { usePrivyWallet } from '@/hooks/use-privy-wallet';
import { useToast } from '@/hooks/use-toast';
import type { QuestDetail } from '@/types/schema';
import { isQuestEnded } from '@/utils/bet-calculator';
import { formatNumber } from '@/utils/number';

export const VoteForm = ({ quest }: { quest?: QuestDetail }) => {
  const { toast } = useToast();
  const { publicKey } = usePrivyWallet();
  const { address: sessionAddress } = useAuth();

  const { uiAmount, symbol } = useMarketToken(quest);
  const { form } = useBetForm(quest, Number(uiAmount));
  const { mutate: createBet, isPending: isBetting } = useCreateBet(quest);

  const wAmount = form.watch('amount');
  const wOutcome = form.watch('outcome');

  const potentialReward = usePotentialReward(quest, wOutcome, wAmount);
  const isEnded = isQuestEnded(quest);

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      if (!quest) {
        return;
      }

      if (!publicKey) {
        toast({
          title: 'Please connect your wallet first',
          variant: 'danger',
        });
        return;
      }

      createBet({
        quest_key: quest.quest_key,
        answer_key: data.outcome,
        betting_amount: String(data.amount),
        betting_address: publicKey.toBase58(),
      });
    } catch (error: any) {
      console.error(error);
      if (error?.message !== 'Wallet not connected') {
        toast({
          title: 'Oops! Something went wrong',
          description: error?.message,
          variant: 'danger',
        });
      }
    }
  });

  const isWalletConnected = sessionAddress || publicKey;

  if (!isWalletConnected) {
    return (
      <div className="rounded-2xl border border-input bg-[#f5f5f5] px-10 py-7">
        <Typography level="body1" className="mb-5 font-bold">
          There are no answer selected.
        </Typography>
        <Typography level="body1" className="mb-2">
          Amount:
        </Typography>

        <WalletOptionsDialog>Connect wallet</WalletOptionsDialog>
      </div>
    );
  }

  return (
    <div>
      <Form {...form}>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <FormField
            control={form.control}
            name="outcome"
            disabled={isEnded}
            render={({ field }) => (
              <FormItem className="w-full">
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="text-sm font-normal leading-[140%] text-foreground font-outfit tracking-[0.14px]">
                      <SelectValue placeholder="Select an outcome" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[...(quest?.answers || [])].sort((a, b) =>
                      String(a.answer_key).localeCompare(String(b.answer_key))
                    ).map((answer) => (
                      <SelectItem
                        key={answer.answer_key}
                        value={answer.answer_key}
                      >
                        {answer.answer_title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col justify-between gap-4">
            <FormField
              control={form.control}
              name="amount"
              disabled={isEnded}
              render={({ field }) => (
                <FormItem className="w-full">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-base font-normal leading-[140%] text-foreground font-outfit">
                      Amount
                    </FormLabel>

                    <div className="flex items-center gap-2">
                      <Typography
                        level="body2"
                        className="font-normal italic text-foreground/90 font-outfit"
                      >
                        Balance:{' '}
                        <span className="font-medium not-italic">
                          {formatNumber(Number(uiAmount), {
                            minimumFractionDigits: 0,
                          })}{' '}
                          {symbol}
                        </span>
                      </Typography>
                    </div>
                  </div>
                  <FormControl>
                    <Input
                      placeholder="Please enter an amount"
                      {...field}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      onChange={(e) =>
                        e.target.validity.valid &&
                        field.onChange(e.target.value)
                      }
                      endDecorator={
                        <Image
                          src={
                            quest?.quest_betting_token === 'BOOM'
                              ? '/assets/icons/boom-token-icon.webp'
                              : quest?.quest_betting_token === 'USDT'
                                ? 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg'
                                : quest?.quest_betting_token === 'WSOL'
                                  ? '/assets/icons/wrapersol.webp'
                                  : quest?.quest_betting_token === 'USDC'
                                    ? 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
                                    : '/assets/icons/boom-token-icon.webp'
                          }
                          className="size-6 object-cover"
                          width={24}
                          height={24}
                          alt={quest?.quest_betting_token ?? 'token'}
                        />
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Typography
              level="body2"
              className="font-normal italic text-sm leading-[140%] font-be-vietnam-pro"
            >
              Potential rewards:{' '}
              <span className="font-bold text-[#34C759]">
                {formatNumber(potentialReward, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
              </span>
            </Typography>

            <Button
              loading={isBetting}
              type="submit"
              disabled={isEnded}
              className="w-full h-[48px] rounded-[12px] px-6 py-[14px] bg-[#0089E9] gap-[10px] text-white"
            >
              Vote
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
