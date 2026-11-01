"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { signOut } from "@/lib/auth";

const NAV_ITEMS = [
  { href: "/", label: "Mentors" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/library", label: "Library" },
  { href: "/notes", label: "Notes" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, ready } = useSession();

  async function handleSignOut() {
    try {
      await signOut();
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700 text-white">
            <GraduationCap className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-lg font-semibold tracking-tight">SeniorConnect</span>
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1 overflow-x-auto">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-teal-50 text-teal-800"
                    : "text-stone-700 hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        {ready && session && (
          <button
            type="button"
            onClick={handleSignOut}
            className="whitespace-nowrap rounded-full border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:border-stone-400 hover:text-stone-900"
          >
            Sign out
          </button>
        )}
        {ready && !session && (
          <Link
            href="/auth"
            className="whitespace-nowrap rounded-full bg-teal-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-800"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
