import{useState,useEffect,useCallback,useRef,useMemo}from"react";
import{AreaChart,Area,LineChart,Line,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,RadarChart,Radar,PolarGrid,PolarAngleAxis,BarChart,Bar,Cell}from"recharts";

// ── API KEYS — PASTE YOUR FREE KEYS HERE ─────────────────────
// Groq: https://console.groq.com (FREE — 14,400 req/day)
const GROQ_API_KEY="YOUR_GROQ_KEY_HERE";
// ─────────────────────────────────────────────────────────────

const PATTERN_CLASSES={isolated:{label:"Isolated",color:"#64748b",dot:"○",bg:"rgba(100,116,139,0.1)",mult:1.0},emerging:{label:"Emerging Pattern",color:"#f59e0b",dot:"◔",bg:"rgba(245,158,11,0.1)",mult:1.15},repeated:{label:"Repeated Pattern",color:"#f97316",dot:"◑",bg:"rgba(249,115,22,0.1)",mult:1.3},systemic:{label:"Systemic Pattern",color:"#ef4444",dot:"●",bg:"rgba(239,68,68,0.1)",mult:1.5}};
const INST={police:"🚔 Police",judiciary:"⚖️ Judiciary",parliament:"🏛️ Parliament",executive:"🏢 Executive",ec:"🗳️ Election Comm.",media:"📰 Media"};

const CA={
  "Preamble":{t:"Sovereign Secular Democratic Republic",s:"India — sovereign, socialist, secular, democratic republic — securing justice, liberty, equality and fraternity.",c:"#fbbf24"},
  "Art.14":{t:"Equality Before Law",s:"State shall not deny to any person equality before law or equal protection of laws.",c:"#6366f1"},
  "Art.15":{t:"No Discrimination",s:"State shall not discriminate only on grounds of religion, race, caste, sex, or place of birth.",c:"#8b5cf6"},
  "Art.17":{t:"Abolition of Untouchability",s:"Untouchability is abolished and its practice in any form is forbidden.",c:"#c084fc"},
  "Art.19(1)(a)":{t:"Freedom of Speech & Press",s:"All citizens shall have the right to freedom of speech and expression.",c:"#f97316"},
  "Art.19(1)(b)":{t:"Right to Peaceful Assembly",s:"All citizens shall have the right to assemble peaceably and without arms.",c:"#fb923c"},
  "Art.21":{t:"Right to Life & Liberty",s:"No person shall be deprived of life or personal liberty except by procedure established by law.",c:"#ef4444"},
  "Art.21A":{t:"Right to Education",s:"State shall provide free and compulsory education to children 6-14 years.",c:"#fca5a5"},
  "Art.22":{t:"Protection Against Arbitrary Arrest",s:"Arrested person must be informed of grounds; produced before magistrate within 24 hours.",c:"#f87171"},
  "Art.23":{t:"Prohibition of Forced Labour",s:"Traffic in human beings and begar and all similar forced labour are prohibited.",c:"#fbbf24"},
  "Art.25":{t:"Freedom of Religion",s:"All persons are equally entitled to freedom of conscience and right to profess religion.",c:"#ec4899"},
  "Art.26":{t:"Religious Denomination Autonomy",s:"Religious denominations have right to manage own religious affairs and property.",c:"#f472b6"},
  "Art.29":{t:"Minority Cultural Rights",s:"Any section of citizens having distinct language, script or culture has right to conserve the same.",c:"#c084fc"},
  "Art.30":{t:"Minority Educational Rights",s:"All minorities have right to establish and administer educational institutions.",c:"#e879f9"},
  "Art.32":{t:"Right to Constitutional Remedies",s:"Right to move Supreme Court for enforcement of Fundamental Rights.",c:"#22c55e"},
  "Art.39":{t:"Right to Livelihood",s:"Citizens have right to adequate means of livelihood; equal pay for equal work.",c:"#86efac"},
  "Art.39A":{t:"Free Legal Aid",s:"State shall ensure legal system promotes justice on equal opportunity basis.",c:"#bbf7d0"},
  "Art.46":{t:"Protection of Weaker Sections",s:"State shall promote educational and economic interests of SC, ST and weaker sections.",c:"#a5f3fc"},
  "Art.82":{t:"Delimitation After Census",s:"Upon completion of each census, readjustment of allocation of seats shall be made.",c:"#60a5fa"},
  "Art.124":{t:"Establishment of Supreme Court",s:"There shall be a Supreme Court of India; judges appointed by President.",c:"#14b8a6"},
  "Art.141":{t:"SC Law Binding on All Courts",s:"Law declared by Supreme Court shall be binding on all courts within India.",c:"#5eead4"},
  "Art.226":{t:"HC Writ Jurisdiction",s:"Every High Court has power to issue writs including habeas corpus.",c:"#86efac"},
  "Art.239":{t:"Administration of Union Territories",s:"Every UT shall be administered by the President through an Administrator.",c:"#d1fae5"},
  "Art.300A":{t:"Right to Property",s:"No person shall be deprived of property save by authority of law.",c:"#fbbf24"},
  "Art.324":{t:"Election Commission Independence",s:"Superintendence, direction and control of elections vested in the Election Commission.",c:"#f59e0b"},
  "Art.326":{t:"Universal Adult Suffrage",s:"Elections on basis of adult suffrage — every person 18+ entitled to vote.",c:"#d97706"},
  "Art.355":{t:"Union Duty to Protect States",s:"Union shall protect every State against external aggression and internal disturbance.",c:"#92400e"},
  "Art.368":{t:"Power to Amend the Constitution",s:"Parliament may amend any provision by 2/3 majority of members present and voting in each House.",c:"#dc2626"},
  "5th Sch":{t:"Tribal Areas Administration",s:"Special protections for Scheduled Areas and Scheduled Tribes.",c:"#047857"},
  "10th Sch":{t:"Anti-Defection Law",s:"Disqualification of Parliament/State Legislature members on grounds of defection.",c:"#991b1b"},
  "7th Sch":{t:"Division of Powers",s:"Union List (97), State List (66), Concurrent List (47) entries define legislative jurisdiction.",c:"#7f1d1d"},
};

const PILLARS={press_freedom:{label:"Press Freedom",article:"Art.19(1)(a)",color:"#f97316",base:22,weight:1.2},liberty:{label:"Right to Liberty",article:"Art.21",color:"#ef4444",base:35,weight:1.2},equality:{label:"Equality",article:"Art.14-15",color:"#8b5cf6",base:32,weight:1.1},electoral:{label:"Electoral Integrity",article:"Art.324",color:"#3b82f6",base:48,weight:1.0},separation:{label:"Separation of Powers",article:"Art.50",color:"#14b8a6",base:43,weight:0.9},religion:{label:"Religious Freedom",article:"Art.25-28",color:"#ec4899",base:28,weight:1.0},justice:{label:"Access to Justice",article:"Art.32",color:"#22c55e",base:45,weight:0.9}};

// ── ALL 28 STATES + KEY UTs ────────────────────────────────────
const STATE_BASELINES={
  "Andhra Pradesh":45,"Arunachal Pradesh":52,"Assam":29,"Bihar":38,
  "Chhattisgarh":34,"Goa":40,"Gujarat":35,"Haryana":37,
  "Himachal Pradesh":53,"Jharkhand":43,"Karnataka":55,"Kerala":64,
  "Madhya Pradesh":38,"Maharashtra":40,"Manipur":17,"Meghalaya":51,
  "Mizoram":54,"Nagaland":48,"Odisha":47,"Punjab":50,
  "Rajasthan":44,"Sikkim":57,"Tamil Nadu":59,"Telangana":49,
  "Tripura":46,"Uttar Pradesh":26,"Uttarakhand":50,"West Bengal":39,
  "Delhi":41,"J&K":30
};

