import type { PublicKey } from '@solana/web3.js';

import api from '@/libs/api';

import type { SignMessageFunction } from './wallet-auth.service';
import { WalletAuthService } from './wallet-auth.service';

export class DailyRewardService {
  static async claimReward(
    publicKey: PublicKey,
    signMessage: SignMessageFunction,
  ): Promise<void> {
    const { walletAddress, message, signature }
      = await WalletAuthService.createWalletSignature(publicKey, signMessage);

    await api.claimDailyReward({
      walletAddress,
      claimed_at: new Date().toISOString(),
      message,
      signature,
    });
  }
}
