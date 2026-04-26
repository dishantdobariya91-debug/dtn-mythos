// dtn.today — Media Bias Comparison Engine (Phase 2)
//
// Strategy: cluster stories by topic similarity (cosine on bag-of-words), then send
// the cluster to AI for framing/sentiment/omission analysis.
//
// Honest constraints:
// - We rarely get all 4 sources for the same story. Often 2-3.
// - Google News RSS gives us a "source" tag from `<source>` element or parsed from title.
// - Bias comparison is EXPENSIVE — only run on lead story or admin-trigger.

const SOURCES_OF_INTEREST = [
  { id: "the_hindu",        name: "The Hindu",         match: /thehindu\.com|the\s+hindu/i },
  { id: "indian_express",   name: "Indian Express",    match: /indianexpress\.com|indian\s+express/i },
  { id: "times_of_india",   name: "Times of India",    match: /timesofindia\.indiatimes\.com|times\s+of\s+india|toi/i },
  { id: "hindustan_times",  name: "Hindustan Times",   match: /hindustantimes\.com|hindustan\s+times|HT\b/i },
  { id: "bbc",              name: "BBC",               match: /bbc\.com|bbc\.co\.uk/i },
];

// Detect which outlet a story came from (best-effort)
export function detectSource(story) {
  const candidates = [
    story.source || "",
    story.link || "",
    story.headline || "",
  ].join(" ");
  for (const src of SOURCES_OF_INTEREST) {
    if (src.match.test(candidates)) return src.id;
  }
  return null;
}

// Tokenize for similarity calc (cheap bag-of-words)
const STOPWORDS = new Set(("the a an and or but if of to in for on at by with from as is are was were be been being has have had do does did this that these those it its his her their our we you i".split(" ")));

function tokenize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOPWORDS.has(w));
}

function vector(text) {
  const toks = tokenize(text);
  const v = {};
  for (const t of toks) v[t] = (v[t] || 0) + 1;
  return v;
}