const STATE_ENV={
  "Uttar Pradesh":{topIssues:["Bulldozer demolitions targeting minorities","UAPA misuse against activists","3 journalist murders in 18 months","Sambhal violence — 5 killed"],worstFor:["Muslims","Dalits","Journalists"],missingRights:["Art.14","Art.19(1)(a)","Art.21","Art.22","Art.300A"],helplines:["DLSA Lucknow: 0522-2615547","NHRC: 14433"]},
  "Manipur":{topIssues:["Ethnic war 200+ dead ongoing 2026","60,000+ displaced persons","400+ churches burned","Internet shutdown 500+ days"],worstFor:["Kuki-Zo Christians","Journalists","Women"],missingRights:["Art.21","Art.14","Art.19(1)(a)","Art.29","Art.355"],helplines:["NALSA: 15100","NHRC: 14433"]},
  "Assam":{topIssues:["NRC leaves 1.9 million stateless","CAA creates two-tier citizenship","4 journalist arrests in 2024","Detention camps expanded"],worstFor:["Muslims excluded from NRC","Bengali Hindus","Journalists"],missingRights:["Art.14","Art.15","Art.21","Art.19(1)(a)"],helplines:["Gauhati HC Legal Aid: 0361-2345634","NHRC: 14433"]},
  "Chhattisgarh":{topIssues:["Journalist Mukesh Chandrakar murdered Jan 2025","52,000+ adivasis displaced from Hasdeo","Maoist conflict civilian casualties"],worstFor:["Adivasi communities","Journalists"],missingRights:["Art.21","Art.19(1)(a)","5th Sch"],helplines:["DLSA Raipur: 0771-2513777","NHRC: 14433"]},
  "Gujarat":{topIssues:["Bilkis Bano convicts recalled by SC","AMC demolitions — 400+ Muslim families","Anti-minority violence impunity"],worstFor:["Muslims","Independent journalists"],missingRights:["Art.14","Art.300A","Art.19(1)(a)"],helplines:["Gujarat Legal Aid: 079-23254770","NHRC: 14433"]},
  "Haryana":{topIssues:["Nuh: 1,200 Muslim homes bulldozed","Disputed 2024 election results","Violence against journalists"],worstFor:["Muslim minority in Mewat","Opposition politicians"],missingRights:["Art.14","Art.324","Art.300A"],helplines:["HSLSA Chandigarh: 0172-2749590","NHRC: 14433"]},
  "Bihar":{topIssues:["3rd highest SC/ST atrocity rate","MGNREGA underpayment endemic","Conviction rate below 5% for caste crimes"],worstFor:["Dalits in rural areas","Women"],missingRights:["Art.17","Art.39","Art.46"],helplines:["BSLSA Patna: 0612-2217856","NHRC: 14433"]},
  "West Bengal":{topIssues:["Post-election violence — 40+ killed","SSC job scam 25,000 posts cancelled by SC","Sandeshkhali women assault"],worstFor:["BJP supporters rural","SSC job seekers","Women in Sandeshkhali"],missingRights:["Art.19(1)(a)","Art.14","Art.21"],helplines:["WBSLSA Kolkata: 033-22145163","NHRC: 14433"]},
  "Maharashtra":{topIssues:["Anti-defection law nullified by Shinde faction","ED misuse against opposition","Atrocities against Dalits rural areas"],worstFor:["Opposition parties","Dalits"],missingRights:["10th Sch","Art.326","Art.17"],helplines:["MSLSA Mumbai: 022-22654099","NHRC: 14433"]},
  "Delhi":{topIssues:["CM Kejriwal arrested by ED pre-election","Air quality 168 days unsafe","LG vs elected govt standoff"],worstFor:["AAP supporters","Poor in polluted areas"],missingRights:["Art.21","Art.239","Art.326"],helplines:["DSLSA: 011-23093512","NHRC: 14433"]},
  "Madhya Pradesh":{topIssues:["Anti-conversion laws targeting minorities","Adivasi displacement for mining","Dalit atrocities rise 12%"],worstFor:["Religious minorities","Tribal communities","Dalits"],missingRights:["Art.25","5th Sch","Art.17"],helplines:["MPSLSA Jabalpur: 0761-2621424","NHRC: 14433"]},
  "Rajasthan":{topIssues:["Democratic alternation BJP 2023","Rural SC/ST atrocities","Paper leak scandal education"],missingRights:["Art.17","Art.14"],helplines:["RSLSA Jaipur: 0141-2225527","NHRC: 14433"]},
  "Jharkhand":{topIssues:["CM Hemant Soren arrested pre-election","Adivasi land rights violations","Mining displacement without consent"],worstFor:["Adivasi communities"],missingRights:["Art.21","5th Sch"],helplines:["JSLSA Ranchi: 0651-2332250","NHRC: 14433"]},
  "Punjab":{topIssues:["Drug addiction crisis 70% households affected","Farmers march 2024 stopped with teargas","Stubble burning health emergency"],worstFor:["Indebted farmers","Youth"],missingRights:["Art.21","Art.41"],helplines:["PSLSA Chandigarh: 0172-2546756","NHRC: 14433"]},
  "Karnataka":{topIssues:["Some ED bureau cases opposition targeting","Coastal Hindu-Muslim communal tensions","Caste discrimination rural areas"],missingRights:["Art.14"],helplines:["KSLSA Bengaluru: 080-22861133","NHRC: 14433"]},
  "Telangana":{topIssues:["Post-BRS Congress transition 2023","Farmer suicides endemic","Formula E land acquisition disputes"],missingRights:["Art.300A"],helplines:["TSLSA Hyderabad: 040-23450013","NHRC: 14433"]},
  "Tamil Nadu":{topIssues:["Delimitation bill existential political threat","Caste violence in rural districts","NEET protest student deaths"],worstFor:["Dalits in rural areas","Students"],missingRights:["Art.17","Art.21"],helplines:["TNSLSA Chennai: 044-25384000","NHRC: 14433"]},
  "Kerala":{topIssues:["Centre-state fiscal discrimination — Art.131 filed","Some ED/CBI cases targeting state govt","Coastal erosion displacement"],missingRights:[],helplines:["KSLSA Ernakulam: 0484-2397126","NHRC: 14433"]},
  "Himachal Pradesh":{topIssues:["State debt crisis Rs 75,000 crore","Apple farmer distress — import competition","Natural disaster displacement"],missingRights:[],helplines:["HPSLSA Shimla: 0177-2621004","NHRC: 14433"]},
  "Odisha":{topIssues:["BJD ousted 2024 democratic transition","Adivasi rights violations in mining districts","Cyclone displacement rehabilitation gaps"],missingRights:["5th Sch"],helplines:["OSLSA Cuttack: 0671-2305250","NHRC: 14433"]},
  "J&K":{topIssues:["UT statehood denied since 2019","PSA 320+ detentions in 2025","LG overrides elected government","Press freedom severe restrictions"],worstFor:["Journalists","Political activists","Gujjar-Bakkarwal community"],missingRights:["Art.21","Art.19(1)(a)","Art.239"],helplines:["J&K SLSA: 0194-2485832","NHRC: 14433"]},
  "Andhra Pradesh":{topIssues:["TDP-BJP 2024 transition violence","Polavaram displacement 5 lakh people","Sand mafia journalist threats"],missingRights:["Art.300A","Art.19(1)(a)"],helplines:["APSLSA: 0863-2348888","NHRC: 14433"]},
  "Goa":{topIssues:["Mass defections to BJP — anti-defection nullified","Mining ban rehabilitation incomplete","Casino industry labour rights"],missingRights:["10th Sch","Art.21"],helplines:["GSLSA Panaji: 0832-2438908","NHRC: 14433"]},
  "Sikkim":{topIssues:["2023 floods recovery inequity","SDF ousted 2024 democratic alternation","Hydropower displacement"],missingRights:[],helplines:["SLSA Gangtok: 03592-204052","NHRC: 14433"]},
  "Arunachal Pradesh":{topIssues:["China border land encroachment — 2000 acres","Journalist access restrictions border areas","Indigenous land rights under pressure"],worstFor:["Border communities","Indigenous groups"],missingRights:["Art.21","5th Sch","Art.19(1)(a)"],helplines:["SLSA Itanagar: 0360-2212811","NHRC: 14433"]},
  "Meghalaya":{topIssues:["Coal mining deaths — illegal rat-hole mines","Khasi indigenous land rights","Border tensions with Assam — 12 killed 2022"],worstFor:["Coal miners","Indigenous Khasi community"],missingRights:["Art.21","5th Sch","Art.39"],helplines:["MSLSA Shillong: 0364-2224128","NHRC: 14433"]},
  "Mizoram":{topIssues:["Refugee crisis — 30,000+ Myanmar refugees","Chin refugee rights ambiguity","Political transition 2023"],worstFor:["Myanmar refugees"],missingRights:["Art.21","Art.14"],helplines:["MSLSA Aizawl: 0389-2322722","NHRC: 14433"]},
  "Nagaland":{topIssues:["Mon district civilians killed by army 2021 — no accountability","AFSPA still in force","Peace talks stalled — Naga political solution pending"],worstFor:["Civilian communities under AFSPA","Journalists"],missingRights:["Art.21","Art.22","Art.19(1)(a)"],helplines:["NSLSA Kohima: 0370-2270067","NHRC: 14433"]},
  "Tripura":{topIssues:["Post-election violence BJP vs CPIM","Indigenous Tripuri land rights shrinking","Journalist arrests under BNS"],worstFor:["CPIM supporters","Indigenous Tripuri community","Journalists"],missingRights:["Art.19(1)(a)","Art.14","5th Sch"],helplines:["TSLSA Agartala: 0381-2324578","NHRC: 14433"]},
  "Uttarakhand":{topIssues:["UCC implementation — Uniform Civil Code first state","Joshimath land subsidence 50,000 displaced","Anti-conversion law misuse"],worstFor:["Religious minorities","Displaced families Joshimath"],missingRights:["Art.25","Art.300A","Art.21"],helplines:["USLSA Nainital: 05942-235644","NHRC: 14433"]},
};

const OCC_RIGHTS={"Journalist":{rights:["Art.19(1)(a)","Art.21","Art.22"],gap:85,threats:["Arrest under UAPA/BNS-152","Criminal defamation","Physical attacks — 3 murdered 2024-25"],actions:["Document arrest or detention details immediately","Contact press bodies and legal aid within 24 hours","Preserve video, notices, and witness accounts","File writ remedies if unlawful detention is suspected"],helplines:["Press Club India: 011-23379161","RSF India support","NHRC: 14433"]},"Farmer":{rights:["Art.39","Art.41","Art.43","Art.21"],gap:65,threats:["Debt crisis 12,000+ suicides/yr","MSP non-statutory","Land acquisition without fair process"],actions:["Preserve land, compensation, and protest documents","Use RTI for acquisition or compensation records"],helplines:["Kisan Call Centre: 1800-180-1551","NALSA: 15100"]},"Tribal/Adivasi":{rights:["Art.21","5th Sch","Art.29","Art.46"],gap:80,threats:["Mining displacement without consent","PESA violations","Forest rights denial"],actions:["Collect Gram Sabha, FRA, and land records","Document any displacement or consent violations"],helplines:["NALSA: 15100","NHRC: 14433"]},"Dalit (SC)":{rights:["Art.17","Art.14","Art.15","Art.46"],gap:72,threats:["Atrocities 50,000+/yr NCRB","Manual scavenging still occurring"],actions:["Document atrocity incidents and witness details","Use SC/ST Act complaint channels"],helplines:["SC/ST Commission: 011-23381202","NHRC: 14433"]},"Muslim Minority":{rights:["Art.14","Art.15","Art.25","Art.26","Art.29","Art.30"],gap:75,threats:["CAA religion-based exclusion","Bulldozer demolitions","UAPA disproportionate use"],actions:["Document notices, demolitions, or discriminatory treatment","Preserve property and identity records"],helplines:["National Minority Commission: 011-23517473","NHRC: 14433"]},"Christian Minority":{rights:["Art.25","Art.26","Art.29","Art.30","Art.14"],gap:60,threats:["Anti-conversion laws in 10+ states","Church attacks Manipur 400+"],actions:["Document attacks on places of worship","Seek immediate legal and community support"],helplines:["National Minority Commission: 011-23517473","NHRC: 14433"]},"Woman":{rights:["Art.14","Art.15","Art.16","Art.21","Art.39"],gap:60,threats:["Gender-based violence","Workplace discrimination","Custodial abuse"],actions:["Preserve medical, workplace, and police records","Use women helplines and district legal aid"],helplines:["Women Helpline: 181","NCW: 011-26942369","NHRC: 14433"]},"Student":{rights:["Art.21A","Art.21","Art.19(1)(a)","Art.19(1)(b)"],gap:50,threats:["UAPA on student activists","Campus surveillance","NEET irregularities"],actions:["Document disciplinary notices and speech restrictions","Use RTI and writ remedies when needed"],helplines:["Student helpline: 8800-899-588","NALSA: 15100"]},"Worker/Labourer":{rights:["Art.23","Art.39","Art.41","Art.43"],gap:65,threats:["Minimum wage violations","MGNREGA underpayment","Forced labour in brick kilns"],actions:["Document wage records, coercion, and labour conditions","Escalate forced labour or non-payment quickly"],helplines:["Labour helpline: 1800-11-2228","NALSA: 15100"]},"General Citizen":{rights:["Art.14","Art.21","Art.19(1)(a)","Art.32"],gap:50,threats:["Administrative overreach","Corruption","Arbitrary detention"],actions:["Document notices, detentions, and threats early","Use district legal aid and human rights channels"],helplines:["NHRC: 14433","NALSA: 15100"]}};

const BASE_SCORE=41;
const CONF_W={verified:1.0,corroborated:0.8,single_source:0.5,citizen_unverified:0.3};
const SK="dtn_v3",SHK="dtn_v3_sh",AK="dtn_v3_audit";

