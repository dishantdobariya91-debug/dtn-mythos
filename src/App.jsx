import React,{useState,useEffect,useCallback,useRef,useMemo}from"react";
import{AreaChart,Area,LineChart,Line,XAxis,YAxis,Tooltip,ResponsiveContainer,RadarChart,Radar,PolarGrid,PolarAngleAxis,BarChart,Bar,Cell}from"recharts";
import{BroadcastMasthead,BreakingBanner,KineticTicker,ListenButton,AnimatedIllustration,PodcastHub,useSoundAlert,ViewingCounter}from"./components/BroadcastUI";
import{NewspaperView}from"./components/NewspaperView";
import{SuggestPage}from"./components/SuggestPage";
const GROQ=import.meta.env.VITE_GROQ_KEY||"";
const GEMINI=import.meta.env.VITE_GEMINI_KEY||"";

// ── MULTI-LANGUAGE ────────────────────────────────────────────
const LANG={
en:{name:"English",flag:"🇬🇧",appName:"DTN Mythos",appSub:"Constitutional Intelligence Platform for India",tagline:"Real-time constitutional journalism · Scores · Departments · 10 Languages",signIn:"Sign In",signInSub:"Understand what the news means for India's constitutional rights — in real time",yourName:"Your Name",yourEmail:"Email (optional)",continueBtn:"Enter Platform →",guestMode:"Continue as Guest",disclaimerTitle:"How We Score Constitutional Health",disclaimerSub:"Carefully read before entering — this is what you are tracking",disclaimerAccept:"I understand — Enter Platform",dashboard:"Dashboard",newsroom:"Live Newsroom",tracker:"Constitution Tracker",demoScore:"Democracy Score",departments:"Departments",states:"States",rights:"My Rights",journalist:"Journalist Console",citizenMode:"Citizen Mode",expertMode:"Expert Mode",submit:"Submit Report",review:"Review Queue",method:"Methodology",about:"About",fetch:"Fetch",auto:"AUTO",national:"National",state:"State",district:"District",critical:"CRITICAL",positive:"SUPPORT",high:"CONCERN",impact:"📊 Impact",facts:"⚖ Constitutional",mythos:"✦ Insight",evidence:"Evidence",govResponse:"Govt Response",courtStatus:"Court Status",violation:"Violation",support:"Support",functioning:"Functioning Democracy",erosion:"Democratic Erosion",backsliding:"Democratic Backsliding",authoritarian:"Authoritarian Risk",noStories:"No live stories yet",tapFetch:"Tap Fetch to load real-time news",fetchLive:"⚡ Fetch Live News",impactRadius:"Democracy Impact Radius",constitutionViolations:"Constitutional Violations",constitutionSupports:"Constitutional Supports",deptScore:"Department Score",liveScore:"Live Score",storiesTracked:"Stories Tracked",evidenceLevels:{allegation:"Allegation",single_source:"Single Source",corroborated:"Corroborated",official_doc:"Official Document",court_finding:"Court Finding",final_adjudication:"Final Adjudication"},confidence:{high:"High Confidence",moderate:"Moderate Confidence",low:"Low Confidence",developing:"Developing Story"},storyTypes:{policy:"Policy",law:"Law",court:"Court",policing:"Policing",election:"Election",rights:"Rights",corruption:"Corruption",welfare:"Welfare",speech:"Speech",media:"Media",federalism:"Federalism",minority:"Minority Rights"},citizenWhat:"What happened",citizenWhy:"Why it matters",citizenScore:"Constitutional impact",citizenStatus:"Current status",citizenNext:"What to watch",liveLabel:"Live",indiaDemocracy:"India Democracy Score",calibrated:"Calibrated: Freedom House · V-Dem · RSF · EIU",latestLabel:"Latest",snapshot:"Snapshot",tracked:"Tracked",supportsCount:"Supports",courtPendingLabel:"Court Pending",relatedStories:"Related Stories",constitutionalStories:"Constitutional Stories",moreStories:"More Stories",storiesSuffix:"stories",updated:"Updated",constJournalism:"Constitutional Journalism",constJournalismSub:"Every story scored for democracy impact · Evidence classified · Mapped to Indian Constitution articles",aiEnrichAll:"AI Enrich All",autoFetchActive:"Auto-fetch active",nextUpdate:"Next update in",readOriginal:"Read original article",filterAll:"All",filterCourt:"Court Active",filterUnresolved:"Unresolved",labelSupport:"Support",labelCritical:"Critical",labelConcern:"Concern",labelUpdate:"Update",bandStrong:"Strong Constitutional Support",bandStable:"Mostly Stable",bandMixed:"Mixed Democratic Health",bandConcerns:"Significant Concerns",bandSevere:"Severe Democratic Stress",generalLabel:"General",signOutQ:"Sign out?",alertsEnable:"Enable alerts",alertsOn:"Alerts on",alertsBlocked:"Blocked",installForAlerts:"Install for alerts"},
hi:{name:"हिंदी",flag:"🇮🇳",appName:"डीटीएन मिथोस",appSub:"भारत के लिए संवैधानिक खुफिया मंच",tagline:"रीयल-टाइम संवैधानिक पत्रकारिता · स्कोर · विभाग · 10 भाषाएं",signIn:"साइन इन",signInSub:"समझें कि समाचार का भारत के संवैधानिक अधिकारों के लिए क्या मतलब है",yourName:"आपका नाम",yourEmail:"ईमेल (वैकल्पिक)",continueBtn:"प्लेटफ़ॉर्म में प्रवेश करें →",guestMode:"अतिथि के रूप में जारी रखें",disclaimerTitle:"हम संवैधानिक स्वास्थ्य को कैसे स्कोर करते हैं",disclaimerSub:"प्रवेश करने से पहले ध्यान से पढ़ें",disclaimerAccept:"मैं समझता हूं — प्लेटफ़ॉर्म में प्रवेश करें",dashboard:"डैशबोर्ड",newsroom:"लाइव न्यूज़रूम",tracker:"संविधान ट्रैकर",demoScore:"लोकतंत्र स्कोर",departments:"विभाग",states:"राज्य",rights:"मेरे अधिकार",journalist:"पत्रकार कंसोल",citizenMode:"नागरिक मोड",expertMode:"विशेषज्ञ मोड",submit:"रिपोर्ट जमा करें",review:"समीक्षा",method:"पद्धति",about:"के बारे में",fetch:"फ़ेच",auto:"ऑटो",national:"राष्ट्रीय",state:"राज्य",district:"जिला",critical:"गंभीर",positive:"समर्थन",high:"चिंता",impact:"📊 प्रभाव",facts:"⚖ संवैधानिक",mythos:"✦ अंतर्दृष्टि",evidence:"साक्ष्य",govResponse:"सरकारी प्रतिक्रिया",courtStatus:"न्यायालय स्थिति",violation:"उल्लंघन",support:"समर्थन",functioning:"कार्यशील लोकतंत्र",erosion:"लोकतांत्रिक क्षरण",backsliding:"लोकतांत्रिक पतन",authoritarian:"सत्तावादी जोखिम",noStories:"अभी कोई स्टोरी नहीं",tapFetch:"लाइव समाचार लोड करने के लिए फ़ेच करें",fetchLive:"⚡ लाइव समाचार लाएं",impactRadius:"लोकतंत्र प्रभाव",constitutionViolations:"संवैधानिक उल्लंघन",constitutionSupports:"संवैधानिक समर्थन",deptScore:"विभाग स्कोर",liveScore:"लाइव स्कोर",storiesTracked:"ट्रैक की गई कहानियां",evidenceLevels:{allegation:"आरोप",single_source:"एकल स्रोत",corroborated:"पुष्टि",official_doc:"आधिकारिक दस्तावेज़",court_finding:"न्यायालय निर्णय",final_adjudication:"अंतिम निर्णय"},confidence:{high:"उच्च विश्वास",moderate:"मध्यम विश्वास",low:"कम विश्वास",developing:"विकासशील कहानी"},storyTypes:{policy:"नीति",law:"कानून",court:"न्यायालय",policing:"पुलिसिंग",election:"चुनाव",rights:"अधिकार",corruption:"भ्रष्टाचार",welfare:"कल्याण",speech:"वाणी",media:"मीडिया",federalism:"संघवाद",minority:"अल्पसंख्यक अधिकार"},citizenWhat:"क्या हुआ",citizenWhy:"यह क्यों मायने रखता है",citizenScore:"संवैधानिक प्रभाव",citizenStatus:"वर्तमान स्थिति",citizenNext:"आगे क्या देखें",liveLabel:"लाइव",indiaDemocracy:"भारत लोकतंत्र स्कोर",calibrated:"अंशांकित: Freedom House · V-Dem · RSF · EIU",latestLabel:"ताजा",snapshot:"स्नैपशॉट",tracked:"ट्रैक किया",supportsCount:"समर्थन",courtPendingLabel:"न्यायालय लंबित",relatedStories:"संबंधित कहानियां",constitutionalStories:"संवैधानिक कहानियां",moreStories:"और कहानियां",storiesSuffix:"कहानियां",updated:"अपडेटेड",constJournalism:"संवैधानिक पत्रकारिता",constJournalismSub:"हर कहानी लोकतंत्र प्रभाव के लिए स्कोर · साक्ष्य वर्गीकृत · भारतीय संविधान के लेखों से मैप",aiEnrichAll:"AI सभी समृद्ध करें",autoFetchActive:"ऑटो-फ़ेच सक्रिय",nextUpdate:"अगला अपडेट",readOriginal:"मूल लेख पढ़ें",filterAll:"सभी",filterCourt:"न्यायालय सक्रिय",filterUnresolved:"अनसुलझा",labelSupport:"समर्थन",labelCritical:"गंभीर",labelConcern:"चिंता",labelUpdate:"अपडेट",bandStrong:"मजबूत संवैधानिक समर्थन",bandStable:"अधिकतर स्थिर",bandMixed:"मिश्रित लोकतांत्रिक स्वास्थ्य",bandConcerns:"महत्वपूर्ण चिंताएं",bandSevere:"गंभीर लोकतांत्रिक तनाव",generalLabel:"सामान्य",signOutQ:"साइन आउट?",alertsEnable:"अलर्ट चालू करें",alertsOn:"अलर्ट चालू",alertsBlocked:"अवरुद्ध",installForAlerts:"अलर्ट के लिए इंस्टॉल"},
gu:{name:"ગુજરાતી",flag:"🇮🇳",appName:"ડીટીએન મિથોસ",appSub:"ભારત માટે બંધારણીય ઇન્ટેલિજન્સ પ્લેટફોર્મ",tagline:"રીઅલ-ટાઇમ બંધારણીય પત્રકારત્વ · સ્કોર · વિભાગો · 10 ભાષાઓ",signIn:"સાઇન ઇન",signInSub:"સમાચારનો ભારતના બંધારણીય અધિકારો માટે શો અર્થ છે તે સમજો",yourName:"તમારું નામ",yourEmail:"ઇમેઇલ (વૈકલ્પિક)",continueBtn:"પ્લેટફોર્મ દાખલ કરો →",guestMode:"અતિથિ તરીકે ચાલુ રાખો",disclaimerTitle:"અમે બંધારણીય સ્વાસ્થ્ય કેવી રીતે સ્કોર કરીએ છીએ",disclaimerSub:"પ્રવેશ પહેલાં કાળજીપૂર્વક વાંચો",disclaimerAccept:"હું સમજું છું — પ્લેટફોર્મ દાખલ કરો",dashboard:"ડૅશબોર્ડ",newsroom:"લાઇવ ન્યૂઝરૂમ",tracker:"બંધારણ ટ્રૅકર",demoScore:"લોકશાહી સ્કોર",departments:"વિભાગો",states:"રાજ્યો",rights:"મારા અધિકારો",journalist:"પત્રકાર કન્સોલ",citizenMode:"નાગરિક મોડ",expertMode:"નિષ્ણાત મોડ",submit:"અહેવાલ સબમિટ",review:"સમીક્ષા",method:"પદ્ધતિ",about:"વિશે",fetch:"ફેચ",auto:"ઓટો",national:"રાષ્ટ્રીય",state:"રાજ્ય",district:"જિલ્લો",critical:"ગંભીર",positive:"સમર્થન",high:"ચિંતા",impact:"📊 અસર",facts:"⚖ બંધારણીય",mythos:"✦ આંતરદૃષ્ટિ",evidence:"પુરાવા",govResponse:"સરકારી પ્રતિભાવ",courtStatus:"કોર્ટ સ્થિતિ",violation:"ઉલ્લંઘન",support:"સમર્થન",functioning:"કાર્યરત લોકશાહી",erosion:"લોકશાહી ધોવાણ",backsliding:"લોકશાહી પ્રત્યાઘાત",authoritarian:"સર્વાધિકારી જોખમ",noStories:"હજી કોઈ સ્ટોરી નથી",tapFetch:"લાઇવ સમાચાર ફેચ કરો",fetchLive:"⚡ લાઇવ સમાચાર લાવો",impactRadius:"લોકશાહી અસર",constitutionViolations:"બંધારણીય ઉલ્લંઘન",constitutionSupports:"બંધારણીય સમર્થન",deptScore:"વિભાગ સ્કોર",liveScore:"લાઇવ સ્કોર",storiesTracked:"ટ્રૅક કરેલ સ્ટોરીઝ",evidenceLevels:{allegation:"આરોપ",single_source:"એકલ સ્રોત",corroborated:"પુષ્ટિ",official_doc:"સત્તાવાર દસ્તાવેજ",court_finding:"ન્યાયાલય નિર્ણય",final_adjudication:"અંતિમ ચુકાદો"},confidence:{high:"ઉચ્ચ વિશ્વાસ",moderate:"મધ્યમ વિશ્વાસ",low:"ઓછો વિશ્વાસ",developing:"વિકાસશીલ વાર્તા"},storyTypes:{policy:"નીતિ",law:"કાયદો",court:"ન્યાયાલય",policing:"પોલીસ",election:"ચૂંટણી",rights:"અધિકાર",corruption:"ભ્રષ્ટાચાર",welfare:"કલ્યાણ",speech:"વાણી",media:"મીડિયા",federalism:"સંઘવાદ",minority:"લઘુમતી અધિકાર"},citizenWhat:"શું થયું",citizenWhy:"આ શા માટે મહત્વનું છે",citizenScore:"બંધારણીય અસર",citizenStatus:"વર્તમાન સ્થિતિ",citizenNext:"આગળ શું જોવું",liveLabel:"લાઇવ",indiaDemocracy:"ભારત લોકશાહી સ્કોર",calibrated:"કેલિબ્રેટેડ: Freedom House · V-Dem · RSF · EIU",latestLabel:"તાજું",snapshot:"સ્નેપશોટ",tracked:"ટ્રૅક",supportsCount:"સમર્થન",courtPendingLabel:"ન્યાયાલય પ્રલંબિત",relatedStories:"સંબંધિત વાર્તાઓ",constitutionalStories:"બંધારણીય વાર્તાઓ",moreStories:"વધુ વાર્તાઓ",storiesSuffix:"વાર્તાઓ",updated:"અપડેટ કરાયેલ",constJournalism:"બંધારણીય પત્રકારત્વ",constJournalismSub:"દરેક વાર્તા લોકશાહી અસર માટે સ્કોર · પુરાવા વર્ગીકૃત · ભારતીય બંધારણના લેખો સાથે મેપ",aiEnrichAll:"AI બધા સમૃદ્ધ કરો",autoFetchActive:"ઓટો-ફેચ સક્રિય",nextUpdate:"આગામી અપડેટ",readOriginal:"મૂળ લેખ વાંચો",filterAll:"બધા",filterCourt:"કોર્ટ સક્રિય",filterUnresolved:"અનિર્ણાયિત",labelSupport:"સમર્થન",labelCritical:"ગંભીર",labelConcern:"ચિંતા",labelUpdate:"અપડેટ",bandStrong:"મજબૂત બંધારણીય સમર્થન",bandStable:"મોટાભાગે સ્થિર",bandMixed:"મિશ્ર લોકશાહી આરોગ્ય",bandConcerns:"નોંધપાત્ર ચિંતાઓ",bandSevere:"ગંભીર લોકશાહી તણાવ",generalLabel:"સામાન્ય",signOutQ:"સાઇન આઉટ?",alertsEnable:"અલર્ટ ચાલુ કરો",alertsOn:"અલર્ટ ચાલુ",alertsBlocked:"અવરોધિત",installForAlerts:"અલર્ટ માટે ઇન્સ્ટોલ કરો"},
ta:{name:"தமிழ்",flag:"🇮🇳",appName:"DTN மித்தோஸ்",appSub:"இந்தியாவுக்கான அரசியலமைப்பு நுண்ணறிவு தளம்",tagline:"நேரடி அரசியலமைப்பு பத்திரிகையியல் · மதிப்பெண்கள் · துறைகள் · 10 மொழிகள்",signIn:"உள்நுழைக",signInSub:"செய்திகள் இந்தியாவின் அரசியலமைப்பு உரிமைகளுக்கு என்னவென்பதை புரிந்துகொள்ளுங்கள்",yourName:"உங்கள் பெயர்",yourEmail:"மின்னஞ்சல் (விருப்பத்தேர்வு)",continueBtn:"தளத்தில் நுழைக →",guestMode:"விருந்தினராக தொடரவும்",disclaimerTitle:"நாங்கள் அரசியலமைப்பு ஆரோக்கியத்தை எவ்வாறு மதிப்பிடுகிறோம்",disclaimerSub:"நுழைவதற்கு முன் கவனமாக படிக்கவும்",disclaimerAccept:"நான் புரிந்துகொள்கிறேன் — தளத்தில் நுழைக",dashboard:"டாஷ்போர்டு",newsroom:"நேரடி நியூஸ்ரூம்",tracker:"அரசியலமைப்பு கண்காணிப்பு",demoScore:"ஜனநாயக மதிப்பெண்",departments:"துறைகள்",states:"மாநிலங்கள்",rights:"என் உரிமைகள்",journalist:"பத்திரிகையாளர் கன்சோல்",citizenMode:"குடிமக்கள் பயன்முறை",expertMode:"நிபுணர் பயன்முறை",submit:"அறிக்கை சமர்ப்பி",review:"மதிப்பாய்வு",method:"முறைவியல்",about:"பற்றி",fetch:"பெறு",auto:"தானியங்கி",national:"தேசிய",state:"மாநில",district:"மாவட்டம்",critical:"முக்கியமான",positive:"ஆதரவு",high:"கவலை",impact:"📊 தாக்கம்",facts:"⚖ அரசியலமைப்பு",mythos:"✦ நுண்ணறிவு",evidence:"சான்று",govResponse:"அரசு பதில்",courtStatus:"நீதிமன்ற நிலை",violation:"மீறல்",support:"ஆதரவு",functioning:"செயல்படும் ஜனநாயகம்",erosion:"ஜனநாயக அரிப்பு",backsliding:"ஜனநாயக பின்னடைவு",authoritarian:"சர்வாதிகார ஆபத்து",noStories:"இன்னும் கதைகள் இல்லை",tapFetch:"நேரடி செய்திகளை பெறு",fetchLive:"⚡ நேரடி செய்திகளை பெறுக",impactRadius:"ஜனநாயக தாக்கம்",constitutionViolations:"அரசியலமைப்பு மீறல்கள்",constitutionSupports:"அரசியலமைப்பு ஆதரவுகள்",deptScore:"துறை மதிப்பெண்",liveScore:"நேரடி மதிப்பெண்",storiesTracked:"கண்காணிக்கப்பட்ட கதைகள்",evidenceLevels:{allegation:"குற்றச்சாட்டு",single_source:"ஒற்றை மூலம்",corroborated:"உறுதிப்படுத்தல்",official_doc:"அதிகாரப்பூர்வ ஆவணம்",court_finding:"நீதிமன்ற கண்டுபிடிப்பு",final_adjudication:"இறுதி தீர்ப்பு"},confidence:{high:"உயர் நம்பகத்தன்மை",moderate:"மிதமான நம்பகத்தன்மை",low:"குறைந்த நம்பகத்தன்மை",developing:"வளரும் கதை"},storyTypes:{policy:"கொள்கை",law:"சட்டம்",court:"நீதிமன்றம்",policing:"காவல்",election:"தேர்தல்",rights:"உரிமைகள்",corruption:"ஊழல்",welfare:"நலன்",speech:"பேச்சு",media:"ஊடகம்",federalism:"கூட்டாட்சி",minority:"சிறுபான்மை உரிமைகள்"},citizenWhat:"என்ன நடந்தது",citizenWhy:"ஏன் முக்கியம்",citizenScore:"அரசியலமைப்பு தாக்கம்",citizenStatus:"தற்போதைய நிலை",citizenNext:"அடுத்து என்ன பார்க்க வேண்டும்",liveLabel:"நேரடி",indiaDemocracy:"இந்திய ஜனநாயக மதிப்பெண்",calibrated:"அளவீடு: Freedom House · V-Dem · RSF · EIU",latestLabel:"சமீபத்தியது",snapshot:"ஸ்னாப்ஷாட்",tracked:"கண்காணிக்கப்பட்டது",supportsCount:"ஆதரவுகள்",courtPendingLabel:"நீதிமன்றம் நிலுவையில்",relatedStories:"தொடர்புடைய கதைகள்",constitutionalStories:"அரசியலமைப்பு கதைகள்",moreStories:"மேலும் கதைகள்",storiesSuffix:"கதைகள்",updated:"புதுப்பிக்கப்பட்டது",constJournalism:"அரசியலமைப்பு பத்திரிகை",constJournalismSub:"ஒவ்வொரு கதையும் ஜனநாயக தாக்கத்திற்கு மதிப்பிடப்பட்டது · சான்று வகைப்படுத்தப்பட்டது",aiEnrichAll:"AI அனைத்தையும் வளப்படுத்து",autoFetchActive:"தானியங்கி-பெறுதல் செயலில்",nextUpdate:"அடுத்த புதுப்பிப்பு",readOriginal:"அசல் கட்டுரையைப் படிக்கவும்",filterAll:"அனைத்தும்",filterCourt:"நீதிமன்றம் செயலில்",filterUnresolved:"தீர்க்கப்படாதது",labelSupport:"ஆதரவு",labelCritical:"முக்கியமானது",labelConcern:"கவலை",labelUpdate:"புதுப்பிப்பு",bandStrong:"வலுவான அரசியலமைப்பு ஆதரவு",bandStable:"பெரும்பாலும் நிலையானது",bandMixed:"கலவையான ஜனநாயக சுகாதாரம்",bandConcerns:"குறிப்பிடத்தக்க கவலைகள்",bandSevere:"கடுமையான ஜனநாயக மன அழுத்தம்",generalLabel:"பொது",signOutQ:"வெளியேறு?",alertsEnable:"எச்சரிக்கைகளை இயக்கு",alertsOn:"எச்சரிக்கைகள் ஆன்",alertsBlocked:"தடுக்கப்பட்டது",installForAlerts:"எச்சரிக்கைகளுக்கு நிறுவவும்"},
te:{name:"తెలుగు",flag:"🇮🇳",appName:"DTN మిథోస్",appSub:"భారతదేశానికి రాజ్యాంగ నుండి వేగులవారి నిఘా వేదిక",tagline:"నిజ-సమయ రాజ్యాంగ పాత్రికేయత · స్కోర్లు · విభాగాలు · 10 భాషలు",signIn:"సైన్ ఇన్",signInSub:"వార్తలు భారత రాజ్యాంగ హక్కులకు ఏమి అర్థమో తెలుసుకోండి",yourName:"మీ పేరు",yourEmail:"ఇమెయిల్ (ఐచ్ఛికం)",continueBtn:"ప్లాట్ఫారమ్ నమోదు చేయండి →",guestMode:"అతిథిగా కొనసాగించు",disclaimerTitle:"మేము రాజ్యాంగ ఆరోగ్యాన్ని ఎలా స్కోర్ చేస్తాం",disclaimerSub:"ప్రవేశించే ముందు జాగ్రత్తగా చదవండి",disclaimerAccept:"నాకు అర్థమైంది — ప్రవేశించండి",dashboard:"డ్యాష్బోర్డ్",newsroom:"లైవ్ న్యూస్‌రూమ్",tracker:"రాజ్యాంగ ట్రాకర్",demoScore:"ప్రజాస్వామ్య స్కోర్",departments:"విభాగాలు",states:"రాష్ట్రాలు",rights:"నా హక్కులు",journalist:"పాత్రికేయుడి కన్సోల్",citizenMode:"పౌర మోడ్",expertMode:"నిపుణుడి మోడ్",submit:"నివేదిక సమర్పించు",review:"సమీక్ష",method:"పద్దతి",about:"గురించి",fetch:"తీసుకు",auto:"ఆటో",national:"జాతీయ",state:"రాష్ట్రం",district:"జిల్లా",critical:"విమర్శనాత్మక",positive:"మద్దతు",high:"ఆందోళన",impact:"📊 ప్రభావం",facts:"⚖ రాజ్యాంగ",mythos:"✦ అంతర్దృష్టి",evidence:"సాక్ష్యం",govResponse:"ప్రభుత్వ స్పందన",courtStatus:"కోర్టు స్థితి",violation:"ఉల్లంఘన",support:"మద్దతు",functioning:"పని చేసే ప్రజాస్వామ్యం",erosion:"ప్రజాస్వామ్య కోత",backsliding:"ప్రజాస్వామ్య వెనకడుగు",authoritarian:"నిరంకుశ ప్రమాదం",noStories:"ఇంకా కథలు లేవు",tapFetch:"లైవ్ వార్తలు తీసుకురండి",fetchLive:"⚡ లైవ్ వార్తలు తీసుకు",impactRadius:"ప్రజాస్వామ్య ప్రభావం",constitutionViolations:"రాజ్యాంగ ఉల్లంఘనలు",constitutionSupports:"రాజ్యాంగ మద్దతులు",deptScore:"విభాగ స్కోర్",liveScore:"లైవ్ స్కోర్",storiesTracked:"ట్రాక్ చేయబడిన కథలు",evidenceLevels:{allegation:"ఆరోపణ",single_source:"ఒకే వనరు",corroborated:"ధృవీకరించబడింది",official_doc:"అధికారిక పత్రం",court_finding:"కోర్టు నిర్ధారణ",final_adjudication:"తుది తీర్పు"},confidence:{high:"అధిక విశ్వాసం",moderate:"మధ్యస్థ విశ్వాసం",low:"తక్కువ విశ్వాసం",developing:"అభివృద్ధి చెందుతున్న కథ"},storyTypes:{policy:"విధానం",law:"చట్టం",court:"కోర్టు",policing:"పోలీసింగ్",election:"ఎన్నిక",rights:"హక్కులు",corruption:"అవినీతి",welfare:"సంక్షేమం",speech:"వాక్",media:"మీడియా",federalism:"సమాఖ్యవాదం",minority:"మైనారిటీ హక్కులు"},citizenWhat:"ఏమి జరిగింది",citizenWhy:"ఎందుకు ముఖ్యం",citizenScore:"రాజ్యాంగ ప్రభావం",citizenStatus:"ప్రస్తుత స్థితి",citizenNext:"తదుపరి ఏమి చూడాలి",liveLabel:"ప్రత్యక్ష",indiaDemocracy:"భారత ప్రజాస్వామ్య స్కోర్",calibrated:"క్రమాంకనం: Freedom House · V-Dem · RSF · EIU",latestLabel:"తాజా",snapshot:"స్నాప్‌షాట్",tracked:"ట్రాక్",supportsCount:"మద్దతులు",courtPendingLabel:"కోర్టు పెండింగ్",relatedStories:"సంబంధిత కథలు",constitutionalStories:"రాజ్యాంగ కథలు",moreStories:"మరిన్ని కథలు",storiesSuffix:"కథలు",updated:"నవీకరించబడింది",constJournalism:"రాజ్యాంగ పాత్రికేయం",constJournalismSub:"ప్రతి కథ ప్రజాస్వామ్య ప్రభావం కోసం స్కోర్ · సాక్ష్యం వర్గీకరించబడింది",aiEnrichAll:"AI అన్నింటినీ సుసంపన్నం చేయండి",autoFetchActive:"ఆటో-ఫెచ్ క్రియాశీలం",nextUpdate:"తదుపరి నవీకరణ",readOriginal:"అసలు వ్యాసం చదవండి",filterAll:"అన్నీ",filterCourt:"కోర్టు క్రియాశీలం",filterUnresolved:"పరిష్కారం కాని",labelSupport:"మద్దతు",labelCritical:"క్రిటికల్",labelConcern:"ఆందోళన",labelUpdate:"నవీకరణ",bandStrong:"బలమైన రాజ్యాంగ మద్దతు",bandStable:"ఎక్కువగా స్థిరం",bandMixed:"మిశ్రమ ప్రజాస్వామ్య ఆరోగ్యం",bandConcerns:"ముఖ్యమైన ఆందోళనలు",bandSevere:"తీవ్రమైన ప్రజాస్వామ్య ఒత్తిడి",generalLabel:"సాధారణ",signOutQ:"సైన్ అవుట్?",alertsEnable:"హెచ్చరికలు ప్రారంభించండి",alertsOn:"హెచ్చరికలు ఆన్",alertsBlocked:"నిరోధించబడింది",installForAlerts:"హెచ్చరికలకు ఇన్‌స్టాల్"},
bn:{name:"বাংলা",flag:"🇮🇳",appName:"DTN মিথোস",appSub:"ভারতের জন্য সাংবিধানিক বুদ্ধিমত্তা প্ল্যাটফর্ম",tagline:"রিয়েল-টাইম সাংবিধানিক সাংবাদিকতা · স্কোর · বিভাগ · ১০ ভাষা",signIn:"সাইন ইন করুন",signInSub:"সংবাদ ভারতের সাংবিধানিক অধিকারের জন্য কী বোঝায় তা বুঝুন",yourName:"আপনার নাম",yourEmail:"ইমেল (ঐচ্ছিক)",continueBtn:"প্ল্যাটফর্মে প্রবেশ করুন →",guestMode:"অতিথি হিসেবে চালিয়ে যান",disclaimerTitle:"আমরা কীভাবে সাংবিধানিক স্বাস্থ্য স্কোর করি",disclaimerSub:"প্রবেশের আগে সাবধানে পড়ুন",disclaimerAccept:"আমি বুঝি — প্ল্যাটফর্মে প্রবেশ করুন",dashboard:"ড্যাশবোর্ড",newsroom:"লাইভ নিউজরুম",tracker:"সংবিধান ট্র্যাকার",demoScore:"গণতন্ত্র স্কোর",departments:"বিভাগ",states:"রাজ্য",rights:"আমার অধিকার",journalist:"সাংবাদিক কনসোল",citizenMode:"নাগরিক মোড",expertMode:"বিশেষজ্ঞ মোড",submit:"রিপোর্ট জমা",review:"পর্যালোচনা",method:"পদ্ধতি",about:"সম্পর্কে",fetch:"আনুন",auto:"অটো",national:"জাতীয়",state:"রাজ্য",district:"জেলা",critical:"সমালোচনামূলক",positive:"সমর্থন",high:"উদ্বেগ",impact:"📊 প্রভাব",facts:"⚖ সাংবিধানিক",mythos:"✦ অন্তর্দৃষ্টি",evidence:"প্রমাণ",govResponse:"সরকারি প্রতিক্রিয়া",courtStatus:"আদালত অবস্থা",violation:"লঙ্ঘন",support:"সমর্থন",functioning:"কার্যকরী গণতন্ত্র",erosion:"গণতান্ত্রিক ক্ষয়",backsliding:"গণতান্ত্রিক পশ্চাদপসরণ",authoritarian:"কর্তৃত্ববাদী ঝুঁকি",noStories:"এখনো কোনো স্টোরি নেই",tapFetch:"লাইভ সংবাদ আনুন",fetchLive:"⚡ লাইভ সংবাদ আনুন",impactRadius:"গণতান্ত্রিক প্রভাব",constitutionViolations:"সাংবিধানিক লঙ্ঘন",constitutionSupports:"সাংবিধানিক সমর্থন",deptScore:"বিভাগ স্কোর",liveScore:"লাইভ স্কোর",storiesTracked:"ট্র্যাক করা গল্প",evidenceLevels:{allegation:"অভিযোগ",single_source:"একক উৎস",corroborated:"নিশ্চিত",official_doc:"সরকারি দলিল",court_finding:"আদালতের রায়",final_adjudication:"চূড়ান্ত সিদ্ধান্ত"},confidence:{high:"উচ্চ আস্থা",moderate:"মাঝারি আস্থা",low:"কম আস্থা",developing:"চলমান গল্প"},storyTypes:{policy:"নীতি",law:"আইন",court:"আদালত",policing:"পুলিশিং",election:"নির্বাচন",rights:"অধিকার",corruption:"দুর্নীতি",welfare:"কল্যাণ",speech:"বাক",media:"মিডিয়া",federalism:"যুক্তরাষ্ট্রীয়তা",minority:"সংখ্যালঘু অধিকার"},citizenWhat:"কী ঘটেছিল",citizenWhy:"কেন গুরুত্বপূর্ণ",citizenScore:"সাংবিধানিক প্রভাব",citizenStatus:"বর্তমান অবস্থা",citizenNext:"পরবর্তী কী দেখবেন",liveLabel:"লাইভ",indiaDemocracy:"ভারত গণতন্ত্র স্কোর",calibrated:"ক্যালিব্রেটেড: Freedom House · V-Dem · RSF · EIU",latestLabel:"সর্বশেষ",snapshot:"স্ন্যাপশট",tracked:"ট্র্যাক",supportsCount:"সমর্থন",courtPendingLabel:"আদালত বিচারাধীন",relatedStories:"সম্পর্কিত গল্প",constitutionalStories:"সাংবিধানিক গল্প",moreStories:"আরও গল্প",storiesSuffix:"গল্প",updated:"আপডেটেড",constJournalism:"সাংবিধানিক সাংবাদিকতা",constJournalismSub:"প্রতিটি গল্প গণতন্ত্র প্রভাবের জন্য স্কোর · প্রমাণ শ্রেণীবদ্ধ · ভারতীয় সংবিধানের ধারায় ম্যাপ",aiEnrichAll:"AI সকলকে সমৃদ্ধ করুন",autoFetchActive:"অটো-ফেচ সক্রিয়",nextUpdate:"পরবর্তী আপডেট",readOriginal:"মূল নিবন্ধ পড়ুন",filterAll:"সকল",filterCourt:"আদালত সক্রিয়",filterUnresolved:"অমীমাংসিত",labelSupport:"সমর্থন",labelCritical:"সমালোচনামূলক",labelConcern:"উদ্বেগ",labelUpdate:"আপডেট",bandStrong:"দৃঢ় সাংবিধানিক সমর্থন",bandStable:"বেশিরভাগই স্থিতিশীল",bandMixed:"মিশ্র গণতান্ত্রিক স্বাস্থ্য",bandConcerns:"উল্লেখযোগ্য উদ্বেগ",bandSevere:"গুরুতর গণতান্ত্রিক চাপ",generalLabel:"সাধারণ",signOutQ:"সাইন আউট?",alertsEnable:"সতর্কতা সক্ষম করুন",alertsOn:"সতর্কতা চালু",alertsBlocked:"অবরুদ্ধ",installForAlerts:"সতর্কতার জন্য ইনস্টল"},
mr:{name:"मराठी",flag:"🇮🇳",appName:"DTN मिथोस",appSub:"भारतासाठी घटनात्मक बुद्धिमत्ता व्यासपीठ",tagline:"रीअल-टाइम घटनात्मक पत्रकारिता · स्कोर · विभाग · 10 भाषा",signIn:"साइन इन करा",signInSub:"बातम्या भारताच्या घटनात्मक अधिकारांसाठी काय सांगतात ते समजा",yourName:"तुमचे नाव",yourEmail:"ईमेल (वैकल्पिक)",continueBtn:"व्यासपीठात प्रवेश करा →",guestMode:"अतिथी म्हणून सुरू ठेवा",disclaimerTitle:"आम्ही घटनात्मक आरोग्य कसे स्कोर करतो",disclaimerSub:"प्रवेश करण्यापूर्वी काळजीपूर्वक वाचा",disclaimerAccept:"मला समजले — व्यासपीठात प्रवेश करा",dashboard:"डॅशबोर्ड",newsroom:"लाइव्ह न्यूजरूम",tracker:"संविधान ट्रॅकर",demoScore:"लोकशाही स्कोर",departments:"विभाग",states:"राज्ये",rights:"माझे अधिकार",journalist:"पत्रकार कन्सोल",citizenMode:"नागरिक मोड",expertMode:"तज्ज्ञ मोड",submit:"अहवाल सादर",review:"पुनरावलोकन",method:"पद्धत",about:"बद्दल",fetch:"आण",auto:"ऑटो",national:"राष्ट्रीय",state:"राज्य",district:"जिल्हा",critical:"गंभीर",positive:"समर्थन",high:"चिंता",impact:"📊 परिणाम",facts:"⚖ घटनात्मक",mythos:"✦ अंतर्दृष्टी",evidence:"पुरावा",govResponse:"सरकारी प्रतिसाद",courtStatus:"न्यायालय स्थिती",violation:"उल्लंघन",support:"समर्थन",functioning:"कार्यशील लोकशाही",erosion:"लोकशाही क्षरण",backsliding:"लोकशाही माघार",authoritarian:"हुकूमशाही धोका",noStories:"अद्याप कोणत्याही कथा नाहीत",tapFetch:"लाइव्ह बातम्या आणा",fetchLive:"⚡ लाइव्ह बातम्या आणा",impactRadius:"लोकशाही प्रभाव",constitutionViolations:"घटनात्मक उल्लंघने",constitutionSupports:"घटनात्मक समर्थन",deptScore:"विभाग स्कोर",liveScore:"लाइव्ह स्कोर",storiesTracked:"मागोवा घेतलेल्या कथा",evidenceLevels:{allegation:"आरोप",single_source:"एकल स्रोत",corroborated:"पुष्टी",official_doc:"अधिकृत दस्तऐवज",court_finding:"न्यायालय निर्णय",final_adjudication:"अंतिम निर्णय"},confidence:{high:"उच्च विश्वास",moderate:"मध्यम विश्वास",low:"कमी विश्वास",developing:"विकसित होणारी कथा"},storyTypes:{policy:"धोरण",law:"कायदा",court:"न्यायालय",policing:"पोलीस",election:"निवडणूक",rights:"अधिकार",corruption:"भ्रष्टाचार",welfare:"कल्याण",speech:"वाणी",media:"माध्यमे",federalism:"संघराज्यवाद",minority:"अल्पसंख्यांक अधिकार"},citizenWhat:"काय झाले",citizenWhy:"हे का महत्त्वाचे आहे",citizenScore:"घटनात्मक प्रभाव",citizenStatus:"सध्याची स्थिती",citizenNext:"पुढे काय पाहावे",liveLabel:"थेट",indiaDemocracy:"भारत लोकशाही स्कोर",calibrated:"कॅलिब्रेटेड: Freedom House · V-Dem · RSF · EIU",latestLabel:"ताजे",snapshot:"स्नॅपशॉट",tracked:"मागोवा",supportsCount:"समर्थन",courtPendingLabel:"न्यायालय प्रलंबित",relatedStories:"संबंधित कथा",constitutionalStories:"घटनात्मक कथा",moreStories:"अधिक कथा",storiesSuffix:"कथा",updated:"अद्यतनित",constJournalism:"घटनात्मक पत्रकारिता",constJournalismSub:"प्रत्येक कथा लोकशाही परिणामासाठी स्कोर · पुरावा वर्गीकृत · भारतीय संविधान लेखांशी जोडलेले",aiEnrichAll:"AI सर्व समृद्ध करा",autoFetchActive:"ऑटो-फेच सक्रिय",nextUpdate:"पुढील अद्यतन",readOriginal:"मूळ लेख वाचा",filterAll:"सर्व",filterCourt:"न्यायालय सक्रिय",filterUnresolved:"निराकरण न झालेले",labelSupport:"समर्थन",labelCritical:"गंभीर",labelConcern:"चिंता",labelUpdate:"अद्यतन",bandStrong:"मजबूत घटनात्मक समर्थन",bandStable:"बहुतेक स्थिर",bandMixed:"मिश्र लोकशाही आरोग्य",bandConcerns:"लक्षणीय चिंता",bandSevere:"गंभीर लोकशाही ताण",generalLabel:"सामान्य",signOutQ:"साइन आउट?",alertsEnable:"अलर्ट सक्षम करा",alertsOn:"अलर्ट चालू",alertsBlocked:"अवरोधित",installForAlerts:"अलर्ट साठी इंस्टॉल"},
kn:{name:"ಕನ್ನಡ",flag:"🇮🇳",appName:"DTN ಮಿಥೋಸ್",appSub:"ಭಾರತಕ್ಕಾಗಿ ಸಾಂವಿಧಾನಿಕ ಗುಪ್ತಚರ ವೇದಿಕೆ",tagline:"ನೈಜ-ಸಮಯ ಸಾಂವಿಧಾನಿಕ ಪತ್ರಿಕೋದ್ಯಮ · ಸ್ಕೋರ್ · ಇಲಾಖೆಗಳು · 10 ಭಾಷೆಗಳು",signIn:"ಸೈನ್ ಇನ್",signInSub:"ಸುದ್ದಿ ಭಾರತದ ಸಾಂವಿಧಾನಿಕ ಹಕ್ಕುಗಳಿಗೆ ಏನು ಅರ್ಥ ಎಂದು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ",yourName:"ನಿಮ್ಮ ಹೆಸರು",yourEmail:"ಇಮೇಲ್ (ಐಚ್ಛಿಕ)",continueBtn:"ಪ್ಲಾಟ್ಫಾರ್ಮ್ ಪ್ರವೇಶಿಸಿ →",guestMode:"ಅತಿಥಿಯಾಗಿ ಮುಂದುವರಿಯಿರಿ",disclaimerTitle:"ನಾವು ಸಾಂವಿಧಾನಿಕ ಆರೋಗ್ಯವನ್ನು ಹೇಗೆ ಸ್ಕೋರ್ ಮಾಡುತ್ತೇವೆ",disclaimerSub:"ಪ್ರವೇಶಿಸುವ ಮೊದಲು ಎಚ್ಚರಿಕೆಯಿಂದ ಓದಿ",disclaimerAccept:"ನನಗೆ ಅರ್ಥವಾಗಿದೆ — ಪ್ರವೇಶಿಸಿ",dashboard:"ಡ್ಯಾಶ್ಬೋರ್ಡ್",newsroom:"ಲೈವ್ ನ್ಯೂಸ್ರೂಮ್",tracker:"ಸಂವಿಧಾನ ಟ್ರ್ಯಾಕರ್",demoScore:"ಪ್ರಜಾಪ್ರಭುತ್ವ ಸ್ಕೋರ್",departments:"ಇಲಾಖೆಗಳು",states:"ರಾಜ್ಯಗಳು",rights:"ನನ್ನ ಹಕ್ಕುಗಳು",journalist:"ಪತ್ರಕರ್ತ ಕನ್ಸೋಲ್",citizenMode:"ನಾಗರಿಕ ಮೋಡ್",expertMode:"ತಜ್ಞ ಮೋಡ್",submit:"ವರದಿ ಸಲ್ಲಿಸಿ",review:"ಪರಿಶೀಲನೆ",method:"ವಿಧಾನ",about:"ಬಗ್ಗೆ",fetch:"ತರಿ",auto:"ಸ್ವಯಂ",national:"ರಾಷ್ಟ್ರೀಯ",state:"ರಾಜ್ಯ",district:"ಜಿಲ್ಲೆ",critical:"ನಿರ್ಣಾಯಕ",positive:"ಬೆಂಬಲ",high:"ಕಾಳಜಿ",impact:"📊 ಪ್ರಭಾವ",facts:"⚖ ಸಾಂವಿಧಾನಿಕ",mythos:"✦ ಒಳನೋಟ",evidence:"ಸಾಕ್ಷ್ಯ",govResponse:"ಸರ್ಕಾರಿ ಪ್ರತಿಕ್ರಿಯೆ",courtStatus:"ನ್ಯಾಯಾಲಯ ಸ್ಥಿತಿ",violation:"ಉಲ್ಲಂಘನೆ",support:"ಬೆಂಬಲ",functioning:"ಕಾರ್ಯನಿರ್ವಹಿಸುವ ಪ್ರಜಾಪ್ರಭುತ್ವ",erosion:"ಪ್ರಜಾಪ್ರಭುತ್ವ ಸವೆತ",backsliding:"ಪ್ರಜಾಪ್ರಭುತ್ವ ಹಿನ್ನಡೆ",authoritarian:"ನಿರಂಕುಶ ಅಪಾಯ",noStories:"ಇನ್ನು ಕಥೆಗಳಿಲ್ಲ",tapFetch:"ಲೈವ್ ಸುದ್ದಿ ಲೋಡ್ ಮಾಡಿ",fetchLive:"⚡ ಲೈವ್ ಸುದ್ದಿ ತರಿ",impactRadius:"ಪ್ರಜಾಪ್ರಭುತ್ವ ಪ್ರಭಾವ",constitutionViolations:"ಸಾಂವಿಧಾನಿಕ ಉಲ್ಲಂಘನೆಗಳು",constitutionSupports:"ಸಾಂವಿಧಾನಿಕ ಬೆಂಬಲಗಳು",deptScore:"ಇಲಾಖೆ ಸ್ಕೋರ್",liveScore:"ಲೈವ್ ಸ್ಕೋರ್",storiesTracked:"ಟ್ರ್ಯಾಕ್ ಮಾಡಲಾದ ಕಥೆಗಳು",evidenceLevels:{allegation:"ಆರೋಪ",single_source:"ಏಕ ಮೂಲ",corroborated:"ದೃಢಪಡಿಸಲಾಗಿದೆ",official_doc:"ಅಧಿಕೃತ ದಾಖಲೆ",court_finding:"ನ್ಯಾಯಾಲಯ ನಿರ್ಧಾರ",final_adjudication:"ಅಂತಿಮ ತೀರ್ಪು"},confidence:{high:"ಹೆಚ್ಚಿನ ವಿಶ್ವಾಸ",moderate:"ಮಧ್ಯಮ ವಿಶ್ವಾಸ",low:"ಕಡಿಮೆ ವಿಶ್ವಾಸ",developing:"ಅಭಿವೃದ್ಧಿ ಕಥೆ"},storyTypes:{policy:"ನೀತಿ",law:"ಕಾನೂನು",court:"ನ್ಯಾಯಾಲಯ",policing:"ಪೊಲೀಸ್",election:"ಚುನಾವಣೆ",rights:"ಹಕ್ಕುಗಳು",corruption:"ಭ್ರಷ್ಟಾಚಾರ",welfare:"ಕಲ್ಯಾಣ",speech:"ವಾಕ್",media:"ಮಾಧ್ಯಮ",federalism:"ಸಂಘೀಯವಾದ",minority:"ಅಲ್ಪಸಂಖ್ಯಾತ ಹಕ್ಕುಗಳು"},citizenWhat:"ಏನಾಯಿತು",citizenWhy:"ಏಕೆ ಮುಖ್ಯ",citizenScore:"ಸಾಂವಿಧಾನಿಕ ಪ್ರಭಾವ",citizenStatus:"ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ",citizenNext:"ಮುಂದೆ ಏನು ನೋಡಬೇಕು",liveLabel:"ಲೈವ್",indiaDemocracy:"ಭಾರತ ಪ್ರಜಾಪ್ರಭುತ್ವ ಸ್ಕೋರ್",calibrated:"ಮಾಪನಾಂಕ: Freedom House · V-Dem · RSF · EIU",latestLabel:"ಇತ್ತೀಚಿನ",snapshot:"ಸ್ನ್ಯಾಪ್‌ಶಾಟ್",tracked:"ಟ್ರ್ಯಾಕ್",supportsCount:"ಬೆಂಬಲಗಳು",courtPendingLabel:"ನ್ಯಾಯಾಲಯ ಬಾಕಿ",relatedStories:"ಸಂಬಂಧಿತ ಕಥೆಗಳು",constitutionalStories:"ಸಾಂವಿಧಾನಿಕ ಕಥೆಗಳು",moreStories:"ಹೆಚ್ಚು ಕಥೆಗಳು",storiesSuffix:"ಕಥೆಗಳು",updated:"ನವೀಕರಿಸಲಾಗಿದೆ",constJournalism:"ಸಾಂವಿಧಾನಿಕ ಪತ್ರಿಕೋದ್ಯಮ",constJournalismSub:"ಪ್ರತಿ ಕಥೆಯು ಪ್ರಜಾಪ್ರಭುತ್ವ ಪ್ರಭಾವಕ್ಕಾಗಿ ಸ್ಕೋರ್ · ಸಾಕ್ಷ್ಯ ವರ್ಗೀಕೃತ",aiEnrichAll:"AI ಎಲ್ಲವನ್ನೂ ಉತ್ಕೃಷ್ಟಗೊಳಿಸಿ",autoFetchActive:"ಸ್ವಯಂ-ಫೆಚ್ ಸಕ್ರಿಯ",nextUpdate:"ಮುಂದಿನ ನವೀಕರಣ",readOriginal:"ಮೂಲ ಲೇಖನ ಓದಿ",filterAll:"ಎಲ್ಲಾ",filterCourt:"ನ್ಯಾಯಾಲಯ ಸಕ್ರಿಯ",filterUnresolved:"ಬಗೆಹರಿಯದ",labelSupport:"ಬೆಂಬಲ",labelCritical:"ನಿರ್ಣಾಯಕ",labelConcern:"ಕಾಳಜಿ",labelUpdate:"ನವೀಕರಣ",bandStrong:"ಬಲವಾದ ಸಾಂವಿಧಾನಿಕ ಬೆಂಬಲ",bandStable:"ಹೆಚ್ಚಾಗಿ ಸ್ಥಿರ",bandMixed:"ಮಿಶ್ರ ಪ್ರಜಾಪ್ರಭುತ್ವ ಆರೋಗ್ಯ",bandConcerns:"ಗಮನಾರ್ಹ ಕಾಳಜಿಗಳು",bandSevere:"ತೀವ್ರ ಪ್ರಜಾಪ್ರಭುತ್ವ ಒತ್ತಡ",generalLabel:"ಸಾಮಾನ್ಯ",signOutQ:"ಸೈನ್ ಔಟ್?",alertsEnable:"ಎಚ್ಚರಿಕೆಗಳನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಿ",alertsOn:"ಎಚ್ಚರಿಕೆಗಳು ಆನ್",alertsBlocked:"ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ",installForAlerts:"ಎಚ್ಚರಿಕೆಗಳಿಗಾಗಿ ಸ್ಥಾಪಿಸಿ"},
ml:{name:"മലയാളം",flag:"🇮🇳",appName:"DTN മിത്തോസ്",appSub:"ഇന്ത്യക്കുള്ള ഭരണഘടനാ ഇന്റലിജന്‍സ് പ്ലാറ്റ്ഫോം",tagline:"തത്സമയ ഭരണഘടനാ പത്രപ്രവര്‍ത്തനം · സ്കോറുകള്‍ · വകുപ്പുകള്‍ · 10 ഭാഷകള്‍",signIn:"സൈന്‍ ഇന്‍",signInSub:"വാര്‍ത്ത ഇന്ത്യയുടെ ഭരണഘടനാ അവകാശങ്ങള്‍ക്ക് എന്താണ് അര്‍ഥം എന്ന് മനസ്സിലാക്കൂ",yourName:"നിങ്ങളുടെ പേര്",yourEmail:"ഇമെയില്‍ (ഐച്ഛികം)",continueBtn:"പ്ലാറ്റ്ഫോം നല്‍കുക →",guestMode:"അതിഥിയായി തുടരുക",disclaimerTitle:"ഞങ്ങള്‍ ഭരണഘടനാ ആരോഗ്യം എങ്ങനെ സ്കോര്‍ ചെയ്യുന്നു",disclaimerSub:"പ്രവേശിക്കുന്നതിന് മുമ്പ് ശ്രദ്ധയോടെ വായിക്കുക",disclaimerAccept:"എനിക്ക് മനസ്സിലായി — പ്ലാറ്റ്ഫോം നല്‍കുക",dashboard:"ഡാഷ്ബോര്‍ഡ്",newsroom:"തത്സമയ ന്യൂസ്‌റൂം",tracker:"ഭരണഘടനാ ട്രാക്കര്‍",demoScore:"ജനാധിപത്യ സ്കോര്‍",departments:"വകുപ്പുകള്‍",states:"സംസ്ഥാനങ്ങള്‍",rights:"എന്‍റെ അവകാശങ്ങള്‍",journalist:"പത്രകണ്‍സോള്‍",citizenMode:"പൗര മോഡ്",expertMode:"വിദഗ്ദ്ധ മോഡ്",submit:"റിപ്പോര്‍ട്ട് സമര്‍പ്പിക്കുക",review:"അവലോകനം",method:"രീതിശാസ്ത്രം",about:"കുറിച്ച്",fetch:"ഫെച്ച്",auto:"ഓട്ടോ",national:"ദേശീയ",state:"സംസ്ഥാനം",district:"ജില്ല",critical:"നിര്‍ണ്ണായക",positive:"പിന്തുണ",high:"ആശങ്ക",impact:"📊 ആഘാതം",facts:"⚖ ഭരണഘടനാ",mythos:"✦ ഉള്‍ക്കാഴ്ച",evidence:"തെളിവ്",govResponse:"സര്‍ക്കാര്‍ പ്രതികരണം",courtStatus:"കോടതി നില",violation:"ലംഘനം",support:"പിന്തുണ",functioning:"പ്രവര്‍ത്തിക്കുന്ന ജനാധിപത്യം",erosion:"ജനാധിപത്യ ശോഷണം",backsliding:"ജനാധിപത്യ പിന്നോക്കം",authoritarian:"സ്വേച്ഛാധിപത്യ അപകടം",noStories:"ഇതുവരെ കഥകള്‍ ഇല്ല",tapFetch:"തത്സമയ വാര്‍ത്ത ലോഡ് ചെയ്യുക",fetchLive:"⚡ തത്സമയ വാര്‍ത്ത ഫെച്ച് ചെയ്യുക",impactRadius:"ജനാധിപത്യ ആഘാതം",constitutionViolations:"ഭരണഘടനാ ലംഘനങ്ങള്‍",constitutionSupports:"ഭരണഘടനാ പിന്തുണകള്‍",deptScore:"വകുപ്പ് സ്കോര്‍",liveScore:"തത്സമയ സ്കോര്‍",storiesTracked:"ട്രാക്ക് ചെയ്ത കഥകള്‍",evidenceLevels:{allegation:"ആരോപണം",single_source:"ഒറ്റ ഉറവിടം",corroborated:"സ്ഥിരീകരിക്കപ്പെട്ടത്",official_doc:"ഔദ്യോഗിക രേഖ",court_finding:"കോടതി കണ്ടെത്തല്‍",final_adjudication:"അന്തിമ വിധി"},confidence:{high:"ഉയര്‍ന്ന ആത്മവിശ്വാസം",moderate:"മിതമായ ആത്മവിശ്വാസം",low:"കുറഞ്ഞ ആത്മവിശ്വാസം",developing:"വളരുന്ന കഥ"},storyTypes:{policy:"നയം",law:"നിയമം",court:"കോടതി",policing:"പോലീസ്",election:"തിരഞ്ഞെടുപ്പ്",rights:"അവകാശങ്ങള്‍",corruption:"അഴിമതി",welfare:"ക്ഷേമം",speech:"വാക്ക്",media:"മാധ്യമം",federalism:"ഫെഡറലിസം",minority:"ന്യൂനപക്ഷ അവകാശങ്ങള്‍"},citizenWhat:"എന്ത് സംഭവിച്ചു",citizenWhy:"എന്തുകൊണ്ട് പ്രധാനം",citizenScore:"ഭരണഘടനാ ആഘാതം",citizenStatus:"നിലവിലെ നില",citizenNext:"അടുത്തതായി എന്ത് നോക്കണം",liveLabel:"തത്സമയം",indiaDemocracy:"ഇന്ത്യ ജനാധിപത്യ സ്കോർ",calibrated:"കാലിബ്രേറ്റഡ്: Freedom House · V-Dem · RSF · EIU",latestLabel:"പുതിയത്",snapshot:"സ്നാപ്പ്‌ഷോട്ട്",tracked:"ട്രാക്ക്",supportsCount:"പിന്തുണകൾ",courtPendingLabel:"കോടതി തീർപ്പാക്കാത്തത്",relatedStories:"ബന്ധപ്പെട്ട കഥകൾ",constitutionalStories:"ഭരണഘടനാ കഥകൾ",moreStories:"കൂടുതൽ കഥകൾ",storiesSuffix:"കഥകൾ",updated:"അപ്‌ഡേറ്റ് ചെയ്തു",constJournalism:"ഭരണഘടനാ പത്രപ്രവർത്തനം",constJournalismSub:"എല്ലാ കഥയും ജനാധിപത്യ ആഘാതത്തിനായി സ്കോർ ചെയ്തു · തെളിവ് വർഗ്ഗീകരിച്ചു",aiEnrichAll:"AI എല്ലാം സമ്പന്നമാക്കുക",autoFetchActive:"ഓട്ടോ-ഫെച്ച് സജീവം",nextUpdate:"അടുത്ത അപ്‌ഡേറ്റ്",readOriginal:"യഥാർത്ഥ ലേഖനം വായിക്കുക",filterAll:"എല്ലാം",filterCourt:"കോടതി സജീവം",filterUnresolved:"പരിഹരിക്കാത്തത്",labelSupport:"പിന്തുണ",labelCritical:"നിർണായകം",labelConcern:"ആശങ്ക",labelUpdate:"അപ്‌ഡേറ്റ്",bandStrong:"ശക്തമായ ഭരണഘടനാ പിന്തുണ",bandStable:"മിക്കവാറും സ്ഥിരം",bandMixed:"മിശ്ര ജനാധിപത്യ ആരോഗ്യം",bandConcerns:"പ്രധാന ആശങ്കകൾ",bandSevere:"ഗുരുതരമായ ജനാധിപത്യ സമ്മർദ്ദം",generalLabel:"പൊതു",signOutQ:"സൈൻ ഔട്ട്?",alertsEnable:"അലേർട്ടുകൾ പ്രവർത്തനക്ഷമമാക്കുക",alertsOn:"അലേർട്ടുകൾ ഓൺ",alertsBlocked:"തടഞ്ഞു",installForAlerts:"അലേർട്ടുകൾക്കായി ഇൻസ്റ്റാൾ ചെയ്യുക"},
};


