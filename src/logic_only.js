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

const BASE_SCORE=41,REF=new Date();
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

let _rlu=0;
const isRL=()=>Date.now()<_rlu;
const setRL=(ms=65000)=>{_rlu=Date.now()+ms;};
async function fetchWithRetry(fn,retries=2,delay=2000){for(let i=0;i<retries;i++){if(isRL())throw new Error("Rate limited — wait "+Math.ceil((_rlu-Date.now())/1000)+"s");try{return await fn();}catch(e){if(e.message&&e.message.includes("429")){setRL(65000);throw new Error("Rate limited (429) — wait 60 seconds");}if(i===retries-1)throw e;await new Promise(r=>setTimeout(r,delay*(i+1)));}}return null;}

async function fetchLiveNews(level,state,district){
  const scope=level==="local"?`${district}, ${state}`:level==="state"?state:"India";
  return fetchWithRetry(async()=>{
    const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:API_HEADERS,body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:3000,tools:[{type:"web_search_20250305",name:"web_search"}],messages:[{role:"user",content:`Search for today's real Indian political and constitutional news from April 16 2026 for ${scope}. Focus on: court orders, parliament, arrests, elections, rights violations, press freedom. Return ONLY this JSON (no markdown): {"stories":[{"headline":"...","body":"2-3 sentence summary","source":"Publication","published":new Date().toISOString().slice(0,10),"state":"${state||"null"}","category":"court|police|parliament|govt|press|ec|civil_liberty"}]}. Find 5-8 real verifiable stories.`}]})});
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
const isToday=ts=>new Date(ts).toDateString()===new Date().toDateString();
const isWeek=ts=>(Date.now()-new Date(ts).getTime())<7*86400000;
const isYear=ts=>new Date(ts).getFullYear()===new Date().getFullYear();
async function sha256(t){try{const d=new TextEncoder().encode(t);const b=await crypto.subtle.digest("SHA-256",d);return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,"0")).join("");}catch{return`fb-${Date.now()}`;}}