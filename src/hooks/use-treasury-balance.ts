import { BN } from '@coral-xyz/anchor';
import { useQuery } from '@tanstack/react-query';
import { connection } from '@/config/solana';
import { useGovernanceSDK } from '@/hooks/use-solana-contract';

export function useTreasuryBalance() {
    const governance = useGovernanceSDK();

    return useQuery({
        queryKey: ['treasury-balance'],
        queryFn: async () => {
            if (!governance || !connection) return new BN(0);

            const [treasuryTokenAccount] = governance.getTreasuryTokenAccountPDA();

            try {
                const balance = await connection.getTokenAccountBalance(treasuryTokenAccount);
                return new BN(balance.value.amount);
            } catch (e) {
                console.warn('Failed to fetch treasury balance (might be empty/not created):', e);
                return new BN(0);
            }
        },
        enabled: !!governance && !!connection,
        staleTime: 60000, // 1 minute
    });
}
