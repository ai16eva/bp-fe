'use client';

import { CheckIcon } from 'lucide-react';

import { Typography } from '@/components/ui/typography';
import { useClaimDailyReward } from '@/hooks/use-claim-daily-reward';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { useGetCheckIn, useGetReferralCode } from '@/hooks/use-member';
import { usePrivyWallet } from '@/hooks/use-privy-wallet';
import { useTokenBalance } from '@/hooks/use-solana-contract';
import { useToast } from '@/hooks/use-toast';
import { CopyIcon } from '@/icons/icons';
import { Env } from '@/libs/Env';
import { cn } from '@/utils/cn';
import { formatNumber } from '@/utils/number';
import { maskWalletAddress } from '@/utils/wallet';

// import ExchangeDialog from '../exchange-dialog'; // Temporarily disabled - Exchange service no longer in use
import { ActionButtonList } from '../layouts/action-button-list';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';

export const ProfileInfo = () => {
  const { toast } = useToast();
  const { publicKey } = usePrivyWallet();
  const address = publicKey?.toBase58();

  const [copiedAddress, copyAddress, setCopiedAddress] = useCopyToClipboard();
  const [_, copyInviteLink, setCopiedInviteLink] = useCopyToClipboard();
  const { data: referralCode } = useGetReferralCode(address);
  const inviteLink =
    referralCode?.data?.referral_code && typeof window !== 'undefined'
      ? `${window.location.origin}?referral=${referralCode.data.referral_code}`
      : '';

  const { data: checkInData } = useGetCheckIn(address);

  const handleInviteLink = () => {
    if (!address) {
      toast({
        title: 'Please connect your wallet first',
        variant: 'danger',
      });
      return;
    }

    if (!referralCode?.success) {
      toast({
        title: 'Failed to get referral code',
        variant: 'danger',
      });
      return;
    }

    if (!inviteLink) {
      toast({
        title: 'Referral link not ready',
        description: 'Please try again shortly.',
        variant: 'danger',
      });
      return;
    }

    copyInviteLink(inviteLink).then(() => {
      toast({
        title: 'Invite link copied',
        variant: 'success',
      });

      setTimeout(() => {
        setCopiedInviteLink('');
      }, 1000);
    });
  };

  return (
    <div className="bg-background dark:bg-[#030617]">
      <ActionButtonList title="My Account" />
      <div className="app-container pb-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
          <div className="flex w-full flex-col gap-20 lg:w-[510px]">
            <div className="flex flex-col gap-10 border-b border-foreground-30 pb-10 dark:border-[#2E2C3D]">
              <div className="flex items-center gap-2 md:gap-3">
             <Typography level="body1" className="font-outfit text-base font-medium leading-5 dark:text-white md:text-xl md:leading-6">
                  <span className="md:hidden">
                    {address ? maskWalletAddress(address, 16, 16) : 'Not connected'}
                  </span>
                  <span className="hidden md:inline">
                    {address || 'Not connected'}
                  </span>
                </Typography>
                <button
                  type="button"
                  onClick={() => {
                    if (address) {
                      copyAddress(address).then(() =>
                        setTimeout(() => {
                          setCopiedAddress('');
                        }, 1000)
                      );
                    }
                  }}
                  className="text-brand transition hover:text-brand/80"
                >
                  {copiedAddress ? (
                    <CheckIcon className="h-[23px] w-[23px]" />
                  ) : (
                    <CopyIcon className="h-[23px] w-[23px]" />
                  )}
                </button>
              </div>

              <div className="flex gap-2.5">
                <Actions checkInData={checkInData?.data} />
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <Typography level="h5" className="font-outfit text-xl font-medium leading-6 dark:text-white">
                Referral Code
              </Typography>
              <div className="flex items-center gap-2.5 rounded-[9px] bg-foreground-10 px-4 py-4 dark:bg-[rgba(255,255,255,0.08)]">
                <Typography className="flex-1 truncate font-outfit text-sm font-normal leading-4 dark:text-white">
                  {inviteLink || 'Referral link unavailable'}
                </Typography>
                <button
                  type="button"
                  onClick={handleInviteLink}
                  className="text-brand transition hover:text-brand/80"
                >
                  <CopyIcon className="h-[22px] w-[22px]" />
                </button>
              </div>
            </div>
          </div>

          <AccountCard />
        </div>
      </div>
    </div>
  );
};

