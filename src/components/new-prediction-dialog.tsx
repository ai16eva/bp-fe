'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { now, formatKST } from '@/utils/timezone';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import type { PropsWithChildren } from 'react';
import React, { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Plus } from 'lucide-react';
import { useAuth } from '@/app/auth-provider';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { appQueryKeys } from '@/config/query';
import { ROUTES } from '@/config/routes';
import { useFetchCategories } from '@/hooks/use-categories';
import { useGetGovernanceConfig, useNFTConfig } from '@/hooks/use-contract';
import { useCreateGovernanceItemMutation } from '@/hooks/use-dao-quests';
import { useAddQuestMutation, useDraftQuestMutation } from '@/hooks/use-quest';
import { useFetchActiveSeason } from '@/hooks/use-seasons';
import { useNFTBalance, useSolanaWallet } from '@/hooks/use-solana-contract';
import { useToast } from '@/hooks/use-toast';
import { useWalletSignature } from '@/hooks/use-wallet-signature';
import type { AddQuestResponse } from '@/types/schema';
import {
  getSocialMediaCheck,
  uploadUrlThumbnail,
  uploadYouTubeThumbnail,
} from '@/utils/sns';
import { DateTimePicker } from '@/components/ui/calendar';
import { Env } from '@/libs/Env';

type NewPredictionDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
} & PropsWithChildren;

const imageSource = [
  {
    key: 'image',
    name: 'Image',
  },
  {
    key: 'sns-url',
    name: 'SNS url',
  },
];

/**
 * Betting tokens configuration
 * Uses environment variables to ensure correct token addresses for mainnet/devnet
 */
const getBettingTokens = () => [
  {
    value: Env.NEXT_PUBLIC_BOOM_TOKEN_ADDRESS,
    label: 'BoomPlay Token (BOOM)',
    symbol: 'BOOM',
  },
  {
    value: Env.NEXT_PUBLIC_WSOL_TOKEN_ADDRESS || 'So11111111111111111111111111111111111111112',
    label: 'Wrapped SOL (WSOL)',
    symbol: 'WSOL',
  },
  {
    value: Env.NEXT_PUBLIC_USDT_TOKEN_ADDRESS,
    label: 'USDT',
    symbol: 'USDT',
  },
  {
    value: Env.NEXT_PUBLIC_USDC_TOKEN_ADDRESS || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    label: 'USDC',
    symbol: 'USDC',
  },
];

const BaseSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters long')
    .max(256, 'Title must be at most 256 characters long'),

  description: z
    .string()
    .min(3, 'Description must be at least 3 characters long')
    .max(500, 'Description must be at most 500 characters long'),

  category: z.string().min(1, 'Category is required'),

  bettingToken: z.string().min(1, 'Betting token is required'),

  endTime: z.date({
    required_error: 'End time is required',
  }),

  answers: z
    .string()
    .trim()
    .min(1, 'Option is required')
    .array()
    .min(2, 'There must be at least two options'),
});

const FormSchema = z.discriminatedUnion('imageType', [
  z
    .object({
      imageType: z.literal('image'),
      image: z
        .instanceof(File, { message: 'Image is required' })
        .refine((file) => file instanceof File, {
          message: 'Expected a file upload',
        }),
    })
    .merge(BaseSchema),
  z
    .object({
      imageType: z.literal('sns-url'),
      image: z.string().url({ message: 'Invalid URL format' }),
    })
    .merge(BaseSchema),
]);

