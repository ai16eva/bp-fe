import { Env } from '@/libs/Env';
import type { QuestDetail } from '@/types/schema';

import { useTokenBalance } from './use-token-balance';

const TOKEN_ADDRESSES = {
  BOOM: Env.NEXT_PUBLIC_BOOM_TOKEN_ADDRESS,
  USDT: Env.NEXT_PUBLIC_USDT_TOKEN_ADDRESS,
  USDC: Env.NEXT_PUBLIC_USDC_TOKEN_ADDRESS || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  WSOL: Env.NEXT_PUBLIC_WSOL_TOKEN_ADDRESS || 'So11111111111111111111111111111111111111112',
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
