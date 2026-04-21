# DTN Mythos v12 — Release Notes

**Tagline:** Broadcast visual redesign + live-feel enhancements + podcast hub
+ kinetic typography + SpeechSynthesis + animated SVG illustrations
+ v11 classifier filters + Finance-fallback bug fix.

**Regression status:** 30/30 passing against `REGRESSION.js`.

---

## 1 · What changed (high-level)

### Sprint A — Broadcast visual redesign
- New `<BroadcastMasthead>` replaces the v11 amber-top-strip + black masthead.
  Playfair Display 900 wordmark (56px desktop / 34px mobile), amber 5px
  top rule, integrated `<OnAirBadge>` that pulses when the newest approved
  story arrived within 60 seconds.
- All existing masthead actions (language picker, sign-in, alerts, Fetch
  button) are passed through as children — no prop re-plumbing required.
- Mobile swipe cards via CSS `scroll-snap-type: x mandatory`
  (`.story-carousel` class; active only at `max-width: 640px`).

### Sprint B — Live-feel enhancements
- `<BreakingBanner>` slides in when a story's `|aiScore| ≥ 3`,
  confidence is `high` or `moderate`, and it arrived within 90 seconds.
  Auto-dismisses after 20 seconds. User can dismiss manually.
- `<ViewingCounter>` — synthetic "N people reading now" ambient counter
  in the masthead. Starts 80–140, wanders ±6 every 12 seconds.
- Beep toggle via `useSoundAlert(stories)` hook. User must enable first
  (autoplay policy); once enabled, it primes an `AudioContext` on the
  user gesture and plays a short 880→440Hz sine beep when a new story
  with `|score| ≥ 3` arrives within 20 seconds of fetch.

### Sprint C — Podcast hub
- New `<PodcastHub>` page at `/podcasts` (added to nav between "My Rights"
  and "Democracy Score").
- 6 curated Indian podcasts in `src/podcasts.js`:
  1. Grand Tamasha (Carnegie · Milan Vaishnav)
  2. The Seen and the Unseen (Amit Varma)
  3. Puliyabaazi (Kotasthane & Chandra)
  4. All Indians Matter (Ashraf Engineer)
  5. The Suno India Show
  6. The India Dialog (YouTube playlist)
- Topic filter pills across the top (15 topics, colour-coded).
- Spotify shows use `open.spotify.com/embed/show/{id}`. The India Dialog
  uses `youtube-nocookie.com/embed/videoseries?list=...`.
- Auto-fallback to Livemint "Nobody's Listening" or Wire "Urdunama" if
  an iframe errors (via `onError` handler → `swapToFallback`).

### Kinetic typography ticker
- `<KineticTicker>` replaces the v11 `.ticker-bar`. Headlines reveal
  letter-by-letter at 40ms/char, hold 3 seconds, cycle to next.
- Fully gated by `prefers-reduced-motion` — reduced-motion users see
  static text with no cursor.

### SpeechSynthesis "Listen" button
- `<ListenButton>` on the hero story card. Picks `en-IN` voice first,
  falls back to `en-GB` → any `en-*` → any voice.
- Handles Chrome's async voice-load quirk via `voiceschanged` listener.
- Cancels playback on component unmount (so nav-away stops audio).
- Hidden entirely if `speechSynthesis` is unsupported.
- Mandatory disclaimer: "Audio summary by AI" next to the button.

### Animated SVG illustrations
- Three illustration types shipped: `scales` (slow tilt, pans sway
  opposite), `ballot` (ballot paper drops in), `pulse` (expanding rings).
- `<AnimatedIllustration type="..." size={180}/>` component available for
  any page; not yet placed by default. Import and drop wherever relevant.
- All animations gated by `prefers-reduced-motion` in `index.css`.

### v11 classifier patterns (5 new skip rules)
1. **Weather forecasts** without accountability angle → skip.
   Carve-out: deaths, NDRF failures, relief denial → full classification.
