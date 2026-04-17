// ═══════════════════════════════════════════════════════════
// DTN MYTHOS — Constitutional Awareness & Data Transparency System
// PRODUCTION READY — Steps A–T integrated
// Local Constitutional Classifier · Mythos Engine · Firewall
// Toast Notifications · Persistent Scope · Retry Logic
// Auto-Polling · Share Card · Transparency Page · Legal Shield
// ═══════════════════════════════════════════════════════════
import{useState,useEffect,useCallback,useRef,useMemo}from"react";
import{AreaChart,Area,LineChart,Line,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,RadarChart,Radar,PolarGrid,PolarAngleAxis}from"recharts";

// ── YOUR API KEY — PASTE IT HERE ─────────────────────────────
// Get your key from: https://console.anthropic.com
const ANTHROPIC_API_KEY = "YOUR_API_KEY_HERE";
const API_HEADERS = {"Content-Type":"application/json","x-api-key":ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"};
// ─────────────────────────────────────────────────────────────

// ── CONSTANTS ────────────────────────────────────────────────
const PATTERN_CLASSES={isolated:{label:"Isolated",color:"#64748b",dot:"○",bg:"rgba(100,116,139,0.1)",mult:1.0},emerging:{label:"Emerging Pattern",color:"#f59e0b",dot:"◔",bg:"rgba(245,158,11,0.1)",mult:1.15},repeated:{label:"Repeated Pattern",color:"#f97316",dot:"◑",bg:"rgba(249,115,22,0.1)",mult:1.3},systemic:{label:"Systemic Pattern",color:"#ef4444",dot:"●",bg:"rgba(239,68,68,0.1)",mult:1.5}};
const CIVIC_RISK={critical:{color:"#ef4444",label:"Critical"},high:{color:"#f97316",label:"High"},medium:{color:"#f59e0b",label:"Medium"},low:{color:"#22c55e",label:"Low"}};
const INST={police:"🚔 Police",judiciary:"⚖️ Judiciary",parliament:"🏛️ Parliament",executive:"🏢 Executive",ec:"🗳️ Election Comm.",media:"📰 Media"};

const CA={
  "Preamble":{t:"Sovereign Secular Democratic Republic",s:"India — sovereign, socialist, secular, democratic republic — securing justice, liberty, equality and fraternity.",c:"#fbbf24"},
  "Art.14":{t:"Equality Before Law",s:"State shall not deny to any person equality before law or equal protection of laws.",c:"#6366f1"},
  "Art.15":{t:"No Discrimination",s:"State shall not discriminate only on grounds of religion, race, caste, sex, or place of birth.",c:"#8b5cf6"},
  "Art.17":{t:"Abolition of Untouchability",s:"Untouchability is abolished. Its practice in any form is forbidden.",c:"#c084fc"},
  "Art.19(1)(a)":{t:"Freedom of Speech & Press",s:"All citizens shall have the right to freedom of speech and expression.",c:"#f97316"},
  "Art.19(1)(b)":{t:"Right to Peaceful Assembly",s:"All citizens shall have the right to assemble peaceably and without arms.",c:"#fb923c"},
  "Art.21":{t:"Right to Life & Liberty",s:"No person shall be deprived of life or personal liberty except by procedure established by law.",c:"#ef4444"},
  "Art.21A":{t:"Right to Education",s:"State shall provide free and compulsory education to children 6–14 years.",c:"#fca5a5"},
  "Art.22":{t:"Protection Against Arbitrary Arrest",s:"Arrested person must be informed of grounds; produced before magistrate within 24 hours.",c:"#f87171"},
  "Art.23":{t:"Prohibition of Forced Labour",s:"Traffic in human beings and begar and all similar forced labour are prohibited.",c:"#fbbf24"},
  "Art.25":{t:"Freedom of Religion",s:"All persons are equally entitled to freedom of conscience and right to profess religion.",c:"#ec4899"},
  "Art.26":{t:"Religious Denomination Autonomy",s:"Religious denominations have right to manage own religious affairs and property.",c:"#f472b6"},
  "Art.29":{t:"Minority Cultural Rights",s:"Any section of citizens having distinct language, script or culture has right to conserve the same.",c:"#c084fc"},
  "Art.30":{t:"Minority Educational Rights",s:"All minorities have right to establish and administer educational institutions.",c:"#e879f9"},
  "Art.32":{t:"Right to Constitutional Remedies",s:"Right to move Supreme Court for enforcement of Fundamental Rights.",c:"#22c55e"},
  "Art.39":{t:"Right to Livelihood",s:"Citizens have right to adequate means of livelihood; equal pay for equal work.",c:"#86efac"},
  "Art.39A":{t:"Free Legal Aid",s:"State shall ensure legal system promotes justice on equal opportunity basis.",c:"#bbf7d0"},
  "Art.46":{t:"Protection of Weaker Sections",s:"State shall promote educational/economic interests of SC, ST and weaker sections.",c:"#a5f3fc"},
  "Art.82":{t:"Delimitation After Census",s:"Upon completion of each census, readjustment of allocation of seats shall be made.",c:"#60a5fa"},
  "Art.124":{t:"Establishment of Supreme Court",s:"There shall be a Supreme Court of India; judges appointed by President.",c:"#14b8a6"},
  "Art.141":{t:"SC Law Binding on All Courts",s:"Law declared by Supreme Court shall be binding on all courts within India.",c:"#5eead4"},
  "Art.226":{t:"HC Writ Jurisdiction",s:"Every High Court has power to issue writs including habeas corpus.",c:"#86efac"},
  "Art.239":{t:"Administration of Union Territories",s:"Every UT shall be administered by the President through an Administrator.",c:"#d1fae5"},
  "Art.300A":{t:"Right to Property",s:"No person shall be deprived of property save by authority of law.",c:"#fbbf24"},
  "Art.324":{t:"Election Commission Independence",s:"Superintendence, direction and control of elections vested in the Election Commission.",c:"#f59e0b"},
  "Art.326":{t:"Universal Adult Suffrage",s:"Elections on basis of adult suffrage — every person 18+ entitled to vote.",c:"#d97706"},
  "Art.355":{t:"Union's Duty to Protect States",s:"Union shall protect every State against external aggression and internal disturbance.",c:"#92400e"},
  "Art.368":{t:"Power to Amend the Constitution",s:"Parliament may amend any provision by 2/3 majority of members present and voting in each House.",c:"#dc2626"},
  "5th Sch":{t:"Tribal Areas Administration",s:"Special protections for Scheduled Areas and Scheduled Tribes.",c:"#047857"},
  "10th Sch":{t:"Anti-Defection Law",s:"Disqualification of Parliament/State Legislature members on grounds of defection.",c:"#991b1b"},
  "7th Sch":{t:"Division of Powers",s:"Union List (97), State List (66), Concurrent List (47) entries define legislative jurisdiction.",c:"#7f1d1d"},
};

const PILLARS={press_freedom:{label:"Press Freedom",article:"Art.19(1)(a)",color:"#f97316",base:22,weight:1.2},liberty:{label:"Right to Liberty",article:"Art.21",color:"#ef4444",base:35,weight:1.2},equality:{label:"Equality",article:"Art.14–15",color:"#8b5cf6",base:32,weight:1.1},electoral:{label:"Electoral Integrity",article:"Art.324",color:"#3b82f6",base:48,weight:1.0},separation:{label:"Separation of Powers",article:"Art.50",color:"#14b8a6",base:43,weight:0.9},religion:{label:"Religious Freedom",article:"Art.25–28",color:"#ec4899",base:28,weight:1.0},justice:{label:"Access to Justice",article:"Art.32",color:"#22c55e",base:45,weight:0.9}};

const STATE_BASELINES={"Kerala":64,"Tamil Nadu":59,"Sikkim":57,"Himachal Pradesh":53,"Karnataka":55,"Punjab":50,"Telangana":49,"Odisha":47,"Andhra Pradesh":45,"Rajasthan":44,"Jharkhand":43,"West Bengal":39,"Bihar":38,"Delhi":41,"Maharashtra":40,"Haryana":37,"Goa":40,"Madhya Pradesh":38,"Chhattisgarh":34,"Gujarat":35,"J&K":30,"Assam":29,"Uttar Pradesh":26,"Manipur":17};

const STATE_ENV={"Uttar Pradesh":{topIssues:["Bulldozer demolitions","UAPA misuse","3 journalist murders 18 months","Sambhal violence 5 killed"],worstFor:["Muslims","Dalits","Journalists"],missingRights:["Art.14","Art.19(1)(a)","Art.21","Art.22","Art.300A"],helplines:["DLSA Lucknow: 0522-2615547","NHRC: 14433"]},"Manipur":{topIssues:["Ethnic war 200+ dead ongoing 2026","60,000+ displaced","400+ churches burned"],worstFor:["Kuki-Zo Christians","Journalists"],missingRights:["Art.21","Art.14","Art.19(1)(a)","Art.29","Art.355"],helplines:["NALSA: 15100","NHRC: 14433"]},"Assam":{topIssues:["NRC 1.9M stateless","CAA two-tier citizenship","4 journalist arrests"],worstFor:["Muslims excluded from NRC","Journalists"],missingRights:["Art.14","Art.15","Art.21","Art.19(1)(a)"],helplines:["Gauhati HC Legal Aid: 0361-2345634","NHRC: 14433"]},"Chhattisgarh":{topIssues:["Journalist Mukesh Chandrakar murdered Jan 2025","52,000+ adivasis displaced Hasdeo"],worstFor:["Adivasi communities","Journalists"],missingRights:["Art.21","Art.19(1)(a)","5th Sch"],helplines:["DLSA Raipur: 0771-2513777","NHRC: 14433"]},"Gujarat":{topIssues:["Bilkis Bano convicts recalled by SC","AMC demolitions 400+ Muslim families"],worstFor:["Muslims","Independent journalists"],missingRights:["Art.14","Art.300A","Art.19(1)(a)"],helplines:["Gujarat Legal Aid: 079-23254770","NHRC: 14433"]},"Haryana":{topIssues:["Nuh: 1,200 Muslim homes bulldozed","Disputed 2024 election"],worstFor:["Muslim minority — Mewat"],missingRights:["Art.14","Art.324","Art.300A"],helplines:["HSLSA Chandigarh: 0172-2749590","NHRC: 14433"]},"Bihar":{topIssues:["3rd highest SC/ST atrocity rate conviction <5%","MGNREGA underpayment"],worstFor:["Dalits in rural areas"],missingRights:["Art.17","Art.39","Art.46"],helplines:["BSLSA Patna: 0612-2217856","NHRC: 14433"]},"West Bengal":{topIssues:["Post-election violence","SSC job scam 25,000 cancelled by SC"],worstFor:["BJP supporters rural","SSC job seekers"],missingRights:["Art.19(1)(a)","Art.14"],helplines:["WBSLSA Kolkata: 033-22145163","NHRC: 14433"]},"Maharashtra":{topIssues:["Anti-defection law nullified by Shinde faction","ED misuse"],worstFor:["Opposition parties"],missingRights:["10th Sch","Art.326"],helplines:["MSLSA Mumbai: 022-22654099","NHRC: 14433"]},"Delhi":{topIssues:["CM Kejriwal arrested by ED pre-election","Air quality 168 days unsafe"],worstFor:["AAP supporters","Poor in polluted areas"],missingRights:["Art.21","Art.239","Art.326"],helplines:["DSLSA: 011-23093512","NHRC: 14433"]},"Madhya Pradesh":{topIssues:["Anti-conversion laws","Adivasi displacement"],worstFor:["Religious minorities","Tribal communities"],missingRights:["Art.25","5th Sch"],helplines:["MPSLSA Jabalpur: 0761-2621424","NHRC: 14433"]},"Rajasthan":{topIssues:["Democratic alternation BJP 2023","Rural SC/ST atrocities"],missingRights:["Art.17","Art.14"],helplines:["RSLSA Jaipur: 0141-2225527","NHRC: 14433"]},"Jharkhand":{topIssues:["CM Hemant Soren arrested pre-election","Adivasi land rights"],worstFor:["Adivasi communities"],missingRights:["Art.21","5th Sch"],helplines:["JSLSA Ranchi: 0651-2332250","NHRC: 14433"]},"Punjab":{topIssues:["Drug addiction epidemic","Farmers march 2024 stopped teargas"],worstFor:["Indebted farmers"],missingRights:["Art.21","Art.41"],helplines:["PSLSA Chandigarh: 0172-2546756","NHRC: 14433"]},"Karnataka":{topIssues:["Some ED bureau cases","Coastal Hindu-Muslim tensions"],missingRights:[],helplines:["KSLSA Bengaluru: 080-22861133","NHRC: 14433"]},"Telangana":{topIssues:["Post-BRS Congress transition","Farmer suicides"],missingRights:["Art.300A"],helplines:["TSLSA Hyderabad: 040-23450013","NHRC: 14433"]},"Tamil Nadu":{topIssues:["Delimitation bill existential threat","Caste violence rural areas"],worstFor:["Dalits in rural areas"],missingRights:["Art.17"],helplines:["TNSLSA Chennai: 044-25384000","NHRC: 14433"]},"Kerala":{topIssues:["Centre-state fiscal discrimination Art.131 filed","Some ED/CBI cases"],missingRights:[],helplines:["KSLSA Ernakulam: 0484-2397126","NHRC: 14433"]},"Himachal Pradesh":{topIssues:["State debt crisis","Apple farmer distress"],missingRights:[],helplines:["HPSLSA Shimla: 0177-2621004","NHRC: 14433"]},"Odisha":{topIssues:["BJD ousted 2024 democratic transition","Adivasi rights mining districts"],missingRights:["5th Sch"],helplines:["OSLSA Cuttack: 0671-2305250","NHRC: 14433"]},"J&K":{topIssues:["UT statehood denied","PSA 320+ detentions 2025","LG overrides elected govt"],worstFor:["Journalists","Political activists"],missingRights:["Art.21","Art.19(1)(a)","Art.239"],helplines:["J&K SLSA: 0194-2485832","NHRC: 14433"]},"Andhra Pradesh":{topIssues:["TDP-BJP 2024 transition","Polavaram displacement"],missingRights:["Art.300A"],helplines:["APSLSA: 0863-2348888","NHRC: 14433"]},"Goa":{topIssues:["Mass defections to BJP anti-defection nullified"],missingRights:["10th Sch","Art.21"],helplines:["GSLSA Panaji: 0832-2438908","NHRC: 14433"]},"Sikkim":{topIssues:["2023 floods recovery inequity","SDF ousted 2024 democratic alternation"],missingRights:[],helplines:["SLSA Gangtok: 03592-204052","NHRC: 14433"]}};

const OCC_RIGHTS={"Journalist":{rights:["Art.19(1)(a)","Art.21","Art.22"],gap:85,threats:["Arrest under UAPA/BNS-152","Criminal defamation","Physical attacks — 3 murdered 2024-25"],actions:["Document arrest or detention details immediately","Contact press bodies and legal aid within 24 hours","Preserve video, notices, and witness accounts","File writ remedies if unlawful detention is suspected"],helplines:["Press Club India: 011-23379161","RSF India support","NHRC: 14433"]},"Farmer":{rights:["Art.39","Art.41","Art.43","Art.21"],gap:65,threats:["Debt crisis 12,000+ suicides/yr","MSP non-statutory","Land acquisition without fair process"],actions:["Preserve land, compensation, and protest documents","Use RTI for acquisition or compensation records"],helplines:["Kisan Call Centre: 1800-180-1551","NALSA: 15100"]},"Tribal/Adivasi":{rights:["Art.21","5th Sch","Art.29","Art.46"],gap:80,threats:["Mining displacement without consent","PESA violations","Forest rights denial"],actions:["Collect Gram Sabha, FRA, and land records","Document any displacement or consent violations"],helplines:["NALSA: 15100","NHRC: 14433"]},"Dalit (SC)":{rights:["Art.17","Art.14","Art.15","Art.46"],gap:72,threats:["Atrocities 50,000+/yr NCRB","Manual scavenging still occurring"],actions:["Document atrocity incidents and witness details","Use SC/ST Act complaint channels"],helplines:["SC/ST Commission: 011-23381202","NHRC: 14433"]},"Muslim Minority":{rights:["Art.14","Art.15","Art.25","Art.26","Art.29","Art.30"],gap:75,threats:["CAA religion-based exclusion","Bulldozer demolitions","UAPA disproportionate use"],actions:["Document notices, demolitions, or discriminatory treatment","Preserve property and identity records"],helplines:["National Minority Commission: 011-23517473","NHRC: 14433"]},"Christian Minority":{rights:["Art.25","Art.26","Art.29","Art.30","Art.14"],gap:60,threats:["Anti-conversion laws in 10+ states","Church attacks"],actions:["Document attacks on places of worship","Seek immediate legal and community support"],helplines:["National Minority Commission: 011-23517473","NHRC: 14433"]},"Woman":{rights:["Art.14","Art.15","Art.16","Art.21","Art.39"],gap:60,threats:["Gender-based violence","Workplace discrimination"],actions:["Preserve medical, workplace, and police records","Use women's helplines and district legal aid"],helplines:["Women Helpline: 181","NCW: 011-26942369","NHRC: 14433"]},"Student":{rights:["Art.21A","Art.21","Art.19(1)(a)","Art.19(1)(b)"],gap:50,threats:["UAPA on activists","Campus surveillance"],actions:["Document disciplinary notices and speech restrictions","Use RTI and writ remedies when needed"],helplines:["Student helpline: 8800-899-588","NALSA: 15100"]},"Worker/Labourer":{rights:["Art.23","Art.39","Art.41","Art.43"],gap:65,threats:["Minimum wage violations","MGNREGA underpayment"],actions:["Document wage records, coercion, and labour conditions","Escalate forced labour or non-payment quickly"],helplines:["Labour helpline: 1800-11-2228","NALSA: 15100"]},"General Citizen":{rights:["Art.14","Art.21","Art.19(1)(a)","Art.32"],gap:50,threats:["Administrative overreach","Corruption","Arbitrary detention"],actions:["Document notices, detentions, and threats early","Use district legal aid and human rights channels"],helplines:["NHRC: 14433","NALSA: 15100"]}};

const STATES_LIST=Object.keys(STATE_ENV).sort();
const DISTRICTS={"Uttar Pradesh":["Lucknow","Kanpur","Varanasi","Agra","Meerut","Gorakhpur","Prayagraj","Sambhal","Hathras","Noida"],"Gujarat":["Ahmedabad","Surat","Vadodara","Rajkot","Gandhinagar"],"Maharashtra":["Mumbai","Pune","Nagpur","Nashik","Thane"],"Tamil Nadu":["Chennai","Coimbatore","Madurai","Salem","Tiruchirappalli"],"Karnataka":["Bengaluru","Mysuru","Hubli","Mangaluru","Belagavi"],"West Bengal":["Kolkata","Howrah","Darjeeling","Siliguri","Malda"],"Manipur":["Imphal West","Imphal East","Churachandpur","Bishnupur","Thoubal"],"Kerala":["Thiruvananthapuram","Ernakulam","Kozhikode","Thrissur","Palakkad"],"Assam":["Kamrup Metro","Silchar","Dibrugarh","Jorhat","Nagaon"],"Punjab":["Chandigarh","Amritsar","Ludhiana","Jalandhar","Patiala"],"Delhi":["New Delhi","North Delhi","South Delhi","East Delhi","Central Delhi"],"Rajasthan":["Jaipur","Jodhpur","Udaipur","Kota","Ajmer"],"Bihar":["Patna","Gaya","Muzaffarpur","Bhagalpur","Darbhanga"],"Madhya Pradesh":["Bhopal","Indore","Jabalpur","Gwalior","Rewa"],"Chhattisgarh":["Raipur","Bilaspur","Durg","Korba","Bijapur"],"Jharkhand":["Ranchi","Dhanbad","Jamshedpur","Bokaro","Hazaribagh"],"Odisha":["Bhubaneswar","Cuttack","Rourkela","Sambalpur","Puri"],"Haryana":["Chandigarh","Gurugram","Faridabad","Ambala","Rohtak","Nuh"],"Andhra Pradesh":["Visakhapatnam","Vijayawada","Guntur","Nellore","Kurnool"],"Telangana":["Hyderabad","Warangal","Nizamabad","Khammam","Karimnagar"],"J&K":["Srinagar","Jammu","Anantnag","Baramulla","Pulwama"],"Goa":["Panaji","Margao","Vasco da Gama","Mapusa"],"Sikkim":["Gangtok","Namchi","Mangan","Gyalshing"]};

const BASE_SCORE=41,REF=new Date("2026-04-16");
const CONF_W={verified:1.0,corroborated:0.8,single_source:0.5,citizen_unverified:0.3};
const CAT_C={parliament:"#3b82f6",court:"#22c55e",ec:"#6366f1",govt:"#f97316",police:"#ef4444",press:"#ec4899",opposition:"#f59e0b",civil_liberty:"#14b8a6"};
const SCOPE_STORAGE_KEY="dtn_scope_v1";
const SK="dtn_prod_v1",SHK="dtn_prod_shared",AK="dtn_prod_audit";

// ── STEP E: LOCAL CONSTITUTIONAL CLASSIFIER ──────────────────
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
  else if(/opposition|politician/.test(txt))affected_group="politicians";
  if(/journalist.*(kill|murder|shot|dead|arrest|detain)|press freedom|uapa.*journalist|reporter.*arrest/.test(txt)){
    pillar="press_freedom";
    if(/kill|murder|shot|dead/.test(txt)){severity="critical";direction="negative";delta=-5;violations=[{a:"Art.21",h:"Journalist killed — state failure to protect life"},{a:"Art.19(1)(a)",h:"Murder suppresses investigative reporting"}];}
    else if(/arrest|detain/.test(txt)){severity="high";direction="negative";delta=-3;violations=[{a:"Art.19(1)(a)",h:"Journalist arrested — press freedom restricted"},{a:"Art.21",h:"Personal liberty compromised"},{a:"Art.22",h:"Detention safeguards may be bypassed"}];}
    else{severity="medium";direction="negative";delta=-2;violations=[{a:"Art.19(1)(a)",h:"Press freedom facing restrictions"}];}
  }
  else if(/uapa|psa|afspa|nsa |arbitrary arrest|detain|bail denied|custody death|encounter kill|extra.?judicial/.test(txt)){
    pillar="liberty";
    if(/kill|dead|death|murder/.test(txt)){severity="critical";direction="negative";delta=-5;violations=[{a:"Art.21",h:"Unlawful killing — right to life violated"},{a:"Art.22",h:"Killed in custody — due process abandoned"}];}
    else if(/uapa|psa/.test(txt)){severity="high";direction="negative";delta=-4;violations=[{a:"Art.21",h:"Pre-trial detention without conviction"},{a:"Art.22",h:"UAPA/PSA nullifies bail protections"},{a:"Art.14",h:"Discriminatory application of security law"}];}
    else{severity="high";direction="negative";delta=-3;violations=[{a:"Art.21",h:"Personal liberty restricted"},{a:"Art.22",h:"Arrest safeguards may have been bypassed"}];}
  }
  else if(/bulldozer|demolish|muslim.*home|minority.*attack|discriminat|caa|nrc|citizenship.*religion|communal/.test(txt)){
    pillar="equality";
    if(/bulldozer|demolish/.test(txt)){severity="critical";direction="negative";delta=-4;violations=[{a:"Art.14",h:"Targeted demolitions — discriminatory enforcement"},{a:"Art.300A",h:"Property demolished without conviction"},{a:"Art.21",h:"Families made homeless by extrajudicial punishment"}];}
    else if(/caa|nrc|citizenship.*religion/.test(txt)){severity="critical";direction="negative";delta=-5;violations=[{a:"Art.14",h:"Religion-based differential citizenship"},{a:"Art.15",h:"Explicit discrimination on grounds of religion"},{a:"Preamble",h:"Secular republic creating religion-based citizenship"}];}
    else{severity="high";direction="negative";delta=-3;violations=[{a:"Art.14",h:"Unequal treatment — equal protection denied"},{a:"Art.15",h:"Possible discrimination on protected grounds"}];}
  }
  else if(/election|ballot|vote|candidate|ec |election commission|delimitation|evm|booth|polling/.test(txt)){
    pillar="electoral";
    if(/rig|fraud|stuff|tamper/.test(txt)){severity="critical";direction="negative";delta=-5;violations=[{a:"Art.324",h:"Election administration compromised"},{a:"Art.326",h:"Universal adult suffrage undermined"}];}
    else if(/delimitation|seat|census/.test(txt)){severity="high";direction="negative";delta=-3;violations=[{a:"Art.82",h:"Delimitation may not follow constitutional process"},{a:"Art.326",h:"Seat allocation affects proportional representation"}];}
    else if(/result|won|victory|turnout|mandate/.test(txt)){severity="medium";direction="positive";delta=3;supports=[{a:"Art.326",h:"Democratic exercise of adult suffrage"},{a:"Art.324",h:"Elections conducted under EC oversight"}];}
    else{severity="medium";direction="neutral";delta=0;}
  }
  else if(/supreme court|high court|court order|judgment|ruling|quash|stay|bail granted|acquit|upheld/.test(txt)){
    pillar="justice";
    if(/quash|struck down|acquit|bail granted|relief|protected|upheld.*right|struck down/.test(txt)){severity="medium";direction="positive";delta=3;supports=[{a:"Art.32",h:"Constitutional remedy granted — judicial protection functioning"},{a:"Art.141",h:"Court ruling creates binding precedent"}];}
    else if(/bail denied|rejected.*petition/.test(txt)){severity="medium";direction="negative";delta=-2;violations=[{a:"Art.32",h:"Access to constitutional remedies restricted"},{a:"Art.21",h:"Liberty remains curtailed despite judicial process"}];}
    else{severity="low";direction="positive";delta=1;supports=[{a:"Art.32",h:"Judicial process functioning — constitutional oversight active"}];}
  }
  else if(/church|mosque|temple.*demolish|conversion.*law|anti-conversion|waqf|religious.*attack|riot.*communal/.test(txt)){
    pillar="religion";
    if(/attack|burn|demolish|destroy/.test(txt)){severity="critical";direction="negative";delta=-4;violations=[{a:"Art.25",h:"Freedom of religion under direct attack"},{a:"Art.26",h:"Religious denomination property attacked"},{a:"Art.14",h:"Minority community singled out"}];}
    else if(/anti-conversion|waqf.*amendment/.test(txt)){severity="high";direction="negative";delta=-3;violations=[{a:"Art.25",h:"Right to profess and propagate religion restricted"},{a:"Art.26",h:"Religious denomination autonomy encroached"}];}
    else{severity="medium";direction="negative";delta=-2;violations=[{a:"Art.25",h:"Freedom of religion and conscience at risk"}];}
  }
  else if(/adivasi|tribal.*displac|hasdeo|forest.*right|pesa|gram sabha.*reject|mining.*village/.test(txt)){
    pillar="equality";severity="high";direction="negative";delta=-3;
    violations=[{a:"5th Sch",h:"Tribal rights under 5th Schedule bypassed"},{a:"Art.21",h:"Displacement without consent violates right to life"},{a:"Art.300A",h:"Community forest and property rights overridden"}];
  }
  else if(/granted bail|relief granted|acquitted|court protects|sc upholds|hc order protect|free.*release|restored/.test(txt)){
    pillar="justice";severity="medium";direction="positive";delta=3;
    supports=[{a:"Art.32",h:"Constitutional remedy functioning — rights restored"},{a:"Art.21",h:"Right to liberty upheld by court"}];
  }
  else if(/right|constitution|fundamental|civil liberties|human rights|protest|demonstration/.test(txt)){
    pillar="justice";severity="low";direction="neutral";delta=0;
  }
  const category=institution==="police"?"police":institution==="judiciary"?"court":institution==="parliament"?"parliament":institution==="ec"?"ec":institution==="media"?"press":"govt";
  return{pillar,severity,direction,score_delta:delta,institution,affected_group,violations,supports,category};
}

