'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { appQueryKeys } from '@/config/query';
import { useAddBoardMutation } from '@/hooks/use-board';
import { usePrivyWallet } from '@/hooks/use-privy-wallet';
import { useToast } from '@/hooks/use-toast';

type NewPostDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
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
  file: z
    .instanceof(File)
    .optional(),
});

export default function NewPostDialog({
  children,
  open,
  onOpenChange,
}: NewPostDialogProps) {
  const { toast } = useToast();

  const { publicKey } = usePrivyWallet();
  const address = publicKey?.toBase58();

  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const {
    formState: { isSubmitting },
  } = form;

  const { mutate: addBoard, isPending: isAddingBoard } = useAddBoardMutation({
    onSuccess: () => {
      toast({
        title: 'Post created successfully',
        variant: 'success',
      });

      queryClient.invalidateQueries({
        queryKey: appQueryKeys.board.root,
      });

      form.reset();
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
    if (!address) {
      toast({
        title: 'Please connect your wallet first',
      });
      return;
    }

    addBoard({
      board_title: values.title,
      board_description: values.description,
      file: values.file,
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
              <DialogTitle>Create New Post</DialogTitle>
              <DialogDescription className="sr-only">
                Create New Post
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-8 pb-6">
              {/* title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tittle</FormLabel>
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

              {/* File: */}
              <FormField
                control={form.control}
                name="file"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem className="w-full">
                    <FormControl>
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
                            className="absolute inset-y-2 right-2 flex cursor-pointer items-center rounded-xl bg-brand px-2 text-xs font-medium text-white sm:right-4 sm:px-6 sm:text-sm"
                          >
                            File Attach
                          </Label>
                          <Input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            accept="image/*,.pdf"
                            {...fieldProps}
                            onChange={(e: any) => {
                              const files = e.target.files;
                              if (files && files.length > 0) {
                                const file = files[0]!;

                                onChange(file);

                                const fileName = file?.name;

                                // @ts-expect-error just ignore
                                document.getElementById(
                                  'image-input',
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
            </div>
            <DialogFooter>
              <Button
                loading={
                  isSubmitting || isAddingBoard
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