// ── LUCIDE-STYLE ICON SYSTEM ──────────────────────────────────
// Minimal inline SVG icons (24x24, stroke-based) — Bloomberg editorial feel.
// Usage: <Icon name="globe" size={14}/>
const ICONS={
  globe:"M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
  landmark:"M3 22h18M6 18V11M10 18V11M14 18V11M18 18V11M2 11h20L12 3 2 11z",
  mapPin:"M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0zM12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  zap:"M13 2L3 14h7v8l10-12h-7V2z",
  bell:"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M13.73 21a2 2 0 0 1-3.46 0",
  bellOff:"M13.73 21a2 2 0 0 1-3.46 0M18.63 13A17 17 0 0 1 18 8M6.26 6.26A6 6 0 0 0 6 8c0 7-3 9-3 9h14M18 8a6 6 0 0 0-9.33-5M1 1l22 22",
  refresh:"M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16",
  smartphone:"M5 2h14a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM12 18h.01",
  shield:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  scale:"M16 11l-4-7-4 7M3 17l6-10M21 17l-6-10M3 17h18M7 21h10",
  fileText:"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  gauge:"M12 12l3-3M3 12a9 9 0 0 1 18 0",
  book:"M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5",
  users:"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  home:"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10",
  dollar:"M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  bookOpen:"M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z",
  heartPulse:"M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.5 1-1a5.5 5.5 0 0 0 0-7.8zM3.5 12h3l2-3 4 6 2-3h6",
  baby:"M9 12a3 3 0 1 0 6 0M12 3v4M8 8s-2 2-2 4M16 8s2 2 2 4",
  handshake:"M11 17l2 2 4-4M21 12l-7-7-2 2 3 3-3 3 2 2 7-3z",
  sprout:"M7 20h10M10 20v-6a4 4 0 1 0-4-4 4 4 0 0 0 4-4 4 4 0 1 0 4 4 4 4 0 0 0-4 4v6",
  building:"M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18M2 22h20M10 6h4M10 10h4M10 14h4M10 18h4",
  trees:"M17 14v5M7 14v6M17 14a4 4 0 1 0-8 0M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5M12 2a4 4 0 0 0-4 4c0 1.5.8 2.8 2 3.5",
  star:"M12 2l3 7h7l-6 4 2 7-6-4-6 4 2-7-6-4h7z",
  shieldAlert:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM12 8v4M12 16h.01",
  vote:"M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z",
  newspaper:"M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zM18 14h-8M15 18h-5M10 6h8v4h-8z",
  plus:"M12 5v14M5 12h14",
  check:"M20 6L9 17l-5-5",
  info:"M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 16v-4M12 8h.01",
  chart:"M3 3v18h18M7 12l4 4 4-4 4-8",
  search:"M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z",
  bulb:"M9 18h6M10 22h4M12 2a7 7 0 0 1 4 12.7V17H8v-2.3A7 7 0 0 1 12 2z",
  barChart:"M12 20V10M18 20V4M6 20v-4",
  eye:"M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  circle:"M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z",
  circleDot:"M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  square:"M3 3h18v18H3z",
  squareCheck:"M3 3h18v18H3zM9 12l2 2 4-4",
};
function Icon({name,size=14,color="currentColor",strokeWidth=1.75,style={}}){
  const d=ICONS[name];if(!d)return null;
  return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{display:"inline-block",verticalAlign:"-2px",flexShrink:0,...style}}><path d={d}/></svg>);
}

// Department → icon name mapping (replaces emojis in DEPT icons)
const DEPT_ICON_MAP={pmo:"landmark",home:"home",law:"scale",finance:"dollar",education:"book",health:"heartPulse",wcd:"baby",minority:"handshake",rural:"sprout",urban:"building",environment:"trees",defence:"star",police:"shieldAlert",ec:"vote",media:"newspaper",judiciary:"scale"};
function DeptIcon({id,size=12,color="currentColor"}){const n=DEPT_ICON_MAP[id];if(!n)return null;return<Icon name={n} size={size} color={color}/>;}


