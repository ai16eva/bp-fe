import type { BN } from '@coral-xyz/anchor';
import type { PublicKey, Transaction } from '@solana/web3.js';

import type { BPMarketSDK } from '@/types/solana-sdk.types';

export class MarketService {
  constructor(private sdk: BPMarketSDK) {}

  async claimReward(
    marketKey: BN,
    answerKey: BN,
    voter: PublicKey,
  ): Promise<Transaction> {
    const canClaim = await this.canClaimReward(marketKey, answerKey, voter);
    if (!canClaim.claimable) {
      throw new Error(canClaim.reason || 'Cannot claim reward');
    }

    const tx = await this.sdk.receiveToken(marketKey, answerKey, voter);

    return this.sdk.addPriorityFee(tx, 50000);
  }

  async canClaimReward(
    marketKey: BN,
    answerKey: BN,
    voter: PublicKey,
  ): Promise<{ claimable: boolean; reason?: string; amount?: BN }> {
    try {
      const market = await this.sdk.fetchMarket(marketKey);

      if (!market.status.success && !market.status.adjourn) {
        return { claimable: false, reason: 'Market not finished' };
      }

      const amount = await this.sdk.availableReceiveTokensByUser(
        voter,
        marketKey,
        answerKey,
      );

      if (amount.isZero()) {
        return { claimable: false, reason: 'No reward available' };
      }

      const betting = await this.sdk.fetchBetting(voter, marketKey, answerKey);
      if (!betting.exist) {
        return { claimable: false, reason: 'Betting not found' };
      }

      return { claimable: true, amount };
    } catch (error: any) {
      return { claimable: false, reason: error.message };
    }
  }

  async getUserBettingWithReward(
    voter: PublicKey,
    marketKey: BN,
    answerKey: BN,
  ) {
    const betting = await this.sdk.fetchBetting(voter, marketKey, answerKey);
    const market = await this.sdk.fetchMarket(marketKey);
    const reward = await this.sdk.availableReceiveTokensByUser(
      voter,
      marketKey,
      answerKey,
    );

    return {
      betting,
      market,
      reward,
      canClaim:
        !reward.isZero() && (market.status.success || market.status.adjourn),
    };
  }
}
