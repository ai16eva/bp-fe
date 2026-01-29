import { Env } from '@/libs/Env';

export function maskWalletAddress(
  address: string,
  startLength: number = 6,
  endLength: number = 4,
): string {
  // Check if it's a valid Solana address (base58, 32-44 chars)
  const isSolanaAddress = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);

  if (!isSolanaAddress) {
    throw new Error('Invalid Solana address');
  }

  // Truncate and mask the address
  const start = address.slice(0, startLength);
  const end = address.slice(-endLength);

  return `${start}...${end}`;
}

export function truncateSignature(
  signature: string,
  startLength: number = 6,
  endLength: number = 4,
): string {
  if (signature.length <= startLength + endLength) {
    return signature;
  }

  const start = signature.slice(0, startLength);
  const end = signature.slice(-endLength);

  return `${start}...${end}`;
}

export const getExplorerUrl = (type: 'address' | 'tx', value: string) => {
  const env = Env.NEXT_PUBLIC_NETWORK;

  // Solscan URLs
  if (env === 'mainnet') {
    return `https://solscan.io/${type}/${value}`;
  } else if (env === 'devnet') {
    return `https://solscan.io/${type}/${value}?cluster=devnet`;
  } else {
    return `https://solscan.io/${type}/${value}?cluster=testnet`;
  }
};
