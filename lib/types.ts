export type Senior = {
  id: string;
  full_name: string;
  headline: string;
  field: string;
  company: string | null;
  skills: string[];
  bio: string | null;
  graduation_year: number | null;
  mentorship_areas: string[];
  availability: string | null;
};

export type MatchResult = {
  id: string;
  reason: string;
};

export type MatchMode = "ai" | "keyword";

export type OpportunityCategory = "internship" | "workshop" | "event" | "competition";

export type Opportunity = {
  id: string;
  title: string;
  organization: string;
  category: OpportunityCategory;
  location: string;
  is_remote: boolean;
  description: string;
  apply_url: string | null;
  deadline: string | null;
};

export type StudyNote = {
  id: string;
  user_id: string;
  title: string;
  course: string;
  description: string | null;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  created_at: string;
};

export type ResourceCategory = "career_guidance" | "interview_tips" | "study_resources";

export type ExperienceResource = {
  id: string;
  title: string;
  author_name: string;
  author_role: string;
  category: ResourceCategory;
  summary: string;
  body: string;
  read_minutes: number;
};
