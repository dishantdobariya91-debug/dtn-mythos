// DTN Mythos v12.1 — Regression test suite
// Run with: node REGRESSION_v12_1.js
// Expected: "23 / 23 skip classifications correct" AND "8 / 8 label-confidence tests passed"

// ─── LOAD THE NEW CLASSIFIER ──────────────────────────────────────────
// Inline copy of classify() from classify_v12_1.js for self-contained testing.
// Keep this block in sync whenever classify() changes.

function classify(h,b){
  const txt=((h||"")+" "+(b||"")).toLowerCase();
  let pillar="justice",dir="neutral",delta=0,violations=[],supports=[],pat="isolated",scope="national",inst=null;
  let evidenceLevel="single_source",storyType="policy",confidence=0.5,courtStatus="none",govResponse=null,citizenExplanation=null;
  let label="neutral";

  const h_lower=(h||"").toLowerCase();
  const futureEvent=
    /^(?:[\w.']+\s){0,9}\w+\s+to\s+(?:address|speak|announce|meet|deliver|attend|launch|unveil|table|present|move|file|hear|decide|rule|deliberate|inaugurate|release|visit)\b/i.test(h||"")||
    /^(?:[\w.']+\s){0,9}\w+\s+will\s+(?:address|speak|announce|meet|deliver|attend|launch|unveil|table|present|move|file|hear|decide|rule|deliberate|inaugurate|release|visit)\b/i.test(h||"")||
    /\b(?:set to|expected to|likely to|scheduled to)\s+(?:address|speak|announce|deliver|attend|launch|unveil|table|present|file|inaugurate)\b/i.test(h_lower)||
    /\b(?:tomorrow|later today|next week|next monday|next tuesday|next wednesday|next thursday|next friday|next saturday|next sunday)\s*[:,-]?\s*(?:pm|am)?\s*(?:modi|cabinet|parliament|sc|supreme court|president|governor)\b/i.test(h_lower)||
    /\b(?:to (?:address|speak|deliver))\b[^.]*\bat \d+[:.]?\d*\s*(?:pm|am|hrs)\b/i.test(h_lower);

  const foreignOnly=/\bbank of canada\b|\bfederal reserve\b|\beuropean central bank\b|\btrump\b|\bbiden\b|\bobama\b|\bputin\b|\bxi jinping\b|\bkim jong\b|\bmacron\b|\bscholz\b|\bnetanyahu\b|\bzelensky\b|\bbritish parliament\b|\bus congress\b|\bwhite house\b|\beuropean union\b|\bsilicon valley\b|\bwall street\b|\bdowning street\b|\bsan francisco\b|\bnew york times\b|\bwashington post\b|\bhollywood\b|\b(?:louisiana|texas|california|florida|alabama|alaska|arizona|arkansas|colorado|connecticut|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|ohio|oklahoma|oregon|pennsylvania|tennessee|utah|vermont|virginia|wisconsin|wyoming)\s*(?:,|shooting|state|governor|senator)\b|\bpalantir\b|\balex karp\b|\belon musk\b|\bmark zuckerberg\b|\bmeta platforms\b|\bgoogle llc\b|\bamazon\.com\b|\bapple inc\b|\bmicrosoft corp\b|\bopenai\b|\banthropic\b|\bnvidia\b|\bintel corp\b|\bharvard\b|\bstanford\b|\bmit \b|\byale\b|\bprinceton\b|\bcambridge university\b|\boxford university\b|\bmass shooting.*(?:us|united states|america)|\bukraine war\b|\brussia.ukraine\b|\bgaza\b|\bisrael.hamas\b|\bsyria war\b|\byemen war\b|\btaliban\b|\bafghanistan taliban\b|\bimran khan\b|\bshehbaz sharif\b|\bimf loan to\b|\bworld bank report\b|\bun human rights report on (?!india)\b|\bnato\b|\bg7 summit\b|\bg20.*(?!india)\b/i;

  const pureNoise=/\b(?:cricket score|football score|ipl match|fifa|olympic|box office|bollywood|hollywood|ott release|trailer|film review|web series|album release|concert|fashion show|iphone|samsung|product launch|startup raises|company earnings|stock price|sensex|nifty|cryptocurrency|bitcoin|horoscope|recipe|weight loss|skincare|beauty tip)\b/i;

  const campaignInsult=/\btargets? congress\b|\btargets? bjp\b|\bslams? congress\b|\bslams? bjp\b|\battacks? congress\b|\battacks? bjp\b|\bmocks\b|\btaunts\b|\bjibe at\b|\bdare(?:s|d)? (?:the )?(?:bjp|congress|opposition)\b|\bteach.*lesson\b|\bhave guts\b/i;

  // v12.1 fix: specific court-ruling patterns only
  const hasPolicy=/\bbill\b|\bact passed\b|\blaw\b|\bpolicy\b|\border issued\b|\bverdict\b|\bcourt ruling\b|\bsc ruling\b|\bhc ruling\b|\bbench ruling\b|\bruling of (?:the )?(?:court|bench|judge|justice)\b|\banti.conversion\b|\buapa\b|\bafspa\b|\bnrc\b|\bcaa\b|\bdemolition\b|\bencounter\b|\bcustody\b|\barrest\b|\bdetain\b|\braid(?:s|ed|ing)?\b|\binquiry\b|\bsummon(?:s|ed)?\b|\bfir \b|\bchargesheet\b|\bconviction\b/i;
  const isJustInsult=campaignInsult.test(txt)&&!hasPolicy.test(txt);

  const routineOp=/court of inquiry (?:ordered|initiated|launched)|hard landing|internal probe|routine audit|administrative transfer|officer suspended pending inquiry|show.cause notice issued/i;
  const hasConstitutionalAngle=/\b(?:custody death|encounter|fake|lynch|demolish|bulldoz|arbitrary arrest|sedition|uapa|afspa|rights violat)/i;
  const isRoutine=routineOp.test(txt)&&!hasConstitutionalAngle.test(txt);

  const listicle=/^\d+ (?:types? of|things|reasons?|ways?|tips?|facts?|benefits?)\b|^(?:a |the )?(?:detailed |complete |comprehensive |ultimate )?guide to\b|\ball you need to know\b|\beverything you should know\b|\bexplained?:?\s*(?:what|how|why|who)\b|\bwhat is\b|\bhow does\b|\btop \d+\b|\blist of\b.*\b(?:types|kinds|varieties)\b|\bdifference between\b|\bvs\.?\s+[A-Z]/i;
  const isListicle=listicle.test(h||"");

  const indiaAnchor=/\b(?:india|indian|delhi|new delhi|mumbai|bengaluru|bangalore|chennai|kolkata|hyderabad|ahmedabad|pune|lucknow|jaipur|bhopal|patna|chandigarh|guwahati|thiruvananthapuram|ranchi|raipur|dehradun|shimla|gandhinagar|kerala|tamil nadu|karnataka|maharashtra|gujarat|rajasthan|uttar pradesh|\bup\b|bihar|odisha|west bengal|punjab|haryana|telangana|andhra|assam|tripura|meghalaya|mizoram|manipur|nagaland|arunachal|sikkim|goa|jharkhand|chhattisgarh|himachal|uttarakhand|madhya pradesh|j&k|jammu|kashmir|ladakh|modi|rahul|gandhi|sonia|kharge|yogi|mamata|stalin|kejriwal|shah|sitharaman|jaishankar|naidu|nitish|siddaramaiah|fadnavis|adityanath|bjp|congress|\baap\b|tmc|dmk|aiadmk|shiv sena|ncp|rjd|jdu|cpi|cpm|lok sabha|rajya sabha|supreme court|high court|\bsc \b|\bhc \b|chief justice|cji|eci|election commission|rbi|sebi|cag|niti aayog|nhrc|nalsa|iaf|indian army|indian navy|coast guard|prime minister|cabinet|union minister|home minister|finance minister|law minister|external affairs|president of india|droupadi murmu|rashtrapati bhavan|raj bhavan|parliament|constitution|president ram|ambedkar|nehru|patel)\b/i;
  const isNotIndia=!indiaAnchor.test(txt);

  let skipReason=null;
  if(futureEvent)skipReason="Future event";
  else if(foreignOnly.test(txt))skipReason="Foreign-only";
  else if(pureNoise.test(txt))skipReason="Pure noise";
  else if(isJustInsult)skipReason="Campaign insult";
  else if(isRoutine)skipReason="Routine op";
  else if(isListicle)skipReason="Listicle";
  else if(isNotIndia)skipReason="Not India";

  if(skipReason){
    return{aiSkipped:true,skipReason,label:"uncertain",confidence:0.3,reviewNeeded:true};
  }

  // Label computation (positive/negative signals)
  const supportSignals=/\b(?:bail granted|quashed|stayed|upheld rights|acquitted|released|compensation ordered|reinstated|struck down unconstitutional|directed the government|rapped the (?:government|state)|right.upheld|grievance addressed|transparency order|court monitored|commission formed to probe)\b/i;
  const violationSignals=/\b(?:custody death|custodial death|fake encounter|lynch|mob lynch|cow vigilant|bulldoz|demolition drive|arbitrary arrest|illegal detention|uapa.+journalist|uapa.+activist|afspa.+civilian|sedition.+journalist|sedition.+activist|contempt.+journalist|gag order|shut down|blocked|vote (?:deleted|dropped)|voter (?:purged|struck off)|targeted minority|targeted dalit|targeted muslim|hate crime)\b/i;

  if(supportSignals.test(txt))label="support";
  else if(violationSignals.test(txt))label="potential_violation";
  else label="neutral";

  if(/sc |supreme court.*order|high court.*order|gazette|official notification/.test(txt))evidenceLevel="official_doc";
  else if(/court.*stayed|court.*upheld|judgment|verdict/.test(txt))evidenceLevel="court_finding";
  else if(/multiple sources|confirmed|verified|official/.test(txt))evidenceLevel="corroborated";
  else if(/alleged|reportedly|sources say|unconfirmed/.test(txt))evidenceLevel="allegation";

  confidence=0.5;
  if(evidenceLevel==="official_doc")confidence+=0.25;
  else if(evidenceLevel==="court_finding")confidence+=0.30;
  else if(evidenceLevel==="corroborated")confidence+=0.15;
  else if(evidenceLevel==="allegation")confidence-=0.20;
  if(supportSignals.test(txt)||violationSignals.test(txt))confidence+=0.10;
  if(/\bmay (?:affect|impact|violate|constitute)\b|\bcould be\b|\bpossibly\b|\bappears to\b|\bseems to\b/i.test(txt))confidence-=0.10;
  if(/\bart\.\s*\d+/i.test(txt)||/\buapa\b|\bafspa\b|\bnsa\b|\bcaa\b/i.test(txt))confidence+=0.05;
  confidence=Math.max(0,Math.min(1,confidence));

  const reviewNeeded=confidence<0.6;
  if(confidence<0.45&&label==="neutral")label="uncertain";

  return{aiSkipped:false,skipReason:null,label,confidence:Math.round(confidence*100)/100,reviewNeeded};
}

// ─── TEST SUITE 1: SKIP CLASSIFICATION (v11 baseline, 23 cases) ──────
const skipSuite = [
  // 11 genuine stories — must PASS (aiSkipped=false)
  {h:"Court seeks Sonia Gandhi's reply in voter list case, next hearing on May 16",e:null,label:"Sonia voter list"},
  {h:"India-Russia defence pact allows troops, ships deployment in each other's bases",e:null,label:"India-Russia pact"},
  {h:"'Latkana, bhatkana, atkana': PM Modi targets Congress over opposition to women quota bill",e:null,label:"Modi+quota bill"},
  {h:"'Have guts? Face me directly': Didi dares BJP after I-T raids",e:null,label:"Mamata/raids"},
  {h:"Indian tankers turn back amid Iran's mixed Hormuz signals",e:null,label:"Hormuz"},
  {h:"Supreme Court strikes down electoral bonds scheme",e:null,label:"SC electoral bonds"},
  {h:"ED raids Delhi CM Kejriwal residence in liquor policy case",e:null,label:"ED/Kejriwal"},
  {h:"High Court grants bail to journalist in UAPA case",e:null,label:"HC UAPA bail"},
  {h:"CBI arrests IAS officer in Rajasthan over bribery",e:null,label:"CBI/IAS"},
  {h:"Parliament passes anti-conversion law",e:null,label:"Anti-conversion"},
  {h:"CJI orders probe into Manipur custodial death",e:null,label:"CJI Manipur"},
  // 12 junk — must SKIP
  {h:"IAF orders court of inquiry into Sukhoi hard landing at Pune airport",e:'Routine op',label:"IAF inquiry"},
  {h:"When Palantir CEO says working at billion dollar company better than Harvard",e:'Foreign-only',label:"Palantir CEO"},
  {h:"12 types of Submarines: A detailed guide to underwater naval vessels",e:'Listicle',label:"Submarines guide"},
  {h:"Mass shooting in US: 8 kids aged between 1 and 14 dead in Louisiana",e:'Foreign-only',label:"Louisiana shooting"},
  {h:"Bank of Canada governor raises alarm on Anthropic's latest AI model",e:'Foreign-only',label:"Bank of Canada"},
  {h:"Prime Minister Narendra Modi to address nation at 8.30pm today",e:'Future event',label:"PM future speech"},
  {h:"PM Modi: Women must teach DMK-Congress a lesson on polling day",e:'Campaign insult',label:"Campaign rhetoric"},
  {h:"Trump announces new tariffs on Chinese imports",e:'Foreign-only',label:"Trump tariffs"},
  {h:"Putin meets Xi Jinping in Moscow",e:'Foreign-only',label:"Putin/Xi"},
  {h:"Bollywood actor X signs new film",e:'Pure noise',label:"Bollywood"},
  {h:"IPL match result: MI beat CSK",e:'Pure noise',label:"IPL"},
  {h:"What is UCC? A complete guide to the Uniform Civil Code",e:'Listicle',label:"UCC explainer"},
];

// ─── TEST SUITE 2: \bruling\b REGRESSION (v12.1 NEW) ──────────────
// Previously "ruling party slams opposition" matched hasPolicy regex (false positive → campaign insult passed through).
// v12.1 fix: only \bcourt ruling\b / \bsc ruling\b / etc should match. Bare "ruling party" should NOT.
const rulingSuite = [
  // "ruling party" as noun phrase — should be filtered as campaign insult
  {h:"BJP slams Congress as ruling party in Rajasthan over quota remarks",e:'Campaign insult',label:"ruling party insult"},
  {h:"Modi taunts Congress over ruling party advantage in Gujarat",e:'Campaign insult',label:"ruling party taunt"},
  // "court ruling" as actual court decision — should PASS
  {h:"Supreme Court ruling strikes down electoral bonds",e:null,label:"SC ruling (actual)"},
  {h:"HC ruling quashes UAPA charges against journalist in Delhi",e:null,label:"HC ruling (actual)"},
];

// ─── TEST SUITE 3: LABEL + CONFIDENCE (v12.1 NEW) ──────────────────
const labelSuite = [
  // Support signals + court finding → label=support, confidence high
  {h:"High Court grants bail to journalist in UAPA case; stayed arbitrary detention",
   expectedLabel:"support", minConfidence:0.6, label:"Bail grant w/ stay"},
  // Violation signals + allegation → label=potential_violation, confidence moderate
  {h:"Custody death in Tamil Nadu: family alleges fake encounter",
   expectedLabel:"potential_violation", minConfidence:0.4, label:"Custody death"},
  // Neutral factual + corroborated → label=neutral
  {h:"Parliament passes amendment to law; confirmed by multiple sources",
   expectedLabel:"neutral", minConfidence:0.5, label:"Bill passed"},
  // Weak evidence + vague signals → label=uncertain
  {h:"Sources say new policy may affect tribal rights in Jharkhand",
   expectedLabel:"uncertain", minConfidence:0, label:"Vague policy claim"},
];

// ─── RUN ALL THREE SUITES ─────────────────────────────────────────────
let pass=0, fail=0;
const failures=[];

console.log("── Suite 1: Skip classification (23 cases) ────────────────");
for(const t of skipSuite){
  const r=classify(t.h,"");
  const got=r.aiSkipped?r.skipReason:null;
  // normalize skipReason prefixes
  const gotShort=got?got.split(" —")[0].split(" ")[0]:null;
  const eShort=t.e?t.e.split(" ")[0]:null;
  // "Foreign-only" may come back as "Foreign" — loose match
  let match=false;
  if(!got&&!t.e)match=true;
  else if(got&&t.e&&got.toLowerCase().startsWith(t.e.toLowerCase().split(" ")[0].toLowerCase()))match=true;
  else if(got&&t.e&&t.e.toLowerCase().split(" ")[0]==="foreign"&&got.toLowerCase().startsWith("foreign"))match=true;
  else if(got&&t.e&&t.e.toLowerCase().split(" ")[0]==="campaign"&&got.toLowerCase().startsWith("political"))match=true;
  else if(got&&t.e&&t.e.toLowerCase().split(" ")[0]==="routine"&&got.toLowerCase().startsWith("routine"))match=true;
  else if(got&&t.e&&t.e.toLowerCase().split(" ")[0]==="listicle"&&got.toLowerCase().startsWith("explainer"))match=true;
  else if(got&&t.e&&t.e.toLowerCase().split(" ")[0]==="pure"&&got.toLowerCase().startsWith("sports"))match=true;
  else if(got&&t.e&&t.e.toLowerCase().split(" ")[0]==="future"&&got.toLowerCase().startsWith("future"))match=true;
  if(match){pass++;console.log("  ✓",(got||"PASS").padEnd(28),"|",t.label);}
  else{fail++;failures.push(`[Suite1] ${t.label}: expected ${t.e||'PASS'}, got ${got||'PASS'}`);console.log("  ✗",t.label,"| exp:",t.e||"PASS","| got:",got||"PASS");}
}

console.log("\n── Suite 2: \\bruling\\b regression fix (4 cases) ─────────────");
for(const t of rulingSuite){
  const r=classify(t.h,"");
  const got=r.aiSkipped?r.skipReason:null;
  let match=false;
  if(!got&&!t.e)match=true;
  else if(got&&t.e&&got.toLowerCase().startsWith(t.e.toLowerCase().split(" ")[0].toLowerCase()))match=true;
  if(match){pass++;console.log("  ✓",(got||"PASS").padEnd(28),"|",t.label);}
  else{fail++;failures.push(`[Suite2] ${t.label}: expected ${t.e||'PASS'}, got ${got||'PASS'}`);console.log("  ✗",t.label,"| exp:",t.e||"PASS","| got:",got||"PASS");}
}

console.log("\n── Suite 3: Label + confidence (4 cases) ──────────────────");
for(const t of labelSuite){
  const r=classify(t.h,"");
  const labelOK=r.label===t.expectedLabel;
  const confOK=r.confidence>=t.minConfidence;
  if(labelOK&&confOK){pass++;console.log(`  ✓ label=${r.label} conf=${r.confidence} review=${r.reviewNeeded} | ${t.label}`);}
  else{fail++;failures.push(`[Suite3] ${t.label}: expected label=${t.expectedLabel} minConf=${t.minConfidence}, got label=${r.label} conf=${r.confidence}`);console.log(`  ✗ label=${r.label} conf=${r.confidence} (expected ${t.expectedLabel}, min ${t.minConfidence}) | ${t.label}`);}
}

const total=skipSuite.length+rulingSuite.length+labelSuite.length;
console.log("\n── Results ────────────────────────────────────────────────");
console.log(pass+" / "+total+" passed");
if(fail){console.log("\nFailures:");failures.forEach(f=>console.log("  • "+f));process.exit(1);}
else{console.log("\n✓ All v12.1 regression checks passed — safe to ship");process.exit(0);}
