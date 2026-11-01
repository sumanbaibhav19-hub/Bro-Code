"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ALLOWED_NOTE_TYPES, MAX_NOTE_BYTES, uploadNote } from "@/lib/notes";

type UploadNoteDialogProps = {
  open: boolean;
  userId: string;
  onOpenChange: (open: boolean) => void;
  onUploaded: () => void;
};

export function UploadNoteDialog({ open, userId, onOpenChange, onUploaded }: UploadNoteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {open && (
          <UploadNoteForm
            userId={userId}
            onCancel={() => onOpenChange(false)}
            onUploaded={() => {
              onUploaded();
              onOpenChange(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function UploadNoteForm({
  userId,
  onCancel,
  onUploaded,
}: {
  userId: string;
  onCancel: () => void;
  onUploaded: () => void;
}) {
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = { title: title.trim(), course: course.trim(), description: description.trim() };

    if (!trimmed.title || !trimmed.course) {
      setError("Please add a title and the course this note is for.");
      return;
    }
    if (!file) {
      setError("Please choose a file to share.");
      return;
    }
    if (!(file.type in ALLOWED_NOTE_TYPES)) {
      setError("That file type is not supported. Try a PDF, Word, PowerPoint, image or text file.");
      return;
    }
    if (file.size > MAX_NOTE_BYTES) {
      setError("That file is larger than 10 MB. Please choose a smaller file.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await uploadNote({ userId, ...trimmed, file });
      onUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl">Share a study note</DialogTitle>
        <DialogDescription>
          Upload a file to help other students in your courses. Files up to 10 MB.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="mt-2 space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="note-title">Title</Label>
          <Input
            id="note-title"
            value={title}
            maxLength={160}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Week 4 summary: cell respiration"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="note-course">Course</Label>
          <Input
            id="note-course"
            value={course}
            maxLength={100}
            onChange={(e) => setCourse(e.target.value)}
            placeholder="BIO 201"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="note-description">Description (optional)</Label>
          <Textarea
            id="note-description"
            value={description}
            maxLength={1000}
            rows={3}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this cover, and who is it most useful for?"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="note-file">File</Label>
          <label
            htmlFor="note-file"
            className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 p-6 text-center text-sm text-stone-600 transition-colors hover:border-teal-400 hover:bg-teal-50/40"
          >
            <Upload className="h-5 w-5 text-teal-700" aria-hidden />
            <span className="font-medium text-stone-800">{file ? file.name : "Choose a file"}</span>
            <span className="text-xs text-stone-500">PDF, Word, PowerPoint, PNG, JPEG or text</span>
            <input
              id="note-file"
              type="file"
              accept={Object.keys(ALLOWED_NOTE_TYPES).join(",")}
              className="sr-only"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="bg-teal-700 text-white transition-colors hover:bg-teal-800"
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
            {submitting ? "Uploading..." : "Share note"}
          </Button>
        </div>
      </form>
    </>
  );
}
