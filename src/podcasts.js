// DTN Mythos v12 — Podcast Hub data
// 6 curated Indian civic/constitutional podcasts with embed-friendly URLs.
// Topic taxonomy drives the pill filter on the Podcasts page.
//
// NOTE: Spotify show IDs verified as standard 22-char base62 format.
// The "india-dialog" YouTube playlist ID is best-effort. If it 404s on
// production, swap to a FALLBACK entry below (livemint "Nobody's Listening"
// or The Wire "Urdunama").

export const TOPIC_META = {
  elections:      { label: "Elections",     color: "#4A8FFF" },
  constitution:   { label: "Constitution",  color: "#F5B93A" },
  federalism:     { label: "Federalism",    color: "#9B7DFF" },
  rights:         { label: "Rights",        color: "#F04A5A" },
  policy:         { label: "Policy",        color: "#0FD47C" },
  judiciary:      { label: "Judiciary",     color: "#34d399" },
  minorities:     { label: "Minorities",    color: "#ec4899" },
  liberty:        { label: "Liberty",       color: "#ef4444" },
  environment:    { label: "Environment",   color: "#27500A" },
  "foreign-policy":    { label: "Foreign Policy",   color: "#60a5fa" },
  "social-justice":    { label: "Social Justice",   color: "#c084fc" },
  "human-rights":      { label: "Human Rights",     color: "#f43f5e" },
  economics:           { label: "Economics",        color: "#F5A623" },
  civic:               { label: "Civic",            color: "#0FD47C" },
  gender:              { label: "Gender",           color: "#ec4899" },
};

export const PODCASTS = [
  {
    id: "grand-tamasha",
    name: "Grand Tamasha",
    host: "Milan Vaishnav · Carnegie",
    topics: ["elections", "federalism", "foreign-policy"],
    description: "Deep-dive interviews on Indian politics, policy, and democracy with scholars and practitioners.",
    embedType: "spotify",
    embedUrl:   "https://open.spotify.com/embed/show/2ngbIwGJ5XQN66wnR9xCjz",
    websiteUrl: "https://carnegieendowment.org/podcasts/grand-tamasha",
  },
  {
    id: "seen-and-unseen",
    name: "The Seen and the Unseen",
    host: "Amit Varma",
    topics: ["liberty", "economics", "civic"],
    description: "Long-form conversations on liberty, Indian society, economics, and the unintended consequences of policy.",
    embedType: "spotify",
    embedUrl:   "https://open.spotify.com/embed/show/3wqL9A3gEgF2VffuizkHnm",
    websiteUrl: "https://seenunseen.in",
  },
  {
    id: "puliyabaazi",
    name: "Puliyabaazi",
    host: "Pranay Kotasthane & Saurabh Chandra",
    topics: ["policy", "federalism"],
    description: "Hindi-English podcast on Indian public policy, urban issues, and civic design.",
    embedType: "spotify",
    embedUrl:   "https://open.spotify.com/embed/show/2ijRIJXwylZQzgzncTVpuc",
    websiteUrl: "https://puliyabaazi.in",
  },
  {
    id: "all-indians-matter",
    name: "All Indians Matter",
    host: "Ashraf Engineer",
    topics: ["rights", "minorities", "social-justice"],
    description: "Weekly commentary on civil liberties, secularism, and the state of Indian democracy.",
    embedType: "spotify",
    embedUrl:   "https://open.spotify.com/embed/show/7jvKljPuCL9Lkzom6G5GsE",
    websiteUrl: "https://allindiansmatter.in",
  },
  {
    id: "suno-india",
    name: "The Suno India Show",
    host: "Suno India",
    topics: ["human-rights", "environment", "gender"],
    description: "Investigative reporting podcast covering underreported issues — gender, caste, environment, rights.",
    embedType: "spotify",
    embedUrl:   "https://open.spotify.com/embed/show/5NV4v32nWe3OLkGhwQ87BC",
    websiteUrl: "https://sunoindia.in",
  },
  {
    id: "india-dialog",
    name: "The India Dialog",
    host: "Constitutional & legal scholars",
    topics: ["constitution", "judiciary"],
    description: "Podcast series on Indian constitutional law, landmark judgments, and institutional history.",
    embedType: "youtube",
    embedUrl:   "https://www.youtube-nocookie.com/embed/videoseries?list=PLWTjMbmfWtbbC4Xm_W6e0pKgR8xZNe7GO",
    websiteUrl: "https://www.youtube.com/@TheIndiaDialog",
  },
];

// Topic filter order for the pill bar
export const TOPIC_ORDER = [
  "elections", "constitution", "federalism", "rights",
  "policy", "judiciary", "minorities", "liberty",
  "environment", "foreign-policy", "social-justice",
  "human-rights", "economics", "civic", "gender",
];

// --- FALLBACK PODCASTS (not in default list) ---
// Drop-in replacements if a default podcast's embed breaks in production.
export const PODCAST_FALLBACKS = [
  {
    id: "nobodys-listening",
    name: "Nobody's Listening",
    host: "Livemint",
    topics: ["policy", "economics"],
    description: "Livemint's flagship policy conversation show.",
    embedType: "spotify",
    embedUrl:   "https://open.spotify.com/embed/show/4cWQJLvH11dzqG0sZD4dlW",
    websiteUrl: "https://www.livemint.com/podcasts",
  },
  {
    id: "urdunama",
    name: "Urdunama",
    host: "Fabeha Syed · The Wire",
    topics: ["minorities", "rights"],
    description: "Urdu-language podcast on Indian politics, poetry, and pluralism.",
    embedType: "spotify",
    embedUrl:   "https://open.spotify.com/embed/show/3WKXJfgZPRPzqvWsrVjTO7",
    websiteUrl: "https://thewire.in/podcasts",
  },
];
