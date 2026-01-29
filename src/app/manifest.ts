import type { MetadataRoute } from 'next';

import { AppConfig } from '@/utils/app-config';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: AppConfig.name,
    short_name: AppConfig.name,
    description: AppConfig.description,
    scope: '/',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#e2e2e2',
    orientation: 'any',
    icons: [
      {
        src: '/logo-short.png',
        sizes: '350x350',
        type: 'image/png',
      },
    ],
  };
}