export default function NewPredictionDialog({
  children,
  open,
  onOpenChange,
}: NewPredictionDialogProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { questDuration } = useGetGovernanceConfig();
  const { mintRequiredNFT } = useNFTConfig();
  const { nftBalance } = useAuth();
  const { nfts, refetch: refetchNFTs } = useNFTBalance();
  const { publicKey } = useSolanaWallet();
  const { createSignature, hasSignature } = useWalletSignature(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: '',
      description: '',
      imageType: 'image',
      bettingToken: getBettingTokens()[0]?.value ?? Env.NEXT_PUBLIC_BOOM_TOKEN_ADDRESS,
      answers: ['Option 1', 'Option 2'],
    },
  });

  const {
    watch,
    control,
    resetField,
    formState: { errors, isSubmitting },
  } = form;

  const wImageType = watch('imageType', 'image');

  const { fields, append, remove } = useFieldArray({
    control,
    // @ts-expect-error ignore
    name: 'answers',
  });

  const { data } = useFetchCategories();
  const categories = data?.data ?? [];

  const { data: activeSeason } = useFetchActiveSeason();

  const queryClient = useQueryClient();

  const { mutate: addQuest, isPending: isAddingQuest } = useAddQuestMutation({
    onSuccess: async (quest) => {
      if (!quest?.data) {
        return;
      }

      try {
        await setupCreatorNFTAndGovernanceItem(quest.data);
        const startQuest = now();
        const endQuest = now().add(Math.min(questDuration, 24), 'hour');

        draftQuest({
          quest_key: quest.data.quest_key!,
          start_at: formatKST(startQuest, 'YYYY-MM-DD HH:mm:ss'),
          end_at: formatKST(endQuest, 'YYYY-MM-DD HH:mm:ss'),
        });
      } catch (e: any) {
        toast({
          title: 'Oops! Something went wrong',
          description: e?.message || 'Unable to create governance item.',
          variant: 'danger',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Oops! Something went wrong',
        description: error?.message,
        variant: 'danger',
      });
    },
  });

  const { mutate: draftQuest, isPending: isDrafting } = useDraftQuestMutation({
    onSuccess: async () => {
      toast({
        title: 'Quest created successfully',
        variant: 'success',
      });
      form.reset();
      onOpenChange?.(false);

      queryClient.invalidateQueries({
        queryKey: [...appQueryKeys.quests.dao, 'draft'],
      });
      router.push(ROUTES.DAO);
    },
    onError: (error) => {
      toast({
        title: 'Oops! Something went wrong',
        description: error?.message,
        variant: 'danger',
      });
    },
  });

  const {
    mutateAsync: createGovernanceItem,
    isPending: isCreatingGovernanceItem,
  } = useCreateGovernanceItemMutation();

  function getCreatorNftAccount(): string {
    if (!nfts || nfts.length === 0) {
      throw new Error('No NFTs found. Please mint an NFT first.');
    }

    const firstNft = nfts[0];
    if (!firstNft) {
      throw new Error('No NFTs found. Please mint an NFT first.');
    }

    const tokenAccount = firstNft.tokenAccount;

    if (!tokenAccount || tokenAccount.trim() === '') {
      throw new Error(
        'NFT token account is missing. Please refresh and try again.'
      );
    }

    if (publicKey && tokenAccount === publicKey.toBase58()) {
      throw new Error(
        'NFT token account appears to be incorrect. Please refresh the page and try again.'
      );
    }

    return tokenAccount;
  }

  async function setupCreatorNFTAndGovernanceItem(quest: AddQuestResponse) {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    if (nftBalance < mintRequiredNFT) {
      throw new Error(
        `You need at least ${mintRequiredNFT} NFT(s) to create a quest. You currently have ${nftBalance}.`
      );
    }

    try {
      await refetchNFTs();
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch {
      // Continue with cached data if refetch fails
    }

    if (!hasSignature) {
      try {
        const signature = await createSignature();
        if (!signature || !signature.message || !signature.signature) {
          throw new Error('Failed to get wallet signature');
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        throw new Error(
          `Please sign the message with your wallet to create a quest: ${errorMessage}`
        );
      }
    }

    const creatorNftAccount = getCreatorNftAccount();

    await createGovernanceItem({
      questKey: quest.quest_key!,
      creatorNftAccount,
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      if (!publicKey) {
        toast({
          title: 'Please connect your wallet first',
        });
        return;
      }
      const season = activeSeason?.data;
      if (!season) {
        toast({
          title: 'No active season found',
        });
        return;
      }

      if (data.imageType === 'sns-url') {
        const snsInfo = await getSocialMediaCheck(data.image);

        if (snsInfo.check) {
          let thumbnail;

          if (snsInfo.snsType === 'Y' && !!snsInfo.snsId) {
            thumbnail = await uploadYouTubeThumbnail(snsInfo.snsId);

            if (thumbnail.thumbnail) {
              data.image = thumbnail;
            } else {
              data.image = `https://img.youtube.com/vi/${snsInfo.snsId}/maxresdefault.jpg`;
            }
          } else if (snsInfo.imageUrl && snsInfo.imageUrl !== '') {
            thumbnail = await uploadUrlThumbnail(data.image);

            if (thumbnail.thumbnail) {
              data.image = thumbnail;
            }
          }
        } else {
          toast({
            title: 'Oops! Something went wrong',
            description: 'Invalid SNS URL',
            variant: 'danger',
          });
          return;
        }
      }

      if (!publicKey) {
        throw new Error('Wallet not connected');
      }

      const selectedToken = getBettingTokens().find(
        (t) => t.value === data.bettingToken
      );

      addQuest({
        quest_title: data.title,
        quest_description: data.description,
        quest_end_date: data.endTime.toISOString(),
        quest_category_id: data.category,
        season_id: season.id,
        answers: data.answers,
        file: data.imageType === 'image' ? data.image : undefined,
        quest_creator: publicKey.toBase58(),
        quest_betting_token: selectedToken?.symbol || 'BOOM',
        quest_betting_token_address: data.bettingToken,
        quest_image_link: data.imageType === 'sns-url' ? data.image : '',
        quest_image_url:
          data.imageType === 'sns-url' ? data.image : 'https://example.com',
      });
    } catch (error: any) {
      toast({
        title: 'Oops! Something went wrong',
        description: error?.message,
        variant: 'danger',
      });
    }
  }

  useEffect(() => {
    if (wImageType) {
      setTimeout(() => {
        resetField('image');
      }, 100);
    }
  }, [wImageType, resetField]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-48px)] w-11/12 overflow-y-scroll py-6 md:max-w-3xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Create New Prediction</DialogTitle>
              <DialogDescription className="sr-only">
                Create New Prediction
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-6">
              {/* title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tittle</FormLabel>
                    <FormControl>
                      <Input placeholder="Please enter a tittle" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Quest details: */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quest details</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        placeholder="Please enter a quest details"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                {/* Coin - Now first */}
                <FormField
                  control={form.control}
                  name="bettingToken"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Coin</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Please select a coin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getBettingTokens().map((token) => (
                            <SelectItem key={token.value} value={token.value}>
                              {token.symbol}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category - Now second */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Please select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cate) => (
                            <SelectItem key={cate.id} value={cate.id}>
                              {cate.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End time</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Choose ending time"
                        disabled={(date) =>
                          dayjs(date).isBefore(
                            dayjs().add(Math.min(questDuration, 24), 'hours')
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-4 md:flex-row md:gap-5 lg:gap-6">
                {/* image */}
                <FormField
                  control={form.control}
                  name="imageType"
                  render={({ field }) => (
                    <FormItem className="w-full shrink-0 md:w-[180px]">
                      <FormLabel>Image</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Please choose a type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {imageSource.map((cate) => (
                            <SelectItem key={cate.key} value={cate.key}>
                              {cate.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* image: */}
                {wImageType === 'image' && (
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                      <FormItem className="w-full">
                        <FormControl className="md:mt-10">
                          <div className="flex w-full items-center space-x-2">
                            <div className="relative grow overflow-hidden rounded-xl">
                              <Input
                                type="text"
                                id="image-input"
                                placeholder="Attach an image"
                                className="pr-20"
                                readOnly
                              />
                              <Label
                                htmlFor="file-upload"
                                className="absolute inset-y-2 right-2 flex cursor-pointer items-center rounded-xl bg-foreground-30 px-2 text-xs font-medium text-[#777777] hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:right-4 sm:px-6 sm:text-sm"
                              >
                                File Attach
                              </Label>
                              <Input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                {...fieldProps}
                                onChange={(e: any) => {
                                  const files = e.target.files;
                                  if (files && files.length > 0) {
                                    const file = files[0]!;

                                    onChange(file);

                                    const fileName = file?.name;

                                    // @ts-expect-error just ignore
                                    document.getElementById(
                                      'image-input'
                                      // @ts-expect-error just ignore
                                    ).value = fileName;
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {wImageType === 'sns-url' && (
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => {
                      return (
                        <FormItem className="w-full">
                          <FormControl className="md:mt-10">
                            {/* @ts-expect-error ignore */}
                            <Input
                              placeholder="Please enter an URL"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                )}
              </div>

              {/* answer: */}
              <div className="space-y-3">
                <Label className="text-xl font-medium">
                  Prediction Options
                </Label>

                <div className="space-y-2">
                  {fields.map((field, index) => {
                    const errorForField = errors?.answers?.[index];

                    return (
                      <FormField
                        key={field.id}
                        control={form.control}
                        name={`answers.${index}` as const}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="Type your answer in here"
                                  {...field}
                                />
                                {index >= 2 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      remove(index);
                                    }}
                                    className="absolute -top-2 -right-2 w-6 h-6 inline-flex items-center justify-center rounded-full bg-[#FF383C] text-white hover:bg-[#FF383C]/80 transition-colors"
                                    aria-label="Remove option"
                                  >
                                    <span className="text-sm font-semibold">
                                      −
                                    </span>
                                  </button>
                                )}
                              </div>
                            </FormControl>
                            {errorForField && <FormMessage />}
                          </FormItem>
                        )}
                      />
                    );
                  })}
                </div>

                <div
                  onClick={(e) => {
                    e.preventDefault();
                    append(`Option ${fields.length + 1}`);
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span className="w-6 h-6 inline-flex items-center justify-center rounded-full border border-[#149FFF]">
                    <Plus className="w-4 h-4 stroke-[#149FFF] stroke-[2]" />
                  </span>
                  <span className="font-outfit font-normal text-sm leading-[116%] text-[#149FFF]">
                    Add Option
                  </span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                loading={
                  isAddingQuest ||
                  isCreatingGovernanceItem ||
                  isDrafting ||
                  isSubmitting
                }
                className="w-full rounded-full border-none bg-brand"
                type="submit"
              >
                Complete
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
