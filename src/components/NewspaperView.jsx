// DTN Mythos v12.2 — Newspaper (full broadsheet, 5-6 A4 pages when printed)
import React, { useState, useMemo, useCallback } from "react";

export function NewspaperView({ stories, natScore }) {
  const [generating, setGenerating] = useState(false);
  const today = useMemo(() => new Date(), []);

  // v12.2 FIX: include stories not explicitly rejected/skipped (not just approved)
  const publishable = useMemo(() => {
    if (!stories) return [];
    return stories
      .filter(s => !s.aiSkipped && !s.rejected)
      .sort((a, b) => {
        const aScore = Math.abs(a.aiScore || a.delta || 0);
        const bScore = Math.abs(b.aiScore || b.delta || 0);
        if (bScore !== aScore) return bScore - aScore;
        return (b.ts || 0) - (a.ts || 0);
      });
  }, [stories]);

  const lead    = publishable[0];
  const pageOne = publishable.slice(1, 5);
  const policy  = publishable
    .filter(s => ["law","court","policy","policing","rights"].includes(s.storyType))
    .filter(s => s !== lead && !pageOne.includes(s)).slice(0, 6);
  const states  = publishable
    .filter(s => s.scope === "state" || s.scope === "local")
    .filter(s => s !== lead && !pageOne.includes(s) && !policy.includes(s)).slice(0, 8);
  const used    = new Set([lead, ...pageOne, ...policy, ...states]);
  const inside  = publishable.filter(s => !used.has(s)).slice(0, 18);

  const handlePrint = useCallback(() => {
    setGenerating(true);
    setTimeout(() => { window.print(); setGenerating(false); }, 100);
  }, []);

  const dateStr = today.toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const volumeStart = new Date("2025-01-01").getTime();
  const issueNum = Math.floor((today.getTime() - volumeStart) / (1000*60*60*24));
  const volumeNum = Math.floor(issueNum / 365) + 1;

  return (
    <div className="newspaper-wrap">
      <div className="newspaper-controls no-print">
        <button className="newspaper-pdf-btn" onClick={handlePrint} disabled={generating}>
          {generating ? "Preparing…" : "📄 Download as PDF"}
        </button>
        <div className="newspaper-hint">
          Click above → choose "Save as PDF" in your browser's print dialog.
          {publishable.length === 0 && <span className="newspaper-empty-note"> (Fetch stories first.)</span>}
        </div>
        <div className="newspaper-stats">
          <strong>{publishable.length}</strong> stories · est. {estimatePages(publishable.length)} A4 pages
        </div>
      </div>

      <div className="newspaper-paper">
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
            <span>{publishable.length} stories tracked</span>
            <span>·</span>
            <span>Calibrated against Freedom House · V-Dem · RSF · EIU</span>
          </div>
        </header>

        {publishable.length === 0 ? (
          <div className="paper-empty">
            <h2>Today's paper is empty</h2>
            <p>No constitutional stories classified yet. Return to Live Newsroom and fetch stories to populate today's edition.</p>
          </div>
        ) : (<>
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
                {lead.citizenExplanation || lead.aiAnalysis || fallbackSummary(lead)}
              </div>
              {(lead.violations?.length > 0 || lead.supports?.length > 0) && (
                <div className="paper-lead-articles">
                  {lead.violations?.map((v,i) => (
                    <div key={"v"+i} className="paper-article-ref violation">
                      <strong>{v.a}</strong> — {v.title || "Constitutional article"}
                      {v.how && <span className="paper-article-how"> · {truncate(v.how, 120)}</span>}
                    </div>
                  ))}
                  {lead.supports?.map((v,i) => (
                    <div key={"s"+i} className="paper-article-ref support">
                      <strong>{v.a}</strong> — {v.title || "Constitutional article"}
                      {v.how && <span className="paper-article-how"> · {truncate(v.how, 120)}</span>}
                    </div>
                  ))}
                </div>
              )}
            </article>
          )}

          {pageOne.length > 0 && (
            <section className="paper-front-grid">
              {pageOne.map(s => (
                <article key={s.id} className="paper-front-story">
                  <div className="paper-front-label">{labelBadge(s)}</div>
                  <h3 className="paper-front-headline">{s.headline}</h3>
                  <div className="paper-front-meta">
                    {institutionName(s.institution)}
                    {s.confidence != null && " · " + Math.round(s.confidence*100) + "% confidence"}
                  </div>
                  <p className="paper-front-body">
                    {truncate(s.citizenExplanation || fallbackSummary(s), 320)}
                  </p>
                </article>
              ))}
            </section>
          )}

          {policy.length > 0 && (
            <section className="paper-section paper-page-break">
              <div className="paper-section-header">
                <h3 className="paper-section-title">Policy &amp; Law</h3>
                <div className="paper-section-sub">Court rulings · Legislation · Executive orders</div>
              </div>
              <div className="paper-policy-grid">
                {policy.map(s => (
                  <article key={s.id} className="paper-policy-story">
                    <div className="paper-policy-label">{labelBadge(s)}</div>
                    <h4 className="paper-policy-headline">{s.headline}</h4>
                    <div className="paper-policy-meta">
                      {institutionName(s.institution)} · {evidenceName(s.evidenceLevel)}
                      {s.confidence != null && " · " + Math.round(s.confidence*100) + "%"}
                    </div>
                    <p className="paper-policy-body">
                      {truncate(s.citizenExplanation || fallbackSummary(s), 240)}
                    </p>
                    {(s.violations?.length > 0 || s.supports?.length > 0) && (
                      <div className="paper-policy-refs">
                        {[...(s.violations||[]), ...(s.supports||[])].slice(0,2).map((a,i) => (
                          <span key={i} className="paper-policy-ref">{a.a}</span>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {states.length > 0 && (
            <section className="paper-section paper-page-break">
              <div className="paper-section-header">
                <h3 className="paper-section-title">States &amp; Districts</h3>
                <div className="paper-section-sub">Regional constitutional events</div>
              </div>
              <div className="paper-states-grid">
                {states.map(s => (
                  <article key={s.id} className="paper-states-story">
                    <div className="paper-states-region">
                      {s.state || (s.scope === "local" ? "District" : "State")}
                    </div>
                    <div className="paper-states-label">{labelBadge(s, true)}</div>
                    <h4 className="paper-states-headline">{s.headline}</h4>
                    <p className="paper-states-body">
                      {truncate(s.citizenExplanation || fallbackSummary(s), 180)}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          )}

          {inside.length > 0 && (
            <section className="paper-section paper-page-break">
              <div className="paper-section-header">
                <h3 className="paper-section-title">Inside Today</h3>
                <div className="paper-section-sub">Brief constitutional notes</div>
              </div>
              <div className="paper-inside-grid">
                {inside.map(s => (
                  <div key={s.id} className="paper-inside-story">
                    <div className="paper-inside-label">{labelBadge(s, true)}</div>
                    <div className="paper-inside-headline">{s.headline}</div>
                    <div className="paper-inside-meta">
                      {institutionName(s.institution)}
                      {s.scope === "local" && " · Local"}
                      {s.scope === "state" && s.state && " · " + s.state}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="paper-section paper-page-break paper-opinion">
            <div className="paper-section-header">
              <h3 className="paper-section-title">The Score</h3>
              <div className="paper-section-sub">How today's events moved the Democracy Score</div>
            </div>
            <div className="paper-opinion-body">
              <p className="paper-opinion-lead">
                India's Democracy Score today stands at <strong>{natScore != null ? natScore : "—"}</strong>.
                {publishable.length > 0 ? ` Today's edition tracks ${publishable.length} constitutional events across ${Array.from(new Set(publishable.map(s => institutionName(s.institution)))).length} institutions.` : ""}
              </p>
              <div className="paper-opinion-stats">
                <div className="paper-opinion-stat">
                  <div className="paper-opinion-stat-n">{publishable.filter(s=>s.label==="support"||(s.aiScore||0)>0).length}</div>
                  <div className="paper-opinion-stat-l">Supports</div>
                </div>
                <div className="paper-opinion-stat">
                  <div className="paper-opinion-stat-n">{publishable.filter(s=>s.label==="potential_violation"||(s.aiScore||0)<-1).length}</div>
                  <div className="paper-opinion-stat-l">Potential Violations</div>
                </div>
                <div className="paper-opinion-stat">
                  <div className="paper-opinion-stat-n">{publishable.filter(s=>s.courtStatus&&s.courtStatus!=="none").length}</div>
                  <div className="paper-opinion-stat-l">Court-Active</div>
                </div>
                <div className="paper-opinion-stat">
                  <div className="paper-opinion-stat-n">{publishable.filter(s=>s.reviewNeeded||s.label==="uncertain").length}</div>
                  <div className="paper-opinion-stat-l">Under Review</div>
                </div>
              </div>
              <div className="paper-methodology">
                <strong>Methodology:</strong> Stories are auto-classified by a regex-first filter, enriched by AI analysis (Llama-3.3-70B),
                then scored against seven constitutional pillars. Evidence ranges from allegation to final adjudication.
                Full methodology at dtn.today/#/method.
              </div>
            </div>
          </section>

          <footer className="paper-footer">
            <div className="paper-footer-line">
              Printed from <strong>dtn.today</strong> · {dateStr}
            </div>
            <div className="paper-footer-disclaimer">
              This platform is not a court. "Potential violation" ≠ conviction.
              Labels: support · potential_violation · neutral · uncertain.
              NALSA 15100 · NHRC 14433
            </div>
          </footer>
        </>)}
      </div>
    </div>
  );
}

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
    <span className={"paper-label paper-label-"+label+(compact?" compact":"")}
          style={{ color, borderColor: color }}>
      {text.toUpperCase()}
    </span>
  );
}

function inferLabelFromDelta(s) {
  const score = s.aiScore || s.delta || 0;
  if (score >= 2) return "support";
  if (score <= -2) return "potential_violation";
  if (score === 0) return "neutral";
  return "uncertain";
}

function institutionName(id) {
  const m = { judiciary:"Judiciary", pmo:"PMO", home:"Home Affairs",
    law:"Law & Justice", ec:"Election Commission", police:"Police & Safety",
    media:"Media & Information", defence:"Defence", rural:"Rural Development",
    education:"Education", health:"Health", environment:"Environment",
    minority:"Minority Affairs", finance:"Finance" };
  return m[id] || "General";
}

function evidenceName(id) {
  const m = { allegation:"Allegation", single_source:"Single Source",
    corroborated:"Corroborated", official_doc:"Official Document",
    court_finding:"Court Finding", final_adjudication:"Final Adjudication" };
  return m[id] || "Single Source";
}

function fallbackSummary(s) {
  return "A constitutional event concerning " +
    institutionName(s.institution).toLowerCase() +
    ". Full analysis will appear on the web edition at dtn.today.";
}

function truncate(text, max) {
  if (!text) return "";
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

function estimatePages(n) {
  if (n === 0) return 0;
  if (n <= 5) return 1;
  if (n <= 12) return 2;
  if (n <= 20) return 3;
  if (n <= 30) return 5;
  return 6;
}
