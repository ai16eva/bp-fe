import type { QuestDetail } from '@/types/schema';

import { useTokenBalance } from './use-token-balance';

const TOKEN_ADDRESSES = {
  BOOM: 'GVi8Ce9QdL18QrD4WBjJznxtaoQefxJT5bNqUodTcZ7R',
  USDT: '6HXWa6EXRakLTfBrNM9B5rM9YS8qLNtkZb5cabYzvFNs',
  WSOL: 'So11111111111111111111111111111111111111112',
} as const;


export const useMarketToken = (quest?: QuestDetail) => {
  let bettingTokenAddress = quest?.quest_betting_token_address;

  if (!bettingTokenAddress && quest?.quest_betting_token) {
    const tokenSymbol = quest.quest_betting_token.toUpperCase() as keyof typeof TOKEN_ADDRESSES;
    bettingTokenAddress = TOKEN_ADDRESSES[tokenSymbol] || TOKEN_ADDRESSES.BOOM;
  }

  const tokenBalance = useTokenBalance(bettingTokenAddress);

  const symbol = quest?.quest_betting_token || tokenBalance.symbol || 'BOOM';

  return {
    bettingTokenAddress,
    ...tokenBalance,
    symbol,
  };
};
