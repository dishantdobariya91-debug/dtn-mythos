// DTN Mythos v12 — Podcast registry (click-to-open, no iframes)
// Exports: PODCASTS, TOPIC_META, TOPIC_ORDER, PODCAST_FALLBACKS

// Display order for topic filter pills
export const TOPIC_ORDER = [
  "elections",
  "constitution",
  "federalism",
  "rights",
  "policy",
  "judiciary",
  "minorities",
  "liberty",
  "environment",
  "foreign-policy",
  "social-justice",
  "human-rights",
  "economics",
  "civic",
  "gender",
];

// Label + color per topic (used by filter-pill UI)
export const TOPIC_META = {
  "elections":       { label: "Elections",       color: "#4A8FFF" },
  "constitution":    { label: "Constitution",    color: "#F5B93A" },
  "federalism":      { label: "Federalism",      color: "#9B59B6" },
  "rights":          { label: "Rights",          color: "#E24B4A" },
  "policy":          { label: "Policy",          color: "#3B6D11" },
  "judiciary":       { label: "Judiciary",       color: "#27500A" },
  "minorities":      { label: "Minorities",      color: "#D85A30" },
  "liberty":         { label: "Liberty",         color: "#BA7517" },
  "environment":     { label: "Environment",     color: "#1DB954" },
  "foreign-policy":  { label: "Foreign Policy",  color: "#0C447C" },
  "social-justice":  { label: "Social Justice",  color: "#C14B8A" },
  "human-rights":    { label: "Human Rights",    color: "#E24B4A" },
  "economics":       { label: "Economics",       color: "#2E7D32" },
  "civic":           { label: "Civic",           color: "#607D8B" },
  "gender":          { label: "Gender",          color: "#9C27B0" },
};

// Main podcast list — 6 curated shows
export const PODCASTS = [
  {
    id: "grand-tamasha",
    name: "Grand Tamasha",
    host: "Milan Vaishnav · Carnegie",
    topics: ["elections", "federalism", "foreign-policy"],
    description: "Deep-dive interviews on Indian politics, policy, and democracy with scholars and practitioners.",
    platform: "Spotify",
    url: "https://open.spotify.com/search/Grand%20Tamasha%20Milan%20Vaishnav",
    color: "#1DB954",
  },
  {
    id: "seen-and-unseen",
    name: "The Seen and the Unseen",
    host: "Amit Varma",
    topics: ["liberty", "economics", "civic"],
    description: "Long-form conversations on liberty, Indian society, economics, and the unintended consequences of policy.",
    platform: "Website",
    url: "https://seenunseen.in",
    color: "#F5B93A",
  },
  {
    id: "puliyabaazi",
    name: "Puliyabaazi",
    host: "Pranay Kotasthane & Saurabh Chandra",
    topics: ["policy", "federalism"],
    description: "Hindi-English podcast on Indian public policy, urban issues, and civic design.",
    platform: "Website",
    url: "https://puliyabaazi.in",
    color: "#E24B4A",
  },
  {
    id: "all-indians-matter",
    name: "All Indians Matter",
    host: "Ashraf Engineer",
    topics: ["rights", "minorities", "social-justice"],
    description: "Weekly commentary on civil liberties, secularism, and the state of Indian democracy.",
    platform: "Website",
    url: "https://allindiansmatter.in",
    color: "#4A8FFF",
  },
  {
    id: "suno-india",
    name: "The Suno India Show",
    host: "Suno India",
    topics: ["human-rights", "environment", "gender"],
    description: "Investigative reporting podcast covering underreported issues — gender, caste, environment, rights.",
    platform: "Website",
    url: "https://sunoindia.in",
    color: "#9B59B6",
  },
  {
    id: "india-dialog",
    name: "The India Dialog",
    host: "Constitutional & legal scholars",
    topics: ["constitution", "judiciary"],
    description: "Podcast series on Indian constitutional law, landmark judgments, and institutional history.",
    platform: "YouTube",
    url: "https://www.youtube.com/results?search_query=india+dialog+constitutional+law+podcast",
    color: "#FF0000",
  },
];

// Fallback podcasts — swap in if any main podcast fails to load
export const PODCAST_FALLBACKS = [
  {
    id: "nobodys-listening",
    name: "Nobody's Listening",
    host: "Livemint",
    topics: ["policy", "economics"],
    description: "Mint's weekly podcast on Indian economy, policy gaps, and the politics of governance.",
    platform: "Website",
    url: "https://www.livemint.com/podcasts",
    color: "#0C447C",
  },
  {
    id: "urdunama",
    name: "Urdunama",
    host: "The Wire",
    topics: ["civic", "minorities", "liberty"],
    description: "The Wire's podcast exploring Urdu literature, culture, and its place in contemporary Indian civic life.",
    platform: "Website",
    url: "https://thewire.in/podcasts",
    color: "#9C27B0",
  },
];