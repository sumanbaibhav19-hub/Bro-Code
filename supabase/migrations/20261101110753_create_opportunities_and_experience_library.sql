CREATE TABLE IF NOT EXISTS opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 160),
  organization text NOT NULL CHECK (char_length(organization) BETWEEN 1 AND 120),
  category text NOT NULL CHECK (category IN ('internship', 'workshop', 'event', 'competition')),
  location text NOT NULL CHECK (char_length(location) BETWEEN 1 AND 120),
  is_remote boolean NOT NULL DEFAULT false,
  description text NOT NULL CHECK (char_length(description) BETWEEN 1 AND 2000),
  apply_url text CHECK (apply_url IS NULL OR apply_url LIKE 'https://%'),
  deadline date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS experience_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 160),
  author_name text NOT NULL CHECK (char_length(author_name) BETWEEN 1 AND 100),
  author_role text NOT NULL CHECK (char_length(author_role) BETWEEN 1 AND 160),
  category text NOT NULL CHECK (category IN ('career_guidance', 'interview_tips', 'study_resources')),
  summary text NOT NULL CHECK (char_length(summary) BETWEEN 1 AND 300),
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 10000),
  read_minutes int NOT NULL CHECK (read_minutes BETWEEN 1 AND 120),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_resources ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON opportunities TO anon, authenticated;
GRANT SELECT ON experience_resources TO anon, authenticated;

DROP POLICY IF EXISTS "public_read_opportunities" ON opportunities;
CREATE POLICY "public_read_opportunities" ON opportunities FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_experience_resources" ON experience_resources;
CREATE POLICY "public_read_experience_resources" ON experience_resources FOR SELECT
  TO anon, authenticated USING (true);

INSERT INTO opportunities (title, organization, category, location, is_remote, description, apply_url, deadline)
SELECT * FROM (VALUES
  ('Software Engineering Intern', 'Northwind Analytics', 'internship', 'Austin, TX', false, 'Ten-week summer internship building data pipelines and dashboards alongside senior engineers. Mentorship and a final presentation included.', 'https://example.com/apply/northwind', DATE '2027-01-31'),
  ('Product Design Sprint Workshop', 'Creative Commons Studio', 'workshop', 'Online', true, 'A hands-on, three-hour workshop on turning a messy idea into a tested prototype in a single afternoon.', 'https://example.com/workshops/design-sprint', DATE '2026-12-10'),
  ('Campus Career Fair', 'University Career Center', 'event', 'Main Hall, Building A', false, 'Meet recruiters from over sixty companies. Bring your résumé and plan a few questions ahead of time.', 'https://example.com/careers/fair', DATE '2026-11-20'),
  ('National Data Science Challenge', 'DataWorks Foundation', 'competition', 'Remote team of up to four', true, 'Solve a real-world forecasting problem with public datasets. Winners receive cash prizes and interview opportunities.', 'https://example.com/challenge/data', DATE '2027-02-15'),
  ('Clean Energy Policy Internship', 'Green Horizons Institute', 'internship', 'Washington, DC', false, 'Research renewable energy policy and support draft briefs for policymakers. Ideal for students in economics or environmental studies.', 'https://example.com/apply/green-horizons', DATE '2027-01-15'),
  ('Startup Pitch Night', 'Founders Circle', 'event', 'Downtown Innovation Hub', false, 'Five early-stage teams pitch to local investors. Open to students, with free food and networking afterwards.', 'https://example.com/events/pitch-night', DATE '2026-11-28'),
  ('Public Speaking Bootcamp', 'Voice Forward', 'workshop', 'Online', true, 'Four weekly sessions on structuring talks, handling questions and managing nerves, with practice feedback.', 'https://example.com/workshops/speaking', DATE '2026-12-01'),
  ('Hackathon for Social Good', 'CivicTech Collective', 'competition', 'Community Library', false, 'Build tools for local nonprofits over a weekend. Teams are judged on impact, usability and sustainability.', 'https://example.com/hackathon/social-good', DATE '2026-12-20')
) AS v(title, organization, category, location, is_remote, description, apply_url, deadline)
WHERE NOT EXISTS (SELECT 1 FROM opportunities);