// ── STEP N: FIREWALL ─────────────────────────────────────────
function computeConf(s){let c=0.45;if(["liberty","press_freedom","equality","electoral","justice"].includes(s.pillar))c+=0.10;if(["high","critical"].includes(s.severity))c+=0.10;if(s.institution)c+=0.06;if(s.affected_group)c+=0.06;if((s.violations||[]).length>0)c+=0.10;if((s.supports||[]).length>0)c+=0.05;if(s.source_conf==="verified")c+=0.08;else if(s.source_conf==="corroborated")c+=0.04;return Math.min(c,0.99);}
function firewallCheck(story){
  const conf=computeConf(story);const issues=[];
  if(Math.abs(story.score_delta||0)>6)issues.push("Delta exceeds ±6");
  if((story.violations||[]).length>3)issues.push("Exceeds 3 violation claims");
  if(story.direction==="neutral"&&(story.score_delta||0)!==0)issues.push("Neutral direction non-zero delta");
  if(!story.pillar||!PILLARS[story.pillar])issues.push("Unrecognised pillar");
  if(issues.length>0)return{decision:"hold",reason:issues.join("; "),confidence:conf,adjusted_delta:0};
  const hasSignal=(story.violations||[]).length>0||(story.supports||[]).length>0;
  if(!hasSignal)return{decision:"hold",reason:"No constitutional article signal found",confidence:conf,adjusted_delta:0};
  let adj=story.score_delta||0;if(conf<0.60)adj*=0.5;else if(conf<0.75)adj*=0.75;adj=Math.round(adj*100)/100;
  if(conf>=0.70)return{decision:"allow",reason:"Passed firewall — sufficient constitutional signal",confidence:conf,adjusted_delta:adj};
  if(conf>=0.55)return{decision:"allow_with_log",reason:"Moderate confidence — score reduced and logged",confidence:conf,adjusted_delta:adj};
  return{decision:"hold",reason:"Insufficient confidence for live approval",confidence:conf,adjusted_delta:adj};
}

// ── MYTHOS BUILDER ───────────────────────────────────────────
const DEM_CON={press_freedom:{neg:"Creates chilling effect on journalism — public visibility of state abuses narrows",pos:"Independent press strengthened — accountability improves"},liberty:{neg:"Normalises arbitrary detention — due process erodes",pos:"Right to liberty reaffirmed — constitutional detention standards upheld"},equality:{neg:"Deepens selective enforcement — minority confidence in rule of law erodes",pos:"Equal protection affirmed — institutional impartiality signals democratic health"},electoral:{neg:"Narrows democratic competition — effective voter choice weakened",pos:"Electoral integrity strengthened — democratic legitimacy grows"},separation:{neg:"Blurs institutional boundaries — constitutional accountability weakens",pos:"Institutional independence reinforced — checks and balances holding"},religion:{neg:"Increases minority insecurity — pluralism and coexistence weakened",pos:"Religious autonomy affirmed — pluralist constitutional order strengthened"},justice:{neg:"Reduces confidence in constitutional remedies — access to courts narrows",pos:"Judicial protection functioning — constitutional order affirmed"}};
function buildMythos(s){const dc=DEM_CON[s.pillar]||{neg:"Weakens democratic foundations",pos:"Strengthens democratic foundations"};const civic=s.severity==="critical"?"critical":s.severity==="high"?"high":s.severity==="medium"?"medium":"low";const pl=PILLARS[s.pillar]?.label||s.pillar;return{mythos_summary:`This event reflects ${s.direction==="positive"?"constitutional protection functioning":"constitutional stress"} in the area of ${pl}. ${s.direction==="negative"?"If such events repeat they may signal deeper institutional erosion.":"Consistent such protections strengthen public confidence."}`,pattern_status:"isolated",democratic_consequence:s.direction==="positive"?dc.pos:dc.neg,civic_risk:civic,short_public_explanation:s.direction==="negative"?`Your right to ${pl} may be under pressure from this event.`:`Constitutional protection is functioning in the area of ${pl}.`,long_research_explanation:`Classified under '${s.pillar}', severity '${s.severity}'. Institution: ${s.institution||"unknown"}. Affected group: ${s.affected_group||"general public"}.`,mythos_generated:true};}

// ── SCORE ENGINE ─────────────────────────────────────────────
const clamp=(v,a,b)=>Math.min(Math.max(v,a),b);
function wDelta(s){const cw=CONF_W[s.source_conf]||0.5;const days=(REF-new Date(s.ts))/86400000;const aw=Math.max(0.3,1-days*0.008);const pw=PILLARS[s.pillar]?.weight||1.0;const pm=PATTERN_CLASSES[s.pattern_status]?.mult||1.0;return(s.score_delta||0)*cw*aw*pw*pm;}
const calcNat=ss=>clamp(Math.round(BASE_SCORE+ss.filter(s=>s.review_status==="approved"&&s.level==="national").reduce((a,s)=>a+wDelta(s),0)),0,100);
const calcSt=(ss,st)=>clamp(Math.round((STATE_BASELINES[st]||BASE_SCORE)+ss.filter(s=>s.review_status==="approved"&&s.state===st).reduce((a,s)=>a+wDelta(s),0)),0,100);
const calcDist=(ss,st,d)=>{const loc=ss.filter(s=>s.review_status==="approved"&&s.state===st&&s.district===d);return loc.length?clamp(Math.round((STATE_BASELINES[st]||BASE_SCORE)+loc.reduce((a,s)=>a+wDelta(s),0)),0,100):calcSt(ss,st);};
const getBand=s=>{if(s>=80)return{c:"#22c55e",l:"Healthy Democracy",bg:"rgba(34,197,94,0.08)"};if(s>=60)return{c:"#eab308",l:"Working Democracy",bg:"rgba(234,179,8,0.08)"};if(s>=40)return{c:"#f97316",l:"Flawed Democracy",bg:"rgba(249,115,22,0.08)"};if(s>=20)return{c:"#ef4444",l:"Democratic Backsliding",bg:"rgba(239,68,68,0.08)"};return{c:"#dc2626",l:"Authoritarian Risk",bg:"rgba(220,38,38,0.1)"};};
function getScopedStories(stories,scope,state,district){const ap=stories.filter(s=>s.review_status==="approved");if(scope==="national")return ap.filter(s=>s.level==="national");if(scope==="state")return ap.filter(s=>s.state===state);if(scope==="local"){const l=ap.filter(s=>s.state===state&&s.district===district);return l.length?l:ap.filter(s=>s.state===state);}return ap;}
function calcPillars(stories,scope,state,district){const sc=getScopedStories(stories,scope,state,district);return Object.entries(PILLARS).map(([id,p])=>{const rel=sc.filter(s=>s.pillar===id);const w=rel.reduce((a,s)=>a+wDelta(s),0);return{id,label:p.label,article:p.article,color:p.color,count:rel.length,weighted:Math.round(w*10)/10,score:clamp(Math.round(p.base+(w*2)),0,100),neg:rel.filter(s=>s.direction==="negative").length,pos:rel.filter(s=>s.direction==="positive").length};});}
function detectPatterns(stories){const ap=stories.filter(s=>s.review_status==="approved");const groups={};ap.forEach(s=>{const k=`${s.pillar}::${s.state||"nat"}::${s.institution||"any"}`;if(!groups[k])groups[k]={key:k,pillar:s.pillar,state:s.state,institution:s.institution,affected_group:s.affected_group,stories:[]};groups[k].stories.push(s);});return Object.values(groups).map(g=>{const n=g.stories.length,neg=g.stories.filter(s=>s.direction==="negative").length,pc=n>=7?"systemic":n>=4?"repeated":n>=2?"emerging":"isolated";return{...g,event_count:n,negative_count:neg,pattern_class:pc,trend:neg>n/2?"worsening":"stable",pattern_score:Math.min(0.99,n*0.10+(neg/(n||1))*0.5),stories:g.stories.sort((a,b)=>new Date(b.ts)-new Date(a.ts))};}).filter(g=>g.event_count>=2).sort((a,b)=>b.pattern_score-a.pattern_score);}

// ── API LAYER ─────────────────────────────────────────────────
async function fetchWithRetry(fn,retries=3,delay=1500){for(let i=0;i<retries;i++){try{return await fn();}catch(e){if(i===retries-1)throw e;await new Promise(r=>setTimeout(r,delay*(i+1)));}}return null;}

async function fetchLiveNews(level,state,district){
  const scope=level==="local"?`${district}, ${state}`:level==="state"?state:"India";
  return fetchWithRetry(async()=>{
    const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:API_HEADERS,body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:3000,tools:[{type:"web_search_20250305",name:"web_search"}],messages:[{role:"user",content:`Search for today's real Indian political and constitutional news from April 16 2026 for ${scope}. Focus on: court orders, parliament, arrests, elections, rights violations, press freedom. Return ONLY this JSON (no markdown): {"stories":[{"headline":"...","body":"2-3 sentence summary","source":"Publication","published":"2026-04-16","state":"${state||"null"}","category":"court|police|parliament|govt|press|ec|civil_liberty"}]}. Find 5-8 real verifiable stories.`}]})});
    if(!res.ok)throw new Error(`API ${res.status}`);
    const d=await res.json();
    const txt=(d.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("\n");
    const match=txt.match(/\{[\s\S]*"stories"[\s\S]*\}/);
    if(!match)throw new Error("No JSON found");
    const parsed=JSON.parse(match[0]);
    return(parsed.stories||[]).filter(s=>s.headline&&s.headline.length>10);
  },3,2000);
}

async function aiUpgradeStory(story){
  return fetchWithRetry(async()=>{
    const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:API_HEADERS,body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:500,system:"You are India's Constitutional Review AI. Refine constitutional analysis of this news story. Return ONLY raw JSON, no markdown.",messages:[{role:"user",content:`Refine constitutional analysis for this Indian news story:
HEADLINE: ${story.headline}
BODY: ${story.body||""}
CURRENT: pillar=${story.pillar}, direction=${story.direction}, delta=${story.score_delta}

Return ONLY this JSON (no markdown):
{"pillar":"press_freedom|liberty|equality|electoral|separation|religion|justice","severity":"critical|high|medium|low","direction":"negative|positive|neutral","score_delta":<integer -6 to 6>,"institution":"police|judiciary|parliament|executive|ec","affected_group":"group name","violations":[{"a":"Art.XX","h":"brief explanation"}],"supports":[{"a":"Art.XX","h":"brief explanation"}],"mythos_summary":"2 clear sentences on democratic significance","democratic_consequence":"1 sentence","civic_risk":"critical|high|medium|low","short_public_explanation":"1 plain-language sentence for citizens"}`}]})});
    const d=await res.json();
    const txt=(d.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("");
    const match=txt.match(/\{[\s\S]*\}/);
    if(!match)return null;
    const r=JSON.parse(match[0]);
    if(!r.pillar||!PILLARS[r.pillar])return null;
    return r;
  },2,1000);
}

const timeAgo=ts=>{const d=Date.now()-new Date(ts).getTime();if(d<60000)return"just now";if(d<3600000)return`${Math.floor(d/60000)}m ago`;if(d<86400000)return`${Math.floor(d/3600000)}h ago`;return`${Math.floor(d/86400000)}d ago`;};
const fmtD=ts=>new Date(ts).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});
const isToday=ts=>new Date(ts).toDateString()===new Date("2026-04-16").toDateString();
const isWeek=ts=>(new Date("2026-04-16")-new Date(ts))<7*86400000;
const isYear=ts=>new Date(ts).getFullYear()===2026;
async function sha256(t){try{const d=new TextEncoder().encode(t);const b=await crypto.subtle.digest("SHA-256",d);return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,"0")).join("");}catch{return`fb-${Date.now()}`;}}

// ── STEP Q: TOAST SYSTEM ─────────────────────────────────────
function useToasts(){
  const [toasts,setToasts]=useState([]);
  const add=useCallback((msg,type="info",duration=4000)=>{const id=Date.now()+Math.random();setToasts(t=>[...t,{id,msg,type}]);setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),duration);return id;},[]);
  const success=(m,d=4000)=>add(m,"success",d);const error=(m,d=6000)=>add(m,"error",d);const info=(m,d=3000)=>add(m,"info",d);const warn=(m,d=5000)=>add(m,"warn",d);
  return{toasts,success,error,info,warn};
}
function ToastContainer({toasts}){
  const colors={success:{bg:"rgba(6,16,29,0.97)",border:"rgba(34,197,94,0.5)",text:"#22c55e",icon:"✓"},error:{bg:"rgba(6,16,29,0.97)",border:"rgba(239,68,68,0.5)",text:"#ef4444",icon:"✕"},warn:{bg:"rgba(6,16,29,0.97)",border:"rgba(245,158,11,0.5)",text:"#f59e0b",icon:"⚠"},info:{bg:"rgba(6,16,29,0.97)",border:"rgba(99,102,241,0.5)",text:"#818cf8",icon:"ℹ"}};
  return(<div style={{position:"fixed",top:12,right:12,zIndex:10000,display:"flex",flexDirection:"column",gap:8,maxWidth:380}}>{toasts.map(t=>{const s=colors[t.type]||colors.info;return(<div key={t.id} style={{background:s.bg,border:`1px solid ${s.border}`,borderRadius:10,padding:"10px 14px",display:"flex",gap:9,alignItems:"flex-start",backdropFilter:"blur(12px)",animation:"slideIn .25s ease",boxShadow:`0 4px 24px ${s.border}33`}}><span style={{color:s.text,fontWeight:800,fontSize:13,flexShrink:0}}>{s.icon}</span><div style={{fontSize:12,color:s.text,lineHeight:1.5}}>{t.msg}</div></div>);})}</div>);
}

// ── STEP Q: PERSISTENT SCOPE ──────────────────────────────────
function usePersistentScope(){
  const [scope,setScope]=useState(()=>{try{const s=localStorage.getItem(SCOPE_STORAGE_KEY);if(s)return JSON.parse(s);}catch{}return{type:"national",state:"Uttar Pradesh",district:"Lucknow"};});
  useEffect(()=>{try{localStorage.setItem(SCOPE_STORAGE_KEY,JSON.stringify(scope));}catch{};},[scope]);
  return[scope,setScope];
}