// ── 16 GOVERNMENT DEPARTMENTS ─────────────────────────────────
const DEPT={
pmo:{id:"pmo",name:"Prime Minister's Office",icon:"🏛",color:"#4A8FFF",desc:"Executive leadership, Cabinet coordination, Union policy direction",articles:["Art.52","Art.53","Art.74","Art.77"],base:52},
home:{id:"home",name:"Home Affairs",icon:"🏠",color:"#F04A5A",desc:"Internal security, state relations, citizenship, police coordination",articles:["Art.246","Art.355","Art.21","Art.22"],base:38},
law:{id:"law",name:"Law & Justice",icon:"⚖",color:"#0FD47C",desc:"Legal affairs, judicial appointments, constitutional amendments",articles:["Art.124","Art.217","Art.368"],base:50},
finance:{id:"finance",name:"Finance",icon:"💰",color:"#F5A623",desc:"Fiscal policy, taxation, economic regulations, ED operations",articles:["Art.265","Art.300A","Art.39"],base:48},
education:{id:"education",name:"Education",icon:"📚",color:"#9B7DFF",desc:"Schools, universities, curriculum, language policy, institutions",articles:["Art.21A","Art.30","Art.350A"],base:55},
health:{id:"health",name:"Health",icon:"🏥",color:"#0FD47C",desc:"Public health, hospitals, drug regulation, healthcare access",articles:["Art.21","Art.47"],base:50},
wcd:{id:"wcd",name:"Women & Child",icon:"👶",color:"#ec4899",desc:"Gender rights, child welfare, anti-trafficking, maternity policy",articles:["Art.15","Art.21","Art.39(f)"],base:44},
minority:{id:"minority",name:"Minority Affairs",icon:"🤝",color:"#F5A623",desc:"Rights of religious, linguistic minorities, scholarship schemes",articles:["Art.29","Art.30","Art.25","Art.14"],base:36},
rural:{id:"rural",name:"Rural Development",icon:"🌾",color:"#0FD47C",desc:"MGNREGA, Panchayati Raj, rural infrastructure, land rights",articles:["Art.40","Art.243","Art.39"],base:46},
urban:{id:"urban",name:"Urban Development",icon:"🏙",color:"#4A8FFF",desc:"Smart cities, municipal governance, housing, slum rehabilitation",articles:["Art.243W","Art.300A","Art.21"],base:44},
environment:{id:"environment",name:"Environment",icon:"🌿",color:"#0FD47C",desc:"Forest rights, environmental clearances, tribal displacement",articles:["Art.21","Art.48A","5th Sch"],base:42},
defence:{id:"defence",name:"Defence",icon:"⭐",color:"#6B7FA0",desc:"Armed forces, AFSPA zones, civilian accountability",articles:["Art.53","Art.355","Art.33","AFSPA"],base:62},
police:{id:"police",name:"Police & Safety",icon:"🚔",color:"#F04A5A",desc:"State police, custodial deaths, arbitrary arrests, encounters",articles:["Art.21","Art.22","Art.50"],base:28},
ec:{id:"ec",name:"Election Commission",icon:"🗳",color:"#9B7DFF",desc:"Electoral integrity, voter rolls, model code, EVM credibility",articles:["Art.324","Art.325","Art.326","Art.329"],base:58},
media:{id:"media",name:"Media & Information",icon:"📰",color:"#F5A623",desc:"Press freedom, media regulation, journalist safety, IT rules",articles:["Art.19(1)(a)","Art.19(2)"],base:26},
judiciary:{id:"judiciary",name:"Judiciary",icon:"🏛",color:"#0FD47C",desc:"Supreme Court, High Courts — constitutional guardian (institutional developments tracked carefully)",articles:["Art.124","Art.141","Art.226","Art.32","Art.136"],base:63},
};

const CA={"Art.14":{t:"Equality Before Law",c:"#6366f1"},"Art.15":{t:"No Discrimination",c:"#8b5cf6"},"Art.17":{t:"Abolition of Untouchability",c:"#c084fc"},"Art.19(1)(a)":{t:"Freedom of Speech & Press",c:"#f97316"},"Art.19(1)(b)":{t:"Right to Assembly",c:"#fb923c"},"Art.19(1)(c)":{t:"Right to Form Associations",c:"#f97316"},"Art.21":{t:"Right to Life & Liberty",c:"#ef4444"},"Art.21A":{t:"Right to Education",c:"#fca5a5"},"Art.22":{t:"Protection from Arrest",c:"#f87171"},"Art.23":{t:"No Forced Labour",c:"#fbbf24"},"Art.25":{t:"Freedom of Religion",c:"#ec4899"},"Art.26":{t:"Religious Autonomy",c:"#f472b6"},"Art.29":{t:"Minority Cultural Rights",c:"#c084fc"},"Art.30":{t:"Minority Education Rights",c:"#e879f9"},"Art.32":{t:"Constitutional Remedies",c:"#0FD47C"},"Art.39":{t:"Right to Livelihood",c:"#86efac"},"Art.40":{t:"Village Panchayats",c:"#6ee7b7"},"Art.46":{t:"Weaker Sections Protection",c:"#a5f3fc"},"Art.47":{t:"Right to Health",c:"#67e8f9"},"Art.48A":{t:"Environmental Protection",c:"#34d399"},"Art.50":{t:"Separation of Powers",c:"#60a5fa"},"Art.82":{t:"Delimitation After Census",c:"#60a5fa"},"Art.300A":{t:"Right to Property",c:"#fbbf24"},"Art.324":{t:"Election Commission Independence",c:"#f59e0b"},"Art.326":{t:"Universal Adult Suffrage",c:"#d97706"},"Art.350A":{t:"Mother Tongue Instruction",c:"#a78bfa"},"Art.355":{t:"Union Duty to Protect States",c:"#92400e"},"5th Sch":{t:"Tribal Areas & Scheduled Areas",c:"#047857"},"10th Sch":{t:"Anti-Defection Law",c:"#991b1b"},"AFSPA":{t:"Armed Forces Special Powers",c:"#dc2626"}};

const PILLARS={press_freedom:{label:"Press Freedom",color:"#f97316",base:22,weight:1.2,dept:"media"},liberty:{label:"Liberty",color:"#ef4444",base:35,weight:1.2,dept:"police"},equality:{label:"Equality",color:"#8b5cf6",base:32,weight:1.1,dept:"home"},electoral:{label:"Electoral",color:"#4A8FFF",base:48,weight:1.0,dept:"ec"},separation:{label:"Separation of Powers",color:"#0FD47C",base:43,weight:0.9,dept:"law"},religion:{label:"Religious Freedom",color:"#ec4899",base:28,weight:1.0,dept:"minority"},justice:{label:"Access to Justice",color:"#0FD47C",base:45,weight:0.9,dept:"judiciary"},welfare:{label:"Public Welfare",color:"#F5A623",base:42,weight:0.8,dept:"rural"},environment:{label:"Environment Rights",color:"#34d399",base:38,weight:0.8,dept:"environment"}};

const STATE_BASELINES={"Andhra Pradesh":45,"Arunachal Pradesh":52,"Assam":29,"Bihar":38,"Chhattisgarh":34,"Goa":40,"Gujarat":35,"Haryana":37,"Himachal Pradesh":53,"Jharkhand":43,"Karnataka":55,"Kerala":64,"Madhya Pradesh":38,"Maharashtra":40,"Manipur":17,"Meghalaya":51,"Mizoram":54,"Nagaland":48,"Odisha":47,"Punjab":50,"Rajasthan":44,"Sikkim":57,"Tamil Nadu":59,"Telangana":49,"Tripura":46,"Uttar Pradesh":26,"Uttarakhand":50,"West Bengal":39,"Delhi":41,"J&K":30};

// Evidence levels — CORE differentiator
const EVIDENCE_LEVELS={
  allegation:     {label:"Allegation",        color:"#94a3b8",weight:0.2,cls:"ev-allegation",desc:"Unverified claim — insufficient evidence to score"},
  single_source:  {label:"Single Source",     color:"#F5A623",weight:0.4,cls:"ev-corroborated",desc:"One source only — moderate weight until corroborated"},
  corroborated:   {label:"Corroborated",      color:"#F5A623",weight:0.65,cls:"ev-corroborated",desc:"Multiple independent sources confirm the event"},
  official_doc:   {label:"Official Document", color:"#4A8FFF",weight:0.85,cls:"ev-official",desc:"Primary source — gazette, order, official notification"},
  court_finding:  {label:"Court Finding",     color:"#0FD47C",weight:0.92,cls:"ev-court",desc:"Judicial determination — court order or judgment"},
  final_adjudication:{label:"Final Adjudication",color:"#9B7DFF",weight:1.0,cls:"ev-adjudicated",desc:"Final legal outcome — matter fully adjudicated"},
};
const STORY_TYPES=["policy","law","court","policing","election","rights","corruption","welfare","speech","media","federalism","minority"];
const CONFIDENCE_LEVELS={high:{label:"High",color:"#0FD47C"},moderate:{label:"Moderate",color:"#F5A623"},low:{label:"Low",color:"#F04A5A"},developing:{label:"Developing",color:"#94a3b8"}};
const COURT_STATUSES={pending:{label:"Court Pending",color:"#F5A623"},stayed:{label:"Order Stayed",color:"#9B7DFF"},upheld:{label:"Upheld",color:"#0FD47C"},struck_down:{label:"Struck Down",color:"#F04A5A"},none:{label:"No Court Action",color:"#6B7FA0"}};

const BASE=41,SK="dtn_v10";
const IMPACT={national:{national:1.0,state:0.4,local:0.2},state:{national:0.3,state:1.0,local:0.5},local:{national:0.1,state:0.2,local:1.0},district:{national:0.05,state:0.15,local:1.0}};
const PAT={isolated:{label:"Isolated",color:"#64748b",dot:"○",bg:"rgba(100,116,139,0.08)",mult:1.0},emerging:{label:"Emerging",color:"#F5A623",dot:"◔",bg:"rgba(245,166,35,0.06)",mult:1.15},repeated:{label:"Repeated",color:"#f97316",dot:"◑",bg:"rgba(249,115,22,0.06)",mult:1.3},systemic:{label:"Systemic",color:"#F04A5A",dot:"●",bg:"rgba(240,74,90,0.06)",mult:1.5}};


// ── ADVANCED SCORING ENGINE ───────────────────────────────────
// World-class formula: credibility × evidence × relevance × impact × directional × confidence × recency × pattern × radius
function calcStoryEffect(s,scope,state){
  const ev=EVIDENCE_LEVELS[s.evidenceLevel||"single_source"]?.weight||0.5;
  const cred={verified:1.0,corroborated:0.8,single_source:0.5,citizen_unverified:0.3}[s.source]||0.4;
  const days=Math.max(0,(Date.now()-s.ts)/86400000);
  const rec=Math.max(0.2,1-days*0.005);
  const conf={high:1.0,moderate:0.75,low:0.5,developing:0.35}[s.confidence||"moderate"]||0.7;
  const pm=PAT[s.pattern]?.mult||1.0;
  const pw=PILLARS[s.pillar]?.weight||1.0;
  const rf=(IMPACT[s.scope||"national"]||IMPACT.national)[scope]||0.1;
  const sf=(s.state&&s.state===state)?1.0:(s.state&&scope==="state")?0.2:1.0;
  const dir=s.aiScore||s.delta||0;
  return dir*ev*cred*rec*conf*pm*pw*rf*sf;
}
function calcScope(stories,scope,state){const a=stories.filter(s=>s.approved);const base=scope==="state"?(STATE_BASELINES[state]||BASE):BASE;return a.length?Math.max(0,Math.min(100,Math.round(base+a.reduce((t,s)=>t+calcStoryEffect(s,scope,state),0)))):base;}
function calcDept(stories,id){const d=DEPT[id];if(!d)return 50;const rel=stories.filter(s=>s.approved&&s.institution===id);if(!rel.length)return d.base;const delta=rel.reduce((a,s)=>{const ev=EVIDENCE_LEVELS[s.evidenceLevel||"single_source"]?.weight||0.5;const days=Math.max(0,(Date.now()-s.ts)/86400000);const conf={high:1.0,moderate:0.75,low:0.5,developing:0.35}[s.confidence||"moderate"]||0.7;return a+(s.aiScore||s.delta||0)*ev*conf*Math.max(0.2,1-days*0.005);},0);return Math.max(0,Math.min(100,Math.round(d.base+delta)));}

// Score explanation generator — makes users FEEL what is right/wrong
function generateExplanation(s){
  const dir=s.aiScore||s.delta||0;const isPos=dir>0;const dept=DEPT[s.institution];const ev=EVIDENCE_LEVELS[s.evidenceLevel||"single_source"];const pts=Math.abs(dir).toFixed(1);
  if(Math.abs(dir)<0.5)return null;
  const action=isPos?"strengthened constitutional functioning by":"raised constitutional concern, reducing score by";
  const deptStr=dept?`the ${dept.name}`:"government";
  const evStr=ev?`Evidence level: ${ev.label} (weight ${Math.round(ev.weight*100)}%).`:"";
  const confStr=s.confidence?`Confidence: ${CONFIDENCE_LEVELS[s.confidence]?.label||"moderate"}.`:"";
  const courtStr=s.courtStatus&&s.courtStatus!=="none"?` Court status: ${COURT_STATUSES[s.courtStatus]?.label||"pending"}.`:"";
  return`This event ${action} ${pts} points because ${deptStr} action implicates ${s.violations?.length||s.supports?.length||1} constitutional provision(s). ${evStr} ${confStr}${courtStr}`;
}

function sColor(n){return n>=65?"#3B6D11":n>=50?"#BA7517":n>=35?"#D85A30":"#E24B4A";}
function sLabelK(n){return n>=65?"functioning":n>=50?"erosion":n>=35?"backsliding":"authoritarian";}
function scoreBand(n,t){const tt=t||LANG.en;if(n>=80)return{label:tt.bandStrong||"Strong Constitutional Support",color:"#27500A"};if(n>=65)return{label:tt.bandStable||"Mostly Stable",color:"#3B6D11"};if(n>=50)return{label:tt.bandMixed||"Mixed Democratic Health",color:"#BA7517"};if(n>=35)return{label:tt.bandConcerns||"Significant Concerns",color:"#D85A30"};return{label:tt.bandSevere||"Severe Democratic Stress",color:"#E24B4A"};}

// ── ENHANCED CLASSIFIER ────────────────────────────────────────
// v12.1 — audit trail helper
function pushHistory(story, actor, fromLabel, toLabel) {
  const entry = { ts: Date.now(), actor, fromLabel: fromLabel || null, toLabel: toLabel || null };
  const prev = Array.isArray(story.history) ? story.history : [];
  return { ...story, history: [...prev, entry].slice(-50) };
}

function classify(h,b){
  const txt=((h||"")+" "+(b||"")).toLowerCase();
  let pillar="justice",dir="neutral",delta=0,violations=[],supports=[],pat="isolated",scope="national",inst=null;
  let evidenceLevel="single_source",storyType="policy",confidence=0.5,courtStatus="none",govResponse=null,citizenExplanation=null;
  // v12.1 NEW label vocabulary: support | potential_violation | neutral | uncertain
  let label="neutral";

  // ─── SKIP PATTERNS (unchanged from v11) ──────────────────────────
  const h_lower=(h||"").toLowerCase();
  const futureEvent=
    /^(?:[\w.']+\s){0,9}\w+\s+to\s+(?:address|speak|announce|meet|deliver|attend|launch|unveil|table|present|move|file|hear|decide|rule|deliberate|inaugurate|release|visit)\b/i.test(h||"")||
    /^(?:[\w.']+\s){0,9}\w+\s+will\s+(?:address|speak|announce|meet|deliver|attend|launch|unveil|table|present|move|file|hear|decide|rule|deliberate|inaugurate|release|visit)\b/i.test(h||"")||
    /\b(?:set to|expected to|likely to|scheduled to)\s+(?:address|speak|announce|deliver|attend|launch|unveil|table|present|file|inaugurate)\b/i.test(h_lower)||
    /\b(?:tomorrow|later today|next week|next monday|next tuesday|next wednesday|next thursday|next friday|next saturday|next sunday)\s*[:,-]?\s*(?:pm|am)?\s*(?:modi|cabinet|parliament|sc|supreme court|president|governor)\b/i.test(h_lower)||
    /\b(?:to (?:address|speak|deliver))\b[^.]*\bat \d+[:.]?\d*\s*(?:pm|am|hrs)\b/i.test(h_lower);

  const foreignOnly=/\bbank of canada\b|\bfederal reserve\b|\beuropean central bank\b|\btrump\b|\bbiden\b|\bobama\b|\bputin\b|\bxi jinping\b|\bkim jong\b|\bmacron\b|\bscholz\b|\bnetanyahu\b|\bzelensky\b|\bbritish parliament\b|\bus congress\b|\bwhite house\b|\beuropean union\b|\bsilicon valley\b|\bwall street\b|\bdowning street\b|\bsan francisco\b|\bnew york times\b|\bwashington post\b|\bhollywood\b|\b(?:louisiana|texas|california|florida|alabama|alaska|arizona|arkansas|colorado|connecticut|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|ohio|oklahoma|oregon|pennsylvania|tennessee|utah|vermont|virginia|wisconsin|wyoming)\s*(?:,|shooting|state|governor|senator)\b|\bpalantir\b|\balex karp\b|\belon musk\b|\bmark zuckerberg\b|\bmeta platforms\b|\bgoogle llc\b|\bamazon\.com\b|\bapple inc\b|\bmicrosoft corp\b|\bopenai\b|\banthropic\b|\bnvidia\b|\bintel corp\b|\bharvard\b|\bstanford\b|\bmit \b|\byale\b|\bprinceton\b|\bcambridge university\b|\boxford university\b|\bmass shooting.*(?:us|united states|america)|\bukraine war\b|\brussia.ukraine\b|\bgaza\b|\bisrael.hamas\b|\bsyria war\b|\byemen war\b|\btaliban\b|\bafghanistan taliban\b|\bimran khan\b|\bshehbaz sharif\b|\bimf loan to\b|\bworld bank report\b|\bun human rights report on (?!india)\b|\bnato\b|\bg7 summit\b|\bg20.*(?!india)\b/i;

  const pureNoise=/\b(?:cricket score|football score|ipl match|ipl \d{4}|fifa|olympic|box office|bollywood|hollywood|ott release|trailer|film review|web series|album release|concert|fashion show|iphone|samsung|product launch|startup raises|company earnings|stock price|sensex|nifty|cryptocurrency|bitcoin|horoscope|recipe|weight loss|skincare|beauty tip|49ers|nfl |nba |nhl |mlb |premier league|la liga|bundesliga|super bowl|world cup match|t20 world cup|odi world cup|test match|ranji|duleep trophy|vijay hazare|syed mushtaq|pro kabaddi|batter debate|batter comparison|bowling figures|run chase|wicket haul|century vs|boundary count|strike rate|ex.india captain|ex.captain roasts|former cricketer|cricketer slams|ashwin|rohit sharma|virat kohli|ms dhoni|hardik pandya|rishabh pant|shubman gill|bumrah|jadeja|ben stokes|babar azam|shaheen|kl rahul|parag|rahane|rinku singh|axar patel|pant vs|gill vs|samson vs)\b/i;

  const campaignInsult=/\btargets? congress\b|\btargets? bjp\b|\bslams? congress\b|\bslams? bjp\b|\battacks? congress\b|\battacks? bjp\b|\bmocks\b|\btaunts\b|\bjibe at\b|\bdare(?:s|d)? (?:the )?(?:bjp|congress|opposition)\b|\bteach.*lesson\b|\bhave guts\b/i;

  // ─── v12.1 FIX (#6): specific court-ruling patterns, not bare \bruling\b ──────
  // OLD: \bruling\b  (matched "ruling party slams opposition" — false positive)
  // NEW: \bcourt ruling\b|\bsc ruling\b|\bhc ruling\b|\bbench ruling\b|\bruling of (?:the )?(?:court|bench|judge|justice)\b
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
  if(futureEvent)skipReason="Future event — nothing has happened to analyse yet";
  else if(foreignOnly.test(txt))skipReason="Foreign story without Indian constitutional angle";
  else if(pureNoise.test(txt))skipReason="Sports/entertainment/tech — not constitutional";
  else if(isJustInsult)skipReason="Political rhetoric without policy substance — protected Art.19 speech";
  else if(isRoutine)skipReason="Routine procedural news — accountability mechanism working normally";
  else if(isListicle)skipReason="Explainer/listicle content — no actual news event to analyse";
  else if(isNotIndia)skipReason="Not related to Indian constitutional matters";

  if(skipReason){
    return{
      pillar:"justice",direction:"neutral",delta:0,aiScore:0,
      violations:[],supports:[],institution:null,pattern:"isolated",
      scope:"national",state:null,source:"single_source",
      aiDone:false,aiSkipped:true,skipReason,
      severity:"low",evidenceLevel:"single_source",
      storyType:"policy",confidence:0.3,courtStatus:"none",
      govResponse:null,
      // v12.1: new label vocabulary
      label:"uncertain",
      reviewNeeded:true,
      citizenExplanation:"This story was filtered out by the relevance engine. Reason: "+skipReason,
      mythos:null,aiAnalysis:null,
    };
  }

  // ─── INSTITUTION DETECTION (unchanged) ─────────────────────────────
  if(/supreme court|high court|sc |hc |judiciary|bench|verdict|judgment|bail|acquit/.test(txt))inst="judiciary";
  else if(/prime minister|pmo|cabinet/.test(txt))inst="pmo";
  else if(/home minister|home ministry|amit shah|central police/.test(txt))inst="home";
  else if(/parliament|lok sabha|rajya sabha|bill |amendment|speaker/.test(txt))inst="law";
  else if(/election commission|eci|ballot|voter|electoral/.test(txt))inst="ec";
  else if(/police|arrested|detained|custody|encounter|cops|constable/.test(txt))inst="police";
  else if(/journalist|reporter|media|press|editor|news channel/.test(txt))inst="media";
  else if(/army|military|afspa|armed force/.test(txt))inst="defence";
  else if(/panchayat|municipality|gram sabha|local body/.test(txt))inst="rural";
  else if(/education|school|university|teacher/.test(txt))inst="education";
  else if(/hospital|health|doctor|medicine|drug/.test(txt))inst="health";
  else if(/forest|environment|tribal|adivasi|displacement/.test(txt))inst="environment";
  else if(/minority|muslim|christian|church|mosque|religious/.test(txt))inst="minority";
  else if(/finance|income tax|ed |cbi|money laundering|bank/.test(txt))inst="finance";
  else if(/government|ministry|cm |chief minister|governor/.test(txt))inst="home";

  if(/village|district|taluk|block/.test(txt))scope="local";
  else if(typeof STATE_BASELINES!=="undefined"&&Object.keys(STATE_BASELINES||{}).some(s=>txt.includes(s.toLowerCase())))scope="state";

  if(/sc |supreme court.*order|high court.*order|gazette|official notification/.test(txt))evidenceLevel="official_doc";
  else if(/court.*stayed|court.*upheld|judgment|verdict/.test(txt))evidenceLevel="court_finding";
  else if(/multiple sources|confirmed|verified|official/.test(txt))evidenceLevel="corroborated";
  else if(/alleged|reportedly|sources say|unconfirmed/.test(txt))evidenceLevel="allegation";

  // ─── v12.1 LABEL + CONFIDENCE COMPUTATION ───────────────────────────
  // Core rule mapping the OLD direction/delta/severity → NEW label + confidence
  //
  // label takes one of: support | potential_violation | neutral | uncertain
  //  - support             → institution upheld constitutional protections (bail granted, court stayed demolition)
  //  - potential_violation → apparent breach flagged; needs substantiation (custody death, unlawful arrest alleged)
  //  - neutral             → constitutional event with no clear direction (passed bill, court hearing)
  //  - uncertain           → event is constitutionally relevant but evidence is thin or direction unclear
  //
  // confidence is a float 0.0–1.0. reviewNeeded = confidence < 0.6.

  // Positive-direction signals (support)
  const supportSignals=/\b(?:bail granted|quashed|stayed|upheld rights|acquitted|released|compensation ordered|reinstated|struck down unconstitutional|directed the government|rapped the (?:government|state)|right.upheld|grievance addressed|transparency order|court monitored|commission formed to probe)\b/i;
  // Violation signals
  const violationSignals=/\b(?:custody death|custodial death|fake encounter|lynch|mob lynch|cow vigilant|bulldoz|demolition drive|arbitrary arrest|illegal detention|uapa.+journalist|uapa.+activist|afspa.+civilian|sedition.+journalist|sedition.+activist|contempt.+journalist|gag order|shut down|blocked|vote (?:deleted|dropped)|voter (?:purged|struck off)|targeted minority|targeted dalit|targeted muslim|hate crime)\b/i;

  if(supportSignals.test(txt)){
    label="support";
    dir="positive";
    delta=2;
  }else if(violationSignals.test(txt)){
    label="potential_violation";
    dir="negative";
    delta=-3;
  }else{
    label="neutral";
    dir="neutral";
    delta=0;
  }

  // ─── CONFIDENCE CALCULATION (v12.1 NEW) ───────────────────────────
  // Start at baseline 0.5, add/subtract based on evidence quality + clarity signals
  confidence=0.5;
  if(evidenceLevel==="official_doc")confidence+=0.25;
  else if(evidenceLevel==="court_finding")confidence+=0.30;
  else if(evidenceLevel==="corroborated")confidence+=0.15;
  else if(evidenceLevel==="allegation")confidence-=0.20;

  // Clear strong signal → +0.10
  if(supportSignals.test(txt)||violationSignals.test(txt))confidence+=0.10;

  // Vague or speculative language → -0.10
  if(/\bmay (?:affect|impact|violate|constitute)\b|\bcould be\b|\bpossibly\b|\bappears to\b|\bseems to\b/i.test(txt))confidence-=0.10;

  // Multi-article citation OR named specific law → +0.05
  if(/\bart\.\s*\d+/i.test(txt)||/\buapa\b|\bafspa\b|\bnsa\b|\bcaa\b/i.test(txt))confidence+=0.05;

  // Clamp to [0, 1]
  confidence=Math.max(0,Math.min(1,confidence));

  // v12.1 #2 — reviewNeeded flag
  const reviewNeeded=confidence<0.6;

  // If confidence is low AND no clear signal → downgrade label to "uncertain"
  if(confidence<0.45&&label==="neutral")label="uncertain";

  // ─── STORY TYPE ─────────────────────────────────────────────────
  if(/election|voter|ballot|polling/.test(txt))storyType="election";
  else if(/press|journalist|media|speech/.test(txt))storyType="speech";
  else if(/corrupt|bribe|fraud|money laundering/.test(txt))storyType="corruption";
  else if(/arrest|custody|police|encounter/.test(txt))storyType="policing";
  else if(/court|bench|verdict|bail|judgment/.test(txt))storyType="court";
  else if(/right|dignity|privacy|assembly/.test(txt))storyType="rights";
  else if(/welfare|scheme|pension|mgnrega|ration/.test(txt))storyType="welfare";
  else if(/centre.state|federal|governor|article 356/.test(txt))storyType="federalism";
  else if(/minority|religion|community|caste/.test(txt))storyType="minority";
  else if(/bill |law|act passed/.test(txt))storyType="law";

  // Court status heuristic
  if(/court.stayed|stay order|court directed|court monitored/.test(txt))courtStatus="pending";
  else if(/judgment|verdict|acquitted|convicted|quashed/.test(txt))courtStatus="decided";

  return{
    pillar,direction:dir,delta,aiScore:delta,
    violations,supports,institution:inst,pattern:pat,scope,state:null,
    source:evidenceLevel,
    aiDone:false,aiSkipped:false,
    severity:label==="potential_violation"?"high":label==="support"?"low":"moderate",
    evidenceLevel,storyType,
    confidence,courtStatus,govResponse,
    // v12.1 NEW fields
    label,reviewNeeded,
    citizenExplanation:null,mythos:null,aiAnalysis:null,
  };
}


// v12.3 — separate rate-limit tracking per provider, Gemini fallback
let _rluGroq=0, _rluGemini=0;
const isRL=()=>Date.now()<_rluGroq && Date.now()<_rluGemini;
const setRL=ms=>{_rluGroq=Date.now()+ms;};  // back-compat alias
const isRLGroq=()=>Date.now()<_rluGroq;
const isRLGemini=()=>Date.now()<_rluGemini;
const setRLGroq=ms=>{_rluGroq=Date.now()+ms;};
const setRLGemini=ms=>{_rluGemini=Date.now()+ms;};

// Primary: our own Vercel serverless function at /api/rss (no CORS issues, reliable)
// Fallbacks: public CORS proxies (used only if our own function is down)
const PUBLIC_PROXIES=[
  {name:"corsproxy.io",url:u=>"https://corsproxy.io/?url="+encodeURIComponent(u),parse:async r=>await r.text()},
  {name:"allorigins-raw",url:u=>"https://api.allorigins.win/raw?url="+encodeURIComponent(u),parse:async r=>await r.text()},
  {name:"codetabs",url:u=>"https://api.codetabs.com/v1/proxy/?quest="+encodeURIComponent(u),parse:async r=>await r.text()},
];

async function fetchViaOwnApi(scope,state,district){
  try{
    const qs=new URLSearchParams();
    qs.set("scope",scope||"national");
    if(state)qs.set("state",state);
    if(district)qs.set("district",district);
    const res=await fetch("/api/rss?"+qs.toString(),{signal:AbortSignal.timeout(15000)});
    if(!res.ok){console.warn("[fetchRSS] /api/rss returned "+res.status);return null;}
    const xml=await res.text();
    if(xml&&xml.length>200){console.log("[fetchRSS] ✓ via /api/rss ("+xml.length+" bytes)");return xml;}
    console.warn("[fetchRSS] /api/rss returned empty/tiny response");
    return null;
  }catch(e){console.warn("[fetchRSS] /api/rss failed:",e.message||e);return null;}
}

async function fetchViaPublicProxy(googleNewsUrl){
  for(const p of PUBLIC_PROXIES){
    try{
      const res=await fetch(p.url(googleNewsUrl),{signal:AbortSignal.timeout(12000)});
      if(!res.ok){console.warn("[fetchRSS] public proxy "+p.name+" returned "+res.status);continue;}
      const xml=await p.parse(res);
      if(xml&&xml.length>200){console.log("[fetchRSS] ✓ via public "+p.name+" ("+xml.length+" bytes)");return xml;}
      console.warn("[fetchRSS] public proxy "+p.name+" returned empty/tiny response");
    }catch(e){console.warn("[fetchRSS] public proxy "+p.name+" failed:",e.message||e);}
  }
  return null;
}

async function fetchRSS(scope,state,district){
  const B="https://news.google.com/rss/search?hl=en-IN&gl=IN&ceid=IN:en&q=";
  const R="rights+court+police+arrest+protest+constitution+demolition+election+-cricket+-IPL";
  let url,sh=null;
  if(scope==="national")url=B+encodeURIComponent("India+democracy+constitution+rights+court+"+R);
  else if(scope==="state"&&state){url=B+encodeURIComponent(state+"+India+"+R);sh=state;}
  else if(scope==="district"&&district)url=B+encodeURIComponent(district+"+India+"+R);
  else url=B+encodeURIComponent("India+civic+rights+"+R);

  try{
    // Try own serverless proxy first (multi-source: Google News, Bing, TOI, Hindu, NDTV)
    let xmlText=await fetchViaOwnApi(scope,state,district);
    // If that fails, fall back to public CORS proxies
    if(!xmlText){console.warn("[fetchRSS] own /api/rss unavailable, trying public proxies...");xmlText=await fetchViaPublicProxy(url);}
    if(!xmlText){console.error("[fetchRSS] all proxies failed");return[];}

    const xml=new DOMParser().parseFromString(xmlText,"text/xml");
    const items=[...xml.querySelectorAll("item")];
    if(!items.length){console.warn("[fetchRSS] parsed XML had 0 items");return[];}

    // === FIX 3: TIGHTER RSS FILTERING ===
    // Layer 1 — Constitutional-relevance keywords (MUST match at least one)
    const relevanceKW=/rights|court|police|arrest|detain|demolish|protest|riot|dalit|minority|muslim|christian|tribal|adivasi|election|voter|ballot|verdict|bail|uapa|afspa|nsa|psa|judge|judiciary|constitution|parliament|lok sabha|rajya sabha|assembly|bill passed|bill defeated|act passed|amendment|supreme court|high court|chief justice|gazette|notification|ed |cbi|ncb|custody|encounter|lynch|communal|caste|reservation|quota|citizenship|caa|nrc|freedom of speech|press freedom|journalist|editor|media crackdown|rti denied|corruption|atrocity|evict|scheme cancel|hospital shut|school shut|welfare cut|farmer protest|strike|shutdown|sedition|hate speech|fir|arrest warrant|writ petition|pil |habeas corpus|governor|president|speaker|defection|scheduled|panchayat|municipality|mayor|collector|dm |district magistrate|inquiry|probe/i;

    // Layer 2 — India-relevance (MUST have Indian anchor, prevents foreign-country noise)
    const indiaAnchor=/india|indian|delhi|mumbai|bengaluru|bangalore|chennai|kolkata|hyderabad|ahmedabad|pune|lucknow|jaipur|bhopal|patna|chandigarh|kerala|tamil nadu|karnataka|maharashtra|gujarat|rajasthan|uttar pradesh|up |bihar|odisha|west bengal|punjab|haryana|telangana|andhra|assam|tripura|meghalaya|mizoram|manipur|nagaland|arunachal|sikkim|goa|jharkhand|chhattisgarh|himachal|uttarakhand|madhya pradesh|mp |j&k|jammu|kashmir|ladakh|modi|rahul|gandhi|sonia|kharge|yogi|mamata|stalin|kejriwal|shah|sitharaman|jaishankar|bjp|congress|aap |tmc|dmk|aiadmk|shiv sena|ncp|rjd|jdu|sp |bsp|cpi|cpm|naidu|nitish|eci|election commission of india|rbi|sebi|cag|prime minister|union minister|cabinet|niti aayog|lok sabha|rajya sabha|supreme court of india|icc |iaf |indian army|indian navy|coast guard|nhrc|nalsa|cji /i;

    // Layer 3 — Explicit EXCLUDE list (prevents junk that matches above filters)
    const blockKW=/cricket|football|ipl |fifa|olympic|box office|bollywood|actress|actor birthday|film release|trailer|ott release|stock market|sensex|nifty|crypto|bitcoin|horoscope|zodiac|weight loss|beauty tip|recipe|entertainment|celebrity|cinema|movie review|review:|song|album|concert|fashion week|iphone launch|samsung launch|product launch|startup raises|tech layoff|silicon valley|san francisco|new york times|washington post|bank of canada|federal reserve|european central|trump |biden |putin |xi jinping/i;

    const parsed=items.slice(0,30).map(item=>{
      const rT=item.querySelector("title")?.textContent||"";
      const headline=rT.replace(/ - [^-]*$/,"").replace(/<!\[CDATA\[|\]\]>/g,"").trim();
      const rD=item.querySelector("description")?.textContent||"";
      const body=rD.replace(/<[^>]*>/g,"").replace(/<!\[CDATA\[|\]\]>/g,"").trim().slice(0,500);
      // Capture article link for OG-image lookup and click-through
      const rL=item.querySelector("link")?.textContent||"";
      const link=rL.replace(/<!\[CDATA\[|\]\]>/g,"").trim();
      // Try to extract embedded image from description HTML or enclosure tag
      const imgMatch=rD.match(/<img[^>]+src=["']([^"']+)["']/i);
      const encl=item.querySelector("enclosure[url]")?.getAttribute("url")||null;
      const mediaContent=item.querySelector("content[url], thumbnail[url]")?.getAttribute("url")||null;
      const image=imgMatch?.[1]||encl||mediaContent||null;
      return{headline,body,state:sh,link,image};
    }).filter(i=>i.headline.length>10);

    // Apply all three filter layers
    const filtered=parsed.filter(i=>{
      const t=(i.headline+" "+i.body).toLowerCase();
      if(blockKW.test(t)){console.log("[fetchRSS] blocked (noise):",i.headline.slice(0,60));return false;}
      if(!relevanceKW.test(t)){console.log("[fetchRSS] skipped (not constitutional):",i.headline.slice(0,60));return false;}
      if(!indiaAnchor.test(t)){console.log("[fetchRSS] skipped (not India):",i.headline.slice(0,60));return false;}
      return true;
    });

    const out=filtered.slice(0,10);
    console.log("[fetchRSS] parsed "+items.length+" → filtered "+filtered.length+" → returned "+out.length);
    return out;
  }catch(e){console.error("[fetchRSS] unexpected error:",e);return[];}
}

// v12.3 — dual-provider call: tries Groq first, falls back to Gemini on 429/error
// Returns parsed JSON object from AI response, or null if both providers fail
async function callAI(systemPrompt, userPrompt){
  const messages=[{role:"system",content:systemPrompt},{role:"user",content:userPrompt}];

  // Provider 1: Groq (Llama 3.3 70B, fastest when available)
  if(GROQ && !isRLGroq()){
    try{
      const r=await fetch("https://api.groq.com/openai/v1/chat/completions",{
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":"Bearer "+GROQ},
        body:JSON.stringify({model:"llama-3.3-70b-versatile",max_tokens:1800,temperature:0.15,messages})
      });
      if(r.status===429){
        setRLGroq(30000);
        console.log("[ai] Groq 429 — falling back to Gemini");
      }else if(r.ok){
        const d=await r.json();
        const txt=d.choices?.[0]?.message?.content||"";
        const parsed=extractJson(txt);
        if(parsed){console.log("[ai] ✓ Groq");return parsed;}
      }
    }catch(e){console.log("[ai] Groq error — falling back to Gemini:",e.message);}
  }

  // Provider 2: Gemini 2.0 Flash (generous free tier)
  if(GEMINI && !isRLGemini()){
    try{
      // Gemini API: combine system + user into a single prompt since their format differs
      const combined=systemPrompt+"\n\n---\n\n"+userPrompt+"\n\nReturn ONLY valid JSON, no other text, no markdown fences.";
      const r=await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key="+GEMINI,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          contents:[{parts:[{text:combined}]}],
          generationConfig:{temperature:0.15,maxOutputTokens:1800,responseMimeType:"application/json"}
        })
      });
      if(r.status===429){setRLGemini(60000);console.log("[ai] Gemini 429");return null;}
      if(!r.ok){console.log("[ai] Gemini error",r.status);return null;}
      const d=await r.json();
      const txt=d.candidates?.[0]?.content?.parts?.[0]?.text||"";
      const parsed=extractJson(txt);
      if(parsed){console.log("[ai] ✓ Gemini");return parsed;}
    }catch(e){console.log("[ai] Gemini exception:",e.message);}
  }

  return null;
}

