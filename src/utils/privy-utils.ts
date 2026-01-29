export const getActiveSolanaAddress = (user: any): string | undefined => {
  if (!user) {
    return undefined;
  }

  const walletAddress = user?.wallet?.address as string | undefined;
  if (walletAddress) {
    return walletAddress;
  }

  const linked = (user?.linkedAccounts || []) as any[];
  const sol = linked.find(
    a => a?.type === 'wallet' && typeof a.address === 'string',
  );

  if (sol?.address) {
    return sol.address;
  }

  return undefined;
};

export const getPrivySolanaAddress = (wallets: any[]): string | undefined => {
  const embeddedWallet = wallets.find(
    wallet => wallet.walletClientType === 'privy',
  );

  if (embeddedWallet) {
    return embeddedWallet.publicKey?.toBase58?.() || embeddedWallet.address;
  }

  return undefined;
};

export const getPrivySolanaWallet = (wallets: any[]): any | undefined => {
  if (!Array.isArray(wallets) || wallets.length === 0) {
    return undefined;
  }

  const privySolanaWallet = wallets.find(
    wallet => wallet.walletClientType === 'privy' && wallet.chainType === 'solana',
  );

  if (privySolanaWallet) {
    return privySolanaWallet;
  }

  const embeddedWallet = wallets.find(
    wallet => wallet.walletClientType === 'privy',
  );

  if (embeddedWallet) {
    return embeddedWallet;
  }

  return wallets[0];
};

export const getPrivySolanaWalletType = (wallet: any): string => {
  if (!wallet) {
    return 'UNKNOWN';
  }

  if (wallet.walletClientType === 'privy') {
    return 'PRIVY';
  }

  const name = wallet.name?.toUpperCase?.() || '';
  if (name.includes('PHANTOM')) {
    return 'PHANTOM';
  }
  if (name.includes('SOLFLARE')) {
    return 'SOLFLARE';
  }
  if (name.includes('BACKPACK')) {
    return 'BACKPACK';
  }

  return 'UNKNOWN';
};

export const signMessageWithPrivy = async (
  privyWallet: any,
  messageBytes: Uint8Array,
): Promise<Uint8Array> => {
  try {
    if (!privyWallet || typeof privyWallet.signMessage !== 'function') {
      throw new Error(
        'Privy wallet not available or doesn\'t support message signing',
      );
    }

    const result = await privyWallet.signMessage(messageBytes);

    if (result instanceof Uint8Array) {
      return result;
    }

    if (result?.signature instanceof Uint8Array) {
      return result.signature;
    }

    if (result?.signedMessage?.signature instanceof Uint8Array) {
      return result.signedMessage.signature;
    }

    throw new Error('Invalid signature format from Privy wallet');
  } catch (error: any) {
    throw new Error(
      `Failed to sign message with Privy wallet: ${error.message}`,
    );
  }
};
