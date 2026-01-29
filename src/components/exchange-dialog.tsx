'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { PropsWithChildren } from 'react';
import React, { useMemo, useEffect } from 'react';
import type { ControllerRenderProps } from 'react-hook-form';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { usePrivyWallet } from '@/hooks/use-privy-wallet';
import { useJupiterSwap, useJupiterQuote } from '@/hooks/use-jupiter-swap';
import { useTokenBalance } from '@/hooks/use-solana-contract';
import { useToast } from '@/hooks/use-toast';
import { Env } from '@/libs/Env';
import { formatNumber } from '@/utils/number';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Typography } from './ui/typography';

const swapSchema = z.object({
  fromAmount: z.coerce.number().positive(),
  fromToken: z.enum(['BOOM', 'SOL']),
  toAmount: z.coerce.number().default(0),
  toToken: z.enum(['BOOM', 'SOL']),
});

type TokenType = z.infer<typeof swapSchema>['fromToken'];

const TOKEN_CONFIG = {
  BOOM: {
    mint: Env.NEXT_PUBLIC_BOOM_TOKEN_ADDRESS,
    decimals: 6,
    symbol: 'BOOM',
  },
  SOL: {
    mint: 'So11111111111111111111111111111111111111112',
    decimals: 9,
    symbol: 'SOL',
  },
};

const tokenList = [
  { key: 'BOOM', name: 'BOOM' },
  { key: 'SOL', name: 'SOL' },
];

