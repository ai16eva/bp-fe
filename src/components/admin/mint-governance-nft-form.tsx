'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { usePrivy } from '@privy-io/react-auth';
import { usePrivyWallet } from '@/hooks/use-privy-wallet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Typography } from '@/components/ui/typography';

const formSchema = z.object({
    walletAddress: z.string().min(32, 'Invalid wallet address'),
    name: z.string().min(1, 'Name is required'),
    symbol: z.string().min(1, 'Symbol is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1').default(5),
});

export function MintGovernanceNftForm() {
    const { toast } = useToast();
    const { connected, sendTransaction, publicKey } = usePrivyWallet();
    const { getAccessToken } = usePrivy();
    const [isLoading, setIsLoading] = useState(false);
    const [currentMintIndex, setCurrentMintIndex] = useState(0);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            walletAddress: '',
            name: 'Boomplay Governance NFT',
            symbol: 'BGOV',
            quantity: 5,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!connected || !publicKey || !sendTransaction) {
            toast({
                title: "Wallet not connected",
                description: "Please connect your wallet first.",
                variant: "danger",
            });
            return;
        }

        setIsLoading(true);
        setCurrentMintIndex(0);
        try {
            const formData = new FormData();

            const defaultImageUrl = 'https://gateway.pinata.cloud/ipfs/QmaBMWBPC9igGrQbdtrN4jhqJ25qUyoDxbg4qTz7EPH1eQ';


            const metadata = {
                name: values.name,
                symbol: values.symbol,
                description: 'Governance NFT granting voting rights and DAO participation.',
                image: defaultImageUrl,
                external_url: 'https://boomplay.io',
                seller_fee_basis_points: 0,
                attributes: [
                    { trait_type: 'Type', value: 'Governance Token' },
                    { trait_type: 'Utility', value: 'Voting' },
                    { trait_type: 'Mint Date', value: new Date().toISOString().split('T')[0] }
                ],
                properties: {
                    files: [{ uri: defaultImageUrl, type: 'image/png' }],
                    category: 'image',
                    creators: [{ address: publicKey.toBase58(), share: 100 }],
                },
            };

            formData.append('metadata', JSON.stringify(metadata));

            const uploadRes = await fetch('/api/upload-metadata', {
                method: 'POST',
                body: formData,
            });

            if (!uploadRes.ok) {
                const err = await uploadRes.json();
                throw new Error(err.error || 'Failed to upload metadata');
            }

            const { uri } = await uploadRes.json();
            console.log('Metadata URI:', uri);

            const quantity = values.quantity || 1;

            const accessToken = await getAccessToken();

            const mintRes = await fetch('/api/nfts/admin/mint', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    walletAddress: values.walletAddress,
                    metadataUri: uri,
                    quantity: quantity,
                    name: values.name,
                    symbol: values.symbol
                })
            });

            if (!mintRes.ok) {
                const err = await mintRes.json();
                throw new Error(err.message || 'Failed to mint on server');
            }

            const mintData = await mintRes.json();
            console.log('Mint Result:', mintData);

            toast({
                title: "Mint Request Successful!",
                description: `Successfully requested mint of ${mintData.data.successCount} NFTs.`,
            });

            form.reset();

        } catch (error: any) {
            console.error('Minting Error:', error);
            toast({
                title: "Minting Failed",
                description: error.message || "An unexpected error occurred.",
                variant: "danger",
            });
        } finally {
            setIsLoading(false);
            setCurrentMintIndex(0);
        }
    }

    return (
        <div className="bg-background rounded-lg border p-6">
            <Typography level="h4" className="mb-6">Mint Governance NFT</Typography>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="walletAddress"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Receiver Wallet Address</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter wallet address" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>NFT Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Boomplay Governance NFT" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="symbol"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Symbol</FormLabel>
                                    <FormControl>
                                        <Input placeholder="BGOV" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Quantity</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={1}
                                            placeholder="1"
                                            {...field}
                                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <FormLabel>NFT Image (Fixed)</FormLabel>
                        <div className="flex items-center gap-4 rounded-md border p-4 bg-muted/50">
                            <img
                                src="https://gateway.pinata.cloud/ipfs/QmaBMWBPC9igGrQbdtrN4jhqJ25qUyoDxbg4qTz7EPH1eQ"
                                alt="Default Governance NFT"
                                className="h-16 w-16 rounded-md object-contain border"
                            />
                            <Typography level="body2" className="text-muted-foreground">
                                Using fixed IPFS Treasury logo
                            </Typography>
                        </div>
                    </div>

                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {currentMintIndex > 0 ? `Minting ${currentMintIndex}/${form.getValues('quantity')}...` : 'Preparing...'}
                            </>
                        ) : (
                            'Mint NFT'
                        )}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
