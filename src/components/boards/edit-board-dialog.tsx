'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input, Textarea } from '@/components/ui/input';
import { appQueryKeys } from '@/config/query';
import { useUpdateBoardMutation } from '@/hooks/use-board';
import { useToast } from '@/hooks/use-toast';
import type { Board } from '@/types/schema';

type EditBoardDialogProps = {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    board: Board;
} & PropsWithChildren;

const FormSchema = z.object({
    title: z
        .string()
        .min(3, 'Title must be at least 3 characters long')
        .max(256, 'Title must be at most 256 characters long'),
    description: z
        .string()
        .min(3, 'Description must be at least 3 characters long')
        .max(2000, 'Description must be at most 2000 characters long'),
});

export default function EditBoardDialog({
    children,
    open,
    onOpenChange,
    board,
}: EditBoardDialogProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            title: board.board_title || '',
            description: board.board_description || '',
        },
    });

    // Reset form values when board changes or dialog opens
    useEffect(() => {
        if (open) {
            form.reset({
                title: board.board_title || '',
                description: board.board_description || '',
            });
        }
    }, [board.board_id, board.board_title, board.board_description, open, form]);

    const {
        formState: { isSubmitting },
    } = form;

    const { mutate: updateBoard, isPending: isUpdatingBoard } = useUpdateBoardMutation({
        onSuccess: () => {
            toast({
                title: 'Post updated successfully',
                variant: 'success',
            });

            queryClient.invalidateQueries({
                queryKey: appQueryKeys.board.root,
            });

            onOpenChange?.(false);
        },
        onError: (error) => {
            toast({
                title: 'Oops! Something went wrong',
                description: error?.message,
                variant: 'danger',
            });
        },
    });

    const onSubmit = async (values: z.infer<typeof FormSchema>) => {
        updateBoard({
            board_id: board.board_id,
            board_title: values.title,
            board_description: values.description,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent
                className="max-h-[calc(100dvh-48px)] w-11/12 overflow-y-auto md:max-w-3xl"
                onPointerDownOutside={e => e.preventDefault()}
            >
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <DialogHeader>
                            <DialogTitle>Edit Post</DialogTitle>
                            <DialogDescription className="sr-only">
                                Edit Post
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-5 py-8 pb-6">
                            {/* title */}
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Please enter a title" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Post details: */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Post details</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                rows={10}
                                                placeholder="Please enter a post details"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                loading={isSubmitting || isUpdatingBoard}
                                className="w-full rounded-full border-none bg-brand"
                                type="submit"
                            >
                                Update
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
