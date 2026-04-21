# DTN Mythos v12.1 — Deployment Notes

**Release:** v12.1 · **Base:** v12 (shipped on dtn.today) · **Date:** 2026-04-21

## What's new vs v12

### Classifier hardening
- **New label vocabulary**: `CONCERN / SUPPORT / CRITICAL / UPDATE` → `support / potential_violation / neutral / uncertain`
  - Softer "potential_violation" instead of "CRITICAL" — respects due process before adjudication
  - Adds "uncertain" as a distinct state for low-confidence items
- **Numeric `confidence` field** (0.0–1.0 float) replacing categorical `high/moderate/low/developing`
  - `< 0.6` → `reviewNeeded: true` flag set on story
  - Calculated from evidence level + signal strength + vague-language detector
- **`\bruling\b` bug fix**: Bare regex false-matched "ruling party" headlines. Replaced with specific patterns.
- **Expanded pureNoise regex** — catches NFL (`49ers`, `nfl`), IPL players (`Parag`, `Rahane`, `Dhoni`, `Ashwin`, `Pandya`), and foreign leagues.

### Story audit trail
- **`history[]` array** on every story. Each state change appends `{ts, actor, fromLabel, toLabel}`. Capped at 50 entries. Seed = "created".

### Democracy Score
- **Uncertainty band** (± stdev) from last 10 score deltas. Displayed as muted `±X.X` next to national score.

### Review Queue
- **A / R / S keyboard shortcuts** (approve / reject / skip)
- Visible hint banner with `<kbd>` styling
- **Review Queue now in nav** — was unreachable in v12

### Daily Paper (new)
- **NewspaperView** — broadsheet layout: lead + 2x2 front + 3-col inside digest
- **Print-to-PDF**: browser-native `window.print()` with `@media print` CSS
- Zero new npm dependencies

### Notifications
- Fixed `icon-192.png` 404 storm. Swapped to inline SVG data-URI.

## Regression: 31/31 passing

Plus 7/7 live-site bug reproductions (NFL Bills/49ers, cricket commentary) correctly filtered.

## Build

```
vite v5.4.21 building for production...
✓ 833 modules transformed.
dist/index.html                  10.41 kB │ gzip:   3.13 kB
dist/assets/index-*.css          37.26 kB │ gzip:   8.22 kB
dist/assets/index-*.js          323.26 kB │ gzip: 105.16 kB
✓ built in 6.18s
```

## Deploy

```bash
git add src/ REGRESSION.js DEPLOY.md
git commit -m "v12.1: label rename, confidence, history, hotkeys, newspaper PDF"
git push origin main
```

## Post-deployment checklist

1. **Clear stored stories** to force reclassification — in DevTools Console:
   ```
   localStorage.removeItem('dtn_v10'); location.reload();
   ```
   OR open Review Queue → click `↻ Re-classify All`
2. **Verify NFL hero gone** after fresh fetch
3. **Visit Review** (now in top nav) — should show hotkey hint
4. **Visit Daily Paper** — click "📄 Download as PDF"
5. **Democracy Score** — uncertainty band appears after 3 score snapshots

## Known issue (not v12.1 regression)
- **Groq free-tier 429s**: AI enrichment rate-limited under load. Workaround: bump Auto-Fetch timer or upgrade Groq tier.

## Rollback
`git revert HEAD && git push` — stories backward-compatible, `label` falls back via `inferLabelFromDelta()`.
