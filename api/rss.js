// DTN Mythos — /api/rss
// Vercel serverless proxy for Google News RSS.
// Handles scope=national|state|district (existing) and scope=search (new in v12.2).
//
// If you already have a live /api/rss.js in your repo, add the `if (scope === "search")`
// branch. Otherwise drop this whole file in at api/rss.js — it handles all modes.

const CONST_KEYWORDS = "rights+court+police+arrest+protest+constitution+demolition+election+-cricket+-IPL";

function buildUrl(scope, state, district, q) {
  const base = "https://news.google.com/rss/search?hl=en-IN&gl=IN&ceid=IN:en&q=";

  if (scope === "search" && q) {
    // v12.2 — user-initiated keyword search
    // Constrain to India-related context but let the user's query dominate
    const safe = q.replace(/[^\w\s+-]/g, "").slice(0, 120).trim();
    if (!safe) return null;
    return base + encodeURIComponent(safe + " India");
  }

  if (scope === "state" && state) {
    return base + encodeURIComponent(state + " India " + CONST_KEYWORDS);
  }

  if (scope === "district" && district) {
    return base + encodeURIComponent(district + " India " + CONST_KEYWORDS);
  }

  // Default: national
  return base + encodeURIComponent("India democracy constitution rights court " + CONST_KEYWORDS);
}

export default async function handler(req, res) {
  try {
    const { scope = "national", state, district, q } = req.query || {};

    const url = buildUrl(scope, state, district, q);
    if (!url) {
      res.status(400).json({ error: "Invalid search query" });
      return;
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; DTN-Mythos/12.2; +https://dtn.today)",
        "Accept": "application/rss+xml, application/xml, text/xml",
      },
      // Vercel Node functions support fetch with no special config
    });

    if (!response.ok) {
      res.status(502).json({ error: "Upstream returned " + response.status });
      return;
    }

    const xml = await response.text();

    // Cache for 60s — RSS doesn't update faster than that anyway
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).send(xml);
  } catch (e) {
    res.status(500).json({ error: "Fetch failed: " + (e.message || "unknown") });
  }
}
