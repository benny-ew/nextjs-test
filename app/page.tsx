'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (status === 'authenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Redirecting to dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to Task Board
            </CardTitle>
            <p className="text-gray-600">
              A modern task management application with Keycloak authentication
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/login">
                Sign In
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard">
                Go to Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/api/test-keycloak" target="_blank">
                Test Keycloak Connection
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
