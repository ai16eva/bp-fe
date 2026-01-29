'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useAuth } from '@/app/auth-provider';
import { ROUTES } from '@/config/routes';
import { useWalletSignature } from '@/hooks/use-wallet-signature';

interface WithAdminProps { }

export function withAdmin<T extends WithAdminProps = WithAdminProps>(
  WrappedComponent: React.ComponentType<T>,
) {
  const displayName
    = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const ComponentWithTheme = (props: Omit<T, keyof WithAdminProps>) => {
    const { user } = useAuth();
    const router = useRouter();
    const { hasSignature } = useWalletSignature(true);

    const [mounted, setMounted] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
      if (!mounted) {
        return;
      }

      if (!user) {
        return;
      }

      if (user.role.toLowerCase() !== 'admin') {
        if (!isRedirecting) {
          setIsRedirecting(true);
          router.replace(ROUTES.HOME);
        }
      }
    }, [mounted, user, router, isRedirecting]);


    if (!mounted) {
      return null;
    }

    if (!user) {
      return null;
    }

    if (user.role.toLowerCase() !== 'admin') {
      return null;
    }

    if (!hasSignature) {
      return null;
    }

    return <WrappedComponent {...(props as T)} />;
  };

  ComponentWithTheme.displayName = `withAdmin(${displayName})`;

  return ComponentWithTheme;
}
