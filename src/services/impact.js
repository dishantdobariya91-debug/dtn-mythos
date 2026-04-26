// dtn.today — Headline Impact Scoring Engine (Phase 2)
// Reuses the existing callAI helper (Groq→Gemini fallback) from App.jsx.
//
// Scores a story across 7 dimensions, returns:
//   {
//     impactScore:  0-100 composite,
//     dimensions: { urgency, publicImpact, politicalSensitivity, ... },
//     reasoning:  "explanation visible in admin panel",
//     model:       "groq" | "gemini" | "fallback"
//   }
//
// Cost discipline: only run on lead/featured stories or admin-trigger.
// Don't auto-run on every story or you'll burn the Groq free tier.

export const IMPACT_DIMENSIONS = [
  { key: "urgency",                label: "Urgency",                weight: 0.18 },
  { key: "publicImpact",           label: "Public Impact",          weight: 0.20 },
  { key: "politicalSensitivity",   label: "Political Sensitivity",  weight: 0.13 },
  { key: "economicConsequence",    label: "Economic Consequence",   weight: 0.12 },
  { key: "strategicImportance",    label: "Strategic Importance",   weight: 0.10 },
  { key: "citizenImpact",          label: "Citizen Impact",         weight: 0.15 },
  { key: "constitutionalRelevance",label: "Constitutional Relevance",weight: 0.12 },
];

const SYSTEM_PROMPT = `You are an expert news impact analyst for India. Score the given news story across 7 dimensions, each 0-100. Be conservative — most stories should score 20-60. Reserve 80+ for genuinely major events (constitutional crises, conflict escalation, mass casualty, major policy shifts).

Return ONLY valid JSON in this exact shape, no commentary:

{
  "urgency": 0-100,
  "publicImpact": 0-100,
  "politicalSensitivity": 0-100,
  "economicConsequence": 0-100,
  "strategicImportance": 0-100,
  "citizenImpact": 0-100,
  "constitutionalRelevance": 0-100,
  "reasoning": "one paragraph explaining the score, max 80 words"
}

Dimension definitions:
- urgency: how time-sensitive is this for the public to know? (breaking emergency = 90, retrospective analysis = 20)
- publicImpact: how many people are affected? (national policy = 80, local incident = 30)
- politicalSensitivity: how politically charged is this? (election-related, communal, separatist = high)
- economicConsequence: market/business impact (RBI rate change = 80, local civic issue = 10)
- strategicImportance: national security, diplomacy, geopolitical (border tensions, treaties = high)
- citizenImpact: direct effect on ordinary citizens' daily lives (price rise, utility disruption, rights violation = high)
- constitutionalRelevance: does this engage fundamental rights, separation of powers, federalism? (Article challenges, judicial review = high)`;

function userPromptFor(story) {
  return `HEADLINE: ${story.headline}

BODY: ${(story.body || "").slice(0, 1500)}

CONTEXT:
- Source: ${story.source || "unknown"}
- Institution involved: ${story.institution || "general"}
- Story type: ${story.storyType || "general"}
- Scope: ${story.scope || "national"}${story.state ? " (" + story.state + ")" : ""}
- Existing classification label: ${story.label || "neutral"}

Score this story.`;
}

// Composite 0-100 weighted average
export function compositeImpact(dimensions) {
  if (!dimensions) return 0;
  let total = 0, sumW = 0;
  for (const d of IMPACT_DIMENSIONS) {
    const v = Number(dimensions[d.key]);
    if (!isNaN(v) && v >= 0 && v <= 100) {
      total += v * d.weight;
      sumW += d.weight;
    }
  }
  if (sumW === 0) return 0;
  return Math.round(total / sumW);
}

