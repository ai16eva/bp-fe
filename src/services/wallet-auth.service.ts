import type { PublicKey } from '@solana/web3.js';
// eslint-disable-next-line unicorn/prefer-node-protocol
import { Buffer } from 'buffer';

export interface SignMessageFunction {
  (message: Uint8Array): Promise<Uint8Array>;
}

export class WalletAuthService {
  static async createWalletSignature(
    publicKey: PublicKey,
    signMessage: SignMessageFunction,
  ): Promise<{
      walletAddress: string;
      message: string;
      signature: string;
      timestamp: number;
    }> {
    const walletAddress = publicKey.toBase58();
    const timestamp = Date.now();
    const message = `${walletAddress}-${timestamp}`;

    const encodedMessage = new TextEncoder().encode(message);
    const signatureUint8 = await signMessage(encodedMessage);
    const signatureBase64 = ((): string => {
      const g: any = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
      // eslint-disable-next-line node/prefer-global/buffer
      const bufferSource = Buffer ?? g.Buffer;

      if (bufferSource && typeof bufferSource.from === 'function') {
        return bufferSource.from(signatureUint8).toString('base64');
      }
      let binary = '';
      const chunkSize = 0x8000;
      for (let i = 0; i < signatureUint8.length; i += chunkSize) {
        const chunk = signatureUint8.subarray(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, Array.from(chunk) as any);
      }
      if (typeof g.btoa === 'function') {
        return g.btoa(binary);
      }
      return '';
    })();

    return {
      walletAddress,
      message,
      signature: signatureBase64,
      timestamp,
    };
  }
}
