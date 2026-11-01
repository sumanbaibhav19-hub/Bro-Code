import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

type Senior = {
  id: string;
  full_name: string;
  headline: string;
  field: string;
  skills: string[];
  mentorship_areas: string[];
  bio: string | null;
};

type Match = { id: string; reason: string };

const MAX_MATCHES = 3;

const tokenize = (text: string) =>
  new Set(text.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 2));

function keywordMatches(goal: string, seniors: Senior[]): Match[] {
  const goalTokens = tokenize(goal);
  return seniors
    .map((s) => {
      const haystack = tokenize(
        [s.field, s.headline, s.bio ?? "", ...s.skills, ...s.mentorship_areas].join(" "),
      );
      const overlap = [...goalTokens].filter((t) => haystack.has(t));
      return { senior: s, overlap };
    })
    .filter((x) => x.overlap.length > 0)
    .sort((a, b) => b.overlap.length - a.overlap.length)
    .slice(0, MAX_MATCHES)
    .map(({ senior, overlap }) => ({
      id: senior.id,
      reason: `Shares interests in ${overlap.slice(0, 3).join(", ")} with your goal.`,
    }));
}

async function aiMatches(goal: string, seniors: Senior[], apiKey: string): Promise<Match[]> {
  const directory = seniors.map((s) => ({
    id: s.id,
    name: s.full_name,
    field: s.field,
    headline: s.headline,
    skills: s.skills,
    mentorship_areas: s.mentorship_areas,
  }));

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            `You match university students with seniors who can help them. Given a student's goal and a directory of seniors, pick the best ${MAX_MATCHES} matches. Respond only with JSON in the form {"matches":[{"id":"<senior id>","reason":"<one friendly sentence, max 25 words>"}]}. Only use ids from the directory.`,
        },
        {
          role: "user",
          content: JSON.stringify({ goal, directory }),
        },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) throw new Error(`AI request failed (${response.status})`);

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  const parsed = typeof content === "string" ? JSON.parse(content) : null;
  const validIds = new Set(seniors.map((s) => s.id));

  if (!parsed || !Array.isArray(parsed.matches)) throw new Error("AI returned an unexpected shape");

  return parsed.matches
    .filter(
      (m: unknown): m is Match =>
        typeof m === "object" &&
        m !== null &&
        typeof (m as Match).id === "string" &&
        typeof (m as Match).reason === "string" &&
        validIds.has((m as Match).id),
    )
    .slice(0, MAX_MATCHES);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

    const body = await req.json().catch(() => null);
    const goal = typeof body?.goal === "string" ? body.goal.trim() : "";
    if (goal.length < 3 || goal.length > 1000) {
      return json({ error: "Please describe your goal in 3 to 1000 characters." }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: seniors, error } = await supabase
      .from("seniors")
      .select("id, full_name, headline, field, skills, mentorship_areas, bio");
    if (error) throw error;
    if (!seniors || seniors.length === 0) return json({ matches: [], mode: "keyword" });

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (apiKey) {
      try {
        const matches = await aiMatches(goal, seniors as Senior[], apiKey);
        return json({ matches, mode: "ai" });
      } catch (aiError) {
        console.error("AI matching failed, using keyword fallback", aiError);
      }
    }

    return json({ matches: keywordMatches(goal, seniors as Senior[]), mode: "keyword" });
  } catch (err) {
    console.error(err);
    return json({ error: "Matching is unavailable right now. Please try again." }, 500);
  }
});
