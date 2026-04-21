// DTN Mythos v12 — Broadcast components
// Sprint A (visual), Sprint B (live-feel), Sprint C (podcast hub)
// + kinetic ticker, SpeechSynthesis, animated SVG illustrations.

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { PODCASTS, TOPIC_META, TOPIC_ORDER, PODCAST_FALLBACKS } from "../podcasts";

// ─── Icons (inline SVG; no external deps) ──────────────────────────
const ICON = {
  speaker: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    </svg>
  ),
  stop: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" rx="1.5"/>
    </svg>
  ),
  x: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  ),
  dot: (
    <svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="5" fill="currentColor"/></svg>
  ),
  arrowUp: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M17 7H8M17 7v9"/></svg>
  ),
  arrowDown: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 7L7 17M7 17h9M7 17V8"/></svg>
  ),
};

// ─── 1. BroadcastMasthead ───────────────────────────────────────────
export function BroadcastMasthead({ children, today, stories }) {
  return (
    <div className="bcast-masthead">
      <div className="bcast-amber-rule" aria-hidden="true" />
      <div className="bcast-row">
        <div className="bcast-left">
          <div className="bcast-wordmark">DTN MYTHOS</div>
          <div className="bcast-sub">
            <span className="bcast-edition">India Edition</span>
            <span className="bcast-sep">·</span>
            <span className="bcast-date">{today}</span>
            <OnAirBadge stories={stories} />
          </div>
        </div>
        <div className="bcast-right">{children}</div>
      </div>
    </div>
  );
}

// ─── 2. OnAirBadge ──────────────────────────────────────────────────
export function OnAirBadge({ stories }) {
  const [tick, setTick] = useState(0);
  useEffect(() => { const i = setInterval(() => setTick(t => t + 1), 5000); return () => clearInterval(i); }, []);
  const isOnAir = useMemo(() => {
    if (!stories || !stories.length) return false;
    const approved = stories.filter(s => s.approved);
    if (!approved.length) return false;
    const newest = Math.max(...approved.map(s => s.ts));
    return (Date.now() - newest) < 60_000;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stories, tick]);
  if (!isOnAir) return null;
  return (
    <span className="onair-badge" aria-label="On air — new story in last minute">
      <span className="onair-dot pulse-dot" />
      <span className="onair-label">ON AIR</span>
    </span>
  );
}

// ─── 3. BreakingBanner ──────────────────────────────────────────────
export function BreakingBanner({ stories, onOpen }) {
  const [dismissed, setDismissed] = useState(new Set());
  const [shownAt, setShownAt] = useState({});
  const latest = useMemo(() => {
    if (!stories) return null;
    const now = Date.now();
    const conf = s => s?.confidence === "high" || s?.confidence === "moderate";
    const hit = stories
      .filter(s => s.approved && !s.aiSkipped && conf(s))
      .filter(s => Math.abs(s.aiScore || s.delta || 0) >= 3)
      .filter(s => now - s.ts < 90_000)
      .sort((a, b) => b.ts - a.ts)[0];
    return hit || null;
  }, [stories]);

  useEffect(() => {
    if (!latest) return;
    if (dismissed.has(latest.id)) return;
    if (!shownAt[latest.id]) setShownAt(p => ({ ...p, [latest.id]: Date.now() }));
    const t = setTimeout(() => setDismissed(p => new Set([...p, latest.id])), 20_000);
    return () => clearTimeout(t);
  }, [latest, dismissed, shownAt]);

  if (!latest || dismissed.has(latest.id)) return null;
  const score = latest.aiScore || latest.delta || 0;
  const isGood = score > 0;
  return (
    <div className={"breaking-banner" + (isGood ? " good" : "")} role="alert">
      <span className="breaking-tag">{isGood ? "BREAKING · SUPPORT" : "BREAKING"}</span>
      <span className="breaking-score">
        {isGood ? ICON.arrowUp : ICON.arrowDown}
        <strong>{isGood ? "+" : ""}{score}</strong>
      </span>
      <span className="breaking-headline" onClick={() => onOpen && onOpen(latest)}>
        {latest.headline}
      </span>
      <button
        className="breaking-close"
        onClick={() => setDismissed(p => new Set([...p, latest.id]))}
        aria-label="Dismiss breaking banner"
      >{ICON.x}</button>
    </div>
  );
}

