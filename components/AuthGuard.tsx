'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session || !session.accessToken) {
      // Store current path for redirect after login
      if (typeof window !== "undefined") {
        sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
      }
      router.push("/login");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size="lg" text="Checking authentication..." />
        </div>
      </div>
    );
  }

  if (!session || !session.accessToken) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}
