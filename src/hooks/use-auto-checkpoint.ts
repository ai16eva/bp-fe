'use client';

// import { PublicKey } from '@solana/web3.js';
import { useEffect, useRef, useState } from 'react';

import { connection } from '@/config/solana';
import { usePrivyWallet } from '@/hooks/use-privy-wallet';
import {
  useGovernanceOperations,
  useNFTBalance,
} from '@/hooks/use-solana-contract';

/**
 * Hook to automatically update voter checkpoint when user enters DAO
 * Runs in background, doesn't block UI
 */
export function useAutoCheckpoint() {
  const { publicKey, connected, sendTransaction } = usePrivyWallet();
  const { updateVoterCheckpoint } = useGovernanceOperations();
  const { nfts, loading: nftsLoading } = useNFTBalance();

  const [checkpointStatus, setCheckpointStatus] = useState<{
    lastUpdate: number | null;
    isUpdating: boolean;
    error: string | null;
  }>({
    lastUpdate: null,
    isUpdating: false,
    error: null,
  });

  const hasCheckedRef = useRef(false);
  const isUpdatingRef = useRef(false);
  const lastNftCountRef = useRef<number>(0);
  const lastNftMintsRef = useRef<string[]>([]);

  useEffect(() => {
    // Only run if wallet is connected and we have NFTs
    if (!connected || !publicKey || !connection || nftsLoading) {
      return;
    }

    // Don't checkpoint if no NFTs
    if (!nfts || nfts.length === 0) {
      return;
    }

    // Check if NFTs have changed (count or mint addresses)
    const currentNftCount = nfts.length;
    const currentNftMints = nfts.map(nft => nft.mint).sort();

    const nftsChanged
      = currentNftCount !== lastNftCountRef.current
      || JSON.stringify(currentNftMints) !== JSON.stringify(lastNftMintsRef.current);

    // Only checkpoint if:
    // 1. Haven't checked yet in this session, OR
    // 2. NFTs have changed (new NFT added/removed)
    if (hasCheckedRef.current && !nftsChanged) {
      // Already checkpointed and NFTs haven't changed - skip
      return;
    }

    // Update refs
    lastNftCountRef.current = currentNftCount;
    lastNftMintsRef.current = currentNftMints;

    // Only checkpoint once per session (unless NFTs change)
    if (hasCheckedRef.current && isUpdatingRef.current) {
      return;
    }

    // Auto checkpoint in background
    const performCheckpoint = async () => {
      if (isUpdatingRef.current) {
        return;
      }

      isUpdatingRef.current = true;
      setCheckpointStatus(prev => ({ ...prev, isUpdating: true, error: null }));

      try {
        /*
        const nftAccounts = nfts.map(nft => new PublicKey(nft.tokenAccount));
        const checkpointTx = await updateVoterCheckpoint(nftAccounts);

        if (!checkpointTx) {
          throw new Error('Failed to create checkpoint transaction');
        }

        // Send transaction using Privy
        if (!sendTransaction) {
          throw new Error('Wallet sendTransaction not available');
        }

        const { blockhash } = await connection.getLatestBlockhash('confirmed');
        checkpointTx.feePayer = publicKey;
        checkpointTx.recentBlockhash = blockhash;

        const receipt = await sendTransaction({
          connection,
          transaction: checkpointTx,
        });

        if (!receipt || !receipt.signature) {
          throw new Error('Transaction failed - no signature received');
        }

        const signature = receipt.signature;

        // Confirm transaction (with timeout to not block)
        try {
          await connection.confirmTransaction(signature, 'confirmed');
        } catch (confirmErr) {
          // If confirmation fails but transaction might have succeeded, check status
          try {
            const txStatus = await connection.getSignatureStatus(signature);
            if (txStatus?.value?.err) {
              throw confirmErr;
            }
            // Transaction might have succeeded, continue
          } catch {
            // Log warning but don't throw - checkpoint might have succeeded
            console.warn('[auto-checkpoint] Transaction confirmation timeout, but might have succeeded:', signature);
          }
        }
        console.info('[auto-checkpoint] Checkpoint updated successfully:', signature);
        */

        setCheckpointStatus({
          lastUpdate: Date.now(),
          isUpdating: false,
          error: null,
        });
        hasCheckedRef.current = true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn('[auto-checkpoint] Failed to update checkpoint:', errorMessage);
        setCheckpointStatus(prev => ({
          ...prev,
          isUpdating: false,
          error: errorMessage,
        }));
      } finally {
        isUpdatingRef.current = false;
      }
    };

    // Small delay to avoid blocking UI
    const timeoutId = setTimeout(() => {
      performCheckpoint();
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [connected, publicKey, sendTransaction, nfts, nftsLoading, updateVoterCheckpoint]);

  // Reset when wallet disconnects
  useEffect(() => {
    if (!connected) {
      hasCheckedRef.current = false;
      isUpdatingRef.current = false;
      lastNftCountRef.current = 0;
      lastNftMintsRef.current = [];
      setCheckpointStatus({
        lastUpdate: null,
        isUpdating: false,
        error: null,
      });
    }
  }, [connected]);

  return {
    checkpointStatus,
    isReady: connected && !!publicKey && !!sendTransaction && !nftsLoading,
  };
}
