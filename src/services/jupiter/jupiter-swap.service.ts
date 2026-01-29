import type { PublicKey } from '@solana/web3.js';
import { VersionedTransaction } from '@solana/web3.js';

import { Env } from '@/libs/Env';

import type {
  JupiterExecuteRequest,
  JupiterExecuteResponse,
  JupiterOrderRequest,
  JupiterOrderResponse,
} from '@/types/jupiter.types';
import { JupiterSwapError } from '@/types/jupiter.types';

const JUPITER_API_URL = 'https://api.jup.ag/ultra/v1';

export class JupiterSwapService {
  private apiKey: string;

  constructor() {
    this.apiKey = Env.NEXT_PUBLIC_JUPITER_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Jupiter API key not found in environment variables');
    }
  }

  async getSwapOrder(
    params: Omit<JupiterOrderRequest, 'taker'> & { taker: PublicKey }
  ): Promise<JupiterOrderResponse> {
    try {
      const queryParams = new URLSearchParams({
        inputMint: params.inputMint,
        outputMint: params.outputMint,
        amount: params.amount,
        taker: params.taker.toBase58(),
        ...(params.receiver && { receiver: params.receiver }),
        ...(params.payer && { payer: params.payer }),
        ...(params.closeAuthority && { closeAuthority: params.closeAuthority }),
        ...(params.referralAccount && {
          referralAccount: params.referralAccount,
        }),
        ...(params.referralFee && {
          referralFee: params.referralFee.toString(),
        }),
        ...(params.excludeRouters && {
          excludeRouters: params.excludeRouters.join(','),
        }),
        ...(params.excludeDexes && { excludeDexes: params.excludeDexes }),
      });

      const response = await fetch(
        `${JUPITER_API_URL}/order?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new JupiterSwapError(
          `Failed to get swap order: ${response.statusText}`,
          response.status,
          errorData
        );
      }

      const data: JupiterOrderResponse = await response.json();

      if (!data.transaction && data.errorMessage) {
        throw new JupiterSwapError(data.errorMessage, data.errorCode, data);
      }

      if (!data.transaction) {
        throw new JupiterSwapError('No transaction returned from Jupiter');
      }

      return data;
    } catch (error) {
      if (error instanceof JupiterSwapError) {
        throw error;
      }
      throw new JupiterSwapError(
        `Failed to fetch swap order: ${(error as Error).message}`
      );
    }
  }

  deserializeTransaction(base64Transaction: string): VersionedTransaction {
    try {
      const transactionBuffer = Buffer.from(base64Transaction, 'base64');
      return VersionedTransaction.deserialize(transactionBuffer);
    } catch (error) {
      throw new JupiterSwapError(
        `Failed to deserialize transaction: ${(error as Error).message}`
      );
    }
  }

  serializeTransaction(transaction: VersionedTransaction): string {
    try {
      const serialized = transaction.serialize();
      return Buffer.from(serialized).toString('base64');
    } catch (error) {
      throw new JupiterSwapError(
        `Failed to serialize transaction: ${(error as Error).message}`
      );
    }
  }

  async executeSwap(
    signedTransaction: string,
    requestId: string
  ): Promise<JupiterExecuteResponse> {
    try {
      const payload: JupiterExecuteRequest = {
        signedTransaction,
        requestId,
      };

      const response = await fetch(`${JUPITER_API_URL}/execute`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new JupiterSwapError(
          `Failed to execute swap: ${response.statusText}`,
          response.status,
          errorData
        );
      }

      const data: JupiterExecuteResponse = await response.json();

      if (data.status === 'Failed') {
        throw new JupiterSwapError(
          data.error || 'Swap execution failed',
          data.code,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof JupiterSwapError) {
        throw error;
      }
      throw new JupiterSwapError(
        `Failed to execute swap: ${(error as Error).message}`
      );
    }
  }

  amountToRaw(amount: number, decimals: number): string {
    const [integerPart, decimalPart = ''] = amount.toString().split('.');
    const paddedDecimal = decimalPart.padEnd(decimals, '0').slice(0, decimals);
    return integerPart + paddedDecimal;
  }

  rawToAmount(raw: string, decimals: number): number {
    const value = raw.padStart(decimals + 1, '0');
    const integerPart = value.slice(0, -decimals) || '0';
    const decimalPart = value.slice(-decimals);
    return parseFloat(`${integerPart}.${decimalPart}`);
  }
}
