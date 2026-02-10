'use client';

import { BN } from '@coral-xyz/anchor';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { PublicKey, Transaction } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { connection } from '@/config/solana';
import { usePrivyWallet } from '@/hooks/use-privy-wallet';
import api from '@/libs/api';
import type { NFTItem } from '@/types/schema';

import type { MarketData } from '../../solana-sdk/src/BPMarket';
import { BPMarketSDK } from '../../solana-sdk/src/BPMarket';
import { GovernanceSDK } from '../../solana-sdk/src/Governance';

export type SolanaWalletApi = {
  publicKey?: PublicKey;
  connected: boolean;
  signTransaction?: (tx: Transaction) => Promise<Transaction>;
  signAllTransactions?: (txs: Transaction[]) => Promise<Transaction[]>;
  signMessage?: (message: Uint8Array) => Promise<Uint8Array>;
};

interface TokenBalanceData {
  balance: BN;
  decimals: number;
}

export function useSolanaWallet(): SolanaWalletApi & {
  connection: typeof connection;
  ready?: boolean;
  authenticated?: boolean;
  sendTransaction?: (params: {
    transaction: any;
    connection: typeof connection;
  }) => Promise<any>;
} {
  const {
    publicKey,
    connected,
    signMessage,
    ready,
    authenticated,
    sendTransaction,
  } = usePrivyWallet();

  return useMemo(
    () => ({
      publicKey: publicKey ?? undefined,
      connected,
      signTransaction: undefined,
      signAllTransactions: undefined,
      signMessage,
      connection,
      ready,
      authenticated,
      sendTransaction,
    }),
    [publicKey, connected, signMessage, ready, authenticated, sendTransaction]
  );
}

export function useBPMarketSDK(): BPMarketSDK | undefined {
  return useMemo(() => {
    if (!connection) {
      return undefined as unknown as BPMarketSDK | undefined;
    }
    return new BPMarketSDK(connection);
  }, []);
}

export function useGovernanceSDK(): GovernanceSDK | undefined {
  return useMemo(() => {
    if (!connection) {
      return undefined as unknown as GovernanceSDK | undefined;
    }
    return new GovernanceSDK(connection);
  }, []);
}

export function useMarketOperations() {
  const { publicKey, sendTransaction: walletSendTransaction } =
    usePrivyWallet();
  const bpMarketSDK = useBPMarketSDK();

  const fetchMarket = useCallback(
    async (marketKey: BN) => {
      if (!bpMarketSDK) {
        return null;
      }

      try {
        return await bpMarketSDK.fetchMarket(marketKey);
      } catch (error) {
        console.error('Error fetching market:', error);
        return null;
      }
    },
    [bpMarketSDK]
  );

  const sendTransaction = useCallback(
    async (transaction: Transaction) => {
      if (!walletSendTransaction || !connection || !publicKey) {
        return null;
      }

      try {
        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash('confirmed');

        const freshTx = new Transaction({
          feePayer: publicKey,
          recentBlockhash: blockhash,
        });
        for (const ix of transaction.instructions) {
          freshTx.add(ix);
        }

        // Privy sendTransaction takes { connection, transaction }
        const receipt = await walletSendTransaction({
          connection,
          transaction: freshTx,
        });

        if (!receipt || !receipt.signature) {
          throw new Error('Transaction failed - no signature received');
        }

        const signature = receipt.signature;

        await connection.confirmTransaction(
          { signature, blockhash, lastValidBlockHeight },
          'confirmed'
        );

        return {
          signature,
          success: true,
        };
      } catch (error) {
        console.error('Error sending transaction:', error);
        return {
          signature: null,
          success: false,
          error: error instanceof Error ? error.message : 'Transaction failed',
        };
      }
    },
    [walletSendTransaction, publicKey]
  );

  return {
    fetchMarket,
    sendTransaction,
    isReady: !!bpMarketSDK && !!publicKey,
  };
}