const SEED_STORIES=[
  {id:"S001",ts:new Date("2026-03-15").getTime(),headline:"Opposition Criticizes Linking Women Reservation with Delimitation Exercise",body:"Multiple opposition parties raised concerns that Women Reservation Act implementation is tied to delimitation exercise.",pillar:"electoral",institution:"parliament",severity:"high",direction:"negative",delta:-3,violations:[{a:"Art.82",h:"Delimitation used to delay representation"},{a:"Art.326",h:"Universal suffrage principle under threat"}],supports:[],affected_group:"women",source:"verified",confidence:0.82,pattern:"repeated",aiScore:-3,aiPillar:"electoral",aiAnalysis:"Pattern: Electoral promise tied to census delay. Systemic issue affecting half the population.",mythos:"When reservation meets delimitation, the promise of equality becomes the instrument of delay.",approved:true,held:false,aiDone:true,scope:"national"},
  {id:"S003",ts:new Date("2026-02-20").getTime(),headline:"Umar Khalid — 5th Year Under UAPA Without Trial Completion",body:"Scholar and activist Umar Khalid remains incarcerated under UAPA for over 5 years without trial completion.",pillar:"liberty",institution:"judiciary",severity:"critical",direction:"negative",delta:-5,violations:[{a:"Art.21",h:"5 years incarceration without conviction"},{a:"Art.22",h:"Arbitrary detention without bail"}],supports:[],affected_group:"minorities",source:"verified",confidence:0.95,pattern:"systemic",aiScore:-5,aiPillar:"liberty",aiAnalysis:"Systemic: UAPA used to incarcerate dissent without trial. Chilling effect documented.",mythos:"A scholar caged for five years without verdict — justice delayed is democracy denied.",approved:true,held:false,aiDone:true,scope:"national"},
  {id:"N001",ts:new Date("2026-01-10").getTime(),headline:"Assam NRC Leaves 1.9 Million Stateless — CAA Creates Two-Tier Citizenship",body:"The National Register of Citizens process in Assam has left 1.9 million people effectively stateless.",pillar:"equality",institution:"executive",severity:"critical",direction:"negative",delta:-4,violations:[{a:"Art.14",h:"NRC creates unequal citizenship verification"},{a:"Art.15",h:"CAA discriminates on religious grounds"}],supports:[],affected_group:"muslims",source:"corroborated",confidence:0.88,pattern:"systemic",aiScore:-4,aiPillar:"equality",aiAnalysis:"Systemic: Combined NRC+CAA creates structured discrimination.",mythos:"In the land of Gandhi, 1.9 million souls await proof that they belong.",approved:true,held:false,aiDone:true,scope:"state",state:"Assam"},
  {id:"N002",ts:new Date("2026-01-25").getTime(),headline:"Journalist Mukesh Chandrakar Murder — Third Journalist Killed in 18 Months",body:"Journalist Mukesh Chandrakar was murdered in Chhattisgarh linked to contractor exposé reporting.",pillar:"press_freedom",institution:"police",severity:"critical",direction:"negative",delta:-5,violations:[{a:"Art.21",h:"Journalist killed — state failure to protect life"},{a:"Art.19(1)(a)",h:"Press freedom suppressed through violence"}],supports:[],affected_group:"journalists",source:"verified",confidence:0.96,pattern:"systemic",aiScore:-5,aiPillar:"press_freedom",aiAnalysis:"Systemic: Third journalist murder — impunity normalised. India 159th RSF.",mythos:"The press is democracy's mirror. Breaking it does not make the problems disappear.",approved:true,held:false,aiDone:true,scope:"state",state:"Chhattisgarh"},
  {id:"N005",ts:new Date("2025-11-25").getTime(),headline:"Sambhal Violence: 5 Killed in Clashes Linked to Mosque Survey",body:"Five people were killed in Sambhal, UP during clashes linked to a court-ordered mosque survey.",pillar:"liberty",institution:"police",severity:"critical",direction:"negative",delta:-5,violations:[{a:"Art.21",h:"5 killed — state failed duty to protect life"},{a:"Art.25",h:"Religious site weaponized for communal tension"}],supports:[],affected_group:"muslims",source:"verified",confidence:0.92,pattern:"repeated",aiScore:-5,aiPillar:"liberty",aiAnalysis:"Pattern: Mosque surveys triggering state violence. Repeated across 5 districts.",mythos:"Surveys meant for records become scripts for violence when wielded with intent.",approved:true,held:false,aiDone:true,scope:"state",state:"Uttar Pradesh"},
  {id:"N006",ts:new Date("2026-03-01").getTime(),headline:"Supreme Court Rules UAPA Bail Refusal Violates Art.21 — Landmark Liberty Ruling",body:"The Supreme Court held that prolonged bail refusal under UAPA violates the constitutional right to life and liberty.",pillar:"liberty",institution:"judiciary",severity:"high",direction:"positive",delta:4,violations:[],supports:[{a:"Art.21",h:"SC affirms liberty cannot be denied by indefinite detention"},{a:"Art.22",h:"Bail rights reaffirmed against draconian laws"}],affected_group:null,source:"verified",confidence:0.99,pattern:"isolated",aiScore:4,aiPillar:"liberty",aiAnalysis:"Positive: Judicial check on executive overreach. Precedent-setting.",mythos:"Even in the darkest laws, the court can find light — if it chooses to look.",approved:true,held:false,aiDone:true,scope:"national"},
  {id:"N013",ts:new Date("2024-06-04").getTime(),headline:"2024 Lok Sabha: Opposition Wins 235 Seats — Hung Parliament Prevents Supermajority",body:"The 2024 general election produced a hung parliament where BJP won 240 seats, short of majority without allies.",pillar:"electoral",institution:"ec",severity:"medium",direction:"positive",delta:3,violations:[],supports:[{a:"Art.326",h:"Adult suffrage produced genuine opposition"},{a:"Art.324",h:"Election Commission conducted largely free polls"}],affected_group:null,source:"verified",confidence:1.0,pattern:"isolated",aiScore:3,aiPillar:"electoral",aiAnalysis:"Positive: Democratic resilience demonstrated. Supermajority prevented by voters.",mythos:"India voted — and reminded power that it serves at the people's pleasure.",approved:true,held:false,aiDone:true,scope:"national"},
  {id:"N016",ts:new Date("2024-02-15").getTime(),headline:"Supreme Court Strikes Down Electoral Bond Scheme as Unconstitutional",body:"The Supreme Court unanimously struck down the Electoral Bond scheme as violating voters right to information.",pillar:"electoral",institution:"judiciary",severity:"high",direction:"positive",delta:4,violations:[],supports:[{a:"Art.324",h:"Electoral transparency upheld by SC"},{a:"Art.19(1)(a)",h:"Voters right to know about political funding affirmed"}],affected_group:null,source:"verified",confidence:1.0,pattern:"isolated",aiScore:4,aiPillar:"electoral",aiAnalysis:"Positive: SC strikes back against opaque political funding.",mythos:"Sunlight is the best disinfectant. The court opened the curtains on electoral finance.",approved:true,held:false,aiDone:true,scope:"national"},
  {id:"N024",ts:new Date("2026-02-01").getTime(),headline:"Manipur Ethnic War Enters Third Year — 200 Dead, 60,000 Displaced",body:"The ethnic conflict in Manipur between Meitei and Kuki-Zo communities continues into 2026 with no resolution.",pillar:"liberty",institution:"executive",severity:"critical",direction:"negative",delta:-5,violations:[{a:"Art.21",h:"200+ killed — state failed duty to protect life"},{a:"Art.355",h:"Union failed to protect state from internal disturbance"},{a:"Art.29",h:"Cultural rights of Kuki-Zo destroyed"}],supports:[],affected_group:"minorities",source:"verified",confidence:0.97,pattern:"systemic",aiScore:-5,aiPillar:"liberty",aiAnalysis:"Systemic: Ethnic cleansing unaddressed for 3 years.",mythos:"Sixty thousand people without homes. The Constitution's promise — unanswered.",approved:true,held:false,aiDone:true,scope:"state",state:"Manipur"},
  {id:"N025",ts:new Date("2025-12-10").getTime(),headline:"Nagaland: Army Kills 13 Civilians in Mon District — No Accountability After 4 Years",body:"Four years after the Mon district massacre where army killed 13 civilians including miners, no officer has been prosecuted.",pillar:"liberty",institution:"police",severity:"critical",direction:"negative",delta:-4,violations:[{a:"Art.21",h:"Extra-judicial killings without accountability"},{a:"Art.22",h:"AFSPA impunity shields state violence"}],supports:[],affected_group:"tribals",source:"verified",confidence:0.91,pattern:"systemic",aiScore:-4,aiPillar:"liberty",aiAnalysis:"Systemic: AFSPA impunity normalises army violence in Northeast.",mythos:"In Nagaland, the uniform has become a shield against justice.",approved:true,held:false,aiDone:true,scope:"state",state:"Nagaland"},
  {id:"N026",ts:new Date("2026-01-20").getTime(),headline:"Uttarakhand UCC: First State to Implement Uniform Civil Code",body:"Uttarakhand became the first state to implement a Uniform Civil Code, raising concerns about minority religious rights.",pillar:"religion",institution:"executive",severity:"high",direction:"negative",delta:-3,violations:[{a:"Art.25",h:"Minority religious personal law overridden"},{a:"Art.26",h:"Religious denomination autonomy restricted"}],supports:[],affected_group:"minorities",source:"verified",confidence:0.85,pattern:"emerging",aiScore:-3,aiPillar:"religion",aiAnalysis:"Emerging: UCC first implemented here — precedent for other BJP states.",mythos:"One law for all sounds like equality. But equality requires recognising difference.",approved:true,held:false,aiDone:true,scope:"state",state:"Uttarakhand"},
  {id:"N027",ts:new Date("2026-02-15").getTime(),headline:"Mizoram: 30,000 Myanmar Refugees Face Statelessness and Deportation Threats",body:"Refugees who fled Myanmar military junta face statelessness in Mizoram as India considers deportation.",pillar:"liberty",institution:"executive",severity:"critical",direction:"negative",delta:-4,violations:[{a:"Art.21",h:"Deportation to danger violates right to life"},{a:"Art.14",h:"Discriminatory treatment of refugees"}],supports:[],affected_group:"minorities",source:"corroborated",confidence:0.87,pattern:"emerging",aiScore:-4,aiPillar:"liberty",aiAnalysis:"Emerging: Refugee crisis in Northeast — no legal framework, rights vacuum.",mythos:"They fled bullets only to find bureaucracy.",approved:true,held:false,aiDone:true,scope:"state",state:"Mizoram"},
];

// ── ENGINE ─────────────────────────────────────────────────────
function localClassify(headline,body){
  const txt=((headline||"")+" "+(body||"")).toLowerCase();
  let pillar="justice",severity="medium",direction="neutral",delta=0,institution=null,affected_group=null,violations=[],supports=[];
  if(/police|officer|arrested|detained|custody|encounter/.test(txt))institution="police";
  else if(/court|supreme court|high court|sc |hc |bench|judgment|verdict|quash|stay/.test(txt))institution="judiciary";
  else if(/parliament|lok sabha|rajya sabha|mp |bill passed|amendment/.test(txt))institution="parliament";
  else if(/election commission|eci|polling|ballot|voter|candidate/.test(txt))institution="ec";
  else if(/government|ministry|cm |chief minister|governor|lg |centre|state govt/.test(txt))institution="executive";
  else if(/journalist|reporter|media|press|editor|news channel/.test(txt))institution="media";
  if(/journalist|reporter|press|media/.test(txt))affected_group="journalists";
  else if(/muslim|mosque|waqf|madrassa/.test(txt))affected_group="muslims";
  else if(/dalit|sc.?st|caste|untouchab/.test(txt))affected_group="dalits";
  else if(/tribal|adivasi|forest right|pesa|gram sabha/.test(txt))affected_group="tribals";
  else if(/farmer|agriculture|msp|kisan|crop/.test(txt))affected_group="farmers";
  else if(/minority|christian|church|sikh/.test(txt))affected_group="minorities";
  else if(/women|woman|female|gender|rape/.test(txt))affected_group="women";
  else if(/student|campus|university|college/.test(txt))affected_group="students";
  if(/journalist.*(kill|murder|shot|dead|arrest|detain)|press freedom|uapa.*journalist|reporter.*arrest/.test(txt)){pillar="press_freedom";if(/kill|murder|shot|dead/.test(txt)){severity="critical";direction="negative";delta=-5;violations=[{a:"Art.21",h:"Journalist killed"},{a:"Art.19(1)(a)",h:"Press freedom suppressed"}];}else if(/arrest|detain/.test(txt)){severity="high";direction="negative";delta=-3;violations=[{a:"Art.19(1)(a)",h:"Journalist arrested"},{a:"Art.22",h:"Detention safeguards bypassed"}];}else{severity="medium";direction="negative";delta=-2;violations=[{a:"Art.19(1)(a)",h:"Press freedom restricted"}];}}
  else if(/uapa|psa|afspa|nsa |arbitrary arrest|detain|bail denied|custody death|encounter kill/.test(txt)){pillar="liberty";if(/kill|dead|death|murder/.test(txt)){severity="critical";direction="negative";delta=-5;violations=[{a:"Art.21",h:"Right to life violated"},{a:"Art.22",h:"Due process abandoned"}];}else{severity="high";direction="negative";delta=-3;violations=[{a:"Art.21",h:"Liberty arbitrarily denied"},{a:"Art.22",h:"Arbitrary detention"}];}}
  else if(/election|voter|ballot|poll|eci|vote rigging|electoral roll|delimitation/.test(txt)){pillar="electoral";if(/rig|fraud|manipulat|fake|booth capturing/.test(txt)){severity="critical";direction="negative";delta=-5;violations=[{a:"Art.326",h:"Election fraud undermines suffrage"},{a:"Art.324",h:"EC integrity compromised"}];}else if(/delimitation|constituency|redraw/.test(txt)){severity="high";direction="negative";delta=-3;violations=[{a:"Art.82",h:"Delimitation may affect representation"},{a:"Art.326",h:"Universal suffrage at risk"}];}else if(/court.*election|sc.*election|election.*upheld/.test(txt)){direction="positive";delta=3;supports=[{a:"Art.326",h:"Electoral integrity upheld by judiciary"}];}else{severity="medium";direction="negative";delta=-2;violations=[{a:"Art.324",h:"Electoral process under scrutiny"}];}}
  else if(/nrc|citizenship|caa |stateless|deportat/.test(txt)){pillar="equality";severity="critical";direction="negative";delta=-4;violations=[{a:"Art.14",h:"Unequal citizenship verification"},{a:"Art.15",h:"Religious discrimination in citizenship"}];}
  else if(/sc.*uphold|court.*protect|judgment.*right|verdict.*acquit|bail.*granted/.test(txt)){pillar="justice";direction="positive";delta=3;supports=[{a:"Art.32",h:"Judicial remedy upheld"},{a:"Art.141",h:"SC law protects citizens"}];}
  else if(/bulldoz|demolish|demolition|evict|displace/.test(txt)){pillar="equality";severity="high";direction="negative";delta=-3;violations=[{a:"Art.300A",h:"Arbitrary deprivation of property"},{a:"Art.21",h:"Home demolition violates dignity"}];}
  else if(/manipur|ethnic|riot|communal violence/.test(txt)){pillar="liberty";severity="critical";direction="negative";delta=-5;violations=[{a:"Art.21",h:"Violence against life and dignity"},{a:"Art.355",h:"Union failed to protect state"}];}
  if(direction==="neutral"){direction="negative";severity="medium";delta=-1;violations=[{a:"Art.21",h:"Potential rights concern identified"}];}
  const source="single_source",confidence=0.5+Math.random()*0.3,pattern="isolated";
  return{pillar,severity,direction,delta,institution,affected_group,violations,supports,source,confidence,pattern,aiScore:delta,aiPillar:pillar,aiAnalysis:null,mythos:null};
}

