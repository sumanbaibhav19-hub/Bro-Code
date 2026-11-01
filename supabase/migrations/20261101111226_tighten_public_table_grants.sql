/*
# Tighten browser permissions on public tables

1. Background
- Supabase grants every new public table full read, write and delete access to the browser roles by default. Row level security blocked misuse, but the grants were wider than the app needs.

2. Changes
- `seniors`, `opportunities`, `experience_resources`: browsers can only read them.
- `connection_requests`: browsers can only submit requests. Nobody can read, change or delete requests from the browser, which keeps student emails private.

3. Notes
- No data is changed or removed. Only permissions are narrowed.
- The migration is safe to re-run.
*/

REVOKE ALL ON seniors, opportunities, experience_resources, connection_requests FROM anon, authenticated;

GRANT SELECT ON seniors, opportunities, experience_resources TO anon, authenticated;
GRANT INSERT ON connection_requests TO anon, authenticated;
