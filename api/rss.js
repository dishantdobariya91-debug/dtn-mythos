// Vercel Serverless Function — server-side RSS proxy with diagnostics
// Runs at /api/rss?scope=national

export const config = { runtime: "edge" };

const KEYWORDS = "rights court police arrest protest constitution demolition election";

// Multiple query strategies — if one returns empty, try the next
function buildQueries(scope, state, district) {
  const queries = [];
  if (scope === "national") {
    queries.push("India democracy constitution rights court " + KEYWORDS);
    queries.push("India news today");
    queries.push("India politics rights");
  } else if (scope === "state" && state) {
    queries.push(state + " India " + KEYWORDS);
    queries.push(state + " India news");
    queries.push(state + " news today");
  } else if (scope === "district" && district) {
    queries.push(district + " India " + KEYWORDS);
    queries.push(district + " India news");
    queries.push(district + " news");
  } else {
    queries.push("India civic rights " + KEYWORDS);
    queries.push("India news");
  }
  return queries;
}

// Multiple User-Agents — Google sometimes blocks one but allows another
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
];

async function tryFetch(rssUrl, userAgent) {
  const res = await fetch(rssUrl, {
    headers: {
      "User-Agent": userAgent,
      "Accept": "application/rss+xml, application/xml, text/xml, */*;q=0.1",
      "Accept-Language": "en-IN,en;q=0.9",
    },
    signal: AbortSignal.timeout(10000),
  });
  const text = await res.text();
  // Count <item> tags as a rough proxy for whether the feed has content
  const itemCount = (text.match(/<item>/g) || []).length;
  return { status: res.status, ok: res.ok, text, itemCount, bytes: text.length };
}

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope") || "national";
  const state = searchParams.get("state") || "";
  const district = searchParams.get("district") || "";
  const debug = searchParams.get("debug") === "1";

  const queries = buildQueries(scope, state, district);
  const attempts = [];

  // Try each query with each User-Agent until we get items
  for (const q of queries) {
    const rssUrl =
      "https://news.google.com/rss/search?hl=en-IN&gl=IN&ceid=IN:en&q=" +
      encodeURIComponent(q);

    for (const ua of USER_AGENTS) {
      try {
        const result = await tryFetch(rssUrl, ua);
        attempts.push({
          query: q,
          ua: ua.slice(0, 40) + "...",
          status: result.status,
          bytes: result.bytes,
          items: result.itemCount,
        });

        if (result.ok && result.itemCount > 0) {
          // Success — return the RSS XML
          return new Response(result.text, {
            status: 200,
            headers: {
              "Content-Type": "application/xml; charset=utf-8",
              "Cache-Control": "s-maxage=60, stale-while-revalidate=120",
              "Access-Control-Allow-Origin": "*",
              "X-RSS-Query": q.slice(0, 80),
              "X-RSS-Items": String(result.itemCount),
            },
          });
        }
      } catch (e) {
        attempts.push({
          query: q,
          ua: ua.slice(0, 40) + "...",
          error: String(e?.message || e),
        });
      }
    }
  }

  // All attempts failed — return diagnostic info
  return new Response(
    JSON.stringify(
      {
        error: "no_items_found",
        message:
          "Google News returned 0 items for all tried queries. Google may be rate-limiting Vercel IPs, or the query has no matching stories.",
        attempts: debug ? attempts : attempts.map((a) => ({ q: a.query, status: a.status, items: a.items })),
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