export default function ExchangeDialog({
  children,
  open,
  onOpenChange,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
} & PropsWithChildren) {
  const { publicKey } = usePrivyWallet();
  const { toast } = useToast();

  const { control, setValue, resetField, watch, handleSubmit } = useForm<
    z.infer<typeof swapSchema>
  >({
    resolver: zodResolver(swapSchema),
    defaultValues: {
      fromAmount: 0,
      fromToken: 'BOOM',
      toAmount: 0,
      toToken: 'SOL',
    },
  });

  const fromAmount = watch('fromAmount');
  const fromToken = watch('fromToken');
  const toAmount = watch('toAmount');
  const toToken = watch('toToken');

  const fromTokenConfig = TOKEN_CONFIG[fromToken];
  const toTokenConfig = TOKEN_CONFIG[toToken];

  const { uiAmount: fromTokenBalance } = useTokenBalance(fromTokenConfig.mint);
  const { uiAmount: toTokenBalance } = useTokenBalance(toTokenConfig.mint);

  const isInsufficient = fromAmount > Number(fromTokenBalance ?? 0);

  const shouldFetchQuote = useMemo(() => {
    return (
      !!publicKey &&
      fromAmount > 0 &&
      !isNaN(fromAmount) &&
      fromToken !== toToken &&
      open !== false
    );
  }, [publicKey, fromAmount, fromToken, toToken, open]);

  const {
    data: quote,
    isLoading: isQuoteLoading,
    error: quoteError,
  } = useJupiterQuote({
    inputMint: fromTokenConfig.mint,
    outputMint: toTokenConfig.mint,
    amount: fromAmount,
    decimals: fromTokenConfig.decimals,
    enabled: shouldFetchQuote,
  });

  const { mutate: executeSwap, isPending: isSwapping } = useJupiterSwap();

  useEffect(() => {
    if (quote?.outAmount && toTokenConfig) {
      const outputAmount =
        parseFloat(quote.outAmount) / Math.pow(10, toTokenConfig.decimals);
      setValue('toAmount', outputAmount);
    } else {
      setValue('toAmount', 0);
    }
  }, [quote, toTokenConfig, setValue]);

  const onSubmit = async (data: z.infer<typeof swapSchema>) => {
    if (!publicKey) {
      toast({ title: 'Please connect your wallet first', variant: 'danger' });
      return;
    }

    if (!quote) {
      toast({
        title: 'Unable to get quote',
        description: 'Please try again',
        variant: 'danger',
      });
      return;
    }

    executeSwap(
      {
        inputMint: fromTokenConfig.mint,
        outputMint: toTokenConfig.mint,
        amount: data.fromAmount,
        decimals: fromTokenConfig.decimals,
      },
      {
        onSuccess: (result) => {
          toast({
            title: 'Swap successful!',
            description: (
              <div>
                <p>
                  Swapped {data.fromAmount.toFixed(6)} {data.fromToken} →{' '}
                  {(data.toAmount || 0).toFixed(6)} {data.toToken}
                </p>
                {result.signature && (
                  <a
                    href={`https://solscan.io/tx/${result.signature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand underline"
                  >
                    View transaction
                  </a>
                )}
              </div>
            ),
            variant: 'success',
          });
          resetField('fromAmount');
          resetField('toAmount');
        },
        onError: (error) => {
          toast({
            title: 'Swap failed',
            description: 'Unable to complete the swap. Please try again',
            variant: 'danger',
          });
          console.error('Swap error:', error);
        },
      }
    );
  };

  const handleTokenSwitch = () => {
    const newFromToken = toToken;
    const newToToken = fromToken;

    setValue('fromToken', newFromToken);
    setValue('toToken', newToToken);
    setValue('fromAmount', 0);
    setValue('toAmount', 0);
  };

  const priceImpact = quote?.priceImpact
    ? (quote.priceImpact * 100).toFixed(2)
    : null;
  const feeBps = quote?.feeBps ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-11/12 max-w-lg rounded-3xl border-none bg-white p-6 dark:bg-[#15172C]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader className="mb-6">
            <DialogTitle className="font-outfit text-2xl font-semibold dark:text-white">
              Boom Play Swap
            </DialogTitle>
            <DialogDescription className="sr-only">
              Boom Play Swap
            </DialogDescription>
          </DialogHeader>

          {quote && (
            <div className="mb-4 space-y-2 rounded-xl bg-brand/10 p-4 text-sm dark:bg-[rgba(20,159,255,0.08)]">
              {feeBps > 0 && (
                <div className="font-outfit text-brand">
                  Exchange fee: {feeBps / 100}%
                </div>
              )}
              {priceImpact && (
                <div className="font-outfit text-brand">
                  Price impact:{' '}
                  <span
                    className={
                      parseFloat(priceImpact) > 1
                        ? 'font-bold text-red-500'
                        : ''
                    }
                  >
                    {priceImpact}%
                  </span>
                </div>
              )}
            </div>
          )}

          {isQuoteLoading && (
            <div className="mb-4 rounded-xl bg-yellow-500/10 p-4 text-sm">
              <span className="font-outfit text-yellow-600 dark:text-yellow-400">
                Getting best price...
              </span>
            </div>
          )}

          {quoteError && (
            <div className="mb-4 rounded-xl bg-red-500/10 p-4 text-sm">
              <span className="font-outfit text-red-600 dark:text-red-400">
                Unable to get swap quote. Please try again
              </span>
            </div>
          )}

          {/* From Amount Card */}
          <div className="mb-3 rounded-2xl bg-foreground-10 p-5 dark:bg-[rgba(255,255,255,0.04)]">
            <Typography level="body2" className="mb-2 font-outfit text-foreground-50 dark:text-[#F1EBFB]">
              Swap Amount:
            </Typography>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Controller
                  name="fromAmount"
                  control={control}
                  render={({ field }) => (
                    <input
                      inputMode="decimal"
                      {...field}
                      value={field.value || ''}
                      pattern="[0-9]*[.]?[0-9]*"
                      onChange={(e) => {
                        const value = e.target.value;
                        if (e.target.validity.valid) {
                          const numValue = value ? parseFloat(value) : 0;
                          field.onChange(numValue);
                        }
                      }}
                      placeholder="0"
                      className="w-full bg-transparent font-outfit text-2xl font-bold outline-none placeholder:text-foreground-50 dark:text-white dark:placeholder:text-[#F1EBFB]/50"
                    />
                  )}
                />
              </div>
              <div className="space-y-3 text-right">
                <Controller
                  control={control}
                  name="fromToken"
                  render={({ field }) => (
                    <TokenSelect
                      {...field}
                      onChange={(token) => {
                        field.onChange(token);
                        const oppositeToken: TokenType =
                          token === 'BOOM' ? 'SOL' : 'BOOM';
                        setValue('toToken', oppositeToken);
                        setValue('toAmount', 0);
                      }}
                    />
                  )}
                />
                <Typography level="body2" className="font-outfit text-foreground-50 dark:text-[#F1EBFB]/70">
                  {formatNumber(Number(fromTokenBalance ?? 0), {
                    minimumFractionDigits: 4,
                    maximumFractionDigits: 4,
                  })}{' '}
                  {fromToken}
                </Typography>
              </div>
            </div>
          </div>

          {/* Switch Button */}
          <div className="relative z-10 -my-3 flex justify-center">
            <button
              type="button"
              onClick={handleTokenSwitch}
              className="rounded-full border-4 border-white bg-brand p-2 text-white transition-colors hover:bg-brand/90 dark:border-[#15172C]"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7 10L12 15L17 10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* To Amount Card */}
          <div className="mb-6 rounded-2xl bg-foreground-10 p-5 dark:bg-[rgba(255,255,255,0.04)]">
            <Typography level="body2" className="mb-2 font-outfit text-foreground-50 dark:text-[#F1EBFB]">
              Receive Amount:
            </Typography>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="w-full font-outfit text-2xl font-bold dark:text-white">
                  {isQuoteLoading ? (
                    <span className="text-foreground-50 dark:text-[#F1EBFB]/50">Loading...</span>
                  ) : toAmount > 0 ? (
                    toAmount.toFixed(6)
                  ) : (
                    <span className="text-foreground-50 dark:text-[#F1EBFB]/50">0</span>
                  )}
                </div>
              </div>
              <div className="space-y-3 text-right">
                <Controller
                  control={control}
                  name="toToken"
                  render={({ field }) => (
                    <TokenSelect
                      {...field}
                      onChange={(token) => {
                        field.onChange(token);
                        const oppositeToken: TokenType =
                          token === 'BOOM' ? 'SOL' : 'BOOM';
                        setValue('fromToken', oppositeToken);
                        setValue('toAmount', 0);
                      }}
                    />
                  )}
                />
                <Typography level="body2" className="font-outfit text-foreground-50 dark:text-[#F1EBFB]/70">
                  {formatNumber(Number(toTokenBalance ?? 0), {
                    minimumFractionDigits: 4,
                    maximumFractionDigits: 4,
                  })}{' '}
                  {toToken}
                </Typography>
              </div>
            </div>
          </div>

          <Button
            disabled={
              isInsufficient ||
              !fromAmount ||
              fromAmount <= 0 ||
              !toAmount ||
              isQuoteLoading ||
              !quote
            }
            type="submit"
            className="mt-6 h-12 w-full rounded-xl bg-[#0089E9] font-outfit text-sm font-semibold uppercase tracking-wide text-white hover:bg-[#0089E9]/90 disabled:bg-foreground-30 disabled:text-foreground-50"
            loading={isSwapping}
          >
            {isQuoteLoading
              ? 'Getting quote...'
              : isInsufficient
                ? 'Insufficient balance'
                : !quote || !toAmount
                  ? 'Enter amount'
                  : 'Swap Now'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface Props extends ControllerRenderProps<any, any> { }

const TokenSelect = React.forwardRef<HTMLButtonElement, Props>((props, ref) => {
  return (
    <Select onValueChange={props.onChange} value={props.value}>
      <SelectTrigger
        ref={ref}
        className="h-10 rounded-xl border-none bg-brand/10 px-3 py-1 font-outfit font-semibold text-brand dark:bg-[rgba(20,159,255,0.15)]"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="rounded-xl border-none bg-white font-outfit dark:bg-[#15172C]">
        {tokenList.map((token) => (
          <SelectItem
            key={token.key}
            value={token.key}
            className="font-outfit dark:text-white dark:focus:bg-[rgba(255,255,255,0.1)]"
          >
            {token.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});

TokenSelect.displayName = 'TokenSelect';