// ─── 4. KineticTicker ───────────────────────────────────────────────
export function KineticText({ text, speed = 40 }) {
  const [revealed, setRevealed] = useState(0);
  const prefersReduced = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  useEffect(() => {
    if (prefersReduced) { setRevealed(text.length); return; }
    setRevealed(0);
    const t = setInterval(() => {
      setRevealed(r => {
        if (r >= text.length) { clearInterval(t); return text.length; }
        return r + 1;
      });
    }, speed);
    return () => clearInterval(t);
  }, [text, speed, prefersReduced]);
  return (
    <span className="kinetic-text">
      <span className="kinetic-revealed">{text.slice(0, revealed)}</span>
      {!prefersReduced && revealed < text.length && <span className="kinetic-cursor">|</span>}
    </span>
  );
}

export function KineticTicker({ stories, natScore, sColor }) {
  const approved = useMemo(
    () => (stories || []).filter(s => s.approved).sort((a, b) => b.ts - a.ts).slice(0, 8),
    [stories]
  );
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (approved.length <= 1) return;
    const headlineLen = approved[idx]?.headline?.length || 60;
    const ms = headlineLen * 40 + 3000;
    const t = setTimeout(() => setIdx(i => (i + 1) % approved.length), ms);
    return () => clearTimeout(t);
  }, [idx, approved]);

  const s = approved[idx];
  if (!s) {
    return (
      <div className="kinetic-ticker">
        <span className="kinetic-live-pill">LIVE</span>
        <span className="kinetic-empty">Fetching live constitutional intelligence…</span>
      </div>
    );
  }
  const score = s.aiScore || s.delta || 0;
  const color = score >= 0 ? "#0FD47C" : "#E24B4A";
  return (
    <div className="kinetic-ticker" aria-live="polite">
      <span className="kinetic-live-pill">LIVE</span>
      <span className="kinetic-score" style={{ color }}>
        {score >= 0 ? "+" : ""}{score}
      </span>
      <KineticText key={s.id} text={s.headline} />
    </div>
  );
}

// ─── 5. ScoreDisplay ────────────────────────────────────────────────
export function ScoreDisplay({ score, delta, label, sColor }) {
  const col = (sColor && sColor(score)) || "#BA7517";
  const d = typeof delta === "number" ? delta : 0;
  return (
    <div className="score-display">
      <div className="score-display-label">{label}</div>
      <div className="score-display-main">
        <span className="score-display-num" style={{ color: col }}>{score}</span>
        {d !== 0 && (
          <span className={"score-display-delta " + (d > 0 ? "up" : "down")}>
            {d > 0 ? ICON.arrowUp : ICON.arrowDown}
            {Math.abs(d).toFixed(1)}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── 6. ListenButton ────────────────────────────────────────────────
export function ListenButton({ text, compact = false }) {
  const [speaking, setSpeaking] = useState(false);
  const [voicesReady, setVoicesReady] = useState(false);
  const uttRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const check = () => { if (speechSynthesis.getVoices().length) setVoicesReady(true); };
    check();
    speechSynthesis.addEventListener("voiceschanged", check);
    return () => speechSynthesis.removeEventListener("voiceschanged", check);
  }, []);

  useEffect(() => () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try { speechSynthesis.cancel(); } catch {}
    }
  }, []);

  const speak = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (speaking) { try { speechSynthesis.cancel(); } catch {} setSpeaking(false); return; }
    if (!text) return;
    const voices = speechSynthesis.getVoices();
    const voice =
      voices.find(v => v.lang === "en-IN") ||
      voices.find(v => (v.lang || "").startsWith("en-GB")) ||
      voices.find(v => (v.lang || "").startsWith("en")) ||
      voices[0];
    const utt = new SpeechSynthesisUtterance(text);
    if (voice) utt.voice = voice;
    utt.rate = 0.95; utt.pitch = 1.0;
    utt.onend   = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    uttRef.current = utt;
    try { speechSynthesis.cancel(); } catch {}
    speechSynthesis.speak(utt);
    setSpeaking(true);
  }, [text, speaking]);

  if (typeof window !== "undefined" && !("speechSynthesis" in window)) return null;
  if (!text) return null;

  return (
    <span className={"listen-wrap" + (compact ? " compact" : "")}>
      <button
        type="button"
        onClick={speak}
        className={"listen-btn" + (speaking ? " speaking" : "")}
        aria-label={speaking ? "Stop audio" : "Listen to this story"}
        disabled={!voicesReady && !speaking}
      >
        {speaking ? ICON.stop : ICON.speaker}
        <span className="listen-label">{speaking ? "Stop" : "Listen"}</span>
        <span className="listen-ai-badge">AI VOICE</span>
      </button>
      {!compact && <span className="listen-disclaimer">Audio summary by AI</span>}
    </span>
  );
}

