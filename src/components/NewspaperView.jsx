// DTN Mythos v12.3 — Full broadsheet, always 5-6 A4 pages when printed
import React, { useState, useMemo, useCallback } from "react";

const ON_THIS_DAY = [
  { date: "Jan 26", year: 1950, event: "The Constitution of India came into force. India became a sovereign democratic republic." },
  { date: "Nov 26", year: 1949, event: "The Constituent Assembly adopted the Constitution of India." },
  { date: "Aug 15", year: 1947, event: "India gained independence; Jawaharlal Nehru became the first Prime Minister." },
  { date: "Apr 24", year: 1973, event: "Supreme Court delivered Kesavananda Bharati judgment, establishing Basic Structure doctrine." },
  { date: "Jun 25", year: 1975, event: "Emergency declared by Indira Gandhi — civil liberties suspended for 21 months." },
  { date: "Dec 6", year: 1956, event: "Dr. B.R. Ambedkar, chief architect of the Constitution, passed away." },
  { date: "Sep 28", year: 2018, event: "Supreme Court decriminalised homosexuality, reading down Section 377 IPC." },
  { date: "Aug 24", year: 2017, event: "Puttaswamy judgment — Right to Privacy declared a fundamental right." },
  { date: "Aug 5", year: 2019, event: "Article 370 abrogated; Jammu & Kashmir reorganised into two Union Territories." },
];

const CONSTITUTION_ARTICLES = [
  { num: "Article 14", title: "Equality before law", text: "The State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India." },
  { num: "Article 19", title: "Freedom of speech", text: "All citizens shall have the right to freedom of speech and expression, to assemble peaceably, to form associations, to move freely, to reside and settle, and to practise any profession." },
  { num: "Article 21", title: "Protection of life and liberty", text: "No person shall be deprived of his life or personal liberty except according to procedure established by law." },
  { num: "Article 25", title: "Freedom of religion", text: "Subject to public order, morality and health, all persons are equally entitled to freedom of conscience and the right freely to profess, practise and propagate religion." },
  { num: "Article 32", title: "Right to constitutional remedies", text: "The right to move the Supreme Court by appropriate proceedings for the enforcement of the rights conferred by this Part is guaranteed. Dr. Ambedkar called this the 'heart and soul' of the Constitution." },
  { num: "Article 370", title: "Special provisions for J&K (abrogated 2019)", text: "Granted special autonomous status to Jammu and Kashmir. Abrogated by Presidential Order on 5 August 2019." },
  { num: "Article 356", title: "President's Rule", text: "If the President is satisfied that the government of a State cannot be carried on in accordance with the Constitution, he may assume the functions of the State government." },
];

const ALL_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur",
  "Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","J&K"
];