// ── SEED DATA ─────────────────────────────────────────────────
const SEED=[
  {id:"S001",ts:"2026-04-16T06:00:00",level:"national",state:null,district:null,category:"parliament",pillar:"electoral",severity:"critical",direction:"mixed",score_delta:0,review_status:"approved",source_conf:"verified",institution:"parliament",affected_group:"southern states",headline:"Delimitation Bill: 131st Amendment tabled — NDA 67 seats short of 2/3 majority required",body:"Three-day special session April 16–18. Govt tables Constitution (131st Amendment) Bill expanding Lok Sabha from 543 to 815 using 2011 census. South India JAC formed — TN, Karnataka, Kerala, AP, Telangana unite against bill penalising states for successful family planning.",source:"Business Today / The Hindu · Apr 16 2026",violations:[{a:"Art.82",h:"2011 census bypasses constitutional intent of current-census delimitation"},{a:"Art.368",h:"Attempting amendment without secured 2/3 majority"}],supports:[{a:"Art.81",h:"Seat expansion aligns with proportional representation"}],mythos_summary:"The Delimitation Bill is a constitutional inflection point: if passed, it would permanently redraw India's democratic map by penalising states that achieved better governance outcomes. This is not merely a political dispute — it is a structural challenge to equal representation enshrined in Art.82.",pattern_status:"emerging",democratic_consequence:"Narrows democratic competition — effective voter choice weakened for 200M southern citizens permanently",civic_risk:"critical",short_public_explanation:"This bill would reduce Parliament seats for states like Tamil Nadu that controlled population growth — punishing good governance with permanent political disadvantage.",long_research_explanation:"The 131st Amendment's use of 2011 census data creates a perverse incentive where states with better development face reduced parliamentary representation for 25+ years.",firewall_decision:"allow",confidence:0.88,mythos_generated:true,local_classified:false,ai_upgraded:true},
  {id:"S003",ts:"2026-04-16T10:00:00",level:"national",state:null,district:null,category:"court",pillar:"liberty",severity:"critical",direction:"negative",score_delta:-4,review_status:"approved",source_conf:"verified",institution:"judiciary",affected_group:"muslim activists",headline:"SC lists Umar Khalid review petition — 5.5 years UAPA detention, bail still denied",body:"Umar Khalid detained since September 2020 under UAPA — 5.5 years without conviction. SC denied bail January 2026. UAPA bail standard requires accused to disprove guilt. Co-accused freed for 'delay' while Khalid and Imam remain jailed.",source:"Webindia123 · Apr 16 2026",violations:[{a:"Art.21",h:"5.5 years pre-conviction detention — de facto punishment without trial"},{a:"Art.22",h:"UAPA inverts bail — accused must disprove guilt"},{a:"Art.14",h:"Disproportionately applied to Muslim activists"}],supports:[{a:"Art.32",h:"Accused petitioning SC — constitutional remedy still accessible"}],mythos_summary:"Umar Khalid's case has become a constitutional symbol: 5.5 years without conviction demonstrates how UAPA inverts the presumption of innocence. When bail requires disproving guilt, the law itself becomes punishment — and detention becomes the sentence before any trial.",pattern_status:"systemic",democratic_consequence:"Normalises arbitrary detention — UAPA as permanent pre-trial imprisonment weakens due process for all dissent",civic_risk:"critical",short_public_explanation:"A journalist and student leader has spent 5.5 years in jail without being convicted. Constitutional due process is being systematically denied.",long_research_explanation:"The Khalid case represents the logical endpoint of UAPA jurisprudence: stringent bail provisions that reverse presumption of innocence mean that indictment becomes imprisonment.",firewall_decision:"allow",confidence:0.91,mythos_generated:true,local_classified:false,ai_upgraded:true},
  {id:"N001",ts:"2026-04-12T00:00:00",level:"state",state:"Assam",district:"Kamrup Metro",category:"govt",pillar:"equality",severity:"critical",direction:"negative",score_delta:-5,review_status:"approved",source_conf:"verified",institution:"executive",affected_group:"muslims",headline:"Assam NRC + CAA: 1.9M stateless; religion-based two-tier citizenship explicitly excludes Muslims",body:"NRC final list excluded 1.9 million. CAA 2024 provides citizenship only for non-Muslims — Muslims explicitly excluded from both NRC and CAA remedy. Five detention centres operational.",source:"Human Rights Watch / ICJ · 2026",violations:[{a:"Art.14",h:"Religion-based two-tier citizenship — Muslims excluded from CAA remedy"},{a:"Art.15",h:"State explicitly discriminating on grounds of religion"},{a:"Preamble",h:"Secular republic creating religion-based two-tier citizenship"}],supports:[],mythos_summary:"The NRC+CAA combination is the most significant citizenship engineering since Partition. Two systems operate simultaneously — one creating statelessness, another offering rescue to all groups except one. This is religion-based citizenship in a secular republic.",pattern_status:"systemic",democratic_consequence:"Muslim confidence in equal citizenship structurally eroded — selective rule-of-law breakdown",civic_risk:"critical",short_public_explanation:"1.9 million people are effectively stateless in Assam — disproportionately Muslim, excluded from both NRC and the CAA remedy offered to everyone else.",long_research_explanation:"The convergence creates a constitutional architecture that is technically legal but substantively discriminatory.",firewall_decision:"allow",confidence:0.93,mythos_generated:true,local_classified:false,ai_upgraded:true},
  {id:"N002",ts:"2026-03-08T00:00:00",level:"state",state:"Uttar Pradesh",district:"Prayagraj",category:"police",pillar:"press_freedom",severity:"critical",direction:"negative",score_delta:-5,review_status:"approved",source_conf:"verified",institution:"police",affected_group:"journalists",headline:"Journalist Raghvendra Bajpai shot dead in UP — third journalist murder in 18 months, no arrests",body:"Investigative journalist Raghvendra Bajpai shot dead March 8, 2026, after exposé on land scam. No arrests as of April 16. RSF: UP is India's most dangerous state for journalists.",source:"RSF / Multiple sources · Mar 2026",violations:[{a:"Art.21",h:"State failure to protect journalist's life — complete impunity"},{a:"Art.19(1)(a)",h:"Murder to suppress investigative reporting"}],supports:[],mythos_summary:"Three journalist murders in UP in 18 months without a single conviction represents a complete breakdown of press freedom accountability. When reporters are killed and no one is arrested, the chilling effect spreads — every investigative journalist calculates whether the next story is worth dying for.",pattern_status:"systemic",democratic_consequence:"Complete chilling effect on investigative journalism in UP — political corruption reporting structurally suppressed",civic_risk:"critical",short_public_explanation:"Three journalists murdered in UP in 18 months. No arrests. Reporting on corruption is effectively life-threatening in this state.",long_research_explanation:"The pattern: local investigative reporters exposing land/mining/police corruption are killed. State protection absent. Systemic impunity signals state complicity.",firewall_decision:"allow",confidence:0.95,mythos_generated:true,local_classified:false,ai_upgraded:true},
  {id:"N005",ts:"2025-12-15T00:00:00",level:"state",state:"Uttar Pradesh",district:"Sambhal",category:"police",pillar:"equality",severity:"critical",direction:"negative",score_delta:-4,review_status:"approved",source_conf:"verified",institution:"police",affected_group:"muslims",headline:"Sambhal mosque survey violence: 5 Muslims killed by UP Police, internet shutdown, 150+ arrested",body:"Court-ordered archaeological survey triggers clashes. UP Police fire on protesters — 5 killed, all Muslim. Internet shutdown imposed. 150+ arrested under UAPA.",source:"The Hindu / NDTV · Nov-Dec 2025",violations:[{a:"Art.21",h:"5 civilians killed — disproportionate force, zero accountability"},{a:"Art.26",h:"Mosque survey encroaches on religious denomination's rights"},{a:"Art.14",h:"All killed are Muslim — discriminatory application of force"}],supports:[],mythos_summary:"Sambhal is the second incident in 18 months where a court-ordered mosque survey led to police firing on Muslim civilians. The pattern transforms isolated incidents into a systemic question: are judicial archaeology orders being used to trigger communal confrontation?",pattern_status:"repeated",democratic_consequence:"Mosque survey orders now function as triggering mechanisms for state violence against minorities",civic_risk:"critical",short_public_explanation:"Five Muslim men were killed by police during protests over a court-ordered mosque survey. This is the second such incident in 18 months. No police accountability.",long_research_explanation:"Each incident follows a pattern: court petition → archaeology order → police deployment → civilian deaths → zero accountability.",firewall_decision:"allow",confidence:0.90,mythos_generated:true,local_classified:false,ai_upgraded:true},
  {id:"N006",ts:"2025-11-24T00:00:00",level:"national",state:null,district:null,category:"court",pillar:"justice",severity:"medium",direction:"positive",score_delta:3,review_status:"approved",source_conf:"verified",institution:"judiciary",affected_group:"accused persons",headline:"SC mandates written UAPA arrest grounds — Art.22(1) mandatory even in terror cases (binding precedent)",body:"SC quashes UAPA arrests where written grounds not furnished. Court: 'written grounds to be furnished without exception.' Binding precedent for all courts nationally.",source:"24Law / Supreme Court · Nov 2025",violations:[],supports:[{a:"Art.22",h:"SC enforcing written grounds mandatory in terror cases"},{a:"Art.141",h:"Binding precedent for all courts nationally"}],mythos_summary:"The SC's UAPA written-grounds ruling creates the most significant due process floor in a decade: even in terror cases, the state must commit to paper why it is imprisoning someone. Small protection — but measurable and constitutionally enforceable.",pattern_status:"isolated",democratic_consequence:"Written grounds requirement creates accountability floor — UAPA arbitrary arrests now procedurally challengeable",civic_risk:"low",short_public_explanation:"The Supreme Court ruled that even under anti-terror law, police must give a written reason when they arrest someone.",long_research_explanation:"SC ruling establishes Art.22(1) as a constitutional floor that security legislation cannot eliminate.",firewall_decision:"allow",confidence:0.85,mythos_generated:true,local_classified:false,ai_upgraded:true},
  {id:"N013",ts:"2024-06-04T00:00:00",level:"national",state:null,district:null,category:"ec",pillar:"electoral",severity:"high",direction:"positive",score_delta:4,review_status:"approved",source_conf:"verified",institution:"ec",affected_group:"voters",headline:"2024 Lok Sabha: BJP majority reduced — NDA 293/543; INDIA bloc 232; genuine democratic competition",body:"NDA wins 293 (BJP: 240 — below 272 majority needed); INDIA bloc wins 232. Coalition required for first time since 2014. 66.3% turnout across 543 constituencies.",source:"Election Commission of India · Jun 2024",violations:[{a:"Art.324",h:"EC delayed releasing absolute voter turnout numbers until SC ordered"}],supports:[{a:"Art.326",h:"66.3% turnout — functioning universal adult suffrage"},{a:"Art.324",h:"543-constituency elections conducted; results accepted by all parties"}],mythos_summary:"The 2024 election result is the most important democratic signal in a decade: voters reduced a governing majority to a dependent coalition. The electorate exercised constitutional agency — demonstrating that even within an environment of institutional stress, electoral democracy retains corrective capacity.",pattern_status:"isolated",democratic_consequence:"Electoral integrity strengthened — voters demonstrated accountability through reduced majority; democratic competition genuine",civic_risk:"low",short_public_explanation:"Voters reduced the BJP's majority in 2024, forcing coalition government. India's elections still function as a democratic check on power.",long_research_explanation:"The 2024 election result demonstrates that electoral democracy retains corrective capacity even within institutional stress.",firewall_decision:"allow",confidence:0.90,mythos_generated:true,local_classified:false,ai_upgraded:true},
  {id:"N016",ts:"2024-02-15T00:00:00",level:"national",state:null,district:null,category:"court",pillar:"electoral",severity:"critical",direction:"positive",score_delta:5,review_status:"approved",source_conf:"verified",institution:"judiciary",affected_group:"voters",headline:"SC unanimously strikes down Electoral Bond Scheme — violates voters' right to information",body:"Five-judge Constitution Bench unanimously strikes down Electoral Bond Scheme. Violates Art.19(1)(a); enables quid pro quo. BJP received 54% of ₹8,251 crore total.",source:"Supreme Court of India · Feb 2024",violations:[],supports:[{a:"Art.19(1)(a)",h:"Voters right to know source of political funding upheld"},{a:"Art.324",h:"SC protects free and fair elections"},{a:"Art.124",h:"Unanimous Constitution Bench demonstrates judicial independence"}],mythos_summary:"The Electoral Bond judgement is the SC at its most constitutionally courageous: a unanimous five-judge bench striking down a financial scheme that had funnelled ₹8,251 crore to political parties — affirming that voters have a constitutional right to know who buys political influence.",pattern_status:"isolated",democratic_consequence:"Electoral integrity strengthened — SC affirms voters constitutional right to political funding transparency",civic_risk:"low",short_public_explanation:"The Supreme Court unanimously struck down a secretive political funding scheme, saying voters have a fundamental right to know who is paying for political campaigns.",long_research_explanation:"The Electoral Bond judgement reads Art.19(1)(a) as including the right to political information.",firewall_decision:"allow",confidence:0.93,mythos_generated:true,local_classified:false,ai_upgraded:true},
  {id:"N024",ts:"2023-05-04T00:00:00",level:"state",state:"Manipur",district:"Imphal West",category:"civil_liberty",pillar:"equality",severity:"critical",direction:"negative",score_delta:-5,review_status:"approved",source_conf:"verified",institution:"state government",affected_group:"kuki-zo christians",headline:"Manipur ethnic war: 200+ killed, 60,000+ displaced, 400+ churches burned — ongoing into 2026",body:"Ethnic violence erupts May 3, 2023 — ongoing into 2026. Over 200 killed; 60,000+ displaced; 400+ churches burned. Internet shutdowns. Art.355 not invoked by Union.",source:"Human Rights Watch / Amnesty International · Ongoing",violations:[{a:"Art.21",h:"State failure to protect 200+ civilian lives"},{a:"Art.14",h:"Kuki-Zo community without equal state protection"},{a:"Art.29",h:"400+ churches burned — minority cultural institutions destroyed"},{a:"Art.355",h:"Constitutional duty to protect state from internal disturbance abandoned"}],supports:[],mythos_summary:"Manipur is India's most sustained and complete constitutional failure: three years of ethnic war, 200+ dead, 60,000 displaced, 400+ churches burned — and the Union Government has not invoked Art.355, its constitutional duty to protect states from internal disturbance.",pattern_status:"systemic",democratic_consequence:"Complete constitutional failure — Kuki-Zo community without equal state protection for 3 consecutive years",civic_risk:"critical",short_public_explanation:"Manipur has been in ethnic conflict for 3 years: 200+ killed, 60,000 displaced, 400+ churches burned. The central government has not used its constitutional power to intervene.",long_research_explanation:"Art.355 places a positive constitutional duty on the Union to protect states from internal disturbance. Manipur's 3-year war is the clearest test of this provision.",firewall_decision:"allow",confidence:0.94,mythos_generated:true,local_classified:false,ai_upgraded:true},
];
const SEED_ANOMALIES=[{id:"AN001",type:"withdrawal_spike",scope:"Lucknow District, UP",score:91,severity:"critical",reason:"14 candidate withdrawals in 6-hour window; 11 linked to same political agent",ts:"2026-04-14",article:"Art.324",status:"escalated"},{id:"AN002",type:"uncontested_concentration",scope:"Ahmedabad, Gujarat",score:78,severity:"high",reason:"9 of 21 seats uncontested — 43% rate vs state average 8%; all in minority-majority wards",ts:"2026-04-14",article:"Art.326",status:"open"},{id:"AN003",type:"complaint_suppression",scope:"Jaipur North",score:85,severity:"critical",reason:"11 intimidation complaints unresolved; same official in all 11 cases",ts:"2026-04-13",article:"Art.32",status:"escalated"}];

// ── UI COMPONENTS ─────────────────────────────────────────────
function Ring({score,size=90,pulse}){const b=getBand(score),r=size*.38,c=2*Math.PI*r,p=clamp(score/100,0,1)*c;return(<div style={{position:"relative",width:size,height:size,flexShrink:0}}>{pulse&&<div style={{position:"absolute",inset:-6,borderRadius:"50%",border:`2px solid ${b.c}60`,animation:"rPulse 1.5s ease-out forwards"}}/>}<svg width={size} height={size} style={{transform:"rotate(-90deg)"}}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={size*.08}/><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={b.c} strokeWidth={size*.08} strokeDasharray={`${p} ${c}`} strokeLinecap="round" style={{transition:"stroke-dasharray 1.2s ease"}}/></svg><div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><div style={{fontSize:size*.24,fontWeight:800,color:b.c,lineHeight:1}}>{Math.round(score)}</div><div style={{fontSize:size*.1,color:"#64748b",textTransform:"uppercase"}}>/100</div></div></div>);}
function Sparkline({data,color,w=80,h=24}){if(!data||data.length<2)return null;const mn=Math.min(...data),mx=Math.max(...data),rng=(mx-mn)||1;const pts=data.map((v,i)=>`${i/(data.length-1)*w},${h-((v-mn)/rng)*(h-4)-2}`).join(" ");return(<svg width={w} height={h}><polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/></svg>);}
function APill({article,type,onClick}){const c=type==="support"?"#22c55e":"#ef4444";return(<button onClick={onClick} title={CA[article]?.t||article} style={{background:`${c}12`,color:c,border:`1px solid ${c}25`,borderRadius:4,padding:"2px 6px",fontSize:9,fontWeight:800,letterSpacing:".06em",textTransform:"uppercase",whiteSpace:"nowrap",cursor:onClick?"pointer":"default",lineHeight:1.4}}>{type==="support"?"✓":"✕"} {article}</button>);}
function PBadge({status}){const p=PATTERN_CLASSES[status]||PATTERN_CLASSES.isolated;return(<span style={{fontSize:9,color:p.color,background:p.bg,border:`1px solid ${p.color}30`,borderRadius:4,padding:"2px 7px",fontWeight:700,textTransform:"uppercase",whiteSpace:"nowrap"}}>{p.dot} {p.label}</span>);}
function CBadge({risk}){const r=CIVIC_RISK[risk]||CIVIC_RISK.low;return(<span style={{fontSize:9,color:r.color,background:`${r.color}12`,borderRadius:4,padding:"2px 7px",fontWeight:700,textTransform:"uppercase"}}>{r.label} Risk</span>);}
function Stat({label,value,sub,acc}){return(<div style={{background:"rgba(255,255,255,0.03)",border:`0.5px solid rgba(255,255,255,0.08)`,borderRadius:10,padding:"12px 16px",borderLeft:`3px solid ${acc||"#64748b"}`}}><div style={{fontSize:9,color:"#64748b",textTransform:"uppercase",letterSpacing:".08em",marginBottom:3}}>{label}</div><div style={{fontSize:22,fontWeight:800,color:"#f1f5f9",lineHeight:1.1}}>{value}</div>{sub&&<div style={{fontSize:9,color:"#64748b",marginTop:3}}>{sub}</div>}</div>);}