2. **Government announcements** (scheme launches, ribbon-cuttings) →
   skip. Carve-out: CAA / NRC / surveillance / privacy implications → pass.
3. **Scientific discoveries** (new species, astronomy, research
   publications) → skip. Kills the "new snake species → Finance"
   false-tag from v11.
4. **Watch: / Viral: / Video: / Clip:** headlines → skip.
5. **Generic crime** (pickpocket, robbery, road rage, lone dowry) →
   skip. Carve-out `hasStateAngleCrime`: custody death, encounter,
   bulldozing, mob lynching, caste atrocity, communal violence → pass.

### Finance-fallback bug fix
- v11's institution detector had `/ed /` (space-padded) which matched
  any word ending in `-ed `: killED, raideD, moveD. This caused stories
  about journalists killed or activists jailed to be mis-tagged as the
  **Finance** department.
- v12 tightens this to require ED-in-agency-context:
  `enforcement directorate | ed raid | ed arrest | ed probe | ed summon |
  ed attach | ed chargesheet | ed officer | ed action | ed case | pmla case`.
- The "government" fallback was also tightened with word-boundary
  anchors (`\bcm |chief minister|governor of`) to avoid accidental
  matches on other words.

### Institution-null UI guard
- `classify()` returns `institution: null` for any skipped story.
- `<StoryCardBB>` (both hero and compact variants) now hides the
  department pill entirely when `institution == null` instead of
  falling back to storyType-name or "General". Zero false dept
  labels on filtered stories.

### Media-before-police reorder
- Journalist-killed stories were filing as "Police" department because
  the `/police|arrested|detained/` regex matched first in the
  institution chain. v12 reorders so `/journalist|reporter|media|press|
  editor|news channel/` is checked first. Journalist-shot-by-police
  stories now correctly file as Media department.

---

## 2 · Files changed / added

| File                                       | Change                                   |
| ------------------------------------------ | ---------------------------------------- |
| `src/App.jsx`                              | classifier patches, chrome rebuild, ListenButton on hero, dept-pill guards |
| `src/components/BroadcastUI.jsx`           | **NEW** — 9 components + 2 hooks         |
| `src/podcasts.js`                          | **NEW** — 6 podcasts + 2 fallbacks + 15 topics |
| `src/index.css`                            | +510 lines (broadcast, kinetic, podcast, mobile swipe, animations) |
| `src/main.jsx`                             | unchanged                                |
| `index.html`                               | Playfair Display + Inter Google Fonts preloaded |
| `vercel.json`                              | expanded with CSP (frame-src for embeds) + Referrer-Policy + X-Content-Type-Options |
| `REGRESSION.js`                            | **NEW** — 30 test cases                  |
| `REGRESSION_classifier.cjs`                | **AUTO-GEN** — do not edit               |
| `scripts/extract-classifier.sh`            | **NEW** — re-extracts classifier after edits |
| `DEPLOY.md`                                | this file                                |

**Bundle impact:** v11 ≈ 338 KB → v12 ≈ 412 KB. Within Vercel free tier.

---

## 3 · Deploy

```bash
# From project root:
npm install
npm run build
npx vercel --prod
```

The CSP in `vercel.json` is applied at response time. No build-step
config changes needed.

**Environment variables (unchanged from v11):**
- `VITE_GROQ_KEY` — Groq API key for AI enrichment (optional).

---

## 4 · Running the regression suite

```bash
# One command — re-extracts classifier + runs 30 cases:
bash scripts/extract-classifier.sh && node REGRESSION.js
```

After **every edit** to `classify()` in `src/App.jsx`, re-run this.
Target: **30/30 must pass** before release.

Adding a new test case: append to the `TESTS` array in `REGRESSION.js`.
The `expect` object accepts exact values, nested objects, regexes, and
treats `false` as "false or undefined" (since `classify()` only sets
`aiSkipped` when a skip path fires).

---

## 5 · Podcast embed verification (production-only check)

