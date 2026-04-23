// DTN Mythos v12.3.1 — /api/rss
// Broader, simpler queries + parallel fetch + merge-dedupe.
// Previous narrow single-query approach returned empty feeds from Google News.
// This version runs 3-4 parallel queries per scope and merges results.

const QUERIES = {
  national: [
    "India Supreme Court constitution",
    "India government policy parliament",
    "India Election Commission voter",
    "India police arrest custody rights",
  ],
  state: (name) => [
    name + " India court order",
    name + " India government policy",
    name + " India police rights",
  ],
  district: (name) => [
    name + " India police arrest",
    name + " India court",
  ],
  search: (q) => [q + " India"],
};

function buildUrl(query) {
  const safe = String(query || "").replace(/[^\w\s+-]/g, "").slice(0, 150).trim();
  if (!safe) return null;
  return "https://news.google.com/rss/search?hl=en-IN&gl=IN&ceid=IN:en&q=" +
         encodeURIComponent(safe);
}

async function fetchOne(url) {
  try {
    const r = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/rss+xml, application/xml, text/xml, */*",
      },
    });
    if (!r.ok) return null;
    const text = await r.text();
    if (!text || !text.includes("<item")) return null;
    return text;
  } catch (e) {
    return null;
  }
}

function mergeFeeds(feeds) {
  const nonEmpty = feeds.filter(Boolean);
  if (nonEmpty.length === 0) return null;
  if (nonEmpty.length === 1) return nonEmpty[0];

  const first = nonEmpty[0];
  const items = [];
  const itemRe = /<item[\s>][\s\S]*?<\/item>/gi;
  for (const feed of nonEmpty) {
    const m = feed.match(itemRe) || [];
    items.push(...m);
  }
  // Dedupe by <link>
  const seen = new Set();
  const unique = [];
  for (const it of items) {
    const linkMatch = it.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
    const link = linkMatch ? linkMatch[1].trim() : Math.random().toString();
    if (seen.has(link)) continue;
    seen.add(link);
    unique.push(it);
  }

  return first.replace(itemRe, "").replace(
    /<\/channel>/i,
    unique.join("\n") + "\n</channel>"
  );
}

export default async function handler(req, res) {
  try {
    const { scope = "national", state, district, q } = req.query || {};

    let queries = [];
    if (scope === "search" && q) queries = QUERIES.search(q);
    else if (scope === "state" && state) queries = QUERIES.state(state);
    else if (scope === "district" && district) queries = QUERIES.district(district);
    else queries = QUERIES.national;

    const urls = queries.map(buildUrl).filter(Boolean);
    const feeds = await Promise.all(urls.map(fetchOne));
    const merged = mergeFeeds(feeds);

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");

    if (!merged) {
      res.setHeader("Cache-Control", "no-store");
      res.status(200).send('<?xml version="1.0"?><rss version="2.0"><channel><title>DTN</title><description>No items available</description></channel></rss>');
      return;
    }

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    res.status(200).send(merged);
  } catch (e) {
    res.status(500).json({ error: "Fetch failed: " + (e.message || "unknown") });
  }
}
