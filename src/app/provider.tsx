'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from '@/app/auth-provider';
import PrivyProviderWrapper from '@/components/providers/privy-provider-wrapper';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: true,
      staleTime: 1000 * 10,
    },
  },
});

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <PrivyProviderWrapper>
        <AuthProvider>{children}</AuthProvider>
      </PrivyProviderWrapper>
    </QueryClientProvider>
  );
}
