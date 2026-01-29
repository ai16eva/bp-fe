'use client';

import { ReceiptTextIcon } from 'lucide-react';
import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';

import TabButton from '@/components/admin/tab-button';
import { Typography } from '@/components/ui/typography';
import { ROUTES } from '@/config/routes';
import { MenuBoardIcon } from '@/icons/icons';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const segment = useSelectedLayoutSegment();

  return (
    <main className="bg-secondary dark:bg-[#0D0E1A]">
      <div className="rounded-b-3xl border-b border-border bg-white dark:bg-[#1A1825] dark:shadow-none dark:border dark:border-[#2E2C3D]">
        <div className="app-container py-[60px]">
          <Typography level="h3" className="font-bold text-foreground dark:text-white">
            Admin Panel
          </Typography>
        </div>
      </div>

      <div className="app-container relative py-24">
        <div className="absolute top-0 flex items-center gap-6">
          <Link href={ROUTES.ADMIN_PLAY_GAME}>
            <TabButton active={!segment}>
              <MenuBoardIcon />
              BOOM PLAY Votes
            </TabButton>
          </Link>

          <Link href={ROUTES.ADMIN_GRANTS}>
            <TabButton active={segment === 'grant-admin'}>
              <ReceiptTextIcon />
              Grants Admin
            </TabButton>
          </Link>
        </div>
        {children}
      </div>
    </main>
  );
}
