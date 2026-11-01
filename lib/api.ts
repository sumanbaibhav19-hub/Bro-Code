import { supabase, supabaseUrl } from "./supabase";
import type {
  ExperienceResource,
  MatchMode,
  MatchResult,
  Opportunity,
  Senior,
} from "./types";

const SENIOR_COLUMNS =
  "id, full_name, headline, field, company, skills, bio, graduation_year, mentorship_areas, availability";

export async function fetchOpportunities(): Promise<Opportunity[]> {
  const { data, error } = await supabase
    .from("opportunities")
    .select("id, title, organization, category, location, is_remote, description, apply_url, deadline")
    .order("deadline", { ascending: true, nullsFirst: false });

  if (error || !Array.isArray(data)) {
    throw new Error("We could not load opportunities. Please try again.");
  }
  return data as Opportunity[];
}

export async function fetchExperienceResources(): Promise<ExperienceResource[]> {
  const { data, error } = await supabase
    .from("experience_resources")
    .select("id, title, author_name, author_role, category, summary, body, read_minutes")
    .order("created_at", { ascending: false });

  if (error || !Array.isArray(data)) {
    throw new Error("We could not load the experience library. Please try again.");
  }
  return data as ExperienceResource[];
}

export type ConnectionRequestInput = {
  senior_id: string;
  student_name: string;
  student_email: string;
  goal: string;
};

export async function fetchSeniors(): Promise<Senior[]> {
  const { data, error } = await supabase
    .from("seniors")
    .select(SENIOR_COLUMNS)
    .order("full_name");

  if (error || !Array.isArray(data)) {
    throw new Error("We could not load the senior directory. Please try again.");
  }
  return data as Senior[];
}

export async function submitConnectionRequest(input: ConnectionRequestInput): Promise<void> {
  const { error } = await supabase.from("connection_requests").insert(input);
  if (error) {
    throw new Error("We could not send your request. Please check your details and try again.");
  }
}

export async function matchSeniors(
  goal: string,
): Promise<{ matches: MatchResult[]; mode: MatchMode }> {
  const response = await fetch(`${supabaseUrl}/functions/v1/match-seniors`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ goal }),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error ?? "Matching is unavailable right now. Please try again.");
  }
  if (!body || !Array.isArray(body.matches)) {
    throw new Error("We received an unexpected response. Please try again.");
  }

  const matches = body.matches.filter(
    (m: unknown): m is MatchResult =>
      typeof m === "object" &&
      m !== null &&
      typeof (m as MatchResult).id === "string" &&
      typeof (m as MatchResult).reason === "string",
  );
  return { matches, mode: body.mode === "ai" ? "ai" : "keyword" };
}
