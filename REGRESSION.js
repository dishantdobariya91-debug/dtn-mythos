// DTN Mythos v12 — REGRESSION SUITE
// Run: node REGRESSION.js
// Target: 30/30 passing
//
// These 30 cases are v12's regression BASELINE (no prior REGRESSION.js existed
// in the shipped v11 upload). Future edits to classify() in src/App.jsx must
// re-run this suite and keep it at 30/30 before release.

const { classify } = require("./REGRESSION_classifier.cjs");

// ─── Test helpers ───────────────────────────────────────────────────
function check(actual, expected, path = "") {
  // Recursive shallow check: every key in `expected` must match `actual`.
  // Regexes in expected match against string actual.
  // `false` in expected accepts both `false` and `undefined` in actual
  // (since classify() only sets aiSkipped when a skip path fires).
  for (const k of Object.keys(expected)) {
    const want = expected[k];
    const got = actual[k];
    const here = path ? path + "." + k : k;
    if (want instanceof RegExp) {
      if (typeof got !== "string" || !want.test(got)) {
        return { ok: false, msg: `${here}: expected match /${want.source}/, got ${JSON.stringify(got)}` };
      }
    } else if (want && typeof want === "object" && !Array.isArray(want)) {
      const inner = check(got || {}, want, here);
      if (!inner.ok) return inner;
    } else if (want === false) {
      if (got !== false && got !== undefined) {
        return { ok: false, msg: `${here}: expected false/absent, got ${JSON.stringify(got)}` };
      }
    } else {
      if (got !== want) {
        return { ok: false, msg: `${here}: expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}` };
      }
    }
  }
  return { ok: true };
}