function extractJson(txt){
  if(!txt)return null;
  try{
    const clean=txt.replace(/```json|```/g,"").trim();
    const si=clean.indexOf("{"),ei=clean.lastIndexOf("}");
    if(si<0||ei<0)return null;
    return JSON.parse(clean.slice(si,ei+1));
  }catch(e){return null;}
}

async function aiUpgrade(s){
  // v12.3 — at least one provider must be configured and not rate-limited
  if((!GROQ||isRLGroq())&&(!GEMINI||isRLGemini()))return s;
  try{
    const systemPrompt=`You are India's top constitutional law expert and investigative journalist. You will analyse ONLY what is stated in the provided headline and body text. You must NEVER invent, assume, or extrapolate events that aren't written in the text.

=== HARD RULES — READ BEFORE ANALYSING ===

RULE 1 — SKIP IRRELEVANT STORIES:
If the headline is ANY of the following, return {"skip": true, "reason": "..."} and nothing else:
  - About a non-Indian topic (foreign central banks, foreign politicians, international tech, Hollywood, foreign wars that don't involve Indian constitutional concern)
  - Sports (cricket, football, Olympics, IPL) unless it involves a specific legal/policy action by Indian government
  - Entertainment (Bollywood, OTT release, film review, celebrity)
  - About a future event that hasn't happened yet ("PM to address at 8:30pm", "SC to hear next week") — cannot analyse what hasn't happened
  - Routine operational news (airline cancellation, weather, traffic) unless it triggers a rights issue
  - Market moves, stock prices, crypto, company earnings unless they involve SEBI/RBI constitutional action

RULE 2 — GROUNDING REQUIREMENT:
For EVERY violation/support you claim, the specific EVENT must be stated in the provided headline or body text. If you cannot point to the specific event in the text:
  - Do NOT invent quotes
  - Do NOT invent attributions (e.g. "X said Y" when the text doesn't say so)
  - Do NOT invent bills being "defeated" or "passed" — check the verb tense in the source
  - Do NOT hallucinate named officials making statements unless the text explicitly quotes them
  - If the story is too vague to ground specific claims, return {"skip": true, "reason": "insufficient grounding"}

RULE 3 — VERB TENSE MATTERS:
  - "Modi targets Congress over opposition to bill" → the bill's status is NOT stated in this headline. Do not assume it was defeated or passed.
  - "Court seeks reply" → the court is asking; no ruling yet. Do not claim rights were violated by the court.
  - "SC to hear on May 16" → future event; nothing has happened. Skip or mark as "pending hearing, no constitutional finding yet".
  - "Pact allows deployment" → the pact is signed but is it ratified? If text doesn't say, mark confidence as "developing".

RULE 4 — POLITICAL RHETORIC IS NOT A VIOLATION:
Campaign speeches, party spokespersons attacking opponents, and political rallies are PROTECTED speech under Art.19(1)(a). Unless the rhetoric crosses into incitement (a legal threshold), score as score:0 or slight positive for free speech. Do not treat every harsh political statement as a "concern".

RULE 5 — INSTITUTIONAL ACCOUNTABILITY IS A POSITIVE:
If a government institution is investigating itself (court of inquiry, internal probe, suspended officer pending inquiry), that is a SUPPORT for rule of law — not a violation. Score positive or neutral.

=== ONLY IF THE STORY PASSES RULES 1-5, RETURN THIS JSON ===

{
"score":-5 to 5,
"label":"support|potential_violation|neutral|uncertain",
"pillar":"press_freedom|liberty|equality|electoral|separation|religion|justice|welfare|environment",
"department":"pmo|home|law|finance|education|health|wcd|minority|rural|urban|environment|defence|police|ec|media|judiciary",
"scope":"national|state|local",
"evidenceLevel":"allegation|single_source|corroborated|official_doc|court_finding|final_adjudication",
"storyType":"policy|law|court|policing|election|rights|corruption|welfare|speech|media|federalism|minority",
"confidence":0.0 to 1.0 (float: 0.0-0.4 = low, 0.4-0.6 = moderate / reviewNeeded, 0.6-0.85 = high, 0.85-1.0 = very high),
"courtStatus":"none|pending|stayed|upheld|struck_down",
"national_impact":0-100,
"state_impact":0-100,
"local_impact":0-100,
"violations":[
  {"a":"Art.XX","title":"article full name","who":"specific institution/official/body that caused the violation — grounded in source text","how":"60-80 word explanation referencing the specific act/order/event FROM THE SOURCE TEXT. Cite relevant precedents only if accurate."}
],
"supports":[
  {"a":"Art.XX","title":"article full name","who":"institution/body that upheld the principle — grounded in source text","how":"60-80 word explanation referencing specific court order/vote/policy from the source text."}
],
"govResponse":"official government response ONLY if explicitly mentioned in source text, else null",
"analysis":"140-char summary of net constitutional impact — stick to what the text supports",
"mythos":"150-char poetic civic insight",
"citizenExplanation":"2-3 sentences in plain language — what the ACTUAL events in the source text mean for ordinary Indians"
}

=== LABEL VOCABULARY (v12.1) ===
- "support"             → institution upheld constitutional protection (bail granted, court stayed demolition, rights protected)
- "potential_violation" → apparent breach flagged, needs substantiation (do NOT say "violated" — say "potential" because we respect due process)
- "neutral"             → constitutional event with no clear direction (bill tabled, hearing held, notification issued)
- "uncertain"           → evidence thin OR direction unclear — flag for review

=== GROUNDING EXAMPLES ===

BAD (hallucinated): Headline says "Modi targets Congress over women quota bill". Analysis writes: "Women's reservation bill was defeated, violating Art.15." → WRONG. The bill's status isn't stated. The story is campaign rhetoric.
GOOD: Return {"skip": true, "reason": "story is political rhetoric; underlying bill status not stated in source"}

BAD (hallucinated): Headline says "Bank of Canada raises alarm on AI". Analysis: "Constitutional concern about AI regulation in India." → WRONG. Foreign central bank, not Indian constitutional event.
GOOD: Return {"skip": true, "reason": "foreign central bank; no Indian constitutional event"}

BAD (hallucinated): Headline says "IAF orders court of inquiry into Sukhoi landing". Analysis: "Constitutional violation — right to life." → WRONG. Court of inquiry IS accountability working.
GOOD: supports:[{"a":"Art.50","title":"Separation of Powers","who":"Indian Air Force internal-inquiry mechanism","how":"IAF self-investigation after a hard landing demonstrates institutional accountability..."}]; score:+1

=== ARTICLE LIBRARY ===
Indian Constitution articles you may cite: Art.1 (Union), Art.14 (Equality), Art.15-17 (No discrimination), Art.19 (Speech/Assembly), Art.21 (Life/Liberty), Art.21A (Education), Art.22 (Arrest), Art.25-28 (Religion), Art.29-30 (Minority), Art.32 (Remedies), Art.39-47 (DPSP), Art.50 (Separation), Art.81-82 (Lok Sabha/Delimitation), Art.170 (State Assembly), Art.226 (HC writs), Art.243 (Panchayat), Art.246 (Union/State list), Art.253 (Treaties), Art.265 (Tax), Art.300A (Property), Art.301 (Free trade), Art.324-329 (Elections), Art.350A (Mother tongue), Art.355 (State protection), Art.368 (Amendment), 5th Sch (Tribal), 6th Sch (NE), 10th Sch (Defection).

REMEMBER: Better to skip a story than to hallucinate. Your output will be PUBLISHED to thousands of Indian citizens. Accuracy over coverage.`;
    const userPrompt="Scope:"+s.scope+" State:"+s.state+" EvidenceLevel:"+s.evidenceLevel+" Headline:"+s.headline+" Context:"+(s.body||"").slice(0,400);
    const j=await callAI(systemPrompt,userPrompt);
    if(!j)return s;

  // === FIX 2: HANDLE SKIP DECISION ===
  if(j.skip===true){
    console.log("[aiUpgrade] AI chose to skip story:",s.headline.slice(0,60),"—",j.reason||"no reason");
    return{...s,aiDone:true,aiSkipped:true,skipReason:j.reason||"Story does not meet constitutional-relevance criteria",approved:false,held:true,violations:[],supports:[],aiScore:0,delta:0,severity:"low",label:"uncertain",confidence:0.3,reviewNeeded:true,citizenExplanation:"This story was filtered out: "+(j.reason||"not constitutional content")};
  }

  // === FIX 2: VALIDATE AI RESPONSE — reject if obviously hallucinated ===
  // If article numbers don't match known patterns, flag it
  const articlePattern=/^(Art\.[0-9]+[A-Z]?(?:\([0-9]+\)(?:\([a-z]\))?)?|5th Sch|6th Sch|10th Sch|AFSPA)$/;
  const badArticles=[...(j.violations||[]),...(j.supports||[])].filter(v=>!articlePattern.test(v.a||""));
  if(badArticles.length>0){
    console.warn("[aiUpgrade] rejecting — malformed article numbers:",badArticles.map(b=>b.a));
    return{...s,aiDone:true,aiSkipped:true,skipReason:"AI returned invalid article references",approved:false,held:true};
  }

  // v12.1: normalize confidence to float, compute reviewNeeded, propagate label
  const aiConf=typeof j.confidence==="number"?j.confidence:
               (j.confidence==="high"?0.85:j.confidence==="moderate"?0.55:j.confidence==="low"?0.3:j.confidence==="developing"?0.4:s.confidence||0.5);
  const finalConf=Math.max(0,Math.min(1,aiConf));
  const aiLabel=j.label&&["support","potential_violation","neutral","uncertain"].includes(j.label)?j.label:s.label||"neutral";
  // v12.4.1 FIX: Use ?? (nullish) not || — legitimate score:0 is falsy but valid.
  // Also derive direction from label so neutral stories don't default to "-" sign.
  const aiScoreNum=j.score!==undefined&&j.score!==null&&!isNaN(Number(j.score))?Number(j.score):(s.aiScore??s.delta??0);
  const aiDirection=aiLabel==="support"?"positive":aiLabel==="potential_violation"?"negative":aiLabel==="neutral"?"neutral":s.direction||"neutral";
  return{...s,aiScore:aiScoreNum,direction:aiDirection,institution:j.department||s.institution,evidenceLevel:j.evidenceLevel||s.evidenceLevel,storyType:j.storyType||s.storyType,confidence:finalConf,label:aiLabel,reviewNeeded:finalConf<0.6,courtStatus:j.courtStatus||s.courtStatus,nationalImpact:Number(j.national_impact)||null,stateImpact:Number(j.state_impact)||null,localImpact:Number(j.local_impact)||null,violations:j.violations?.length?j.violations:s.violations,supports:j.supports?.length?j.supports:s.supports,govResponse:j.govResponse||s.govResponse,aiAnalysis:j.analysis||null,mythos:j.mythos||null,citizenExplanation:j.citizenExplanation||s.citizenExplanation,aiDone:true};}catch{return s;}}

function useToasts(){const[toasts,setToasts]=useState([]);const add=useCallback((msg,type="info")=>{const id=Date.now();setToasts(p=>[...p,{id,msg,type}]);setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),4500);},[]);return{toasts,add};}

// ── BROWSER NOTIFICATIONS ─────────────────────────────────────
// Requests permission on user gesture, fires notifications with article images.
// Works on Chrome, Firefox, Edge (desktop + Android). Safari/iOS requires PWA install.
function useNotifications(){
  const[perm,setPerm]=useState(typeof Notification!=="undefined"?Notification.permission:"unsupported");
  const[enabled,setEnabled]=useState(()=>{
    try{return localStorage.getItem("dtn_notif_on")==="1";}catch{return false;}
  });

  const supported=typeof window!=="undefined"&&"Notification"in window;

  const request=useCallback(async()=>{
    if(!supported){return "unsupported";}
    try{
      const result=await Notification.requestPermission();
      setPerm(result);
      if(result==="granted"){
        setEnabled(true);
        try{localStorage.setItem("dtn_notif_on","1");}catch{}
        // Confirmation notification
        new Notification("DTN Mythos alerts enabled",{
          body:"You'll be notified of every new constitutional story.",
          tag:"dtn-welcome",
          silent:false,
        });
      }
      return result;
    }catch(e){console.warn("[notif] request failed:",e);return "error";}
  },[supported]);

  const disable=useCallback(()=>{
    setEnabled(false);
    try{localStorage.setItem("dtn_notif_on","0");}catch{}
  },[]);

  const notify=useCallback((opts)=>{
    if(!supported||perm!=="granted"||!enabled)return;
    try{
      // v12.1: use data-URI icon instead of /icon-192.png (which was returning 404)
      const defaultIcon="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='%237C5CFC'/><stop offset='1' stop-color='%23F04A5A'/></linearGradient></defs><rect width='192' height='192' rx='36' fill='url(%23g)'/><text x='96' y='124' font-size='96' text-anchor='middle' fill='white' font-family='system-ui' font-weight='900'>D</text></svg>";
      const n=new Notification(opts.title,{
        body:opts.body||"",
        icon:opts.icon||defaultIcon,
        image:opts.image||undefined,
        badge:opts.badge||defaultIcon,
        tag:opts.tag||("dtn-"+Date.now()),
        data:{url:opts.url},
        requireInteraction:false,
        silent:false,
      });
      n.onclick=()=>{
        window.focus();
        if(opts.url){try{window.open(opts.url,"_blank","noopener");}catch{}}
        n.close();
      };
    }catch(e){console.warn("[notif] failed to display:",e);}
  },[supported,perm,enabled]);

  return{supported,perm,enabled,request,disable,notify};
}

// Fetch Open Graph image from an article URL via our /api/og-image endpoint
async function fetchOgImage(articleUrl){
  if(!articleUrl)return null;
  try{
    const res=await fetch("/api/og-image?url="+encodeURIComponent(articleUrl),{signal:AbortSignal.timeout(8000)});
    if(!res.ok)return null;
    const data=await res.json();
    return data?.image||null;
  }catch{return null;}
}


// ── DESIGN SYSTEM ──────────────────────────────────────────────
function Toasts({items}){return(<div style={{position:"fixed",top:60,right:14,zIndex:9999,display:"flex",flexDirection:"column",gap:7,maxWidth:"90vw"}}>{items.map(t=>(<div key={t.id} style={{padding:"11px 16px",borderRadius:11,background:t.type==="error"?"rgba(240,74,90,0.14)":t.type==="success"?"rgba(15,212,124,0.11)":"rgba(74,143,255,0.11)",border:"1px solid "+(t.type==="error"?"rgba(240,74,90,0.28)":t.type==="success"?"rgba(15,212,124,0.28)":"rgba(74,143,255,0.28)"),color:"var(--t1)",fontSize:12.5,backdropFilter:"blur(14px)",boxShadow:"0 8px 28px rgba(0,0,0,0.45)",animation:"fadeUp 0.22s ease"}}>{t.msg}</div>))}</div>);}

function ScoreRing({score,size=96,label}){
  const r=(size-12)/2,circ=2*Math.PI*r,col=sColor(score),offset=circ-(score/100)*circ;
  return(<div style={{position:"relative",width:size,height:size,flexShrink:0}}>
    <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={7}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={7}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{transition:"stroke-dashoffset 1.5s cubic-bezier(0.34,1.56,0.64,1)"}}/>
    </svg>
    <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1}}>
      <span style={{fontFamily:"var(--font-m)",fontSize:size*0.22,fontWeight:700,color:col,lineHeight:1,letterSpacing:"-0.03em"}}>{score}</span>
      {label&&<span style={{fontSize:Math.max(7,size*0.088),color:"var(--t2)",textAlign:"center",lineHeight:1.2}}>{label}</span>}
    </div>
  </div>);}

// ── BLOOMBERG HELPERS ──────────────────────────────────────────
// Resolve the photo for a story with fallback chain:
// 1. Image already on story (from RSS enclosure/media/img tag)
// 2. OG-image scraped from link (tried in background in doFetch)
// 3. Unsplash fallback via /api/fallback-image
function getStoryImage(s){
  if(s.image)return s.image;
  const topic=s.storyType||"";
  const dept=s.institution||"";
  return"/api/fallback-image?topic="+encodeURIComponent(topic)+"&dept="+encodeURIComponent(dept)+"&id="+encodeURIComponent(s.id||"x")+"&w=800";
}

function storyLabel(s,t){
  const tt=t||LANG.en;
  if(s.direction==="positive")return{label:tt.labelSupport||"Support",cls:"support"};
  if(s.severity==="critical"&&s.direction==="negative")return{label:tt.labelCritical||"Critical",cls:"critical"};
  if(s.direction==="negative")return{label:tt.labelConcern||"Concern",cls:"concern"};
  return{label:tt.labelUpdate||"Update",cls:"warning"};}

function StoryCardBB({s,t,onSelect,hero}){
  const img=getStoryImage(s);
  const lab=storyLabel(s,t);
  const d=s.institution?DEPT[s.institution]:null;
  const dept=d?.name||(s.storyType?(t?.storyTypes?.[s.storyType]||s.storyType[0].toUpperCase()+s.storyType.slice(1)):(t?.generalLabel||"General"));
  // v12.4.1 FIX: proper score display — 0 = "Neutral", >0 = "+N pts", <0 = "−N pts"
  const rawScore=s.aiScore??s.delta??0;
  const wt=Math.abs(rawScore);
  const isNeutral=Math.abs(rawScore)<0.05;  // treat very small as 0
  const isPos=rawScore>=0.05;
  const scoreText=isNeutral?"Neutral":(isPos?"+":"−")+wt.toFixed(1)+" pts";
  const scoreClass=isNeutral?"neu":(isPos?"pos":"neg");
  const ev=EVIDENCE_LEVELS[s.evidenceLevel||"single_source"];
  const time=new Date(s.ts).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
  const onClick=()=>{if(onSelect)onSelect(s);else if(s.link){try{window.open(s.link,"_blank","noopener");}catch{}}};

  if(hero){
    return(<div className="hero-story">
      <div>
        <div className="hero-img-wrap">
          <img src={img} alt="" onError={e=>{e.target.src="/api/fallback-image?topic="+(s.storyType||"")+"&dept="+(s.institution||"")+"&id="+s.id+"&w=800";}}/>
        </div>
      </div>
      <div>
        <div className="hero-label">{lab.label}{d?" · "+d.name:""}</div>
        <h1 className="hero-headline" onClick={onClick}>{s.headline}</h1>
        {s.citizenExplanation&&<p className="hero-summary">{s.citizenExplanation.slice(0,220)}{s.citizenExplanation.length>220?"…":""}</p>}
        <div className="badge-row">
          <span className={"bb-badge "+lab.cls}>{lab.label}{isNeutral?"":" · "+scoreText}</span>
          {d&&<span className="bb-badge dept">{d.icon?d.icon+" ":""}{d.name}</span>}
          {ev&&<span className="bb-badge warning">{ev.label} · {Math.round((ev.weight||0.4)*100)}%</span>}
          {s.courtStatus&&s.courtStatus!=="none"&&<span className="bb-badge info">{COURT_STATUSES[s.courtStatus]?.label||s.courtStatus}</span>}
          {s.aiDone&&<span className="bb-badge purple">✦ AI</span>}
        </div>
        {/* v12: Listen button for the hero story */}
        <div style={{marginTop:12}}>
          <ListenButton text={(s.headline||"")+". "+(s.citizenExplanation||"")}/>
        </div>
      </div>
    </div>);
  }

  return(<button className="story-card" onClick={onClick} type="button">
    <div className="story-card-img">
      <img src={img} alt="" loading="lazy" onError={e=>{e.target.src="/api/fallback-image?topic="+(s.storyType||"")+"&dept="+(s.institution||"")+"&id="+s.id+"&w=800";}}/>
    </div>
    <div className={"story-card-label lbl-"+lab.cls}>{lab.label}{d?" · "+d.name:""}</div>
    <h3 className="story-card-headline">{s.headline}</h3>
    <div className="story-card-meta">
      <span className={"story-card-score "+scoreClass}>{scoreText}</span>
      <span>·</span>
      <span>{ev?.label||"Single Source"}</span>
      <span>·</span>
      <span>{time}</span>
      {s.aiDone&&<><span>·</span><span style={{color:"var(--purple-t)"}}>✦ AI</span></>}
    </div>
  </button>);
}

function LatestItem({s,onClick}){
  const time=new Date(s.ts).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
  return(<button className="latest-item" onClick={()=>onClick&&onClick(s)} type="button">
    <div className="latest-time">{time}</div>
    <div className="latest-headline">{s.headline}</div>
  </button>);
}

function ScoreRowMini({score,label,desc}){
  const col=sColor(score);
  const r=24,circ=2*Math.PI*r,offset=circ-(score/100)*circ;
  return(<div className="score-row">
    <div className="score-ring-mini">
      <svg width={54} height={54} style={{position:"absolute",inset:0,transform:"rotate(-90deg)"}}>
        <circle cx={27} cy={27} r={r} fill="none" stroke="var(--border)" strokeWidth={4}/>
        <circle cx={27} cy={27} r={r} fill="none" stroke={col} strokeWidth={4} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{transition:"stroke-dashoffset 1s ease-out"}}/>
      </svg>
      <span style={{color:col,position:"relative",fontFamily:"var(--font-b)"}}>{score}</span>
    </div>
    <div className="score-info">
      <div className="score-label-sm">{label}</div>
      <div className="score-desc-sm">{desc}</div>
    </div>
  </div>);}