export function useTokenBalance(mintAddress?: string) {
  const NATIVE_SOL = 'So11111111111111111111111111111111111111112';
  const { publicKey } = usePrivyWallet();

  const { data, isLoading, error, refetch } = useQuery<TokenBalanceData>({
    queryKey: ['tokenBalance', publicKey?.toBase58(), mintAddress],

    queryFn: async (): Promise<TokenBalanceData> => {
      if (!connection || !publicKey || !mintAddress) {
        throw new Error('Missing required parameters');
      }

      try {
        if (mintAddress === NATIVE_SOL) {
          const balance = await connection.getBalance(publicKey);
          return {
            balance: new BN(balance),
            decimals: 9,
          };
        }

        const mint = new PublicKey(mintAddress);
        const ata = await getAssociatedTokenAddress(mint, publicKey);
        const accountInfo = await connection.getTokenAccountBalance(ata);

        return {
          balance: new BN(accountInfo.value.amount),
          decimals: accountInfo.value.decimals,
        };
      } catch (err: any) {
        if (err?.message?.includes('could not find account')) {
          return {
            balance: new BN(0),
            decimals: 9,
          };
        }
        throw err;
      }
    },

    enabled: !!connection && !!publicKey && !!mintAddress,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount: number, error: any) => {
      if (error?.response?.status === 429) {
        return false;
      }
      if (error?.message?.includes('could not find account')) {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
  });

  const balance = data?.balance ?? new BN(0);
  const decimals = data?.decimals ?? 9;
  const uiAmount = (Number(balance.toString()) / 10 ** decimals).toString();

  return {
    balance: BigInt(balance.toString()),
    decimals,
    uiAmount,
    symbol: '',
    data: data ? { amount: balance.toString(), decimals, uiAmount } : undefined,
    isLoading,
    error: error as Error | null,
    refetch,
    getQueryKeys: (tokenAddress?: string) => [
      'tokenBalance',
      publicKey?.toBase58(),
      tokenAddress,
    ],
    queryKey: ['tokenBalance', publicKey?.toBase58(), mintAddress],
  };
}

export function useNFTBalance(
  collectionAddress?: PublicKey,
  fallbackAddress?: string | null
) {
  const { publicKey } = usePrivyWallet();
  const governance = useGovernanceSDK();
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveAddress = useMemo(() => {
    if (publicKey) {
      return publicKey.toBase58();
    }
    if (fallbackAddress) {
      return fallbackAddress;
    }
    return null;
  }, [publicKey, fallbackAddress]);

  const fetchNFTs = useCallback(async (): Promise<NFTItem[]> => {
    if (!effectiveAddress || !governance) {
      setNfts([]);
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const [collectionMintPDA] = governance.getCollectionMintPDA();
      const collectionMint = collectionAddress || collectionMintPDA;

      const response = await api.getUserNFTs(
        effectiveAddress,
        collectionMint.toBase58()
      );

      if (!response.data || response.success !== 1) {
        throw new Error('Failed to fetch NFTs from API');
      }

      const nftAccounts: NFTItem[] = response.data.nfts;

      setNfts(nftAccounts);
      return nftAccounts;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch NFTs');
      setNfts([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [effectiveAddress, governance, collectionAddress]);

  useEffect(() => {
    fetchNFTs();
  }, [fetchNFTs]);

  const refetch = useCallback(() => {
    return fetchNFTs();
  }, [fetchNFTs]);

  return {
    nfts,
    loading,
    error,
    refetch,
    count: nfts.length,
    balance: nfts.length,
  };
}

export function useGovernanceOperations() {
  const { publicKey } = usePrivyWallet();
  const governance = useGovernanceSDK();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProposal = useCallback(
    async (proposalKey: BN, title: string) => {
      if (!governance || !publicKey) {
        return null;
      }
      setLoading(true);
      setError(null);
      try {
        return await governance.createProposal(proposalKey, title, publicKey);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to create proposal');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [governance, publicKey]
  );

  const voteQuest = useCallback(
    async (questKey: BN, voteChoice: 'approve' | 'reject') => {
      if (!governance || !publicKey) {
        return null;
      }
      setLoading(true);
      setError(null);
      try {
        const choiceIndex = voteChoice === 'approve' ? 1 : 0;
        return await governance.voteQuest(questKey, choiceIndex, publicKey);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to vote');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [governance, publicKey]
  );

  const voteDecision = useCallback(
    async (questKey: BN, voteChoice: 'success' | 'adjourn') => {
      if (!governance || !publicKey) {
        return null;
      }
      setLoading(true);
      setError(null);
      try {
        return await governance.voteDecision(questKey, voteChoice, publicKey);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to vote decision');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [governance, publicKey]
  );

  const voteAnswer = useCallback(
    async (questKey: BN, answerKey: BN) => {
      if (!governance || !publicKey) {
        return null;
      }
      setLoading(true);
      setError(null);
      try {
        return await governance.voteAnswer(questKey, answerKey, publicKey);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to vote answer');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [governance, publicKey]
  );

  const fetchProposal = useCallback(
    async (proposalKey: BN) => {
      if (!governance) {
        return null;
      }
      try {
        return await governance.fetchProposal(proposalKey);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to fetch proposal');
        return null;
      }
    },
    [governance]
  );

  const updateVoterCheckpoint = useCallback(
    async (nftTokenAccounts: PublicKey[]) => {
      if (!governance || !publicKey) {
        return null;
      }
      setLoading(true);
      setError(null);
      try {
        return await governance.updateVoterCheckpoint(
          publicKey,
          nftTokenAccounts
        );
      } catch (e) {
        setError(
          e instanceof Error ? e.message : 'Failed to update checkpoint'
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [governance, publicKey]
  );

  const fetchVoterCheckpoints = useCallback(async () => {
    if (!governance || !publicKey) {
      return null;
    }
    try {
      const [voterCheckpointsPDA] =
        governance.getVoterCheckpointsPDA(publicKey);
      return await governance.program.account.voterCheckpoints.fetchNullable(
        voterCheckpointsPDA
      );
    } catch (e) {
      console.warn('Failed to fetch voter checkpoints:', e);
      return null;
    }
  }, [governance, publicKey]);

  return {
    createProposal,
    voteQuest,
    voteDecision,
    voteAnswer,
    fetchProposal,
    updateVoterCheckpoint,
    fetchVoterCheckpoints,
    governance, // Expose governance SDK for direct access
    loading,
    error,
    isReady: !!governance && !!publicKey && !!connection,
  };
}

export function useAdminOperations() {
  const { publicKey } = usePrivyWallet();
  const market = useBPMarketSDK();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publishMarket = useCallback(
    async (marketData: MarketData) => {
      if (!market || !publicKey) {
        return null;
      }
      setLoading(true);
      setError(null);
      try {
        return await market.publishMarket(marketData, publicKey);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to publish market');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [market, publicKey]
  );

  return {
    publishMarket,
    loading,
    error,
    isReady: !!publicKey && !!market,
  };
}
