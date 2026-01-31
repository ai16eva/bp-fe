import {
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  Transaction,
  TransactionSignature,
} from '@solana/web3.js';

export class SolanaTransactionService {
  constructor(private connection: Connection) { }

  async sendAndConfirmTransaction(
    transaction: Transaction,
    feePayer: PublicKey,
    signTransaction: (tx: Transaction) => Promise<Transaction>,
  ): Promise<TransactionSignature> {
    const { blockhash, lastValidBlockHeight }
      = await this.connection.getLatestBlockhash('confirmed');

    transaction.recentBlockhash = blockhash;
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = feePayer;
    this.addComputeBudget(transaction);

    const signedTx = await signTransaction(transaction);

    const signature = await this.connection.sendRawTransaction(
      signedTx.serialize(),
      {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      },
    );

    await this.connection.confirmTransaction(
      {
        signature,
        blockhash,
        lastValidBlockHeight,
      },
      'confirmed',
    );

    return signature;
  }

  /**
   * Prepare transaction for Privy sendTransaction
   * Privy's sendTransaction hook handles signing and sending automatically
   */
  async prepareTransactionForPrivy(
    transaction: Transaction,
    feePayer: PublicKey,
  ): Promise<Transaction> {
    const { blockhash } = await this.connection.getLatestBlockhash('confirmed');

    transaction.recentBlockhash = blockhash;
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = feePayer;
    this.addComputeBudget(transaction);

    return transaction;
  }
  private addComputeBudget(transaction: Transaction) {
    const hasComputeLimit = transaction.instructions.some(ix =>
      ix.programId.equals(ComputeBudgetProgram.programId) && ix.data[0] === 2
    );

    if (!hasComputeLimit) {
      transaction.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 1000000 }));
    }

    const hasPriorityFee = transaction.instructions.some(ix =>
      ix.programId.equals(ComputeBudgetProgram.programId) && ix.data[0] === 3
    );

    if (!hasPriorityFee) {
      transaction.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 10000 }));
    }
  }
}