// Heuristic fallback when AI is rate-limited / unavailable
// Uses signals already on the story to estimate dimensions.
export function fallbackImpact(story) {
  const dim = {
    urgency: 30,
    publicImpact: 30,
    politicalSensitivity: 30,
    economicConsequence: 20,
    strategicImportance: 25,
    citizenImpact: 30,
    constitutionalRelevance: 30,
  };

  const text = (story.headline + " " + (story.body || "")).toLowerCase();

  // Urgency boosters
  if (/breaking|emergency|killed|dead|crisis|alert|urgent/i.test(text)) dim.urgency += 25;
  if (story.evidenceLevel === "court_finding" || story.evidenceLevel === "final_adjudication") dim.urgency += 10;

  // Public impact
  if (story.scope === "national") dim.publicImpact += 25;
  if (story.scope === "state") dim.publicImpact += 10;
  if (/lakh|crore|million|nationwide|across india/i.test(text)) dim.publicImpact += 15;

  // Political sensitivity
  if (story.institution === "ec" || story.institution === "pmo") dim.politicalSensitivity += 20;
  if (/election|bjp|congress|parliament|cm|chief minister|prime minister/i.test(text)) dim.politicalSensitivity += 20;

  // Economic
  if (story.institution === "finance") dim.economicConsequence += 30;
  if (/rbi|inflation|gdp|repo rate|stock|market|tariff/i.test(text)) dim.economicConsequence += 25;

  // Strategic
  if (story.institution === "defence" || story.institution === "home") dim.strategicImportance += 25;
  if (/border|china|pakistan|treaty|loc|lac|terror|insurgent/i.test(text)) dim.strategicImportance += 25;

  // Citizen impact
  if (/price|fuel|petrol|gas|water|electricity|hospital|school/i.test(text)) dim.citizenImpact += 25;
  if (story.label === "potential_violation") dim.citizenImpact += 15;

  // Constitutional
  if (story.violations?.length) dim.constitutionalRelevance += 25;
  if (story.supports?.length) dim.constitutionalRelevance += 15;
  if (story.institution === "judiciary" || story.institution === "law") dim.constitutionalRelevance += 15;
  if (/constitution|article|fundamental right|supreme court/i.test(text)) dim.constitutionalRelevance += 15;

  // Clamp to 0-100
  for (const k of Object.keys(dim)) dim[k] = Math.max(0, Math.min(100, dim[k]));

  return {
    dimensions: dim,
    impactScore: compositeImpact(dim),
    reasoning: "Heuristic fallback (AI unavailable). Score derived from existing classifier signals: scope, institution, label, evidence level, and headline keywords.",
    model: "fallback",
    computedAt: Date.now(),
  };
}

// Main entry point. Pass in callAI from App.jsx.
// Returns the same shape regardless of whether AI succeeded.
export async function scoreImpact(story, callAI) {
  // Cheap fallback if no callAI provided or no story content
  if (!callAI || !story || !story.headline) {
    return fallbackImpact(story);
  }

  try {
    const j = await callAI(SYSTEM_PROMPT, userPromptFor(story));
    if (!j || typeof j !== "object") throw new Error("Invalid AI response shape");

    const dimensions = {};
    let valid = 0;
    for (const d of IMPACT_DIMENSIONS) {
      const v = Number(j[d.key]);
      if (!isNaN(v) && v >= 0 && v <= 100) {
        dimensions[d.key] = Math.round(v);
        valid++;
      }
    }

    // Need at least 5 of 7 dimensions to trust AI output
    if (valid < 5) {
      console.warn("[impact] AI returned too few dimensions, using fallback");
      return fallbackImpact(story);
    }

    // Fill missing dimensions with fallback values to keep shape consistent
    const fb = fallbackImpact(story);
    for (const d of IMPACT_DIMENSIONS) {
      if (dimensions[d.key] === undefined) dimensions[d.key] = fb.dimensions[d.key];
    }

    return {
      dimensions,
      impactScore: compositeImpact(dimensions),
      reasoning: (j.reasoning || "").slice(0, 500) || "AI scored this story across 7 impact dimensions.",
      model: "ai",  // App.jsx callAI doesn't expose which provider was used; safe label
      computedAt: Date.now(),
    };
  } catch (e) {
    console.warn("[impact] AI call failed, using fallback:", e?.message || e);
    return fallbackImpact(story);
  }
}

// Batch helper: score many stories sequentially with delay (rate-limit friendly)
export async function scoreImpactBatch(stories, callAI, opts = {}) {
  const delay = opts.delayMs || 800;
  const results = [];
  for (const s of stories) {
    if (s.impact && s.impact.computedAt && Date.now() - s.impact.computedAt < 24*60*60*1000) {
      // Already scored within last 24h, skip
      results.push({ id: s.id, impact: s.impact, cached: true });
      continue;
    }
    const impact = await scoreImpact(s, callAI);
    results.push({ id: s.id, impact, cached: false });
    if (delay) await new Promise(r => setTimeout(r, delay));
  }
  return results;
}