INSERT INTO experience_resources (title, author_name, author_role, category, summary, body, read_minutes)
SELECT * FROM (VALUES
  ('How I turned a rejected internship application into an offer', 'Priya Raman', 'Software Engineer, Stripe', 'career_guidance', 'Why a rejection taught me more than any success, and the exact follow-up that got me a second chance.', 'My first internship application was rejected in under a day. Instead of moving on, I asked the recruiter for one specific piece of feedback. They pointed to my project descriptions, which listed tools but not outcomes. I rewrote every bullet to show what changed because of my work. Three months later I reapplied to a different team and received an offer. The lesson: treat every rejection as a data point, and ask for the feedback that makes the next attempt stronger.', 4),
  ('Behavioural interview questions that actually come up', 'Marcus Bell', 'Product Manager, Shopify', 'interview_tips', 'A practical framework for answering "tell me about a time" questions with clear, memorable stories.', 'Most behavioural questions are testing for the same five traits: ownership, collaboration, handling conflict, learning from failure and making decisions with incomplete information. Prepare four or five real stories from classes, clubs or part-time jobs and map each one to several questions. Use the situation, task, action and result structure, but spend most of your time on the action you personally took. End each answer with a measurable result or a clear lesson.', 6),
  ('A study system that survived my hardest semester', 'Dr. Amara Okafor', 'Postdoctoral Researcher, Max Planck Institute', 'study_resources', 'A simple weekly routine built around active recall and spaced practice rather than late-night rereading.', 'During my hardest semester I stopped rereading notes and started testing myself. Every Sunday I wrote five questions for each course from memory, then checked the answers. Spaced sessions of twenty minutes beat three-hour cramming sessions. I also kept a single running document of mistakes, which became my most useful revision guide before exams. It felt slower at first, but my results improved within a month.', 5),
  ('Building a portfolio when you have no professional work yet', 'Sofia Lindqvist', 'UX Designer, Headspace', 'career_guidance', 'Class projects, volunteer work and side experiments can all become case studies if you tell the story well.', 'Recruiters do not need you to have worked at a big company. They need to see how you think. Pick three projects and write each one as a short case study: the problem, your reasoning, what you tried, and what changed. Include the messy parts, such as a failed prototype or feedback you disagreed with. Two strong case studies will do more for you than ten screenshots.', 5),
  ('Preparing for finance modelling tests', 'Yuki Tanaka', 'Financial Analyst, Goldman Sachs', 'interview_tips', 'The modelling tests are predictable. Here is how to practise so the mechanics feel automatic on the day.', 'Modelling tests reward speed and accuracy more than creativity. Practise building a simple three-statement model from a blank spreadsheet until you can do it without looking anything up. Learn the keyboard shortcuts for your spreadsheet tool. Check every formula by changing an input and watching the output move as you expect. Time yourself, and review the mistakes you made rather than the ones you got right.', 5),
  ('Finding a mentor who will actually respond', 'Lena Hofmann', 'Community Health Coordinator', 'career_guidance', 'Short, specific messages with a clear ask get far more replies than long introductions.', 'Most people are happy to help, but they are busy. Keep your first message under five sentences. Say who you are, why you chose them specifically, and one concrete question they can answer in a few minutes. Offer to work around their schedule. Follow up once after a week, then move on gracefully. A small, thoughtful conversation often leads to a longer mentorship over time.', 3),
  ('Free and affordable resources for learning to code', 'Daniel Ruiz', 'Mechanical Engineer, Tesla', 'study_resources', 'A short list of high-quality resources for building programming skills alongside your main degree.', 'You do not need to pay for expensive courses to learn to program. Start with a free introductory course in a language you will actually use, then build one small project that solves a problem you have. Use official documentation as your main reference. Join one community where people review each other code. Consistency matters more than the platform you choose.', 4)
) AS v(title, author_name, author_role, category, summary, body, read_minutes)
WHERE NOT EXISTS (SELECT 1 FROM experience_resources);
