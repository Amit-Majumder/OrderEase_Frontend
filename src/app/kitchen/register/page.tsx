
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // The registration form is now on the homepage.
    // This page is kept for any legacy links and just redirects.
    router.replace('/');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
       <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
    </div>
  );
}
