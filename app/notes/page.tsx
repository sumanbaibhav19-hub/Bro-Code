"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { BookPlus, Loader2, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryTabs } from "@/components/category-tabs";
import { NoteCard } from "@/components/note-card";
import { SiteHeader } from "@/components/site-header";
import { UploadNoteDialog } from "@/components/upload-note-dialog";
import { useAsyncList } from "@/hooks/use-async-list";
import { useSession } from "@/hooks/use-session";
import { fetchNotes } from "@/lib/notes";

const ALL = "all";

export default function NotesPage() {
  const { session, ready } = useSession();

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {!ready && (
          <div className="flex items-center justify-center gap-3 py-20 text-stone-600">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            Checking your session...
          </div>
        )}
        {ready && !session && <SignInPrompt />}
        {ready && session && <NotesLibrary session={session} />}
      </main>
    </div>
  );
}

function SignInPrompt() {
  return (
    <section className="mx-auto max-w-xl rounded-3xl border border-stone-200 bg-white p-10 text-center shadow-sm">
      <h1 className="text-3xl font-semibold tracking-tight">Study notes are for students</h1>
      <p className="mt-3 leading-relaxed text-stone-600">
        Create a free account to browse shared notes, download files and share your own.
      </p>
      <Link
        href="/auth"
        className="mt-6 inline-flex items-center justify-center rounded-md bg-teal-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-teal-800"
      >
        Sign in or create an account
      </Link>
    </section>
  );
}

function NotesLibrary({ session }: { session: Session }) {
  const userId = session.user.id;
  const { items, loading, error, reload } = useAsyncList(fetchNotes);
  const [course, setCourse] = useState<string>(ALL);
  const [query, setQuery] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const courseOptions = useMemo(
    () => [
      { value: ALL, label: "All courses" },
      ...Array.from(new Set(items.map((n) => n.course)))
        .sort()
        .map((c) => ({ value: c, label: c })),
    ],
    [items],
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((n) => {
      if (course !== ALL && n.course !== course) return false;
      if (!needle) return true;
      return [n.title, n.course, n.description ?? "", n.file_name].join(" ").toLowerCase().includes(needle);
    });
  }, [items, course, query]);

  return (
    <div className="space-y-10">
      <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-teal-700">Help with notes</p>
          <h1 className="mt-3 text-4xl font-semibold leading-[1.15] tracking-tight sm:text-5xl">
            Study materials shared by students
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-stone-600">
            Find summaries, past papers and lecture notes, or share your own to help the next cohort.
          </p>
        </div>
        <Button
          onClick={() => setUploadOpen(true)}
          className="h-11 gap-2 bg-teal-700 px-5 text-white transition-colors hover:bg-teal-800"
        >
          <BookPlus className="h-4 w-4" aria-hidden />
          Share a note
        </Button>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <CategoryTabs label="Filter by course" options={courseOptions} value={course} onChange={setCourse} />
          <div className="relative w-full lg:max-w-xs">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notes"
              className="h-11 bg-white pl-9"
              aria-label="Search notes"
            />
          </div>
        </div>

        {actionError && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {actionError}
          </p>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-3 py-20 text-stone-600">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            Loading notes...
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-start gap-4 rounded-2xl border border-red-200 bg-red-50 p-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-red-800">{error}</p>
            <Button variant="outline" onClick={reload} className="gap-2">
              <RefreshCw className="h-4 w-4" aria-hidden />
              Try again
            </Button>
          </div>
        )}

        {!loading && !error && visible.length === 0 && (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center text-stone-600">
            {items.length === 0
              ? "No notes have been shared yet. Be the first to share one."
              : "No notes match your search or course filter."}
          </div>
        )}

        {!loading && !error && visible.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                isOwner={note.user_id === userId}
                onDeleted={() => {
                  setActionError(null);
                  reload();
                }}
                onError={setActionError}
              />
            ))}
          </div>
        )}
      </section>

      <UploadNoteDialog
        open={uploadOpen}
        userId={userId}
        onOpenChange={setUploadOpen}
        onUploaded={() => {
          setActionError(null);
          reload();
        }}
      />
    </div>
  );
}