function firewall(story){const c=CONF_W[story.source]||0.5;const score=c*0.6+(story.confidence||0.5)*0.4;return{pass:score>=0.45,confidence:score};}

function wDelta(s){
  const src=CONF_W[s.source]||0.3;
  const days=Math.max(0,(Date.now()-s.ts)/86400000);
  const rec=Math.max(0.3,1-days*0.008);
  const pw=PILLARS[s.pillar]?.weight||1.0;
  const pm=PATTERN_CLASSES[s.pattern]?.mult||1.0;
  return(s.aiScore||s.delta||0)*src*rec*pw*pm;
}

function calcNat(stories){
  const approved=stories.filter(s=>s.approved);
  if(!approved.length)return BASE_SCORE;
  const total=approved.reduce((a,s)=>a+wDelta(s),0);
  return Math.max(0,Math.min(100,Math.round(BASE_SCORE+total)));
}

function calcSt(stories,stateName){
  const base=STATE_BASELINES[stateName]||40;
  const rel=stories.filter(s=>s.approved&&s.state===stateName);
  const total=rel.reduce((a,s)=>a+wDelta(s)*0.8,0);
  return Math.max(0,Math.min(100,Math.round(base+total)));
}

function scoreColor(n){return n>=60?"#22c55e":n>=40?"#f59e0b":n>=25?"#f97316":"#ef4444";}
function scoreLabel(n){return n>=60?"Functioning Democracy":n>=40?"Democratic Erosion":n>=25?"Democratic Backsliding":"Authoritarian Risk";}

let _rlu=0;
const isRL=()=>Date.now()<_rlu;
const setRL=ms=>{_rlu=Date.now()+ms;};

// ── GOOGLE NEWS RSS FETCHER (FREE — No API key needed) ────────
// Uses allorigins.win CORS proxy + DOMParser — completely free
async function parseRSS(rssUrl, stateHint){
  try{
    const proxy="https://api.allorigins.win/get?url="+encodeURIComponent(rssUrl);
    const res=await fetch(proxy,{signal:AbortSignal.timeout(10000)});
    if(!res.ok)return[];
    const data=await res.json();
    const parser=new DOMParser();
    const xml=parser.parseFromString(data.contents,"text/xml");
    const items=[...xml.querySelectorAll("item")];
    return items.slice(0,8).map(item=>{
      const rawTitle=item.querySelector("title")?.textContent||"";
      const headline=rawTitle.replace(/ - [^-]*$/,"").replace(/<!\[CDATA\[|\]\]>/g,"").trim();
      const rawDesc=item.querySelector("description")?.textContent||"";
      const body=rawDesc.replace(/<[^>]*>/g,"").replace(/<!\[CDATA\[|\]\]>/g,"").trim().slice(0,300);
      const pubDate=item.querySelector("pubDate")?.textContent||"";
      return{headline,body,state:stateHint||null,pubDate};
    }).filter(i=>i.headline.length>10);
  }catch{return[];}
}

// Build RSS query based on scope
function buildRSSUrl(scope,stateName,district){
  const BASE="https://news.google.com/rss/search?hl=en-IN&gl=IN&ceid=IN:en&q=";
  if(scope==="national"){
    const q="India+democracy+rights+court+police+press+freedom+constitution+-cricket+-IPL";
    return BASE+encodeURIComponent(q);
  }
  if(scope==="state"&&stateName){
    const q=stateName+"+court+police+rights+protest+arrest+demolition+election+-cricket";
    return BASE+encodeURIComponent(q);
  }
  if(scope==="district"&&district){
    const q=district+"+India+police+court+rights+arrest+demolition+protest";
    return BASE+encodeURIComponent(q);
  }
  // local fallback
  const q="India+civic+rights+police+court+local";
  return BASE+encodeURIComponent(q);
}

async function fetchNews(scope,stateName,district){
  try{
    const url=buildRSSUrl(scope,stateName,district);
    const stateHint=scope==="state"?stateName:scope==="district"?stateName:null;
    const items=await parseRSS(url,stateHint);
    // Filter for rights-relevant stories using keywords
    const keywords=/rights|court|police|arrest|detain|demolish|protest|riot|murder|rape|dalit|minority|muslim|christian|tribal|adivasi|election|verdict|bail|uapa|afspa|judge|hc|sc |constitution|freedom|violence|killed|fired|suspended|inquiry|cbi|ed |rti/i;
    const filtered=items.filter(i=>keywords.test(i.headline+" "+i.body));
    // Return filtered or all if none match filter
    return(filtered.length>0?filtered:items).slice(0,6);
  }catch{return[];}
}

// ── GROQ AI UPGRADE (FREE — 14,400 req/day) ───────────────────
async function aiUpgrade(story){
  if(!GROQ_API_KEY||GROQ_API_KEY==="YOUR_GROQ_KEY_HERE"||isRL())return story;
  try{
    const r=await fetch("https://api.groq.com/openai/v1/chat/completions",{
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":"Bearer "+GROQ_API_KEY},
      body:JSON.stringify({
        model:"llama-3.3-70b-versatile",
        max_tokens:350,
        temperature:0.3,
        messages:[
          {role:"system",content:"You are a constitutional law expert for India. Analyse news events and return ONLY valid JSON with keys: score (number -5 to +5), pillar (string), analysis (string max 100 chars), mythos (string max 120 chars poetic insight). No markdown, no explanation, just JSON."},
          {role:"user",content:"News: "+story.headline+". Current score: "+story.delta+". Return JSON only."}
        ]
      })
    });
    if(r.status===429){setRL(30000);return story;}
    if(!r.ok)return story;
    const d=await r.json();
    const txt=d.choices?.[0]?.message?.content||"";
    const clean=txt.replace(/```json|```/g,"").trim();
    const start=clean.indexOf("{"),end=clean.lastIndexOf("}");
    if(start<0||end<0)return story;
    const j=JSON.parse(clean.slice(start,end+1));
    return{...story,aiScore:Number(j.score)||story.delta,aiPillar:j.pillar||story.pillar,aiAnalysis:j.analysis||null,mythos:j.mythos||null,aiDone:true};
  }catch{return story;}
}

