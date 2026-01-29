import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl, Connection } from '@solana/web3.js';

import { Env } from '@/libs/Env';

// Map environment to Solana network
export const getSolanaNetwork = (): WalletAdapterNetwork => {
  switch (Env.NEXT_PUBLIC_NETWORK) {
    case 'mainnet':
      return WalletAdapterNetwork.Mainnet;
    case 'testnet':
      return WalletAdapterNetwork.Testnet;
    case 'devnet':
      return WalletAdapterNetwork.Devnet;
    default:
      return WalletAdapterNetwork.Devnet;
  }
};

// Get RPC endpoint based on environment
export const getRpcEndpoint = (): string => {
  const network = getSolanaNetwork();

  // Use custom RPC if available from env
  if (Env.NEXT_PUBLIC_SOLANA_RPC_URL) {
    return Env.NEXT_PUBLIC_SOLANA_RPC_URL;
  }

  // Fallback to default public RPCs
  return clusterApiUrl(network);
};

// Create connection instance
export const connection = new Connection(getRpcEndpoint(), {
  commitment: 'confirmed',
  confirmTransactionInitialTimeout: 60000,
});

// Export network for use in wallet providers
export const solanaNetwork = getSolanaNetwork();
