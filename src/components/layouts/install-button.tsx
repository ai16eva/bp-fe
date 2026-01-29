'use client';

import { DownloadIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Typography } from '@/components/ui/typography';
import usePWAInstall from '@/hooks/use-pwa-install';
import { useToast } from '@/hooks/use-toast';

export const InstallButton = () => {
  const { isStandalone, isInstallPromptSupported, promptInstall } = usePWAInstall();
  const { toast } = useToast();

  const [isDeviceIOS, setIsDeviceIOS] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasMSStream = 'MSStream' in window;
      const isIOS = /iPad|iPhone|iPod|Mac/.test(window.navigator.userAgent)
        && !hasMSStream;
      setIsDeviceIOS(isIOS);
    }
  }, []);

  const onClickInstall = async () => {
    const didInstall = await promptInstall();
    if (didInstall) {
      // User accepted PWA install
      toast({ title: 'The PWA has been successfully installed.' });
    } else if (didInstall == null) {
      if (!isInstallPromptSupported) {
        if (isDeviceIOS) {
          toast({ title: 'To install the PWA, click the "Share" button and then "Add to Home Screen.' });
        } else {
          toast({ title: 'Installation is not possible.' });
        }
      }
    }
  };

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleServiceWorker = async () => {
        await navigator.serviceWorker.register('/sw.js');
      };

      handleServiceWorker();
    }
  }, []);

  if (isStandalone) {
    return null;
  }

  return (
    <button
      onClick={onClickInstall}
      type="button"
      className="flex max-w-48 cursor-pointer items-center justify-center gap-1 rounded border border-[#dfdfdf] bg-brand px-5 py-2 text-white hover:bg-brand/90"
    >
      <DownloadIcon className="size-4" />
      <Typography>App Download</Typography>
    </button>
  );
};