The 6 Spotify show IDs and 1 YouTube playlist ID in `src/podcasts.js`
were taken from the v12 spec as-is — I did not hit Spotify / YouTube
live from the build environment. After deploy, open each card's
"Play latest" toggle and confirm the iframe loads. If any breaks,
the `onEmbedError` handler auto-swaps to one of the two fallbacks:
- **Nobody's Listening** (Livemint)
- **Urdunama** (The Wire)

If a podcast's URL regresses permanently, edit `src/podcasts.js`
directly — it's a single array, no database.

---

## 6 · Known issues carried forward from v11

### Latent: `hasPolicy` matches "ruling party"

The v11 `hasPolicy` regex used to gate the campaign-insult filter
includes `\bruling\b` (meant for "court ruling"). This accidentally
matches the common phrase "ruling party", meaning pure political
rhetoric that mentions "the ruling party" slips past the
campaign-insult skip.

Not patched in v12 to honour the spec's "paste v11 patterns verbatim"
directive. Worth patching in v12.1 — suggested fix:
replace `\bruling\b` with `\bcourt ruling\b|\bsc ruling\b|\bhc ruling\b`.

Discovered during regression authoring (test case 7 had "ruling
party" in the body and was not being skipped as expected).

### Latent: institution defaults to `null` cleanly now, but…

Stories that pass filters but match no institution regex now return
`institution: null`. The UI correctly hides the dept pill. The
`calcDept()` aggregation function correctly ignores null stories.
But one downstream effect: the Departments page will show fewer
stories per department because edge-case stories no longer get
weakly-assigned to Home or Finance. This is the intended behaviour
but may surprise long-time v11 users who expect every story to
appear under some department.

---

## 7 · Regression suite composition (for audit)

| # | Category | Test |
|---|---|---|
| 1–7  | v11 skip patterns (existing) | future event, foreign only, sports noise, listicle, routine procedural, campaign insult, not-India |
| 8–14 | v12 NEW skip patterns | weather (skip + carve-out), announcement, science discovery, watch clip, generic crime (skip + carve-out) |
| 15–22 | Core classifier — positive path | journalist killed/arrested/freed, custody death, delimitation pass/defeat, minority violence, tribal displacement |
| 23–26 | Institution detection tight patterns | ED raid → finance, word-ending-in-ed NOT finance (bug fix), SC → judiciary, EC → ec |
| 27–30 | Scope + ambiguous | panchayat → local, state story → state, ambiguous politics NOT finance (bug fix), not-India skip |

---

## 8 · Upgrade path from v11

1. Back up your current `src/` directory.
2. Drop these files in place:
   - `src/App.jsx`
   - `src/components/BroadcastUI.jsx` (new file)
   - `src/podcasts.js` (new file)
   - `src/index.css`
   - `index.html`
   - `vercel.json`
3. Run `npm install` (no new dependencies — all new UI is inline SVG
   + native React + native SpeechSynthesis + `open.spotify.com`
   iframe embeds).
4. Run `bash scripts/extract-classifier.sh && node REGRESSION.js`
   — confirm **30/30** before deploying.
5. Deploy via `npx vercel --prod` or push to the Git branch Vercel
   watches.
6. Post-deploy, open `/podcasts` and verify all 6 embeds load.

---

## 9 · v12.1 / v13 backlog

- Fix `hasPolicy` `\bruling\b` false-positive (see §6).
- Place `<AnimatedIllustration>` instances on empty states (Dashboard
  empty, Methodology page hero, PodcastHub empty state).
- Add "i18n" keys for v12 UI strings: `podcasts`, `listen`,
  `audio_summary_by_ai`, `sound_on`, `sound_off`. Currently the
  English fallback is shown in all languages.
- Respect `speechSynthesis.getVoices()` for Hindi/Gujarati/Tamil when
  a matching voice is available — currently always falls back to English.
- Add classifier skip rules for: routine diplomacy visits, routine
  sports-governance stories (BCCI elections), awards/honours lists.
