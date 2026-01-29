'use client';

import { useAuth } from '@/app/auth-provider';
import { WalletOptionsDialog } from '@/components/connect-wallet-solana';

import { ProfileActivities } from './profile-activities';
import { ProfileInfo } from './profile-info';

export const ProfileSection = () => {
  const { address } = useAuth();

  if (!address) {
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
      <ProfileInfo />
      <ProfileActivities />
    </>
  );
};
