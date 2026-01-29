'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { usePrivyWallet } from '@/hooks/use-privy-wallet';
import { JupiterSwapService } from '@/services/jupiter/jupiter-swap.service';
import type {
  JupiterExecuteResponse,
  JupiterOrderResponse,
} from '@/types/jupiter.types';
import { JupiterSwapError } from '@/types/jupiter.types';

interface UseJupiterQuoteParams {
  inputMint: string;
  outputMint: string;
  amount: number;
  decimals: number;
  enabled?: boolean;
}

export function useJupiterQuote({
  inputMint,
  outputMint,
  amount,
  decimals,
  enabled = true,
}: UseJupiterQuoteParams) {
  const { publicKey } = usePrivyWallet();
  const jupiterService = useMemo(() => new JupiterSwapService(), []);

  return useQuery<JupiterOrderResponse, JupiterSwapError>({
    queryKey: [
      'jupiterQuote',
      inputMint,
      outputMint,
      amount,
      publicKey?.toBase58(),
    ],
    queryFn: async () => {
      if (!publicKey) {
        throw new JupiterSwapError('Wallet not connected');
      }

      if (amount <= 0) {
        throw new JupiterSwapError('Amount must be greater than 0');
      }

      const rawAmount = jupiterService.amountToRaw(amount, decimals);

      return jupiterService.getSwapOrder({
        inputMint,
        outputMint,
        amount: rawAmount,
        taker: publicKey,
      });
    },
    enabled: enabled && !!publicKey && amount > 0,
    refetchInterval: 10000,
    retry: 2,
    staleTime: 5000,
  });
}

interface SwapParams {
  inputMint: string;
  outputMint: string;
  amount: number;
  decimals: number;
}

export function useJupiterSwap() {
  const { publicKey, signTransaction } = usePrivyWallet();
  const queryClient = useQueryClient();

  const jupiterService = useMemo(() => new JupiterSwapService(), []);

  return useMutation<JupiterExecuteResponse, JupiterSwapError, SwapParams>({
    mutationFn: async ({ inputMint, outputMint, amount, decimals }) => {
      if (!publicKey || !signTransaction) {
        throw new JupiterSwapError('Wallet not connected');
      }

      const rawAmount = jupiterService.amountToRaw(amount, decimals);
      const orderResponse = await jupiterService.getSwapOrder({
        inputMint,
        outputMint,
        amount: rawAmount,
        taker: publicKey,
      });

      if (!orderResponse.transaction) {
        throw new JupiterSwapError('No transaction received from Jupiter');
      }

      const transaction = jupiterService.deserializeTransaction(
        orderResponse.transaction
      );

      const signedTx = await signTransaction(transaction);

      const signedTxBase64 = jupiterService.serializeTransaction(signedTx);

      const result = await jupiterService.executeSwap(
        signedTxBase64,
        orderResponse.requestId
      );

      return result;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tokenBalance'],
        exact: false,
      });
    },
  });
}

export function useJupiterSwapWithQuote(params: UseJupiterQuoteParams) {
  const quote = useJupiterQuote(params);
  const swap = useJupiterSwap();

  return {
    quote,
    swap,
    isLoading: quote.isLoading || swap.isPending,
  };
}
