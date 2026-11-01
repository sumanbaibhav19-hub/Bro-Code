import { supabase } from "./supabase";
import type { StudyNote } from "./types";

export const NOTE_BUCKET = "study-notes";
export const MAX_NOTE_BYTES = 10 * 1024 * 1024;

export const ALLOWED_NOTE_TYPES: Record<string, string> = {
  "application/pdf": "PDF",
  "image/png": "PNG image",
  "image/jpeg": "JPEG image",
  "text/plain": "Text file",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PowerPoint",
};

const NOTE_COLUMNS = "id, user_id, title, course, description, file_path, file_name, file_size, mime_type, created_at";

export type NoteUploadInput = {
  userId: string;
  title: string;
  course: string;
  description: string;
  file: File;
};

export async function fetchNotes(): Promise<StudyNote[]> {
  const { data, error } = await supabase
    .from("study_notes")
    .select(NOTE_COLUMNS)
    .order("created_at", { ascending: false });

  if (error || !Array.isArray(data)) {
    throw new Error("We could not load the notes library. Please try again.");
  }
  return data as StudyNote[];
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

export async function uploadNote({ userId, title, course, description, file }: NoteUploadInput) {
  const filePath = `${userId}/${crypto.randomUUID()}-${safeFileName(file.name)}`;

  const { error: uploadError } = await supabase.storage
    .from(NOTE_BUCKET)
    .upload(filePath, file, { contentType: file.type, upsert: false });
  if (uploadError) {
    console.error("note upload failed", uploadError);
    throw new Error("We could not upload your file. Please try again.");
  }

  const { error: insertError } = await supabase.from("study_notes").insert({
    title,
    course,
    description: description || null,
    file_path: filePath,
    file_name: file.name.slice(0, 255),
    file_size: file.size,
    mime_type: file.type,
  });
  if (insertError) {
    console.error("note save failed", insertError);
    await supabase.storage.from(NOTE_BUCKET).remove([filePath]);
    throw new Error("We could not save your note. Please check the details and try again.");
  }
}

export async function getNoteDownloadUrl(filePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(NOTE_BUCKET)
    .createSignedUrl(filePath, 300);
  if (error || !data?.signedUrl) {
    throw new Error("We could not open this file. Please try again.");
  }
  return data.signedUrl;
}

export async function deleteNote(note: StudyNote): Promise<void> {
  const { error } = await supabase.from("study_notes").delete().eq("id", note.id);
  if (error) {
    throw new Error("We could not delete this note. Please try again.");
  }
  const { error: storageError } = await supabase.storage.from(NOTE_BUCKET).remove([note.file_path]);
  if (storageError) {
    console.error("note file cleanup failed", storageError);
  }
}
