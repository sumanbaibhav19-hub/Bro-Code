"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthForm } from "@/components/auth-form";
import { SiteHeader } from "@/components/site-header";
import { useSession } from "@/hooks/use-session";

export default function AuthPage() {
  const router = useRouter();
  const { session, ready } = useSession();

  useEffect(() => {
    if (ready && session) router.replace("/notes");
  }, [ready, session, router]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <SiteHeader />
      <main className="mx-auto flex max-w-7xl flex-col items-center px-4 py-16 sm:px-6 lg:px-8">
        {ready ? (
          <AuthForm onSignedIn={() => router.replace("/notes")} />
        ) : (
          <div className="flex items-center gap-3 text-stone-600">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            Checking your session...
          </div>
        )}
      </main>
    </div>
  );
}
