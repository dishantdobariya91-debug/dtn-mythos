// Vercel Edge Function — Unsplash fallback image
// Uses Unsplash Source (no API key, no auth, no rate limit issues).
// Picks a relevant photo based on the story's topic/department.
// Runs at /api/fallback-image?topic=policing&dept=home&id=abc

export const config = { runtime: "edge" };

// Topic → Unsplash search terms mapping (curated for editorial/news feel)
const TOPIC_MAP = {
  policy:       "india government parliament",
  law:          "court law justice india",
  court:        "courtroom judge gavel",
  policing:     "police officers india street",
  election:     "voting ballot democracy india",
  rights:       "protest rally india peaceful",
  corruption:   "money corruption investigation",
  welfare:      "community india rural development",
  speech:       "journalism press media india",
  media:        "newsroom journalist microphone",
  federalism:   "india state government building",
  minority:     "diverse crowd india peaceful",
};

const DEPT_MAP = {
  pmo:        "parliament building india",
  home:       "police headquarters india",
  law:        "supreme court india",
  finance:    "rbi reserve bank india",
  education:  "school classroom india",
  health:     "hospital india medical",
  wcd:        "women children india",
  minority:   "community india",
  rural:      "village india rural",
  urban:      "city india urban",
  environment:"forest india nature",
  defence:    "army soldiers india",
  police:     "police officer india",
  ec:         "voting booth india",
  media:      "news reporter india",
  judiciary:  "judge gavel courtroom",
};

// Neutral fallback pool — calm, editorial, won't look wrong on any story
const NEUTRAL_POOL = [
  "india skyline dawn",
  "parliament building india",
  "india cityscape architecture",
  "newspaper print press",
  "microphone interview press",
  "india crowd street",
  "government building india",
];

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const topic = (searchParams.get("topic") || "").toLowerCase();
  const dept = (searchParams.get("dept") || "").toLowerCase();
  const id = searchParams.get("id") || String(Date.now());
  const width = Math.min(parseInt(searchParams.get("w") || "800", 10), 1200);

  // Pick keyword: topic > dept > neutral
  let query = TOPIC_MAP[topic] || DEPT_MAP[dept];
  if (!query) {
    // Deterministic pool pick based on id so the same story always gets the same fallback
    const hash = Array.from(id).reduce((a, c) => a + c.charCodeAt(0), 0);
    query = NEUTRAL_POOL[hash % NEUTRAL_POOL.length];
  }

  // Unsplash Source redirects to a real photo URL. No API key required.
  // Example: https://source.unsplash.com/800x550/?police,india
  const unsplashUrl =
    "https://source.unsplash.com/" + width + "x" + Math.round(width * 0.6875) +
    "/?" + encodeURIComponent(query);

  // 302 redirect browser directly to Unsplash — Unsplash then serves the photo
  return new Response(null, {
    status: 302,
    headers: {
      Location: unsplashUrl,
      "Cache-Control": "s-maxage=86400, stale-while-revalidate=604800",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