// ─── 30 test cases ──────────────────────────────────────────────────
const TESTS = [
  // ═════ v11 SKIP PATTERNS (12 cases) ══════════════════════════════

  // 1. FUTURE EVENT — nothing has happened yet
  {
    name: "future event — PM address announcement",
    headline: "PM Modi to address nation at 8:30pm on Republic Day",
    body: "The Prime Minister will deliver a special address.",
    expect: { aiSkipped: true, skipReason: /Future event/, institution: null },
  },
  // 2. Future-tense pattern B
  {
    name: "future event — cabinet will announce",
    headline: "Cabinet will announce new education policy tomorrow",
    body: "",
    expect: { aiSkipped: true, skipReason: /Future event/ },
  },
  // 3. FOREIGN ONLY — Trump story
  {
    name: "foreign only — Trump rally",
    headline: "Trump holds rally in Pennsylvania, attacks Biden",
    body: "The former US president addressed supporters in Pittsburgh.",
    expect: { aiSkipped: true, skipReason: /Foreign story/ },
  },
  // 4. PURE NOISE — sports
  {
    name: "pure noise — cricket score",
    headline: "IPL match: Mumbai Indians beat Chennai Super Kings by 7 wickets",
    body: "Rohit Sharma scored 82 runs off 54 balls.",
    expect: { aiSkipped: true, skipReason: /Sports|entertainment/ },
  },
  // 5. LISTICLE
  {
    name: "listicle — explainer filler",
    headline: "5 things to know about the Indian Constitution",
    body: "Here's what every citizen should know.",
    expect: { aiSkipped: true, skipReason: /Explainer|listicle/ },
  },
  // 6. ROUTINE OPERATIONAL
  {
    name: "routine procedural — internal probe",
    headline: "Indian Army orders court of inquiry into hard landing",
    body: "Routine internal probe initiated into aircraft incident.",
    expect: { aiSkipped: true, skipReason: /Routine procedural/ },
  },
  // 7. CAMPAIGN INSULT (no policy)
  {
    name: "campaign insult — pure rhetoric",
    headline: "Rahul Gandhi slams BJP in Raipur speech",
    body: "Congress leader made the remarks at a campaign event.",
    expect: { aiSkipped: true, skipReason: /Political rhetoric/ },
  },

  // ═════ v12-NEW SKIP PATTERNS (5 cases) ═══════════════════════════

  // 8. WEATHER — no accountability angle
  {
    name: "v12: weather forecast — skip",
    headline: "IMD predicts heavy rain across Maharashtra this weekend",
    body: "Monsoon to intensify over Mumbai and Pune in next 48 hours.",
    expect: { aiSkipped: true, skipReason: /Weather forecast/ },
  },
  // 9. WEATHER CARVE-OUT — deaths trigger full classification
  {
    name: "v12: weather + deaths — PASS (not skipped)",
    headline: "12 dead in Kerala flood as NDRF relief delayed, compensation denied",
    body: "State government response draws criticism; CAG audit ordered.",
    expect: { aiSkipped: false },
  },
  // 10. ANNOUNCEMENT — routine scheme launch
  {
    name: "v12: govt scheme launch — skip",
    headline: "CM inaugurates new highway bridge in Gujarat",
    body: "The Chief Minister flags off the project; lays foundation stone.",
    expect: { aiSkipped: true, skipReason: /government announcement/ },
  },
  // 11. SCIENCE DISCOVERY
  {
    name: "v12: science discovery — skip (fixes Finance false-tag)",
    headline: "New species of snake discovered in Aravalli by Delhi researchers",
    body: "Scientists identified a previously unknown reptile.",
    expect: { aiSkipped: true, skipReason: /Scientific discovery/, institution: null },
  },
  // 12. WATCH CLIP
  {
    name: "v12: watch clip — skip",
    headline: "Watch: Elephant crosses busy Indian highway",
    body: "Viral video shows the moment.",
    expect: { aiSkipped: true, skipReason: /video|clip/ },
  },
  // 13. GENERIC CRIME
  {
    name: "v12: generic crime (lone pickpocket) — skip",
    headline: "Mumbai pickpocket gang busted, 3 arrested in chain snatching case",
    body: "Police nab suspects in routine investigation.",
    expect: { aiSkipped: true, skipReason: /Generic crime/ },
  },
  // 14. CRIME CARVE-OUT — state-angle
  {
    name: "v12: custodial death — PASS (hasStateAngleCrime)",
    headline: "Dalit man dies in police custody in Bihar, caste atrocity alleged",
    body: "Family claims torture; NHRC notice issued.",
    expect: { aiSkipped: false, institution: "police" },
  },

  // ═════ CORE CLASSIFIER — POSITIVE PATH (8 cases) ═════════════════

  // 15. JOURNALIST KILLED — press freedom
  {
    name: "journalist killed — press_freedom negative",
    headline: "Indian journalist shot dead in Chhattisgarh over reporting",
    body: "Reporter was investigating illegal mining; local police booked FIR.",
    expect: {
      aiSkipped: false,
      pillar: "press_freedom",
      direction: "negative",
      institution: "media",
    },
  },
  // 16. JOURNALIST ARRESTED
  {
    name: "journalist arrested under UAPA",
    headline: "Journalist arrested under UAPA in Kashmir over news reports",
    body: "Reporter detained; raid conducted on news office.",
    expect: {
      aiSkipped: false,
      pillar: "press_freedom",
      direction: "negative",
    },
  },
  // 17. JOURNALIST FREED — positive
  {
    name: "journalist freed — positive",
    headline: "Supreme Court acquits journalist in sedition case, orders release",
    body: "SC bench ruled the charges did not meet Article 19(2) thresholds.",
    expect: {
      aiSkipped: false,
      pillar: "press_freedom",
      direction: "positive",
    },
  },
  // 18. CUSTODY DEATH — liberty pillar
  {
    name: "custody death — liberty",
    headline: "Man dies in police custody in Tamil Nadu, encounter alleged",
    body: "Custodial death under UAPA; family demands inquiry.",
    expect: {
      aiSkipped: false,
      pillar: "liberty",
      direction: "negative",
    },
  },
  // 19. DELIMITATION PASSED — federalism negative
  {
    name: "delimitation bill passed — negative federal",
    headline: "Parliament passes delimitation bill based on 2021 population",
    body: "Southern states object; Tamil Nadu CM calls it federal betrayal.",
    expect: {
      aiSkipped: false,
      pillar: "electoral",
      direction: "negative",
    },
  },
  // 20. DELIMITATION DEFEATED — positive
  {
    name: "delimitation defeated — positive federal",
    headline: "Opposition blocks delimitation bill in Rajya Sabha",
    body: "South Indian parties stall the redistribution bill.",
    expect: {
      aiSkipped: false,
      pillar: "electoral",
      direction: "positive",
    },
  },
  // 21. MINORITY VIOLENCE
  {
    name: "minority violence — Muslim family attacked",
    headline: "Muslim family home demolished by bulldozer in Haryana Nuh",
    body: "Demolition drive displaces 40 families; mosque burned.",
    expect: {
      aiSkipped: false,
    },
  },
  // 22. TRIBAL / ENVIRONMENT
  {
    name: "tribal displacement — environment pillar",
    headline: "Adivasi families displaced by forest clearance in Chhattisgarh",
    body: "Tribal displacement for mining project in Hasdeo forest.",
    expect: {
      aiSkipped: false,
      institution: "environment",
    },
  },

  // ═════ INSTITUTION DETECTION — tight patterns (4 cases) ═══════════

  // 23. FINANCE-FALLBACK FIX — "ED raid" should correctly match finance
  {
    name: "v12 fix: ED raid → finance",
    headline: "Enforcement Directorate raids opposition MP home in Mumbai",
    body: "ED probe into alleged money laundering; PMLA case filed.",
    expect: { aiSkipped: false, institution: "finance" },
  },
  // 24. FINANCE-FALLBACK FIX — "killed" in body should NOT trigger finance
  {
    name: "v12 fix: word ending in 'ed' no longer mis-tags as finance",
    headline: "Farmer killed in Punjab MGNREGA wage dispute",
    body: "The labourer was killed after confronting officials.",
    expect: { aiSkipped: false },
    // Specifically: institution must NOT be 'finance'. Checked after.
    notInstitution: "finance",
  },
  // 25. SUPREME COURT — judiciary
  {
    name: "Supreme Court verdict → judiciary",
    headline: "Supreme Court strikes down anti-conversion law in Madhya Pradesh",
    body: "The bench held the law violates Article 25.",
    expect: { aiSkipped: false, institution: "judiciary" },
  },
  // 26. ELECTION COMMISSION
  {
    name: "Election Commission → ec",
    headline: "Election Commission defers voter roll publication in West Bengal",
    body: "ECI cites operational issues; opposition cries foul.",
    expect: { aiSkipped: false, institution: "ec" },
  },

  // ═════ SCOPE + AMBIGUOUS CASES (4 cases) ══════════════════════════

  // 27. LOCAL SCOPE
  {
    name: "panchayat news → local scope",
    headline: "Gram panchayat in rural Maharashtra village passes resolution against CAA",
    body: "Village-level body declares opposition.",
    expect: { aiSkipped: false, scope: "local" },
  },
  // 28. STATE SCOPE
  {
    name: "state-level story → state scope",
    headline: "Kerala High Court stays new coastal regulation order",
    body: "State cabinet to review implications.",
    expect: { aiSkipped: false, scope: "state" },
  },
  // 29. AMBIGUOUS Indian politics (no clear institution) — key Finance-bug regression
  {
    name: "ambiguous Indian politics — institution should NOT default to Finance",
    headline: "Yogi Adityanath speech at UP rally raises concerns about free speech",
    body: "Opposition condemns CM's remarks as targeting minorities.",
    expect: { aiSkipped: false },
    notInstitution: "finance",
  },
  // 30. NOT-INDIA
  {
    name: "not-India story → skip",
    headline: "Silicon Valley startup raises $100M for AI chip development",
    body: "Palantir CEO Alex Karp meets Anthropic leadership.",
    expect: { aiSkipped: true },
  },
];

