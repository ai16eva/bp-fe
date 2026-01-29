import type {
  Connection,
  PublicKey,
  Transaction,
  TransactionSignature,
} from '@solana/web3.js';

export class SolanaTransactionService {
  constructor(private connection: Connection) {}

  async sendAndConfirmTransaction(
    transaction: Transaction,
    feePayer: PublicKey,
    signTransaction: (tx: Transaction) => Promise<Transaction>,
  ): Promise<TransactionSignature> {
    const { blockhash, lastValidBlockHeight }
      = await this.connection.getLatestBlockhash('confirmed');

    transaction.recentBlockhash = blockhash;
    transaction.feePayer = feePayer;

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
    transaction.feePayer = feePayer;

    return transaction;
  }
}
