import '@/styles/global.css';

// import "react-day-picker/style.css";
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Suspense } from 'react';

import { Footer } from '@/components/layouts/footer';
import { Header } from '@/components/layouts/header';
import { ThemeProvider } from '@/components/theme-provider';

import { Toaster } from '@/components/ui/toaster';
import { AppConfig } from '@/utils/app-config';

import { AuthProvider } from './auth-provider';
import Provider from './provider';

export const viewport = {
  themeColor: '#ffffff',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  width: 'device-width',
};

export const metadata: Metadata = {
  title: AppConfig.name,
  description: AppConfig.description,
  manifest: '/manifest.ts',
  icons: [
    {
      rel: 'icon',
      url: '/favicon.ico',
    },
  ],
  appleWebApp: {
    title: AppConfig.name,
    statusBarStyle: 'default',
    startupImage: [
      {
        url: 'splash/393x852x3_portrait_iPhone_15.png',
        media:
          '(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
      },
      {
        url: 'splash/320x568x2_portrait_iPhone_SE.png',
        media:
          '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
      {
        url: 'splash/375x667x2_portrait_iPhone_8.png',
        media:
          '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
      {
        url: 'splash/375x812x3_portrait_iPhone_X.png',
        media:
          '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
      },
      {
        url: 'splash/390x844x3_portrait_iPhone_12.png',
        media:
          '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
      },
      {
        url: 'splash/402x874x3_portrait_iPhone_16_Pro.png',
        media:
          '(device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
      },
      {
        url: 'splash/414x736x3_portrait_iPhone_8_Plus.png',
        media:
          '(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
      },
      {
        url: 'splash/414x896x2_portrait_iPhone_11.png',
        media:
          '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
      {
        url: 'splash/414x896x3_portrait_iPhone_11.png',
        media:
          '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
      },
      {
        url: 'splash/428x926x3_portrait_iPhone_13_Pro_Max.png',
        media:
          '(device-width: 420px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
      },
      {
        url: 'splash/430x932x3_portrait_iPhone_14_Pro_Max.png',
        media:
          '(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
      },
      {
        url: 'splash/440x956x3_portrait_iPhone_16_Pro_Max.png',
        media:
          '(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
      },
      {
        url: 'splash/744x1133x2_portrait_iPad_Mini_8.3.png',
        media:
          '(device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
      {
        url: 'splash/768x1024x2_portrait_iPad_Pro.png',
        media:
          '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
      {
        url: 'splash/810x1080x2_portrait_iPad_10.2.png',
        media:
          '(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
      {
        url: 'splash/820x1180x2_portrait_iPad_Air_10.9.png',
        media:
          '(device-width: 820px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
      {
        url: 'splash/834x1112x2_portrait_iPad_Air_10.5.png',
        media:
          '(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
      {
        url: 'splash/834x1194x2_portrait_11__iPad_Pro__10.5__iPad_Pro.png',
        media:
          '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
      {
        url: 'splash/834x1210x2_portrait_iPad_Pro_11.png',
        media:
          '(device-width: 834px) and (device-height: 1210px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
      {
        url: 'splash/1024x1366x2_portrait_iPad_Pro_12.9.png',
        media:
          '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
      {
        url: 'splash/1032x1376x2_portrait_iPad_Pro_13.png',
        media:
          '(device-width: 1032px) and (device-height: 1376px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
    ],
  },

  openGraph: {
    images: [''],
  },
  twitter: {
    card: 'summary_large_image',
    title: AppConfig.name,
    description: AppConfig.description,
    creator: '@boom_play',
    images: [],
  },
};

const fontSatoshi = localFont({
  src: './fonts/Satoshi-Variable.ttf',
  variable: '--font-satoshi',
});

export default function RootLayout(props: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <html lang={props.params.locale} suppressHydrationWarning>
      <body className={`${fontSatoshi.variable}`}>
        <Suspense>
          <Provider>
            <AuthProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem
                disableTransitionOnChange
              >
                <Header />
                {props.children}
                <Footer />

              </ThemeProvider>
            </AuthProvider>
          </Provider>
          <Toaster />
        </Suspense>
      </body>
    </html>
  );
}

