
'use client';

import { useSearchParams } from 'next/navigation';
import React, { Suspense } from 'react';
import { MyOrdersPageContent } from '@/components/MyOrdersPageContent';

function MyOrdersPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <MyOrdersPageContent />
    </Suspense>
  );
}

export default MyOrdersPage;
