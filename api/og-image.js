// Vercel Edge Function — robust OG image scraper
// Follows Google News redirects, handles relative URLs, tries multiple
// meta-tag patterns. Returns first found image URL or null.
// Runs at /api/og-image?url=https://...

export const config = { runtime: "edge" };

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function extractImage(html, baseUrl) {
  const patterns = [
    // Open Graph
    /<meta[^>]+property=["']og:image(?::secure_url|:url)?["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url|:url)?["']/i,
    // Twitter
    /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image(?::src)?["']/i,
    // Itemprop
    /<meta[^>]+itemprop=["']image["'][^>]+content=["']([^"']+)["']/i,
    // Link rel=image_src
    /<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i,
    // First schema.org news image
    /"image"\s*:\s*"([^"]+)"/i,
    /"image"\s*:\s*\[\s*"([^"]+)"/i,
    /"image"\s*:\s*\{[^}]*"url"\s*:\s*"([^"]+)"/i,
    // First article <img> as last resort (skip tiny icons)
    /<img[^>]+src=["']([^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["'][^>]*(?:width=["'](?:[5-9]\d\d|\d{4,})["'])/i,
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m && m[1]) {
      let img = m[1].replace(/&amp;/g, "&").trim();
      // Resolve relative URLs
      if (!/^https?:\/\//i.test(img)) {
        try { img = new URL(img, baseUrl).href; } catch { continue; }
      }
      // Skip tiny icons / logos / tracking pixels
      if (/logo|favicon|icon|tracker|pixel|spacer|blank/i.test(img)) continue;
      return img;
    }
  }
  return null;
}

// Follow redirects manually (Edge fetch follows by default, but we want visibility)
async function fetchHtml(url, maxHops = 5) {
  let current = url;
  for (let hop = 0; hop < maxHops; hop++) {
    const res = await fetch(current, {
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-IN,en;q=0.9",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(7000),
    });
    if (!res.ok) return { finalUrl: current, html: "", status: res.status };

    // Google News sometimes returns HTML with meta-refresh pointing to real article
    const contentType = res.headers.get("content-type") || "";
    if (!/text\/html|application\/xhtml/i.test(contentType)) {
      return { finalUrl: res.url, html: "", status: res.status };
    }

    // Read only first 80KB — meta tags are in <head>
    const reader = res.body.getReader();
    const chunks = [];
    let total = 0;
    const limit = 80 * 1024;
    while (total < limit) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      total += value.length;
    }
    try { await reader.cancel(); } catch {}
    const html = new TextDecoder("utf-8").decode(concat(chunks));

    // Check for meta refresh (Google News does this)
    const refresh = html.match(/<meta[^>]+http-equiv=["']refresh["'][^>]+content=["'][^;]+;\s*url=([^"']+)["']/i);
    if (refresh && refresh[1]) {
      try { current = new URL(refresh[1].trim(), res.url).href; continue; } catch {}
    }

    // Check for JS redirect pattern that Google News uses
    const jsRedirect = html.match(/(?:window\.location|location\.href)\s*=\s*["']([^"']+)["']/);
    if (jsRedirect && jsRedirect[1] && !html.includes("og:image")) {
      try { current = new URL(jsRedirect[1], res.url).href; continue; } catch {}
    }

    return { finalUrl: res.url, html, status: res.status };
  }
  return { finalUrl: current, html: "", status: 0 };
}

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const target = searchParams.get("url");

  if (!target) {
    return json({ error: "missing_url" }, 400);
  }

  let parsed;
  try {
    parsed = new URL(target);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw 0;
  } catch {
    return json({ error: "invalid_url" }, 400);
  }

  try {
    const { html, finalUrl, status } = await fetchHtml(target);
    if (!html) return json({ image: null, error: "no_html", status, finalUrl }, 200);
    const image = extractImage(html, finalUrl);
    return json({ image, source: target, finalUrl }, 200, true);
  } catch (e) {
    return json({ image: null, error: "fetch_failed", message: String(e?.message || e) }, 200);
  }
}

function json(obj, status = 200, cache = false) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": cache ? "s-maxage=3600, stale-while-revalidate=86400" : "no-store",
    },
  });
}

function concat(chunks) {
  let len = 0;
  for (const c of chunks) len += c.length;
  const out = new Uint8Array(len);
  let off = 0;
  for (const c of chunks) { out.set(c, off); off += c.length; }
  return out;
}
