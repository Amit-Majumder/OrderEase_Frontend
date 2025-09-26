
'use client';

import { KitchenHeader } from '@/components/KitchenHeader';
import { usePathname } from 'next/navigation';

export default function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showHeader =
    pathname !== '/kitchen/login' && pathname !== '/kitchen/register';

  return (
    <div className="min-h-screen bg-background text-foreground">
      {showHeader && <KitchenHeader />}
      <main className={showHeader ? 'px-4 md:px-8 py-8' : ''}>
        {children}
      </main>
    </div>
  );
}
