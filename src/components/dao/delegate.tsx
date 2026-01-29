'use client';

import { PublicKey } from '@solana/web3.js';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import CheckIcon from '@/icons/check.svg';

import { useAuth } from '@/app/auth-provider';
import { ROUTES } from '@/config/routes';
import { connection } from '@/config/solana';
import { useUpdateMemberDelegateMutation } from '@/hooks/use-member';
import { usePrivyWallet } from '@/hooks/use-privy-wallet';
import {
  useGovernanceOperations,
  useNFTBalance,
} from '@/hooks/use-solana-contract';
import { useToast } from '@/hooks/use-toast';
import api from '@/libs/api';
import { getPrivySolanaWalletType } from '@/utils/privy-utils';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const welcomeList = [
  { desc: 'You can vote using your voting ticket.' },
  { desc: 'You can vote on proposals.' },
  { desc: 'You can write articles on proposals.' },
];

export const Delegate = () => {
  const { address, reloadUser } = useAuth();
  const { toast } = useToast();
  const { publicKey, sendTransaction, wallet, login, connectWallet, authenticated } = usePrivyWallet();
  const { updateVoterCheckpoint } = useGovernanceOperations();
  const { nfts, refetch: refetchNfts } = useNFTBalance();

  const { mutate: delegateMember, isPending: isDelegating }
    = useUpdateMemberDelegateMutation({
      onSuccess: async () => {
        toast({
          title: 'Delegate success',
          variant: 'success',
        });
        await reloadUser();
      },
      onError: (error) => {
        toast({
          title: 'Oops! Something went wrong',
          description: error?.message,
          variant: 'danger',
        });
      },
    });

  const { mutate: callDelegate, isPending: isCallingContract } = useMutation({
    mutationKey: [],
    mutationFn: async (walletAddress: string) => {
      const walletType = getPrivySolanaWalletType(wallet);

      const ensureMemberExists = async () => {
        try {
          const userResponse = await api.getMember(walletAddress);
          if (userResponse?.data) {
            return;
          }
        } catch (error: any) {
          if (!error?.message?.includes('not found')) {
            // ignore, will try to create below
          }
        }

        try {
          await api.createMemberV2(walletAddress, walletType);
        } catch (createError: any) {
          const isDuplicate
            = createError?.statusCode === 409
            || createError?.status === 409
            || createError?.message?.includes('duplicate');

          if (!isDuplicate) {
            throw createError;
          }
        }
      };

      await ensureMemberExists();

      if (!publicKey || !sendTransaction) {
        throw new Error('Wallet not connected. Please connect your wallet first.');
      }

      let currentNfts = nfts;
      if (!currentNfts || currentNfts.length === 0) {
        currentNfts = await refetchNfts();
      }

      if (!currentNfts || currentNfts.length === 0) {
        throw new Error('You need to have governance NFTs to delegate. Please acquire NFTs first.');
      }

      const nftAccounts = currentNfts.map(nft => new PublicKey(nft.tokenAccount));
      const checkpointTx = await updateVoterCheckpoint(nftAccounts);

      if (!checkpointTx) {
        throw new Error('Failed to create checkpoint transaction');
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

      const checkpointSig = receipt.signature;

      await connection.confirmTransaction(checkpointSig, 'finalized');

      const txInfo = await connection.getTransaction(checkpointSig, { commitment: 'finalized' });
      if (txInfo?.meta?.err) {
        throw new Error(`Checkpoint transaction failed: ${JSON.stringify(txInfo.meta.err)}`);
      }

      await sleep(2000);

      return { transactionHash: checkpointSig, status: 'success' } as any;
    },
    onSuccess: (transactionReceipt) => {
      if (transactionReceipt.status === 'success') {
        delegateMember({
          wallet: publicKey?.toBase58() as string,
          delegated_tx: transactionReceipt.transactionHash,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Oops! Something went wrong',
        description: error?.message,
        variant: 'danger',
      });
    },
  });

  const handleDelegate = () => {
    try {
      if (!address && !publicKey) {
        if (authenticated) {
          connectWallet();
        } else {
          login();
        }
        return;
      }

      if (!publicKey) {
        if (authenticated) {
          connectWallet();
        } else {
          login();
        }
        return;
      }

      callDelegate(publicKey.toBase58());
    } catch (error: any) {
      toast({
        title: 'Oops! Something went wrong',
        description: error?.message,
        variant: 'danger',
      });
    }
  };

  return (
    <>
      <div className="flex px-4 max-xl:mt-6 max-xl:mb-12 xl:min-h-[680px] items-center justify-center xl:py-12">
        <div className="flex w-full max-w-[800px] flex-col items-center justify-center gap-5 xl:gap-8 rounded-[32px] bg-white/[0.04] dark:bg-white/[0.04] bg-gray-100/80 p-5 xl:p-8 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-1">
            <h1 className="font-outfit text-[30px] md:text-[48px] font-medium leading-[140%] text-gray-900 dark:text-white text-center">
              Welcome to Boomplay
            </h1>
            <p className="font-outfit text-sm md:text-base font-normal leading-[140%] text-custom-blue-500 text-center">
              DELEGATE MYSELF
            </p>
            <p className="font-outfit text-xs md:text-base font-normal leading-[140%] text-gray-700 dark:text-white text-center">
              If you delegate, you can act as a member of dao.
            </p>
          </div>

          <div className="flex flex-col items-start gap-[13px] rounded-[24px] border border-custom-blue-500 bg-custom-blue-500/[0.08] p-5 xl:p-8">
            {welcomeList.map((item) => (
              <div key={item.desc} className="flex items-center gap-2">
                <Image
                  src={CheckIcon}
                  alt="Check"
                  width={24}
                  height={24}
                  className="shrink-0"
                />
                <p className="font-outfit text-sm md:text-base font-light leading-[140%] text-gray-800 dark:text-white">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-6">
            <p className="font-outfit text-sm md:text-base font-normal leading-[140%] text-gray-700 dark:text-white text-center max-w-[320px] xl:max-w-[736px]">
              Would you like to participate in the dao by proceeding with the delegate?
            </p>

            <div className="flex items-center gap-6">
              <Link href={ROUTES.HOME}>
                <button className="flex h-12 w-[140px] xl:w-[180px] items-center justify-center rounded-xl bg-gray-200 dark:bg-white/10 px-6 py-3.5 font-outfit text-sm font-semibold uppercase text-gray-700 dark:text-[#F1EBFB] transition-colors hover:bg-gray-300 dark:hover:bg-white/20">
                  NO
                </button>
              </Link>

              <button
                onClick={handleDelegate}
                disabled={isCallingContract || isDelegating}
                className="flex h-12 w-[140px] xl:w-[180px] items-center justify-center rounded-xl bg-[#0089E9] px-6 py-3.5 font-outfit text-sm font-semibold uppercase text-white transition-colors hover:bg-[#0089E9]/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCallingContract || isDelegating ? 'LOADING...' : 'YES'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
