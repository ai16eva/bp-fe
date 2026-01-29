import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import type { QuestDetail } from '@/types/schema';
import { getMinimumBet } from '@/utils/bet-calculator';

export const useBetForm = (quest: QuestDetail | undefined, balance: number) => {
  const minimumBet = useMemo(() => {
    if (!quest?.quest_betting_token) {
      return 2;
    }
    return getMinimumBet(quest.quest_betting_token as 'BOOM' | 'USDT');
  }, [quest?.quest_betting_token]);

  const formSchema = useMemo(
    () =>
      z.object({
        outcome: z.string().min(1, 'Outcome is required'),
        amount: z
          .number({ required_error: 'Amount is required' })
          .positive({ message: 'Amount must be positive' })
          .max(balance, 'Insufficient funds for bet')
          .or(z.string())
          .pipe(
            z.coerce
              .number({ required_error: 'Amount is required' })
              .positive({ message: 'Amount must be positive' })
              .min(
                minimumBet,
                `minimum ${minimumBet} ${quest?.quest_betting_token}`,
              )
              .max(balance, 'Insufficient funds for bet'),
          ),
      }),
    [minimumBet, quest?.quest_betting_token, balance],
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      outcome: '',
      amount: quest?.quest_betting_token === 'BOOM' ? 1 : 1,
    },
  });

  return { form, formSchema, minimumBet };
};

export type BetFormValues = {
  outcome: string;
  amount: number;
};