function cosine(a, b) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  let dot = 0, na = 0, nb = 0;
  for (const k of keys) {
    const x = a[k] || 0, y = b[k] || 0;
    dot += x * y; na += x * x; nb += y * y;
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

// Find candidate stories from other outlets that are likely the same news event
// Returns up to 5 (one per outlet)
export function findSimilarCoverage(targetStory, allStories, opts = {}) {
  const minSim = opts.minSimilarity || 0.35;
  const targetVec = vector(targetStory.headline + " " + (targetStory.body || ""));
  const targetSrc = detectSource(targetStory);

  const candidates = [];
  for (const s of allStories) {
    if (s.id === targetStory.id) continue;
    if (s.aiSkipped || s.rejected) continue;

    const v = vector(s.headline + " " + (s.body || ""));
    const sim = cosine(targetVec, v);
    if (sim < minSim) continue;

    const src = detectSource(s);
    if (!src) continue;
    if (src === targetSrc) continue;  // skip same outlet

    candidates.push({ story: s, similarity: sim, source: src });
  }

  // Sort by similarity desc, take one per outlet
  candidates.sort((a, b) => b.similarity - a.similarity);
  const seen = new Set();
  const final = [];
  for (const c of candidates) {
    if (seen.has(c.source)) continue;
    seen.add(c.source);
    final.push(c);
    if (final.length >= 4) break;
  }
  return final;
}

const SYSTEM_PROMPT = `You are a media bias analyst comparing how Indian news outlets cover the same story. Compare the given articles and identify:

1. Framing differences — how each headline/lead frames the event
2. Omitted facts — what some outlets leave out that others include
3. Narrative direction — pro-government, opposition-leaning, neutral, or pro-establishment vs anti
4. Sentiment — positive, negative, neutral toward each subject
5. Bias confidence — your confidence in the bias assessment (0-100)

Return ONLY valid JSON in this exact shape:

{
  "outlets": [
    {
      "name": "outlet name",
      "framing": "one sentence on how they frame the event",
      "narrativeDirection": "neutral|pro-government|opposition-leaning|pro-establishment|critical",
      "sentiment": "positive|negative|neutral|mixed",
      "omittedFacts": ["fact 1 they didn't mention", "fact 2"]
    }
  ],
  "overallDivergence": "one paragraph (60 words max) on how much these outlets disagree",
  "biasConfidence": 0-100,
  "consensusFacts": ["facts all outlets agree on"]
}

Be specific and evidence-based. Avoid generic statements like "shows political slant". Cite actual word choices, what's emphasized, what's buried.`;

function userPromptFor(targetStory, similarStories) {
  const targetSrc = detectSource(targetStory) || "unknown";
  const targetName = SOURCES_OF_INTEREST.find(s => s.id === targetSrc)?.name || targetStory.source || "Source 1";

  let prompt = `STORY TOPIC: ${targetStory.headline}\n\n`;
  prompt += `=== ${targetName} ===\nHeadline: ${targetStory.headline}\nBody: ${(targetStory.body || "").slice(0, 600)}\n\n`;

  for (const c of similarStories) {
    const name = SOURCES_OF_INTEREST.find(s => s.id === c.source)?.name || c.source;
    prompt += `=== ${name} ===\nHeadline: ${c.story.headline}\nBody: ${(c.story.body || "").slice(0, 600)}\n\n`;
  }

  prompt += `Compare framing, omissions, narrative direction, and sentiment across these outlets.`;
  return prompt;
}

// Fallback when AI unavailable: return cluster info but no comparison
export function fallbackBias(targetStory, similarStories) {
  const outlets = [
    {
      name: SOURCES_OF_INTEREST.find(s => s.id === detectSource(targetStory))?.name || targetStory.source || "Primary source",
      framing: "AI comparison unavailable. Headline as published: " + targetStory.headline,
      narrativeDirection: "unknown",
      sentiment: "unknown",
      omittedFacts: [],
    },
    ...similarStories.map(c => ({
      name: SOURCES_OF_INTEREST.find(s => s.id === c.source)?.name || c.source,
      framing: c.story.headline,
      narrativeDirection: "unknown",
      sentiment: "unknown",
      omittedFacts: [],
    })),
  ];

  return {
    outlets,
    overallDivergence: similarStories.length === 0
      ? "No similar coverage from other outlets found in current dataset."
      : `Found ${similarStories.length + 1} versions across outlets but AI comparison unavailable. Headlines provided for manual review.`,
    biasConfidence: 0,
    consensusFacts: [],
    model: "fallback",
    computedAt: Date.now(),
    sourceCount: similarStories.length + 1,
  };
}

// Main entry — clusters and compares
export async function compareBias(targetStory, allStories, callAI, opts = {}) {
  const similar = findSimilarCoverage(targetStory, allStories, opts);

  // Need at least 1 similar story (so 2 sources total) for any comparison
  if (similar.length === 0) {
    return {
      ...fallbackBias(targetStory, []),
      noComparisonReason: "No similar coverage found from other outlets in the current story dataset. Bias comparison requires at least 2 different outlets covering the same event.",
    };
  }

  if (!callAI) {
    return fallbackBias(targetStory, similar);
  }

  try {
    const j = await callAI(SYSTEM_PROMPT, userPromptFor(targetStory, similar));
    if (!j || !Array.isArray(j.outlets)) throw new Error("Invalid bias response shape");

    return {
      outlets: j.outlets.slice(0, 5),
      overallDivergence: (j.overallDivergence || "").slice(0, 600),
      biasConfidence: Math.max(0, Math.min(100, Number(j.biasConfidence) || 0)),
      consensusFacts: Array.isArray(j.consensusFacts) ? j.consensusFacts.slice(0, 5) : [],
      model: "ai",
      computedAt: Date.now(),
      sourceCount: similar.length + 1,
    };
  } catch (e) {
    console.warn("[bias] AI call failed, using fallback:", e?.message || e);
    return fallbackBias(targetStory, similar);
  }
}

export { SOURCES_OF_INTEREST };
