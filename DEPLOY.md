# DTN Mythos v12.2 — Deployment Notes

**Release:** v12.2 · **Base:** v12.1 (live on dtn.today) · **Date:** 2026-04-21

## What's new vs v12.1

### Daily Paper — full broadsheet (5-6 A4 pages)
- **Fixed empty-grid bug**: `.approved` filter was too strict in v12.1 — only lead story rendered because other stories weren't manually approved yet. Now uses `!aiSkipped && !rejected` (includes all classifier-accepted stories).
- **Expanded from 1 section → 6 sections**, filling 5-6 A4 pages when printed:
  1. **Page 1** — Masthead + Lead story (full-width, drop-cap, two-column body) + Front-page grid (4 stories)
  2. **Page 2** — Policy & Law section (up to 6 stories in 2-column grid)
  3. **Page 3-4** — States & Districts section (up to 8 stories in 4-column compact grid, region headers)
  4. **Page 5** — Inside Today digest (up to 18 brief items in 3-column grid)
  5. **Page 6** — The Score (Op-ed + stats panel with Supports/Violations/Court-Active/Under Review counts + methodology note)
- **CSS `@page` break hints** at every section boundary → natural page flow when saved as PDF
- **Header stats**: "X stories · est. Y A4 pages" shown above the paper

### Suggest a Story (new feature)
- **New `Suggest` nav tab** between Daily Paper and Review
- User types a topic keyword (e.g. "custody death Tamil Nadu")
- System searches Google News India via `/api/rss?scope=search&q=...`
- Top 5 matching articles shown with source, date, snippet
- **"+ Add to Review Queue"** button routes the chosen story through `classify()` and into the Review Queue — **never auto-published**
- 6 example-query chips to help users formulate searches
- Clear disclaimer explaining the human-approval gate

### Review Queue — User-Suggested section
- **Purple "User-Suggested" section** appears first in Review Queue (above Pending)
- Each user-suggested story shows the original search query that surfaced it
- De-duplicated from Pending/Filtered/Manually-Held so it never appears twice

### API update (optional)
- **`/api/rss` now accepts `?scope=search&q=<keyword>`**
- If your current live `/api/rss.js` doesn't know about `scope=search`, the Suggest page auto-falls back to public CORS proxies — it'll work, just slightly slower
- Included `api/rss.js` in this zip — either drop it in or add the `scope === "search"` branch to your existing file

## Regression: 31/31 still passing

No changes to classifier — all v12.1 regression tests still pass.

## Build

```
vite v5.4.21 building for production...
✓ 834 modules transformed.
dist/index.html                  10.41 kB │ gzip:   3.13 kB
dist/assets/index-*.css          44.46 kB │ gzip:   9.36 kB
dist/assets/index-*.js          335.17 kB │ gzip: 108.60 kB
✓ built in 6.89s
```

Clean build. 1 new module (SuggestPage), CSS +7 KB, JS +12 KB.

## Files changed vs v12.1

| File | Change |
|---|---|
| `src/App.jsx` | SuggestPage import · Suggest nav item · suggest route · Review Queue Suggested section with de-dup |
| `src/components/NewspaperView.jsx` | Full rewrite — 6 sections, page breaks, fixed filter |
| `src/components/SuggestPage.jsx` | **NEW** — 260 lines, user search + review-queue routing |
| `src/index.css` | Appended ~600 lines (newspaper sections + print breaks + Suggest styles) |
| `api/rss.js` | **NEW/UPDATED** — adds `scope=search` branch |

## Deploy

```bash
git add src/ api/ REGRESSION.js DEPLOY.md
git commit -m "v12.2: full newspaper 5-6 A4 pages, Suggest page with human approval gate"
git push origin main
```

## Post-deployment checklist

1. **Open Daily Paper** — should now show all 5 sections with real stories (Lead + Front grid + Policy + States + Inside + Score)
2. **Click "📄 Download as PDF"** → verify it produces ~5-6 A4 pages with clean section breaks
3. **Open Suggest** → type "custody death Tamil Nadu" → see 3-5 real news results → click "Add to Review Queue"
4. **Open Review** → see the purple "User-Suggested" section with the story → press `A` to approve → story moves to newsroom and Daily Paper

## Known issue (not v12.2)
- **Groq free-tier 429s**: AI enrichment rate-limited under load. Not a v12.2 regression.
- **Legacy CONCERN labels on cached stories**: Re-classify via Review Queue `↻ Re-classify All` button, or clear `dtn_v10` localStorage key.

## Safety rationale — why human-approval gate

User-suggested stories pass through Review Queue before publishing. This prevents:
- **Misinformation**: user submits "Modi resigns," satirical article gets auto-published
- **Defamation**: user targets a real person, article auto-scored "potential_violation" with that name
- **Spam**: anonymous visitors can't fill the homepage with propaganda
- **Liability**: DTN Mythos presents itself as a "constitutional intelligence platform" — auto-published unvetted content would dilute that credibility

A/R/S hotkeys make approval fast — press `A` once and the suggested story is live in the newsroom and tonight's paper.

## Rollback
`git revert HEAD && git push` — stories backward-compatible.
