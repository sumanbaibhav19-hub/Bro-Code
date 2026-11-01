/*
# Create seniors directory and connection requests

1. New Tables
- `seniors`: public directory of experienced seniors and graduates who offer mentorship.
  Columns: id, full_name, headline, field, company, skills, bio, graduation_year, mentorship_areas, availability, created_at.
- `connection_requests`: messages a student sends to a senior asking to connect.
  Columns: id, senior_id, student_name, student_email, goal, created_at.

2. Seed data
- Inserts eight sample seniors, only when the `seniors` table is empty.

3. Security
- Row level security enabled on both tables.
- `seniors`: anyone can read (the directory is intentionally public). No writes from the browser.
- `connection_requests`: anyone can submit a request, but nobody can read, edit or delete requests from the browser.
- Text lengths are limited by database checks so oversized input is rejected.
- The `service_role` is granted read access to `seniors` for the matching edge function.

4. Notes
- No sign-in is required, so policies apply to the `anon` and `authenticated` roles.
- Migrations are safe to re-run.
*/

CREATE TABLE IF NOT EXISTS seniors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 1 AND 100),
  headline text NOT NULL CHECK (char_length(headline) BETWEEN 1 AND 160),
  field text NOT NULL CHECK (char_length(field) BETWEEN 1 AND 100),
  company text CHECK (company IS NULL OR char_length(company) <= 100),
  skills text[] NOT NULL DEFAULT '{}',
  bio text CHECK (bio IS NULL OR char_length(bio) <= 1000),
  graduation_year int CHECK (graduation_year IS NULL OR graduation_year BETWEEN 1950 AND 2100),
  mentorship_areas text[] NOT NULL DEFAULT '{}',
  availability text CHECK (availability IS NULL OR char_length(availability) <= 120),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS connection_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  senior_id uuid NOT NULL REFERENCES seniors(id) ON DELETE CASCADE,
  student_name text NOT NULL CHECK (char_length(student_name) BETWEEN 1 AND 100),
  student_email text NOT NULL CHECK (char_length(student_email) BETWEEN 3 AND 255 AND student_email LIKE '%_@_%.__%'),
  goal text NOT NULL CHECK (char_length(goal) BETWEEN 1 AND 1000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS connection_requests_senior_id_idx ON connection_requests (senior_id);

ALTER TABLE seniors ENABLE ROW LEVEL SECURITY;
ALTER TABLE connection_requests ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON seniors TO anon, authenticated, service_role;
GRANT INSERT ON connection_requests TO anon, authenticated;

DROP POLICY IF EXISTS "public_read_seniors" ON seniors;
CREATE POLICY "public_read_seniors" ON seniors FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_submit_connection_requests" ON connection_requests;
CREATE POLICY "public_submit_connection_requests" ON connection_requests FOR INSERT
  TO anon, authenticated WITH CHECK (true);

INSERT INTO seniors (full_name, headline, field, company, skills, bio, graduation_year, mentorship_areas, availability)
SELECT * FROM (VALUES
  ('Priya Raman', 'Software Engineer at a fintech scale-up, ex-hackathon winner', 'Computer Science', 'Stripe', ARRAY['React','TypeScript','System Design','Python'], 'I spent my first two years interviewing for internships before landing one. Happy to help you build a portfolio that gets callbacks and prepare for technical interviews.', 2019, ARRAY['Interview prep','Software careers','Portfolio reviews'], 'Weekday evenings'),
  ('Marcus Bell', 'Product Manager, previously a campus startup founder', 'Business Administration', 'Shopify', ARRAY['Product Strategy','User Research','SQL','Pitching'], 'Built and sold a small campus marketplace. I can help you think through startup ideas and break into product roles.', 2017, ARRAY['Career planning','Startups','Case interviews'], 'Weekends'),
  ('Dr. Amara Okafor', 'Postdoctoral researcher in machine learning', 'Data Science', 'Max Planck Institute', ARRAY['Machine Learning','Statistics','R','Scientific Writing'], 'Guided many undergrads through their first research papers. Ask me about grad school applications and research experience.', 2014, ARRAY['Research','Graduate school','Statistics help'], 'Two evenings a week'),
  ('Daniel Ruiz', 'Mechanical Engineer at an electric vehicle company', 'Mechanical Engineering', 'Tesla', ARRAY['CAD','Thermodynamics','Prototyping','Project Management'], 'Worked on battery thermal systems after graduating. I enjoy helping engineering students with capstone projects and internship applications.', 2018, ARRAY['Engineering projects','Internships','Capstone guidance'], 'Flexible'),
  ('Sofia Lindqvist', 'UX Designer leading design systems for a health-tech team', 'Design', 'Headspace', ARRAY['Figma','UX Research','Accessibility','Prototyping'], 'Moved from graphic design into UX. I can review portfolios and help you practise design critiques.', 2016, ARRAY['Portfolio reviews','Design careers','Career switching'], 'Weekends'),
  ('James Whitaker', 'Corporate lawyer and former moot court champion', 'Law', 'Freshfields', ARRAY['Contract Law','Negotiation','Legal Writing','Public Speaking'], 'Happy to talk through law school decisions, mock interviews for vacation schemes, and how to write a strong personal statement.', 2012, ARRAY['Law school','Interview practice','Public speaking'], 'Monthly calls'),
  ('Yuki Tanaka', 'Financial Analyst at an investment bank, CFA Level III', 'Finance', 'Goldman Sachs', ARRAY['Financial Modelling','Excel','Valuation','Accounting'], 'Cracked my first investment banking interview on the third try. I can help you build a modelling test prep plan and networking strategy.', 2020, ARRAY['Finance interviews','Networking','CFA preparation'], 'Weeknights'),
  ('Lena Hofmann', 'Community Health Coordinator and nonprofit founder', 'Public Health', 'Doctors Without Borders', ARRAY['Program Design','Grant Writing','Community Outreach','Data Analysis'], 'Started a student volunteering network that now reaches three cities. I love helping students find meaningful volunteer and fellowship opportunities.', 2015, ARRAY['Volunteering','Fellowships','Nonprofit careers'], 'Evenings')
) AS v(full_name, headline, field, company, skills, bio, graduation_year, mentorship_areas, availability)
WHERE NOT EXISTS (SELECT 1 FROM seniors);
