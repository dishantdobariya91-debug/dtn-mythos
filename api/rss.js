// Vercel Serverless Function — multi-source news proxy
// Direct-photo-rich sources go first (TOI, Hindu, NDTV) — Google News last.
// This reorder alone should push photo coverage from ~50% to ~75-85%.
// Runs at /api/rss?scope=national

export const config = { runtime: "edge" };

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const KEYWORDS = "rights court police arrest protest constitution election";

function buildSources(scope, state, district) {
  let locationTerm = "India";
  if (scope === "state" && state) locationTerm = state + " India";
  else if (scope === "district" && district) locationTerm = district + " India";

  const gQuery = encodeURIComponent(locationTerm + " " + KEYWORDS);
  const gQueryBroad = encodeURIComponent(locationTerm + " news");

  // Photo-rich sources first
  return [
    { name: "toi-top", url: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms" },
    { name: "toi-india", url: "https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms" },
    { name: "hindu-national", url: "https://www.thehindu.com/news/national/feeder/default.rss" },
    { name: "ndtv-top", url: "https://feeds.feedburner.com/ndtvnews-top-stories" },
    { name: "indianexpress", url: "https://indianexpress.com/section/india/feed/" },
    { name: "scroll", url: "https://feeds.feedburner.com/ScrollinArticles.rss" },
    // Google News as fallback — great coverage, worst photos
    { name: "google-news", url: "https://news.google.com/rss/search?hl=en-IN&gl=IN&ceid=IN:en&q=" + gQuery },
    { name: "google-news-broad", url: "https://news.google.com/rss/search?hl=en-IN&gl=IN&ceid=IN:en&q=" + gQueryBroad },
    { name: "bing-news", url: "https://www.bing.com/news/search?q=" + gQuery + "&format=RSS&cc=IN&setlang=en-IN" },
  ];
}

async function tryFetch(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "application/rss+xml, application/xml, text/xml, */*;q=0.1",
      "Accept-Language": "en-IN,en;q=0.9",
    },
    signal: AbortSignal.timeout(8000),
  });
  const text = await res.text();
  const itemCount = (text.match(/<item[\s>]/g) || []).length;
  return { status: res.status, ok: res.ok, text, itemCount, bytes: text.length };
}

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope") || "national";
  const state = searchParams.get("state") || "";
  const district = searchParams.get("district") || "";
  const debug = searchParams.get("debug") === "1";

  const sources = buildSources(scope, state, district);
  const attempts = [];

  for (const src of sources) {
    try {
      const result = await tryFetch(src.url);
      attempts.push({ source: src.name, status: result.status, bytes: result.bytes, items: result.itemCount });

      if (result.ok && result.itemCount > 0) {
        return new Response(result.text, {
          status: 200,
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "s-maxage=60, stale-while-revalidate=120",
            "Access-Control-Allow-Origin": "*",
            "X-RSS-Source": src.name,
            "X-RSS-Items": String(result.itemCount),
          },
        });
      }
    } catch (e) {
      attempts.push({ source: src.name, error: String(e?.message || e) });
    }
  }

  return new Response(
    JSON.stringify(
      {
        error: "all_sources_failed",
        message: "Every news source returned 0 items or an error.",
        attempts: debug ? attempts : attempts.map((a) => ({ src: a.source, items: a.items || 0, err: a.error })),
      },
      null,
      2
    ),
    {
      status: 502,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    }
  );
}
