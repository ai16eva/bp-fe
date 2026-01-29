import { BN } from '@coral-xyz/anchor';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { connection } from '@/config/solana';
import { usePrivyWallet } from '@/hooks/use-privy-wallet';
import { useGovernanceSDK } from '@/hooks/use-solana-contract';
import { useToast } from '@/hooks/use-toast';
import { SolanaTransactionService } from '@/services/solana-transaction.service';
import {
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import { Transaction } from '@solana/web3.js';
import { appQueryKeys } from '@/config/query';

export function useClaimReward(questKey: string) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { publicKey, sendTransaction } = usePrivyWallet();
    const governance = useGovernanceSDK();

    const txService = useMemo(() => new SolanaTransactionService(connection), []);

    return useMutation({
        mutationKey: ['claim-reward', questKey],
        mutationFn: async () => {
            if (!publicKey || !sendTransaction || !governance) {
                throw new Error('Wallet not connected or SDK not ready');
            }

            // 1. Fetch Governance Config to get Base Token Mint
            const config = await governance.fetchConfig();
            if (!config) throw new Error('Failed to fetch Governance Config');

            const baseTokenMint = config.baseTokenMint;

            // 2. Derive User's Associated Token Account (ATA)
            const userTokenAccount = await getAssociatedTokenAddress(
                baseTokenMint,
                publicKey,
                false,
                TOKEN_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID
            );

            const transaction = new Transaction();

            // 3. Check if ATA exists, if not, create it
            const accountInfo = await connection.getAccountInfo(userTokenAccount);
            if (!accountInfo) {
                console.log('Creating Associated Token Account for user...');
                transaction.add(
                    createAssociatedTokenAccountInstruction(
                        publicKey, // payer
                        userTokenAccount, // ata
                        publicKey, // owner
                        baseTokenMint, // mint
                        TOKEN_PROGRAM_ID,
                        ASSOCIATED_TOKEN_PROGRAM_ID
                    )
                );
            }

            // 4. Create Claim Reward Instruction
            const tx = await governance.distributeReward(
                new BN(questKey),
                publicKey,
                userTokenAccount
            );

            transaction.add(...tx.instructions);

            // 5. Prepare and Send Transaction
            const preparedTx = await txService.prepareTransactionForPrivy(
                transaction,
                publicKey
            );

            const receipt = await sendTransaction({
                connection,
                transaction: preparedTx,
            } as any);

            if (!receipt?.signature) {
                throw new Error('Transaction failed - no signature returned');
            }

            // 6. Confirm Transaction
            await connection.confirmTransaction(receipt.signature, 'confirmed');
            return receipt.signature;
        },
        onSuccess: (signature) => {
            toast({
                title: 'Reward claimed successfully!',
                description: `Signature: ${signature.slice(0, 8)}...`,
                variant: 'success'
            });
            // Invalidate queries to refresh UI
            queryClient.invalidateQueries({
                queryKey: [...appQueryKeys.quests.dao]
            });
        },
        onError: (error: Error) => {
            console.error('Claim Reward Error:', error);
            toast({
                title: 'Failed to claim reward',
                description: error.message,
                variant: 'danger'
            });
        }
    });
}