// ─── 7. AnimatedIllustration ────────────────────────────────────────
export function AnimatedIllustration({ type = "scales", size = 180 }) {
  const props = { width: size, height: size * 0.55, viewBox: "0 0 600 330", xmlns: "http://www.w3.org/2000/svg" };

  if (type === "scales") {
    return (
      <svg {...props} className="illust illust-scales" aria-hidden="true">
        <rect x="290" y="120" width="20" height="180" rx="3" fill="#0A0A0A"/>
        <rect x="230" y="298" width="140" height="10" rx="2" fill="#0A0A0A"/>
        <g className="beam">
          <rect x="150" y="78" width="300" height="4" rx="2" fill="#0A0A0A"/>
          <g className="pan-left">
            <circle cx="170" cy="80" r="2" fill="#0A0A0A"/>
            <line x1="170" y1="82" x2="170" y2="130" stroke="#0A0A0A" strokeWidth="1.5"/>
            <path d="M 130 130 L 210 130 L 200 160 L 140 160 Z" fill="#F5B93A" stroke="#0A0A0A" strokeWidth="2"/>
          </g>
          <g className="pan-right">
            <circle cx="430" cy="80" r="2" fill="#0A0A0A"/>
            <line x1="430" y1="82" x2="430" y2="130" stroke="#0A0A0A" strokeWidth="1.5"/>
            <path d="M 390 130 L 470 130 L 460 160 L 400 160 Z" fill="#FAFAF7" stroke="#0A0A0A" strokeWidth="2"/>
          </g>
        </g>
        <circle cx="300" cy="50" r="8" fill="#D42B1F"/>
      </svg>
    );
  }

  if (type === "ballot") {
    return (
      <svg {...props} className="illust illust-ballot" aria-hidden="true">
        <rect x="200" y="160" width="200" height="130" rx="6" fill="#0A0A0A"/>
        <rect x="260" y="145" width="80" height="8" rx="1" fill="#0A0A0A"/>
        <g className="paper">
          <rect x="265" y="60" width="70" height="90" rx="2" fill="#FAFAF7" stroke="#0A0A0A" strokeWidth="2"/>
          <line x1="275" y1="78" x2="325" y2="78" stroke="#0A0A0A" strokeWidth="1.5"/>
          <line x1="275" y1="92" x2="320" y2="92" stroke="#0A0A0A" strokeWidth="1.5"/>
          <path d="M 278 115 L 292 129 L 318 103" stroke="#F5B93A" strokeWidth="4" fill="none" strokeLinecap="round"/>
        </g>
        <rect x="210" y="270" width="180" height="4" fill="#F5B93A"/>
      </svg>
    );
  }

  if (type === "pulse") {
    return (
      <svg {...props} className="illust illust-pulse" aria-hidden="true">
        <circle cx="300" cy="165" r="60" fill="none" stroke="#D42B1F" strokeWidth="2" className="pulse-ring r1"/>
        <circle cx="300" cy="165" r="40" fill="none" stroke="#D42B1F" strokeWidth="2" className="pulse-ring r2"/>
        <circle cx="300" cy="165" r="12" fill="#D42B1F" className="pulse-dot"/>
      </svg>
    );
  }

  return <svg {...props} aria-hidden="true" />;
}