export function NewspaperView({ stories, natScore }) {
  const [generating, setGenerating] = useState(false);
  const today = useMemo(() => new Date(), []);

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
  const courts  = publishable
    .filter(s => s.courtStatus && s.courtStatus !== "none")
    .filter(s => s !== lead && !pageOne.includes(s) && !policy.includes(s)).slice(0, 5);
  const states  = publishable
    .filter(s => s.scope === "state" || s.scope === "local")
    .filter(s => s !== lead && !pageOne.includes(s) && !policy.includes(s) && !courts.includes(s)).slice(0, 8);
  const used    = new Set([lead, ...pageOne, ...policy, ...courts, ...states]);
  const inside  = publishable.filter(s => !used.has(s)).slice(0, 18);

  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  const featuredArticle = CONSTITUTION_ARTICLES[dayOfYear % CONSTITUTION_ARTICLES.length];
  const todayInHistory = ON_THIS_DAY[dayOfYear % ON_THIS_DAY.length];

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

  const editorial = generateEditorial(publishable, natScore);

  return (
    <div className="newspaper-wrap">
      <div className="newspaper-controls no-print">
        <button className="newspaper-pdf-btn" onClick={handlePrint} disabled={generating}>
          {generating ? "Preparing…" : "📄 Download as PDF"}
        </button>
        <div className="newspaper-hint">
          Click above → choose "Save as PDF" in your browser's print dialog.
          {publishable.length === 0 && <span className="newspaper-empty-note"> (Fetch stories first to populate today's edition.)</span>}
        </div>
        <div className="newspaper-stats">
          <strong>{publishable.length}</strong> stories · <strong>6 A4 pages</strong>
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
            <span>{publishable.length} stories today</span>
            <span>·</span>
            <span>Calibrated: Freedom House · V-Dem · RSF · EIU</span>
          </div>
        </header>

        {lead ? (
          <article className="paper-lead">
            <div className="paper-lead-label">{labelBadge(lead)}</div>
            <h2 className="paper-lead-headline">{lead.headline}</h2>
            <div className="paper-lead-byline">
              <span className="paper-lead-eyebrow">
                {institutionName(lead.institution)} · Evidence: {evidenceName(lead.evidenceLevel)}
                {lead.confidence != null && " · Confidence: " + Math.round(lead.confidence * 100) + "%"}
                {lead.impact && " · Impact: " + lead.impact.impactScore + "/100"}
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
        ) : (
          <div className="paper-empty">
            <h2>Today's headlines awaiting classification</h2>
            <p>Fetch stories from Live Newsroom to populate today's front page. The broadsheet continues below with evergreen sections.</p>
          </div>
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

        {/* PAGE 2 — Policy & Law + Editorial */}
        <section className="paper-section paper-page-break">
          <div className="paper-section-header">
            <h3 className="paper-section-title">Policy &amp; Law</h3>
            <div className="paper-section-sub">Court rulings · Legislation · Executive orders</div>
          </div>
          {policy.length > 0 ? (
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
                </article>
              ))}
            </div>
          ) : (
            <p className="paper-section-empty">
              No policy or legal events classified today. Check Live Newsroom for updates throughout the day.
            </p>
          )}

          <div className="paper-editorial">
            <div className="paper-editorial-label">Editorial</div>
            <h4 className="paper-editorial-hed">{editorial.title}</h4>
            <p className="paper-editorial-body">{editorial.body}</p>
            <div className="paper-editorial-sig">— The DTN Mythos Editors</div>
          </div>
        </section>

        {/* PAGE 3 — Court Watch + Rights Corner */}
        <section className="paper-section paper-page-break">
          <div className="paper-section-header">
            <h3 className="paper-section-title">Court Watch</h3>
            <div className="paper-section-sub">Pending cases · Active hearings · Reserved judgments</div>
          </div>
          {courts.length > 0 ? (
            <div className="paper-courts">
              {courts.map(s => (
                <article key={s.id} className="paper-court-story">
                  <div className="paper-court-status">
                    {s.courtStatus === "pending" && "⏳ PENDING"}
                    {s.courtStatus === "stayed" && "⏸ STAYED"}
                    {s.courtStatus === "upheld" && "✓ UPHELD"}
                    {s.courtStatus === "struck_down" && "✕ STRUCK DOWN"}
                  </div>
                  <h4 className="paper-court-headline">{s.headline}</h4>
                  <div className="paper-court-meta">
                    {institutionName(s.institution)}
                    {s.confidence != null && " · " + Math.round(s.confidence*100) + "%"}
                  </div>
                  <p className="paper-court-body">
                    {truncate(s.citizenExplanation || fallbackSummary(s), 200)}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <p className="paper-section-empty">
              No court-active matters in today's edition. The Supreme Court and High Courts hear approximately
              80,000 cases collectively each year; most routine proceedings do not appear in daily news feeds.
            </p>
          )}

          <div className="paper-rights-corner">
            <div className="paper-rights-label">Rights Corner</div>
            <h4 className="paper-rights-hed">Emergency numbers every citizen should save</h4>
            <div className="paper-rights-grid">
              <div className="paper-rights-item">
                <div className="paper-rights-num">15100</div>
                <div className="paper-rights-title">NALSA Legal Aid</div>
                <div className="paper-rights-desc">Free legal help when you cannot afford a lawyer. Guaranteed under Article 39A.</div>
              </div>
              <div className="paper-rights-item">
                <div className="paper-rights-num">14433</div>
                <div className="paper-rights-title">NHRC Complaint Line</div>
                <div className="paper-rights-desc">Report human rights violations — police excesses, custody abuse, minority harassment.</div>
              </div>
              <div className="paper-rights-item">
                <div className="paper-rights-num">112</div>
                <div className="paper-rights-title">All-India Emergency</div>
                <div className="paper-rights-desc">Police, fire, ambulance. Single number. Multilingual.</div>
              </div>
              <div className="paper-rights-item">
                <div className="paper-rights-num">1091</div>
                <div className="paper-rights-title">Women in Distress</div>
                <div className="paper-rights-desc">24×7 helpline. Also 181 for Women's Commission.</div>
              </div>
              <div className="paper-rights-item">
                <div className="paper-rights-num">1098</div>
                <div className="paper-rights-title">Childline India</div>
                <div className="paper-rights-desc">Child protection: abuse, trafficking, missing. 24×7, free, anonymous.</div>
              </div>
              <div className="paper-rights-item">
                <div className="paper-rights-num">1800-11-4000</div>
                <div className="paper-rights-title">RTI Helpline</div>
                <div className="paper-rights-desc">Right to Information queries — get any public record under Article 19(1)(a).</div>
              </div>
            </div>
          </div>
        </section>

        {/* PAGE 4 — States & Districts + States Roundup */}
        <section className="paper-section paper-page-break">
          <div className="paper-section-header">
            <h3 className="paper-section-title">States &amp; Districts</h3>
            <div className="paper-section-sub">Regional constitutional events</div>
          </div>
          {states.length > 0 ? (
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
          ) : (
            <p className="paper-section-empty">
              No state or local classifier events in today's edition.
            </p>
          )}

          <div className="paper-roundup">
            <h4 className="paper-roundup-hed">India at a glance — All 30 jurisdictions</h4>
            <div className="paper-roundup-grid">
              {ALL_STATES.map(st => {
                const count = publishable.filter(s => s.state === st).length;
                return (
                  <div key={st} className={"paper-roundup-item" + (count > 0 ? " has-stories" : "")}>
                    <span className="paper-roundup-state">{st}</span>
                    <span className="paper-roundup-count">{count > 0 ? count + " today" : "—"}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* PAGE 5 — Inside Today + Constitution Excerpt */}
        <section className="paper-section paper-page-break">
          <div className="paper-section-header">
            <h3 className="paper-section-title">Inside Today</h3>
            <div className="paper-section-sub">Brief constitutional notes from across the nation</div>
          </div>
          {inside.length > 0 ? (
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
          ) : (
            <p className="paper-section-empty">No additional briefs in today's edition.</p>
          )}

          <div className="paper-article-feature">
            <div className="paper-article-feature-label">The Constitution, Read Closely</div>
            <div className="paper-article-feature-num">{featuredArticle.num}</div>
            <div className="paper-article-feature-title">{featuredArticle.title}</div>
            <blockquote className="paper-article-feature-text">
              "{featuredArticle.text}"
            </blockquote>
            <div className="paper-article-feature-src">— Constitution of India</div>
          </div>
        </section>

        {/* PAGE 6 — The Score + On This Day */}
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

            <div className="paper-on-this-day">
              <div className="paper-on-this-day-label">On this day in Indian constitutional history</div>
              <div className="paper-on-this-day-date">{todayInHistory.date}, {todayInHistory.year}</div>
              <div className="paper-on-this-day-event">{todayInHistory.event}</div>
            </div>

            <div className="paper-methodology">
              <strong>Methodology:</strong> Stories are auto-classified by a regex-first filter, enriched by AI analysis (Llama 3.3 70B via Groq, falling back to Gemini 2.0 Flash),
              then scored against seven constitutional pillars. Evidence ranges from allegation to final adjudication.
              Confidence is a 0-100% measure of certainty.
            </div>
          </div>
        </section>

        <footer className="paper-footer">
          <div className="paper-footer-line">
            Printed from <strong>dtn.today</strong> · {dateStr} · Vol. {volumeNum} Issue {issueNum}
          </div>
          <div className="paper-footer-disclaimer">
            This platform is not a court. Stories are tracked for civic awareness.
            "Potential violation" ≠ conviction. Labels: support · potential_violation · neutral · uncertain.
            For legal emergencies: NALSA 15100 · NHRC 14433 · Emergency 112
          </div>
        </footer>
      </div>
    </div>
  );
}

function generateEditorial(stories, score) {
  const n = stories.length;
  const violations = stories.filter(s => s.label === "potential_violation" || (s.aiScore || 0) < -1).length;
  const supports = stories.filter(s => s.label === "support" || (s.aiScore || 0) > 0).length;

  if (n === 0) {
    return {
      title: "The silence between stories",
      body: "No constitutional events have been classified yet today. A quiet news cycle is not the absence of consequence — the 24/7 operations of Indian democracy continue unobserved.",
    };
  }
  if (violations > supports * 2) {
    return {
      title: "A day of pressure on the guardrails",
      body: `Today's edition tracks ${violations} events flagged as potential violations against ${supports} institutional supports. This asymmetry is why tools like this exist: to aggregate the drumbeat of small pressures on rights, visible against a slower calibration. Democracy Score: ${score}.`,
    };
  }
  if (supports > violations) {
    return {
      title: "Institutions as designed",
      body: `Today's edition surfaces ${supports} institutional supports against ${violations} potential violations. Courts granting bail, commissions ordering probes — these are the unglamorous daily work of a functioning democracy. Score: ${score}.`,
    };
  }
  return {
    title: "The ordinary work of the republic",
    body: `Today's edition tracks ${n} constitutional events — neither a crisis day nor a particular triumph. Democratic function is mostly this: hearings continued, notifications issued, rights asserted. Score: ${score}.`,
  };
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
