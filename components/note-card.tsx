"use client";

import { useState } from "react";
import { Download, FileText, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteNote, formatFileSize, getNoteDownloadUrl } from "@/lib/notes";
import type { StudyNote } from "@/lib/types";

type NoteCardProps = {
  note: StudyNote;
  isOwner: boolean;
  onDeleted: (id: string) => void;
  onError: (message: string) => void;
};

export function NoteCard({ note, isOwner, onDeleted, onError }: NoteCardProps) {
  const [downloading, setDownloading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      const url = await getNoteDownloadUrl(note.file_path);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      onError(err instanceof Error ? err.message : "We could not open this file.");
    } finally {
      setDownloading(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteNote(note);
      onDeleted(note.id);
    } catch (err) {
      onError(err instanceof Error ? err.message : "We could not delete this note.");
      setDeleting(false);
      setConfirming(false);
    }
  }

  return (
    <article className="flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-800">
          <FileText className="h-6 w-6" aria-hidden />
        </div>
        <div className="min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">{note.course}</span>
          <h3 className="mt-1 text-lg font-semibold leading-snug text-stone-900">{note.title}</h3>
        </div>
      </div>

      {note.description && (
        <p className="mt-4 flex-1 text-sm leading-relaxed text-stone-600">{note.description}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
        <span className="truncate max-w-full" title={note.file_name}>
          {note.file_name}
        </span>
        <span aria-hidden>·</span>
        <span>{formatFileSize(note.file_size)}</span>
        {isOwner && (
          <>
            <span aria-hidden>·</span>
            <span className="font-semibold text-teal-700">Shared by you</span>
          </>
        )}
      </div>

      <div className="mt-5 flex items-center gap-2 border-t border-stone-100 pt-4">
        <Button
          onClick={handleDownload}
          disabled={downloading}
          className="flex-1 gap-2 bg-teal-700 text-white transition-colors hover:bg-teal-800"
        >
          {downloading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Download className="h-4 w-4" aria-hidden />
          )}
          Download
        </Button>

        {isOwner &&
          (confirming ? (
            <Button
              onClick={handleDelete}
              disabled={deleting}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              {deleting ? "Deleting..." : "Confirm"}
            </Button>
          ) : (
            <Button
              onClick={() => setConfirming(true)}
              variant="ghost"
              size="icon"
              aria-label="Delete note"
              className="text-stone-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </Button>
          ))}
      </div>
    </article>
  );
}
