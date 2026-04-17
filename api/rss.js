// Vercel Serverless Function — server-side RSS proxy
// No CORS issues because this runs on Vercel's edge, not in the browser.
// Usage from frontend: fetch("/api/rss?scope=national&state=Gujarat")

export const config = { runtime: "edge" };

const BASE = "https://news.google.com/rss/search?hl=en-IN&gl=IN&ceid=IN:en&q=";
const KEYWORDS = "rights+court+police+arrest+protest+constitution+demolition+election+-cricket+-IPL";

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope") || "national";
    const state = searchParams.get("state") || "";
    const district = searchParams.get("district") || "";

    let q;
    if (scope === "national") {
      q = "India+democracy+constitution+rights+court+" + KEYWORDS;
    } else if (scope === "state" && state) {
      q = state + "+India+" + KEYWORDS;
    } else if (scope === "district" && district) {
      q = district + "+India+" + KEYWORDS;
    } else {
      q = "India+civic+rights+" + KEYWORDS;
    }

    const rssUrl = BASE + encodeURIComponent(q);

    const res = await fetch(rssUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
      // 12 second timeout
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: "upstream_error", status: res.status }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const xml = await res.text();

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        // Cache for 60 seconds on Vercel's edge to reduce load on Google
        "Cache-Control": "s-maxage=60, stale-while-revalidate=120",
        // Allow browser access from any origin (your own domain will work)
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "fetch_failed", message: String(e?.message || e) }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
