// DTN Mythos v12.2 — Suggest page
// Flow: user types a keyword/topic → we search Google News RSS via /api/rss
// → show top 3-5 matches → user picks one → it's classify()'d and
// dropped into the Review Queue (not auto-published) with suggestedBy marker

import React, { useState, useCallback } from "react";

const EXAMPLES = [
  "custody death Maharashtra",
  "Delhi HC journalist bail",
  "electoral bonds verdict",
  "NHRC probe Manipur",
  "bulldozer Uttar Pradesh",
  "UAPA activist release",
];

export function SuggestPage({ onAddStory, classify, toast, t }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [addedIds, setAddedIds] = useState(new Set());

  const handleSearch = useCallback(async (q) => {
    const term = (q || query).trim();
    if (!term || term.length < 3) {
      setError("Please enter at least 3 characters.");
      return;
    }
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Use /api/rss with a user-search scope. Backend should accept ?scope=search&q=...
      // Falls back to direct Google News RSS URL via public proxy if our endpoint doesn't handle it.
      const qs = new URLSearchParams();
      qs.set("scope", "search");
      qs.set("q", term + " India");

      let xml = null;

      // Try our /api/rss endpoint first
      try {
        const res = await fetch("/api/rss?" + qs.toString(), {
          signal: AbortSignal.timeout(15000)
        });
        if (res.ok) {
          const t = await res.text();
          if (t && t.length > 200) xml = t;
        }
      } catch (e) { /* fall through */ }

      // Fallback: public CORS proxy to Google News
      if (!xml) {
        const gnUrl = "https://news.google.com/rss/search?hl=en-IN&gl=IN&ceid=IN:en&q=" +
                      encodeURIComponent(term + " India");
        const proxies = [
          "https://corsproxy.io/?url=",
          "https://api.allorigins.win/raw?url=",
        ];
        for (const p of proxies) {
          try {
            const res = await fetch(p + encodeURIComponent(gnUrl), {
              signal: AbortSignal.timeout(12000)
            });
            if (res.ok) {
              const t = await res.text();
              if (t && t.length > 200) { xml = t; break; }
            }
          } catch (e) { /* try next */ }
        }
      }

      if (!xml) {
        setError("Couldn't reach the news service. Please try again in a moment.");
        setLoading(false);
        return;
      }

      const items = parseRss(xml).slice(0, 5);
      if (items.length === 0) {
        setResults([]);
      } else {
        setResults(items);
      }
    } catch (e) {
      setError("Search failed: " + (e.message || "unknown error"));
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleAdd = useCallback((item) => {
    // Classify the fetched story, add to Review Queue with suggestedBy marker
    const cls = classify(item.title, item.description || "");
    const story = {
      id: "U" + Date.now() + Math.floor(Math.random()*1000),
      ts: Date.now(),
      headline: item.title,
      body: item.description || "",
      link: item.link,
      image: item.image || null,
      source: extractSource(item),
      scope: "national",
      state: null,
      ...cls,
      // v12.2: mark as user-suggested so Review Queue can show a badge
      suggestedBy: "user",
      suggestedQuery: query,
      approved: false,
      held: true,      // goes to Review Queue
      aiDone: false,
    };
    onAddStory(story);
    setAddedIds(prev => new Set([...prev, item.link]));
    toast(
      "✓ Added to Review Queue — visit Review tab to approve",
      "success"
    );
  }, [query, classify, onAddStory, toast]);

  const handleExampleClick = (ex) => {
    setQuery(ex);
    handleSearch(ex);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="suggest-wrap">
      <div className="suggest-hero">
        <h1>Suggest a Story</h1>
        <p>
          Type a news topic, event, or keyword. We'll search current Indian news
          sources and show you real articles that match. Pick one to add it to the
          Review Queue — a human moderator (you) will then approve it before it
          appears in the newsroom.
        </p>
      </div>

      <div className="suggest-form">
        <input
          type="text"
          className="suggest-input"
          placeholder="e.g. custody death Tamil Nadu, or NHRC probe"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          maxLength={120}
        />
        <button
          className="suggest-btn"
          onClick={() => handleSearch()}
          disabled={loading || query.trim().length < 3}
        >
          {loading ? "Searching…" : "Search News"}
        </button>
      </div>

      <div className="suggest-examples">
        Try:{" "}
        {EXAMPLES.map((ex, i) => (
          <span
            key={i}
            className="suggest-example-chip"
            onClick={() => handleExampleClick(ex)}
          >
            {ex}
          </span>
        ))}
      </div>

      {loading && (
        <div className="suggest-status suggest-status-loading">
          Searching current Indian news sources for "{query}"…
        </div>
      )}

      {error && (
        <div className="suggest-status suggest-status-error">
          {error}
        </div>
      )}

      {results !== null && results.length === 0 && !loading && (
        <div className="suggest-status suggest-status-empty">
          <div style={{ fontSize: 22, marginBottom: 8 }}>📰</div>
          <div>No current news found for "{query}".</div>
          <div style={{ fontSize: 11, marginTop: 6, color: "var(--t3)" }}>
            Try a broader query or different keywords.
          </div>
        </div>
      )}

      {results && results.length > 0 && (
        <div className="suggest-results">
          {results.map((item, i) => {
            const added = addedIds.has(item.link);
            return (
              <div key={i} className="suggest-result">
                <div className="suggest-result-source">
                  {extractSource(item)}
                  {item.pubDate && " · " + formatDate(item.pubDate)}
                </div>
                <h3 className="suggest-result-headline">{item.title}</h3>
                {item.description && (
                  <p className="suggest-result-snippet">
                    {truncate(stripHtml(item.description), 220)}
                  </p>
                )}
                <div className="suggest-result-actions">
                  <button
                    className={"suggest-add-btn" + (added ? " added" : "")}
                    onClick={() => !added && handleAdd(item)}
                    disabled={added}
                  >
                    {added ? "✓ Added to Review" : "+ Add to Review Queue"}
                  </button>
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="suggest-result-link"
                    >
                      Read original ↗
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="suggest-disclaimer">
        <strong>How suggestions work:</strong> Your search results are fetched from Google News India.
        Choosing "Add to Review Queue" runs the story through our classifier and sends it to the Review tab —
        <strong> not</strong> directly to the homepage. A human moderator (admin) approves it there before
        it appears in the newsroom or daily paper. This prevents misinformation or spam from entering the
        editorial stream.
      </div>
    </div>
  );
}

// ─── RSS parser (minimal) ────────────────────────────────────────────

function parseRss(xml) {
  const items = [];
  // Items can be <item>...</item> (RSS) or <entry>...</entry> (Atom)
  const itemRegex = /<item[\s>][^]*?<\/item>/gi;
  const matches = xml.match(itemRegex) || [];
  for (const raw of matches) {
    const title = decodeEntities(extractTag(raw, "title") || "").trim();
    const link = decodeEntities(extractTag(raw, "link") || "").trim();
    const description = decodeEntities(extractTag(raw, "description") || "").trim();
    const pubDate = extractTag(raw, "pubDate") || "";
    const source = extractTag(raw, "source") || "";
    if (!title || !link) continue;
    items.push({ title, link, description, pubDate, source });
  }
  return items;
}

function extractTag(xml, tag) {
  // Handles both <tag>content</tag> and <tag><![CDATA[content]]></tag>
  const re = new RegExp("<" + tag + "[^>]*>([\\s\\S]*?)<\\/" + tag + ">", "i");
  const m = xml.match(re);
  if (!m) return null;
  const v = m[1].trim();
  const cdata = v.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  return cdata ? cdata[1].trim() : v;
}

function decodeEntities(s) {
  if (!s) return "";
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function stripHtml(s) {
  if (!s) return "";
  return s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function extractSource(item) {
  if (item.source) return item.source;
  // Google News title format is often "Headline - Source Name"
  const m = item.title && item.title.match(/\s[-–—]\s([^-–—]+)$/);
  if (m) return m[1].trim();
  try {
    const url = new URL(item.link);
    return url.hostname.replace(/^www\./, "");
  } catch (e) {
    return "News source";
  }
}

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric"
    });
  } catch (e) { return ""; }
}

function truncate(s, max) {
  if (!s) return "";
  if (s.length <= max) return s;
  return s.slice(0, max).replace(/\s+\S*$/, "") + "…";
}
