import { Metaplex } from '@metaplex-foundation/js';
import { getMint } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';

import { connection } from '@/config/solana';
import { Env } from '@/libs/Env';

const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

const KNOWN_TOKENS: Record<string, { decimals: number; symbol: string; name: string }> = {
  ...(Env.NEXT_PUBLIC_USDT_TOKEN_ADDRESS && {
    [Env.NEXT_PUBLIC_USDT_TOKEN_ADDRESS]: { decimals: 9, symbol: 'USDT', name: 'USDT Token' },
  }),
  ...(Env.NEXT_PUBLIC_BOOM_TOKEN_ADDRESS && {
    [Env.NEXT_PUBLIC_BOOM_TOKEN_ADDRESS]: { decimals: 9, symbol: 'BOOM', name: 'Boom Token' },
  }),
  ...(Env.NEXT_PUBLIC_USDC_TOKEN_ADDRESS && {
    [Env.NEXT_PUBLIC_USDC_TOKEN_ADDRESS]: { decimals: 6, symbol: 'USDC', name: 'USD Coin' },
  }),
};

export const useGetTokenInfoSolana = (mintOrTokenAccount: string) => {
  const { data, ...rest } = useQuery({
    queryKey: ['token-info-solana', mintOrTokenAccount],
    queryFn: async () => {
      try {
        if (!mintOrTokenAccount) {
          throw new Error('Empty address');
        }

        const inputKey = new PublicKey(mintOrTokenAccount);
        let mintPubkey = inputKey;

        try {
          const accInfo = await connection.getParsedAccountInfo(inputKey);
          const ownerProgram = accInfo.value?.owner?.toBase58?.();
          const parsed: any = accInfo.value?.data as any;
          const isTokenAccount
            = ownerProgram === TOKEN_PROGRAM_ID
            && parsed?.parsed?.type === 'account'
            && parsed?.parsed?.info?.mint;
          if (isTokenAccount) {
            mintPubkey = new PublicKey(parsed.parsed.info.mint);
          }
        } catch (_) { }

        const mintInfo = await getMint(connection, mintPubkey);

        // Check known tokens first
        const knownToken = KNOWN_TOKENS[mintPubkey.toBase58()];
        let symbol = knownToken?.symbol || 'UNKNOWN';
        let name = knownToken?.name || 'Unknown Token';

        // Try to fetch from Metaplex if not a known token
        if (!knownToken) {
          try {
            const metaplex = Metaplex.make(connection);
            const metadata = await metaplex.nfts().findByMint({
              mintAddress: mintPubkey,
              loadJsonMetadata: false as any,
            });
            symbol = metadata?.symbol || symbol;
            name = metadata?.name || name;
          } catch (metaplexError) {
            // Metaplex failed, use default values
          }
        }

        return {
          decimals: mintInfo.decimals,
          symbol,
          name,
          supply: mintInfo.supply.toString(),
          mintAuthority: mintInfo.mintAuthority?.toBase58() || null,
          freezeAuthority: mintInfo.freezeAuthority?.toBase58() || null,
        };
      } catch (error) {
        // Use known token info as fallback
        const knownToken = KNOWN_TOKENS[mintOrTokenAccount];
        if (knownToken) {
          return {
            decimals: knownToken.decimals,
            symbol: knownToken.symbol,
            name: knownToken.name,
            supply: undefined,
            mintAuthority: null,
            freezeAuthority: null,
          };
        }
        return {
          decimals: 0,
          symbol: 'N/A',
          name: undefined,
          supply: undefined,
          mintAuthority: null,
          freezeAuthority: null,
          error: (error as Error)?.message,
        } as any;
      }
    },
    enabled: !!mintOrTokenAccount && mintOrTokenAccount.length > 0,
    staleTime: 10 * 60 * 1000,
    retry: 0,
  });

  return {
    decimals: (data as any)?.decimals ?? 0,
    symbol: (data as any)?.symbol ?? 'N/A',
    name: (data as any)?.name,
    supply: (data as any)?.supply,
    mintAuthority: (data as any)?.mintAuthority,
    freezeAuthority: (data as any)?.freezeAuthority,
    ...rest,
  };
};
