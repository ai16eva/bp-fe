import { BN } from '@coral-xyz/anchor';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import type { Connection, PublicKey, Transaction } from '@solana/web3.js';

import type { GovernanceSDK } from '@/types/solana-sdk.types';

export class GovernanceService {
  constructor(private sdk: GovernanceSDK, private connection: Connection) {}

  async prepareClaimRewardTransaction(
    questKey: BN,
    voter: PublicKey,
  ): Promise<Transaction> {
    const config = await this.sdk.fetchConfig();
    if (!config) {
      throw new Error('Failed to fetch governance config');
    }

    const tokenMint = config.baseTokenMint;
    const voterTokenAccount = await getAssociatedTokenAddress(tokenMint, voter);

    const transaction = await this.sdk.distributeReward(
      questKey,
      voter,
      voterTokenAccount,
    );

    const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash('finalized');
    transaction.recentBlockhash = blockhash;
    if ('lastValidBlockHeight' in transaction) {
      (transaction as any).lastValidBlockHeight = lastValidBlockHeight;
    }

    transaction.feePayer = voter;
    return transaction;
  }

  async canClaimReward(
    questKey: BN,
    voter: PublicKey,
  ): Promise<{ canClaim: boolean; reason?: string }> {
    try {
      const governanceItem = await this.sdk.fetchGovernanceItem(questKey);
      if (!governanceItem) {
        return { canClaim: false, reason: 'Quest not found' };
      }

      const answerResultBN = new BN(governanceItem.answerResult);
      const answerResultNum = answerResultBN.toNumber();

      if (answerResultNum === 0) {
        return { canClaim: false, reason: 'Quest has no result yet' };
      }

      const [answerVotePDA] = this.sdk.getAnswerVotePDA(questKey);
      let answerVote;
      try {
        answerVote = await this.sdk.program.account.answerVote.fetch(
          answerVotePDA,
        );
      } catch {
        return { canClaim: false, reason: 'Failed to fetch answer vote account' };
      }

      if (!answerVote) {
        return { canClaim: false, reason: 'Answer vote account not found' };
      }

      if (!answerVote.finalized) {
        return {
          canClaim: false,
          reason: `Quest not finalized. Current state: finalized=${answerVote.finalized}, winningAnswer=${answerVote.winningAnswer?.toString() || 'N/A'}. Please contact admin to finalize the quest.`,
        };
      }

      const [answerVoterPDA] = this.sdk.getAnswerVoterPDA(questKey, voter);
      const voterRecord
        = await this.sdk.program.account.answerVoterRecord.fetch(answerVoterPDA);

      if (!voterRecord) {
        return { canClaim: false, reason: 'You did not vote' };
      }

      if (voterRecord.rewarded) {
        return { canClaim: false, reason: 'Already claimed' };
      }

      if (voterRecord.voteCount === 0) {
        return { canClaim: false, reason: 'No votes recorded' };
      }

      const selectedAnswerKey = new BN(governanceItem.answerResult);
      const voterAnswerKey = new BN(voterRecord.answerKey);

      if (!selectedAnswerKey.eq(voterAnswerKey)) {
        return { canClaim: false, reason: 'You voted for wrong answer' };
      }

      return { canClaim: true };
    } catch {
      return { canClaim: false, reason: 'Failed to check eligibility' };
    }
  }

  async parseRewardFromTransaction(
    signature: string,
    voter?: PublicKey,
  ): Promise<{ rawAmount: string; voteCount: number } | null> {
    try {
      const tx = await this.connection.getTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
      });

      if (!tx || !tx.meta) {
        return null;
      }

      if (tx.meta.postTokenBalances && tx.meta.preTokenBalances && voter) {
        const config = await this.sdk.fetchConfig();
        if (config) {
          const voterTokenAccount = await getAssociatedTokenAddress(
            config.baseTokenMint,
            voter,
          );

          const postBalances = tx.meta.postTokenBalances;
          const preBalances = tx.meta.preTokenBalances;

          let accountKeys: PublicKey[] = [];
          const message = tx.transaction.message;
          if ('getAccountKeys' in message) {
            accountKeys = message.getAccountKeys().keySegments().flat();
          } else {
            const legacyMessage = message as { accountKeys: PublicKey[] };
            accountKeys = legacyMessage.accountKeys;
          }

          const voterAccountIndex = accountKeys.findIndex(
            (key: PublicKey) => key.toBase58() === voterTokenAccount.toBase58(),
          );

          if (voterAccountIndex >= 0) {
            const postBalance = postBalances.find(
              b => b.accountIndex === voterAccountIndex,
            );
            const preBalance = preBalances.find(
              b => b.accountIndex === voterAccountIndex,
            );

            if (postBalance && preBalance) {
              const preAmount = preBalance.uiTokenAmount.uiAmount || 0;
              const postAmount = postBalance.uiTokenAmount.uiAmount || 0;
              const diff = postAmount - preAmount;

              if (diff > 0) {
                const rawAmount = Math.floor(diff * 1e9).toString();
                return {
                  rawAmount,
                  voteCount: 0,
                };
              }
            }
          }
        }
      }

      const logs = tx.meta.logMessages || [];
      const eventLog = logs.find(
        log =>
          log.includes('RewardDistributed') || log.includes('reward_amount'),
      );

      if (!eventLog) {
        return null;
      }

      const rewardMatch = eventLog.match(/reward_amount[:\s]+(\d+)/);
      const voteMatch = eventLog.match(/vote_count[:\s]+(\d+)/);

      if (!rewardMatch || !rewardMatch[1]) {
        return null;
      }

      return {
        rawAmount: rewardMatch[1],
        voteCount: voteMatch && voteMatch[1] ? Number.parseInt(voteMatch[1], 10) : 0,
      };
    } catch {
      return null;
    }
  }

  formatReward(rawAmount: string, decimals: number = 9): string {
    const bn = new BN(rawAmount);
    const divisor = new BN(10).pow(new BN(decimals));
    const integerPart = bn.div(divisor);
    const remainder = bn.mod(divisor);

    if (remainder.isZero()) {
      return integerPart.toString();
    }

    const decimalPart = remainder
      .toString()
      .padStart(decimals, '0')
      .replace(/0+$/, '');

    return `${integerPart}.${decimalPart}`;
  }

  async fetchConfig() {
    return await this.sdk.fetchConfig();
  }
}