const AccountCard = () => {
  const { uiAmount: boomAmount, isLoading: isLoadingBoom } = useTokenBalance(
    Env.NEXT_PUBLIC_BOOM_TOKEN_ADDRESS
  );

  const { uiAmount: usdtAmount, isLoading: isLoadingUsdt } = useTokenBalance(
    Env.NEXT_PUBLIC_USDT_TOKEN_ADDRESS
  );

  const { uiAmount: wsolAmount, isLoading: isLoadingWsol } = useTokenBalance(
    Env.NEXT_PUBLIC_WSOL_TOKEN_ADDRESS
  );

  const { uiAmount: usdcAmount, isLoading: isLoadingUsdc } = useTokenBalance(
    Env.NEXT_PUBLIC_USDC_TOKEN_ADDRESS
  );

  if (isLoadingBoom || isLoadingUsdt || isLoadingWsol || isLoadingUsdc) {
    return (
      <div className="flex w-full flex-1 flex-col gap-6 rounded-3xl bg-foreground-10 p-8 dark:bg-[rgba(255,255,255,0.04)]">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-[119px] w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Skeleton className="h-[80px] w-full rounded-xl" />
          <Skeleton className="h-[80px] w-full rounded-xl" />
          <Skeleton className="h-[80px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const formatTokenAmount = (amount: string | undefined, decimals: number = 2) => {
    const num = Number(amount ?? 0);
    return formatNumber(num, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  return (
    <div className="flex w-full flex-1 flex-col gap-6 rounded-3xl bg-foreground-10 p-8 dark:bg-[rgba(255,255,255,0.04)]">
      <Typography level="h5" className="font-outfit text-xl font-medium leading-6 dark:text-white">
        Total balance
      </Typography>

      <div className="flex h-[119px] items-center justify-center rounded-xl bg-brand/10 px-5 dark:bg-[rgba(20,159,255,0.08)]">
        <Typography level="h3" className="font-outfit text-[32px] font-semibold uppercase leading-[56px] tracking-wide text-brand md:text-[40px]">
          {formatTokenAmount(boomAmount, 2)} BOOM
        </Typography>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex h-[80px] items-center justify-center rounded-xl bg-brand/10 px-4 dark:bg-[rgba(20,159,255,0.08)]">
          <Typography level="body1" className="font-outfit text-lg font-semibold uppercase text-brand">
            {formatTokenAmount(usdtAmount, 2)} USDT
          </Typography>
        </div>
        <div className="flex h-[80px] items-center justify-center rounded-xl bg-brand/10 px-4 dark:bg-[rgba(20,159,255,0.08)]">
          <Typography level="body1" className="font-outfit text-lg font-semibold uppercase text-brand">
            {formatTokenAmount(wsolAmount, 4)} WSOL
          </Typography>
        </div>
        <div className="flex h-[80px] items-center justify-center rounded-xl bg-brand/10 px-4 dark:bg-[rgba(20,159,255,0.08)]">
          <Typography level="body1" className="font-outfit text-lg font-semibold uppercase text-brand">
            {formatTokenAmount(usdcAmount, 2)} USDC
          </Typography>
        </div>
      </div>
    </div>
  );
};


const Actions = ({ checkInData }: { checkInData?: any }) => {
  const { toast } = useToast();
  const { publicKey } = usePrivyWallet();
  const address = publicKey?.toBase58();
  const { handleClaimReward, isClaiming } = useClaimDailyReward();
  const isCheckedInToday = !!checkInData?.daily_reward_id;

  const handleClick = async () => {
    if (!address) {
      toast({
        title: 'Please connect your wallet first',
        variant: 'danger',
      });
      return;
    }

    await handleClaimReward();
  };

  return (
    <>
      <Button
        type="button"
        disabled={isCheckedInToday}
        onClick={handleClick}
        loading={isClaiming}
        className={cn(
          'h-12 flex-1 rounded-xl font-outfit text-sm font-semibold uppercase tracking-wide',
          {
            'bg-foreground-30 text-foreground-50': isCheckedInToday,
            'bg-[#0089E9] text-white hover:bg-[#0089E9]/90': !isCheckedInToday,
          }
        )}
      >
        {isCheckedInToday ? 'Checked in' : 'Check in'}
      </Button>
      {/* Exchange button temporarily disabled - service no longer in use */}
      {/* <ExchangeDialog>
        <Button
          type="button"
          variant="outline"
          className="h-12 flex-1 rounded-xl border-foreground-30 bg-foreground-10 font-outfit text-sm font-semibold uppercase tracking-wide hover:bg-foreground-30 dark:bg-[rgba(246,246,246,0.1)] dark:text-[#F1EBFB] dark:hover:bg-[rgba(246,246,246,0.2)]"
        >
          Exchange
        </Button>
      </ExchangeDialog> */}
    </>
  );
};
