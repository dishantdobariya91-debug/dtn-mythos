// Vercel Serverless Function — multi-source news proxy
// Tries 5 different FREE news sources: Google News, Bing News, Times of India,
// The Hindu, NDTV. Returns the first one that has content.
// Runs at /api/rss?scope=national

export const config = { runtime: "edge" };

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function buildSources(scope, state, district) {
  // Keywords baked into query for constitutional relevance
  const K = "rights court police arrest protest constitution election";

  let locationTerm = "India";
  if (scope === "state" && state) locationTerm = state + " India";
  else if (scope === "district" && district) locationTerm = district + " India";

  const gQuery = encodeURIComponent(locationTerm + " " + K);
  const gQueryBroad = encodeURIComponent(locationTerm + " news");

  return [
    // 1. Google News RSS — constitutional query
    {
      name: "google-news",
      url:
        "https://news.google.com/rss/search?hl=en-IN&gl=IN&ceid=IN:en&q=" +
        gQuery,
    },
    // 2. Google News RSS — broader fallback
    {
      name: "google-news-broad",
      url:
        "https://news.google.com/rss/search?hl=en-IN&gl=IN&ceid=IN:en&q=" +
        gQueryBroad,
    },
    // 3. Bing News RSS (if still available)
    {
      name: "bing-news",
      url:
        "https://www.bing.com/news/search?q=" +
        gQuery +
        "&format=RSS&cc=IN&setlang=en-IN",
    },
    // 4. Times of India top stories
    {
      name: "toi-top",
      url: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
    },
    // 5. The Hindu national
    {
      name: "hindu-national",
      url: "https://www.thehindu.com/news/national/feeder/default.rss",
    },
    // 6. NDTV top stories
    {
      name: "ndtv-top",
      url: "https://feeds.feedburner.com/ndtvnews-top-stories",
    },
  ];
}

async function tryFetch(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "application/rss+xml, application/xml, text/xml, */*;q=0.1",
      "Accept-Language": "en-IN,en;q=0.9",
    },
    signal: AbortSignal.timeout(9000),
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
      attempts.push({
        source: src.name,
        status: result.status,
        bytes: result.bytes,
        items: result.itemCount,
      });

      if (result.ok && result.itemCount > 0) {
        return new Response(result.text, {
          status: 200,
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            // Cache 60s on edge; serve stale for 2 min while revalidating
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

  // All sources failed
  return new Response(
    JSON.stringify(
      {
        error: "all_sources_failed",
        message:
          "Every news source returned 0 items or an error. This is rare — check attempts.",
        attempts: debug ? attempts : attempts.map((a) => ({ src: a.source, items: a.items || 0, err: a.error })),
      },
      null,
      2
    ),
    {
      status: 502,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