// Story Card
function StoryCard({s,expanded,onToggle,onArtFilter,showActions,onReview}){
  const [mythMode,setMythMode]=useState(false);
  const dc=s.direction==="positive"?"#22c55e":s.direction==="negative"?"#ef4444":"#f59e0b";
  const sev={critical:"#ef4444",high:"#f97316",medium:"#f59e0b",low:"#22c55e"}[s.severity]||"#64748b";
  const cc=CAT_C[s.category]||"#64748b";const dt=s.score_delta||0;
  const hasMythos=s.mythos_generated&&s.mythos_summary;
  const fw=s.firewall_decision;const fwc={allow:"#22c55e",allow_with_log:"#f59e0b",hold:"#f97316",reject:"#ef4444"}[fw];
  return(<div style={{background:s.review_status==="pending"?"rgba(245,158,11,0.03)":s.is_live_fetch?"rgba(59,130,246,0.03)":"rgba(255,255,255,0.02)",border:`0.5px solid ${s.review_status==="pending"?"rgba(245,158,11,0.3)":s.is_live_fetch?"rgba(59,130,246,0.25)":s.severity==="critical"?"rgba(239,68,68,0.25)":s.direction==="positive"?"rgba(34,197,94,0.15)":"rgba(255,255,255,0.08)"}`,borderRadius:12,marginBottom:10,overflow:"hidden",cursor:"pointer"}} onClick={onToggle}>
    <div style={{padding:"12px 16px"}}>
      <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8,alignItems:"center"}}>
        {s.is_live_fetch&&<span style={{fontSize:9,color:"#3b82f6",background:"rgba(59,130,246,0.12)",borderRadius:4,padding:"2px 7px",fontWeight:700,whiteSpace:"nowrap"}}>● LIVE</span>}
        <span style={{fontSize:9,color:cc,background:`${cc}15`,borderRadius:4,padding:"2px 7px",fontWeight:700,textTransform:"uppercase",whiteSpace:"nowrap"}}>{(s.category||"").split("_").join(" ")}</span>
        <span style={{fontSize:9,color:sev,background:`${sev}12`,borderRadius:4,padding:"2px 7px",fontWeight:700,textTransform:"uppercase"}}>{s.severity}</span>
        <span style={{fontSize:8,color:s.review_status==="approved"?"#22c55e":"#f59e0b",background:`${s.review_status==="approved"?"#22c55e":"#f59e0b"}12`,borderRadius:4,padding:"2px 6px",fontWeight:700,textTransform:"uppercase"}}>{s.local_classified?"⚡ ":"AI ✓ "}{s.review_status||"approved"}</span>
        {hasMythos&&<PBadge status={s.pattern_status||"isolated"}/>}
        {s.institution&&<span style={{fontSize:9,color:"#475569",background:"rgba(255,255,255,0.04)",borderRadius:4,padding:"2px 6px"}}>{INST[s.institution]||s.institution}</span>}
        {fwc&&fw!=="allow"&&<span style={{fontSize:8,color:fwc,background:`${fwc}10`,borderRadius:4,padding:"2px 6px",fontWeight:700}}>⛨ {fw}</span>}
        {s.state&&<span style={{fontSize:9,color:"#475569"}}>{s.state}{s.district?` / ${s.district}`:""}</span>}
        <span style={{fontSize:9,color:"#334155",marginLeft:"auto",whiteSpace:"nowrap"}}>{timeAgo(s.ts)}</span>
        <span style={{fontSize:10,fontWeight:800,color:dc,background:`${dc}10`,borderRadius:4,padding:"2px 7px",whiteSpace:"nowrap"}}>{dt>0?`▲ +${dt}`:dt<0?`▼ ${dt}`:"↔ 0"} pts</span>
      </div>
      <div style={{fontSize:14,fontWeight:700,color:"#f1f5f9",lineHeight:1.4,marginBottom:hasMythos?5:0}}>{s.headline}</div>
      {hasMythos&&s.short_public_explanation&&<div style={{fontSize:11,color:"#64748b",marginBottom:5,lineHeight:1.4}}>{s.short_public_explanation}</div>}
      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{(s.violations||[]).map((v,i)=><APill key={i} article={v.a} type="violation" onClick={e=>{e.stopPropagation();onArtFilter&&onArtFilter(v.a);}}/>)}{(s.supports||[]).map((v,i)=><APill key={i} article={v.a} type="support" onClick={e=>{e.stopPropagation();onArtFilter&&onArtFilter(v.a);}}/>)}</div>
    </div>
    {expanded&&(<div style={{borderTop:"0.5px solid rgba(255,255,255,0.06)"}} onClick={e=>e.stopPropagation()}>
      {hasMythos&&<div style={{display:"flex",gap:0,padding:"10px 16px 0",borderBottom:"0.5px solid rgba(255,255,255,0.05)"}}>
        <button onClick={()=>setMythMode(false)} style={{background:!mythMode?"rgba(59,130,246,0.12)":"transparent",color:!mythMode?"#60a5fa":"#475569",border:`0.5px solid ${!mythMode?"rgba(59,130,246,0.3)":"rgba(255,255,255,0.08)"}`,borderRadius:"6px 0 0 6px",padding:"5px 14px",fontSize:11,fontWeight:700,cursor:"pointer"}}>📋 Facts</button>
        <button onClick={()=>setMythMode(true)} style={{background:mythMode?"rgba(168,85,247,0.12)":"transparent",color:mythMode?"#c084fc":"#475569",border:`0.5px solid ${mythMode?"rgba(168,85,247,0.3)":"rgba(255,255,255,0.08)"}`,borderRadius:"0 6px 6px 0",padding:"5px 14px",fontSize:11,fontWeight:700,cursor:"pointer"}}>✨ Mythos</button>
      </div>}
      <div style={{padding:"12px 16px 14px"}}>
      {!mythMode?(<>
        {s.body&&<div style={{fontSize:13,color:"#94a3b8",lineHeight:1.6,marginBottom:10}}>{s.body}</div>}
        <div style={{background:"rgba(99,102,241,0.06)",border:"0.5px solid rgba(99,102,241,0.2)",borderRadius:8,padding:"8px 12px",marginBottom:10}}>
          <div style={{fontSize:9,color:"#818cf8",fontWeight:800,textTransform:"uppercase",marginBottom:4}}>Score Calculation</div>
          <div style={{fontSize:11,color:"#94a3b8"}}>Raw: <b style={{color:"#f1f5f9"}}>{dt>0?"+":""}{dt}</b> × Source: <b style={{color:"#f1f5f9"}}>{CONF_W[s.source_conf]||0.5}</b> × Pillar: <b style={{color:"#f1f5f9"}}>{PILLARS[s.pillar]?.weight||1.0}</b> × Pattern: <b style={{color:PATTERN_CLASSES[s.pattern_status||"isolated"]?.color}}>{PATTERN_CLASSES[s.pattern_status||"isolated"]?.mult}</b> × Recency = <b style={{color:dt<0?"#ef4444":"#22c55e"}}>{Math.round(wDelta(s)*10)/10} weighted pts</b></div>
          {s.confidence&&<div style={{fontSize:9,color:"#64748b",marginTop:2}}>Firewall confidence: {(s.confidence*100).toFixed(0)}% · Decision: <span style={{color:fwc||"#64748b"}}>{fw||"allow"}</span></div>}
        </div>
        {(s.violations||[]).length>0&&<div style={{marginBottom:10}}><div style={{fontSize:9,color:"#ef4444",fontWeight:800,textTransform:"uppercase",marginBottom:6}}>✕ Constitutional Violations</div>{s.violations.map((v,i)=>{const art=CA[v.a];return(<div key={i} style={{background:"rgba(239,68,68,0.05)",border:"0.5px solid rgba(239,68,68,0.18)",borderRadius:8,padding:"8px 12px",marginBottom:5}}><div style={{display:"flex",gap:8}}><span style={{fontSize:9,color:"#ef4444",fontWeight:800,fontFamily:"monospace",background:"rgba(239,68,68,0.12)",borderRadius:4,padding:"2px 6px",whiteSpace:"nowrap",marginTop:1}}>{v.a}</span><div><div style={{fontSize:11,color:"#f87171",fontWeight:700}}>{art?.t}</div><div style={{fontSize:12,color:"#94a3b8",lineHeight:1.5}}>{v.h}</div>{art&&<div style={{fontSize:10,color:"#334155",fontStyle:"italic",marginTop:2}}>{art.s}</div>}</div></div></div>);})}</div>}
        {(s.supports||[]).length>0&&<div style={{marginBottom:10}}><div style={{fontSize:9,color:"#22c55e",fontWeight:800,textTransform:"uppercase",marginBottom:6}}>✓ Constitutional Supports</div>{s.supports.map((v,i)=>{const art=CA[v.a];return(<div key={i} style={{background:"rgba(34,197,94,0.04)",border:"0.5px solid rgba(34,197,94,0.18)",borderRadius:8,padding:"8px 12px",marginBottom:5}}><div style={{display:"flex",gap:8}}><span style={{fontSize:9,color:"#22c55e",fontWeight:800,fontFamily:"monospace",background:"rgba(34,197,94,0.12)",borderRadius:4,padding:"2px 6px",whiteSpace:"nowrap",marginTop:1}}>{v.a}</span><div><div style={{fontSize:11,color:"#4ade80",fontWeight:700}}>{art?.t}</div><div style={{fontSize:12,color:"#94a3b8"}}>{v.h}</div></div></div></div>);})}</div>}
        {s.source&&<div style={{fontSize:10,color:"#334155"}}>Source: {s.source}</div>}
      </>):(<>
        <div style={{background:"rgba(168,85,247,0.06)",border:"0.5px solid rgba(168,85,247,0.25)",borderRadius:10,padding:"12px 14px",marginBottom:10}}><div style={{fontSize:9,color:"#c084fc",fontWeight:800,textTransform:"uppercase",marginBottom:6}}>✨ Mythos Intelligence</div><div style={{fontSize:13,color:"#e2e8f0",lineHeight:1.7}}>{s.mythos_summary}</div></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
          <div style={{background:"rgba(255,255,255,0.03)",border:"0.5px solid rgba(255,255,255,0.08)",borderRadius:8,padding:"9px 11px"}}><div style={{fontSize:9,color:"#64748b",textTransform:"uppercase",marginBottom:4}}>Democratic Consequence</div><div style={{fontSize:12,color:"#94a3b8",lineHeight:1.5}}>{s.democratic_consequence}</div></div>
          <div style={{background:"rgba(255,255,255,0.03)",border:"0.5px solid rgba(255,255,255,0.08)",borderRadius:8,padding:"9px 11px"}}><div style={{fontSize:9,color:"#64748b",textTransform:"uppercase",marginBottom:4}}>For Citizens</div><div style={{fontSize:12,color:"#94a3b8",lineHeight:1.5}}>{s.short_public_explanation}</div></div>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}><PBadge status={s.pattern_status||"isolated"}/><CBadge risk={s.civic_risk||"medium"}/>{s.institution&&<span style={{fontSize:9,color:"#f97316",background:"rgba(249,115,22,0.1)",borderRadius:4,padding:"2px 7px"}}>{INST[s.institution]||s.institution}</span>}{s.affected_group&&<span style={{fontSize:9,color:"#8b5cf6",background:"rgba(139,92,246,0.1)",borderRadius:4,padding:"2px 7px"}}>👤 {s.affected_group}</span>}</div>
        {s.long_research_explanation&&<div style={{marginTop:8,background:"rgba(255,255,255,0.02)",border:"0.5px solid rgba(255,255,255,0.06)",borderRadius:8,padding:"9px 11px"}}><div style={{fontSize:9,color:"#64748b",textTransform:"uppercase",marginBottom:4}}>Research Note</div><div style={{fontSize:11,color:"#64748b",lineHeight:1.6,fontStyle:"italic"}}>{s.long_research_explanation}</div></div>}
      </>)}
      {showActions&&s.review_status==="pending"&&<div style={{display:"flex",gap:8,marginTop:10}}>
        <button onClick={e=>{e.stopPropagation();onReview(s.id,"approved");}} style={{background:"rgba(34,197,94,0.1)",color:"#4ade80",border:"1px solid rgba(34,197,94,0.25)",borderRadius:6,padding:"5px 12px",fontSize:11,fontWeight:700,cursor:"pointer"}}>✓ Approve</button>
        <button onClick={e=>{e.stopPropagation();onReview(s.id,"rejected");}} style={{background:"rgba(239,68,68,0.1)",color:"#f87171",border:"1px solid rgba(239,68,68,0.25)",borderRadius:6,padding:"5px 12px",fontSize:11,fontWeight:700,cursor:"pointer"}}>✕ Reject</button>
        <button onClick={e=>{e.stopPropagation();onReview(s.id,"redacted");}} style={{background:"rgba(139,92,246,0.1)",color:"#a78bfa",border:"1px solid rgba(139,92,246,0.25)",borderRadius:6,padding:"5px 12px",fontSize:11,fontWeight:700,cursor:"pointer"}}>⬛ Redact</button>
      </div>}
      </div>
    </div>)}
  </div>);
}

