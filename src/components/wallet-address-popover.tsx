'use client';

import { CheckIcon } from 'lucide-react';
import { useState } from 'react';

import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { useToast } from '@/hooks/use-toast';
import { CopyIcon, WalletIcon } from '@/icons/icons';
import { cn } from '@/utils/cn';

import { Button } from './ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from './ui/popover';

type WalletAddressPopoverProps = {
    address: string;
};

export function WalletAddressPopover({ address }: WalletAddressPopoverProps) {
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);
    const [_, copyToClipboard] = useCopyToClipboard();

    const handleCopy = async () => {
        await copyToClipboard(address);
        setCopied(true);
        toast({
            title: 'Wallet address copied',
            variant: 'success',
        });

        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    size="icon"
                    className="size-6 border-none bg-transparent text-brand hover:bg-brand/20 hover:scale-110 transition-all sm:size-12"
                    title="View wallet address"
                >
                    <WalletIcon className="size-6" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 shadow-xl border-brand/20" align="end">
                <div className="space-y-4 p-4">
                    {/* Header */}
                    <div className="flex items-center gap-2 pb-2 border-b border-foreground-20">
                        <div className="rounded-full bg-brand/10 p-2">
                            <WalletIcon className="size-5 text-brand" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">Your Solana Wallet</h3>
                    </div>

                    {/* Address Display */}
                    <div className="rounded-lg border border-brand/20 bg-gradient-to-br from-brand/5 to-brand/10 p-3">
                        <p className="break-all text-xs font-mono text-foreground leading-relaxed select-all">
                            {address}
                        </p>
                    </div>

                    {/* Copy Button */}
                    <Button
                        type="button"
                        onClick={handleCopy}
                        className={cn(
                            'w-full gap-2 rounded-full font-semibold transition-all shadow-md',
                            copied
                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                : 'bg-brand hover:bg-brand/90 text-white'
                        )}
                    >
                        {copied ? (
                            <>
                                <CheckIcon className="size-4" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <CopyIcon className="size-4" />
                                Copy Address
                            </>
                        )}
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