// ─── Runner ────────────────────────────────────────────────────────
let passed = 0, failed = 0;
const failures = [];

for (const test of TESTS) {
  const actual = classify(test.headline, test.body || "");
  const result = check(actual, test.expect);
  let ok = result.ok;
  let failMsg = result.msg;

  // Optional: "notInstitution" check (negative assertion)
  if (ok && test.notInstitution && actual.institution === test.notInstitution) {
    ok = false;
    failMsg = `institution: must NOT be ${JSON.stringify(test.notInstitution)}, got ${JSON.stringify(actual.institution)}`;
  }

  if (ok) {
    passed++;
    process.stdout.write(`\x1b[32mPASS\x1b[0m  ${test.name}\n`);
  } else {
    failed++;
    failures.push({ name: test.name, msg: failMsg, actual });
    process.stdout.write(`\x1b[31mFAIL\x1b[0m  ${test.name}\n        → ${failMsg}\n`);
  }
}

console.log("\n" + "═".repeat(60));
console.log(`RESULT: ${passed}/${TESTS.length} passed · ${failed} failed`);
console.log("═".repeat(60));

if (failed > 0) {
  console.log("\nFailure details:");
  failures.forEach(f => {
    console.log(`\n  ${f.name}`);
    console.log(`  ${f.msg}`);
    const summary = {
      aiSkipped: f.actual.aiSkipped,
      skipReason: f.actual.skipReason,
      institution: f.actual.institution,
      pillar: f.actual.pillar,
      direction: f.actual.direction,
      scope: f.actual.scope,
    };
    console.log(`  actual: ${JSON.stringify(summary)}`);
  });
  process.exit(1);
}

process.exit(0);