// ── STEP S: SHARE CARD (viral "Today's Democracy Score") ──────
function ShareCard({score,band,liveCount,topIssue,onClose}){
  const [copied,setCopied]=useState(false);
  const text=`India Democracy Score: ${score}/100 (${band.l})\n${topIssue||""}\n📊 DTN Mythos — Constitutional Awareness & Data Transparency\nData: Freedom House + V-Dem + RSF + NCRB · ${liveCount} live events scored\n#IndiaConstitution #Transparency`;
  const copy=()=>{navigator.clipboard.writeText(text).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);}).catch(()=>{});};
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:9998,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
    <div style={{background:"#0f172a",border:`1px solid ${band.c}30`,borderRadius:20,padding:"28px 32px",maxWidth:420,width:"100%",boxShadow:`0 20px 60px ${band.c}20`}} onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        <div><div style={{fontSize:11,color:"#64748b",textTransform:"uppercase",letterSpacing:".1em",marginBottom:4}}>DTN Mythos · Constitutional Awareness & Data Transparency</div><div style={{fontSize:13,color:"#94a3b8"}}>Today's Democracy Score — Apr 16, 2026</div></div>
        <button onClick={onClose} style={{background:"transparent",color:"#64748b",border:"none",fontSize:18,cursor:"pointer",padding:"0 5px"}}>×</button>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:20}}>
        <Ring score={score} size={100}/>
        <div><div style={{fontSize:36,fontWeight:900,color:band.c,lineHeight:1}}>{score}</div><div style={{fontSize:11,color:band.c,textTransform:"uppercase",fontWeight:700,marginBottom:5}}>{band.l}</div><div style={{fontSize:10,color:"#64748b"}}>Out of 100 · National Score</div></div>
      </div>
      {topIssue&&<div style={{background:band.bg,border:`0.5px solid ${band.c}30`,borderRadius:10,padding:"10px 14px",marginBottom:16}}><div style={{fontSize:9,color:"#64748b",textTransform:"uppercase",marginBottom:3}}>Top Constitutional Issue Today</div><div style={{fontSize:13,color:"#f1f5f9",lineHeight:1.5}}>{topIssue}</div></div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>{[{l:"Data Sources",v:"5 indices"},{l:"Live Events",v:`${liveCount}`},{l:"Articles Tracked",v:"30+"}].map(m=><div key={m.l} style={{background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"7px 10px",textAlign:"center"}}><div style={{fontSize:9,color:"#64748b",marginBottom:2}}>{m.l}</div><div style={{fontSize:13,fontWeight:700,color:"#f1f5f9"}}>{m.v}</div></div>)}</div>
      <div style={{background:"rgba(255,255,255,0.03)",border:"0.5px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"10px 12px",marginBottom:14,fontSize:11,color:"#64748b",lineHeight:1.7,fontFamily:"monospace"}}>{text}</div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={copy} style={{flex:1,background:copied?"rgba(34,197,94,0.12)":"rgba(99,102,241,0.12)",color:copied?"#22c55e":"#818cf8",border:`1px solid ${copied?"rgba(34,197,94,0.3)":"rgba(99,102,241,0.3)"}`,borderRadius:8,padding:"10px",fontWeight:700,fontSize:13,cursor:"pointer"}}>{copied?"✓ Copied!":"Copy to Share"}</button>
        <button onClick={onClose} style={{background:"transparent",color:"#64748b",border:"0.5px solid rgba(255,255,255,0.12)",borderRadius:8,padding:"10px 16px",fontSize:12,cursor:"pointer"}}>Close</button>
      </div>
      <div style={{fontSize:8,color:"#1e293b",textAlign:"center",marginTop:10}}>Data-based informational analysis. Limitations documented at dtn.civicdata.in/methodology</div>
    </div>
  </div>);
}

// ── STEP T: TRANSPARENCY PAGE ─────────────────────────────────
function TransparencyPage(){
  return(<div style={{paddingBottom:40}}>
    <div style={{marginBottom:20}}><div style={{fontSize:10,color:"#64748b",textTransform:"uppercase",marginBottom:4}}>Step T — Trust-Based Resilience Architecture</div><h2 style={{fontSize:24,fontWeight:800,color:"#f1f5f9",margin:"0 0 5px"}}>How DTN Works — Methodology & Data Sources</h2><p style={{color:"#64748b",fontSize:13,margin:0}}>Full transparency on how constitutional scores are calculated, what data sources are used, and the limitations of this platform.</p></div>
    {/* Disclaimer box */}
    <div style={{background:"rgba(99,102,241,0.06)",border:"0.5px solid rgba(99,102,241,0.25)",borderRadius:14,padding:"20px",marginBottom:20}}>
      <div style={{fontSize:13,fontWeight:700,color:"#818cf8",marginBottom:8}}>📋 Platform Disclaimer</div>
      <div style={{fontSize:12,color:"#94a3b8",lineHeight:1.8}}>
        This platform provides <b style={{color:"#f1f5f9"}}>informational and educational analysis based on publicly available data</b>. It does not make legal accusations or conclusive claims about individuals, institutions, or events.
        <br/><br/>All outputs are probabilistic, subject to human review, and carry inherent uncertainties. Users are encouraged to <b style={{color:"#f1f5f9"}}>verify information independently</b> through primary sources, court records, and authoritative media.
        <br/><br/>Constitutional scores are derived from quantitative models based on published indices. They represent a data-driven perspective — not legal, judicial, or policy determinations.
        <br/><br/>This platform is politically neutral. It tracks constitutional health across all governments, parties, and institutions without partisan bias.
      </div>
    </div>
    {/* Score methodology */}
    <div style={{background:"rgba(255,255,255,0.02)",border:"0.5px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"20px",marginBottom:16}}>
      <div style={{fontSize:13,fontWeight:700,color:"#f1f5f9",marginBottom:12}}>⚙ Score Methodology</div>
      <div style={{fontSize:12,color:"#94a3b8",lineHeight:1.8,marginBottom:12}}>
        <b style={{color:"#f1f5f9"}}>Formula:</b> Live Score = State Baseline + Σ(event_delta × source_weight × recency_decay × pillar_weight × pattern_multiplier)
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div><div style={{fontSize:11,fontWeight:700,color:"#f1f5f9",marginBottom:6}}>State Baselines</div><div style={{fontSize:11,color:"#94a3b8",lineHeight:1.7}}>Derived from 5 published indices:<br/>• Freedom House 2025 (30% weight)<br/>• V-Dem Liberal Democracy Index (25%)<br/>• RSF Press Freedom Index 2025 (20%)<br/>• NCRB Crime Statistics 2024 (15%)<br/>• NHRC Annual Report Data (10%)</div></div>
        <div><div style={{fontSize:11,fontWeight:700,color:"#f1f5f9",marginBottom:6}}>Score Weights</div><div style={{fontSize:11,color:"#94a3b8",lineHeight:1.7}}>Source confidence: verified×1.0, corroborated×0.8, single×0.5<br/>Recency decay: max 1.0 → min 0.3 over 4 months<br/>Pattern multipliers: isolated×1.0, emerging×1.15, repeated×1.3, systemic×1.5<br/>Pillar weights: press freedom & liberty ×1.2, equality ×1.1</div></div>
      </div>
    </div>
    {/* Data sources */}
    <div style={{background:"rgba(255,255,255,0.02)",border:"0.5px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"20px",marginBottom:16}}>
      <div style={{fontSize:13,fontWeight:700,color:"#f1f5f9",marginBottom:12}}>📊 Data Sources</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
        {[{name:"Freedom House",url:"freedomhouse.org",type:"State baselines",metric:"Freedom in the World 2025"},{name:"V-Dem Institute",url:"v-dem.net",type:"Democratic health",metric:"Liberal Democracy Index 2025"},{name:"RSF Reporters Without Borders",url:"rsf.org",type:"Press freedom",metric:"World Press Freedom Index 2025"},{name:"NCRB India",url:"ncrb.gov.in",type:"Crime & atrocities",metric:"Crime in India 2024"},{name:"NHRC",url:"nhrc.nic.in",type:"Rights violations",metric:"Annual Report 2024"},{name:"Election Commission India",url:"eci.gov.in",type:"Electoral data",metric:"Official ECI records"}].map(s=><div key={s.name} style={{background:"rgba(255,255,255,0.03)",border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:8,padding:"10px 12px"}}><div style={{fontSize:12,fontWeight:700,color:"#f1f5f9",marginBottom:2}}>{s.name}</div><div style={{fontSize:10,color:"#64748b",marginBottom:3}}>{s.metric}</div><div style={{fontSize:10,color:"#3b82f6"}}>{s.url}</div></div>)}
      </div>
    </div>
    {/* Limitations */}
    <div style={{background:"rgba(245,158,11,0.04)",border:"0.5px solid rgba(245,158,11,0.2)",borderRadius:14,padding:"20px",marginBottom:16}}>
      <div style={{fontSize:13,fontWeight:700,color:"#f59e0b",marginBottom:10}}>⚠ Known Limitations</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,fontSize:12,color:"#94a3b8",lineHeight:1.7}}>
        <div>• Constitutional scores are modelled approximations, not definitive measurements<br/>• Live news classification uses keyword rules that may mis-classify edge cases<br/>• AI Constitutional Review improves accuracy but is not infallible<br/>• State baselines reflect 2024–2025 data and are updated annually</div>
        <div>• Pattern detection requires multiple events in same pillar/state/institution — single events are marked "isolated"<br/>• Citizen submissions are not auto-approved and do not affect live scores<br/>• Score delta range capped at ±6 per event to prevent single-event distortion<br/>• Platform captures reported events — unreported events not reflected</div>
      </div>
    </div>
    {/* Step T resilience */}
    <div style={{background:"rgba(34,197,94,0.04)",border:"0.5px solid rgba(34,197,94,0.2)",borderRadius:14,padding:"20px",marginBottom:16}}>
      <div style={{fontSize:13,fontWeight:700,color:"#22c55e",marginBottom:10}}>🛡 Platform Resilience Design (Step T)</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,fontSize:12,color:"#94a3b8",lineHeight:1.7}}>
        <div><b style={{color:"#f1f5f9"}}>Trust-Based Resilience Formula:</b><br/>Resilience = (Distributed Tech) + (Transparent Logic) + (Legal Safety) + (User Trust)<br/><br/>• All score calculations are documented and reproducible<br/>• Human review required for citizen submissions<br/>• Audit trail for all review actions<br/>• Append-only evidence hashing for submissions</div>
        <div><b style={{color:"#f1f5f9"}}>Multi-Layer Protection:</b><br/>• Firewall validates all live-fetched stories before scoring<br/>• Confidence scoring prevents over-claiming<br/>• Pattern multipliers require multiple events — single incidents cannot skew score<br/>• Constitutional AI upgrade runs in background — does not block live scoring<br/>• Local classifier ensures zero downtime for scoring even if API unavailable</div>
      </div>
    </div>
    {/* Contact */}
    <div style={{background:"rgba(255,255,255,0.02)",border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:14,padding:"20px"}}>
      <div style={{fontSize:13,fontWeight:700,color:"#f1f5f9",marginBottom:8}}>📬 Contact & Report Issues</div>
      <div style={{fontSize:12,color:"#94a3b8",lineHeight:1.8}}>To report data errors, suggest corrections, or flag misclassified events: submit a report through the Submit page. All submissions are SHA-256 hashed for evidentiary integrity. Corrections are reviewed by human editors before publication.<br/><br/>This platform is published as a public information service. No government, political party, or commercial entity funds or directs its editorial decisions.</div>
    </div>
  </div>);
}

// ── STEP S: ABOUT PAGE ────────────────────────────────────────
function AboutPage(){
  return(<div style={{paddingBottom:40}}>
    <div style={{marginBottom:20}}><div style={{fontSize:10,color:"#64748b",textTransform:"uppercase",marginBottom:4}}>Step S — Platform Positioning</div><h2 style={{fontSize:24,fontWeight:800,color:"#f1f5f9",margin:"0 0 5px"}}>About DTN Mythos</h2><p style={{color:"#64748b",fontSize:13,margin:0}}>Constitutional Awareness & Data Transparency System</p></div>
    <div style={{background:"linear-gradient(135deg,rgba(139,92,246,0.08),rgba(239,68,68,0.05))",border:"0.5px solid rgba(139,92,246,0.2)",borderRadius:16,padding:"28px 32px",marginBottom:20}}>
      <div style={{fontSize:22,fontWeight:800,color:"#f1f5f9",marginBottom:10,lineHeight:1.3}}>"Data, not opinion.<br/>Transparency, not accusation.<br/>Awareness, not blame."</div>
      <div style={{fontSize:13,color:"#94a3b8",lineHeight:1.8}}>DTN Mythos is a public information platform that helps citizens, journalists, researchers, and legal professionals understand the constitutional health of Indian democracy through structured, data-driven analysis.<br/><br/>We convert news into constitutional meaning — mapping events to articles, scoring democratic health, and tracking patterns over time. We do not tell citizens what to think. We help them understand what is happening.</div>
    </div>
    {/* What we do vs don't */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:18}}>
      <div style={{background:"rgba(34,197,94,0.05)",border:"0.5px solid rgba(34,197,94,0.2)",borderRadius:12,padding:"16px"}}><div style={{fontSize:11,color:"#22c55e",fontWeight:800,textTransform:"uppercase",marginBottom:8}}>✓ What We Do</div><div style={{fontSize:12,color:"#94a3b8",lineHeight:1.8}}>• Convert news to constitutional significance<br/>• Track democratic health scores over time<br/>• Map events to specific constitutional articles<br/>• Detect patterns across time, geography, and institution<br/>• Provide citizens with rights information and legal resources<br/>• Maintain full methodology transparency<br/>• Apply consistent analysis across all parties and states</div></div>
      <div style={{background:"rgba(239,68,68,0.05)",border:"0.5px solid rgba(239,68,68,0.2)",borderRadius:12,padding:"16px"}}><div style={{fontSize:11,color:"#ef4444",fontWeight:800,textTransform:"uppercase",marginBottom:8}}>✕ What We Don't Do</div><div style={{fontSize:12,color:"#94a3b8",lineHeight:1.8}}>• Make legal accusations against named individuals<br/>• Take partisan political positions<br/>• Claim to be a definitive authority on constitutional law<br/>• Auto-approve citizen submissions — human review required<br/>• Allow any government, party, or funder to direct editorial decisions<br/>• Reproduce or amplify hate speech or disinformation<br/>• Publish unverified information as fact</div></div>
    </div>
    {/* Target audience */}
    <div style={{background:"rgba(255,255,255,0.02)",border:"0.5px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"16px",marginBottom:16}}>
      <div style={{fontSize:11,color:"#f1f5f9",fontWeight:700,marginBottom:8}}>Who This Platform Serves</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
        {[{icon:"👩‍⚖️",l:"Lawyers & Legal Professionals",d:"Quick constitutional mapping of news events for case research and rights litigation"},{icon:"📰",l:"Journalists & Researchers",d:"Data-driven context for constitutional reporting; pattern detection for investigative work"},{icon:"🎓",l:"Students & Educators",d:"Real-time constitutional education — connect news to articles and democratic theory"},{icon:"👤",l:"Citizens",d:"Understand your rights, your state's constitutional health, and what you can do"},{icon:"🏛️",l:"Civil Society Organisations",d:"Systematic tracking of rights violations for documentation and advocacy"},{icon:"🌏",l:"International Observers",d:"Structured English-language constitutional data on Indian democracy trends"}].map(m=><div key={m.l} style={{background:"rgba(255,255,255,0.03)",borderRadius:8,padding:"10px 12px"}}><div style={{fontSize:20,marginBottom:5}}>{m.icon}</div><div style={{fontSize:11,fontWeight:700,color:"#f1f5f9",marginBottom:3}}>{m.l}</div><div style={{fontSize:10,color:"#64748b",lineHeight:1.5}}>{m.d}</div></div>)}
      </div>
    </div>
    {/* Step R: Deployment note */}
    <div style={{background:"rgba(59,130,246,0.04)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:12,padding:"16px",marginBottom:16}}>
      <div style={{fontSize:11,color:"#60a5fa",fontWeight:700,marginBottom:6}}>🚀 Production Architecture (Step R)</div>
      <div style={{fontSize:11,color:"#94a3b8",lineHeight:1.7}}>This platform is built for 24/7 live operation. Backend: FastAPI + PostgreSQL + Redis + Celery. Frontend: React + recharts. Live news ingestion: Claude web search → local constitutional classifier → firewall validation → immediate scoring. AI constitutional upgrade runs in background. Docker deployment with nginx reverse proxy. Auto-restart with health checks.</div>
    </div>
    <div style={{background:"rgba(255,255,255,0.02)",border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"16px"}}>
      <div style={{fontSize:11,color:"#f1f5f9",fontWeight:700,marginBottom:6}}>🔒 Data & Privacy</div>
      <div style={{fontSize:11,color:"#94a3b8",lineHeight:1.7}}>All submitted citizen reports are SHA-256 hashed for evidentiary integrity. No personally identifiable information is stored beyond what you voluntarily provide. The platform does not track users or serve advertisements. Score data is published openly for public benefit.</div>
    </div>
  </div>);
}

// ═══════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════
export default function App(){
  const {toasts,success,error:toastError,info,warn}=useToasts();
  const [scope,setScope]=usePersistentScope();
  const [stories,setStories]=useState([]);
  const [anomalies]=useState(SEED_ANOMALIES);
  const [auditLog,setAuditLog]=useState([]);
  const [page,setPage]=useState("dashboard");
  const [level,setLevel]=useState(scope.type||"national");
  const [selState,setSelState]=useState(scope.state||"Uttar Pradesh");
  const [selDistrict,setSelDistrict]=useState(scope.district||"Lucknow");
  const [timeF,setTimeF]=useState("all");const [catF,setCatF]=useState("all");const [artF,setArtF]=useState(null);const [search,setSearch]=useState("");const [expanded,setExpanded]=useState(null);
  const [role,setRole]=useState("public");
  const [autoRefresh,setAutoRefresh]=useState(true);
  const [nextTick,setNextTick]=useState(60);
  const [lastUpdated,setLastUpdated]=useState(null);
  const [fetching,setFetching]=useState(false);
  const [fetchStatus,setFetchStatus]=useState("");
  const [fetchLog,setFetchLog]=useState([]);
  const [scoreHistory,setScoreHistory]=useState([]);
  const [prevScore,setPrevScore]=useState(null);
  const [scorePulse,setScorePulse]=useState(null);
  const [upgradeQueue,setUpgradeQueue]=useState([]);
  const [upgrading,setUpgrading]=useState(false);
  const [patterns,setPatterns]=useState([]);
  const [showShare,setShowShare]=useState(false);
  const [storyCount,setStoryCount]=useState({fetched:0,approved:0,held:0,aiUpgraded:0});

  const storiesRef=useRef([]);const countdownRef=useRef(null);const cycleRef=useRef(false);const upgradeRef=useRef(false);
  useEffect(()=>{storiesRef.current=stories;},[stories]);

  // Persist scope
  useEffect(()=>{setScope({type:level,state:selState,district:selDistrict});},[level,selState,selDistrict]);

  const logFetch=(msg,type="info")=>setFetchLog(l=>[...l.slice(-40),{msg,type,ts:Date.now()}]);
  const saveS=async l=>{try{await window.storage.set(SK,JSON.stringify(l),false);}catch{}try{await window.storage.set(SHK,JSON.stringify(l),true);}catch{}};
  const saveA=async l=>{try{await window.storage.set(AK,JSON.stringify(l),false);}catch{}};

  // Load from storage on mount
  useEffect(()=>{
    const load=async()=>{
      let saved=[];
      try{const r=await window.storage.get(SHK,true);if(r?.value)saved=JSON.parse(r.value);}catch{}
      try{const r=await window.storage.get(SK,false);if(r?.value){const p=JSON.parse(r.value);const ids=new Set(saved.map(x=>x.id));p.forEach(x=>{if(!ids.has(x.id))saved.push(x);});}}catch{}
      const ids=new Set(saved.map(x=>x.id));
      const merged=[...SEED.filter(x=>!ids.has(x.id)),...saved].sort((a,b)=>new Date(b.ts)-new Date(a.ts));
      setStories(merged);storiesRef.current=merged;
      setPatterns(detectPatterns(merged));
      const ns=calcNat(merged);setScoreHistory([{ts:Date.now(),score:ns,label:"Now"}]);setPrevScore(ns);
      try{const r=await window.storage.get(AK,false);if(r?.value)setAuditLog(JSON.parse(r.value));}catch{}
      info("Platform loaded · 24/7 live constitutional monitoring active");
    };
    load();
  },[]);

  // Live scores
  const natScore=calcNat(stories);const stScore=calcSt(stories,selState);const distScore=calcDist(stories,selState,selDistrict);
  const liveScore=level==="local"?distScore:level==="state"?stScore:natScore;const band=getBand(liveScore);
  const liveStories=useMemo(()=>stories.filter(s=>s.is_live_fetch&&s.review_status==="approved"),[stories]);
  const topNegative=useMemo(()=>getScopedStories(stories,level,selState,selDistrict).filter(s=>s.direction==="negative").sort((a,b)=>Math.abs(b.score_delta)-Math.abs(a.score_delta))[0],[stories,level,selState,selDistrict]);

  // Score pulse
  useEffect(()=>{
    if(prevScore===null)return;
    if(liveScore!==prevScore){
      const d=liveScore-prevScore;setScorePulse({delta:d});
      const now=new Date();const label=`${now.getHours()}:${String(now.getMinutes()).padStart(2,"0")}`;
      setScoreHistory(h=>[...h.slice(-19),{ts:Date.now(),score:liveScore,label}]);
      if(d>0)success(`▲ Score +${d} pts — live constitutional update`);else toastError(`▼ Score ${d} pts — live constitutional update`);
      setTimeout(()=>setScorePulse(null),5000);
    }
    setPrevScore(liveScore);
  },[liveScore]);

  // ─── CORE PIPELINE ──────────────────────────────────────────
  const runPipeline=useCallback(async()=>{
    if(fetching||cycleRef.current)return;
    cycleRef.current=true;setFetching(true);
    const scope2=level==="national"?"India":level==="state"?selState:`${selDistrict}, ${selState}`;
    setFetchStatus(`Fetching live news for ${scope2}...`);
    logFetch(`Starting live fetch — ${scope2}`);
    try{
      const rawStories=await fetchLiveNews(level,selState,selDistrict);
      if(!rawStories||rawStories.length===0){setFetchStatus("No new stories found from web search");logFetch("No stories returned","warn");warn("No new stories found — will retry next cycle");cycleRef.current=false;setFetching(false);return;}
      logFetch(`Fetched ${rawStories.length} stories from web search`,"success");
      setFetchStatus(`Classifying ${rawStories.length} stories constitutionally...`);
      const classified=[];
      for(const raw of rawStories){
        const clf=localClassify(raw.headline,raw.body);
        const story={id:`live_${Date.now()}_${Math.random().toString(36).substr(2,5)}`,ts:raw.published?new Date(raw.published).toISOString():new Date().toISOString(),level,state:level!=="national"?selState:null,district:level==="local"?selDistrict:null,headline:raw.headline,body:raw.body||"",source:raw.source?`${raw.source} · Apr 2026`:"Live News · Apr 2026",source_conf:"single_source",is_live_fetch:true,local_classified:true,ai_upgraded:false,...clf,...buildMythos({...clf,headline:raw.headline})};
        const fw=firewallCheck(story);
        story.firewall_decision=fw.decision;story.firewall_reason=fw.reason;story.confidence=fw.confidence;
        if(fw.decision==="allow"||fw.decision==="allow_with_log"){
          story.score_delta=fw.adjusted_delta;story.review_status="approved";story.reviewed_by="Local Classifier";story.reviewed_at=new Date().toISOString();
          classified.push(story);logFetch(`✓ ${story.headline.slice(0,55)}... [${story.pillar}, ${fw.decision}, ${fw.adjusted_delta>0?"+":""}${fw.adjusted_delta}pts]`,"success");
        }else{story.review_status="pending";classified.push(story);logFetch(`⛨ Held: ${story.headline.slice(0,50)}... [${fw.reason}]`,"warn");}
      }
      const existingHeadlines=new Set(storiesRef.current.map(s=>s.headline.slice(0,35)));
      const newStories=classified.filter(s=>!existingHeadlines.has(s.headline.slice(0,35)));
      if(newStories.length===0){setFetchStatus("Stories already in feed — no duplicates added");logFetch("All fetched stories already in feed");cycleRef.current=false;setFetching(false);info("Feed up to date — no new stories");return;}
      const updated=[...newStories,...storiesRef.current];
      setStories(updated);storiesRef.current=updated;await saveS(updated);setPatterns(detectPatterns(updated));
      const approved=newStories.filter(s=>s.review_status==="approved").length;
      const held=newStories.filter(s=>s.review_status==="pending").length;
      setStoryCount(c=>({...c,fetched:c.fetched+newStories.length,approved:c.approved+approved,held:c.held+held}));
      setUpgradeQueue(q=>[...q,...newStories.filter(s=>s.review_status==="approved").map(s=>s.id)]);
      setLastUpdated(new Date().toISOString());
      const msg=`${approved} live stories approved & scored · ${held} held by firewall`;
      setFetchStatus(msg);logFetch(msg,"success");
      if(approved>0)success(`⚡ ${approved} live stories classified & scored · Score updating now`);else warn(`${held} stories held by firewall — insufficient constitutional signal`);
    }catch(e){setFetchStatus(`Fetch failed: ${e.message}`);logFetch(`Error: ${e.message}`,"error");toastError(`Fetch failed: ${e.message} — will retry next cycle`);}
    setFetching(false);cycleRef.current=false;
  },[fetching,level,selState,selDistrict]);

  // AI upgrade background
  useEffect(()=>{
    if(upgradeQueue.length===0||upgrading)return;
    const run=async()=>{
      setUpgrading(true);
      const id=upgradeQueue[0];
      const story=storiesRef.current.find(s=>s.id===id);
      if(story&&!story.ai_upgraded&&story.review_status==="approved"){
        const result=await aiUpgradeStory(story);
        if(result){
          const updated=storiesRef.current.map(s=>s.id===id?{...s,...result,score_delta:Math.max(-6,Math.min(6,result.score_delta||s.score_delta)),ai_upgraded:true,...buildMythos({...s,...result,headline:s.headline}),mythos_summary:result.mythos_summary||s.mythos_summary,democratic_consequence:result.democratic_consequence||s.democratic_consequence,civic_risk:result.civic_risk||s.civic_risk,short_public_explanation:result.short_public_explanation||s.short_public_explanation,mythos_generated:true}:s);
          setStories(updated);storiesRef.current=updated;await saveS(updated);setPatterns(detectPatterns(updated));
          setStoryCount(c=>({...c,aiUpgraded:c.aiUpgraded+1}));
        }
      }
      setUpgradeQueue(q=>q.slice(1));setUpgrading(false);
    };
    const t=setTimeout(run,2500);return()=>clearTimeout(t);
  },[upgradeQueue,upgrading]);

  // 24/7 countdown
  useEffect(()=>{
    if(countdownRef.current)clearInterval(countdownRef.current);
    if(!autoRefresh){setNextTick(60);return;}
    setNextTick(60);
    countdownRef.current=setInterval(()=>{setNextTick(n=>{if(n<=1){if(!cycleRef.current)runPipeline();return 60;}return n-1;});},1000);
    return()=>{if(countdownRef.current)clearInterval(countdownRef.current);};
  },[autoRefresh,runPipeline]);

  // Step Q: auto-poll dashboard data
  useEffect(()=>{
    const pollInterval=setInterval(()=>{setPatterns(detectPatterns(storiesRef.current));},30000);
    return()=>clearInterval(pollInterval);
  },[]);

  const handleReview=async(id,action)=>{
    const updated=stories.map(s=>s.id===id?{...s,review_status:action,reviewed_at:new Date().toISOString(),reviewed_by:role}:s);
    setStories(updated);await saveS(updated);setPatterns(detectPatterns(updated));
    const nL=[...auditLog,{ts:new Date().toISOString(),action,id,headline:stories.find(s=>s.id===id)?.headline||"",reviewer:role}];setAuditLog(nL);await saveA(nL);
    if(action==="approved")success(`Approved — score updating live`);else warn(`${action} — removed from public feed`);
  };
  const handleArtFilter=art=>{setArtF(art===artF?null:art);if(art)setPage("feed");};
  const handleState=st=>{setSelState(st);setLevel("state");setPage("feed");};

  const isR=role==="reviewer"||role==="legal"||role==="admin";
  const pendingCount=stories.filter(s=>s.review_status==="pending").length;
  const systemicCount=patterns.filter(p=>p.pattern_class==="systemic").length;
  const artV={};stories.filter(s=>s.review_status==="approved").forEach(s=>{(s.violations||[]).forEach(v=>{artV[v.a]=(artV[v.a]||0)+1;});});
  const topArt=Object.entries(artV).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const latestMythos=stories.filter(s=>s.review_status==="approved"&&s.mythos_summary).sort((a,b)=>new Date(b.ts)-new Date(a.ts))[0];
  const systemicPatterns=patterns.filter(p=>p.pattern_class==="systemic"||p.pattern_class==="repeated").slice(0,3);

  const NAV=[{id:"dashboard",l:"Dashboard"},{id:"myrights",l:"My Rights"},{id:"feed",l:"Live Feed"+(liveStories.length>0?" ("+liveStories.length+")":"")},{id:"patterns",l:"Patterns"+(systemicCount>0?" ("+systemicCount+")":"")},{id:"timeline",l:"Timeline"},{id:"constitution",l:"Constitution"},{id:"anomalies",l:"Anomalies"},{id:"states",l:"State Rankings"},{id:"score",l:"Score Analysis"},{id:"submit",l:"Submit"},...(isR?[{id:"review",l:`Review (${pendingCount})`}]:[]),{id:"transparency",l:"Methodology"},{id:"about",l:"About"}];

  return(<div style={{minHeight:"100vh",background:"#06101d",color:"#f1f5f9",fontFamily:"'Segoe UI',system-ui,sans-serif",display:"flex",flexDirection:"column"}}>
    <style>{`@keyframes rPulse{0%{transform:scale(1);opacity:.7}100%{transform:scale(1.6);opacity:0}}@keyframes aiPulse{0%,100%{opacity:1}50%{opacity:.4}}@keyframes slideIn{from{transform:translateX(20px);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
    <ToastContainer toasts={toasts}/>
    {showShare&&<ShareCard score={liveScore} band={band} liveCount={stories.filter(s=>s.review_status==="approved").length} topIssue={topNegative?.headline} onClose={()=>setShowShare(false)}/>}

    {/* NAV */}
    <nav style={{background:"rgba(6,16,29,0.98)",borderBottom:"0.5px solid rgba(255,255,255,0.07)",position:"sticky",top:0,zIndex:200,backdropFilter:"blur(10px)"}}>
      <div style={{display:"flex",alignItems:"center",height:52,padding:"0 14px",gap:5,overflowX:"auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:7,marginRight:8,flexShrink:0}}>
          <div style={{width:26,height:26,borderRadius:6,background:"linear-gradient(135deg,#8b5cf6,#ef4444)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:12,color:"#fff"}}>D</div>
          <div><span style={{fontSize:10,fontWeight:800,color:"#f1f5f9",display:"block",whiteSpace:"nowrap"}}>DTN Mythos</span><span style={{fontSize:7,color:"#334155",display:"block",whiteSpace:"nowrap"}}>CONSTITUTIONAL AWARENESS & DATA TRANSPARENCY · INDIA · LIVE 24/7</span></div>
        </div>
        <div style={{display:"flex",gap:2,background:"rgba(255,255,255,0.04)",borderRadius:7,padding:3,flexShrink:0}}>{["national","state","local"].map(l=><button key={l} onClick={()=>setLevel(l)} style={{background:level===l?"rgba(239,68,68,0.2)":"transparent",color:level===l?"#ef4444":"#64748b",border:"none",borderRadius:5,padding:"3px 9px",fontSize:10,fontWeight:700,cursor:"pointer",textTransform:"capitalize"}}>{l}</button>)}</div>
        {(level==="state"||level==="local")&&<select value={selState} onChange={e=>{setSelState(e.target.value);setSelDistrict(DISTRICTS[e.target.value]?.[0]||"");}} style={{background:"rgba(255,255,255,0.05)",color:"#94a3b8",border:"0.5px solid rgba(255,255,255,0.12)",borderRadius:6,padding:"3px 7px",fontSize:10,colorScheme:"dark",flexShrink:0}}>{STATES_LIST.map(s=><option key={s}>{s}</option>)}</select>}
        {level==="local"&&DISTRICTS[selState]&&<select value={selDistrict} onChange={e=>setSelDistrict(e.target.value)} style={{background:"rgba(255,255,255,0.05)",color:"#94a3b8",border:"0.5px solid rgba(255,255,255,0.12)",borderRadius:6,padding:"3px 7px",fontSize:10,colorScheme:"dark",flexShrink:0}}>{DISTRICTS[selState].map(d=><option key={d}>{d}</option>)}</select>}
        <div style={{flex:1}}/>
        <div style={{display:"flex",gap:1,flexShrink:0}}>{NAV.map(n=><button key={n.id} onClick={()=>setPage(n.id)} style={{background:page===n.id?"rgba(139,92,246,0.1)":"transparent",color:page===n.id?"#c084fc":"#64748b",border:"none",borderBottom:page===n.id?"2px solid #c084fc":"2px solid transparent",padding:"4px 8px",fontSize:10,fontWeight:page===n.id?700:500,cursor:"pointer",whiteSpace:"nowrap"}}>{n.l}</button>)}</div>
        {upgrading&&<span style={{fontSize:9,color:"#8b5cf6",fontWeight:700,animation:"aiPulse 1s infinite",flexShrink:0,whiteSpace:"nowrap"}}>✨ AI</span>}
        <button onClick={()=>setAutoRefresh(v=>!v)} style={{background:autoRefresh?"rgba(34,197,94,0.12)":"rgba(255,255,255,0.04)",color:autoRefresh?"#22c55e":"#64748b",border:`1px solid ${autoRefresh?"rgba(34,197,94,0.3)":"rgba(255,255,255,0.1)"}`,borderRadius:6,padding:"3px 9px",fontSize:9,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>{autoRefresh?`● 24/7 ${nextTick}s`:"24/7 OFF"}</button>
        <select value={role} onChange={e=>setRole(e.target.value)} style={{background:"rgba(255,255,255,0.04)",color:"#64748b",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:6,padding:"3px 7px",fontSize:10,colorScheme:"dark",flexShrink:0}}>{["public","journalist","reviewer","legal","admin"].map(r=><option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}</select>
        <div style={{display:"flex",alignItems:"center",gap:5,borderLeft:"0.5px solid rgba(255,255,255,0.08)",paddingLeft:9,flexShrink:0}}>
          {scoreHistory.length>1&&<Sparkline data={scoreHistory.map(h=>h.score)} color={band.c} w={38} h={14}/>}
          <div style={{width:7,height:7,borderRadius:"50%",background:band.c,boxShadow:`0 0 6px ${band.c}`,animation:autoRefresh?"aiPulse 2s infinite":undefined}}/>
          <span style={{fontSize:15,fontWeight:800,color:band.c,lineHeight:1}}>{liveScore}</span>
          {scorePulse&&<span style={{fontSize:9,fontWeight:800,color:scorePulse.delta>0?"#22c55e":"#ef4444"}}>{scorePulse.delta>0?`+${scorePulse.delta}`:scorePulse.delta}</span>}
          <button onClick={()=>setShowShare(true)} title="Share Today's Democracy Score" style={{background:"rgba(139,92,246,0.1)",color:"#c084fc",border:"0.5px solid rgba(139,92,246,0.25)",borderRadius:6,padding:"3px 8px",fontSize:9,fontWeight:700,cursor:"pointer",marginLeft:4}}>Share</button>
        </div>
      </div>
      <div style={{background:"rgba(139,92,246,0.04)",borderTop:"0.5px solid rgba(139,92,246,0.1)",padding:"3px 14px",display:"flex",gap:10,alignItems:"center"}}>
        <span style={{fontSize:9,color:"#c084fc",fontWeight:800,letterSpacing:".1em",textTransform:"uppercase",fontFamily:"monospace",whiteSpace:"nowrap"}}>✨ DTN MYTHOS · LIVE APR 16 2026</span>
        <div style={{fontSize:10,color:"#475569",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{level==="local"?`${selDistrict}, ${selState}`:level==="state"?selState:"All India"} · {stories.filter(s=>s.review_status==="approved").length} verified · Score: {liveScore}/100 · {band.l} · {liveStories.length} live · {patterns.length} patterns ({systemicCount} systemic) · {autoRefresh?`Next fetch: ${nextTick}s`:"Paused"}{pendingCount>0?` · ⏳ ${pendingCount} pending`:""}</div>
      </div>
    </nav>

    <main style={{flex:1,maxWidth:1140,margin:"0 auto",width:"100%",padding:"22px 20px 40px",boxSizing:"border-box"}}>

    {/* ── DASHBOARD ───────────────────────────────────────────── */}
    {page==="dashboard"&&<div style={{paddingBottom:40}}>
      {/* Score header */}
      <div style={{background:band.bg,border:`0.5px solid ${band.c}30`,borderRadius:16,padding:"26px 30px",marginBottom:20,display:"flex",gap:26,alignItems:"flex-start",flexWrap:"wrap"}}>
        <div><Ring score={liveScore} size={128} pulse={!!scorePulse}/>{scoreHistory.length>1&&<div style={{marginTop:6,display:"flex",justifyContent:"center"}}><Sparkline data={scoreHistory.map(h=>h.score)} color={band.c} w={90} h={22}/></div>}</div>
        <div style={{flex:1}}>
          <div style={{fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:".1em",marginBottom:6}}>CONSTITUTIONAL AWARENESS & DATA TRANSPARENCY SYSTEM · REAL DATA · LIVE 24/7 · APR 16 2026</div>
          <h1 style={{fontSize:24,fontWeight:800,color:"#f1f5f9",margin:"0 0 8px"}}>India Democracy Health Score</h1>
          <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
            <span style={{background:band.bg,color:band.c,border:`1px solid ${band.c}40`,borderRadius:6,padding:"4px 14px",fontSize:12,fontWeight:700,textTransform:"uppercase"}}>{band.l}</span>
            {fetching&&<span style={{fontSize:10,color:"#3b82f6",fontWeight:700,animation:"aiPulse 1s infinite"}}>● Fetching live news...</span>}
            {upgrading&&<span style={{fontSize:10,color:"#8b5cf6",fontWeight:700,animation:"aiPulse 1s infinite"}}>✨ AI upgrading...</span>}
            <button onClick={()=>setShowShare(true)} style={{background:"rgba(139,92,246,0.1)",color:"#c084fc",border:"0.5px solid rgba(139,92,246,0.25)",borderRadius:6,padding:"4px 12px",fontSize:10,fontWeight:700,cursor:"pointer"}}>📤 Share Today's Score</button>
          </div>
          <p style={{color:"#94a3b8",fontSize:12,lineHeight:1.7,margin:"0 0 10px",maxWidth:540}}>{getScopedStories(stories,level,selState,selDistrict).filter(s=>s.direction==="negative").length>0?"Score is below baseline because severe rights violations and institutional breakdown outweigh safeguards in this scope.":"Score reflects current constitutional health based on verified real-time data."}</p>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>{[{l:"Freedom House 2025",v:"63/100",c:"#f97316"},{l:"V-Dem Rank 2025",v:"100/179",c:"#ef4444"},{l:"RSF Press Freedom",v:"151/180",c:"#ef4444"},{l:"EIU Democracy",v:"6.6/10",c:"#f97316"}].map(m=>(<div key={m.l} style={{background:"rgba(255,255,255,0.04)",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"7px 12px"}}><div style={{fontSize:9,color:"#64748b"}}>{m.l}</div><div style={{fontSize:13,fontWeight:700,color:m.c}}>{m.v}</div></div>))}</div>
        </div>
      </div>

      {/* STEP Q: Score History Chart */}
      {scoreHistory.length>3&&<div style={{background:"rgba(255,255,255,0.02)",border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"14px",marginBottom:18}}>
        <div style={{fontSize:12,fontWeight:700,color:"#f1f5f9",marginBottom:8}}>Score History — Live Session</div>
        <ResponsiveContainer width="100%" height={100}><LineChart data={scoreHistory}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/><XAxis dataKey="label" tick={{fill:"#64748b",fontSize:8}} axisLine={false} tickLine={false}/><YAxis domain={[Math.max(0,Math.min(...scoreHistory.map(h=>h.score))-5),Math.min(100,Math.max(...scoreHistory.map(h=>h.score))+5)]} tick={{fill:"#64748b",fontSize:8}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:"#1e293b",border:"0.5px solid rgba(255,255,255,0.12)",borderRadius:8,fontSize:11}}/><Line type="monotone" dataKey="score" stroke={band.c} strokeWidth={2} dot={{fill:band.c,strokeWidth:0,r:3}}/></LineChart></ResponsiveContainer>
      </div>}

      {/* Live fetch panel */}
      <div style={{background:"rgba(59,130,246,0.04)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:14,padding:"16px",marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:8}}>
          <div><div style={{fontSize:13,fontWeight:700,color:"#60a5fa",marginBottom:2}}>⚡ Live Constitutional News — Auto-Scored</div><div style={{fontSize:11,color:"#64748b"}}>Fetched news is locally classified (pillar/violations/delta) → firewall validated → immediately approved → score updates. AI refines in background.</div></div>
          <div style={{display:"flex",gap:7}}>
            <button onClick={()=>runPipeline()} disabled={fetching} style={{background:fetching?"rgba(255,255,255,0.04)":"rgba(59,130,246,0.15)",color:fetching?"#334155":"#60a5fa",border:`1px solid ${fetching?"rgba(255,255,255,0.06)":"rgba(59,130,246,0.35)"}`,borderRadius:8,padding:"8px 16px",fontSize:12,fontWeight:700,cursor:fetching?"not-allowed":"pointer",whiteSpace:"nowrap"}}>{fetching?"Fetching...":"⚡ Fetch Now"}</button>
            <button onClick={()=>setAutoRefresh(v=>!v)} style={{background:autoRefresh?"rgba(34,197,94,0.1)":"rgba(255,255,255,0.04)",color:autoRefresh?"#22c55e":"#64748b",border:`1px solid ${autoRefresh?"rgba(34,197,94,0.3)":"rgba(255,255,255,0.1)"}`,borderRadius:8,padding:"8px 12px",fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>{autoRefresh?`AUTO ${nextTick}s`:"AUTO OFF"}</button>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:8}}>
          {[{l:"Fetched",v:storyCount.fetched,c:"#3b82f6"},{l:"Auto-Approved",v:storyCount.approved,c:"#22c55e"},{l:"Firewall Held",v:storyCount.held,c:"#f59e0b"},{l:"AI Upgraded",v:storyCount.aiUpgraded,c:"#8b5cf6"}].map(m=><div key={m.l} style={{background:"rgba(255,255,255,0.03)",borderRadius:8,padding:"7px 10px"}}><div style={{fontSize:9,color:"#64748b",marginBottom:1}}>{m.l}</div><div style={{fontSize:17,fontWeight:800,color:m.c}}>{m.v}</div></div>)}
        </div>
        {fetchStatus&&<div style={{fontSize:10,color:"#60a5fa",fontFamily:"monospace",marginBottom:5}}>{fetching?"⟳ ":"→ "}{fetchStatus}</div>}
        {fetchLog.length>0&&<div style={{maxHeight:60,overflow:"auto",background:"rgba(0,0,0,0.2)",borderRadius:6,padding:"5px 8px"}}>{fetchLog.slice(-4).reverse().map((l,i)=><div key={i} style={{fontSize:8,color:l.type==="success"?"#22c55e":l.type==="warn"?"#f59e0b":l.type==="error"?"#ef4444":"#475569",fontFamily:"monospace",marginBottom:1}}>{l.msg}</div>)}</div>}
      </div>

      {/* Live stories */}
      {liveStories.length>0&&<div style={{background:"rgba(59,130,246,0.04)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:12,padding:"13px 16px",marginBottom:16}}>
        <div style={{fontSize:10,color:"#60a5fa",fontWeight:800,textTransform:"uppercase",marginBottom:8}}>● Live Stories — Constitutional Scores Active</div>
        {liveStories.slice(0,4).map(s=>{const dc=s.direction==="positive"?"#22c55e":s.direction==="negative"?"#ef4444":"#f59e0b";return(<div key={s.id} style={{marginBottom:8,paddingBottom:8,borderBottom:"0.5px solid rgba(59,130,246,0.1)"}}>
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:3,alignItems:"center"}}>
            <span style={{fontSize:9,color:"#3b82f6",background:"rgba(59,130,246,0.12)",borderRadius:4,padding:"2px 6px",fontWeight:700}}>● LIVE</span>
            <span style={{fontSize:9,color:CAT_C[s.category]||"#64748b",background:`${CAT_C[s.category]||"#64748b"}15`,borderRadius:4,padding:"2px 6px",fontWeight:700,textTransform:"uppercase"}}>{(s.category||"").split("_").join(" ")}</span>
            {(s.violations||[]).slice(0,2).map((v,i)=><APill key={i} article={v.a} type="violation" onClick={()=>handleArtFilter(v.a)}/>)}
            {(s.supports||[]).slice(0,1).map((v,i)=><APill key={i} article={v.a} type="support" onClick={()=>handleArtFilter(v.a)}/>)}
            <span style={{fontSize:10,fontWeight:800,color:dc,marginLeft:"auto"}}>{s.score_delta>0?`▲ +${s.score_delta}`:s.score_delta<0?`▼ ${s.score_delta}`:"↔ 0"} pts</span>
          </div>
          <div style={{fontSize:13,fontWeight:700,color:"#f1f5f9",lineHeight:1.4}}>{s.headline}</div>
          {s.short_public_explanation&&<div style={{fontSize:11,color:"#64748b",marginTop:2}}>{s.short_public_explanation}</div>}
        </div>);})}
      </div>}

      {/* Pattern alerts */}
      {systemicPatterns.length>0&&<div style={{background:"rgba(239,68,68,0.04)",border:"0.5px solid rgba(239,68,68,0.2)",borderRadius:12,padding:"12px 16px",marginBottom:16}}>
        <div style={{fontSize:9,color:"#ef4444",fontWeight:800,textTransform:"uppercase",marginBottom:8}}>⚠ Mythos Pattern Alerts — {systemicPatterns.length} Active</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{systemicPatterns.map(p=>{const pc=PATTERN_CLASSES[p.pattern_class];return(<div key={p.key} onClick={()=>setPage("patterns")} style={{background:pc.bg,border:`0.5px solid ${pc.color}35`,borderRadius:8,padding:"7px 11px",cursor:"pointer",flex:1,minWidth:140}}><div style={{fontSize:10,fontWeight:700,color:pc.color,marginBottom:2}}>{pc.dot} {pc.label} ×{pc.mult}</div><div style={{fontSize:11,color:"#f1f5f9",fontWeight:600}}>{PILLARS[p.pillar]?.label||p.pillar}</div><div style={{fontSize:10,color:"#64748b"}}>{p.state||"National"} · {p.event_count} events · {p.trend}</div></div>);})}</div>
      </div>}

      {/* Mythos */}
      {latestMythos&&<div style={{background:"rgba(168,85,247,0.05)",border:"0.5px solid rgba(168,85,247,0.25)",borderRadius:12,padding:"13px 16px",marginBottom:16}}>
        <div style={{fontSize:9,color:"#c084fc",fontWeight:800,textTransform:"uppercase",marginBottom:6}}>✨ Latest Mythos Intelligence</div>
        <div style={{fontSize:13,color:"#e2e8f0",lineHeight:1.7,marginBottom:6}}>{latestMythos.mythos_summary}</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}><PBadge status={latestMythos.pattern_status||"isolated"}/><CBadge risk={latestMythos.civic_risk||"medium"}/>{latestMythos.institution&&<span style={{fontSize:9,color:"#f97316",background:"rgba(249,115,22,0.1)",borderRadius:4,padding:"2px 7px"}}>{INST[latestMythos.institution]||latestMythos.institution}</span>}</div>
      </div>}

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
        <Stat label="Verified Events" value={stories.filter(s=>s.review_status==="approved").length} sub="in constitutional score" acc="#22c55e"/>
        <Stat label="Live Fetched" value={liveStories.length} sub="auto-scored today" acc="#3b82f6"/>
        <Stat label="Patterns Detected" value={patterns.length} sub={`${systemicCount} systemic`} acc="#ef4444"/>
        <Stat label="AI Upgraded" value={stories.filter(s=>s.ai_upgraded).length} sub="refined by Claude" acc="#8b5cf6"/>
      </div>

      {/* Drivers */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:18}}>
        <div style={{background:"rgba(239,68,68,0.05)",border:"0.5px solid rgba(239,68,68,0.2)",borderRadius:12,padding:"15px"}}><div style={{fontSize:10,color:"#ef4444",fontWeight:800,textTransform:"uppercase",marginBottom:8}}>▼ Pulling Score Down</div>{getScopedStories(stories,level,selState,selDistrict).filter(s=>s.direction==="negative").sort((a,b)=>Math.abs(b.score_delta)-Math.abs(a.score_delta)).slice(0,3).map((s,i)=><div key={i} style={{marginBottom:8}}><div style={{fontSize:12,fontWeight:700,color:"#f1f5f9",lineHeight:1.4,marginBottom:2}}>{s.headline}</div><div style={{display:"flex",gap:5,flexWrap:"wrap"}}><span style={{fontSize:10,color:"#64748b"}}>{s.score_delta} pts · {s.pillar?.split("_").join(" ")}</span>{s.pattern_status&&s.pattern_status!=="isolated"&&<PBadge status={s.pattern_status}/>}{s.is_live_fetch&&<span style={{fontSize:8,color:"#3b82f6",fontWeight:700}}>● LIVE</span>}</div></div>)}</div>
        <div style={{background:"rgba(34,197,94,0.05)",border:"0.5px solid rgba(34,197,94,0.2)",borderRadius:12,padding:"15px"}}><div style={{fontSize:10,color:"#22c55e",fontWeight:800,textTransform:"uppercase",marginBottom:8}}>▲ Supporting Score</div>{getScopedStories(stories,level,selState,selDistrict).filter(s=>s.direction==="positive").sort((a,b)=>Math.abs(b.score_delta)-Math.abs(a.score_delta)).slice(0,3).map((s,i)=><div key={i} style={{marginBottom:8}}><div style={{fontSize:12,fontWeight:700,color:"#f1f5f9",lineHeight:1.4,marginBottom:2}}>{s.headline}</div><div style={{fontSize:10,color:"#64748b"}}>+{s.score_delta} pts · {s.pillar?.split("_").join(" ")}</div></div>)}</div>
      </div>

      {/* Most violated */}
      {topArt.length>0&&<div style={{background:"rgba(255,255,255,0.02)",border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"14px",marginBottom:16}}>
        <div style={{fontSize:14,fontWeight:700,color:"#f1f5f9",marginBottom:10}}>Most Violated Constitutional Articles</div>
        {topArt.map(([art,cnt])=>{const a=CA[art];return(<div key={art} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><div style={{display:"flex",gap:7,alignItems:"center"}}><span onClick={()=>handleArtFilter(art)} style={{fontSize:9,color:a?.c||"#ef4444",fontFamily:"monospace",fontWeight:800,background:`${a?.c||"#ef4444"}12`,borderRadius:4,padding:"1px 6px",cursor:"pointer"}}>{art}</span><span style={{fontSize:11,color:"#94a3b8"}}>{a?.t}</span></div><span style={{fontSize:12,fontWeight:700,color:"#ef4444"}}>{cnt}×</span></div><div style={{background:"rgba(255,255,255,0.05)",borderRadius:3,height:4}}><div style={{width:`${Math.min((cnt/8)*100,100)}%`,height:"100%",background:"#ef4444",borderRadius:3}}/></div></div>);})}
      </div>}

      {/* Today's events */}
      {stories.filter(s=>isToday(s.ts)&&s.review_status==="approved").length>0&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div style={{fontSize:16,fontWeight:700,color:"#f1f5f9"}}>Today's Constitutional Events</div><button onClick={()=>setPage("feed")} style={{background:"transparent",color:"#64748b",border:"0.5px solid rgba(255,255,255,0.12)",borderRadius:6,padding:"5px 12px",fontSize:12,cursor:"pointer"}}>View All →</button></div>
        {stories.filter(s=>isToday(s.ts)&&s.review_status==="approved").slice(0,5).map(s=>{const dc=s.direction==="positive"?"#22c55e":s.direction==="negative"?"#ef4444":"#f59e0b";return(<div key={s.id} style={{background:s.is_live_fetch?"rgba(59,130,246,0.04)":"rgba(255,255,255,0.02)",border:`0.5px solid ${s.is_live_fetch?"rgba(59,130,246,0.2)":s.severity==="critical"?"rgba(239,68,68,0.25)":"rgba(255,255,255,0.07)"}`,borderRadius:10,padding:"10px 12px",marginBottom:7}}>
          <div style={{display:"flex",gap:5,marginBottom:4,flexWrap:"wrap",alignItems:"center"}}>
            {s.is_live_fetch&&<span style={{fontSize:8,color:"#3b82f6",background:"rgba(59,130,246,0.12)",borderRadius:4,padding:"2px 5px",fontWeight:700}}>● LIVE</span>}
            <span style={{fontSize:9,color:CAT_C[s.category]||"#64748b",background:`${CAT_C[s.category]||"#64748b"}15`,borderRadius:4,padding:"2px 6px",fontWeight:700,textTransform:"uppercase"}}>{(s.category||"").split("_").join(" ")}</span>
            {s.pattern_status&&s.pattern_status!=="isolated"&&<PBadge status={s.pattern_status}/>}
            {(s.violations||[]).slice(0,2).map((v,i)=><APill key={i} article={v.a} type="violation" onClick={()=>handleArtFilter(v.a)}/>)}
            <span style={{fontSize:10,fontWeight:800,color:dc,marginLeft:"auto"}}>{s.score_delta>0?`+${s.score_delta}`:s.score_delta||0} pts</span>
          </div>
          <div style={{fontSize:13,fontWeight:700,color:"#f1f5f9"}}>{s.headline}</div>
          {s.short_public_explanation&&<div style={{fontSize:11,color:"#64748b",marginTop:2}}>{s.short_public_explanation}</div>}
        </div>);})}
      </div>}
    </div>}

    {/* ── MY RIGHTS ─────────────────────────────────────────── */}
    {page==="myrights"&&(()=>{
      const [st,setSt]=useState("");const [dist,setDist]=useState("");const [occ,setOcc]=useState("");const [show,setShow]=useState(false);
      const env=STATE_ENV[st];const o=OCC_RIGHTS[occ];
      const ss=st?calcSt(stories,st):null;const ds=st&&dist?calcDist(stories,st,dist):null;
      const shownS=dist?ds:ss;const shownBand=getBand(shownS??STATE_BASELINES[st]??50);
      const pillars=calcPillars(stories,dist?"local":"state",st||null,dist||null);
      const gapC=g=>g>=80?"#ef4444":g>=60?"#f97316":g>=40?"#f59e0b":"#22c55e";
      return(<div style={{paddingBottom:40}}>
        <div style={{marginBottom:16}}><h2 style={{fontSize:22,fontWeight:800,color:"#f1f5f9",margin:"0 0 5px"}}>My Rights — Constitutional Reality Check</h2><p style={{color:"#64748b",fontSize:12,margin:0}}>Real baselines (Freedom House/V-Dem/RSF/NCRB) + live events + Mythos risk assessment. All informational — not legal advice.</p></div>
        <div style={{background:"rgba(245,158,11,0.04)",border:"0.5px solid rgba(245,158,11,0.2)",borderRadius:8,padding:"8px 12px",marginBottom:16,fontSize:11,color:"#f59e0b"}}>ℹ This section provides constitutional information only. For legal advice, contact NALSA (15100), NHRC (14433), or your State Legal Services Authority.</div>
        <div style={{background:"rgba(99,102,241,0.06)",border:"0.5px solid rgba(99,102,241,0.25)",borderRadius:14,padding:"20px",marginBottom:18}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:14}}>
            <div><label style={{display:"block",fontSize:10,color:"#94a3b8",textTransform:"uppercase",marginBottom:5}}>State *</label><select value={st} onChange={e=>{setSt(e.target.value);setDist("");setShow(false);}} style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"9px 12px",color:"#f1f5f9",fontSize:13,colorScheme:"dark"}}><option value="">Select State</option>{STATES_LIST.map(s=><option key={s}>{s}</option>)}</select></div>
            <div><label style={{display:"block",fontSize:10,color:"#94a3b8",textTransform:"uppercase",marginBottom:5}}>District (optional)</label><select value={dist} onChange={e=>setDist(e.target.value)} style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"9px 12px",color:"#f1f5f9",fontSize:13,colorScheme:"dark"}}><option value="">Select District</option>{(DISTRICTS[st]||[]).map(d=><option key={d}>{d}</option>)}</select></div>
            <div><label style={{display:"block",fontSize:10,color:"#94a3b8",textTransform:"uppercase",marginBottom:5}}>Category *</label><select value={occ} onChange={e=>{setOcc(e.target.value);setShow(false);}} style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"9px 12px",color:"#f1f5f9",fontSize:13,colorScheme:"dark"}}><option value="">Select your situation</option>{Object.keys(OCC_RIGHTS).map(o=><option key={o}>{o}</option>)}</select></div>
          </div>
          <button onClick={()=>{if(st&&occ)setShow(true);}} style={{background:st&&occ?"#6366f1":"rgba(255,255,255,0.04)",color:st&&occ?"#fff":"#475569",border:"none",borderRadius:9,padding:"11px 28px",fontWeight:700,fontSize:14,cursor:st&&occ?"pointer":"not-allowed"}}>Show My Constitutional Rights</button>
        </div>
        {show&&env&&o&&<div>
          <div style={{background:shownBand.bg,border:`0.5px solid ${shownBand.c}30`,borderRadius:14,padding:"18px",marginBottom:14,display:"flex",gap:18,alignItems:"flex-start",flexWrap:"wrap"}}><Ring score={shownS||50} size={108}/><div style={{flex:1}}><div style={{fontSize:19,fontWeight:800,color:"#f1f5f9",marginBottom:5}}>{dist||st}</div><span style={{background:shownBand.bg,color:shownBand.c,border:`1px solid ${shownBand.c}40`,borderRadius:6,padding:"4px 14px",fontSize:12,fontWeight:700,textTransform:"uppercase"}}>{shownBand.l}</span><div style={{marginTop:8,fontSize:12,color:"#94a3b8",lineHeight:1.6}}><b style={{color:"#f1f5f9"}}>Top Issues:</b> {env.topIssues?.join(" · ")}</div>{stories.filter(s=>s.review_status==="approved"&&s.state===st&&(s.pattern_status==="systemic"||s.pattern_status==="repeated")).length>0&&<div style={{marginTop:10,background:"rgba(239,68,68,0.06)",border:"0.5px solid rgba(239,68,68,0.2)",borderRadius:8,padding:"8px 11px"}}><div style={{fontSize:10,color:"#ef4444",fontWeight:700,marginBottom:4}}>⚠ Mythos Pattern Risk in {st}</div>{stories.filter(s=>s.review_status==="approved"&&s.state===st&&["systemic","repeated"].includes(s.pattern_status)).slice(0,3).map((s,i)=><div key={i} style={{fontSize:11,color:"#94a3b8",marginBottom:2}}>{PATTERN_CLASSES[s.pattern_status]?.dot} {s.headline.slice(0,75)}...</div>)}</div>}</div></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div style={{background:"rgba(34,197,94,0.05)",border:"0.5px solid rgba(34,197,94,0.2)",borderRadius:12,padding:"14px"}}><div style={{fontSize:10,color:"#22c55e",fontWeight:800,textTransform:"uppercase",marginBottom:7}}>✓ Constitutional Guarantees</div>{(o.rights||[]).map((r,i)=>{const art=CA[r];return(<div key={i} style={{marginBottom:7}}><div style={{display:"flex",gap:7}}><span style={{fontSize:9,color:"#22c55e",fontFamily:"monospace",background:"rgba(34,197,94,0.12)",borderRadius:4,padding:"2px 6px",whiteSpace:"nowrap"}}>{r}</span><span style={{fontSize:11,color:"#94a3b8",lineHeight:1.4}}>{art?.t||r}</span></div>{art&&<div style={{fontSize:10,color:"#334155",marginLeft:50,lineHeight:1.4}}>{art.s}</div>}</div>);})}</div>
            <div style={{background:"rgba(239,68,68,0.05)",border:"0.5px solid rgba(239,68,68,0.2)",borderRadius:12,padding:"14px"}}><div style={{fontSize:10,color:"#ef4444",fontWeight:800,textTransform:"uppercase",marginBottom:7}}>✕ Ground Reality Threats</div>{(o.threats||[]).map((t,i)=><div key={i} style={{display:"flex",gap:7,marginBottom:5}}><span style={{color:"#ef4444",fontSize:10,flexShrink:0,marginTop:1}}>✕</span><span style={{fontSize:12,color:"#94a3b8",lineHeight:1.5}}>{t}</span></div>)}<div style={{marginTop:8}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:11,color:"#64748b"}}>Rights Gap Index</span><span style={{fontSize:14,fontWeight:800,color:gapC(o.gap)}}>{o.gap}/100</span></div><div style={{background:"rgba(255,255,255,0.05)",borderRadius:4,height:7}}><div style={{width:`${o.gap}%`,height:"100%",background:gapC(o.gap),borderRadius:4}}/></div></div></div>
          </div>
          {(env.missingRights||[]).length>0&&<div style={{background:"rgba(239,68,68,0.04)",border:"0.5px solid rgba(239,68,68,0.2)",borderRadius:12,padding:"12px",marginBottom:12}}><div style={{fontSize:10,color:"#ef4444",fontWeight:800,textTransform:"uppercase",marginBottom:6}}>⚠ Articles At Risk in {st}</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{(env.missingRights||[]).map((r,i)=>{const art=CA[r];return(<div key={i} style={{background:"rgba(239,68,68,0.06)",border:"0.5px solid rgba(239,68,68,0.2)",borderRadius:8,padding:"7px 10px"}}><APill article={r} type="violation" onClick={null}/>{art&&<div style={{fontSize:10,color:"#94a3b8",marginTop:3,maxWidth:160}}>{art.t}</div>}</div>);})}</div></div>}
          <div style={{background:"rgba(34,197,94,0.04)",border:"0.5px solid rgba(34,197,94,0.2)",borderRadius:12,padding:"14px"}}>
            <div style={{fontSize:10,color:"#22c55e",fontWeight:800,textTransform:"uppercase",marginBottom:8}}>→ What You Can Do</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div><div style={{fontSize:9,color:"#64748b",textTransform:"uppercase",marginBottom:5}}>Recommended Actions</div>{(o.actions||[]).map((a,i)=><div key={i} style={{display:"flex",gap:7,marginBottom:5}}><span style={{color:"#22c55e",fontSize:10,flexShrink:0}}>→</span><span style={{fontSize:11,color:"#94a3b8",lineHeight:1.5}}>{a}</span></div>)}</div>
              <div><div style={{fontSize:9,color:"#64748b",textTransform:"uppercase",marginBottom:5}}>Helplines</div><div style={{background:"rgba(255,255,255,0.03)",borderRadius:8,padding:"9px 11px",fontFamily:"monospace",fontSize:11,lineHeight:2,color:"#94a3b8"}}>{[...(env.helplines||[]),...(o.helplines||[])].filter((v,i,a)=>a.indexOf(v)===i).map((h,i)=><div key={i}>{h}</div>)}</div></div>
            </div>
          </div>
        </div>}
        {!show&&!st&&<div style={{textAlign:"center",padding:"60px 0",color:"#334155"}}><div style={{fontSize:30,marginBottom:10}}>🇮🇳</div><div>Select state + category to see constitutional rights + live Mythos risk</div></div>}
      </div>);
    })()}

    {/* ── LIVE FEED ─────────────────────────────────────────── */}
    {page==="feed"&&(()=>{
      const isR2=role==="reviewer"||role==="legal"||role==="admin";
      const filtered=stories.filter(s=>{
        if(!isR2&&s.review_status!=="approved")return false;
        if(catF!=="all"&&s.category!==catF)return false;
        if(timeF==="today"&&!isToday(s.ts))return false;
        if(timeF==="week"&&!isWeek(s.ts))return false;
        if(timeF==="year"&&!isYear(s.ts))return false;
        if(artF&&![...(s.violations||[]),...(s.supports||[])].some(v=>v.a===artF))return false;
        if(search&&!s.headline.toLowerCase().includes(search.toLowerCase()))return false;
        return true;
      });
      return(<div style={{paddingBottom:40}}>
        <div style={{marginBottom:14}}><h2 style={{fontSize:22,fontWeight:800,color:"#f1f5f9",margin:"0 0 8px"}}>Live Feed — {level==="national"?"All India":level==="state"?selState:`${selDistrict}, ${selState}`}</h2>
          <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"}}><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search headlines..." style={{flex:1,minWidth:160,background:"rgba(255,255,255,0.04)",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"8px 12px",color:"#f1f5f9",fontSize:12}}/><button onClick={()=>runPipeline()} disabled={fetching} style={{background:fetching?"rgba(255,255,255,0.03)":"rgba(59,130,246,0.12)",color:fetching?"#334155":"#60a5fa",border:`1px solid ${fetching?"rgba(255,255,255,0.05)":"rgba(59,130,246,0.3)"}`,borderRadius:8,padding:"8px 14px",fontWeight:700,fontSize:12,cursor:fetching?"not-allowed":"pointer",whiteSpace:"nowrap"}}>{fetching?"Fetching...":"⚡ Fetch + Score"}</button><button onClick={()=>setAutoRefresh(v=>!v)} style={{background:autoRefresh?"rgba(34,197,94,0.1)":"rgba(255,255,255,0.04)",color:autoRefresh?"#22c55e":"#64748b",border:`1px solid ${autoRefresh?"rgba(34,197,94,0.3)":"rgba(255,255,255,0.1)"}`,borderRadius:8,padding:"8px 12px",fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>{autoRefresh?`AUTO ↻ ${nextTick}s`:"AUTO OFF"}</button></div>
          {fetchStatus&&<div style={{fontSize:10,color:"#60a5fa",fontFamily:"monospace",marginBottom:5}}>{fetchStatus}</div>}
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:5}}>{["all","today","week","year"].map(t=><button key={t} onClick={()=>setTimeF(t)} style={{background:timeF===t?"rgba(99,102,241,0.15)":"rgba(255,255,255,0.03)",color:timeF===t?"#818cf8":"#64748b",border:`0.5px solid ${timeF===t?"rgba(99,102,241,0.4)":"rgba(255,255,255,0.08)"}`,borderRadius:6,padding:"4px 10px",fontSize:10,cursor:"pointer"}}>{t==="all"?"All":t==="today"?"Today":t==="week"?"This Week":"2026"}</button>)}<div style={{width:1,background:"rgba(255,255,255,0.08)",margin:"0 3px"}}/>{["all","parliament","court","police","press","ec","govt","civil_liberty"].slice(0,7).map(c=><button key={c} onClick={()=>setCatF(c)} style={{background:catF===c?"rgba(239,68,68,0.1)":"rgba(255,255,255,0.03)",color:catF===c?"#ef4444":"#64748b",border:`0.5px solid ${catF===c?"rgba(239,68,68,0.3)":"rgba(255,255,255,0.08)"}`,borderRadius:6,padding:"4px 10px",fontSize:10,cursor:"pointer",textTransform:"capitalize"}}>{c==="all"?"All":c.split("_").join(" ")}</button>)}</div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{[{l:`${filtered.length} stories`,c:"#6366f1"},{l:`${filtered.filter(s=>s.is_live_fetch).length} live`,c:"#3b82f6"},{l:`${filtered.filter(s=>s.direction==="negative").length} negative`,c:"#ef4444"},{l:`${filtered.filter(s=>s.direction==="positive").length} positive`,c:"#22c55e"},{l:`${filtered.filter(s=>s.ai_upgraded).length} AI-upgraded`,c:"#8b5cf6"},{l:`${filtered.filter(s=>s.review_status==="pending").length} pending`,c:"#f59e0b"}].map(m=><span key={m.l} style={{fontSize:9,color:m.c,background:`${m.c}10`,borderRadius:5,padding:"2px 8px"}}>{m.l}</span>)}{artF&&<button onClick={()=>setArtF(null)} style={{fontSize:9,color:"#6366f1",background:"rgba(99,102,241,0.1)",borderRadius:5,padding:"2px 8px",border:"none",cursor:"pointer"}}>Filter: {artF} ✕</button>}</div>
        </div>
        {filtered.length===0?<div style={{textAlign:"center",padding:"60px 0",color:"#334155"}}><div style={{fontSize:28,marginBottom:10}}>📡</div><div>No stories — click ⚡ Fetch + Score to get live news</div></div>:filtered.map(s=><StoryCard key={s.id} s={s} expanded={expanded===s.id} onToggle={()=>setExpanded(expanded===s.id?null:s.id)} onArtFilter={handleArtFilter} showActions={isR2} onReview={handleReview}/>)}
      </div>);
    })()}

    {/* ── PATTERNS ───────────────────────────────────────────── */}
    {page==="patterns"&&<div style={{paddingBottom:40}}>
      <div style={{marginBottom:16}}><h2 style={{fontSize:22,fontWeight:800,color:"#f1f5f9",margin:"0 0 5px"}}>Pattern Lab — Mythos Memory Engine</h2><p style={{color:"#64748b",fontSize:12,margin:0}}>Cross-event constitutional patterns. Score multipliers: isolated×1.0 · emerging×1.15 · repeated×1.3 · systemic×1.5</p></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>{Object.entries(PATTERN_CLASSES).map(([k,pc])=>{const cnt=patterns.filter(p=>p.pattern_class===k).length;return(<div key={k} style={{background:pc.bg,border:`0.5px solid ${pc.color}35`,borderRadius:10,padding:"11px 14px"}}><div style={{fontSize:12,fontWeight:700,color:pc.color,marginBottom:2}}>{pc.dot} {pc.label}</div><div style={{fontSize:22,fontWeight:800,color:pc.color}}>{cnt}</div><div style={{fontSize:9,color:pc.color,opacity:.7}}>×{pc.mult} multiplier</div></div>);})}</div>
      {patterns.length===0?<div style={{textAlign:"center",padding:"40px 0",color:"#334155"}}><div style={{fontSize:28,marginBottom:10}}>🔬</div><div>Fetch more stories to detect cross-event constitutional patterns</div></div>:patterns.map(p=>{const pc=PATTERN_CLASSES[p.pattern_class];return(<div key={p.key} style={{background:"rgba(255,255,255,0.02)",border:`0.5px solid ${pc.color}25`,borderRadius:10,padding:"12px 14px",marginBottom:8}}>
        <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:6}}><div style={{width:8,height:8,borderRadius:"50%",background:pc.color,flexShrink:0}}/><span style={{fontSize:13,fontWeight:700,color:"#f1f5f9"}}>{PILLARS[p.pillar]?.label||p.pillar}</span><span style={{fontSize:9,color:pc.color,background:pc.bg,borderRadius:4,padding:"2px 7px",fontWeight:700,textTransform:"uppercase"}}>{pc.dot} {pc.label} ×{pc.mult}</span><div style={{marginLeft:"auto",textAlign:"right"}}><div style={{fontSize:11,fontWeight:700,color:pc.color}}>{p.event_count} events</div><div style={{fontSize:9,color:"#64748b"}}>{p.trend}</div></div></div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>{p.state&&<span style={{fontSize:9,color:"#94a3b8",background:"rgba(255,255,255,0.04)",borderRadius:4,padding:"2px 7px"}}>📍 {p.state}</span>}{p.institution&&<span style={{fontSize:9,color:"#f97316",background:"rgba(249,115,22,0.08)",borderRadius:4,padding:"2px 7px"}}>{INST[p.institution]||p.institution}</span>}{p.affected_group&&<span style={{fontSize:9,color:"#8b5cf6",background:"rgba(139,92,246,0.08)",borderRadius:4,padding:"2px 7px"}}>👤 {p.affected_group}</span>}</div>
        <div style={{background:"rgba(255,255,255,0.04)",borderRadius:3,height:3,marginBottom:5}}><div style={{width:`${Math.round(p.pattern_score*100)}%`,height:"100%",background:pc.color,borderRadius:3}}/></div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{p.stories.slice(0,3).map(s=><div key={s.id} style={{fontSize:10,color:"#64748b",flex:1,minWidth:160}}>· {s.headline.slice(0,65)}...</div>)}</div>
      </div>);})}
    </div>}

    {/* ── TIMELINE ───────────────────────────────────────────── */}
    {page==="timeline"&&<div style={{paddingBottom:40}}>
      <h2 style={{fontSize:22,fontWeight:800,color:"#f1f5f9",margin:"0 0 14px"}}>Timeline — {level==="national"?"All India":selState}</h2>
      {[2026,2025,2024,2023].map(yr=>{const f=stories.filter(s=>s.review_status==="approved"&&(level==="national"?s.level==="national":s.state===selState)&&new Date(s.ts).getFullYear()===yr);if(!f.length)return null;const net=f.reduce((a,s)=>a+(s.score_delta||0),0);return(<div key={yr} style={{marginBottom:22}}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}><div style={{fontSize:20,fontWeight:800,color:"#f1f5f9",fontFamily:"monospace"}}>{yr}</div><div style={{flex:1,height:1,background:"rgba(255,255,255,0.07)"}}/><span style={{fontSize:11,fontWeight:700,color:net<0?"#ef4444":"#22c55e"}}>{net>0?"+":""}{net} pts net</span></div>
      <div style={{position:"relative",paddingLeft:16}}><div style={{position:"absolute",left:4,top:0,bottom:0,width:1,background:"rgba(255,255,255,0.07)"}}/>{f.sort((a,b)=>new Date(b.ts)-new Date(a.ts)).map(s=>{const dc=s.direction==="positive"?"#22c55e":s.direction==="negative"?"#ef4444":"#64748b";return(<div key={s.id} style={{position:"relative",marginBottom:12}}><div style={{position:"absolute",left:-12,top:4,width:8,height:8,borderRadius:"50%",background:dc,border:"2px solid #06101d",zIndex:1}}/><div style={{fontSize:10,color:"#475569",marginBottom:1}}>{fmtD(s.ts)}{s.state?` · ${s.state}`:""}{s.is_live_fetch?" · LIVE":""}</div><div style={{fontSize:13,fontWeight:700,color:"#e2e8f0",marginBottom:3}}>{s.headline}</div><div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}>{(s.violations||[]).slice(0,2).map((v,i)=><APill key={i} article={v.a} type="violation" onClick={null}/>)}{s.pattern_status&&s.pattern_status!=="isolated"&&<PBadge status={s.pattern_status}/>}<span style={{fontSize:10,fontWeight:700,color:dc}}>{s.score_delta>0?`+${s.score_delta}`:s.score_delta||0} pts</span></div></div>);})}</div></div>);})}
    </div>}

    {/* ── CONSTITUTION ───────────────────────────────────────── */}
    {page==="constitution"&&<div style={{paddingBottom:40}}>
      <h2 style={{fontSize:22,fontWeight:800,color:"#f1f5f9",margin:"0 0 5px"}}>Constitution Browser</h2><p style={{color:"#64748b",fontSize:12,margin:"0 0 14px"}}>Click any article to filter the live feed. Red = violations in real cases. Green = constitutional supports. Live-fetched stories are mapped to these articles instantly.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>{Object.entries(CA).map(([art,info])=>{const vc=artV[art]||0;const sc=(()=>{let s=0;stories.filter(x=>x.review_status==="approved").forEach(x=>{(x.supports||[]).forEach(v=>{if(v.a===art)s++;});});return s;})();const sel=artF===art;return(<div key={art} onClick={()=>handleArtFilter(sel?null:art)} style={{background:sel?"rgba(99,102,241,0.08)":"rgba(255,255,255,0.02)",border:`0.5px solid ${vc>2?"rgba(239,68,68,0.35)":sc>2?"rgba(34,197,94,0.25)":"rgba(255,255,255,0.07)"}`,borderRadius:10,padding:"11px 13px",cursor:"pointer"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}><div><div style={{fontSize:9,color:info.c,fontWeight:800,fontFamily:"monospace",background:`${info.c}15`,borderRadius:4,padding:"1px 7px",display:"inline-block",marginBottom:3}}>{art}</div><div style={{fontSize:12,fontWeight:700,color:"#f1f5f9"}}>{info.t}</div></div><div style={{textAlign:"right",flexShrink:0,marginLeft:8}}>{vc>0&&<div style={{fontSize:11,fontWeight:700,color:"#ef4444"}}>✕ {vc}</div>}{sc>0&&<div style={{fontSize:11,fontWeight:700,color:"#22c55e"}}>✓ {sc}</div>}</div></div><div style={{fontSize:10,color:"#64748b",lineHeight:1.5}}>{info.s}</div></div>);})}
      </div>
    </div>}

    {/* ── SCORE ANALYSIS ─────────────────────────────────────── */}
    {page==="score"&&<div style={{paddingBottom:40}}>
      <h2 style={{fontSize:22,fontWeight:800,color:"#f1f5f9",margin:"0 0 14px"}}>Score Analysis</h2>
      <div style={{background:"rgba(59,130,246,0.04)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:12,padding:"12px",marginBottom:14}}><div style={{fontSize:11,color:"#60a5fa",fontWeight:700,marginBottom:4}}>How Scores Work — Local Classifier → Immediate Approval → Live Score</div><div style={{fontSize:11,color:"#94a3b8",lineHeight:1.6}}>Fetched stories are classified locally (pillar/violations/delta) → firewall validates → immediately approved → score updates in real-time. No API wait required for scoring. AI upgrade runs in background to refine analysis. Pattern multipliers: isolated×1.0 · emerging×1.15 · repeated×1.3 · systemic×1.5.</div></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:14}}><Stat label="Live Score" value={`${liveScore}/100`} sub={band.l} acc={band.c}/><Stat label="Baseline" value={`${STATE_BASELINES[selState]||BASE_SCORE}/100`} sub="real institutional index" acc="#6366f1"/><Stat label="Approved Events" value={stories.filter(s=>s.review_status==="approved").length} sub="in score calculation" acc="#22c55e"/><Stat label="Live Fetched" value={liveStories.length} sub="auto-scored today" acc="#3b82f6"/></div>
      {(()=>{const pillars=calcPillars(stories,level,selState,selDistrict);const sc=getScopedStories(stories,level,selState,selDistrict).sort((a,b)=>new Date(a.ts)-new Date(b.ts));const base=level==="state"?(STATE_BASELINES[selState]||BASE_SCORE):level==="local"?(STATE_BASELINES[selState]||BASE_SCORE):BASE_SCORE;let r=base;const byY={};sc.forEach(s=>{const yr=new Date(s.ts).getFullYear().toString();r=Math.min(100,Math.max(0,Math.round(r+wDelta(s))));byY[yr]=r;});const hist=Object.entries(byY).map(([year,score])=>({year,score})).sort((a,b)=>a.year-b.year);
      return(<><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <div style={{background:"rgba(255,255,255,0.02)",border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"14px"}}><div style={{fontSize:14,fontWeight:700,color:"#f1f5f9",marginBottom:10}}>Score Trajectory</div><ResponsiveContainer width="100%" height={160}><AreaChart data={hist}><defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={band.c} stopOpacity={.3}/><stop offset="95%" stopColor={band.c} stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="rgba(255,255,255,0.04)"/><XAxis dataKey="year" tick={{fill:"#64748b",fontSize:9}} axisLine={false} tickLine={false}/><YAxis domain={[0,100]} tick={{fill:"#64748b",fontSize:9}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:"#1e293b",border:"0.5px solid rgba(255,255,255,0.12)",borderRadius:8,fontSize:11}}/><Area type="monotone" dataKey="score" stroke={band.c} fill="url(#sg)" strokeWidth={2}/></AreaChart></ResponsiveContainer></div>
        <div style={{background:"rgba(255,255,255,0.02)",border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"14px"}}><div style={{fontSize:14,fontWeight:700,color:"#f1f5f9",marginBottom:10}}>7 Pillars Radar</div><ResponsiveContainer width="100%" height={160}><RadarChart data={pillars.map(p=>({subject:p.article.split("/")[0],score:p.score}))}><PolarGrid stroke="rgba(255,255,255,0.08)"/><PolarAngleAxis dataKey="subject" tick={{fill:"#64748b",fontSize:9}}/><Radar name="Score" dataKey="score" stroke="#f97316" fill="#f97316" fillOpacity={.2} strokeWidth={2}/></RadarChart></ResponsiveContainer></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>{pillars.map(p=><div key={p.id} style={{background:"rgba(255,255,255,0.02)",border:`0.5px solid ${p.color}20`,borderRadius:10,padding:"12px 14px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}><div><div style={{fontSize:9,color:p.color,fontFamily:"monospace",background:`${p.color}12`,borderRadius:4,padding:"1px 6px",marginBottom:3}}>{p.article}</div><div style={{fontSize:12,fontWeight:700,color:"#f1f5f9"}}>{p.label}</div><div style={{fontSize:9,color:"#64748b"}}>{p.count} events · {p.neg} violations · {p.pos} supports</div></div><div style={{textAlign:"right"}}><div style={{fontSize:18,fontWeight:800,color:p.weighted<0?"#ef4444":p.weighted>0?"#22c55e":"#64748b"}}>{p.weighted>0?"+":""}{p.weighted}</div><div style={{fontSize:9,color:"#64748b"}}>wtd pts</div></div></div><div style={{background:"rgba(255,255,255,0.05)",borderRadius:3,height:4}}><div style={{width:`${p.score}%`,height:"100%",background:p.color,borderRadius:3}}/></div></div>)}</div></>);})()}
    </div>}

    {/* ── STATE RANKINGS ─────────────────────────────────────── */}
    {page==="states"&&<div style={{paddingBottom:40}}>
      <h2 style={{fontSize:22,fontWeight:800,color:"#f1f5f9",margin:"0 0 5px"}}>State Rankings</h2><p style={{color:"#64748b",fontSize:12,margin:"0 0 14px"}}>Real baselines (Freedom House/V-Dem/RSF/NCRB 2025) + live event deltas. Click to drill in.</p>
      {(()=>{const ranked=Object.entries(STATE_BASELINES).map(([st,base])=>{const dyn=calcSt(stories,st);return{state:st,base,dyn,band:getBand(dyn)};}).sort((a,b)=>b.dyn-a.dyn);const byBand=["Healthy Democracy","Working Democracy","Flawed Democracy","Democratic Backsliding","Authoritarian Risk"].map(l=>{const b=getBand(l==="Healthy Democracy"?85:l==="Working Democracy"?65:l==="Flawed Democracy"?45:l==="Democratic Backsliding"?25:10);return{label:l,band:b,count:ranked.filter(x=>x.band.l===l).length};}).filter(x=>x.count>0);
      return(<><div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>{byBand.map(({label,band:b,count})=><div key={label} style={{background:b.bg,border:`0.5px solid ${b.c}40`,borderRadius:10,padding:"10px 14px"}}><div style={{fontSize:10,fontWeight:700,color:b.c,marginBottom:1}}>{b.l}</div><div style={{fontSize:20,fontWeight:800,color:b.c}}>{count}</div></div>)}</div>
      {ranked.map(({state:st,base,dyn,band:b})=>{const env=STATE_ENV[st]||{};const hasSystemic=stories.filter(s=>s.review_status==="approved"&&s.state===st).some(s=>s.pattern_status==="systemic");const hasLive=stories.filter(s=>s.review_status==="approved"&&s.state===st&&s.is_live_fetch).length;return(<div key={st} onClick={()=>handleState(st)} style={{display:"flex",alignItems:"center",gap:12,background:"rgba(255,255,255,0.02)",border:`0.5px solid ${hasSystemic?"rgba(239,68,68,0.25)":b.c+"20"}`,borderRadius:10,padding:"10px 13px",cursor:"pointer",marginBottom:7}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.04)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.02)"}>
        <div style={{width:32,textAlign:"right",fontSize:18,fontWeight:800,color:b.c,flexShrink:0}}>{dyn}</div>
        <div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}><span style={{fontSize:13,fontWeight:700,color:"#f1f5f9"}}>{st}</span><span style={{fontSize:9,color:b.c,background:`${b.c}12`,borderRadius:4,padding:"2px 6px",fontWeight:700,textTransform:"uppercase"}}>{b.l}</span>{hasSystemic&&<PBadge status="systemic"/>}{hasLive>0&&<span style={{fontSize:8,color:"#3b82f6",background:"rgba(59,130,246,0.12)",borderRadius:4,padding:"1px 5px"}}>● {hasLive} live</span>}<span style={{fontSize:9,color:"#334155"}}>base {base}</span></div>{(env.topIssues||[]).slice(0,1).map((i,x)=><span key={x} style={{fontSize:10,color:"#475569"}}>· {i}</span>)}<div style={{background:"rgba(255,255,255,0.05)",borderRadius:3,height:3,marginTop:4}}><div style={{width:`${dyn}%`,height:"100%",background:b.c,borderRadius:3}}/></div></div>
        <span style={{fontSize:11,color:"#334155"}}>→</span>
      </div>);})}</>);})()}
    </div>}

    {/* ── ANOMALIES ──────────────────────────────────────────── */}
    {page==="anomalies"&&(
  <div style={{paddingBottom:40}}>
    <h2 style={{fontSize:22,fontWeight:800,color:"#f1f5f9",margin:"0 0 14px"}}>Anomaly Explorer</h2>
    {anomalies.map(a=>{
      const sc={critical:"#ef4444",high:"#f97316",medium:"#f59e0b"}[a.severity]||"#64748b";
      const art=CA[a.article];
      const scBorder="0.5px solid "+sc+"25";
      const scBg2=sc+"12";
      const scBg06=sc+"06";
      const scBorder20="0.5px solid "+sc+"20";
      return(
        <div key={a.id} style={{background:"rgba(255,255,255,0.02)",border:scBorder,borderRadius:12,padding:"16px",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:11,marginBottom:8}}>
            <div style={{fontSize:18,flexShrink:0}}>{a.severity==="critical"?"🚨":"⚠️"}</div>
            <div style={{flex:1}}>
              <div style={{display:"flex",gap:7,marginBottom:3,flexWrap:"wrap"}}>
                <span style={{fontSize:13,fontWeight:700,color:"#f1f5f9",textTransform:"capitalize"}}>{a.type.split("_").join(" ")}</span>
                <span style={{fontSize:9,color:sc,background:scBg2,borderRadius:4,padding:"2px 6px",fontWeight:700}}>{a.severity}</span>
                <APill article={a.article} type="violation" onClick={null}/>
                <span style={{fontSize:9,color:a.status==="escalated"?"#ef4444":"#f59e0b",fontWeight:700}}>{a.status}</span>
              </div>
              <div style={{fontSize:11,color:"#64748b"}}>{a.scope}</div>
            </div>
            <div style={{textAlign:"right"}}><div style={{fontSize:22,fontWeight:800,color:sc}}>{a.score}</div></div>
          </div>
          <div style={{background:"rgba(255,255,255,0.03)",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#94a3b8",lineHeight:1.5,marginBottom:8}}>{a.reason}</div>
          {art&&(
            <div style={{background:scBg06,border:scBorder20,borderRadius:8,padding:"7px 10px"}}>
              <div style={{fontSize:9,color:sc,fontWeight:800,textTransform:"uppercase",marginBottom:2}}>{a.article} — {art.t}</div>
              <div style={{fontSize:10,color:"#64748b"}}>{art.s}</div>
            </div>
          )}
        </div>
      );
    })}
  </div>
)}

    {/* ── SUBMIT ─────────────────────────────────────────────── */}
    {page==="submit"&&(()=>{
      const [step,setStep]=useState(1);const [type,setType]=useState("");const [form,setForm]=useState({title:"",body:"",state:"All India",anon:false,name:""});const [processing,setProcessing]=useState(false);const [msg,setMsg]=useState("");const [result,setResult]=useState(null);
      const TYPES=[{id:"citizen_complaint",label:"Citizen Complaint",icon:"👤"},{id:"news_event",label:"News Event",icon:"📰"},{id:"govt_action",label:"Government Action",icon:"🏛️"},{id:"court_verdict",label:"Court Order",icon:"⚖️"},{id:"police_action",label:"Police Action",icon:"🚔"},{id:"legislative",label:"Bill / Law",icon:"📜"}];
      const submit=async()=>{setStep(4);setProcessing(true);setMsg("Generating SHA-256 hash...");const hash=await sha256(`${type}|${form.title}|${form.body}|${form.state}|${Date.now()}`);setMsg("Local constitutional classification...");const clf=localClassify(form.title,form.body);setMsg("Firewall validation...");const fw=firewallCheck({...clf,headline:form.title});setMsg("Building Mythos interpretation...");const myth=buildMythos({...clf,headline:form.title});const tc=`DTN-2026-${Math.floor(10000+Math.random()*90000)}`;const ns={id:`cmp_${Date.now()}`,ts:new Date().toISOString(),type,headline:form.title,body:form.body,state:form.state==="All India"?null:form.state,level:form.state==="All India"?"national":"state",source:`Citizen Report · ${form.anon?"Anonymous":form.name||"Anon"} · Apr 2026`,source_conf:"citizen_unverified",review_status:"pending",score_delta:0,...clf,...myth,firewall_decision:fw.decision,firewall_reason:fw.reason,confidence:fw.confidence,evidence_hash:hash,trackCode:tc};setResult({...clf,...myth,title:form.title,trackCode:tc,hash,fw});const u=[ns,...stories];setStories(u);storiesRef.current=u;await saveS(u);setProcessing(false);success("Report submitted — queued for human review");};
      if(step===4)return(<div style={{paddingBottom:40}}>{processing?<div style={{textAlign:"center",padding:"60px 0"}}><div style={{fontSize:44,marginBottom:12}}>🔐</div><div style={{fontSize:13,color:"#a5b4fc",marginBottom:5}}>Processing</div><div style={{fontSize:12,color:"#64748b"}}>{msg}</div></div>:result?<div><div style={{background:"rgba(245,158,11,0.06)",border:"0.5px solid rgba(245,158,11,0.3)",borderRadius:14,padding:"22px"}}><div style={{fontSize:16,fontWeight:800,color:"#f59e0b",marginBottom:5}}>⏳ Submitted — Human Review Required</div><div style={{fontSize:12,color:"#94a3b8",marginBottom:12}}>Citizen submissions are not auto-approved and do not affect live scores until a human reviewer approves.</div><div style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"12px",marginBottom:10}}><div style={{fontSize:11,color:"#64748b",marginBottom:2}}>Tracking Code</div><div style={{fontSize:20,fontWeight:800,color:"#f59e0b",fontFamily:"monospace"}}>{result.trackCode}</div></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>{[{l:"Classified Pillar",v:PILLARS[result.pillar]?.label||result.pillar},{l:"Severity",v:result.severity},{l:"Firewall",v:result.fw?.decision,c:{allow:"#22c55e",allow_with_log:"#f59e0b",hold:"#f97316",reject:"#ef4444"}[result.fw?.decision]||"#64748b"},{l:"Mythos Pattern",v:result.pattern_status}].map(m=><div key={m.l}><div style={{fontSize:9,color:"#64748b",marginBottom:2}}>{m.l}</div><div style={{fontSize:13,fontWeight:700,color:m.c||"#f1f5f9"}}>{m.v}</div></div>)}</div><div style={{background:"rgba(168,85,247,0.06)",border:"0.5px solid rgba(168,85,247,0.2)",borderRadius:8,padding:"10px",marginBottom:10}}><div style={{fontSize:9,color:"#c084fc",fontWeight:800,marginBottom:4}}>✨ Mythos Pre-Analysis</div><div style={{fontSize:12,color:"#e2e8f0",lineHeight:1.6}}>{result.mythos_summary}</div></div><div style={{fontSize:10,color:"#334155",marginBottom:12}}>SHA-256: {result.hash.slice(0,32)}...</div><button onClick={()=>{setStep(1);setType("");setForm({title:"",body:"",state:"All India",anon:false,name:""});setResult(null);}} style={{background:"#6366f1",color:"#fff",border:"none",borderRadius:8,padding:"9px 20px",fontWeight:700,fontSize:12,cursor:"pointer"}}>Submit Another</button></div></div>:null}</div>);
      return(<div style={{paddingBottom:40,maxWidth:700}}><h2 style={{fontSize:22,fontWeight:800,color:"#f1f5f9",margin:"0 0 5px"}}>Submit Report</h2><p style={{color:"#64748b",fontSize:12,margin:"0 0 8px"}}>SHA-256 hashing · Local Constitutional Classifier · Mythos Engine · Firewall · Human review required for all citizen submissions</p><div style={{background:"rgba(245,158,11,0.04)",border:"0.5px solid rgba(245,158,11,0.2)",borderRadius:8,padding:"8px 12px",fontSize:11,color:"#f59e0b",marginBottom:16}}>ℹ Citizen submissions do not affect live scores until approved by a human reviewer. Content is informational only and does not constitute legal advice or legal accusation.</div>
      <div style={{display:"flex",alignItems:"center",marginBottom:18}}>{["Type","Details","Review"].map((s,i)=><div key={s} style={{display:"flex",alignItems:"center",flex:i<2?1:"none"}}><div style={{display:"flex",flexDirection:"column",alignItems:"center"}}><div style={{width:26,height:26,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:step>i+1?"#22c55e":step===i+1?"#ef4444":"rgba(255,255,255,0.06)",color:step>=i+1?"#fff":"#64748b",fontWeight:700,fontSize:11,marginBottom:2}}>{step>i+1?"✓":i+1}</div><div style={{fontSize:8,color:step===i+1?"#f1f5f9":"#475569",textTransform:"uppercase"}}>{s}</div></div>{i<2&&<div style={{flex:1,height:1,background:step>i+1?"#22c55e":"rgba(255,255,255,0.08)",margin:"0 6px",marginBottom:12}}/>}</div>)}</div>
      {step===1&&<div><div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:14}}>{TYPES.map(et=><div key={et.id} onClick={()=>setType(et.id)} style={{background:type===et.id?"rgba(99,102,241,0.1)":"rgba(255,255,255,0.02)",border:`1px solid ${type===et.id?"rgba(99,102,241,0.5)":"rgba(255,255,255,0.07)"}`,borderRadius:10,padding:"10px 12px",cursor:"pointer",display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:18}}>{et.icon}</span><div style={{fontSize:12,fontWeight:700,color:type===et.id?"#a5b4fc":"#f1f5f9"}}>{et.label}</div></div>)}</div><div style={{display:"flex",justifyContent:"flex-end"}}><button onClick={()=>type&&setStep(2)} style={{background:type?"#6366f1":"rgba(255,255,255,0.04)",color:type?"#fff":"#475569",border:"none",borderRadius:8,padding:"9px 22px",fontWeight:700,fontSize:12,cursor:type?"pointer":"not-allowed"}}>Continue →</button></div></div>}
      {step===2&&<div><div style={{display:"flex",flexDirection:"column",gap:10}}><div><label style={{display:"block",fontSize:10,color:"#64748b",textTransform:"uppercase",marginBottom:4}}>Title *</label><input value={form.title} onChange={e=>setForm(v=>({...v,title:e.target.value}))} placeholder="Clear factual headline" style={{width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.04)",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"9px 12px",color:"#f1f5f9",fontSize:13}}/></div><div><label style={{display:"block",fontSize:10,color:"#64748b",textTransform:"uppercase",marginBottom:4}}>Description *</label><textarea value={form.body} onChange={e=>setForm(v=>({...v,body:e.target.value}))} rows={5} placeholder="Who, what, when, where, which rights may have been affected." style={{width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.04)",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"9px 12px",color:"#f1f5f9",fontSize:13,resize:"vertical",fontFamily:"inherit"}}/></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><div><label style={{display:"block",fontSize:10,color:"#64748b",textTransform:"uppercase",marginBottom:4}}>State</label><select value={form.state} onChange={e=>setForm(v=>({...v,state:e.target.value}))} style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"8px 10px",color:"#f1f5f9",fontSize:12,colorScheme:"dark"}}><option>All India</option>{STATES_LIST.map(s=><option key={s}>{s}</option>)}</select></div><div><label style={{display:"block",fontSize:10,color:"#64748b",textTransform:"uppercase",marginBottom:4}}>Name</label><input value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))} disabled={form.anon} placeholder="Optional" style={{width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.04)",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"8px 10px",color:form.anon?"#475569":"#f1f5f9",fontSize:12}}/></div></div><label style={{display:"flex",gap:8,cursor:"pointer",alignItems:"center"}}><input type="checkbox" checked={form.anon} onChange={e=>setForm(v=>({...v,anon:e.target.checked}))}/><span style={{fontSize:12,color:"#94a3b8"}}>Submit anonymously</span></label></div><div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:12}}><button onClick={()=>setStep(1)} style={{background:"transparent",color:"#64748b",border:"0.5px solid rgba(255,255,255,0.12)",borderRadius:8,padding:"8px 16px",fontWeight:600,fontSize:12,cursor:"pointer"}}>← Back</button><button onClick={()=>form.title&&form.body&&setStep(3)} style={{background:form.title&&form.body?"#6366f1":"rgba(255,255,255,0.04)",color:form.title&&form.body?"#fff":"#475569",border:"none",borderRadius:8,padding:"8px 20px",fontWeight:700,fontSize:12,cursor:form.title&&form.body?"pointer":"not-allowed"}}>Continue →</button></div></div>}
      {step===3&&<div><div style={{background:"rgba(255,255,255,0.02)",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:12,padding:"14px",marginBottom:12}}><div style={{fontSize:14,fontWeight:700,color:"#f1f5f9",marginBottom:4}}>{form.title}</div><div style={{fontSize:12,color:"#94a3b8",lineHeight:1.6}}>{form.body}</div></div><div style={{background:"rgba(245,158,11,0.06)",border:"0.5px solid rgba(245,158,11,0.2)",borderRadius:8,padding:"8px 12px",fontSize:11,color:"#f59e0b",marginBottom:10}}>Citizen submissions need human reviewer approval. They do not affect the live score until approved.</div><div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><button onClick={()=>setStep(2)} style={{background:"transparent",color:"#64748b",border:"0.5px solid rgba(255,255,255,0.12)",borderRadius:8,padding:"8px 16px",fontWeight:600,fontSize:12,cursor:"pointer"}}>← Back</button><button onClick={submit} style={{background:"#ef4444",color:"#fff",border:"none",borderRadius:8,padding:"8px 22px",fontWeight:700,fontSize:12,cursor:"pointer"}}>Submit for Review</button></div></div>}
      </div>);
    })()}

    {/* ── REVIEW ─────────────────────────────────────────────── */}
    {page==="review"&&isR&&<div style={{paddingBottom:40}}>
      <h2 style={{fontSize:22,fontWeight:800,color:"#f1f5f9",margin:"0 0 5px"}}>Review Queue</h2><p style={{color:"#64748b",fontSize:12,margin:"0 0 14px"}}>Live-fetched stories are locally classified + firewall validated + auto-approved. Citizen submissions always need human review. Stories held by firewall are queued here.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}><Stat label="Pending Human" value={stories.filter(s=>s.review_status==="pending").length} acc="#f59e0b"/><Stat label="Auto-Approved" value={stories.filter(s=>s.reviewed_by==="Local Classifier").length} sub="by local classifier" acc="#22c55e"/><Stat label="AI Upgraded" value={stories.filter(s=>s.ai_upgraded).length} acc="#8b5cf6"/><Stat label="Audit Entries" value={auditLog.length} acc="#64748b"/></div>
      {stories.filter(s=>s.review_status==="pending").slice(0,8).map(s=><StoryCard key={s.id} s={s} expanded={expanded===s.id} onToggle={()=>setExpanded(expanded===s.id?null:s.id)} onArtFilter={handleArtFilter} showActions={true} onReview={handleReview}/>)}
      {auditLog.length>0&&<div style={{marginTop:14}}><div style={{fontSize:13,fontWeight:700,color:"#f1f5f9",marginBottom:8}}>Audit Trail</div>{auditLog.slice(-10).reverse().map((e,i)=><div key={i} style={{background:"rgba(255,255,255,0.01)",border:"0.5px solid rgba(255,255,255,0.06)",borderRadius:8,padding:"7px 11px",marginBottom:4,display:"flex",gap:9,alignItems:"center"}}><span style={{fontSize:9,fontFamily:"monospace",color:"#475569"}}>{new Date(e.ts).toLocaleTimeString("en-IN")}</span><span style={{fontSize:9,color:e.action==="approved"?"#22c55e":e.action==="rejected"?"#ef4444":"#8b5cf6",fontWeight:700,textTransform:"uppercase"}}>{e.action}</span><span style={{fontSize:12,color:"#94a3b8",flex:1}}>{e.headline}</span><span style={{fontSize:9,color:"#334155"}}>by {e.reviewer}</span></div>)}</div>}
    </div>}

    {/* ── TRANSPARENCY PAGE (Step T) ─────────────────────────── */}
    {page==="transparency"&&<TransparencyPage/>}

    {/* ── ABOUT PAGE (Step S) ────────────────────────────────── */}
    {page==="about"&&<AboutPage/>}

    </main>

    {/* STEP S: Legal footer */}
    <footer style={{borderTop:"0.5px solid rgba(255,255,255,0.06)",background:"rgba(0,0,0,0.3)",padding:"16px 18px",maxWidth:"100%",boxSizing:"border-box"}}>
      <div style={{maxWidth:1140,margin:"0 auto",display:"flex",flexDirection:"column",gap:8}}>
        <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8,fontSize:9,color:"#1e293b"}}>
          <span>DTN Mythos · Constitutional Awareness & Data Transparency System · India · {Object.keys(CA).length} articles · {stories.filter(s=>s.review_status==="approved").length} verified events · {liveStories.length} live today · {patterns.length} patterns · 24/7</span>
          <span style={{fontFamily:"monospace"}}>Apr 16 2026 · Score: {liveScore}/100 · {band.l} · Baselines: Freedom House + V-Dem + RSF + NCRB</span>
        </div>
        <div style={{fontSize:8,color:"#1a2844",lineHeight:1.5}}>
          <b style={{color:"#334155"}}>Legal Disclaimer:</b> This platform provides informational and educational analysis based on publicly available data. It does not constitute legal advice or make legal accusations against any individual, institution, or entity. All outputs are probabilistic and subject to human review. Users are encouraged to verify information independently. Constitutional scores are data-modelled approximations — not judicial or policy determinations. This platform is politically neutral and not funded by or affiliated with any government, political party, or commercial interest. For methodology details, visit the Methodology page.
          <span style={{marginLeft:10}}><button onClick={()=>setPage("transparency")} style={{color:"#3b82f6",background:"transparent",border:"none",cursor:"pointer",fontSize:8,textDecoration:"underline"}}>Full Methodology</button></span>
          <span style={{marginLeft:8}}><button onClick={()=>setPage("about")} style={{color:"#3b82f6",background:"transparent",border:"none",cursor:"pointer",fontSize:8,textDecoration:"underline"}}>About DTN</button></span>
        </div>
      </div>
    </footer>
  </div>);
}