// ── TOAST SYSTEM ───────────────────────────────────────────────
function useToasts(){
  const[toasts,setToasts]=useState([]);
  const add=useCallback((msg,type="info")=>{
    const id=Date.now();
    setToasts(p=>[...p,{id,msg,type}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),4000);
  },[]);
  return{toasts,add};
}
function Toasts({toasts}){
  return(
    <div style={{position:"fixed",top:70,right:16,zIndex:9999,display:"flex",flexDirection:"column",gap:8,maxWidth:"90vw"}}>
      {toasts.map(t=>(
        <div key={t.id} style={{padding:"10px 16px",borderRadius:10,background:t.type==="error"?"var(--red-s)":t.type==="success"?"var(--green-s)":"var(--surface2)",border:"1px solid "+(t.type==="error"?"var(--red)":t.type==="success"?"var(--green)":"var(--border2)"),color:"var(--t1)",fontSize:13,animation:"fadeUp 0.2s ease",boxShadow:"0 8px 24px rgba(0,0,0,0.4)"}}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ── UI PRIMITIVES ──────────────────────────────────────────────
function ScoreRing({score,size=120}){
  const r=(size-16)/2,circ=2*Math.PI*r;
  const col=scoreColor(score);
  const dash=(score/100)*circ;
  return(
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={8}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={8} strokeDasharray={circ} strokeDashoffset={circ-dash} strokeLinecap="round" style={{transition:"stroke-dashoffset 1s ease"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <span style={{fontFamily:"var(--font-m)",fontSize:size*0.22,fontWeight:700,color:col,lineHeight:1}}>{score}</span>
        <span style={{fontSize:size*0.09,color:"var(--t2)"}}>/ 100</span>
      </div>
    </div>
  );
}

function Tag({children,color="#4F8EF7",bg}){
  return<span style={{display:"inline-flex",alignItems:"center",fontSize:11,fontWeight:600,fontFamily:"var(--font-m)",color:color,background:bg||color+"22",borderRadius:6,padding:"2px 8px"}}>{children}</span>;
}
function Pill({children,color="var(--t2)"}){
  return<span style={{display:"inline-flex",alignItems:"center",fontSize:11,fontWeight:500,color:color,background:"rgba(255,255,255,0.06)",borderRadius:99,padding:"2px 10px"}}>{children}</span>;
}
function Metric({label,value,sub,color}){
  return(
    <div style={{padding:"14px 16px",background:"var(--surface2)",borderRadius:10,border:"1px solid var(--border)"}}>
      <div style={{fontSize:10,color:"var(--t3)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:6}}>{label}</div>
      <div style={{fontFamily:"var(--font-m)",fontSize:20,fontWeight:700,color:color||"var(--t1)"}}>{value}</div>
      {sub&&<div style={{fontSize:11,color:"var(--t2)",marginTop:3}}>{sub}</div>}
    </div>
  );
}

// ── LIVE TICKER ────────────────────────────────────────────────
function LiveTicker({stories,countdown,autoOn,fetchScope}){
  const approved=stories.filter(s=>s.approved&&s.direction==="negative").slice(0,10);
  const[idx,setIdx]=useState(0);
  useEffect(()=>{
    if(!approved.length)return;
    const t=setInterval(()=>setIdx(i=>(i+1)%approved.length),4000);
    return()=>clearInterval(t);
  },[approved.length]);
  if(!approved.length)return null;
  const s=approved[idx];
  return(
    <div style={{background:"var(--surface)",borderBottom:"1px solid var(--border)",padding:"8px 16px",display:"flex",alignItems:"center",gap:10,overflow:"hidden",flexShrink:0}}>
      <span style={{fontSize:9,fontWeight:800,color:"var(--red)",background:"var(--red-s)",borderRadius:4,padding:"2px 7px",letterSpacing:"0.1em",flexShrink:0}}>LIVE</span>
      <span style={{fontSize:12,color:"var(--t2)",flex:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",animation:"fadeIn 0.5s ease"}}>{s?.headline}</span>
      {autoOn&&<span style={{fontSize:10,color:"var(--green)",fontFamily:"var(--font-m)",flexShrink:0,background:"var(--green-s)",borderRadius:4,padding:"2px 8px"}}>↻ {countdown}s</span>}
      <span style={{fontSize:10,color:"var(--t3)",flexShrink:0,textTransform:"uppercase"}}>{fetchScope}</span>
    </div>
  );
}

// ── STORY CARD ─────────────────────────────────────────────────
function StoryCard({s,onReview,compact}){
  const[tab,setTab]=useState("facts");
  const isCrit=s.severity==="critical"&&s.direction==="negative";
  const isPos=s.direction==="positive";
  const dc=isCrit?"var(--red)":isPos?"var(--green)":"var(--amber)";
  const bg=isCrit?"rgba(240,74,90,0.04)":isPos?"rgba(34,197,94,0.04)":"rgba(245,158,11,0.03)";
  const pc=PATTERN_CLASSES[s.pattern]||PATTERN_CLASSES.isolated;
  return(
    <div style={{background:bg,border:"1px solid "+(isCrit?"rgba(240,74,90,0.15)":isPos?"rgba(34,197,94,0.15)":"rgba(245,158,11,0.10)"),borderRadius:14,padding:compact?"14px":"18px 20px",marginBottom:10}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:8,flexWrap:"wrap"}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:6}}>
            <Tag color={dc}>{isCrit?"🔴 CRITICAL":isPos?"🟢 POSITIVE":"🟡 HIGH"}</Tag>
            {s.state&&<Pill color="var(--blue)">{s.state}</Pill>}
            {s.scope&&<span style={{fontSize:9,color:"var(--t3)",textTransform:"uppercase",letterSpacing:"0.08em"}}>{s.scope}</span>}
            <span style={{marginLeft:"auto",fontFamily:"var(--font-m)",fontSize:12,fontWeight:700,color:dc}}>{(s.aiScore||s.delta)>0?"+":""}{s.aiScore||s.delta} pts</span>
          </div>
          <h3 style={{fontSize:13,fontWeight:600,color:"var(--t1)",lineHeight:1.5,margin:"0 0 6px",wordBreak:"break-word"}}>{s.headline}</h3>
          <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
            <span style={{fontSize:10,color:pc.color,background:pc.bg,borderRadius:5,padding:"1px 7px",fontWeight:600}}>{pc.dot} {pc.label}</span>
            {s.aiDone&&<span style={{fontSize:10,color:"var(--purple)",background:"var(--purple-s)",borderRadius:5,padding:"1px 7px",fontWeight:600}}>✦ AI</span>}
            <span style={{fontSize:10,color:"var(--t3)"}}>{new Date(s.ts).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</span>
          </div>
        </div>
      </div>
      {!compact&&(
        <>
          <div style={{display:"flex",gap:4,marginBottom:10}}>
            {["facts","mythos"].map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{padding:"4px 12px",borderRadius:7,border:"none",background:tab===t?"rgba(255,255,255,0.1)":"transparent",color:tab===t?"var(--t1)":"var(--t2)",fontSize:12,fontWeight:tab===t?600:400,cursor:"pointer"}}>
                {t==="facts"?"⚖ Facts":"✦ Mythos"}
              </button>
            ))}
          </div>
          {tab==="facts"?(
            <div>
              {(s.violations||[]).map((v,i)=>(
                <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",padding:"7px 0",borderBottom:"1px solid var(--border)"}}>
                  <Tag color={CA[v.a]?.c||"#ef4444"}>{v.a}</Tag>
                  <span style={{fontSize:12,color:"var(--t2)",flex:1}}>{v.h}</span>
                </div>
              ))}
              {(s.supports||[]).map((v,i)=>(
                <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",padding:"7px 0",borderBottom:"1px solid var(--border)"}}>
                  <Tag color="var(--green)">{v.a}</Tag>
                  <span style={{fontSize:12,color:"var(--t2)",flex:1}}>✓ {v.h}</span>
                </div>
              ))}
              {s.aiAnalysis&&<p style={{fontSize:11,color:"var(--t2)",marginTop:8,padding:"8px 12px",background:"var(--purple-s)",borderRadius:7,borderLeft:"3px solid var(--purple)"}}>{s.aiAnalysis}</p>}
            </div>
          ):(
            <div style={{padding:"12px 14px",background:"rgba(255,255,255,0.03)",borderRadius:9,borderLeft:"3px solid var(--purple)"}}>
              {s.mythos?<p style={{fontSize:13,color:"var(--t1)",fontStyle:"italic",lineHeight:1.8,margin:0}}>{s.mythos}</p>:<p style={{fontSize:12,color:"var(--t2)",margin:0}}>AI narrative pending...</p>}
            </div>
          )}
        </>
      )}
      {onReview&&(
        <div style={{display:"flex",gap:6,marginTop:10,flexWrap:"wrap"}}>
          <button onClick={()=>onReview(s.id,"approve")} style={{padding:"5px 12px",borderRadius:7,border:"1px solid var(--green)",background:"var(--green-s)",color:"var(--green)",fontSize:11,fontWeight:600,cursor:"pointer"}}>✓ Approve</button>
          <button onClick={()=>onReview(s.id,"hold")} style={{padding:"5px 12px",borderRadius:7,border:"1px solid var(--amber)",background:"var(--amber-s)",color:"var(--amber)",fontSize:11,fontWeight:600,cursor:"pointer"}}>⏸ Hold</button>
          <button onClick={()=>onReview(s.id,"reject")} style={{padding:"5px 12px",borderRadius:7,border:"1px solid var(--red)",background:"var(--red-s)",color:"var(--red)",fontSize:11,fontWeight:600,cursor:"pointer"}}>✗ Reject</button>
        </div>
      )}
    </div>
  );
}

// ── SIDEBAR ────────────────────────────────────────────────────
const NAVGROUPS=[
  {label:"Overview",items:[{id:"dashboard",icon:"◉",label:"Dashboard"},{id:"feed",icon:"⚡",label:"Live Feed"},{id:"rights",icon:"🛡",label:"My Rights"}]},
  {label:"Analysis",items:[{id:"patterns",icon:"◈",label:"Patterns"},{id:"timeline",icon:"◷",label:"Timeline"},{id:"constitution",icon:"⚖",label:"Constitution"},{id:"score",icon:"◎",label:"Score Analysis"},{id:"anomalies",icon:"⚠",label:"Anomalies"}]},
  {label:"India",items:[{id:"states",icon:"◱",label:"State Rankings"}]},
  {label:"Community",items:[{id:"submit",icon:"+",label:"Submit Report"},{id:"review",icon:"◻",label:"Review Queue"}]},
  {label:"Platform",items:[{id:"method",icon:"◈",label:"Methodology"},{id:"about",icon:"ℹ",label:"About"}]},
];

function Sidebar({page,setPage,pendingCount}){
  return(
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div className="logo-mark">D</div>
          <div>
            <div style={{fontFamily:"var(--font-h)",fontSize:13,fontWeight:800,color:"var(--t1)",letterSpacing:"0.03em"}}>DTN MYTHOS</div>
            <div style={{fontSize:9,color:"var(--t3)",textTransform:"uppercase",letterSpacing:"0.1em"}}>India · dtn.today</div>
          </div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {NAVGROUPS.map(g=>(
          <div key={g.label} className="nav-section">
            <div className="nav-section-label">{g.label}</div>
            {g.items.map(item=>(
              <button key={item.id} className={"nav-btn"+(page===item.id?" active":"")} onClick={()=>setPage(item.id)}>
                <span className="icon">{item.icon}</span>
                {item.label}
                {item.id==="review"&&pendingCount>0&&<span className="nav-badge">{pendingCount}</span>}
                {item.id==="feed"&&<span style={{marginLeft:"auto",width:6,height:6,borderRadius:"50%",background:"var(--green)",display:"inline-block",boxShadow:"0 0 6px var(--green)"}}/>}
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div>Constitutional Awareness</div>
        <div style={{color:"var(--t3)"}}>& Data Transparency · Live</div>
      </div>
    </aside>
  );
}

// ── TOPBAR ─────────────────────────────────────────────────────
function Topbar({score,fetching,onFetch,autoOn,setAutoOn,rl,fetchScope,setFetchScope,fetchState,setFetchState,fetchDistrict,setFetchDistrict}){
  const col=scoreColor(score);
  const states=Object.keys(STATE_BASELINES).sort();
  return(
    <div className="topbar">
      <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
        <span style={{fontFamily:"var(--font-m)",fontSize:15,fontWeight:700,color:col}}>{score}</span>
        <span style={{fontSize:11,color:"var(--t2)",display:"var(--hide-sm)"}}>· {scoreLabel(score)}</span>
      </div>
      <div style={{flex:1,display:"flex",alignItems:"center",gap:6,overflow:"hidden",padding:"0 8px"}}>
        <select value={fetchScope} onChange={e=>setFetchScope(e.target.value)} style={{padding:"4px 8px",borderRadius:7,border:"1px solid var(--border2)",background:"var(--surface2)",color:"var(--t1)",fontSize:11,outline:"none",cursor:"pointer"}}>
          <option value="national">National</option>
          <option value="state">State</option>
          <option value="district">District</option>
          <option value="local">Local</option>
        </select>
        {fetchScope==="state"&&(
          <select value={fetchState} onChange={e=>setFetchState(e.target.value)} style={{padding:"4px 8px",borderRadius:7,border:"1px solid var(--border2)",background:"var(--surface2)",color:"var(--t1)",fontSize:11,outline:"none",cursor:"pointer",maxWidth:110}}>
            {states.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        )}
        {fetchScope==="district"&&(
          <input value={fetchDistrict} onChange={e=>setFetchDistrict(e.target.value)} placeholder="e.g. Ahmedabad" style={{padding:"4px 10px",borderRadius:7,border:"1px solid var(--border2)",background:"var(--surface2)",color:"var(--t1)",fontSize:11,outline:"none",width:130}}/>
        )}
      </div>
      {rl&&<span style={{fontSize:10,color:"var(--red)",background:"var(--red-s)",borderRadius:99,padding:"3px 8px",flexShrink:0}}>⏸ RL</span>}
      <button onClick={onFetch} disabled={fetching||rl} style={{padding:"6px 12px",borderRadius:8,border:"1px solid var(--border2)",background:fetching?"var(--surface2)":"var(--surface)",color:fetching?"var(--t2)":"var(--t1)",fontSize:12,fontWeight:600,cursor:fetching?"default":"pointer",display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
        <span style={fetching?{display:"inline-block",animation:"spin 1s linear infinite"}:{}}>{fetching?"⟳":"⚡"}</span>
        <span className="hide-xs">Fetch</span>
      </button>
      <button onClick={()=>setAutoOn(a=>!a)} style={{padding:"6px 10px",borderRadius:8,border:"1px solid "+(autoOn?"var(--green)":"var(--border)"),background:autoOn?"var(--green-s)":"transparent",color:autoOn?"var(--green)":"var(--t2)",fontSize:10,fontWeight:700,cursor:"pointer",flexShrink:0}}>
        {autoOn?"AUTO ✓":"AUTO"}
      </button>
    </div>
  );
}

// ── PAGES ──────────────────────────────────────────────────────
function Dashboard({score,stories,natHistory}){
  const approved=stories.filter(s=>s.approved);
  const crit=approved.filter(s=>s.severity==="critical"&&s.direction==="negative").length;
  const pos=approved.filter(s=>s.direction==="positive").length;
  const col=scoreColor(score);
  const extScores=[{label:"Freedom House",val:"63/100",sub:"2025"},{label:"V-Dem Rank",val:"100/179",sub:"2025"},{label:"RSF Press",val:"151/180",sub:"2025"},{label:"EIU Index",val:"6.6/10",sub:"2024"}];
  const pillarData=Object.entries(PILLARS).map(([k,p])=>{
    const rel=approved.filter(s=>s.pillar===k);
    const delta=rel.reduce((a,s)=>a+wDelta(s),0);
    return{pillar:p.label.split(" ")[0],score:Math.max(0,Math.min(100,Math.round(p.base+delta))),color:p.color,full:p.label};
  });
  return(
    <div className="fade-up">
      <div style={{marginBottom:20}}>
        <div style={{fontSize:10,color:"var(--t3)",textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:700,marginBottom:6}}>Constitutional Awareness & Data Transparency · Live 24/7</div>
        <h1 style={{fontFamily:"var(--font-h)",fontSize:"clamp(20px,4vw,28px)",fontWeight:800,color:"var(--t1)",marginBottom:8}}>India Democracy Health Score</h1>
        <span style={{fontSize:12,fontWeight:700,color:col,background:col+"18",borderRadius:8,padding:"4px 12px"}}>{scoreLabel(score).toUpperCase()}</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:20,marginBottom:20,alignItems:"center"}}>
        <ScoreRing score={score} size={130}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {extScores.map(e=>(
            <div key={e.label} style={{padding:"10px 12px",background:"var(--surface2)",borderRadius:10,border:"1px solid var(--border)"}}>
              <div style={{fontSize:9,color:"var(--t3)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:3}}>{e.label}</div>
              <div style={{fontFamily:"var(--font-m)",fontSize:14,fontWeight:700,color:"var(--t1)"}}>{e.val}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:20}}>
        <Metric label="Tracked" value={approved.length} color="var(--blue)"/>
        <Metric label="Critical" value={crit} color="var(--red)"/>
        <Metric label="Positive" value={pos} color="var(--green)"/>
        <Metric label="Delta" value={(score-BASE_SCORE>0?"+":"")+(score-BASE_SCORE)} color={score>=BASE_SCORE?"var(--green)":"var(--red)"}/>
      </div>
      <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,padding:"16px 18px",marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:700,color:"var(--t2)",textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:12}}>Pillar Breakdown</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {pillarData.map(p=>(
            <div key={p.pillar} style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:11,color:"var(--t2)",width:80,flexShrink:0}}>{p.full}</span>
              <div style={{flex:1,height:5,background:"rgba(255,255,255,0.05)",borderRadius:99,overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:99,background:p.color,width:p.score+"%",transition:"width 1s ease"}}/>
              </div>
              <span style={{fontFamily:"var(--font-m)",fontSize:11,fontWeight:700,color:p.color,width:28,textAlign:"right"}}>{p.score}</span>
            </div>
          ))}
        </div>
      </div>
      {natHistory.length>1&&(
        <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,padding:"16px 18px"}}>
          <div style={{fontSize:11,fontWeight:700,color:"var(--t2)",textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:12}}>Score Trend</div>
          <ResponsiveContainer width="100%" height={100}>
            <AreaChart data={natHistory}>
              <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={col} stopOpacity={0.2}/><stop offset="95%" stopColor={col} stopOpacity={0}/></linearGradient></defs>
              <XAxis dataKey="label" tick={{fill:"var(--t3)",fontSize:9}} axisLine={false} tickLine={false}/>
              <YAxis domain={[0,100]} tick={{fill:"var(--t3)",fontSize:9}} axisLine={false} tickLine={false} width={24}/>
              <Tooltip contentStyle={{background:"var(--surface2)",border:"1px solid var(--border2)",borderRadius:8,color:"var(--t1)",fontSize:11}}/>
              <Area type="monotone" dataKey="score" stroke={col} fill="url(#sg)" strokeWidth={2} dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function FeedPage({stories,fetching,onFetch,onAI,fetchScope,setFetchScope,countdown,autoOn}){
  const[filter,setFilter]=useState("all");
  const approved=stories.filter(s=>s.approved);
  const total=stories.length,app=approved.length,held=stories.filter(s=>s.held).length,aiDone=stories.filter(s=>s.aiDone).length;
  const filtered=filter==="all"?approved:filter==="critical"?approved.filter(s=>s.severity==="critical"):filter==="positive"?approved.filter(s=>s.direction==="positive"):approved.filter(s=>s.scope===filter);
  return(
    <div className="fade-up">
      <div style={{marginBottom:16}}>
        <h2 style={{fontFamily:"var(--font-h)",fontSize:"clamp(18px,3vw,22px)",fontWeight:800,color:"var(--t1)",marginBottom:4}}>⚡ Live Constitutional News</h2>
        <p style={{fontSize:12,color:"var(--t2)"}}>Web search → classifier → firewall → score. AI refines in background.</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
        <Metric label="Fetched" value={total} color="var(--blue)"/>
        <Metric label="Live" value={app} color="var(--green)"/>
        <Metric label="Held" value={held} color="var(--amber)"/>
        <Metric label="AI" value={aiDone} color="var(--purple)"/>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
        {["all","national","state","local","critical","positive"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{padding:"5px 12px",borderRadius:7,border:"1px solid "+(filter===f?"var(--blue)":"var(--border)"),background:filter===f?"var(--blue-s)":"transparent",color:filter===f?"var(--blue)":"var(--t2)",fontSize:11,fontWeight:filter===f?600:400,cursor:"pointer",textTransform:"capitalize"}}>{f}</button>
        ))}
        <div style={{flex:1}}/>
        <button onClick={onAI} style={{padding:"5px 12px",borderRadius:7,border:"1px solid var(--purple)",background:"var(--purple-s)",color:"var(--purple)",fontSize:11,fontWeight:600,cursor:"pointer"}}>✦ AI</button>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
        <div style={{width:7,height:7,borderRadius:"50%",background:"var(--green)",boxShadow:"0 0 6px var(--green)",animation:"pulse 2s ease-in-out infinite"}}/>
        <span style={{fontSize:12,fontWeight:600,color:"var(--green)"}}>Live · Scoring Active</span>
        {autoOn&&<span style={{fontSize:11,color:"var(--t3)"}}>Next fetch in {countdown}s</span>}
      </div>
      {filtered.length===0&&<div style={{textAlign:"center",padding:"40px 20px",color:"var(--t2)"}}>No stories match this filter</div>}
      {filtered.map(s=><StoryCard key={s.id} s={s}/>)}
    </div>
  );
}

function MyRightsPage({scope,setScope}){
  const states=Object.keys(STATE_BASELINES).sort();
  const occs=Object.keys(OCC_RIGHTS);
  const env=STATE_ENV[scope.state]||{};
  const occ=OCC_RIGHTS[scope.occupation]||OCC_RIGHTS["General Citizen"];
  return(
    <div className="fade-up">
      <div style={{marginBottom:18}}>
        <h2 style={{fontFamily:"var(--font-h)",fontSize:"clamp(18px,3vw,22px)",fontWeight:800,color:"var(--t1)",marginBottom:4}}>🛡 My Rights</h2>
        <p style={{fontSize:12,color:"var(--t2)"}}>Know your constitutional protections based on who you are and where you live.</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
        <div>
          <label style={{fontSize:10,color:"var(--t3)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:5}}>Your State</label>
          <select value={scope.state} onChange={e=>setScope(p=>({...p,state:e.target.value}))} style={{width:"100%",padding:"9px 12px",borderRadius:9,border:"1px solid var(--border2)",background:"var(--surface2)",color:"var(--t1)",fontSize:12,outline:"none"}}>
            {states.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={{fontSize:10,color:"var(--t3)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:5}}>Your Profile</label>
          <select value={scope.occupation} onChange={e=>setScope(p=>({...p,occupation:e.target.value}))} style={{width:"100%",padding:"9px 12px",borderRadius:9,border:"1px solid var(--border2)",background:"var(--surface2)",color:"var(--t1)",fontSize:12,outline:"none"}}>
            {occs.map(o=><option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
        <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,padding:"16px 18px"}}>
          <div style={{fontSize:10,color:"var(--t3)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:10}}>{scope.state} — Active Issues</div>
          {(env.topIssues||["No major issues recorded"]).map((iss,i)=>(
            <div key={i} style={{display:"flex",gap:8,padding:"7px 0",borderBottom:"1px solid var(--border)"}}>
              <span style={{color:"var(--red)",fontSize:11,marginTop:2,flexShrink:0}}>●</span>
              <span style={{fontSize:12,color:"var(--t2)"}}>{iss}</span>
            </div>
          ))}
          {(env.missingRights||[]).length>0&&(
            <div style={{marginTop:12}}>
              <div style={{fontSize:10,color:"var(--t3)",fontWeight:600,marginBottom:6}}>RIGHTS UNDER PRESSURE</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                {env.missingRights.map(r=><Tag key={r} color={CA[r]?.c||"var(--red)"}>{r}</Tag>)}
              </div>
            </div>
          )}
        </div>
        <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,padding:"16px 18px"}}>
          <div style={{fontSize:10,color:"var(--t3)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:10}}>As {scope.occupation}</div>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:10,color:"var(--t3)",marginBottom:5}}>PROTECTED BY</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{occ.rights.map(r=><Tag key={r} color={CA[r]?.c||"var(--blue)"}>{r}</Tag>)}</div>
          </div>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:10,color:"var(--t3)",marginBottom:5}}>KEY THREATS</div>
            {occ.threats.map((t,i)=><div key={i} style={{fontSize:11,color:"var(--t2)",padding:"4px 0",borderBottom:"1px solid var(--border)"}}>⚠ {t}</div>)}
          </div>
          <div style={{fontSize:10,color:"var(--t3)",marginBottom:5}}>HELPLINES</div>
          {[...(env.helplines||[]),...(occ.helplines||[])].slice(0,4).map((h,i)=><div key={i} style={{fontSize:11,color:"var(--green)",fontFamily:"var(--font-m)",padding:"2px 0"}}>{h}</div>)}
        </div>
      </div>
      <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,padding:"16px 18px"}}>
        <div style={{fontSize:10,color:"var(--t3)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:10}}>What To Do If Your Rights Are Violated</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {occ.actions.map((a,i)=>(
            <div key={i} style={{display:"flex",gap:8,padding:"9px 11px",background:"var(--surface2)",borderRadius:9}}>
              <span style={{color:"var(--blue)",fontWeight:700,fontSize:11,flexShrink:0}}>{i+1}.</span>
              <span style={{fontSize:11,color:"var(--t2)"}}>{a}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PatternsPage({stories}){
  const approved=stories.filter(s=>s.approved);
  const byPattern={};
  Object.keys(PATTERN_CLASSES).forEach(k=>{byPattern[k]=approved.filter(s=>s.pattern===k);});
  const pillarData=Object.entries(PILLARS).map(([k,p])=>({name:p.label.split(" ")[0],count:approved.filter(s=>s.pillar===k&&s.direction==="negative").length,color:p.color}));
  return(
    <div className="fade-up">
      <div style={{marginBottom:18}}>
        <h2 style={{fontFamily:"var(--font-h)",fontSize:"clamp(18px,3vw,22px)",fontWeight:800,color:"var(--t1)",marginBottom:4}}>◈ Pattern Analysis</h2>
        <p style={{fontSize:12,color:"var(--t2)"}}>Detecting isolated incidents vs systemic erosion of democratic norms.</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:18}}>
        {Object.entries(PATTERN_CLASSES).map(([k,p])=>(
          <div key={k} style={{padding:"14px 16px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12}}>
            <div style={{fontSize:20,marginBottom:6}}>{p.dot}</div>
            <div style={{fontFamily:"var(--font-m)",fontSize:18,fontWeight:700,color:p.color}}>{byPattern[k]?.length||0}</div>
            <div style={{fontSize:11,color:"var(--t2)",marginTop:3}}>{p.label}</div>
          </div>
        ))}
      </div>
      <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,padding:"16px 18px",marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,color:"var(--t2)",textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:12}}>Violations by Pillar</div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={pillarData} barSize={24}>
            <XAxis dataKey="name" tick={{fill:"var(--t2)",fontSize:10}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:"var(--t2)",fontSize:10}} axisLine={false} tickLine={false} width={20}/>
            <Tooltip contentStyle={{background:"var(--surface2)",border:"1px solid var(--border2)",borderRadius:8,color:"var(--t1)"}}/>
            <Bar dataKey="count" radius={[4,4,0,0]}>{pillarData.map((e,i)=><Cell key={i} fill={e.color}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {Object.entries(byPattern).filter(([,arr])=>arr.length>0).map(([k,arr])=>(
        <div key={k} style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"14px 18px",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <span style={{color:PATTERN_CLASSES[k].color,fontSize:16}}>{PATTERN_CLASSES[k].dot}</span>
            <span style={{fontWeight:700,color:"var(--t1)",fontSize:13}}>{PATTERN_CLASSES[k].label}</span>
            <span style={{fontSize:11,color:"var(--t2)"}}>{arr.length} events</span>
          </div>
          {arr.slice(0,3).map(s=><div key={s.id} style={{padding:"6px 0",borderBottom:"1px solid var(--border)",fontSize:12,color:"var(--t2)"}}>{s.headline}</div>)}
        </div>
      ))}
    </div>
  );
}

function TimelinePage({stories,natHistory}){
  const approved=stories.filter(s=>s.approved).sort((a,b)=>b.ts-a.ts);
  return(
    <div className="fade-up">
      <div style={{marginBottom:18}}>
        <h2 style={{fontFamily:"var(--font-h)",fontSize:"clamp(18px,3vw,22px)",fontWeight:800,color:"var(--t1)",marginBottom:4}}>◷ Timeline</h2>
      </div>
      {natHistory.length>1&&(
        <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,padding:"16px 18px",marginBottom:18}}>
          <div style={{fontSize:11,fontWeight:700,color:"var(--t2)",textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:12}}>Score Over Time</div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={natHistory}>
              <XAxis dataKey="label" tick={{fill:"var(--t3)",fontSize:9}} axisLine={false} tickLine={false}/>
              <YAxis domain={[0,100]} tick={{fill:"var(--t3)",fontSize:9}} axisLine={false} tickLine={false} width={24}/>
              <Tooltip contentStyle={{background:"var(--surface2)",border:"1px solid var(--border2)",borderRadius:8,fontSize:11}}/>
              <Line type="monotone" dataKey="score" stroke="var(--blue)" strokeWidth={2} dot={{r:2,fill:"var(--blue)"}}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <div style={{position:"relative",paddingLeft:20}}>
        <div style={{position:"absolute",left:6,top:0,bottom:0,width:1,background:"var(--border)"}}/>
        {approved.map(s=>(
          <div key={s.id} style={{position:"relative",paddingBottom:16}}>
            <div style={{position:"absolute",left:-18,top:3,width:8,height:8,borderRadius:"50%",background:s.direction==="positive"?"var(--green)":s.severity==="critical"?"var(--red)":"var(--amber)",border:"2px solid var(--bg)"}}/>
            <div style={{fontSize:10,color:"var(--t3)",marginBottom:3}}>{new Date(s.ts).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"2-digit"})}</div>
            <div style={{fontSize:13,fontWeight:600,color:"var(--t1)",marginBottom:4}}>{s.headline}</div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              <Tag color={s.direction==="positive"?"var(--green)":s.severity==="critical"?"var(--red)":"var(--amber)"}>{s.direction==="positive"?"+":""}{s.aiScore||s.delta} pts</Tag>
              <Pill>{PILLARS[s.pillar]?.label||s.pillar}</Pill>
              {s.state&&<Pill color="var(--blue)">{s.state}</Pill>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConstitutionPage(){
  const[search,setSearch]=useState("");
  const[sel,setSel]=useState(null);
  const filtered=Object.entries(CA).filter(([k,v])=>!search||k.toLowerCase().includes(search.toLowerCase())||v.t.toLowerCase().includes(search.toLowerCase()));
  const s=sel?CA[sel]:null;
  return(
    <div className="fade-up">
      <div style={{marginBottom:18}}>
        <h2 style={{fontFamily:"var(--font-h)",fontSize:"clamp(18px,3vw,22px)",fontWeight:800,color:"var(--t1)",marginBottom:4}}>⚖ Constitution Explorer</h2>
      </div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search articles..." style={{width:"100%",padding:"10px 14px",borderRadius:9,border:"1px solid var(--border2)",background:"var(--surface2)",color:"var(--t1)",fontSize:13,outline:"none",marginBottom:14}}/>
      {s&&sel&&(
        <div style={{background:"var(--surface)",border:"1px solid var(--border2)",borderRadius:14,padding:"18px 20px",marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{flex:1}}>
              <Tag color={s.c}>{sel}</Tag>
              <h3 style={{fontFamily:"var(--font-h)",fontSize:17,fontWeight:700,color:"var(--t1)",margin:"8px 0 6px"}}>{s.t}</h3>
              <p style={{fontSize:13,color:"var(--t2)",lineHeight:1.8}}>{s.s}</p>
            </div>
            <button onClick={()=>setSel(null)} style={{background:"transparent",border:"none",color:"var(--t2)",cursor:"pointer",fontSize:18,marginLeft:10}}>✕</button>
          </div>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:7}}>
        {filtered.map(([k,v])=>(
          <button key={k} onClick={()=>setSel(k===sel?null:k)} style={{textAlign:"left",padding:"12px 14px",background:sel===k?"var(--surface2)":"var(--surface)",border:"1px solid "+(sel===k?"var(--border2)":"var(--border)"),borderRadius:9,cursor:"pointer",transition:"all 0.15s"}}>
            <Tag color={v.c}>{k}</Tag>
            <div style={{fontSize:11,color:"var(--t1)",fontWeight:600,marginTop:6,lineHeight:1.4}}>{v.t}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ScorePage({score,stories,natHistory}){
  const approved=stories.filter(s=>s.approved);
  const pillarData=Object.entries(PILLARS).map(([k,p])=>{
    const rel=approved.filter(s=>s.pillar===k);
    const delta=rel.reduce((a,s)=>a+wDelta(s),0);
    const sc=Math.max(0,Math.min(100,Math.round(p.base+delta)));
    return{subject:p.label,score:sc,color:p.color,base:p.base,delta:Math.round(delta)};
  });
  return(
    <div className="fade-up">
      <div style={{marginBottom:18}}>
        <h2 style={{fontFamily:"var(--font-h)",fontSize:"clamp(18px,3vw,22px)",fontWeight:800,color:"var(--t1)",marginBottom:4}}>◎ Score Analysis</h2>
      </div>
      <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,padding:"16px 18px",marginBottom:14}}>
        <ResponsiveContainer width="100%" height={200}>
          <RadarChart data={pillarData} outerRadius={75}>
            <PolarGrid stroke="rgba(255,255,255,0.06)"/>
            <PolarAngleAxis dataKey="subject" tick={{fill:"var(--t2)",fontSize:9}}/>
            <Radar dataKey="score" stroke="var(--blue)" fill="var(--blue)" fillOpacity={0.15} strokeWidth={2}/>
          </RadarChart>
        </ResponsiveContainer>
      </div>
      {pillarData.map(p=>(
        <div key={p.subject} style={{padding:"11px 14px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:9,marginBottom:7}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
            <span style={{fontSize:12,color:"var(--t1)",fontWeight:600}}>{p.subject}</span>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:10,color:"var(--t2)"}}>base {p.base}</span>
              <span style={{fontFamily:"var(--font-m)",fontSize:13,fontWeight:700,color:p.color}}>{p.score}</span>
              <span style={{fontSize:11,color:p.delta>=0?"var(--green)":"var(--red)",fontWeight:600}}>{p.delta>=0?"+":""}{p.delta}</span>
            </div>
          </div>
          <div style={{height:4,background:"rgba(255,255,255,0.05)",borderRadius:99,overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:99,background:p.color,width:p.score+"%",transition:"width 1s ease"}}/>
          </div>
        </div>
      ))}
    </div>
  );
}

function AnomaliesPage({stories}){
  const approved=stories.filter(s=>s.approved);
  const critical=approved.filter(s=>s.severity==="critical");
  const systemic=approved.filter(s=>s.pattern==="systemic");
  return(
    <div className="fade-up">
      <div style={{marginBottom:18}}>
        <h2 style={{fontFamily:"var(--font-h)",fontSize:"clamp(18px,3vw,22px)",fontWeight:800,color:"var(--t1)",marginBottom:4}}>⚠ Anomaly Detection</h2>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:18}}>
        <Metric label="Critical" value={critical.length} color="var(--red)"/>
        <Metric label="Systemic" value={systemic.length} color="var(--amber)"/>
        <Metric label="Total Approved" value={approved.length} color="var(--blue)"/>
      </div>
      {systemic.length>0&&<div style={{marginBottom:16}}><div style={{fontSize:12,fontWeight:700,color:"var(--amber)",marginBottom:10}}>● Systemic Violations</div>{systemic.map(s=><StoryCard key={s.id} s={s} compact/>)}</div>}
      {critical.filter(s=>s.pattern!=="systemic").length>0&&<div><div style={{fontSize:12,fontWeight:700,color:"var(--red)",marginBottom:10}}>● Critical Isolated</div>{critical.filter(s=>s.pattern!=="systemic").map(s=><StoryCard key={s.id} s={s} compact/>)}</div>}
    </div>
  );
}

function StatesPage({stories}){
  const approved=stories.filter(s=>s.approved);
  const stateScores=Object.entries(STATE_BASELINES).map(([st,base])=>({state:st,score:calcSt(approved,st),base})).sort((a,b)=>b.score-a.score);
  const[sel,setSel]=useState(null);
  const env=sel?STATE_ENV[sel]:null;
  return(
    <div className="fade-up">
      <div style={{marginBottom:18}}>
        <h2 style={{fontFamily:"var(--font-h)",fontSize:"clamp(18px,3vw,22px)",fontWeight:800,color:"var(--t1)",marginBottom:4}}>◱ State Rankings</h2>
        <p style={{fontSize:12,color:"var(--t2)"}}>All 28 States + 2 Union Territories</p>
      </div>
      {sel&&env&&(
        <div style={{background:"var(--surface)",border:"1px solid var(--border2)",borderRadius:14,padding:"18px 20px",marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <ScoreRing score={calcSt(approved,sel)} size={60}/>
              <div>
                <h3 style={{fontFamily:"var(--font-h)",fontSize:17,fontWeight:700,color:"var(--t1)",marginBottom:2}}>{sel}</h3>
                <div style={{fontSize:11,color:"var(--t3)"}}>Baseline: {STATE_BASELINES[sel]}</div>
              </div>
            </div>
            <button onClick={()=>setSel(null)} style={{background:"transparent",border:"none",color:"var(--t2)",cursor:"pointer",fontSize:18}}>✕</button>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
            {(env.missingRights||[]).map(r=><Tag key={r} color={CA[r]?.c||"var(--red)"}>{r}</Tag>)}
          </div>
          {(env.topIssues||[]).map((iss,i)=><div key={i} style={{fontSize:12,color:"var(--t2)",padding:"5px 0",borderBottom:"1px solid var(--border)"}}>⚠ {iss}</div>)}
          <div style={{marginTop:10}}>{(env.helplines||[]).map((h,i)=><div key={i} style={{fontSize:11,fontFamily:"var(--font-m)",color:"var(--green)",padding:"2px 0"}}>{h}</div>)}</div>
        </div>
      )}
      <div style={{display:"flex",flexDirection:"column",gap:5}}>
        {stateScores.map((item,i)=>{
          const col=scoreColor(item.score);
          return(
            <button key={item.state} onClick={()=>setSel(item.state===sel?null:item.state)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:sel===item.state?"var(--surface2)":"var(--surface)",border:"1px solid "+(sel===item.state?"var(--border2)":"var(--border)"),borderRadius:9,cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}>
              <span style={{fontFamily:"var(--font-m)",fontSize:11,color:"var(--t3)",width:22,flexShrink:0}}>{i+1}</span>
              <span style={{flex:1,fontSize:12,fontWeight:600,color:"var(--t1)"}}>{item.state}</span>
              <div style={{width:80,height:4,background:"rgba(255,255,255,0.05)",borderRadius:99,overflow:"hidden",flexShrink:0}}>
                <div style={{height:"100%",borderRadius:99,background:col,width:item.score+"%"}}/>
              </div>
              <span style={{fontFamily:"var(--font-m)",fontSize:12,fontWeight:700,color:col,width:28,textAlign:"right",flexShrink:0}}>{item.score}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SubmitPage({onSubmit,toast}){
  const[form,setForm]=useState({headline:"",body:"",state:"",source:"citizen_unverified",scope:"local"});
  const handle=()=>{
    if(!form.headline.trim()){toast("Please enter a headline","error");return;}
    onSubmit(form);setForm({headline:"",body:"",state:"",source:"citizen_unverified",scope:"local"});
    toast("Report submitted for review","success");
  };
  return(
    <div className="fade-up" style={{maxWidth:580}}>
      <div style={{marginBottom:18}}>
        <h2 style={{fontFamily:"var(--font-h)",fontSize:"clamp(18px,3vw,22px)",fontWeight:800,color:"var(--t1)",marginBottom:4}}>+ Submit Report</h2>
        <p style={{fontSize:12,color:"var(--t2)"}}>Document a constitutional rights concern or democratic event.</p>
      </div>
      <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,padding:"20px"}}>
        {[{k:"headline",label:"Headline *",type:"input",ph:"Brief description of the event"},{k:"body",label:"Details",type:"textarea",ph:"Additional context..."}].map(f=>(
          <div key={f.k} style={{marginBottom:14}}>
            <label style={{fontSize:10,color:"var(--t3)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:5}}>{f.label}</label>
            {f.type==="textarea"?
              <textarea value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph} rows={3} style={{width:"100%",padding:"9px 12px",borderRadius:9,border:"1px solid var(--border2)",background:"var(--surface2)",color:"var(--t1)",fontSize:12,outline:"none",resize:"vertical"}}/>:
              <input value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph} style={{width:"100%",padding:"9px 12px",borderRadius:9,border:"1px solid var(--border2)",background:"var(--surface2)",color:"var(--t1)",fontSize:12,outline:"none"}}/>
            }
          </div>
        ))}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
          <div>
            <label style={{fontSize:10,color:"var(--t3)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:5}}>Scope</label>
            <select value={form.scope} onChange={e=>setForm(p=>({...p,scope:e.target.value}))} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:"1px solid var(--border2)",background:"var(--surface2)",color:"var(--t1)",fontSize:11,outline:"none"}}>
              <option value="national">National</option>
              <option value="state">State</option>
              <option value="local">Local</option>
            </select>
          </div>
          <div>
            <label style={{fontSize:10,color:"var(--t3)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:5}}>State</label>
            <select value={form.state} onChange={e=>setForm(p=>({...p,state:e.target.value}))} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:"1px solid var(--border2)",background:"var(--surface2)",color:"var(--t1)",fontSize:11,outline:"none"}}>
              <option value="">All India</option>
              {Object.keys(STATE_BASELINES).sort().map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{fontSize:10,color:"var(--t3)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:5}}>Source</label>
            <select value={form.source} onChange={e=>setForm(p=>({...p,source:e.target.value}))} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:"1px solid var(--border2)",background:"var(--surface2)",color:"var(--t1)",fontSize:11,outline:"none"}}>
              <option value="citizen_unverified">Citizen</option>
              <option value="single_source">Single Source</option>
              <option value="corroborated">Corroborated</option>
              <option value="verified">Verified</option>
            </select>
          </div>
        </div>
        <button onClick={handle} style={{padding:"10px 22px",borderRadius:9,border:"none",background:"var(--blue)",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>Submit Report</button>
      </div>
    </div>
  );
}

function ReviewPage({stories,onReview}){
  const pending=stories.filter(s=>!s.approved&&!s.held);
  const held=stories.filter(s=>s.held);
  return(
    <div className="fade-up">
      <div style={{marginBottom:18}}>
        <h2 style={{fontFamily:"var(--font-h)",fontSize:"clamp(18px,3vw,22px)",fontWeight:800,color:"var(--t1)",marginBottom:4}}>◻ Review Queue</h2>
      </div>
      {pending.length===0&&held.length===0&&<div style={{textAlign:"center",padding:"40px 20px",color:"var(--t2)"}}>No items pending review</div>}
      {pending.length>0&&<div style={{marginBottom:20}}><div style={{fontSize:12,fontWeight:700,color:"var(--amber)",marginBottom:10}}>⏳ Pending ({pending.length})</div>{pending.map(s=><StoryCard key={s.id} s={s} onReview={onReview}/>)}</div>}
      {held.length>0&&<div><div style={{fontSize:12,fontWeight:700,color:"var(--t2)",marginBottom:10}}>Held ({held.length})</div>{held.map(s=><StoryCard key={s.id} s={s} onReview={onReview}/>)}</div>}
    </div>
  );
}

function MethodPage(){
  const items=[
    {title:"Score Engine",desc:"wDelta = score_delta × source_weight × recency_decay × pillar_weight × pattern_multiplier. National score = BASE(41) + sum of all weighted deltas."},
    {title:"Source Weights",desc:"Verified=1.0 · Corroborated=0.8 · Single Source=0.5 · Citizen Unverified=0.3. Higher quality sources have greater scoring impact."},
    {title:"Pillar Weights",desc:"Press Freedom=1.2 · Liberty=1.2 · Equality=1.1 · Electoral=1.0 · Other=0.9. Press freedom and liberty violations are weighted heavier."},
    {title:"Pattern Multipliers",desc:"Isolated×1.0 · Emerging×1.15 · Repeated×1.3 · Systemic×1.5. Patterns that recur amplify the democratic damage score."},
    {title:"AI Enhancement",desc:"Claude AI reviews each story to verify classification, add constitutional analysis, and generate Mythos — a narrative connecting the event to democratic principles."},
    {title:"External Calibration",desc:"Base score anchored to Freedom House (63/100), V-Dem Rank (100/179), RSF Press Freedom (151/180), and EIU Democracy Index (6.6/10)."},
    {title:"Coverage",desc:"All 28 Indian States plus Delhi and J&K Union Territories. News fetched at National, State, and Local scope levels for complete coverage."},
  ];
  return(
    <div className="fade-up" style={{maxWidth:660}}>
      <div style={{marginBottom:18}}><h2 style={{fontFamily:"var(--font-h)",fontSize:"clamp(18px,3vw,22px)",fontWeight:800,color:"var(--t1)",marginBottom:4}}>◈ Methodology</h2></div>
      {items.map((item,i)=>(
        <div key={i} style={{padding:"16px 18px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,marginBottom:8}}>
          <div style={{fontSize:13,fontWeight:700,color:"var(--t1)",marginBottom:5}}>{item.title}</div>
          <div style={{fontSize:12,color:"var(--t2)",lineHeight:1.7}}>{item.desc}</div>
        </div>
      ))}
    </div>
  );
}

function AboutPage(){
  return(
    <div className="fade-up" style={{maxWidth:600}}>
      <div style={{marginBottom:18}}><h2 style={{fontFamily:"var(--font-h)",fontSize:"clamp(18px,3vw,22px)",fontWeight:800,color:"var(--t1)",marginBottom:4}}>ℹ About DTN Mythos</h2></div>
      <div style={{padding:"20px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,marginBottom:12}}>
        <p style={{fontSize:13,color:"var(--t2)",lineHeight:1.9,marginBottom:12}}>DTN Mythos is an open civic platform tracking India's constitutional health in real-time across all 28 states and union territories. We use AI-assisted journalism, local constitutional classifiers, and transparent scoring to make democracy legible.</p>
        <p style={{fontSize:13,color:"var(--t2)",lineHeight:1.9}}>Our mission: bridge the gap between constitutional law and lived experience — making it easy for every Indian citizen to understand how democratic norms are being upheld or eroded, in their state, in their occupation, in their daily life.</p>
      </div>
      <div style={{padding:"14px 18px",background:"var(--blue-s)",border:"1px solid rgba(79,142,247,0.2)",borderRadius:12}}>
        <div style={{fontSize:11,color:"var(--blue)",fontWeight:700,marginBottom:5}}>LEGAL NOTICE</div>
        <p style={{fontSize:11,color:"var(--t2)",lineHeight:1.7,margin:0}}>DTN Mythos is an independent civic tech platform. All scores are analytical estimates based on publicly available information. This platform does not provide legal advice. For emergencies: NALSA (15100) or NHRC (14433).</p>
      </div>
    </div>
  );
}

// ── MAIN APP ───────────────────────────────────────────────────
const MOBILE_NAV=[
  {id:"dashboard",icon:"◉",label:"Home"},
  {id:"feed",icon:"⚡",label:"Feed"},
  {id:"rights",icon:"🛡",label:"Rights"},
  {id:"states",icon:"◱",label:"States"},
  {id:"submit",icon:"+",label:"Submit"},
];

export default function App(){
  const[page,setPage]=useState("dashboard");
  const[stories,setStories]=useState(()=>{try{const d=window.storage?.getItem(SK);return d?JSON.parse(d):SEED_STORIES;}catch{return SEED_STORIES;}});
  const[scope,setScope]=useState(()=>{try{const d=window.storage?.getItem("dtn_scope_v3");return d?JSON.parse(d):{state:"Gujarat",occupation:"General Citizen"};}catch{return{state:"Gujarat",occupation:"General Citizen"};}});
  const[natHistory,setNatHistory]=useState([]);
  const[fetching,setFetching]=useState(false);
  const[autoOn,setAutoOn]=useState(false);
  const[rl,setRlState]=useState(false);
  const[fetchScope,setFetchScope]=useState("national");
  const[fetchState,setFetchState]=useState("Gujarat");
  const[fetchDistrict,setFetchDistrict]=useState("");
  const[countdown,setCountdown]=useState(60);
  const{toasts,add:toast}=useToasts();
  const autoRef=useRef(null);
  const countRef=useRef(null);

  const score=useMemo(()=>calcNat(stories),[stories]);

  useEffect(()=>{
    setNatHistory(p=>{
      const label=new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short"});
      const last=p[p.length-1];
      if(last&&last.score===score&&last.label===label)return p;
      return[...p,{label,score}].slice(-30);
    });
  },[score]);

  useEffect(()=>{try{window.storage?.setItem(SK,JSON.stringify(stories));}catch{}},[stories]);
  useEffect(()=>{try{window.storage?.setItem("dtn_scope_v3",JSON.stringify(scope));}catch{}},[scope]);

  const runUpgrades=useCallback(async(list)=>{
    const todo=list.filter(s=>s.approved&&!s.aiDone&&!isRL());
    for(let i=0;i<todo.length;i++){
      if(isRL())break;
      const upgraded=await aiUpgrade(todo[i]);
      setStories(p=>p.map(s=>s.id===upgraded.id?upgraded:s));
      if(i<todo.length-1)await new Promise(r=>setTimeout(r,8000));
    }
  },[]);

  const doFetch=useCallback(async()=>{
    if(fetching)return;
    setFetching(true);
    const scopeLabel=fetchScope==="state"?fetchState:fetchScope==="district"?fetchDistrict||"district":fetchScope;
    toast("Fetching "+scopeLabel+" news...","info");
    try{
      const items=await fetchNews(fetchScope,fetchState,fetchDistrict);
      if(isRL()){setRlState(true);setTimeout(()=>setRlState(false),66000);toast("Rate limited — retry in 65s","error");return;}
      if(!items.length){toast("No new stories found","info");return;}
      const newStories=items.map((item,i)=>{
        const cls=localClassify(item.headline,item.body||"");
        const id="F"+Date.now()+i;
        const fw=firewall({...cls,confidence:0.55});
        return{id,ts:Date.now(),headline:item.headline,body:item.body||"",state:item.state||null,scope:fetchScope,...cls,approved:fw.pass,held:!fw.pass,aiDone:false};
      });
      setStories(p=>{
        const ids=new Set(p.map(s=>s.headline.slice(0,40)));
        const unique=newStories.filter(s=>!ids.has(s.headline.slice(0,40)));
        return[...unique,...p];
      });
      toast("Fetched "+newStories.length+" stories","success");
      setTimeout(()=>runUpgrades(newStories.filter(s=>s.approved)),3000);
    }finally{setFetching(false);}
  },[fetching,fetchScope,fetchState,runUpgrades,toast]);

  // Auto-fetch every 60 seconds with smooth countdown
  useEffect(()=>{
    if(autoOn){
      setCountdown(60);
      countRef.current=setInterval(()=>{
        setCountdown(c=>{
          if(c<=1){doFetch();return 60;}
          return c-1;
        });
      },1000);
      return()=>clearInterval(countRef.current);
    }else{
      clearInterval(countRef.current);
      setCountdown(60);
    }
  },[autoOn,doFetch]);

  const handleReview=useCallback((id,action)=>{
    setStories(p=>p.map(s=>s.id===id?{...s,approved:action==="approve",held:action==="hold"}:s));
    toast(action==="approve"?"Story approved":"Story "+action+"ed","success");
  },[toast]);

  const handleSubmit=useCallback((form)=>{
    const cls=localClassify(form.headline,form.body);
    const id="C"+Date.now();
    setStories(p=>[{id,ts:Date.now(),headline:form.headline,body:form.body,state:form.state||null,scope:form.scope,...cls,source:form.source,approved:false,held:false,aiDone:false},...p]);
  },[]);

  const pending=stories.filter(s=>!s.approved&&!s.held).length;

  return(
    <div className="shell">
      <Sidebar page={page} setPage={setPage} pendingCount={pending}/>
      <div className="main-area">
        <Topbar score={score} fetching={fetching} onFetch={doFetch} autoOn={autoOn} setAutoOn={setAutoOn} rl={rl} fetchScope={fetchScope} setFetchScope={setFetchScope} fetchState={fetchState} setFetchState={setFetchState} fetchDistrict={fetchDistrict} setFetchDistrict={setFetchDistrict}/>
        <LiveTicker stories={stories} countdown={countdown} autoOn={autoOn} fetchScope={fetchScope}/>
        <main className="page">
          {page==="dashboard"&&<Dashboard score={score} stories={stories} natHistory={natHistory}/>}
          {page==="feed"&&<FeedPage stories={stories} fetching={fetching} onFetch={doFetch} onAI={()=>runUpgrades(stories)} fetchScope={fetchScope} setFetchScope={setFetchScope} countdown={countdown} autoOn={autoOn}/>}
          {page==="rights"&&<MyRightsPage scope={scope} setScope={setScope}/>}
          {page==="patterns"&&<PatternsPage stories={stories}/>}
          {page==="timeline"&&<TimelinePage stories={stories} natHistory={natHistory}/>}
          {page==="constitution"&&<ConstitutionPage/>}
          {page==="score"&&<ScorePage score={score} stories={stories} natHistory={natHistory}/>}
          {page==="anomalies"&&<AnomaliesPage stories={stories}/>}
          {page==="states"&&<StatesPage stories={stories}/>}
          {page==="submit"&&<SubmitPage onSubmit={handleSubmit} toast={toast}/>}
          {page==="review"&&<ReviewPage stories={stories} onReview={handleReview}/>}
          {page==="method"&&<MethodPage/>}
          {page==="about"&&<AboutPage/>}
        </main>
      </div>
      <nav className="mobile-nav">
        {MOBILE_NAV.map(item=>(
          <button key={item.id} className={"mobile-nav-btn"+(page===item.id?" active":"")} onClick={()=>setPage(item.id)}>
            <span className="m-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      <Toasts toasts={toasts}/>
    </div>
  );
}