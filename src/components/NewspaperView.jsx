// DTN Mythos v12.1 — Newspaper view component
// Renders today's stories as a traditional broadsheet newspaper layout.
// Print-optimized — user hits the "Download PDF" button, browser's print dialog
// opens, user chooses "Save as PDF" as destination. Works in every modern browser.
// No new npm dependencies required.
//
// INTEGRATION:
//   1. Save as src/components/NewspaperView.jsx
//   2. In App.jsx, import: import { NewspaperView } from "./components/NewspaperView";
//   3. Add a nav tab "Paper" → {page==="paper"&&<NewspaperView stories={stories} natScore={natScore}/>}
//   4. Ensure newspaper.css from this patch is concatenated into src/index.css

import React, { useState, useMemo, useCallback } from "react";

export function NewspaperView({ stories, natScore }) {
  const [generating, setGenerating] = useState(false);

  // Use today's approved non-skipped stories for the front page
  const today = useMemo(() => new Date(), []);
  const approved = useMemo(() => {
    if (!stories) return [];
    return stories
      .filter(s => s.approved && !s.aiSkipped)
      .sort((a, b) => Math.abs(b.aiScore || b.delta || 0) - Math.abs(a.aiScore || a.delta || 0));
  }, [stories]);

  const lead = approved[0];
  const frontPage = approved.slice(1, 5);
  const inside = approved.slice(5, 15);

  const handlePrint = useCallback(() => {
    setGenerating(true);
    // Defer to next tick so UI state updates before modal opens
    setTimeout(() => {
      window.print();
      setGenerating(false);
    }, 100);
  }, []);

  const dateStr = today.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Volume number based on days since project start (arbitrary: 2025-01-01)
  const volumeStart = new Date("2025-01-01").getTime();
  const issueNum = Math.floor((today.getTime() - volumeStart) / (1000 * 60 * 60 * 24));
  const volumeNum = Math.floor(issueNum / 365) + 1;

  return (
    <div className="newspaper-wrap">
      {/* ─── Print-only controls (hidden when printing) ───────── */}
      <div className="newspaper-controls no-print">
        <button className="newspaper-pdf-btn" onClick={handlePrint} disabled={generating}>
          {generating ? "Preparing…" : "📄 Download as PDF"}
        </button>
        <div className="newspaper-hint">
          Click above → choose "Save as PDF" in your browser's print dialog.
          {approved.length === 0 && <span className="newspaper-empty-note"> (Fetch stories first to populate today's paper.)</span>}
        </div>
      </div>

      {/* ─── Newspaper — rendered in print format ───────────── */}
      <div className="newspaper-paper">
        {/* Masthead */}
        <header className="paper-masthead">
          <div className="paper-masthead-topline">
            <span>Vol. {volumeNum} · Issue {issueNum}</span>
            <span>{dateStr}</span>
            <span>India Edition · ₹0</span>
          </div>
          <h1 className="paper-title">DTN Mythos</h1>
          <div className="paper-tagline">
            <em>Constitutional Intelligence · Daily Broadsheet · dtn.today</em>
          </div>
          <div className="paper-score-strip">
            <span>Democracy Score: <strong>{natScore != null ? natScore : "—"}</strong></span>
            <span>·</span>
            <span>{approved.length} stories tracked</span>
            <span>·</span>
            <span>Calibrated against Freedom House · V-Dem · RSF · EIU</span>
          </div>
        </header>

        {approved.length === 0 ? (
          <div className="paper-empty">
            <h2>Today's paper is empty</h2>
            <p>No approved constitutional stories have been classified yet.
            Return to the Live Newsroom and fetch stories to populate today's edition.</p>
          </div>
        ) : (
          <>
            {/* Lead story (full-width) */}
            {lead && (
              <article className="paper-lead">
                <div className="paper-lead-label">{labelBadge(lead)}</div>
                <h2 className="paper-lead-headline">{lead.headline}</h2>
                <div className="paper-lead-byline">
                  <span className="paper-lead-eyebrow">
                    {institutionName(lead.institution)} · Evidence: {evidenceName(lead.evidenceLevel)}
                    {lead.confidence != null && " · Confidence: " + Math.round(lead.confidence * 100) + "%"}
                  </span>
                </div>
                <div className="paper-lead-body">
                  {lead.citizenExplanation || lead.aiAnalysis ||
                    fallbackSummary(lead)}
                </div>
                {(lead.violations?.length > 0 || lead.supports?.length > 0) && (
                  <div className="paper-lead-articles">
                    {lead.violations?.map((v, i) => (
                      <div key={"v" + i} className="paper-article-ref violation">
                        <strong>{v.a}</strong> — {v.title || "Constitutional article engaged"}
                      </div>
                    ))}
                    {lead.supports?.map((v, i) => (
                      <div key={"s" + i} className="paper-article-ref support">
                        <strong>{v.a}</strong> — {v.title || "Constitutional article engaged"}
                      </div>
                    ))}
                  </div>
                )}
              </article>
            )}

            {/* Front-page grid — 2-column */}
            {frontPage.length > 0 && (
              <section className="paper-front-grid">
                {frontPage.map(s => (
                  <article key={s.id} className="paper-front-story">
                    <div className="paper-front-label">{labelBadge(s)}</div>
                    <h3 className="paper-front-headline">{s.headline}</h3>
                    <div className="paper-front-meta">
                      {institutionName(s.institution)}
                      {s.confidence != null && " · " + Math.round(s.confidence * 100) + "% confidence"}
                    </div>
                    <p className="paper-front-body">
                      {truncate(s.citizenExplanation || fallbackSummary(s), 280)}
                    </p>
                  </article>
                ))}
              </section>
            )}

            {/* Inside pages — dense 3-column digest */}
            {inside.length > 0 && (
              <section className="paper-inside">
                <h3 className="paper-inside-hed">INSIDE TODAY</h3>
                <div className="paper-inside-grid">
                  {inside.map(s => (
                    <div key={s.id} className="paper-inside-story">
                      <div className="paper-inside-label">{labelBadge(s, true)}</div>
                      <div className="paper-inside-headline">{s.headline}</div>
                      <div className="paper-inside-meta">
                        {institutionName(s.institution)}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Footer */}
            <footer className="paper-footer">
              <div className="paper-footer-line">
                Printed from <strong>dtn.today</strong> · {dateStr}
              </div>
              <div className="paper-footer-disclaimer">
                This platform is not a court. Stories are tracked for civic awareness.
                "Potential violation" ≠ conviction. Labels: support · potential_violation · neutral · uncertain.
                For legal emergencies: NALSA 15100 · NHRC 14433
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────

function labelBadge(s, compact = false) {
  const label = s.label || inferLabelFromDelta(s);
  const map = {
    support: { text: "Support", color: "#27500A" },
    potential_violation: { text: "Potential Violation", color: "#B8232A" },
    neutral: { text: "Neutral", color: "#4A4A4A" },
    uncertain: { text: "Uncertain", color: "#8A7640" },
  };
  const { text, color } = map[label] || map.neutral;
  return (
    <span
      className={"paper-label paper-label-" + label + (compact ? " compact" : "")}
      style={{ color, borderColor: color }}
    >
      {text.toUpperCase()}
    </span>
  );
}

// Compat shim — if story was classified before v12.1, derive label from old fields
function inferLabelFromDelta(s) {
  const score = s.aiScore || s.delta || 0;
  if (score >= 2) return "support";
  if (score <= -2) return "potential_violation";
  if (score === 0) return "neutral";
  return "uncertain";
}

function institutionName(id) {
  const map = {
    judiciary: "Judiciary",
    pmo: "PMO",
    home: "Home Affairs",
    law: "Law & Justice",
    ec: "Election Commission",
    police: "Police & Safety",
    media: "Media & Information",
    defence: "Defence",
    rural: "Rural Development",
    education: "Education",
    health: "Health",
    environment: "Environment",
    minority: "Minority Affairs",
    finance: "Finance",
  };
  return map[id] || "General";
}

function evidenceName(id) {
  const map = {
    allegation: "Allegation",
    single_source: "Single Source",
    corroborated: "Corroborated",
    official_doc: "Official Document",
    court_finding: "Court Finding",
    final_adjudication: "Final Adjudication",
  };
  return map[id] || "Single Source";
}

function fallbackSummary(s) {
  return "A constitutional event concerning " +
    institutionName(s.institution).toLowerCase() +
    ". Classification review pending — full analysis will appear on the web edition.";
}

function truncate(text, max) {
  if (!text) return "";
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, "") + "…";
}
