/*
# Help with Notes: study notes table and private file storage

1. New Tables
- `study_notes`: a note shared by a student with the community library.
  Columns: id, user_id (set automatically to the signed-in student), title, course, description, file_path, file_name, file_size, mime_type, created_at.

2. Storage
- New private bucket `study-notes` holding the uploaded files.
- Maximum file size 10 MB. Allowed types: PDF, PNG, JPEG, plain text, Word and PowerPoint documents.
- Each file is stored in a folder named after its uploader.

3. Security
- Row level security enabled on `study_notes`.
- Any signed-in student can browse and download notes.
- Students can add notes only under their own identity; the owner is filled in from their session and cannot be set by the browser.
- Students can delete only their own notes. Notes cannot be edited after upload.
- Storage: signed-in students can read files in the bucket, upload only into their own folder, and delete only from their own folder. Files cannot be overwritten.
- Anonymous visitors have no access to notes or files.

4. Notes
- Migration is safe to re-run.
*/

CREATE TABLE IF NOT EXISTS study_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 160),
  course text NOT NULL CHECK (char_length(course) BETWEEN 1 AND 100),
  description text CHECK (description IS NULL OR char_length(description) <= 1000),
  file_path text NOT NULL CHECK (char_length(file_path) BETWEEN 1 AND 500),
  file_name text NOT NULL CHECK (char_length(file_name) BETWEEN 1 AND 255),
  file_size int NOT NULL CHECK (file_size BETWEEN 1 AND 10485760),
  mime_type text NOT NULL CHECK (char_length(mime_type) BETWEEN 1 AND 100),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS study_notes_user_id_idx ON study_notes (user_id);
CREATE INDEX IF NOT EXISTS study_notes_course_idx ON study_notes (course);

ALTER TABLE study_notes ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON study_notes FROM anon, authenticated;
GRANT SELECT ON study_notes TO authenticated;
GRANT INSERT (title, course, description, file_path, file_name, file_size, mime_type) ON study_notes TO authenticated;
GRANT DELETE ON study_notes TO authenticated;

DROP POLICY IF EXISTS "authenticated_read_study_notes" ON study_notes;
CREATE POLICY "authenticated_read_study_notes" ON study_notes FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "owner_insert_study_notes" ON study_notes;
CREATE POLICY "owner_insert_study_notes" ON study_notes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND file_path LIKE auth.uid()::text || '/%'
  );

DROP POLICY IF EXISTS "owner_delete_study_notes" ON study_notes;
CREATE POLICY "owner_delete_study_notes" ON study_notes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'study-notes',
  'study-notes',
  false,
  10485760,
  ARRAY[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "study_notes_files_read" ON storage.objects;
CREATE POLICY "study_notes_files_read" ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'study-notes');

DROP POLICY IF EXISTS "study_notes_files_insert_own_folder" ON storage.objects;
CREATE POLICY "study_notes_files_insert_own_folder" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'study-notes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "study_notes_files_delete_own_folder" ON storage.objects;
CREATE POLICY "study_notes_files_delete_own_folder" ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'study-notes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
