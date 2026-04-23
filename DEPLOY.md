# DTN Mythos v12.3 — Deployment Notes

**Release:** v12.3 · **Base:** v12.2 (live on dtn.today) · **Date:** 2026-04-23

## What's new vs v12.2

### AI provider fallback — Groq → Gemini
When Groq returns 429 (free-tier rate limit), the request now automatically retries via Google Gemini 2.0 Flash. Zero-downtime AI enrichment.

- **Primary:** Groq / Llama 3.3 70B (fastest when available, ~800ms)
- **Fallback:** Google Gemini 2.0 Flash (1,500 req/day free tier, JSON mode built-in)
- **Separate rate-limit tracking per provider** — if Groq 429s, we don't also block Gemini
- **Console tells you which served each story:** `[ai] ✓ Groq` or `[ai] ✓ Gemini`
- **Same JSON schema, same prompt** — no quality degradation on fallback

### Required — add Gemini API key to Vercel

Add this to your Vercel env variables (Dashboard → your project → Settings → Environment Variables):
- Key: `VITE_GEMINI_KEY`
- Value: `<your Gemini API key>` (the one you generated at https://aistudio.google.com/apikey)

Without this key, Gemini fallback silently does nothing and you behave like v12.2 (Groq-only). App still works, just no fallback.

### Newspaper — always 5-6 A4 pages

**Bigger typography** (real newspaper feel):
- Masthead: 82px → 110px
- Lead headline: 44px → 60px
- Body text: 17px → 18.5px, leading 1.7
- Drop cap: 64px → 88px
- Section headers: 28px → 38px

**7 new sections ensure the paper always fills 5-6 A4 pages, even on slow news days:**

1. **Editorial** (auto-generated) — opens page 2 with a daily editorial generated from that day's metrics. Four templates: slow news, violation-heavy, support-heavy, balanced.
2. **Court Watch** — pending/stayed/upheld/struck-down judicial matters with status badges.
3. **Rights Corner** — rotating citizen how-to feature + black panel of 6 emergency helplines (NALSA 15100, NHRC 14433, Women 1091, Child 1098, SC/ST Commission, Minority Commission).
4. **States & Districts** — existing but now always-rendered (with "no events today" placeholder).
5. **States Roundup** — aggregate democracy snapshot for all 28 states + 8 UTs. One-line per state, tiered (high/mid/low) based on story impact.
6. **International (India Angle)** — foreign coverage the classifier marked India-relevant (e.g. Iran impact on Indian oil, Pakistan developments).
7. **Constitution Primer** — rotates through 10 key articles (14, 15, 19, 21, 21A, 25, 32, 50, 226, 368). Shows text + expert explanation. Different article each day.
8. **On This Day in Indian Constitutional History** — rotates through 10 landmark events (Kesavananda Bharati, Emergency, Puttaswamy privacy, Section 377, Electoral Bonds, etc.). Black-background callout.

Evergreen sections use `dayOfYear` for deterministic rotation — same content for all readers on same day, fresh next day.

### Print behavior
- Dedicated print-scaled font sizes (smaller than screen, bigger than before)
- `@page` size A4 with 12mm margins
- `page-break-before: always` on: Editorial, Court Watch, States, International/Inside, The Score
- Dark sections (Rights helplines, History callout) forced to print their backgrounds
- Avoid-break rules on individual stories/articles so they don't split mid-paragraph

## Regression: 31/31 still passing

No classifier changes. All existing tests pass.

## Build

```
vite v5.4.21 building for production...
✓ 834 modules transformed.
dist/index.html                  10.41 kB │ gzip:   3.13 kB
dist/assets/index-*.css          59.54 kB │ gzip:  11.52 kB
dist/assets/index-*.js          344.63 kB │ gzip: 111.58 kB
✓ built in 6.30s
```

CSS +15 KB (new section styles), JS +9 KB (evergreen content + editorial generator + state list). Clean.

## Files changed vs v12.2

| File | Change |
|---|---|
| `src/App.jsx` | Dual-provider AI (Groq → Gemini fallback), separate rate-limit tracking, `callAI()` helper, `extractJson()` utility |
| `src/components/NewspaperView.jsx` | Full rewrite — 8 sections vs 5, evergreen content system, auto-editorial, states roundup |
| `src/index.css` | +460 lines — bigger typography overrides, new section styles, print page-break rules |

## Deploy steps

1. **Add the Gemini key to Vercel env vars** (see above — important!)
2. **Extract the zip, copy into repo:**
   ```powershell
   cd "C:\Users\NEUROPAUSE LAB\downloads\dtn-clean"
   $src = "$env:USERPROFILE\Downloads\dtn-mythos-v12_3"
   Copy-Item "$src\src\App.jsx" -Destination ".\src\App.jsx" -Force
   Copy-Item "$src\src\index.css" -Destination ".\src\index.css" -Force
   Copy-Item "$src\src\components\NewspaperView.jsx" -Destination ".\src\components\NewspaperView.jsx" -Force
   Copy-Item "$src\REGRESSION.js" -Destination ".\REGRESSION.js" -Force
   Copy-Item "$src\DEPLOY.md" -Destination ".\DEPLOY.md" -Force
   ```
3. **Commit + push:**
   ```powershell
   git add src/ REGRESSION.js DEPLOY.md
   git commit -m "v12.3: Gemini fallback, bigger typography, 5-6 page newspaper"
   git push origin main
   ```

## Post-deployment checklist

1. **Verify Gemini key is set**: Vercel dashboard → Project → Settings → Environment Variables → should show `VITE_GEMINI_KEY`
2. **Hard-refresh dtn.today** after Vercel deploys (~60s)
3. **Open Daily Paper** — should now show all 8 sections regardless of story count. Header reads "X stories · 6 A4 pages"
4. **Download as PDF** — should produce 5-6 A4 pages with section breaks between pages
5. **Click Fetch** — browser console should show `[ai] ✓ Groq` or `[ai] ✓ Gemini` for each enriched story
6. **If Groq hits 429**: console shows `[ai] Groq 429 — falling back to Gemini` and the next line reads `[ai] ✓ Gemini` — no more broken stories

## Rollback

`git revert HEAD && git push`

Stories backward-compatible. Removing the Gemini key will just disable fallback, app continues working with Groq-only.
