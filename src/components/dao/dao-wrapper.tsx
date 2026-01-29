'use client';

import { useAuth } from '@/app/auth-provider';
import { WalletOptionsDialog } from '@/components/connect-wallet-solana';
import { DAOContainer } from '@/components/dao/dao-container';
import { usePrivyWallet } from '@/hooks/use-privy-wallet';

import { Delegate } from './delegate';



export function DAOWrapper() {
  const { user, address: sessionAddress } = useAuth();
  const { publicKey } = usePrivyWallet();
  const address = publicKey?.toBase58();

  const isWalletConnected = sessionAddress || address;

  if (!isWalletConnected) {
    return (
      <div className="app-container flex h-[calc(100vh-250px)] justify-center rounded-t-14 py-20">
        <WalletOptionsDialog variant="ghost" className="h-[50px] w-[400px] rounded-full shadow-xl">
          Connect Wallet
        </WalletOptionsDialog>
      </div>
    );
  }

  return (
    <>

      {user && user.delegatedTx
        ? <DAOContainer />
        : <Delegate />}
    </>
  );
}