function Tag({children,color="#4A8FFF",sm}){return<span style={{display:"inline-flex",alignItems:"center",fontSize:sm?8.5:9.5,fontWeight:700,fontFamily:"var(--font-m)",color:color,background:color+"18",border:"1px solid "+color+"30",borderRadius:5,padding:sm?"1px 5px":"2px 7px",whiteSpace:"nowrap"}}>{children}</span>;}
function Pill({children,color="var(--t2)"}){return<span style={{display:"inline-flex",alignItems:"center",fontSize:9.5,color:color,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:99,padding:"1px 8px",fontWeight:500}}>{children}</span>;}
function Card({children,style={},glow,onClick}){return(<div onClick={onClick} style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:13,padding:"15px 17px",position:"relative",overflow:"hidden",cursor:onClick?"pointer":"default",boxShadow:glow?`0 0 0 1px ${glow}28, 0 6px 24px ${glow}14`:"none",transition:"border-color 0.2s",...style}}><div style={{position:"absolute",inset:0,background:"linear-gradient(140deg,rgba(255,255,255,0.011) 0%,transparent 50%)",pointerEvents:"none",borderRadius:"inherit"}}/>{children}</div>);}
function Metric({label,value,color,sub,icon}){return(<Card style={{padding:"13px 15px"}}><div style={{fontSize:8.5,color:"var(--t3)",fontWeight:800,textTransform:"uppercase",letterSpacing:"0.13em",marginBottom:5,display:"flex",alignItems:"center",gap:4}}>{icon&&<span>{icon}</span>}{label}</div><div style={{fontFamily:"var(--font-m)",fontSize:21,fontWeight:700,color:color||"var(--t1)",lineHeight:1,letterSpacing:"-0.03em"}}>{value}</div>{sub&&<div style={{fontSize:9.5,color:"var(--t2)",marginTop:4}}>{sub}</div>}</Card>);}
function Btn({children,onClick,variant="ghost",disabled,style={}}){const vs={ghost:{bg:"transparent",border:"var(--border2)",color:"var(--t2)"},primary:{bg:"var(--blue)",border:"transparent",color:"#fff"},success:{bg:"var(--green-s)",border:"var(--green-b)",color:"var(--green)"},danger:{bg:"var(--red-s)",border:"var(--red-b)",color:"var(--red)"},amber:{bg:"var(--amber-s)",border:"var(--amber-b)",color:"var(--amber)"},purple:{bg:"var(--purple-s)",border:"var(--purple-b)",color:"var(--purple)"},cyan:{bg:"var(--cyan-s)",border:"var(--cyan-b)",color:"var(--cyan)"}};const v=vs[variant]||vs.ghost;return(<button onClick={onClick} disabled={disabled} style={{display:"inline-flex",alignItems:"center",gap:5,padding:"6px 13px",borderRadius:8,background:v.bg,border:"1px solid "+v.border,color:v.color,fontSize:11,fontWeight:600,cursor:disabled?"default":"pointer",opacity:disabled?0.4:1,transition:"all 0.15s",fontFamily:"var(--font-b)",...style}}>{children}</button>);}
function STitle({children,action}){return(<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}><div style={{fontSize:8.5,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.14em",color:"var(--t3)"}}>{children}</div>{action}</div>);}

// ── EVIDENCE BADGE ─────────────────────────────────────────────
function EvidenceBadge({level,t}){
  const ev=EVIDENCE_LEVELS[level||"single_source"];
  const labels={allegation:"Allegation",single_source:"Single Source",corroborated:"Corroborated",official_doc:"Official Doc",court_finding:"Court Finding",final_adjudication:"Adjudicated"};
  return(<span title={ev?.desc||""} style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:8.5,fontWeight:800,color:ev?.color||"#94a3b8",background:(ev?.color||"#94a3b8")+"15",border:"1px solid "+(ev?.color||"#94a3b8")+"30",borderRadius:4,padding:"1px 6px",fontFamily:"var(--font-m)",whiteSpace:"nowrap"}}>
    <span style={{width:4,height:4,borderRadius:"50%",background:ev?.color||"#94a3b8",display:"inline-block",flexShrink:0}}/>
    {t?.evidenceLevels?.[level]||labels[level]||"Unknown"}
  </span>);}

// ── CONFIDENCE BADGE ───────────────────────────────────────────
function ConfidenceBadge({confidence,t}){
  const cv=CONFIDENCE_LEVELS[confidence||"moderate"];
  const labels={high:"High Confidence",moderate:"Moderate",low:"Low Confidence",developing:"Developing"};
  return(<span style={{fontSize:8.5,fontWeight:700,color:cv?.color||"var(--amber)",background:(cv?.color||"var(--amber)")+"12",border:"1px solid "+(cv?.color||"var(--amber)")+"25",borderRadius:4,padding:"1px 6px",fontFamily:"var(--font-m)"}}>
    {t?.confidence?.[confidence]||labels[confidence]||"Moderate"}
  </span>);}

// ── COURT STATUS BADGE ─────────────────────────────────────────
function CourtBadge({status}){
  if(!status||status==="none")return null;
  const cs=COURT_STATUSES[status];if(!cs)return null;
  return(<span style={{fontSize:8.5,fontWeight:700,color:cs.color,background:cs.color+"12",border:"1px solid "+cs.color+"25",borderRadius:4,padding:"1px 6px"}}>⚖ {cs.label}</span>);}

// ── STORY TYPE BADGE ───────────────────────────────────────────
function StoryTypeBadge({type,t}){
  const colors={policy:"var(--blue)",law:"var(--purple)",court:"var(--green)",policing:"var(--red)",election:"var(--purple)",rights:"var(--red)",corruption:"var(--amber)",welfare:"var(--green)",speech:"var(--orange,#f97316)",media:"var(--amber)",federalism:"var(--blue)",minority:"var(--cyan)"};
  const col=colors[type]||"var(--t2)";
  const label=t?.storyTypes?.[type]||type;
  return(<span style={{fontSize:8.5,fontWeight:700,color:col,background:col+"12",border:"1px solid "+col+"25",borderRadius:4,padding:"1px 6px",textTransform:"capitalize"}}>{label}</span>);}

// ── SCORE EXPLANATION ──────────────────────────────────────────
function ScoreExplanation({story}){
  const exp=story.scoreExplanation||generateExplanation(story);
  if(!exp)return null;
  const col=story.direction==="positive"?"var(--green)":"var(--red)";
  return(<div style={{padding:"10px 12px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:8,borderLeft:"2px solid "+col,marginTop:8}}>
    <div style={{fontSize:8.5,color:"var(--t3)",fontWeight:800,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:4}}>Score Explanation</div>
    <p style={{fontSize:11,color:"var(--t2)",lineHeight:1.7,margin:0}}>{exp}</p>
  </div>);}

// ── IMPACT BAR ─────────────────────────────────────────────────
function ImpactBar({story,t}){
  const scope=story.scope||"national";const r=IMPACT[scope]||IMPACT.national;
  const abs=Math.min(5,Math.abs(story.aiScore||story.delta||0))/5;
  const ev=EVIDENCE_LEVELS[story.evidenceLevel||"single_source"]?.weight||0.5;
  const conf={high:1.0,moderate:0.75,low:0.5,developing:0.35}[story.confidence||"moderate"]||0.7;
  const mult=ev*conf;
  const ni=story.nationalImpact!=null?story.nationalImpact:Math.round(r.national*100*abs*mult);
  const si=story.stateImpact!=null?story.stateImpact:Math.round(r.state*100*abs*mult);
  const li=story.localImpact!=null?story.localImpact:Math.round(r.local*100*abs*mult);
  const col=story.direction==="positive"?"var(--green)":"var(--red)";
  return(<div style={{padding:"11px 13px",background:"rgba(255,255,255,0.02)",borderRadius:9,marginTop:9,border:"1px solid var(--border)"}}>
    <div style={{fontSize:8.5,color:"var(--t3)",fontWeight:800,textTransform:"uppercase",letterSpacing:"0.13em",marginBottom:9}}>{t.impactRadius}</div>
    {[[`🌐 ${t.national}`,ni],[`🏛 ${t.state}`,si],[`📍 ${t.district}`,li]].map(([lbl,val])=>(
      <div key={lbl} style={{display:"flex",alignItems:"center",gap:9,marginBottom:6}}>
        <span style={{fontSize:9.5,color:"var(--t2)",width:75,flexShrink:0,fontWeight:500}}>{lbl}</span>
        <div style={{flex:1,height:4,background:"rgba(255,255,255,0.04)",borderRadius:99,overflow:"hidden"}}>
          <div style={{height:"100%",borderRadius:99,background:col,width:Math.min(100,val)+"%",transition:"width 1.3s cubic-bezier(0.34,1.56,0.64,1)",boxShadow:`0 0 8px ${col}55`}}/>
        </div>
        <span style={{fontSize:9.5,fontFamily:"var(--font-m)",fontWeight:700,color:col,width:28,textAlign:"right"}}>{Math.round(val)}%</span>
      </div>
    ))}
    <div style={{fontSize:9,color:"var(--t3)",marginTop:6,fontStyle:"italic"}}>Adjusted for evidence weight ({Math.round(ev*100)}%) × confidence ({Math.round(conf*100)}%)</div>
  </div>);}

// ── CONSTITUTION PANEL ─────────────────────────────────────────
function ConstitutionPanel({violations=[],supports=[],t}){
  if(!violations.length&&!supports.length)return(<div style={{padding:"18px",textAlign:"center",color:"var(--t3)",fontSize:11,fontStyle:"italic",background:"var(--bg-soft)",borderRadius:2}}>Constitutional analysis loading… click ✦ AI Enrich All to get detailed article-level analysis.</div>);

  const renderArticle=(v,isSupport)=>{
    const col=isSupport?"var(--green-t)":"var(--red-t)";
    const bg=isSupport?"var(--green-s)":"var(--red-s)";
    const border=isSupport?"var(--green-b)":"var(--red-b)";
    const articleTitle=v.title||CA[v.a]?.t||v.a;
    const who=v.who||null;
    const how=v.how||v.h||v.reason||"";
    return(
      <div style={{padding:"12px 14px",background:bg,border:"1px solid "+border,borderRadius:2,marginBottom:8,borderLeft:"3px solid "+col}}>
        {/* Article header */}
        <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:6,flexWrap:"wrap"}}>
          <span style={{fontFamily:"var(--font-m)",fontSize:11,fontWeight:800,color:col,background:"rgba(255,255,255,0.5)",padding:"2px 7px",borderRadius:2,letterSpacing:"0.02em"}}>{v.a}</span>
          <span style={{fontFamily:"var(--font-h)",fontSize:14,fontWeight:700,color:"var(--t1)",lineHeight:1.3,letterSpacing:"-0.01em"}}>{articleTitle}</span>
        </div>

        {/* Who */}
        {who&&(<div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:6,paddingBottom:6,borderBottom:"1px solid "+border}}>
          <span style={{fontSize:9.5,color:col,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.1em",flexShrink:0}}>BY</span>
          <span style={{fontSize:12.5,color:"var(--t1)",fontWeight:600,fontFamily:"var(--font-b)"}}>{who}</span>
        </div>)}

        {/* How — full 50-80 word explanation */}
        {how&&(<div>
          <div style={{fontSize:9.5,color:col,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>{isSupport?"HOW IT UPHOLDS":"HOW IT VIOLATES"}</div>
          <p style={{fontSize:13,color:"var(--t1)",lineHeight:1.65,fontFamily:"var(--font-h)",margin:0}}>{how}</p>
        </div>)}
      </div>
    );
  };

  return(<div style={{marginTop:4}}>
    {violations.length>0&&(<div style={{marginBottom:16}}>
      <div style={{fontSize:10,color:"var(--red-t)",fontWeight:800,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:10,display:"flex",alignItems:"center",gap:6,paddingBottom:6,borderBottom:"2px solid var(--red-t)"}}>
        <span style={{width:7,height:7,borderRadius:"50%",background:"var(--red-t)",display:"inline-block"}}/>
        {t.constitutionViolations||"Constitutional Violations"} ({violations.length})
      </div>
      {violations.map((v,i)=><div key={i}>{renderArticle(v,false)}</div>)}
    </div>)}
    {supports.length>0&&(<div>
      <div style={{fontSize:10,color:"var(--green-t)",fontWeight:800,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:10,display:"flex",alignItems:"center",gap:6,paddingBottom:6,borderBottom:"2px solid var(--green-t)"}}>
        <span style={{width:7,height:7,borderRadius:"50%",background:"var(--green-t)",display:"inline-block"}}/>
        {t.constitutionSupports||"Constitutional Supports"} ({supports.length})
      </div>
      {supports.map((v,i)=><div key={i}>{renderArticle(v,true)}</div>)}
    </div>)}
  </div>);}


// ── STORY CARD — World-class with Citizen/Expert modes ─────────
function StoryCard({s,t,mode,onReview,compact,onSelect}){
  const[tab,setTab]=useState("impact");
  const isCrit=s.severity==="critical"&&s.direction==="negative";
  const isPos=s.direction==="positive";
  const col=isCrit?"var(--red)":isPos?"var(--green)":"var(--amber)";
  const bg=isCrit?"rgba(240,74,90,0.035)":isPos?"rgba(15,212,124,0.035)":"rgba(245,166,35,0.025)";
  const border=isCrit?"rgba(240,74,90,0.12)":isPos?"rgba(15,212,124,0.12)":"rgba(245,166,35,0.09)";
  const pc=PAT[s.pattern]||PAT.isolated;const d=s.institution?DEPT[s.institution]:null;
  const wt=Math.abs(s.aiScore||s.delta||0);
  const ev=EVIDENCE_LEVELS[s.evidenceLevel||"single_source"];
  // CITIZEN MODE — simplified view
  if(mode==="citizen"&&!compact){return(
    <div style={{background:bg,border:"1px solid "+border,borderRadius:14,padding:"16px 18px",marginBottom:10}}>
      {s.image&&<img src={s.image} alt="" className="news-image" onError={e=>{e.target.style.display="none";}}/>}
      <div style={{display:"flex",gap:6,alignItems:"flex-start",marginBottom:10}}>
        <div style={{width:32,height:32,borderRadius:9,background:col+"18",border:"1px solid "+col+"25",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{isPos?"✅":isCrit?"🚨":"⚠️"}</div>
        <div style={{flex:1}}>
          <div style={{fontSize:9,color:col,fontWeight:700,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.06em"}}>{isPos?"Supports Constitution":"Potential Constitutional Concern"}</div>
          <h3 style={{fontSize:13,fontWeight:600,color:"var(--t1)",lineHeight:1.55}}>{s.headline}</h3>
        </div>
      </div>
      {s.citizenExplanation&&(<div style={{padding:"10px 12px",background:"rgba(255,255,255,0.03)",borderRadius:8,marginBottom:10}}>
        <div style={{fontSize:8.5,color:"var(--t3)",fontWeight:800,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:4}}>{t.citizenWhy}</div>
        <p style={{fontSize:12,color:"var(--t1)",lineHeight:1.7,margin:0}}>{s.citizenExplanation}</p>
      </div>)}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
        {d&&<Pill color={d.color}>{d.icon} {d.name}</Pill>}
        <EvidenceBadge level={s.evidenceLevel} t={t}/>
        {s.courtStatus&&s.courtStatus!=="none"&&<CourtBadge status={s.courtStatus}/>}
        <span style={{fontSize:9,color:"var(--t3)",marginLeft:"auto"}}>{new Date(s.ts).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}</span>
      </div>
    </div>
  );}
  return(
    <div onClick={onSelect?()=>onSelect(s):undefined} style={{background:bg,border:"1px solid "+border,borderRadius:14,padding:compact?"11px 14px":"16px 18px",marginBottom:10,cursor:onSelect?"pointer":"default",transition:"border-color 0.2s"}}>
      {s.image&&!compact&&<img src={s.image} alt="" className="news-image" onError={e=>{e.target.style.display="none";}}/>}
      {/* Header row */}
      <div style={{display:"flex",gap:6,alignItems:"flex-start",marginBottom:compact?0:9}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap",marginBottom:5}}>
            <span style={{fontSize:8.5,fontWeight:800,color:col,background:col+"16",border:"1px solid "+col+"28",borderRadius:5,padding:"1px 7px",letterSpacing:"0.04em",fontFamily:"var(--font-m)"}}>{isPos?t.positive:isCrit?t.critical:t.high}</span>
            {d&&<span style={{fontSize:8.5,color:d.color,background:d.color+"12",border:"1px solid "+d.color+"22",borderRadius:5,padding:"1px 7px",fontWeight:700}}>{d.icon} {d.name}</span>}
            {s.storyType&&!compact&&<StoryTypeBadge type={s.storyType} t={t}/>}
            {s.state&&<Pill color="var(--blue)">{s.state}</Pill>}
            <div style={{marginLeft:"auto",padding:"2px 8px",borderRadius:6,background:col+"14",border:"1px solid "+col+"28"}}>
              <span style={{fontFamily:"var(--font-m)",fontSize:11,fontWeight:800,color:col,letterSpacing:"-0.02em"}}>{wt<0.05?"Neutral":(isPos?"+":"−")+wt.toFixed(1)+" pts"}</span>
            </div>
          </div>
          <h3 style={{fontSize:13,fontWeight:600,color:"var(--t1)",lineHeight:1.55,marginBottom:6,wordBreak:"break-word"}}>{s.headline}</h3>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}>
            <span style={{fontSize:8.5,color:pc.color,background:pc.bg,borderRadius:4,padding:"1px 6px",fontWeight:700,border:"1px solid "+pc.color+"22"}}>{pc.dot} {pc.label}</span>
            <EvidenceBadge level={s.evidenceLevel} t={t}/>
            <ConfidenceBadge confidence={s.confidence} t={t}/>
            {s.courtStatus&&s.courtStatus!=="none"&&<CourtBadge status={s.courtStatus}/>}
            {s.aiDone&&<span style={{fontSize:8.5,color:"var(--purple)",background:"var(--purple-s)",border:"1px solid var(--purple-b)",borderRadius:4,padding:"1px 6px",fontWeight:700}}>✦ AI</span>}
            <span style={{fontSize:8.5,color:"var(--t3)",marginLeft:"auto"}}>{new Date(s.ts).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}</span>
          </div>
        </div>
      </div>
      {!compact&&(<>
        {/* Tabs */}
        <div style={{display:"flex",gap:2,marginTop:8,marginBottom:9,borderBottom:"1px solid var(--border)",paddingBottom:7}}>
          {[["impact",t.impact],["facts",t.facts],["mythos",t.mythos],...(mode==="expert"?[["expert","🔍 Expert"]]:[])].map(([k,label])=>(
            <button key={k} onClick={()=>setTab(k)} style={{padding:"3px 10px",borderRadius:6,border:"none",background:tab===k?"rgba(255,255,255,0.08)":"transparent",color:tab===k?"var(--t1)":"var(--t2)",fontSize:10.5,fontWeight:tab===k?700:400,cursor:"pointer",transition:"all 0.14s"}}>{label}</button>
          ))}
        </div>
        {tab==="impact"&&(<>
          <ImpactBar story={s} t={t}/>
          {s.govResponse&&(<div style={{marginTop:8,padding:"8px 12px",background:"rgba(74,143,255,0.04)",border:"1px solid rgba(74,143,255,0.12)",borderRadius:8}}>
            <div style={{fontSize:8.5,color:"var(--blue)",fontWeight:800,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:3}}>🏢 {t.govResponse}</div>
            <p style={{fontSize:10.5,color:"var(--t2)",margin:0,lineHeight:1.6}}>{s.govResponse}</p>
          </div>)}
          <ScoreExplanation story={s}/>
        </>)}
        {tab==="facts"&&<ConstitutionPanel violations={s.violations} supports={s.supports} t={t}/>}
        {tab==="mythos"&&(<div style={{padding:"12px 15px",background:"rgba(155,125,255,0.04)",border:"1px solid rgba(155,125,255,0.11)",borderRadius:9,borderLeft:"3px solid var(--purple)"}}>{s.mythos?<p style={{fontSize:12.5,color:"var(--t1)",fontStyle:"italic",lineHeight:1.9,margin:0}}>{s.mythos}</p>:<p style={{fontSize:11,color:"var(--t2)",margin:0}}>AI insight pending — tap ✦ AI in newsroom</p>}{s.aiAnalysis&&<p style={{fontSize:10.5,color:"var(--t2)",marginTop:9,padding:"7px 11px",background:"rgba(155,125,255,0.06)",borderRadius:7,lineHeight:1.7}}>{s.aiAnalysis}</p>}</div>)}
        {tab==="expert"&&mode==="expert"&&(<div style={{padding:"12px 14px",background:"rgba(255,255,255,0.02)",border:"1px solid var(--border)",borderRadius:9}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
            {[["Evidence Level",s.evidenceLevel?.replace(/_/g," ")||"unknown"],["Confidence",s.confidence||"moderate"],["Story Type",s.storyType||"policy"],["Pattern Class",s.pattern||"isolated"],["Pillar",s.pillar||"justice"],["Scope",s.scope||"national"],["AI Score",s.aiScore||s.delta||0],["Source",s.source||"unknown"]].map(([k,v])=>(<div key={k} style={{fontSize:10,color:"var(--t1)"}}><span style={{color:"var(--t3)",fontWeight:700,display:"block",fontSize:8.5,marginBottom:2,textTransform:"uppercase",letterSpacing:"0.1em"}}>{k}</span>{String(v)}</div>))}
          </div>
          {(s.violations||[]).length>0&&<div style={{fontSize:10,color:"var(--t2)",fontFamily:"var(--font-m)",padding:"8px 10px",background:"rgba(0,0,0,0.2)",borderRadius:6,overflow:"auto"}}>{JSON.stringify({violations:s.violations,supports:s.supports},null,2)}</div>}
        </div>)}
      </>)}
      {onReview&&(<div style={{display:"flex",gap:5,marginTop:9,flexWrap:"wrap"}}>
        <Btn onClick={()=>onReview(s.id,"approve")} variant="success">✓</Btn>
        <Btn onClick={()=>onReview(s.id,"hold")} variant="amber">⏸</Btn>
        <Btn onClick={()=>onReview(s.id,"reject")} variant="danger">✗</Btn>
      </div>)}
    </div>
  );}


// ── SIGN IN ────────────────────────────────────────────────────
function SignInPage({onSignIn,lang,setLang,t}){
  const[name,setName]=useState("");const[email,setEmail]=useState("");
  return(<div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px",position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",top:"20%",left:"30%",width:700,height:700,background:"radial-gradient(circle,rgba(124,92,252,0.07) 0%,transparent 65%)",pointerEvents:"none"}}/>
    <div style={{position:"absolute",bottom:"20%",right:"20%",width:500,height:500,background:"radial-gradient(circle,rgba(240,74,90,0.05) 0%,transparent 65%)",pointerEvents:"none"}}/>
    <div style={{position:"fixed",top:14,right:14,display:"flex",gap:4,flexWrap:"wrap",justifyContent:"flex-end",maxWidth:"85vw",zIndex:10}}>
      {Object.entries(LANG).map(([k,l])=>(<button key={k} onClick={()=>setLang(k)} style={{padding:"2px 7px",borderRadius:6,border:"1px solid "+(lang===k?"rgba(74,143,255,0.45)":"var(--border)"),background:lang===k?"rgba(74,143,255,0.1)":"var(--surface)",color:lang===k?"var(--blue)":"var(--t2)",fontSize:9.5,fontWeight:lang===k?700:400,cursor:"pointer"}}>{l.flag} {l.name}</button>))}
    </div>
    <div style={{width:"100%",maxWidth:420,position:"relative",zIndex:1}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{width:60,height:60,borderRadius:17,background:"var(--grad)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:900,fontFamily:"var(--font-h)",color:"#fff",margin:"0 auto 16px",boxShadow:"0 8px 32px rgba(124,92,252,0.4),0 0 0 1px rgba(124,92,252,0.25)"}}>D</div>
        <h1 style={{fontFamily:"var(--font-h)",fontSize:24,fontWeight:900,color:"var(--t1)",marginBottom:5,letterSpacing:"-0.02em"}}>{t.appName}</h1>
        <div style={{fontSize:11,color:"var(--t3)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>{t.appSub}</div>
        <p style={{fontSize:11.5,color:"var(--t2)",lineHeight:1.7,maxWidth:310,margin:"0 auto"}}>{t.signInSub}</p>
      </div>
      <div style={{background:"var(--surface)",border:"1px solid var(--border2)",borderRadius:18,padding:"26px",boxShadow:"0 20px 70px rgba(0,0,0,0.5)"}}>
        <h2 style={{fontFamily:"var(--font-h)",fontSize:17,fontWeight:700,color:"var(--t1)",marginBottom:5}}>{t.signIn}</h2>
        {[{k:"name",label:t.yourName,val:name,set:setName,req:true,type:"text"},{k:"email",label:t.yourEmail,val:email,set:setEmail,req:false,type:"email"}].map(f=>(
          <div key={f.k} style={{marginBottom:13}}>
            <label style={{fontSize:8.5,color:"var(--t3)",fontWeight:800,textTransform:"uppercase",letterSpacing:"0.12em",display:"block",marginBottom:5}}>{f.label}{f.req?" *":""}</label>
            <input value={f.val} onChange={e=>f.set(e.target.value)} onKeyDown={e=>e.key==="Enter"&&name.trim()&&onSignIn({name:name.trim(),email:email.trim()})} type={f.type} placeholder={f.label} style={{width:"100%",padding:"11px 13px",borderRadius:10,border:"1px solid "+(f.req&&f.val?"rgba(74,143,255,0.4)":"var(--border2)"),background:"var(--surface2)",color:"var(--t1)",fontSize:13,outline:"none",fontFamily:"var(--font-b)",transition:"border-color 0.2s"}}/>
          </div>
        ))}
        <button onClick={()=>name.trim()&&onSignIn({name:name.trim(),email:email.trim()})} disabled={!name.trim()} style={{width:"100%",padding:"13px",borderRadius:11,border:"none",background:name.trim()?"var(--grad)":"var(--surface3)",color:name.trim()?"#fff":"var(--t3)",fontSize:14,fontWeight:700,cursor:name.trim()?"pointer":"default",transition:"all 0.25s",boxShadow:name.trim()?"0 4px 24px rgba(124,92,252,0.4)":"none",fontFamily:"var(--font-h)",letterSpacing:"0.01em"}}>{t.continueBtn}</button>
        <div style={{textAlign:"center",marginTop:14}}>
          <button onClick={()=>onSignIn({name:"Guest",email:""})} style={{fontSize:11,color:"var(--t2)",background:"transparent",border:"none",cursor:"pointer",textDecoration:"underline"}}>{t.guestMode}</button>
        </div>
        <div style={{display:"flex",gap:14,justifyContent:"center",marginTop:16,flexWrap:"wrap"}}>
          {["🔒 No data sold","⚡ Always free","📜 Evidence-based","🌐 10 Languages"].map(b=>(<span key={b} style={{fontSize:9.5,color:"var(--t3)"}}>{b}</span>))}
        </div>
      </div>
    </div>
  </div>);}

// ── DISCLAIMER ─────────────────────────────────────────────────
function DisclaimerPage({onAccept,t,userName}){
  const[read,setRead]=useState(false);const ref=useRef(null);
  useEffect(()=>{const el=ref.current;if(!el)return;const h=()=>{if(el.scrollTop+el.clientHeight>=el.scrollHeight-50)setRead(true);};el.addEventListener("scroll",h);return()=>el.removeEventListener("scroll",h);},[]);
  const sections=[
    {icon:"📊",color:"var(--blue)",title:"How We Calculate the Democracy Score",body:`India's constitutional health score starts at a calibrated baseline of 41/100, anchored to four international indices:\n\n• Freedom House: 63/100 (2025) · V-Dem: 100th of 179 nations · RSF Press: 151st of 180 · EIU: 6.6/10\n\nEvery news story is assigned a multi-factor Democracy Weight Score from -5 (severe constitutional harm) to +5 (strong constitutional benefit). The score formula: story_effect = directional_score × evidence_weight × credibility × confidence × recency × pillar_weight × pattern_multiplier × impact_radius`},
    {icon:"🔍",color:"var(--amber)",title:"Evidence Levels — What We Track",body:`Every story is classified by evidence level. This is our core safeguard:\n\n• ALLEGATION (0.2× weight): Unverified claim — low impact until confirmed\n• SINGLE SOURCE (0.4× weight): One outlet reports — moderate weight\n• CORROBORATED (0.65× weight): Multiple independent sources\n• OFFICIAL DOCUMENT (0.85× weight): Gazette, notification, official order\n• COURT FINDING (0.92× weight): Judicial determination or order\n• FINAL ADJUDICATION (1.0× weight): Full legal resolution\n\nThis means an unconfirmed allegation barely moves the score, while an official document or court order has full effect.`},
    {icon:"🌐",color:"var(--green)",title:"Impact Radius — All 3 Scores Update Simultaneously",body:`Every story updates National, State, and Local democracy scores at the same time but at different intensities based on geographic reach:\n\n• National news: 100% national · 40% state · 20% local\n• State news: 30% national · 100% state · 50% local\n• Local/District: 5% national · 15% state · 100% local\n\nAll three score rings update from every story — adjusted for evidence weight and confidence level.`},
    {icon:"⚖",color:"var(--purple)",title:"Constitutional Violations & Supports — Mapped to Articles",body:`Every story maps to specific Articles of the Indian Constitution of 1950. We display:\n\n• VIOLATIONS (red ⚠): Where state, police, courts, or media acted against constitutional guarantees\n• SUPPORTS (green ✓): Where institutions upheld fundamental rights\n\nSeven constitutional pillars tracked: Press Freedom (Art.19) · Liberty (Art.21) · Equality (Art.14-15) · Electoral Integrity (Art.324-326) · Separation of Powers (Art.50) · Religious Freedom (Art.25-28) · Access to Justice (Art.32)`},
    {icon:"🏛",color:"var(--cyan)",title:"16 Government Departments — Each Scored Live",body:`PMO · Home · Law & Justice · Finance · Education · Health · Women & Child · Minority Affairs · Rural Development · Urban Development · Environment · Defence · Police · Election Commission · Media/Information · Judiciary\n\nEach department has its own live democracy score based on stories involving that institution. Scores are adjusted for evidence quality and confidence level. The judiciary is tracked carefully — institutional developments only, never pending cases treated as wrongdoing.`},
    {icon:"⚠",color:"var(--red)",title:"Critical Safeguards — What This Platform Is NOT",body:`This platform is NOT a court. NEVER use it as legal evidence.\n\n• ALLEGATION ≠ FACT: Low-evidence stories have minimal score impact\n• CONCERN ≠ CONVICTION: We say "potential violation," not "guilty"\n• PENDING ≠ WRONG: Court pending status means matter unresolved — NOT that wrongdoing is established\n• We always show government response when available\n• We always show court status when available\n• Confidence bands tell you how certain we are\n\nFor genuine legal emergencies: NALSA: 15100 · NHRC: 14433 · Women Helpline: 181\n\nNot affiliated with any political party, government body, or NGO.`},
  ];
  return(<div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",flexDirection:"column",alignItems:"center",padding:"24px 16px"}}>
    <div style={{width:"100%",maxWidth:700}}>
      <div style={{textAlign:"center",marginBottom:22,paddingTop:10}}>
        <div style={{width:46,height:46,borderRadius:13,background:"var(--grad)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,fontWeight:900,fontFamily:"var(--font-h)",color:"#fff",margin:"0 auto 12px",boxShadow:"0 4px 20px rgba(124,92,252,0.35)"}}>D</div>
        <div style={{fontFamily:"var(--font-h)",fontSize:19,fontWeight:800,color:"var(--t1)",marginBottom:4,letterSpacing:"-0.01em"}}>{t.disclaimerTitle}</div>
        <p style={{fontSize:11.5,color:"var(--t2)",lineHeight:1.6}}>Welcome, {userName} — {t.disclaimerSub}</p>
      </div>
      <div ref={ref} style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:16,padding:"22px",maxHeight:"62vh",overflowY:"auto",marginBottom:12}}>
        {sections.map((s,i)=>(<div key={i} style={{marginBottom:26,paddingBottom:26,borderBottom:i<sections.length-1?"1px solid var(--border)":"none"}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:11,marginBottom:10}}>
            <div style={{width:34,height:34,borderRadius:9,background:s.color+"12",border:"1px solid "+s.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{s.icon}</div>
            <h3 style={{fontFamily:"var(--font-h)",fontSize:13.5,fontWeight:700,color:"var(--t1)",lineHeight:1.3,paddingTop:2}}>{s.title}</h3>
          </div>
          {s.body.split("\n\n").map((para,j)=>(<p key={j} style={{fontSize:11.5,color:"var(--t2)",lineHeight:1.85,marginBottom:8,whiteSpace:"pre-line"}}>{para}</p>))}
        </div>))}
        {!read&&<div style={{textAlign:"center",padding:"14px",fontSize:11,color:"var(--t3)",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><span style={{animation:"pulse 1.5s infinite"}}>↓</span> Scroll to read all 6 sections</div>}
      </div>
      <button onClick={onAccept} disabled={!read} style={{width:"100%",padding:"14px",borderRadius:12,border:"none",background:read?"var(--grad)":"var(--surface2)",color:read?"#fff":"var(--t3)",fontSize:14,fontWeight:700,cursor:read?"pointer":"default",transition:"all 0.3s",boxShadow:read?"0 4px 32px rgba(124,92,252,0.4)":"none",fontFamily:"var(--font-h)",letterSpacing:"0.01em"}}>
        {read?t.disclaimerAccept:"↓ Read all sections first"}
      </button>
    </div>
  </div>);}


// ── SIDEBAR + TOPBAR + TICKER ──────────────────────────────────
const NAV=[{g:"Intelligence",items:[{id:"dashboard",tk:"dashboard",icon:"◉"},{id:"newsroom",tk:"newsroom",icon:"⚡"},{id:"tracker",tk:"tracker",icon:"📜"}]},{g:"Scores",items:[{id:"demoscore",tk:"demoScore",icon:"◎"},{id:"departments",tk:"departments",icon:"🏛"},{id:"states",tk:"states",icon:"◱"}]},{g:"Rights",items:[{id:"rights",tk:"rights",icon:"🛡"},{id:"journalist",tk:"journalist",icon:"🔍"}]},{g:"Community",items:[{id:"submit",tk:"submit",icon:"+"},{id:"review",tk:"review",icon:"◻"}]},{g:"Platform",items:[{id:"method",tk:"method",icon:"◈"},{id:"about",tk:"about",icon:"ℹ"}]}];

function Sidebar({page,setPage,pending,t,user,lang,setLang,mode,setMode}){return(<aside className="sidebar">
  <div className="sidebar-logo"><div style={{display:"flex",alignItems:"center",gap:9}}><div className="logo-mark">D</div><div><div style={{fontFamily:"var(--font-h)",fontSize:11.5,fontWeight:800,color:"var(--t1)",letterSpacing:"0.02em"}}>{t.appName}</div><div style={{fontSize:8.5,color:"var(--t3)",letterSpacing:"0.07em"}}>dtn.today · Intelligence</div></div></div></div>
  {user&&<div style={{padding:"9px 13px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:8}}>
    <div style={{width:26,height:26,borderRadius:"50%",background:"var(--grad)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff",flexShrink:0,boxShadow:"0 2px 8px rgba(124,92,252,0.3)"}}>{user.name[0].toUpperCase()}</div>
    <div style={{minWidth:0}}><div style={{fontSize:11.5,fontWeight:600,color:"var(--t1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div><div style={{fontSize:8.5,color:"var(--t3)"}}>Citizen Analyst</div></div>
  </div>}
  {/* Mode toggle */}
  <div style={{padding:"8px 13px",borderBottom:"1px solid var(--border)",display:"flex",gap:4}}>
    {[["citizen",t.citizenMode||"Citizen","var(--green)"],["normal","Standard","var(--blue)"],["expert",t.expertMode||"Expert","var(--purple)"]].map(([m,label,col])=>(
      <button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:"4px 2px",borderRadius:6,border:"1px solid "+(mode===m?col+"44":"var(--border)"),background:mode===m?col+"12":"transparent",color:mode===m?col:"var(--t3)",fontSize:8,fontWeight:700,cursor:"pointer",textTransform:"uppercase",letterSpacing:"0.06em",transition:"all 0.15s"}}>{label}</button>
    ))}
  </div>
  <nav className="sidebar-nav">
    {NAV.map(g=>(<div key={g.g} className="nav-section">
      <div className="nav-section-label">{g.g}</div>
      {g.items.map(item=>(<button key={item.id} className={"nav-btn"+(page===item.id?" active":"")} onClick={()=>setPage(item.id)}>
        <span className="icon">{item.icon}</span>{t[item.tk]||item.tk}
        {item.id==="review"&&pending>0&&<span className="nav-badge">{pending}</span>}
        {item.id==="newsroom"&&<span style={{marginLeft:"auto",width:5,height:5,borderRadius:"50%",background:"var(--green)",display:"inline-block",boxShadow:"0 0 8px var(--green)",animation:"pulse 2s infinite"}}/>}
      </button>))}
    </div>))}
  </nav>
  <div style={{padding:"9px 11px",borderTop:"1px solid var(--border)",flexShrink:0}}>
    <div style={{fontSize:7.5,color:"var(--t3)",marginBottom:5,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.13em"}}>Language</div>
    <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
      {Object.entries(LANG).map(([k,l])=>(<button key={k} onClick={()=>setLang(k)} style={{padding:"2px 5px",borderRadius:4,border:"1px solid "+(lang===k?"rgba(74,143,255,0.4)":"var(--border)"),background:lang===k?"rgba(74,143,255,0.1)":"transparent",color:lang===k?"var(--blue)":"var(--t3)",fontSize:8.5,cursor:"pointer"}}>{l.flag}</button>))}
    </div>
  </div>
</aside>);}

function Topbar({natScore,stScore,distScore,fetching,onFetch,autoOn,setAutoOn,rl,fScope,setFScope,fState,setFState,fDist,setFDist,t,countdown,mode,notif}){
  const states=Object.keys(STATE_BASELINES).sort();
  const modeColor=mode==="citizen"?"var(--green)":mode==="expert"?"var(--purple)":"var(--blue)";
  const alertsOn=notif?.enabled&&notif?.perm==="granted";
  const alertsLabel=notif?.perm==="denied"?t.alertsBlocked:alertsOn?t.alertsOn:t.alertsEnable;
  // iOS detection for PWA guidance
  const isIOS=typeof navigator!=="undefined"&&/iPad|iPhone|iPod/.test(navigator.userAgent)&&!window.MSStream;
  const isStandalone=typeof window!=="undefined"&&(window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===true);
  const showIOSInstall=isIOS&&!isStandalone&&!notif?.supported;
  const[showIOSHelp,setShowIOSHelp]=useState(false);
  const handleAlerts=()=>{
    if(showIOSInstall){setShowIOSHelp(true);return;}
    if(!notif?.supported)return;
    if(alertsOn)notif.disable();else notif.request();
  };
  return(<div className="topbar">
    <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
      {[["globe",natScore],["landmark",stScore],["mapPin",distScore]].map(([icon,score],i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:2}}>
          <Icon name={icon} size={11} color={sColor(score)}/>
          <span style={{fontFamily:"var(--font-m)",fontSize:13,fontWeight:700,color:sColor(score),letterSpacing:"-0.03em"}}>{score}</span>
        </div>
      ))}
    </div>
    <div style={{width:1,height:16,background:"var(--border)",flexShrink:0}}/>
    {mode!=="normal"&&<span style={{fontSize:8,fontWeight:800,color:modeColor,background:modeColor+"15",border:"1px solid "+modeColor+"30",borderRadius:99,padding:"2px 7px",textTransform:"uppercase",letterSpacing:"0.08em",flexShrink:0}}>{mode==="citizen"?t.citizenMode||"Citizen":t.expertMode||"Expert"}</span>}
    <div style={{flex:1,display:"flex",alignItems:"center",gap:5,overflow:"hidden"}}>
      <select value={fScope} onChange={e=>setFScope(e.target.value)} style={{padding:"3px 6px",borderRadius:7,border:"1px solid var(--border2)",background:"var(--surface2)",color:"var(--t1)",fontSize:9.5,outline:"none",cursor:"pointer",fontFamily:"var(--font-b)"}}>
        <option value="national">{t.national}</option><option value="state">{t.state}</option><option value="district">{t.district}</option>
      </select>
      {fScope==="state"&&<select value={fState} onChange={e=>setFState(e.target.value)} style={{padding:"3px 6px",borderRadius:7,border:"1px solid var(--border2)",background:"var(--surface2)",color:"var(--t1)",fontSize:9.5,outline:"none",cursor:"pointer",maxWidth:95,fontFamily:"var(--font-b)"}}>{states.map(s=><option key={s} value={s}>{s}</option>)}</select>}
      {fScope==="district"&&<input value={fDist} onChange={e=>setFDist(e.target.value)} placeholder={t.district} style={{padding:"3px 8px",borderRadius:7,border:"1px solid var(--border2)",background:"var(--surface2)",color:"var(--t1)",fontSize:9.5,outline:"none",width:90,fontFamily:"var(--font-b)"}}/>}
    </div>
    {rl&&<span style={{fontSize:8.5,color:"var(--red)",background:"var(--red-s)",border:"1px solid var(--red-b)",borderRadius:99,padding:"2px 6px",flexShrink:0,fontWeight:700}}>⏸ RL</span>}
    {(notif?.supported||showIOSInstall)&&<button onClick={handleAlerts} disabled={notif?.perm==="denied"} className={"alerts-btn"+(alertsOn?" enabled":"")} style={{opacity:notif?.perm==="denied"?0.5:1,cursor:notif?.perm==="denied"?"not-allowed":"pointer",flexShrink:0}} title={showIOSInstall?"Tap to see iOS install steps":notif?.perm==="denied"?"Notifications blocked in browser settings":alertsOn?"Click to turn off alerts":"Get notified on every new story"}>
      <span className="hide-xs">{showIOSInstall?t.installForAlerts:alertsLabel}</span>
      <span style={{fontSize:12}} className="only-xs">{showIOSInstall?"📱":"🔔"}</span>
    </button>}
    {showIOSHelp&&<div onClick={()=>setShowIOSHelp(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(8px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"var(--surface)",border:"1px solid var(--border2)",borderRadius:16,padding:22,maxWidth:420,width:"100%"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <div style={{width:36,height:36,borderRadius:9,background:"var(--amber-s)",border:"1px solid var(--amber-b)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>📱</div>
          <div style={{fontFamily:"var(--font-h)",fontSize:15,fontWeight:700,color:"var(--t1)"}}>Enable alerts on iPhone</div>
        </div>
        <p style={{fontSize:12.5,color:"var(--t2)",lineHeight:1.7,marginBottom:14}}>Apple requires installing this site as an app before notifications work. Takes 10 seconds:</p>
        <ol style={{paddingLeft:18,marginBottom:16}}>
          <li style={{fontSize:12,color:"var(--t1)",marginBottom:8,lineHeight:1.6}}>Tap the <b>Share</b> button <span style={{display:"inline-block",padding:"1px 6px",background:"var(--blue-s)",border:"1px solid var(--blue-b)",borderRadius:4,color:"var(--blue)",fontWeight:600}}>⎋</span> at the bottom of Safari</li>
          <li style={{fontSize:12,color:"var(--t1)",marginBottom:8,lineHeight:1.6}}>Scroll and tap <b>"Add to Home Screen"</b></li>
          <li style={{fontSize:12,color:"var(--t1)",marginBottom:8,lineHeight:1.6}}>Tap <b>Add</b> in top right</li>
          <li style={{fontSize:12,color:"var(--t1)",marginBottom:8,lineHeight:1.6}}>Open <b>DTN Mythos</b> from your home screen</li>
          <li style={{fontSize:12,color:"var(--t1)",lineHeight:1.6}}>You'll now see <b>🔔 Enable alerts</b> in the topbar</li>
        </ol>
        <button onClick={()=>setShowIOSHelp(false)} style={{width:"100%",padding:"10px",borderRadius:10,border:"none",background:"var(--grad)",color:"#0B0C10",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"var(--font-b)"}}>Got it</button>
      </div>
    </div>}
    <Btn onClick={onFetch} disabled={fetching||rl} style={{padding:"5px 11px",fontSize:10.5}} variant="ghost">
      <span style={fetching?{display:"inline-block",animation:"spin 1s linear infinite"}:{display:"inline-flex",alignItems:"center"}}>{fetching?<Icon name="refresh" size={13}/>:<Icon name="zap" size={13}/>}</span>
      <span className="hide-xs">{t.fetch}</span>
    </Btn>
    <Btn onClick={()=>setAutoOn(a=>!a)} variant={autoOn?"success":"ghost"} style={{padding:"4px 8px",fontSize:9}}>
      {t.auto}{autoOn?` ↻${countdown}s`:""}
    </Btn>
  </div>);}

function LiveTicker({stories,natScore,stScore,distScore,countdown,autoOn}){
  const approved=[...stories.filter(s=>s.approved)].sort((a,b)=>b.ts-a.ts);
  const[idx,setIdx]=useState(0);
  useEffect(()=>{if(!approved.length)return;const timer=setInterval(()=>setIdx(i=>(i+1)%approved.length),4200);return()=>clearInterval(timer);},[approved.length]);
  const s=approved[idx];const col=s?.direction==="positive"?"var(--green)":s?.severity==="critical"?"var(--red)":"var(--amber)";
  return(<div style={{background:"rgba(3,5,12,0.8)",borderBottom:"1px solid var(--border)",padding:"4px 18px",display:"flex",alignItems:"center",gap:8,overflow:"hidden",flexShrink:0,backdropFilter:"blur(14px)"}}>
    <div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
      <div className="live-dot"/>
      <span style={{fontSize:8,fontWeight:800,color:"var(--red)",letterSpacing:"0.15em",fontFamily:"var(--font-m)"}}>LIVE</span>
    </div>
    {s?(<>
      <span style={{fontFamily:"var(--font-m)",fontSize:8.5,fontWeight:700,color:col,flexShrink:0}}>{(()=>{const v=s.aiScore??s.delta??0;if(Math.abs(v)<0.05)return"±0";return(v>0?"+":"")+v.toFixed(1);})()}</span>
      {s.evidenceLevel&&<span style={{fontSize:8,color:EVIDENCE_LEVELS[s.evidenceLevel]?.color||"var(--t3)",flexShrink:0,fontWeight:700,fontFamily:"var(--font-m)"}}>[{s.evidenceLevel?.replace(/_/g,"-")}]</span>}
      <span style={{fontSize:10.5,color:"var(--t2)",flex:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.headline}</span>
    </>):(<span style={{fontSize:10.5,color:"var(--t3)",flex:1}}>Fetching live constitutional intelligence...</span>)}
    <div style={{display:"flex",gap:8,flexShrink:0,alignItems:"center",borderLeft:"1px solid var(--border)",paddingLeft:9,marginLeft:4}}>
      <span style={{fontSize:8.5,fontFamily:"var(--font-m)",fontWeight:600,color:sColor(natScore),display:"inline-flex",alignItems:"center",gap:3}}><Icon name="globe" size={10}/>{natScore}</span>
      <span style={{fontSize:8.5,fontFamily:"var(--font-m)",fontWeight:600,color:sColor(stScore),display:"inline-flex",alignItems:"center",gap:3}}><Icon name="landmark" size={10}/>{stScore}</span>
      <span style={{fontSize:8.5,fontFamily:"var(--font-m)",fontWeight:600,color:sColor(distScore),display:"inline-flex",alignItems:"center",gap:3}}><Icon name="mapPin" size={10}/>{distScore}</span>
    </div>
  </div>);}


// ── DASHBOARD ──────────────────────────────────────────────────
function Dashboard({natScore,stScore,distScore,stories,natHistory,fState,fDist,t,mode,setPage,setFScope,latestFive}){
  const approved=stories.filter(s=>s.approved);
  const sorted=[...approved].sort((a,b)=>b.ts-a.ts);
  const topStory=sorted[0];
  const gridStories=sorted.slice(1,10);
  const band=scoreBand(natScore,t);
  const stBand=scoreBand(stScore,t);
  const distBand=scoreBand(distScore,t);
  const critCount=approved.filter(s=>s.severity==="critical").length;
  const posCount=approved.filter(s=>s.direction==="positive").length;

  if(!approved.length){
    return(<div className="fade-up" style={{textAlign:"center",padding:"60px 20px"}}>
      <div style={{fontSize:48,marginBottom:16,display:"flex",justifyContent:"center"}}><Icon name="zap" size={48} color="var(--accent)" strokeWidth={1.5}/></div>
      <h1 style={{fontFamily:"var(--font-h)",fontSize:28,fontWeight:700,marginBottom:10,letterSpacing:"-0.01em"}}>{t.appSub}</h1>
      <p style={{fontSize:14,color:"var(--t2)",marginBottom:22,maxWidth:480,margin:"0 auto 22px"}}>{t.tapFetch}</p>
      <button onClick={()=>setPage("newsroom")} className="bb-btn primary" style={{padding:"10px 20px",fontSize:13}}>{t.fetchLive}</button>
    </div>);
  }

  return(<div className="fade-up">
    {/* Hero section: top story + side panel */}
    <div className="hero-grid">
      <div>
        {topStory&&<StoryCardBB s={topStory} t={t} hero/>}
        {topStory&&sorted.length>1&&<div className="related">
          <div className="related-title">{t.relatedStories}</div>
          {sorted.slice(1,4).map(s=>(<button key={s.id} className="related-item" onClick={()=>setPage("newsroom")}>{s.headline}</button>))}
        </div>}
      </div>

      <aside className="side-panel">
        <div className="side-block">
          <h3 className="side-title">{t.indiaDemocracy}</h3>
          <ScoreRowMini score={natScore} label={t.national} desc={band.label}/>
          <ScoreRowMini score={stScore} label={fState||t.state} desc={stBand.label}/>
          <ScoreRowMini score={distScore} label={fDist||t.district} desc={distBand.label}/>
          <div style={{fontSize:10.5,color:"var(--t3)",marginTop:10,paddingTop:10,borderTop:"1px solid var(--border)",lineHeight:1.5}}>
            Calibrated: Freedom House · V-Dem · RSF · EIU
          </div>
        </div>

        <div className="side-block">
          <h3 className="side-title">{t.latestLabel}</h3>
          {latestFive?.length>0?latestFive.map(s=>(<LatestItem key={s.id} s={s} onClick={()=>setPage("newsroom")}/>)):<div style={{fontSize:12,color:"var(--t3)",padding:"6px 0"}}>No stories yet</div>}
        </div>

        <div className="side-block">
          <h3 className="side-title">{t.snapshot}</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><div style={{fontFamily:"var(--font-m)",fontSize:22,fontWeight:700,color:"var(--t1)"}}>{approved.length}</div><div style={{fontSize:10,color:"var(--t2)",textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:600}}>{t.tracked}</div></div>
            <div><div style={{fontFamily:"var(--font-m)",fontSize:22,fontWeight:700,color:"var(--red-t)"}}>{critCount}</div><div style={{fontSize:10,color:"var(--t2)",textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:600}}>{t.labelCritical}</div></div>
            <div><div style={{fontFamily:"var(--font-m)",fontSize:22,fontWeight:700,color:"var(--green-t)"}}>{posCount}</div><div style={{fontSize:10,color:"var(--t2)",textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:600}}>{t.supportsCount}</div></div>
            <div><div style={{fontFamily:"var(--font-m)",fontSize:22,fontWeight:700,color:"var(--amber-t)"}}>{approved.filter(s=>s.courtStatus==="pending").length}</div><div style={{fontSize:10,color:"var(--t2)",textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:600}}>{t.courtPendingLabel}</div></div>
          </div>
        </div>
      </aside>
    </div>

    {/* Story grid */}
    {gridStories.length>0&&<div className="grid-section">
      <div className="grid-section-head">
        <h2 className="grid-title">{t.constitutionalStories}</h2>
        <span className="grid-sub">{gridStories.length} {t.storiesSuffix} · {t.updated} {new Date(sorted[0].ts).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}</span>
      </div>
      <div className="story-grid">
        {gridStories.map(s=>(<StoryCardBB key={s.id} s={s} t={t} onSelect={()=>setPage("newsroom")}/>))}
      </div>
    </div>}
  </div>);}

// ── NEWSROOM (Main Intelligence Feed) ──────────────────────────
function NewsroomPage({stories,fetching,onFetch,onAI,autoOn,countdown,t,mode,fState,natScore,stScore,distScore}){
  const[filter,setFilter]=useState("all");
  const[selStory,setSelStory]=useState(null);
  const sorted=[...stories.filter(s=>s.approved)].sort((a,b)=>b.ts-a.ts);
  const filtered=filter==="all"?sorted
    :filter==="critical"?sorted.filter(s=>s.severity==="critical")
    :filter==="positive"?sorted.filter(s=>s.direction==="positive")
    :filter==="court"?sorted.filter(s=>s.courtStatus&&s.courtStatus!=="none")
    :filter==="unresolved"?sorted.filter(s=>s.courtStatus==="pending")
    :STORY_TYPES.includes(filter)?sorted.filter(s=>s.storyType===filter)
    :sorted.filter(s=>s.scope===filter);

  const topStory=filtered[0];
  const gridStories=filtered.slice(1);
  const critCount=sorted.filter(s=>s.severity==="critical").length;
  const posCount=sorted.filter(s=>s.direction==="positive").length;
  const courtActive=sorted.filter(s=>s.courtStatus&&s.courtStatus!=="none").length;

  return(<div className="fade-up">
    {/* Header with live indicator and AI button */}
    <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:18,flexWrap:"wrap",gap:10}}>
      <div>
        <div style={{fontSize:11,color:"var(--red)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6,display:"flex",alignItems:"center",gap:6,fontFamily:"var(--font-b)"}}>
          <span className="live-dot"/>{t.newsroom}
        </div>
        <h1 style={{fontFamily:"var(--font-h)",fontSize:"clamp(24px,3vw,32px)",fontWeight:700,letterSpacing:"-0.015em",lineHeight:1.1}}>{t.constJournalism}</h1>
        <p style={{fontSize:13,color:"var(--t2)",marginTop:6,maxWidth:560}}>{t.constJournalismSub}</p>
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{fontSize:11.5,color:"var(--t2)",fontFamily:"var(--font-b)"}}>
          <span className="num" style={{color:"var(--t1)",fontWeight:700}}>{sorted.length}</span> {t.storiesSuffix} · <span className="num" style={{color:"var(--red-t)",fontWeight:700}}>{critCount}</span> {t.labelCritical.toLowerCase()} · <span className="num" style={{color:"var(--green-t)",fontWeight:700}}>{posCount}</span> {t.labelSupport.toLowerCase()}
        </div>
        <button onClick={onAI} className="bb-btn" style={{background:"var(--purple-s)",color:"var(--purple-t)",borderColor:"var(--purple-b)"}}>✦ {t.aiEnrichAll}</button>
      </div>
    </div>

    {/* Filter chips */}
    <div className="filter-row">
      {[{k:"all",l:t.filterAll},{k:"critical",l:t.labelCritical},{k:"positive",l:t.labelSupport},{k:"national",l:t.national},{k:"state",l:t.state},{k:"local",l:(t.district||"Local")},{k:"court",l:t.filterCourt},{k:"unresolved",l:t.filterUnresolved}].map(f=>(
        <button key={f.k} onClick={()=>setFilter(f.k)} className={"filter-chip"+(filter===f.k?" active":"")}>{f.l}</button>
      ))}
      {STORY_TYPES.slice(0,6).map(f=>(
        <button key={f} onClick={()=>setFilter(f)} className={"filter-chip"+(filter===f?" active":"")}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
      ))}
    </div>

    {/* Empty state */}
    {filtered.length===0&&<div style={{textAlign:"center",padding:"60px 20px"}}>
      <div style={{fontSize:42,marginBottom:14,display:"flex",justifyContent:"center"}}><Icon name="zap" size={42} color="var(--accent)" strokeWidth={1.5}/></div>
      <h3 style={{fontFamily:"var(--font-h)",fontSize:20,fontWeight:700,marginBottom:8}}>{t.noStories||"No stories yet"}</h3>
      <p style={{fontSize:13,color:"var(--t2)",marginBottom:18}}>{t.tapFetch}</p>
      <button onClick={onFetch} className="bb-btn primary" style={{padding:"9px 18px"}}>{t.fetchLive||"Fetch Live News"}</button>
    </div>}

    {/* Hero + side layout for top story */}
    {topStory&&<div className="hero-grid">
      <div>
        <StoryCardBB s={topStory} t={t} hero onSelect={s=>setSelStory(s)}/>
      </div>
      <aside className="side-panel">
        <div className="side-block">
          <h3 className="side-title">Latest</h3>
          {filtered.slice(1,8).map(s=>(<LatestItem key={s.id} s={s} onClick={setSelStory}/>))}
        </div>
        {autoOn&&<div className="side-block" style={{background:"var(--green-s)",borderLeft:"3px solid var(--green)"}}>
          <div style={{fontSize:10.5,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--green-t)",marginBottom:4}}>{t.autoFetchActive}</div>
          <div style={{fontSize:12,color:"var(--t1)",fontFamily:"var(--font-b)"}}>{t.nextUpdate} <span className="num" style={{fontWeight:700}}>{countdown}s</span></div>
        </div>}
      </aside>
    </div>}

    {/* Story grid */}
    {gridStories.length>0&&<div className="grid-section">
      <div className="grid-section-head">
        <h2 className="grid-title">{filter==="all"?t.moreStories:filter.charAt(0).toUpperCase()+filter.slice(1)}</h2>
        <span className="grid-sub">{gridStories.length} {t.storiesSuffix}</span>
      </div>
      <div className="story-grid">
        {gridStories.map(s=>(<StoryCardBB key={s.id} s={s} t={t} onSelect={setSelStory}/>))}
      </div>
    </div>}

    {/* Story detail modal */}
    {selStory&&(<div style={{position:"fixed",inset:0,zIndex:500,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",padding:"16px",overflow:"auto"}} onClick={()=>setSelStory(null)}>
      <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:720,maxHeight:"90vh",overflowY:"auto",background:"#fff",border:"1px solid var(--border)",borderRadius:2,padding:"24px"}}>
        {selStory.image&&<img src={selStory.image} alt="" style={{width:"100%",aspectRatio:"16/9",objectFit:"cover",borderRadius:2,marginBottom:16}} onError={e=>{e.target.style.display="none";}}/>}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,marginBottom:12}}>
          <div style={{flex:1,minWidth:0}}>
            <div className="badge-row">
              <span className={"bb-badge "+storyLabel(selStory,t).cls}>{storyLabel(selStory,t).label}</span>
              {selStory.institution&&DEPT[selStory.institution]&&<span className="bb-badge dept">{DEPT[selStory.institution].icon} {DEPT[selStory.institution].name}</span>}
              {EVIDENCE_LEVELS[selStory.evidenceLevel||"single_source"]&&<span className="bb-badge warning">{EVIDENCE_LEVELS[selStory.evidenceLevel||"single_source"].label}</span>}
              {selStory.courtStatus&&selStory.courtStatus!=="none"&&<span className="bb-badge info">{COURT_STATUSES[selStory.courtStatus]?.label}</span>}
              {selStory.aiDone&&<span className="bb-badge purple">✦ AI</span>}
            </div>
            <h2 style={{fontFamily:"var(--font-h)",fontSize:"clamp(19px,2vw,24px)",fontWeight:700,color:"var(--t1)",lineHeight:1.15,marginBottom:8,letterSpacing:"-0.01em"}}>{selStory.headline}</h2>
            <div style={{fontSize:11.5,color:"var(--t3)",fontFamily:"var(--font-b)"}}>{new Date(selStory.ts).toLocaleString("en-IN")}</div>
          </div>
          <button onClick={()=>setSelStory(null)} style={{background:"transparent",border:"none",color:"var(--t2)",cursor:"pointer",fontSize:24,lineHeight:1,padding:4}}>✕</button>
        </div>
        {selStory.citizenExplanation&&(<div style={{padding:"14px 16px",background:"var(--bg-soft)",borderLeft:"3px solid var(--blue)",marginBottom:14}}>
          <div style={{fontSize:10.5,color:"var(--blue-t)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>{t.citizenWhy||"Why it matters"}</div>
          <p style={{fontSize:14,color:"var(--t1)",lineHeight:1.7,margin:0,fontFamily:"var(--font-h)"}}>{selStory.citizenExplanation}</p>
        </div>)}
        <div style={{marginBottom:14}}><ImpactBar story={selStory} t={t}/></div>
        <div style={{marginBottom:14}}><ConstitutionPanel violations={selStory.violations} supports={selStory.supports} t={t}/></div>
        {selStory.govResponse&&(<div style={{padding:"12px 14px",background:"var(--bg-soft)",marginBottom:14,borderLeft:"3px solid var(--amber)"}}>
          <div style={{fontSize:10.5,color:"var(--amber-t)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>{t.govResponse||"Government Response"}</div>
          <p style={{fontSize:13,color:"var(--t1)",margin:0,lineHeight:1.65}}>{selStory.govResponse}</p>
        </div>)}
        {selStory.mythos&&<div style={{padding:"14px 16px",background:"var(--purple-s)",borderLeft:"3px solid var(--purple)",marginBottom:14}}>
          <p style={{fontSize:14,color:"var(--purple-t)",fontStyle:"italic",lineHeight:1.7,margin:0,fontFamily:"var(--font-h)"}}>{selStory.mythos}</p>
        </div>}
        {selStory.link&&<a href={selStory.link} target="_blank" rel="noopener noreferrer" className="bb-btn primary" style={{textDecoration:"none",padding:"9px 16px"}}>{t.readOriginal} →</a>}
      </div>
    </div>)}
  </div>);}


// ── CONSTITUTION TRACKER ───────────────────────────────────────
function ConstitutionTrackerPage({stories,t,mode}){
  const[selArt,setSelArt]=useState(null);
  const approved=stories.filter(s=>s.approved);
  // Count how many times each article appears
  const artCounts={};const artViol={};const artSupp={};
  approved.forEach(s=>{[...(s.violations||[]),...(s.supports||[])].forEach(v=>{artCounts[v.a]=(artCounts[v.a]||0)+1;});(s.violations||[]).forEach(v=>{artViol[v.a]=(artViol[v.a]||0)+1;});(s.supports||[]).forEach(v=>{artSupp[v.a]=(artSupp[v.a]||0)+1;});});
  const sortedArts=Object.entries(CA).sort(([a],[b])=>(artCounts[b]||0)-(artCounts[a]||0));
  const selStories=selArt?approved.filter(s=>[...(s.violations||[]),...(s.supports||[])].some(v=>v.a===selArt)):[];
  return(<div className="fade-up">
    <div style={{marginBottom:18}}><div style={{fontSize:8.5,color:"var(--t3)",textTransform:"uppercase",letterSpacing:"0.14em",fontWeight:700,marginBottom:4}}>Live Constitutional Mapping</div><h2 style={{fontFamily:"var(--font-h)",fontSize:"clamp(16px,3vw,21px)",fontWeight:800,color:"var(--t1)"}}>📜 {t.tracker||"Constitution Tracker"}</h2><p style={{fontSize:11,color:"var(--t2)",marginTop:3}}>Which constitutional articles are most affected by current news — live</p></div>
    {selArt&&(<Card style={{marginBottom:14,border:"1px solid "+(CA[selArt]?.c||"var(--blue)")+"33"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <div>
          <Tag color={CA[selArt]?.c||"var(--blue)"}>{selArt}</Tag>
          <h3 style={{fontFamily:"var(--font-h)",fontSize:15,fontWeight:700,color:"var(--t1)",marginTop:6,marginBottom:4}}>{CA[selArt]?.t||selArt}</h3>
          <div style={{display:"flex",gap:8}}>
            {artViol[selArt]>0&&<span style={{fontSize:9.5,color:"var(--red)",background:"var(--red-s)",border:"1px solid var(--red-b)",borderRadius:4,padding:"1px 7px",fontWeight:700}}>⚠ {artViol[selArt]} violations</span>}
            {artSupp[selArt]>0&&<span style={{fontSize:9.5,color:"var(--green)",background:"var(--green-s)",border:"1px solid var(--green-b)",borderRadius:4,padding:"1px 7px",fontWeight:700}}>✓ {artSupp[selArt]} supports</span>}
          </div>
        </div>
        <button onClick={()=>setSelArt(null)} style={{background:"transparent",border:"none",color:"var(--t2)",cursor:"pointer",fontSize:18}}>✕</button>
      </div>
      {selStories.slice(0,3).map(s=><StoryCard key={s.id} s={s} t={t} mode={mode} compact/>)}
    </Card>)}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(148px,1fr))",gap:8}}>
      {sortedArts.map(([k,v])=>{const cnt=artCounts[k]||0;const viol=artViol[k]||0;const supp=artSupp[k]||0;const heat=Math.min(1,cnt/Math.max(1,Math.max(...Object.values(artCounts))));return(
        <div key={k} onClick={()=>setSelArt(k===selArt?null:k)} style={{padding:"12px 13px",background:selArt===k?v.c+"0D":"var(--surface)",border:"2px solid "+(selArt===k?v.c+"55":"var(--border)"),borderRadius:11,cursor:"pointer",transition:"all 0.18s",boxShadow:selArt===k?`0 0 0 1px ${v.c}22`:"none"}}>
          <Tag color={v.c} sm>{k}</Tag>
          <div style={{fontSize:10,color:"var(--t1)",fontWeight:600,marginTop:5,marginBottom:7,lineHeight:1.35}}>{v.t}</div>
          {cnt>0?(<>
            <div style={{height:3,background:"rgba(255,255,255,0.06)",borderRadius:99,overflow:"hidden",marginBottom:5}}>
              <div style={{height:"100%",background:viol>supp?"var(--red)":"var(--green)",borderRadius:99,width:(heat*100)+"%"}}/>
            </div>
            <div style={{display:"flex",gap:5}}>
              {viol>0&&<span style={{fontSize:8,color:"var(--red)",fontWeight:700}}>⚠{viol}</span>}
              {supp>0&&<span style={{fontSize:8,color:"var(--green)",fontWeight:700}}>✓{supp}</span>}
            </div>
          </>):<div style={{fontSize:8.5,color:"var(--t3)"}}>No active stories</div>}
        </div>
      );})}
    </div>
  </div>);}

// ── DEMOCRACY SCORE DASHBOARD ──────────────────────────────────
function DemoScorePage({natScore,stScore,distScore,stories,natHistory,fState,fDist,t}){
  const approved=stories.filter(s=>s.approved);
  const pillarData=Object.entries(PILLARS).map(([k,p])=>{const rel=approved.filter(s=>s.pillar===k);const delta=rel.reduce((a,s)=>a+calcStoryEffect(s,"national",fState),0);const score=Math.max(0,Math.min(100,Math.round(p.base+delta)));return{subject:p.label,score,color:p.color,base:p.base,delta:Math.round(delta)};});
  return(<div className="fade-up">
    <div style={{marginBottom:16}}><h2 style={{fontFamily:"var(--font-h)",fontSize:"clamp(16px,3vw,21px)",fontWeight:800,color:"var(--t1)"}}>{t.demoScore||"Democracy Score"}</h2></div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9,marginBottom:13}}>
      {[["🌐 "+t.national,natScore],["🏛 "+fState,stScore],["📍 "+(fDist||t.district),distScore]].map(([l,v])=>(
        <Card key={l} style={{textAlign:"center",padding:"14px 11px"}}>
          <div style={{fontSize:8.5,color:"var(--t3)",fontWeight:700,textTransform:"uppercase",marginBottom:7,letterSpacing:"0.09em"}}>{l}</div>
          <div style={{display:"flex",justifyContent:"center",marginBottom:6}}><ScoreRing score={v} size={62}/></div>
          <div style={{fontSize:9,fontWeight:700,color:sColor(v)}}>{t[sLabelK(v)]}</div>
          <div style={{fontSize:8,color:"var(--t3)",marginTop:3}}>{scoreBand(v).label}</div>
        </Card>
      ))}
    </div>
    {/* Score bands explanation */}
    <Card style={{marginBottom:13,padding:"13px 15px"}}>
      <STitle>Score Bands</STitle>
      {[{min:80,max:100,label:"Strong Constitutional Support",color:"#0FD47C"},{min:65,max:79,label:"Mostly Stable",color:"#0FD47C"},{min:50,max:64,label:"Mixed Democratic Health",color:"#F5A623"},{min:35,max:49,label:"Significant Constitutional Concerns",color:"#f97316"},{min:0,max:34,label:"Severe Democratic Stress",color:"#F04A5A"}].map(b=>(
        <div key={b.min} style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
          <div style={{width:5,height:5,borderRadius:"50%",background:b.color,flexShrink:0}}/>
          <span style={{fontSize:9.5,color:"var(--t2)",width:60,fontFamily:"var(--font-m)",flexShrink:0}}>{b.min}–{b.max}</span>
          <span style={{fontSize:10,color:b.color,fontWeight:600}}>{b.label}</span>
        </div>
      ))}
    </Card>
    {pillarData.map(p=>(<Card key={p.subject} style={{marginBottom:7,padding:"11px 15px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
        <span style={{fontSize:12,color:"var(--t1)",fontWeight:600}}>{p.subject}</span>
        <div style={{display:"flex",gap:7,alignItems:"center"}}>
          <span style={{fontSize:8.5,color:"var(--t3)"}}>base {p.base}</span>
          <span style={{fontFamily:"var(--font-m)",fontSize:13,fontWeight:800,color:p.color,letterSpacing:"-0.03em"}}>{p.score}</span>
          <span style={{fontSize:9.5,color:p.delta>=0?"var(--green)":"var(--red)",fontWeight:700}}>{p.delta>=0?"+":""}{p.delta}</span>
        </div>
      </div>
      <div style={{height:4,background:"rgba(255,255,255,0.04)",borderRadius:99,overflow:"hidden"}}>
        <div style={{height:"100%",borderRadius:99,background:p.color,width:p.score+"%",transition:"width 1.3s ease",boxShadow:`0 0 7px ${p.color}55`}}/>
      </div>
    </Card>))}
  </div>);}

// ── DEPARTMENTS PAGE (16 depts) ────────────────────────────────
function DepartmentsPage({stories,t,mode}){
  const[sel,setSel]=useState(null);
  const approved=stories.filter(s=>s.approved);
  const selDept=sel?DEPT[sel]:null;
  const selStories=sel?approved.filter(s=>s.institution===sel):[];
  const allViol=selStories.flatMap(s=>s.violations||[]);
  const allSupp=selStories.flatMap(s=>s.supports||[]);
  const vC={},sC={};allViol.forEach(v=>{vC[v.a]=(vC[v.a]||0)+1;});allSupp.forEach(v=>{sC[v.a]=(sC[v.a]||0)+1;});
  return(<div className="fade-up">
    <div style={{marginBottom:16}}><div style={{fontSize:8.5,color:"var(--t3)",textTransform:"uppercase",letterSpacing:"0.14em",fontWeight:700,marginBottom:4}}>16 Institutions · Live Constitutional Scoring</div><h2 style={{fontFamily:"var(--font-h)",fontSize:"clamp(16px,3vw,21px)",fontWeight:800,color:"var(--t1)"}}>{t.departments}</h2><p style={{fontSize:11,color:"var(--t2)",marginTop:3}}>Click any institution to see constitutional violations, supports & score explanation</p></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(145px,1fr))",gap:8,marginBottom:16}}>
      {Object.values(DEPT).map(dept=>{
        const ds=calcDept(approved,dept.id);const dStories=approved.filter(s=>s.institution===dept.id);
        const dViol=dStories.reduce((a,s)=>a+(s.violations||[]).length,0);const dSupp=dStories.reduce((a,s)=>a+(s.supports||[]).length,0);const isSel=sel===dept.id;
        return(<div key={dept.id} onClick={()=>setSel(dept.id===sel?null:dept.id)} style={{padding:"13px",background:isSel?dept.color+"0D":"var(--surface)",border:"2px solid "+(isSel?dept.color:"var(--border)"),borderRadius:12,cursor:"pointer",transition:"all 0.18s",boxShadow:isSel?`0 0 0 1px ${dept.color}28, 0 6px 22px ${dept.color}14`:"none"}}>
          <div style={{fontSize:21,marginBottom:6}}>{dept.icon}</div>
          <div style={{fontSize:10.5,fontWeight:700,color:"var(--t1)",marginBottom:4,lineHeight:1.3}}>{dept.name}</div>
          <div style={{fontFamily:"var(--font-m)",fontSize:19,fontWeight:800,color:sColor(ds),marginBottom:5,letterSpacing:"-0.03em"}}>{ds}</div>
          <div style={{height:3,background:"rgba(255,255,255,0.05)",borderRadius:99,overflow:"hidden",marginBottom:6}}>
            <div style={{height:"100%",background:dept.color,borderRadius:99,width:ds+"%",transition:"width 1.2s ease"}}/>
          </div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            {dViol>0&&<span style={{fontSize:8.5,color:"var(--red)",background:"var(--red-s)",border:"1px solid var(--red-b)",borderRadius:4,padding:"1px 5px",fontWeight:700}}>⚠{dViol}</span>}
            {dSupp>0&&<span style={{fontSize:8.5,color:"var(--green)",background:"var(--green-s)",border:"1px solid var(--green-b)",borderRadius:4,padding:"1px 5px",fontWeight:700}}>✓{dSupp}</span>}
            {dStories.length===0&&<span style={{fontSize:8.5,color:"var(--t3)"}}>base {dept.base}</span>}
          </div>
        </div>);})}
    </div>
    {selDept&&(<Card style={{padding:"18px 20px"}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:14}}>
        <div style={{width:42,height:42,borderRadius:11,background:selDept.color+"14",border:"1px solid "+selDept.color+"28",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{selDept.icon}</div>
        <div style={{flex:1}}>
          <h3 style={{fontFamily:"var(--font-h)",fontSize:15,fontWeight:800,color:"var(--t1)",marginBottom:3}}>{selDept.name}</h3>
          <p style={{fontSize:10.5,color:"var(--t2)",marginBottom:7,lineHeight:1.5}}>{selDept.desc}</p>
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{selDept.articles.map(a=><Tag key={a} color={CA[a]?.c||selDept.color} sm>{a}</Tag>)}</div>
        </div>
        <ScoreRing score={calcDept(approved,sel)} size={60}/>
      </div>
      {Object.keys(vC).length>0&&(<div style={{marginBottom:13}}>
        <STitle>⚠ {t.constitutionViolations} — Frequency</STitle>
        {Object.entries(vC).sort((a,b)=>b[1]-a[1]).map(([art,cnt])=>{const max=Math.max(...Object.values(vC));return(<div key={art} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,padding:"7px 10px",background:"rgba(240,74,90,0.03)",border:"1px solid rgba(240,74,90,0.1)",borderRadius:8}}>
          <Tag color={CA[art]?.c||"var(--red)"} sm>{art}</Tag>
          <div style={{flex:1,minWidth:0}}><div style={{fontSize:10,color:"var(--t1)",fontWeight:600}}>{CA[art]?.t||art}</div></div>
          <div style={{width:75,height:4,background:"rgba(255,255,255,0.05)",borderRadius:99,overflow:"hidden",flexShrink:0}}><div style={{height:"100%",background:"var(--red)",borderRadius:99,width:(cnt/max*100)+"%",boxShadow:"0 0 7px rgba(240,74,90,0.5)"}}/></div>
          <span style={{fontSize:9.5,fontFamily:"var(--font-m)",color:"var(--red)",width:20,textAlign:"right",fontWeight:700}}>{cnt}×</span>
        </div>);})}
      </div>)}
      {Object.keys(sC).length>0&&(<div style={{marginBottom:13}}>
        <STitle>✓ {t.constitutionSupports} — Frequency</STitle>
        {Object.entries(sC).sort((a,b)=>b[1]-a[1]).map(([art,cnt])=>{const max=Math.max(...Object.values(sC));return(<div key={art} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,padding:"7px 10px",background:"rgba(15,212,124,0.03)",border:"1px solid rgba(15,212,124,0.1)",borderRadius:8}}>
          <Tag color="var(--green)" sm>{art}</Tag>
          <div style={{flex:1,minWidth:0}}><div style={{fontSize:10,color:"var(--t1)",fontWeight:600}}>{CA[art]?.t||art}</div></div>
          <div style={{width:75,height:4,background:"rgba(255,255,255,0.05)",borderRadius:99,overflow:"hidden",flexShrink:0}}><div style={{height:"100%",background:"var(--green)",borderRadius:99,width:(cnt/max*100)+"%",boxShadow:"0 0 7px rgba(15,212,124,0.4)"}}/></div>
          <span style={{fontSize:9.5,fontFamily:"var(--font-m)",color:"var(--green)",width:20,textAlign:"right",fontWeight:700}}>{cnt}×</span>
        </div>);})}
      </div>)}
      {selStories.length>0?(<><STitle>Recent Stories ({selStories.length})</STitle>{selStories.slice(0,4).map(s=><StoryCard key={s.id} s={s} t={t} mode={mode} compact/>)}</>):(<div style={{textAlign:"center",padding:"22px",color:"var(--t3)",fontSize:11}}>No stories yet — fetch news to populate this department</div>)}
    </Card>)}
  </div>);}


// ── JOURNALIST CONSOLE ─────────────────────────────────────────
function JournalistConsolePage({stories,t,onAI,fetching,onFetch}){
  const approved=stories.filter(s=>s.approved);
  // Evidence distribution
  const evDist={};Object.keys(EVIDENCE_LEVELS).forEach(k=>{evDist[k]=approved.filter(s=>s.evidenceLevel===k).length;});
  // Stories needing AI upgrade
  const needsAI=approved.filter(s=>!s.aiDone);
  // Story type distribution
  const typeDist={};STORY_TYPES.forEach(k=>{typeDist[k]=approved.filter(s=>s.storyType===k).length;});
  // Court active
  const courtActive=approved.filter(s=>s.courtStatus&&s.courtStatus!=="none");
  return(<div className="fade-up">
    <div style={{marginBottom:16}}><div style={{fontSize:8.5,color:"var(--t3)",textTransform:"uppercase",letterSpacing:"0.14em",fontWeight:700,marginBottom:4}}>Journalist Intelligence Console</div><h2 style={{fontFamily:"var(--font-h)",fontSize:"clamp(16px,3vw,21px)",fontWeight:800,color:"var(--t1)"}}>{t.journalist||"Journalist Console"}</h2><p style={{fontSize:11,color:"var(--t2)",marginTop:3}}>Source analysis · Evidence chains · Confidence vectors · Story clustering</p></div>
    {/* Evidence distribution */}
    <Card style={{marginBottom:12}}>
      <STitle>Evidence Level Distribution</STitle>
      {Object.entries(EVIDENCE_LEVELS).map(([k,ev])=>{const cnt=evDist[k]||0;const max=Math.max(1,...Object.values(evDist));return(
        <div key={k} style={{display:"flex",alignItems:"center",gap:9,marginBottom:7}}>
          <span style={{fontSize:8.5,color:ev.color,width:100,flexShrink:0,fontWeight:700,fontFamily:"var(--font-m)"}}>{ev.label}</span>
          <div style={{flex:1,height:5,background:"rgba(255,255,255,0.04)",borderRadius:99,overflow:"hidden"}}>
            <div style={{height:"100%",background:ev.color,borderRadius:99,width:(cnt/max*100)+"%",boxShadow:`0 0 8px ${ev.color}55`}}/>
          </div>
          <span style={{fontSize:9.5,fontFamily:"var(--font-m)",color:ev.color,width:18,textAlign:"right"}}>{cnt}</span>
          <span style={{fontSize:8.5,color:"var(--t3)",width:30}}>{Math.round(ev.weight*100)}% wt</span>
        </div>
      );})}
    </Card>
    {/* Story type distribution */}
    <Card style={{marginBottom:12}}>
      <STitle>Story Type Distribution</STitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7}}>
        {STORY_TYPES.map(k=>(<div key={k} style={{textAlign:"center",padding:"8px 6px",background:"var(--surface2)",borderRadius:8}}>
          <div style={{fontFamily:"var(--font-m)",fontSize:16,fontWeight:800,color:"var(--t1)"}}>{typeDist[k]||0}</div>
          <div style={{fontSize:8.5,color:"var(--t2)",marginTop:2,textTransform:"capitalize"}}>{t.storyTypes?.[k]||k}</div>
        </div>))}
      </div>
    </Card>
    {/* AI upgrade queue */}
    <Card style={{marginBottom:12}}>
      <STitle action={<Btn onClick={()=>onAI()} variant="purple" style={{fontSize:9,padding:"3px 9px"}} disabled={!needsAI.length}>✦ AI Upgrade All ({needsAI.length})</Btn>}>AI Verification Queue</STitle>
      {needsAI.length===0?(<div style={{textAlign:"center",padding:"14px",color:"var(--green)",fontSize:11}}>✓ All stories AI-verified</div>):(needsAI.slice(0,5).map(s=>(<div key={s.id} style={{padding:"8px 10px",borderRadius:8,background:"rgba(155,125,255,0.04)",border:"1px solid rgba(155,125,255,0.1)",marginBottom:5}}>
        <div style={{fontSize:11,color:"var(--t1)",marginBottom:3}}>{s.headline.slice(0,80)}...</div>
        <div style={{display:"flex",gap:5}}><EvidenceBadge level={s.evidenceLevel} t={t}/><ConfidenceBadge confidence={s.confidence} t={t}/></div>
      </div>)))}
    </Card>
    {/* Court active cases */}
    {courtActive.length>0&&(<Card style={{marginBottom:12}}>
      <STitle>Court Active Stories ({courtActive.length})</STitle>
      {courtActive.slice(0,5).map(s=>(<div key={s.id} style={{padding:"8px 10px",borderRadius:8,background:"rgba(245,166,35,0.04)",border:"1px solid rgba(245,166,35,0.1)",marginBottom:5}}>
        <div style={{display:"flex",gap:5,marginBottom:4}}><CourtBadge status={s.courtStatus}/><EvidenceBadge level={s.evidenceLevel} t={t}/></div>
        <div style={{fontSize:11,color:"var(--t1)"}}>{s.headline.slice(0,80)}...</div>
      </div>))}
    </Card>)}
    {/* Dept story breakdown */}
    <Card>
      <STitle>Department Story Distribution</STitle>
      <div style={{display:"flex",flexDirection:"column",gap:5}}>
        {Object.values(DEPT).map(dept=>{const cnt=approved.filter(s=>s.institution===dept.id).length;const viol=approved.filter(s=>s.institution===dept.id).reduce((a,s)=>a+(s.violations||[]).length,0);const supp=approved.filter(s=>s.institution===dept.id).reduce((a,s)=>a+(s.supports||[]).length,0);return(<div key={dept.id} style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:14,width:20,flexShrink:0}}>{dept.icon}</span>
          <span style={{fontSize:10,color:"var(--t2)",flex:1,fontWeight:500}}>{dept.name}</span>
          <span style={{fontFamily:"var(--font-m)",fontSize:10,fontWeight:700,color:"var(--t1)",width:18,textAlign:"right"}}>{cnt}</span>
          {viol>0&&<span style={{fontSize:8.5,color:"var(--red)",fontWeight:700}}>⚠{viol}</span>}
          {supp>0&&<span style={{fontSize:8.5,color:"var(--green)",fontWeight:700}}>✓{supp}</span>}
        </div>);})}
      </div>
    </Card>
  </div>);}

// ── REMAINING PAGES ────────────────────────────────────────────
function StatesPage({stories,t}){
  const approved=stories.filter(s=>s.approved);
  const stateScores=Object.entries(STATE_BASELINES).map(([st])=>({state:st,score:calcScope(approved,"state",st)})).sort((a,b)=>b.score-a.score);
  return(<div className="fade-up">
    <div style={{marginBottom:16}}><h2 style={{fontFamily:"var(--font-h)",fontSize:"clamp(16px,3vw,21px)",fontWeight:800,color:"var(--t1)"}}>{t.states}</h2></div>
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      {stateScores.map((item,i)=>{const col=sColor(item.score);const stViol=approved.filter(s=>s.state===item.state).reduce((a,s)=>a+(s.violations||[]).length,0);const stSupp=approved.filter(s=>s.state===item.state).reduce((a,s)=>a+(s.supports||[]).length,0);return(
        <div key={item.state} style={{display:"flex",alignItems:"center",gap:9,padding:"10px 14px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:10}}>
          <span style={{fontFamily:"var(--font-m)",fontSize:9.5,color:"var(--t3)",width:22,flexShrink:0,fontWeight:600}}>{i+1}</span>
          <span style={{flex:1,fontSize:11.5,fontWeight:600,color:"var(--t1)"}}>{item.state}</span>
          {stViol>0&&<span style={{fontSize:8.5,color:"var(--red)",background:"var(--red-s)",border:"1px solid var(--red-b)",borderRadius:99,padding:"1px 5px",fontWeight:700}}>⚠{stViol}</span>}
          {stSupp>0&&<span style={{fontSize:8.5,color:"var(--green)",background:"var(--green-s)",border:"1px solid var(--green-b)",borderRadius:99,padding:"1px 5px",fontWeight:700}}>✓{stSupp}</span>}
          <div style={{width:60,height:4,background:"rgba(255,255,255,0.05)",borderRadius:99,overflow:"hidden",flexShrink:0}}><div style={{height:"100%",borderRadius:99,background:col,width:item.score+"%",boxShadow:`0 0 5px ${col}77`}}/></div>
          <span style={{fontFamily:"var(--font-m)",fontSize:11.5,fontWeight:800,color:col,width:24,textAlign:"right",flexShrink:0,letterSpacing:"-0.03em"}}>{item.score}</span>
        </div>);})}
    </div>
  </div>);}

const OCC={Journalist:{rights:["Art.19(1)(a)","Art.21","Art.22"],threats:["UAPA/BNS-152 arrest","Criminal defamation","Physical attacks — 3 killed 2024-25","IT Rules censorship"],actions:["Document arrest immediately — date, time, officer name","Contact press freedom bodies within 24 hours","Preserve all evidence including digital","File writ petition if detained unlawfully"],helplines:["Press Club India: 011-23379161","NHRC: 14433","CPJ India: cpj.org"]},"Farmer":{rights:["Art.39","Art.41","Art.21"],threats:["Debt crisis — 12,000+ suicides/year","MSP non-statutory","Land acquisition without consent","Bulldozer action on farm land"],actions:["Preserve all land title documents","Use RTI to access acquisition records","File objection within 30 days of notice"],helplines:["Kisan Call: 1800-180-1551","NALSA: 15100"]},"Tribal/Adivasi":{rights:["Art.21","5th Sch","Art.29","Forest Rights Act"],threats:["Mining displacement","PESA violations","Forest rights denial","Fake encounter allegations"],actions:["Gram Sabha resolution is legally required before eviction","Collect FRA title records","Document all displacement with witnesses"],helplines:["NALSA: 15100","NHRC: 14433"]},"Dalit (SC)":{rights:["Art.17","Art.14","Art.15","Art.46"],threats:["50,000+ atrocities per year","Manual scavenging","Caste discrimination in institutions"],actions:["File FIR under SC/ST Prevention of Atrocities Act","Document with photos and witness statements"],helplines:["SC/ST Commission: 011-23381202","NHRC: 14433"]},"Muslim Minority":{rights:["Art.14","Art.25","Art.29","Art.30"],threats:["Bulldozer demolitions","UAPA misuse","CAA citizenship exclusion","Anti-conversion laws"],actions:["Document all demolition notices with dates","Preserve all property ownership records","File writ if demolition occurs without notice"],helplines:["Minority Commission: 011-23517473","NHRC: 14433"]},Woman:{rights:["Art.14","Art.15","Art.21"],threats:["Gender-based violence","Workplace discrimination","Trafficking"],actions:["Preserve all medical and police records","Use Women's Commission complaint mechanism"],helplines:["Women Helpline: 181","NCW: 011-26942369"]},"General Citizen":{rights:["Art.14","Art.21","Art.32"],threats:["Administrative overreach","Arbitrary detention","Property violation"],actions:["Document all notices with timestamps","Request district legal aid"],helplines:["NHRC: 14433","NALSA: 15100"]}};

function MyRightsPage({scope,setScope,t}){const states=Object.keys(STATE_BASELINES).sort();const occ=OCC[scope.occupation]||OCC["General Citizen"];return(<div className="fade-up"><div style={{marginBottom:16}}><h2 style={{fontFamily:"var(--font-h)",fontSize:"clamp(16px,3vw,21px)",fontWeight:800,color:"var(--t1)"}}>🛡 {t.rights||"My Rights"}</h2></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}><div><label style={{fontSize:8.5,color:"var(--t3)",fontWeight:800,textTransform:"uppercase",letterSpacing:"0.12em",display:"block",marginBottom:5}}>{t.state}</label><select value={scope.state} onChange={e=>setScope(p=>({...p,state:e.target.value}))} style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"1px solid var(--border2)",background:"var(--surface2)",color:"var(--t1)",fontSize:12,outline:"none",fontFamily:"var(--font-b)"}}>{states.map(s=><option key={s} value={s}>{s}</option>)}</select></div><div><label style={{fontSize:8.5,color:"var(--t3)",fontWeight:800,textTransform:"uppercase",letterSpacing:"0.12em",display:"block",marginBottom:5}}>Profile</label><select value={scope.occupation} onChange={e=>setScope(p=>({...p,occupation:e.target.value}))} style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"1px solid var(--border2)",background:"var(--surface2)",color:"var(--t1)",fontSize:12,outline:"none",fontFamily:"var(--font-b)"}}>{Object.keys(OCC).map(o=><option key={o} value={o}>{o}</option>)}</select></div></div><Card style={{marginBottom:10}}><div style={{fontSize:8.5,color:"var(--green)",fontWeight:800,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:9}}>✓ {t.constitutionSupports}</div><div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:12}}>{occ.rights.map(r=><Tag key={r} color={CA[r]?.c||"var(--blue)"}>{r} — {CA[r]?.t||r}</Tag>)}</div><div style={{fontSize:8.5,color:"var(--red)",fontWeight:800,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:7}}>⚠ {t.constitutionViolations} Risk</div>{occ.threats.map((th,i)=><div key={i} style={{fontSize:11,color:"var(--t2)",padding:"5px 0",borderBottom:"1px solid var(--border)"}}>• {th}</div>)}</Card><Card style={{marginBottom:10}}><div style={{fontSize:8.5,color:"var(--t3)",fontWeight:800,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:9}}>If Rights Are Violated</div>{occ.actions.map((a,i)=>(<div key={i} style={{display:"flex",gap:9,padding:"8px 0",borderBottom:"1px solid var(--border)"}}><span style={{color:"var(--blue)",fontWeight:800,fontSize:10.5,flexShrink:0,fontFamily:"var(--font-m)"}}>{i+1}.</span><span style={{fontSize:11,color:"var(--t2)",lineHeight:1.6}}>{a}</span></div>))}</Card><Card><div style={{fontSize:8.5,color:"var(--t3)",fontWeight:800,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:7}}>Emergency Helplines</div>{occ.helplines.map((h,i)=><div key={i} style={{fontSize:11.5,color:"var(--green)",fontFamily:"var(--font-m)",padding:"3px 0",fontWeight:600}}>{h}</div>)}</Card></div>);}

function SubmitPage({onSubmit,toast,t}){const[form,setForm]=useState({headline:"",body:"",state:"",source:"citizen_unverified",scope:"local",evidenceLevel:"allegation",storyType:"rights"});const handle=()=>{if(!form.headline.trim()){toast("Please enter a headline","error");return;}onSubmit(form);setForm({headline:"",body:"",state:"",source:"citizen_unverified",scope:"local",evidenceLevel:"allegation",storyType:"rights"});toast("Report submitted · Evidence level: "+form.evidenceLevel,"success");};return(<div className="fade-up" style={{maxWidth:580}}><div style={{marginBottom:16}}><h2 style={{fontFamily:"var(--font-h)",fontSize:"clamp(16px,3vw,21px)",fontWeight:800,color:"var(--t1)"}}>{t.submit||"Submit Report"}</h2><p style={{fontSize:11,color:"var(--t2)",marginTop:3}}>Include evidence level — helps us weight your report accurately</p></div><Card><div style={{display:"flex",flexDirection:"column",gap:12}}>{[{k:"headline",label:"Headline *",type:"input",ph:"Brief description of the constitutional event"},{k:"body",label:"Details",type:"textarea",ph:"Evidence, source links, location, official notices..."}].map(f=>(<div key={f.k}><label style={{fontSize:8.5,color:"var(--t3)",fontWeight:800,textTransform:"uppercase",letterSpacing:"0.12em",display:"block",marginBottom:5}}>{f.label}</label>{f.type==="textarea"?<textarea value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph} rows={3} style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"1px solid var(--border2)",background:"var(--surface2)",color:"var(--t1)",fontSize:12,outline:"none",resize:"vertical",fontFamily:"var(--font-b)"}}/>:<input value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph} style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"1px solid var(--border2)",background:"var(--surface2)",color:"var(--t1)",fontSize:12,outline:"none",fontFamily:"var(--font-b)"}}/>}</div>))}<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>{[{k:"evidenceLevel",label:"Evidence Level",opts:Object.entries(EVIDENCE_LEVELS).map(([v,l])=>[v,l.label])},{k:"scope",label:"Scope",opts:[["national","National"],["state","State"],["local","Local"]]},{k:"storyType",label:"Story Type",opts:STORY_TYPES.map(s=>[s,s.charAt(0).toUpperCase()+s.slice(1)])},{k:"state",label:"State",opts:[["","All India"],...Object.keys(STATE_BASELINES).sort().map(s=>[s,s])]},{k:"source",label:"Source",opts:[["citizen_unverified","Citizen"],["single_source","Single"],["corroborated","Confirmed"],["verified","Official"]]},{k:"courtStatus",label:"Court Status",opts:Object.entries(COURT_STATUSES).map(([v,cs])=>[v,cs.label])}].map(f=>(<div key={f.k}><label style={{fontSize:8.5,color:"var(--t3)",fontWeight:800,textTransform:"uppercase",letterSpacing:"0.1em",display:"block",marginBottom:4}}>{f.label}</label><select value={form[f.k]||""} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:"1px solid var(--border2)",background:"var(--surface2)",color:"var(--t1)",fontSize:10,outline:"none",fontFamily:"var(--font-b)"}}>{f.opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>))}</div><Btn onClick={handle} variant="primary" style={{padding:"10px 22px",fontSize:13,width:"fit-content"}}>{t.submit||"Submit Report"}</Btn></div></Card></div>);}

function ReviewPage({stories,onReview,t,mode,onReclassify,onClearFiltered}){
  // v12.2 — user-suggested stories shown first; exclude from other sections
  const suggested=stories.filter(s=>s.suggestedBy==="user"&&!s.approved&&!s.rejected);
  const suggestedIds=new Set(suggested.map(s=>s.id));
  const pending=stories.filter(s=>!s.approved&&!s.held&&!suggestedIds.has(s.id));
  const filtered=stories.filter(s=>s.held&&s.aiSkipped&&!suggestedIds.has(s.id));
  const manuallyHeld=stories.filter(s=>s.held&&!s.aiSkipped&&!suggestedIds.has(s.id));

  // v12.1 — A/R/S keyboard shortcuts operate on first pending story
  useEffect(()=>{
    const handler=(e)=>{
      const tgt=e.target;
      if(!tgt)return;
      const tag=(tgt.tagName||"").toLowerCase();
      if(tag==="input"||tag==="textarea"||tgt.isContentEditable)return;
      if(pending.length===0)return;
      const first=pending[0];
      const k=(e.key||"").toLowerCase();
      if(k==="a"){onReview(first.id,"approve");e.preventDefault();}
      else if(k==="r"){onReview(first.id,"reject");e.preventDefault();}
      else if(k==="s"){onReview(first.id,"hold");e.preventDefault();}
    };
    window.addEventListener("keydown",handler);
    return()=>window.removeEventListener("keydown",handler);
  },[pending,onReview]);

  return(<div className="fade-up">
    <div style={{marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
      <h2 style={{fontFamily:"var(--font-h)",fontSize:"clamp(16px,3vw,21px)",fontWeight:800,color:"var(--t1)"}}>{t.review||"Review Queue"}</h2>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {onReclassify&&<Btn variant="amber" onClick={onReclassify}>↻ Re-classify All</Btn>}
        {filtered.length>0&&onClearFiltered&&<Btn variant="danger" onClick={onClearFiltered}>× Clear {filtered.length} filtered</Btn>}
      </div>
    </div>

    {pending.length>0&&<div style={{fontSize:11,color:"var(--t3)",marginBottom:12,padding:"6px 10px",background:"rgba(255,255,255,0.02)",borderRadius:6,border:"1px solid var(--border)",display:"inline-block"}}>
      Hotkeys: <kbd style={{padding:"1px 6px",border:"1px solid var(--border2)",borderRadius:3,fontFamily:"var(--font-m)",fontSize:10}}>A</kbd> approve · <kbd style={{padding:"1px 6px",border:"1px solid var(--border2)",borderRadius:3,fontFamily:"var(--font-m)",fontSize:10}}>R</kbd> reject · <kbd style={{padding:"1px 6px",border:"1px solid var(--border2)",borderRadius:3,fontFamily:"var(--font-m)",fontSize:10}}>S</kbd> skip
    </div>}

    {pending.length===0&&filtered.length===0&&manuallyHeld.length===0&&
      <Card style={{textAlign:"center",padding:"40px",color:"var(--t2)"}}>
        <div style={{fontSize:24,marginBottom:8}}>✓</div>
        <div>No items pending review</div>
        <div style={{fontSize:11,marginTop:6,color:"var(--t3)"}}>All fetched stories passed the constitutional-relevance filter</div>
      </Card>}

    {suggested.length>0&&<div style={{marginBottom:18}}>
      <div style={{fontSize:11,fontWeight:700,color:"#9B7DFF",marginBottom:9,display:"flex",alignItems:"center",gap:6}}>
        <span style={{width:6,height:6,borderRadius:99,background:"#9B7DFF"}}/>
        User-Suggested ({suggested.length})
      </div>
      <div style={{fontSize:10.5,color:"var(--t3)",marginBottom:10,lineHeight:1.5,padding:"8px 12px",background:"rgba(124,92,252,0.04)",borderRadius:8,border:"1px solid rgba(124,92,252,0.15)"}}>
        Stories submitted via the <strong>Suggest</strong> page. These came from real Indian news sources after a user-initiated search — approve to publish, or reject to dismiss.
      </div>
      {suggested.map(s=>(
        <div key={s.id} style={{marginBottom:10,position:"relative"}}>
          <div style={{fontSize:10,color:"#9B7DFF",marginBottom:4,padding:"4px 10px",background:"rgba(124,92,252,0.08)",border:"1px solid rgba(124,92,252,0.2)",borderRadius:6,display:"inline-flex",alignItems:"center",gap:6}}>
            <span style={{fontWeight:700}}>SUGGESTED:</span>
            <span>via "{s.suggestedQuery||"user search"}"</span>
          </div>
          <StoryCard s={s} t={t} mode={mode} onReview={onReview}/>
        </div>
      ))}
    </div>}

    {pending.length>0&&<div style={{marginBottom:14}}>
      <div style={{fontSize:11,fontWeight:700,color:"var(--amber)",marginBottom:9}}>⏳ Pending ({pending.length})</div>
      {pending.map(s=><StoryCard key={s.id} s={s} t={t} mode={mode} onReview={onReview}/>)}
    </div>}

    {filtered.length>0&&<div style={{marginBottom:14}}>
      <div style={{fontSize:11,fontWeight:700,color:"var(--t2)",marginBottom:9,display:"flex",alignItems:"center",gap:6}}>
        <span style={{width:6,height:6,borderRadius:99,background:"var(--t3)"}}/>
        Filtered out by relevance engine ({filtered.length})
      </div>
      <div style={{fontSize:10.5,color:"var(--t3)",marginBottom:10,lineHeight:1.5,padding:"8px 12px",background:"rgba(255,255,255,0.02)",borderRadius:8,border:"1px solid var(--border)"}}>
        These stories were flagged as non-constitutional or non-Indian content. They do not affect scores and are not shown in the newsroom. You can approve individually if you disagree with the filter, or clear them all.
      </div>
      {filtered.map(s=>(
        <div key={s.id} style={{marginBottom:10}}>
          <div style={{fontSize:10,color:"var(--t3)",marginBottom:4,padding:"4px 10px",background:"rgba(245,166,35,0.06)",border:"1px solid rgba(245,166,35,0.15)",borderRadius:6,display:"inline-flex",alignItems:"center",gap:6}}>
            <span style={{fontWeight:700,color:"var(--amber)"}}>FILTERED:</span>
            <span>{s.skipReason||"Did not meet relevance criteria"}</span>
          </div>
          <StoryCard s={s} t={t} mode={mode} onReview={onReview} compact/>
        </div>
      ))}
    </div>}

    {manuallyHeld.length>0&&<div>
      <div style={{fontSize:11,fontWeight:700,color:"var(--t2)",marginBottom:9}}>Manually held ({manuallyHeld.length})</div>
      {manuallyHeld.map(s=><StoryCard key={s.id} s={s} t={t} mode={mode} onReview={onReview}/>)}
    </div>}
  </div>);
}

function MethodPage({t}){return(<div className="fade-up" style={{maxWidth:680}}><div style={{marginBottom:16}}><h2 style={{fontFamily:"var(--font-h)",fontSize:"clamp(16px,3vw,21px)",fontWeight:800,color:"var(--t1)"}}>{t.method||"Methodology"}</h2></div>{[{icon:"📊",c:"var(--blue)",title:"Advanced Scoring Formula",body:"story_effect = directional_score × evidence_weight × source_credibility × confidence × recency_decay × pillar_weight × pattern_multiplier × impact_radius_factor\n\nEvidence weights: Allegation 0.2× · Single Source 0.4× · Corroborated 0.65× · Official Doc 0.85× · Court Finding 0.92× · Final Adjudication 1.0×"},{icon:"🔍",c:"var(--amber)",title:"Evidence Classification System",body:"Every story is assigned an evidence level that directly controls its score weight. An allegation barely moves the score. A gazette notification or court order has near-full effect. This is the core safeguard that prevents misinformation from distorting scores."},{icon:"🌐",c:"var(--green)",title:"Impact Radius — 3 Scores Simultaneously",body:"National news: 100% national · 40% state · 20% local\nState news: 30% national · 100% state · 50% local\nLocal news: 5% national · 15% state · 100% local\nAll adjusted for evidence quality and confidence level"},{icon:"🏛",c:"var(--purple)",title:"16 Department Scores",body:"PMO · Home · Law · Finance · Education · Health · Women&Child · Minority · Rural · Urban · Environment · Defence · Police · EC · Media · Judiciary — each with base score, evidence-weighted story adjustments, and live violation/support tracking"},{icon:"⚖",c:"var(--cyan)",title:"Constitutional Mapping",body:"Every story maps to specific Indian Constitution Articles. 7 constitutional pillars tracked. Violations (red) and Supports (green) shown per story, per department, per state, per article."},{icon:"🤖",c:"var(--purple)",title:"AI Layer — Groq Llama 3.3 70B",body:"Free API (14,400 req/day). AI classifies evidence level, story type, department, exact constitutional violations with article numbers, government response if in text, citizen explanation in plain language, and poetic mythos."},{icon:"📰",c:"var(--blue)",title:"Data Source — Google News RSS",body:"Real-time RSS from 1000s of Indian newspapers, TV channels, digital media. Filtered by 40+ constitutional relevance keywords. 100% free, no API key required. Updates continuously."}].map((item,i)=>(<Card key={i} style={{marginBottom:8,padding:"14px 17px"}}><div style={{display:"flex",gap:11,alignItems:"flex-start"}}><div style={{width:34,height:34,borderRadius:9,background:item.c+"12",border:"1px solid "+item.c+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{item.icon}</div><div><div style={{fontSize:12.5,fontWeight:700,color:"var(--t1)",marginBottom:4}}>{item.title}</div><div style={{fontSize:10.5,color:"var(--t2)",lineHeight:1.75,whiteSpace:"pre-line"}}>{item.body}</div></div></div></Card>))}</div>);}

function AboutPage({t}){return(<div className="fade-up" style={{maxWidth:560}}><div style={{marginBottom:16}}><h2 style={{fontFamily:"var(--font-h)",fontSize:"clamp(16px,3vw,21px)",fontWeight:800,color:"var(--t1)"}}>{t.about||"About"} DTN Mythos</h2></div><Card style={{marginBottom:10}}><div style={{fontFamily:"var(--font-h)",fontSize:14,fontWeight:700,marginBottom:10,background:"var(--grad)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Journalism + Constitutional Analysis + Democracy Score + Multilingual Civic Education</div><p style={{fontSize:12,color:"var(--t2)",lineHeight:1.85,marginBottom:10}}>DTN Mythos is a real-time constitutional intelligence platform. Every news story is scored for democracy impact using a transparent multi-factor formula, mapped to constitutional articles, classified by evidence level and story type, explained in plain language for citizens and technical detail for experts, and displayed in 10 Indian languages.</p><p style={{fontSize:12,color:"var(--t2)",lineHeight:1.85}}>Three layers: Public App (citizens) · Journalist Intelligence Console (editors/reporters) · Constitutional Analysis Engine (scoring, mapping, translation, audit).</p></Card><Card style={{background:"rgba(74,143,255,0.04)",border:"1px solid rgba(74,143,255,0.14)"}}><div style={{fontSize:8.5,color:"var(--blue)",fontWeight:800,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:8}}>Legal Notice & Safeguards</div><p style={{fontSize:11,color:"var(--t2)",lineHeight:1.75,marginBottom:10}}>Independent civic analytics. Scores are analytical estimates — not legal verdicts or court orders. We always distinguish allegation from established fact. Government response and court status shown when available. Not affiliated with any political party or government body. No advertising. No data sold.</p><div style={{display:"flex",gap:14,flexWrap:"wrap"}}><span style={{fontSize:11,color:"var(--green)",fontFamily:"var(--font-m)",fontWeight:600}}>NALSA: 15100</span><span style={{fontSize:11,color:"var(--green)",fontFamily:"var(--font-m)",fontWeight:600}}>NHRC: 14433</span><span style={{fontSize:11,color:"var(--green)",fontFamily:"var(--font-m)",fontWeight:600}}>Women: 181</span></div></Card></div>);}


// ── MAIN APP EXPORT ────────────────────────────────────────────
const MOB_NAV=[
  {id:"dashboard",icon:"◉",tk:"dashboard"},
  {id:"newsroom",icon:"⚡",tk:"newsroom"},
  {id:"rights",icon:"🛡",tk:"rights"},
  {id:"departments",icon:"🏛",tk:"departments"},
  {id:"tracker",icon:"📜",tk:"tracker"},
];

export default function App(){
  const[lang,setLang]=useState(()=>localStorage.getItem("dtn_lang")||"en");
  const t=LANG[lang]||LANG.en;
  const[user,setUser]=useState(()=>{try{const d=localStorage.getItem("dtn_user");return d?JSON.parse(d):null;}catch{return null;}});
  const[showDisc,setShowDisc]=useState(()=>!localStorage.getItem("dtn_disc"));
  const[page,setPage]=useState("dashboard");
  const[stories,setStories]=useState(()=>{
    try{
      // Auto-migrate: clear stale data from pre-fix storage keys (hallucinations lived there)
      const OLD_KEYS=["dtn_v7","dtn_v8","dtn_v9"];
      OLD_KEYS.forEach(k=>{try{localStorage.removeItem(k);}catch{}});
      const d=localStorage.getItem(SK);
      return d?JSON.parse(d):[];
    }catch{return[];}
  });
  const[scope,setScope]=useState({state:"Gujarat",occupation:"General Citizen"});
  const[natHistory,setNatHistory]=useState([]);
  const[fetching,setFetching]=useState(false);
  const[autoOn,setAutoOn]=useState(false);
  const[rl,setRlState]=useState(false);
  const[fScope,setFScope]=useState("national");
  const[fState,setFState]=useState("Gujarat");
  const[fDist,setFDist]=useState("");
  const[countdown,setCountdown]=useState(120);
  const[mode,setMode]=useState("normal");
  const{toasts,add:toast}=useToasts();
  const notif=useNotifications();
  const countRef=useRef(null);
  // v12 Sprint B — sound alert hook (user must enable; sits in masthead)
  const{soundOn,toggleSound}=useSoundAlert(stories);

  useEffect(()=>{
    localStorage.setItem("dtn_lang",lang);
    try{
      document.documentElement.lang=lang==="en"?"en":lang+"-IN";
      document.title=`${t.appName} — ${t.appSub}`;
      // Update meta description dynamically
      let m=document.querySelector('meta[name="description"]');
      if(m)m.setAttribute("content",t.appSub+" — "+t.tagline);
    }catch{}
  },[lang,t]);

  const natScore=useMemo(()=>calcScope(stories,"national",fState),[stories,fState]);
  const stScore=useMemo(()=>calcScope(stories,"state",fState),[stories,fState]);
  const distScore=useMemo(()=>calcScope(stories,"district",fState),[stories,fState]);

  // v12.1 — Uncertainty band = stdev of deltas in last 10 score snapshots
  const natUncertainty=useMemo(()=>{
    if(!natHistory||natHistory.length<3)return 0;
    const deltas=[];
    for(let i=1;i<natHistory.length;i++)deltas.push(natHistory[i].score-natHistory[i-1].score);
    const recent=deltas.slice(-10);
    if(!recent.length)return 0;
    const mean=recent.reduce((a,b)=>a+b,0)/recent.length;
    const variance=recent.reduce((a,b)=>a+(b-mean)**2,0)/recent.length;
    return Math.round(Math.sqrt(variance)*10)/10;
  },[natHistory]);

  useEffect(()=>{
    const label=new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
    setNatHistory(p=>{const last=p[p.length-1];if(last&&last.score===natScore)return p;return[...p,{label,score:natScore}].slice(-50);});
  },[natScore]);

  useEffect(()=>{try{localStorage.setItem(SK,JSON.stringify(stories));}catch{}},[stories]);

  const runUpgrades=useCallback(async(list)=>{
    // v12.3 — enrich if either Groq or Gemini is available
    const canEnrich=()=>((GROQ&&!isRLGroq())||(GEMINI&&!isRLGemini()));
    const todo=list.filter(s=>s.approved&&!s.aiDone&&canEnrich());
    for(let i=0;i<todo.length;i++){
      if(!canEnrich())break;
      const u=await aiUpgrade(todo[i]);
      setStories(p=>p.map(s=>s.id===u.id?u:s));
      if(i<todo.length-1)await new Promise(r=>setTimeout(r,5000));
    }
  },[]);

  const doFetch=useCallback(async()=>{
    if(fetching)return;
    setFetching(true);
    try{
      const items=await fetchRSS(fScope,fState,fDist);
      // v12.3 — only show the rate-limit toast if BOTH providers are blocked
      if(isRLGroq()&&isRLGemini()){setRlState(true);setTimeout(()=>setRlState(false),31000);toast("Both AI providers rate limited — retry in 30s","error");return;}
      if(!items.length){toast("No constitutional stories found — try a different scope","info");return;}
      const fresh=items.map((item,i)=>{
        const cls=classify(item.headline,item.body||"");
        // === FIX 3: Skipped stories go to HELD queue, not newsroom ===
        const isSkipped=cls.aiSkipped===true;
        return{
          id:"F"+Date.now()+i,
          ts:Date.now(),
          headline:item.headline,
          body:item.body||"",
          link:item.link||"",
          image:item.image||null,
          ...cls,
          scope:cls.scope||fScope,
          state:cls.state||(fScope==="state"?fState:null),
          approved:!isSkipped,  // auto-approve only non-skipped
          held:isSkipped,        // skipped → review queue
          aiDone:false,
        };
      });
      let unique=[];
      let skippedCount=0;
      setStories(p=>{
        const ids=new Set(p.map(s=>s.headline.slice(0,55)));
        unique=fresh.filter(s=>!ids.has(s.headline.slice(0,55)));
        if(!unique.length){toast("No new stories — all already tracked","info");return p;}
        skippedCount=unique.filter(s=>s.aiSkipped).length;
        const approved=unique.filter(s=>!s.aiSkipped);
        const evSummary=approved.reduce((a,s)=>{const k=s.evidenceLevel||"single_source";a[k]=(a[k]||0)+1;return a;},{});
        const evStr=Object.entries(evSummary).map(([k,v])=>v+"× "+k.replace(/_/g," ")).join(" · ");
        const msg=skippedCount>0
          ? `${approved.length} stories added · ${skippedCount} filtered out (not constitutional)`
          : `${unique.length} new stories · ${evStr}`;
        toast(msg,"success");
        return[...unique,...p].slice(0,200);
      });

      // Fire notifications + enrich missing images (runs after state update)
      setTimeout(async()=>{
        for(const s of unique){
          // === FIX: don't notify or enrich skipped stories ===
          if(s.aiSkipped)continue;
          // If RSS didn't include an image, try OG scrape (best-effort, capped)
          let img=s.image;
          if(!img&&s.link){
            img=await fetchOgImage(s.link);
            if(img){
              setStories(p=>p.map(x=>x.id===s.id?{...x,image:img}:x));
            }
          }
          // Fire notification — "all new stories" setting (user's choice)
          notif.notify({
            title:s.headline.slice(0,100),
            body:(s.citizenExplanation||s.body||"").slice(0,140),
            image:img||undefined,
            tag:"dtn-"+s.id,
            url:s.link||undefined,
          });
          // Tiny spacing so browsers don't collapse many notifications into one
          await new Promise(r=>setTimeout(r,350));
        }
      },400);

      // Only enrich APPROVED stories (saves Groq API quota)
      setTimeout(()=>runUpgrades(fresh.filter(s=>!s.aiSkipped)),2500);
    }finally{setFetching(false);}
  },[fetching,fScope,fState,fDist,runUpgrades,toast,notif]);

  useEffect(()=>{
    if(autoOn){
      setCountdown(120);
      countRef.current=setInterval(()=>setCountdown(c=>{if(c<=1){doFetch();return 120;}return c-1;}),1000);
      return()=>clearInterval(countRef.current);
    }else{clearInterval(countRef.current);setCountdown(120);}
  },[autoOn,doFetch]);

  // Auto-fetch on sign-in
  useEffect(()=>{if(user)setTimeout(()=>doFetch(),1200);},[user]);

  const handleSignIn=useCallback(u=>{setUser(u);localStorage.setItem("dtn_user",JSON.stringify(u));},[]);
  const handleDisc=useCallback(()=>{setShowDisc(false);localStorage.setItem("dtn_disc","1");},[]);
  const handleReview=useCallback((id,action)=>{
    setStories(p=>p.map(s=>{
      if(s.id!==id)return s;
      const prevState=s.approved?"approved":s.held?"held":s.rejected?"rejected":"pending";
      const newState=action==="approve"?"approved":action==="hold"?"held":action==="reject"?"rejected":prevState;
      const updated={...s,approved:action==="approve",held:action==="hold",rejected:action==="reject",aiSkipped:action==="approve"?false:s.aiSkipped};
      return pushHistory(updated,"user",prevState,newState);
    }));
    toast(action==="approve"?"✓ Approved and scored":"Story "+action+"ed","success");
  },[toast]);

  // Re-classify all existing stories against the current (updated) classifier.
  // Stories the old classifier approved but the new one would skip get moved to the Review Queue.
  const handleReclassify=useCallback(()=>{
    let reclassified=0,skipped=0;
    setStories(p=>p.map(s=>{
      // Preserve user-reviewed decisions (rejected stays rejected, user-held stays held)
      if(s.rejected)return s;
      const cls=classify(s.headline,s.body||"");
      if(cls.aiSkipped){
        skipped++;
        return{
          ...s,
          ...cls,
          // keep original image/link/ts but override classification + force to review queue
          image:s.image,link:s.link,ts:s.ts,id:s.id,
          approved:false,held:true,aiDone:false,
        };
      }
      reclassified++;
      return{
        ...s,
        ...cls,
        image:s.image,link:s.link,ts:s.ts,id:s.id,
        // if previously skipped but now passes, restore to approved
        approved:true,held:false,aiSkipped:false,skipReason:null,
        // reset aiDone so AI can re-enrich with the new prompt
        aiDone:false,
      };
    }));
    toast(`↻ Reclassified · ${reclassified} kept · ${skipped} moved to review`,"success");
  },[toast]);

  // Clear all filtered-out stories (the ones the classifier auto-held as irrelevant)
  const handleClearFiltered=useCallback(()=>{
    let removed=0;
    setStories(p=>{
      const kept=p.filter(s=>{if(s.held&&s.aiSkipped){removed++;return false;}return true;});
      return kept;
    });
    toast(`× Cleared ${removed} filtered stories`,"success");
  },[toast]);

  const handleSubmit=useCallback(form=>{
    const cls=classify(form.headline,form.body);
    const id="C"+Date.now();
    const newStory={
      id,ts:Date.now(),
      headline:form.headline,body:form.body,
      state:form.state||null,scope:form.scope,
      ...cls,
      evidenceLevel:form.evidenceLevel||cls.evidenceLevel,
      storyType:form.storyType||cls.storyType,
      courtStatus:form.courtStatus||"none",
      source:form.source,
      approved:false,held:false,aiDone:false,
    };
    setStories(p=>[pushHistory(newStory,"system",null,"created"),...p]);
  },[]);

  const pending=stories.filter(s=>!s.approved&&!s.held&&!s.rejected).length;

  // ── AUTH FLOW ────────────────────────────────────────────────
  if(!user)return<SignInPage onSignIn={handleSignIn} lang={lang} setLang={setLang} t={t}/>;
  if(showDisc)return<DisclaimerPage onAccept={handleDisc} t={t} userName={user.name}/>;

  // ── BLOOMBERG-STYLE NAV ITEMS ────────────────────────────────
  const navItems=[
    {id:"dashboard",label:t.dashboard||"Dashboard"},
    {id:"newsroom",label:t.newsroom||"Live"},
    {id:"tracker",label:t.tracker||"Constitution"},
    {id:"departments",label:t.departments||"Departments"},
    {id:"states",label:t.states||"States"},
    {id:"rights",label:t.rights||"My Rights"},
    {id:"podcasts",label:t.podcasts||"Podcasts"},
    {id:"paper",label:"Daily Paper"},
    {id:"suggest",label:"Suggest"},
    {id:"review",label:t.review||"Review"},
    {id:"demoscore",label:t.demoScore||"Democracy Score"},
    {id:"method",label:t.method||"Methodology"},
  ];
  const today=new Date().toLocaleDateString("en-IN",{weekday:"long",year:"numeric",month:"long",day:"numeric"});

  const alertsOn=notif?.enabled&&notif?.perm==="granted";
  const alertsLabel=notif?.perm==="denied"?"🔕 Blocked":alertsOn?"🔔 Alerts on":"🔔 Enable alerts";
  const isIOS=typeof navigator!=="undefined"&&/iPad|iPhone|iPod/.test(navigator.userAgent)&&!window.MSStream;
  const isStandalone=typeof window!=="undefined"&&(window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===true);
  const showIOSInstall=isIOS&&!isStandalone&&!notif?.supported;
  const[showIOSHelp,setShowIOSHelp]=useState(false);
  const handleAlerts=()=>{
    if(showIOSInstall){setShowIOSHelp(true);return;}
    if(!notif?.supported)return;
    if(alertsOn)notif.disable();else notif.request();
  };

  const latestFive=useMemo(()=>[...stories].filter(s=>s.approved).sort((a,b)=>b.ts-a.ts).slice(0,5),[stories]);
  const topStory=latestFive[0];

  // v12.4: theme toggle — reads system pref on mount, persists user choice
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem("dtn_theme");
      if (saved === "dark" || saved === "light") return saved;
    } catch(e){}
    return typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("dtn_theme", theme); } catch(e){}
  }, [theme]);

  // ── MAIN SHELL — Bloomberg stacked layout ────────────────────
  return(
    <div className="shell">
      {/* v12.4: Theme toggle — NYT light/dark switcher */}
      <button
        className="dtn-theme-toggle"
        onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
        aria-label={"Switch to " + (theme === "dark" ? "light" : "dark") + " mode"}
        title={"Switch to " + (theme === "dark" ? "light" : "dark") + " mode"}
      >
        {theme === "dark" ? "☀" : "☾"}
      </button>
      {/* v12: Broadcast masthead — replaces v11 top-strip + black masthead */}
      <BroadcastMasthead today={today} stories={stories}>
        <select value={lang} onChange={e=>setLang(e.target.value)} style={{background:"#fff",color:"var(--ink-pure)",border:"1px solid var(--border2)",fontSize:12,padding:"5px 8px",borderRadius:3,fontFamily:"var(--font-b)",cursor:"pointer"}}>
          {Object.entries(LANG).map(([k,l])=>(<option key={k} value={k}>{l.flag} {l.name}</option>))}
        </select>
        <button className="masthead-signin" onClick={()=>{if(confirm(t.signOutQ)){localStorage.removeItem("dtn_user");setUser(null);}}}>
          {user.name}
        </button>
        {(notif?.supported||showIOSInstall)&&<button className={"alerts-btn"+(alertsOn?" enabled":"")} onClick={handleAlerts} disabled={notif?.perm==="denied"}>
          <span className="hide-xs">{showIOSInstall?"📱 Install for alerts":alertsLabel}</span>
          <span className="only-xs">{showIOSInstall?<Icon name="smartphone" size={14}/>:<Icon name="bell" size={14}/>}</span>
        </button>}
        <button className={"sound-toggle"+(soundOn?" on":"")} onClick={toggleSound} title={soundOn?"Sound alerts ON — click to mute":"Enable sound alerts"}>
          {soundOn?"🔊":"🔇"}<span className="hide-xs">{soundOn?"Sound on":"Sound"}</span>
        </button>
        <ViewingCounter/>
        <button className="bb-btn primary" onClick={doFetch} disabled={fetching||rl}>
          <span style={fetching?{display:"inline-block",animation:"spin 1s linear infinite"}:{}}>{fetching?"⟳":"⚡"}</span>
          <span className="hide-xs">{t.fetch||"Fetch"}</span>
        </button>
      </BroadcastMasthead>

      {/* v12: Breaking banner — slides in on score-delta ≥3 stories <90s old */}
      <BreakingBanner stories={stories} onOpen={()=>setPage("newsroom")}/>

      {/* White navbar */}
      <nav className="navbar">
        <span className="nav-live">{t.liveLabel}</span>
        {navItems.map((item,i)=>(
          <React.Fragment key={item.id}>
            <button className={"nav-item"+(page===item.id?" active":"")} onClick={()=>setPage(item.id)}>{item.label}</button>
            {i<navItems.length-1&&<span className="nav-sep">·</span>}
          </React.Fragment>
        ))}
        <div className="nav-scores">
          <span className="nav-score-chip">{t.national} <span className="nav-score-num" style={{color:sColor(natScore)}}>{natScore}</span></span>
          <span className="nav-score-chip">{fState||t.state} <span className="nav-score-num" style={{color:sColor(stScore)}}>{stScore}</span></span>
          <span className="nav-score-chip">{t.district} <span className="nav-score-num" style={{color:sColor(distScore)}}>{distScore}</span></span>
          <button className="bb-btn" onClick={()=>setAutoOn(a=>!a)} style={{background:autoOn?"var(--green-s)":"#fff",color:autoOn?"var(--green-t)":"var(--t1)",borderColor:autoOn?"var(--green-b)":"var(--border2)"}}>AUTO{autoOn?` ↻${countdown}s`:""}</button>
        </div>
      </nav>

      {/* v12: Kinetic letter-by-letter ticker (replaces v11 ticker-bar) */}
      <KineticTicker stories={stories} natScore={natScore} sColor={sColor}/>

      {/* iOS help modal */}
      {showIOSHelp&&<div onClick={()=>setShowIOSHelp(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        <div onClick={e=>e.stopPropagation()} style={{background:"#fff",border:"1px solid var(--border2)",borderRadius:2,padding:26,maxWidth:440,width:"100%"}}>
          <div style={{fontFamily:"var(--font-h)",fontSize:19,fontWeight:700,color:"var(--t1)",marginBottom:14,display:"flex",alignItems:"center",gap:10}}><Icon name="smartphone" size={22}/>Enable alerts on iPhone</div>
          <p style={{fontSize:13,color:"var(--t2)",lineHeight:1.65,marginBottom:14}}>Apple requires installing this site as an app before notifications work. Takes 10 seconds:</p>
          <ol style={{paddingLeft:20,marginBottom:18}}>
            <li style={{fontSize:13,color:"var(--t1)",marginBottom:8,lineHeight:1.55,fontFamily:"var(--font-h)"}}>Tap the <b>Share</b> button <span style={{background:"var(--blue-s)",color:"var(--blue-t)",padding:"1px 7px",borderRadius:2,fontFamily:"var(--font-b)",fontWeight:600}}>⎋</span> at the bottom of Safari</li>
            <li style={{fontSize:13,color:"var(--t1)",marginBottom:8,lineHeight:1.55,fontFamily:"var(--font-h)"}}>Scroll and tap <b>"Add to Home Screen"</b></li>
            <li style={{fontSize:13,color:"var(--t1)",marginBottom:8,lineHeight:1.55,fontFamily:"var(--font-h)"}}>Tap <b>Add</b> in top right</li>
            <li style={{fontSize:13,color:"var(--t1)",marginBottom:8,lineHeight:1.55,fontFamily:"var(--font-h)"}}>Open <b>DTN Mythos</b> from your home screen</li>
            <li style={{fontSize:13,color:"var(--t1)",lineHeight:1.55,fontFamily:"var(--font-h)"}}>You'll now see <b>🔔 Enable alerts</b> in the masthead</li>
          </ol>
          <button onClick={()=>setShowIOSHelp(false)} className="bb-btn primary" style={{width:"100%",padding:"10px"}}>Got it</button>
        </div>
      </div>}

      <main className="page">
          {page==="dashboard"&&
            <Dashboard
              natScore={natScore} stScore={stScore} distScore={distScore}
              stories={stories} natHistory={natHistory}
              fState={fState} fDist={fDist}
              t={t} mode={mode}
              setPage={setPage} setFScope={setFScope}
              latestFive={latestFive}
            />}
          {page==="newsroom"&&
            <NewsroomPage
              stories={stories} fetching={fetching}
              onFetch={doFetch} onAI={()=>runUpgrades(stories)}
              autoOn={autoOn} countdown={countdown}
              t={t} mode={mode} fState={fState}
              natScore={natScore} stScore={stScore} distScore={distScore}
            />}
          {page==="tracker"&&
            <ConstitutionTrackerPage stories={stories} t={t} mode={mode}/>}
          {page==="demoscore"&&
            <DemoScorePage
              natScore={natScore} stScore={stScore} distScore={distScore}
              stories={stories} natHistory={natHistory}
              fState={fState} fDist={fDist} t={t}
            />}
          {page==="departments"&&
            <DepartmentsPage stories={stories} t={t} mode={mode}/>}
          {page==="states"&&
            <StatesPage stories={stories} t={t}/>}
          {page==="rights"&&
            <MyRightsPage scope={scope} setScope={setScope} t={t}/>}
          {page==="podcasts"&&
            <PodcastHub t={t}/>}
          {page==="paper"&&
            <NewspaperView stories={stories} natScore={natScore}/>}
          {page==="suggest"&&
            <SuggestPage
              onAddStory={(story)=>setStories(p=>[pushHistory(story,"user","suggested","held"),...p])}
              classify={classify}
              toast={toast}
              t={t}
            />}
          {page==="journalist"&&
            <JournalistConsolePage
              stories={stories} t={t}
              onAI={()=>runUpgrades(stories)}
              fetching={fetching} onFetch={doFetch}
            />}
          {page==="submit"&&
            <SubmitPage onSubmit={handleSubmit} toast={toast} t={t}/>}
          {page==="review"&&
            <ReviewPage stories={stories} onReview={handleReview} t={t} mode={mode} onReclassify={handleReclassify} onClearFiltered={handleClearFiltered}/>}
          {page==="method"&&<MethodPage t={t}/>}
          {page==="about"&&<AboutPage t={t}/>}
      </main>

      <Toasts items={toasts}/>
    </div>
  );
}
