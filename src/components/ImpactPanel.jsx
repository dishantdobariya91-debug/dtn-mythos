// dtn.today — Impact Score + Media Bias Panel
// Used in: story detail view, Review Queue cards, NewspaperView lead

import React, { useState } from "react";
import { IMPACT_DIMENSIONS } from "../services/impact";

// ─── IMPACT SCORE PANEL ──────────────────────────────────────────

export function ImpactPanel({ story, onCompute, computing, compact }) {
  const impact = story.impact;
  const [showReasoning, setShowReasoning] = useState(false);

  if (!impact) {
    return (
      <div className="impact-panel impact-panel-empty">
        <div className="impact-panel-header">
          <span className="impact-label">IMPACT SCORE</span>
          <button
            className="impact-compute-btn"
            onClick={onCompute}
            disabled={computing}
          >
            {computing ? "Scoring…" : "▸ Compute"}
          </button>
        </div>
        <div className="impact-panel-empty-msg">
          Click <strong>Compute</strong> to score this story across 7 impact dimensions.
        </div>
      </div>
    );
  }

  const score = impact.impactScore;
  const tier = score >= 75 ? "high" : score >= 50 ? "medium" : score >= 30 ? "low" : "minimal";
  const tierLabel = score >= 75 ? "HIGH IMPACT" : score >= 50 ? "MODERATE" : score >= 30 ? "LOW" : "MINIMAL";

  if (compact) {
    return (
      <div className={"impact-pill impact-tier-" + tier}>
        <span className="impact-pill-num">{score}</span>
        <span className="impact-pill-label">{tierLabel}</span>
      </div>
    );
  }

  return (
    <div className={"impact-panel impact-tier-" + tier}>
      <div className="impact-panel-header">
        <span className="impact-label">IMPACT SCORE</span>
        <span className="impact-source">{impact.model === "ai" ? "AI scored" : "Heuristic"}</span>
      </div>

      <div className="impact-score-row">
        <div className="impact-score-num">{score}</div>
        <div className="impact-score-meta">
          <div className="impact-tier-badge">{tierLabel}</div>
          <div className="impact-out-of">/ 100</div>
        </div>
      </div>

      <div className="impact-dimensions">
        {IMPACT_DIMENSIONS.map(d => {
          const v = impact.dimensions?.[d.key] || 0;
          return (
            <div key={d.key} className="impact-dim">
              <div className="impact-dim-label">{d.label}</div>
              <div className="impact-dim-bar">
                <div className="impact-dim-fill" style={{ width: v + "%" }} />
              </div>
              <div className="impact-dim-num">{v}</div>
            </div>
          );
        })}
      </div>

      <button
        className="impact-reasoning-toggle"
        onClick={() => setShowReasoning(s => !s)}
      >
        {showReasoning ? "Hide reasoning ▴" : "Show reasoning ▾"}
      </button>

      {showReasoning && (
        <div className="impact-reasoning">
          {impact.reasoning}
        </div>
      )}

      {onCompute && (
        <button
          className="impact-recompute-btn"
          onClick={onCompute}
          disabled={computing}
          title="Re-score this story"
        >
          {computing ? "Re-scoring…" : "↻ Re-score"}
        </button>
      )}
    </div>
  );
}

// ─── MEDIA BIAS COMPARISON PANEL ─────────────────────────────────

export function BiasPanel({ story, onCompute, computing }) {
  const bias = story.bias;
  const [expanded, setExpanded] = useState(null);

  if (!bias) {
    return (
      <div className="bias-panel bias-panel-empty">
        <div className="bias-panel-header">
          <span className="bias-label">MEDIA BIAS COMPARISON</span>
          <button
            className="bias-compute-btn"
            onClick={onCompute}
            disabled={computing}
          >
            {computing ? "Analyzing…" : "▸ Compare"}
          </button>
        </div>
        <div className="bias-panel-empty-msg">
          Compare how this story is covered across The Hindu, Indian Express, Times of India, and Hindustan Times.
        </div>
      </div>
    );
  }

  if (bias.outlets?.length <= 1 && bias.noComparisonReason) {
    return (
      <div className="bias-panel bias-panel-no-data">
        <div className="bias-panel-header">
          <span className="bias-label">MEDIA BIAS COMPARISON</span>
        </div>
        <div className="bias-panel-empty-msg">
          {bias.noComparisonReason}
        </div>
      </div>
    );
  }

  return (
    <div className="bias-panel">
      <div className="bias-panel-header">
        <span className="bias-label">MEDIA BIAS COMPARISON</span>
        <span className="bias-source">
          {bias.sourceCount} sources · {bias.model === "ai" ? `${bias.biasConfidence}% confidence` : "Headlines only"}
        </span>
      </div>

      {bias.overallDivergence && (
        <div className="bias-divergence">
          {bias.overallDivergence}
        </div>
      )}

      {bias.consensusFacts && bias.consensusFacts.length > 0 && (
        <div className="bias-consensus">
          <div className="bias-consensus-label">All outlets agree on:</div>
          <ul className="bias-consensus-list">
            {bias.consensusFacts.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>
      )}

      <div className="bias-outlets">
        {bias.outlets?.map((o, i) => (
          <div key={i} className="bias-outlet">
            <div className="bias-outlet-header" onClick={() => setExpanded(expanded === i ? null : i)}>
              <span className="bias-outlet-name">{o.name}</span>
              <span className={"bias-direction bias-dir-" + (o.narrativeDirection || "unknown").replace(/[^a-z-]/g, "")}>
                {o.narrativeDirection?.replace(/-/g, " ") || "—"}
              </span>
              <span className="bias-outlet-toggle">{expanded === i ? "▴" : "▾"}</span>
            </div>
            {expanded === i && (
              <div className="bias-outlet-detail">
                <div className="bias-outlet-row">
                  <span className="bias-outlet-row-label">Framing:</span>
                  <span>{o.framing}</span>
                </div>
                <div className="bias-outlet-row">
                  <span className="bias-outlet-row-label">Sentiment:</span>
                  <span className={"bias-sentiment bias-sent-" + (o.sentiment || "")}>{o.sentiment || "—"}</span>
                </div>
                {o.omittedFacts && o.omittedFacts.length > 0 && (
                  <div className="bias-outlet-row">
                    <span className="bias-outlet-row-label">Omitted:</span>
                    <ul className="bias-omitted-list">
                      {o.omittedFacts.map((f, j) => <li key={j}>{f}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {onCompute && (
        <button
          className="bias-recompute-btn"
          onClick={onCompute}
          disabled={computing}
        >
          {computing ? "Re-analyzing…" : "↻ Re-analyze"}
        </button>
      )}
    </div>
  );
}

// Combined wrapper for convenience
export function ImpactBiasSection({ story, onComputeImpact, onComputeBias, computingImpact, computingBias }) {
  return (
    <div className="impact-bias-section">
      <ImpactPanel
        story={story}
        onCompute={onComputeImpact}
        computing={computingImpact}
      />
      <BiasPanel
        story={story}
        onCompute={onComputeBias}
        computing={computingBias}
      />
    </div>
  );
}