// ─── 8. PodcastHub ──────────────────────────────────────────────────
export function PodcastHub({ t }) {
  const [activeTopic, setActiveTopic] = useState("all");
  const [list, setList] = useState(PODCASTS);
  const filtered = useMemo(() => {
    if (activeTopic === "all") return list;
    return list.filter(p => p.topics.includes(activeTopic));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTopic, list]);

  const swapToFallback = useCallback((id) => {
    setList(prev => {
      const idx = prev.findIndex(p => p.id === id);
      if (idx < 0) return prev;
      const usedIds = new Set(prev.map(p => p.id));
      const fallback = PODCAST_FALLBACKS.find(fb => !usedIds.has(fb.id));
      if (!fallback) return prev.filter(p => p.id !== id);
      const copy = [...prev];
      copy[idx] = fallback;
      return copy;
    });
  }, []);

  const topicsInUse = useMemo(() => {
    const s = new Set();
    list.forEach(p => p.topics.forEach(t => s.add(t)));
    return TOPIC_ORDER.filter(tk => s.has(tk));
  }, [list]);

  return (
    <div className="podcast-hub">
      <header className="podcast-hub-head">
        <h1 className="podcast-hub-title">Podcasts</h1>
        <p className="podcast-hub-sub">
          Listen to the best of Indian civic and constitutional commentary — curated and embedded.
        </p>
      </header>

      <div className="podcast-topic-bar" role="tablist" aria-label="Filter podcasts by topic">
        <button
          role="tab"
          aria-selected={activeTopic === "all"}
          className={"podcast-topic-pill" + (activeTopic === "all" ? " active" : "")}
          onClick={() => setActiveTopic("all")}
        >All</button>
        {topicsInUse.map(tk => {
          const meta = TOPIC_META[tk];
          if (!meta) return null;
          const active = activeTopic === tk;
          return (
            <button
              key={tk}
              role="tab"
              aria-selected={active}
              className={"podcast-topic-pill" + (active ? " active" : "")}
              style={active ? { background: meta.color, borderColor: meta.color, color: "#fff" } : { borderColor: meta.color + "55", color: meta.color }}
              onClick={() => setActiveTopic(tk)}
            >
              {meta.label}
            </button>
          );
        })}
      </div>

      <div className="podcast-grid">
        {filtered.map(p => (
          <PodcastCard key={p.id} podcast={p} onEmbedError={() => swapToFallback(p.id)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="podcast-empty">No podcasts in this topic yet.</div>
      )}
    </div>
  );
}

function PodcastCard({ podcast }) {
  return (
    <a
      href={podcast.url}
      target="_blank"
      rel="noopener noreferrer"
      className="podcast-card"
      style={{
        display: 'block',
        padding: '28px',
        borderRadius: '14px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = podcast.color;
        e.currentTarget.style.boxShadow = `0 12px 32px ${podcast.color}22`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
        <h3 style={{ margin: 0, fontSize: '26px', fontWeight: 900, lineHeight: 1.15, fontFamily: 'var(--font-h)', color: 'var(--t1)' }}>
          {podcast.name}
        </h3>
        <span style={{ fontSize: '20px', color: podcast.color, transform: 'translateY(2px)' }}>↗</span>
      </div>
      <div style={{ fontSize: '13px', color: 'var(--t3)', marginBottom: '14px', fontWeight: 600 }}>
        {podcast.host}
      </div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
        {podcast.topics.map(t => (
          <span key={t} style={{
            fontSize: '10.5px',
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            padding: '3px 9px',
            borderRadius: '99px',
            background: `${podcast.color}15`,
            border: `1px solid ${podcast.color}35`,
            color: podcast.color,
          }}>{t}</span>
        ))}
      </div>
      <p style={{ fontSize: '15.5px', lineHeight: 1.55, color: 'var(--t2)', margin: '0 0 18px 0' }}>
        {podcast.description}
      </p>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 18px',
        borderRadius: '8px',
        background: podcast.color,
        color: '#fff',
        fontSize: '13.5px',
        fontWeight: 800,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}>
        <span>▶</span>
        <span>Listen on {podcast.platform}</span>
      </div>
    </a>
  );
}

// ─── Beep toggle hook — for Sprint B ────────────────────────────────
export function useSoundAlert(stories) {
  const [soundOn, setSoundOn] = useState(() => {
    try { return localStorage.getItem("dtn_sound") === "1"; } catch { return false; }
  });
  const lastBeepIdRef = useRef(null);
  const audioCtxRef = useRef(null);

  const toggle = useCallback(() => {
    setSoundOn(prev => {
      const next = !prev;
      try { localStorage.setItem("dtn_sound", next ? "1" : "0"); } catch {}
      if (next) {
        try {
          const AC = window.AudioContext || window.webkitAudioContext;
          if (AC && !audioCtxRef.current) audioCtxRef.current = new AC();
          if (audioCtxRef.current && audioCtxRef.current.state === "suspended") audioCtxRef.current.resume();
        } catch {}
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!soundOn) return;
    if (!stories || !stories.length) return;
    const approved = stories.filter(s => s.approved && !s.aiSkipped);
    if (!approved.length) return;
    const newest = approved.slice().sort((a, b) => b.ts - a.ts)[0];
    if (!newest) return;
    if (lastBeepIdRef.current === newest.id) return;
    lastBeepIdRef.current = newest.id;

    if (Date.now() - newest.ts > 20_000) return;
    const score = Math.abs(newest.aiScore || newest.delta || 0);
    if (score < 3) return;

    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!audioCtxRef.current) audioCtxRef.current = new AC();
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(880, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.25);
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
      o.connect(g); g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.32);
    } catch {}
  }, [soundOn, stories]);

  return { soundOn, toggleSound: toggle };
}

// ─── Viewing counter — synthetic but deterministic per session ──────
export function ViewingCounter() {
  const [count, setCount] = useState(() => 80 + Math.floor(Math.random() * 60));
  useEffect(() => {
    const t = setInterval(() => {
      setCount(c => {
        const step = Math.floor(Math.random() * 13) - 6;
        const next = Math.max(50, Math.min(500, c + step));
        return next;
      });
    }, 12_000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="viewing-counter">
      <span className="viewing-dot pulse-dot" />
      <span className="viewing-num">{count}</span>
      <span className="viewing-label">reading now</span>
    </span>
  );
}
