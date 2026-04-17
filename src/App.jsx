import{useState,useEffect,useCallback,useRef,useMemo}from"react";
import{AreaChart,Area,LineChart,Line,XAxis,YAxis,Tooltip,ResponsiveContainer,RadarChart,Radar,PolarGrid,PolarAngleAxis,BarChart,Bar,Cell}from"recharts";
const GROQ_API_KEY=import.meta.env.VITE_GROQ_KEY||"";

// ── LANGUAGES ──────────────────────────────────────────────────
const LANG={
en:{name:"English",flag:"🇬🇧",appName:"DTN Mythos",appSub:"India Democracy Transparency Network",signIn:"Sign In",signInSub:"Track India's constitutional health in real time",yourName:"Your Name",yourEmail:"Email Address",continueBtn:"Continue to Platform",disclaimerTitle:"Scoring Methodology & Disclaimer",disclaimerAccept:"I Understand — Enter Platform",dashboard:"Dashboard",liveFeed:"Live Feed",myRights:"My Rights",patterns:"Patterns",timeline:"Timeline",constitution:"Constitution",scoreAnalysis:"Score Analysis",anomalies:"Anomalies",states:"State Rankings",departments:"Departments",submit:"Submit Report",review:"Review Queue",methodology:"Methodology",about:"About",fetch:"Fetch",auto:"AUTO",national:"National",state:"State",district:"District",critical:"CRITICAL",positive:"POSITIVE",high:"HIGH",impact:"📊 Impact",facts:"⚖ Facts",mythos:"✦ Mythos",violation:"Violation",support:"Support",functioning:"Functioning Democracy",erosion:"Democratic Erosion",backsliding:"Democratic Backsliding",authoritarian:"Authoritarian Risk",noStories:"No live stories yet",tapFetch:"Tap Fetch to load real-time India news",fetchLive:"⚡ Fetch Live News",impactRadius:"Democracy Impact Radius",constitutionViolations:"Constitutional Violations",constitutionSupports:"Constitutional Supports",deptScore:"Department Democracy Score",allDepts:"All Departments",liveScore:"Live Score",storiesTracked:"Stories Tracked"},
hi:{name:"हिंदी",flag:"🇮🇳",appName:"डीटीएन मिथोस",appSub:"भारत लोकतंत्र पारदर्शिता नेटवर्क",signIn:"साइन इन करें",signInSub:"भारत के संवैधानिक स्वास्थ्य को रीयल टाइम में ट्रैक करें",yourName:"आपका नाम",yourEmail:"ईमेल पता",continueBtn:"प्लेटफॉर्म पर जाएं",disclaimerTitle:"स्कोरिंग पद्धति और अस्वीकरण",disclaimerAccept:"मैं समझता हूं — प्लेटफॉर्म में प्रवेश करें",dashboard:"डैशबोर्ड",liveFeed:"लाइव फ़ीड",myRights:"मेरे अधिकार",patterns:"पैटर्न",timeline:"टाइमलाइन",constitution:"संविधान",scoreAnalysis:"स्कोर विश्लेषण",anomalies:"विसंगतियां",states:"राज्य रैंकिंग",departments:"विभाग",submit:"रिपोर्ट जमा करें",review:"समीक्षा कतार",methodology:"पद्धति",about:"के बारे में",fetch:"फ़ेच",auto:"ऑटो",national:"राष्ट्रीय",state:"राज्य",district:"जिला",critical:"गंभीर",positive:"सकारात्मक",high:"उच्च",impact:"📊 प्रभाव",facts:"⚖ तथ्य",mythos:"✦ मिथोस",violation:"उल्लंघन",support:"समर्थन",functioning:"कार्यशील लोकतंत्र",erosion:"लोकतांत्रिक क्षरण",backsliding:"लोकतांत्रिक पतन",authoritarian:"सत्तावादी जोखिम",noStories:"अभी कोई लाइव स्टोरी नहीं",tapFetch:"लाइव समाचार के लिए फ़ेच टैप करें",fetchLive:"⚡ लाइव समाचार लाएं",impactRadius:"लोकतंत्र प्रभाव त्रिज्या",constitutionViolations:"संवैधानिक उल्लंघन",constitutionSupports:"संवैधानिक समर्थन",deptScore:"विभाग लोकतंत्र स्कोर",allDepts:"सभी विभाग",liveScore:"लाइव स्कोर",storiesTracked:"ट्रैक की गई कहानियां"},
gu:{name:"ગુજરાતી",flag:"🇮🇳",appName:"ડીટીએન મિથોસ",appSub:"ભારત લોકશાહી પારદર્શિતા નેટવર્ક",signIn:"સાઇન ઇન કરો",signInSub:"ભારતના બંધારણીય સ્વાસ્થ્યને રીઅલ ટાઇમમાં ટ્રૅક કરો",yourName:"તમારું નામ",yourEmail:"ઇમેઇલ સરનામું",continueBtn:"પ્લેટફોર્મ પર આગળ વધો",disclaimerTitle:"સ્કોરિંગ પદ્ધતિ અને અસ્વીકરણ",disclaimerAccept:"હું સમજું છું — પ્લેટફોર્મ દાખલ કરો",dashboard:"ડૅશબોર્ડ",liveFeed:"લાઇવ ફીડ",myRights:"મારા અધિકારો",patterns:"પેટર્ન",timeline:"સમયરેખા",constitution:"બંધારણ",scoreAnalysis:"સ્કોર વિશ્લેષણ",anomalies:"વિસંગતતાઓ",states:"રાજ્ય ક્રમાંકન",departments:"વિભાગો",submit:"અહેવાલ સબમિટ કરો",review:"સમીક્ષા કતાર",methodology:"પદ્ધતિ",about:"વિશે",fetch:"ફેચ",auto:"ઓટો",national:"રાષ્ટ્રીય",state:"રાજ્ય",district:"જિલ્લો",critical:"ગંભીર",positive:"સકારાત્મક",high:"ઉચ્ચ",impact:"📊 અસર",facts:"⚖ તથ્યો",mythos:"✦ મિથોસ",violation:"ઉલ્લંઘન",support:"સમર્થન",functioning:"કાર્યરત લોકશાહી",erosion:"લોકશાહી ધોવાણ",backsliding:"લોકશાહી પ્રત્યાઘાત",authoritarian:"સર્વાધિકારી જોખમ",noStories:"હજી કોઈ લાઇવ સ્ટોરી નથી",tapFetch:"લાઇવ સમાચાર માટે ફેચ ટૅપ કરો",fetchLive:"⚡ લાઇવ સમાચાર લાવો",impactRadius:"લોકશાહી અસર ત્રિજ્યા",constitutionViolations:"બંધારણીય ઉલ્લંઘન",constitutionSupports:"બંધારણીય સમર્થન",deptScore:"વિભાગ લોકશાહી સ્કોર",allDepts:"બધા વિભાગો",liveScore:"લાઇવ સ્કોર",storiesTracked:"ટ્રૅક કરેલ સ્ટોરીઝ"},
ta:{name:"தமிழ்",flag:"🇮🇳",appName:"DTN மித்தோஸ்",appSub:"இந்திய ஜனநாயக வெளிப்படைத்தன்மை நெட்வொர்க்",signIn:"உள்நுழைக",signInSub:"இந்தியாவின் அரசியலமைப்பு ஆரோக்கியத்தை நேரடியாக கண்காணிக்கவும்",yourName:"உங்கள் பெயர்",yourEmail:"மின்னஞ்சல் முகவரி",continueBtn:"தளத்தை தொடரவும்",disclaimerTitle:"மதிப்பெண் முறை மற்றும் மறுப்பு",disclaimerAccept:"நான் புரிந்துகொள்கிறேன் — தளத்தில் நுழைக",dashboard:"டாஷ்போர்டு",liveFeed:"நேரடி ஊட்டம்",myRights:"என் உரிமைகள்",patterns:"வடிவங்கள்",timeline:"காலவரிசை",constitution:"அரசியலமைப்பு",scoreAnalysis:"மதிப்பெண் பகுப்பாய்வு",anomalies:"முரண்பாடுகள்",states:"மாநில தரவரிசை",departments:"துறைகள்",submit:"அறிக்கை சமர்ப்பி",review:"மதிப்பாய்வு வரிசை",methodology:"முறைவியல்",about:"பற்றி",fetch:"பெறு",auto:"தானியங்கி",national:"தேசிய",state:"மாநில",district:"மாவட்டம்",critical:"முக்கியமான",positive:"நேர்மறை",high:"உயர்",impact:"📊 தாக்கம்",facts:"⚖ உண்மைகள்",mythos:"✦ மித்தோஸ்",violation:"மீறல்",support:"ஆதரவு",functioning:"செயல்படும் ஜனநாயகம்",erosion:"ஜனநாயக அரிப்பு",backsliding:"ஜனநாயக பின்னடைவு",authoritarian:"சர்வாதிகார ஆபத்து",noStories:"இன்னும் நேரடி கதைகள் இல்லை",tapFetch:"நேரடி செய்திகளை பெறு என்பதை தட்டவும்",fetchLive:"⚡ நேரடி செய்திகளை பெறுக",impactRadius:"ஜனநாயக தாக்க ஆரம்",constitutionViolations:"அரசியலமைப்பு மீறல்கள்",constitutionSupports:"அரசியலமைப்பு ஆதரவுகள்",deptScore:"துறை ஜனநாயக மதிப்பெண்",allDepts:"அனைத்து துறைகளும்",liveScore:"நேரடி மதிப்பெண்",storiesTracked:"கண்காணிக்கப்பட்ட கதைகள்"},
te:{name:"తెలుగు",flag:"🇮🇳",appName:"DTN మిథోస్",appSub:"భారత ప్రజాస్వామ్య పారదర్శకత నెట్వర్క్",signIn:"సైన్ ఇన్",signInSub:"భారతదేశ రాజ్యాంగ ఆరోగ్యాన్ని నిజ సమయంలో ట్రాక్ చేయండి",yourName:"మీ పేరు",yourEmail:"ఇమెయిల్",continueBtn:"ప్లాట్ఫారమ్కు వెళ్ళండి",disclaimerTitle:"స్కోరింగ్ పద్ధతి మరియు నిరాకరణ",disclaimerAccept:"నాకు అర్థమైంది — ప్రవేశించండి",dashboard:"డ్యాష్బోర్డ్",liveFeed:"లైవ్ ఫీడ్",myRights:"నా హక్కులు",patterns:"నమూనాలు",timeline:"కాలక్రమం",constitution:"రాజ్యాంగం",scoreAnalysis:"స్కోర్ విశ్లేషణ",anomalies:"అసాధారణతలు",states:"రాష్ట్ర ర్యాంకింగ్",departments:"విభాగాలు",submit:"నివేదిక సమర్పించు",review:"సమీక్ష క్యూ",methodology:"పద్దతి",about:"గురించి",fetch:"తీసుకు",auto:"ఆటో",national:"జాతీయ",state:"రాష్ట్రం",district:"జిల్లా",critical:"విమర్శనాత్మక",positive:"సానుకూల",high:"అధిక",impact:"📊 ప్రభావం",facts:"⚖ వాస్తవాలు",mythos:"✦ మిథోస్",violation:"ఉల్లంఘన",support:"మద్దతు",functioning:"పని చేసే ప్రజాస్వామ్యం",erosion:"ప్రజాస్వామ్య కోత",backsliding:"ప్రజాస్వామ్య వెనకడుగు",authoritarian:"నిరంకుశ ప్రమాదం",noStories:"ఇంకా లైవ్ కథలు లేవు",tapFetch:"లైవ్ వార్తలు లోడ్ చేయడానికి తీసుకు నొక్కండి",fetchLive:"⚡ లైవ్ వార్తలు తీసుకు",impactRadius:"ప్రజాస్వామ్య ప్రభావ వ్యాసార్థం",constitutionViolations:"రాజ్యాంగ ఉల్లంఘనలు",constitutionSupports:"రాజ్యాంగ మద్దతులు",deptScore:"విభాగ ప్రజాస్వామ్య స్కోర్",allDepts:"అన్ని విభాగాలు",liveScore:"లైవ్ స్కోర్",storiesTracked:"ట్రాక్ చేయబడిన కథలు"},
bn:{name:"বাংলা",flag:"🇮🇳",appName:"DTN মিথোস",appSub:"ভারত গণতন্ত্র স্বচ্ছতা নেটওয়ার্ক",signIn:"সাইন ইন করুন",signInSub:"ভারতের সাংবিধানিক স্বাস্থ্য রিয়েল টাইমে ট্র্যাক করুন",yourName:"আপনার নাম",yourEmail:"ইমেল ঠিকানা",continueBtn:"প্ল্যাটফর্মে যান",disclaimerTitle:"স্কোরিং পদ্ধতি এবং দাবিত্যাগ",disclaimerAccept:"আমি বুঝি — প্ল্যাটফর্মে প্রবেশ করুন",dashboard:"ড্যাশবোর্ড",liveFeed:"লাইভ ফিড",myRights:"আমার অধিকার",patterns:"প্যাটার্ন",timeline:"টাইমলাইন",constitution:"সংবিধান",scoreAnalysis:"স্কোর বিশ্লেষণ",anomalies:"অসঙ্গতি",states:"রাজ্য র‍্যাংকিং",departments:"বিভাগ",submit:"রিপোর্ট জমা দিন",review:"পর্যালোচনা সারি",methodology:"পদ্ধতি",about:"সম্পর্কে",fetch:"আনুন",auto:"অটো",national:"জাতীয়",state:"রাজ্য",district:"জেলা",critical:"সমালোচনামূলক",positive:"ইতিবাচক",high:"উচ্চ",impact:"📊 প্রভাব",facts:"⚖ তথ্য",mythos:"✦ মিথোস",violation:"লঙ্ঘন",support:"সমর্থন",functioning:"কার্যকরী গণতন্ত্র",erosion:"গণতান্ত্রিক ক্ষয়",backsliding:"গণতান্ত্রিক পশ্চাদপসরণ",authoritarian:"কর্তৃত্ববাদী ঝুঁকি",noStories:"এখনো কোনো লাইভ স্টোরি নেই",tapFetch:"লাইভ সংবাদ লোড করতে আনুন ট্যাপ করুন",fetchLive:"⚡ লাইভ সংবাদ আনুন",impactRadius:"গণতান্ত্রিক প্রভাব ব্যাসার্ধ",constitutionViolations:"সাংবিধানিক লঙ্ঘন",constitutionSupports:"সাংবিধানিক সমর্থন",deptScore:"বিভাগ গণতন্ত্র স্কোর",allDepts:"সব বিভাগ",liveScore:"লাইভ স্কোর",storiesTracked:"ট্র্যাক করা গল্প"},
mr:{name:"मराठी",flag:"🇮🇳",appName:"DTN मिथोस",appSub:"भारत लोकशाही पारदर्शकता नेटवर्क",signIn:"साइन इन करा",signInSub:"भारताच्या घटनात्मक आरोग्याचा रीअल टाइममध्ये मागोवा घ्या",yourName:"तुमचे नाव",yourEmail:"ईमेल पत्ता",continueBtn:"व्यासपीठावर जा",disclaimerTitle:"स्कोरिंग पद्धत आणि अस्वीकरण",disclaimerAccept:"मला समजले — व्यासपीठात प्रवेश करा",dashboard:"डॅशबोर्ड",liveFeed:"थेट फीड",myRights:"माझे अधिकार",patterns:"नमुने",timeline:"टाइमलाइन",constitution:"संविधान",scoreAnalysis:"गुण विश्लेषण",anomalies:"विसंगती",states:"राज्य क्रमवारी",departments:"विभाग",submit:"अहवाल सादर करा",review:"पुनरावलोकन रांग",methodology:"पद्धत",about:"बद्दल",fetch:"आण",auto:"ऑटो",national:"राष्ट्रीय",state:"राज्य",district:"जिल्हा",critical:"गंभीर",positive:"सकारात्मक",high:"उच्च",impact:"📊 परिणाम",facts:"⚖ तथ्ये",mythos:"✦ मिथोस",violation:"उल्लंघन",support:"समर्थन",functioning:"कार्यशील लोकशाही",erosion:"लोकशाही क्षरण",backsliding:"लोकशाही माघार",authoritarian:"हुकूमशाही धोका",noStories:"अद्याप कोणत्याही थेट कथा नाहीत",tapFetch:"थेट बातम्यांसाठी आण टॅप करा",fetchLive:"⚡ थेट बातम्या आणा",impactRadius:"लोकशाही प्रभाव त्रिज्या",constitutionViolations:"घटनात्मक उल्लंघने",constitutionSupports:"घटनात्मक समर्थन",deptScore:"विभाग लोकशाही गुण",allDepts:"सर्व विभाग",liveScore:"थेट गुण",storiesTracked:"मागोवा घेतलेल्या कथा"},
kn:{name:"ಕನ್ನಡ",flag:"🇮🇳",appName:"DTN ಮಿಥೋಸ್",appSub:"ಭಾರತ ಪ್ರಜಾಪ್ರಭುತ್ವ ಪಾರದರ್ಶಕತೆ ನೆಟ್ವರ್ಕ್",signIn:"ಸೈನ್ ಇನ್",signInSub:"ಭಾರತದ ಸಾಂವಿಧಾನಿಕ ಆರೋಗ್ಯ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ",yourName:"ನಿಮ್ಮ ಹೆಸರು",yourEmail:"ಇಮೇಲ್ ವಿಳಾಸ",continueBtn:"ಪ್ಲಾಟ್ಫಾರ್ಮ್ಗೆ ಮುಂದುವರಿಯಿರಿ",disclaimerTitle:"ಸ್ಕೋರಿಂಗ್ ವಿಧಾನ ಮತ್ತು ಹಕ್ಕುತ್ಯಾಗ",disclaimerAccept:"ನನಗೆ ಅರ್ಥವಾಗಿದೆ — ಪ್ರವೇಶಿಸಿ",dashboard:"ಡ್ಯಾಶ್ಬೋರ್ಡ್",liveFeed:"ಲೈವ್ ಫೀಡ್",myRights:"ನನ್ನ ಹಕ್ಕುಗಳು",patterns:"ಮಾದರಿಗಳು",timeline:"ಕಾಲಮಾಲೆ",constitution:"ಸಂವಿಧಾನ",scoreAnalysis:"ಸ್ಕೋರ್ ವಿಶ್ಲೇಷಣೆ",anomalies:"ವೈಪರೀತ್ಯಗಳು",states:"ರಾಜ್ಯ ಶ್ರೇಯಾಂಕಗಳು",departments:"ಇಲಾಖೆಗಳು",submit:"ವರದಿ ಸಲ್ಲಿಸಿ",review:"ಪರಿಶೀಲನಾ ಸರತಿ",methodology:"ವಿಧಾನ",about:"ಬಗ್ಗೆ",fetch:"ತರಿ",auto:"ಸ್ವಯಂ",national:"ರಾಷ್ಟ್ರೀಯ",state:"ರಾಜ್ಯ",district:"ಜಿಲ್ಲೆ",critical:"ನಿರ್ಣಾಯಕ",positive:"ಸಕಾರಾತ್ಮಕ",high:"ಉನ್ನತ",impact:"📊 ಪ್ರಭಾವ",facts:"⚖ ಸತ್ಯಗಳು",mythos:"✦ ಮಿಥೋಸ್",violation:"ಉಲ್ಲಂಘನೆ",support:"ಬೆಂಬಲ",functioning:"ಕಾರ್ಯನಿರ್ವಹಿಸುವ ಪ್ರಜಾಪ್ರಭುತ್ವ",erosion:"ಪ್ರಜಾಪ್ರಭುತ್ವ ಸವೆತ",backsliding:"ಪ್ರಜಾಪ್ರಭುತ್ವ ಹಿನ್ನಡೆ",authoritarian:"ನಿರಂಕುಶ ಅಪಾಯ",noStories:"ಇನ್ನು ಲೈವ್ ಕಥೆಗಳಿಲ್ಲ",tapFetch:"ಲೈವ್ ಸುದ್ದಿ ಲೋಡ್ ಮಾಡಲು ತರಿ ಟ್ಯಾಪ್ ಮಾಡಿ",fetchLive:"⚡ ಲೈವ್ ಸುದ್ದಿ ತರಿ",impactRadius:"ಪ್ರಜಾಪ್ರಭುತ್ವ ಪ್ರಭಾವ ತ್ರಿಜ್ಯ",constitutionViolations:"ಸಾಂವಿಧಾನಿಕ ಉಲ್ಲಂಘನೆಗಳು",constitutionSupports:"ಸಾಂವಿಧಾನಿಕ ಬೆಂಬಲಗಳು",deptScore:"ಇಲಾಖೆ ಪ್ರಜಾಪ್ರಭುತ್ವ ಸ್ಕೋರ್",allDepts:"ಎಲ್ಲಾ ಇಲಾಖೆಗಳು",liveScore:"ಲೈವ್ ಸ್ಕೋರ್",storiesTracked:"ಟ್ರ್ಯಾಕ್ ಮಾಡಲಾದ ಕಥೆಗಳು"},
ml:{name:"മലയാളം",flag:"🇮🇳",appName:"DTN മിത്തോസ്",appSub:"ഇന്ത്യ ജനാധിപത്യ സുതാര്യത നെറ്റ്വര്ക്ക്",signIn:"സൈന്‍ ഇന്‍",signInSub:"ഇന്ത്യയുടെ ഭരണഘടനാ ആരോഗ്യം തത്സമയം ട്രാക്ക് ചെയ്യുക",yourName:"നിങ്ങളുടെ പേര്",yourEmail:"ഇമെയില്‍ വിലാസം",continueBtn:"പ്ലാറ്റ്ഫോമിലേക്ക് തുടരുക",disclaimerTitle:"സ്കോറിംഗ് രീതിശാസ്ത്രവും നിരാകരണവും",disclaimerAccept:"എനിക്ക് മനസ്സിലായി — പ്ലാറ്റ്ഫോം നല്‍കുക",dashboard:"ഡാഷ്ബോര്‍ഡ്",liveFeed:"തത്സമയ ഫീഡ്",myRights:"എന്‍റെ അവകാശങ്ങള്‍",patterns:"പാറ്റേണുകള്‍",timeline:"ടൈംലൈന്‍",constitution:"ഭരണഘടന",scoreAnalysis:"സ്കോര്‍ വിശകലനം",anomalies:"അപാകതകള്‍",states:"സംസ്ഥാന റാങ്കിംഗ്",departments:"വകുപ്പുകള്‍",submit:"റിപ്പോര്‍ട്ട് സമര്‍പ്പിക്കുക",review:"അവലോകന ക്യൂ",methodology:"രീതിശാസ്ത്രം",about:"കുറിച്ച്",fetch:"ഫെച്ച്",auto:"ഓട്ടോ",national:"ദേശീയ",state:"സംസ്ഥാനം",district:"ജില്ല",critical:"നിര്‍ണ്ണായക",positive:"ഗുണാത്മക",high:"ഉയര്‍ന്ന",impact:"📊 ആഘാതം",facts:"⚖ വസ്തുതകള്‍",mythos:"✦ മിത്തോസ്",violation:"ലംഘനം",support:"പിന്തുണ",functioning:"പ്രവര്‍ത്തിക്കുന്ന ജനാധിപത്യം",erosion:"ജനാധിപത്യ ശോഷണം",backsliding:"ജനാധിപത്യ പിന്നോക്കം",authoritarian:"സ്വേച്ഛാധിപത്യ അപകടം",noStories:"ഇതുവരെ തത്സമയ കഥകള്‍ ഇല്ല",tapFetch:"തത്സമയ വാര്‍ത്ത ലോഡ് ചെയ്യാന്‍ ഫെച്ച് ടാപ്പ് ചെയ്യുക",fetchLive:"⚡ തത്സമയ വാര്‍ത്ത ഫെച്ച് ചെയ്യുക",impactRadius:"ജനാധിപത്യ ആഘാത ആരം",constitutionViolations:"ഭരണഘടനാ ലംഘനങ്ങള്‍",constitutionSupports:"ഭരണഘടനാ പിന്തുണകള്‍",deptScore:"വകുപ്പ് ജനാധിപത്യ സ്കോര്‍",allDepts:"എല്ലാ വകുപ്പുകളും",liveScore:"തത്സമയ സ്കോര്‍",storiesTracked:"ട്രാക്ക് ചെയ്ത കഥകള്‍"},
};

// ── DEPARTMENTS ─────────────────────────────────────────────────
const DEPARTMENTS={
parliament:{id:"parliament",name:"Parliament",icon:"🏛",color:"#3b82f6",articles:["Art.79","Art.80","Art.81","10th Sch","Art.368"],description:"Lok Sabha & Rajya Sabha — law-making body of India",keyRights:["Art.326","Art.82","10th Sch"],base:55},
executive:{id:"executive",name:"Executive",icon:"🏢",color:"#f97316",articles:["Art.52","Art.53","Art.74","Art.77","Art.355"],description:"President, Cabinet, Ministries — executive power of Union",keyRights:["Art.14","Art.21","Art.300A"],base:45},
judiciary:{id:"judiciary",name:"Judiciary",icon:"⚖",color:"#22c55e",articles:["Art.124","Art.141","Art.226","Art.32","Art.136"],description:"Supreme Court & High Courts — guardian of Constitution",keyRights:["Art.32","Art.226","Art.141"],base:62},
police:{id:"police",name:"Police",icon:"🚔",color:"#ef4444",articles:["Art.21","Art.22","Art.50"],description:"State police forces — law enforcement under state govts",keyRights:["Art.21","Art.22","Art.19(1)(b)"],base:30},
ec:{id:"ec",name:"Election Commission",icon:"🗳",color:"#a78bfa",articles:["Art.324","Art.325","Art.326","Art.329"],description:"Constitutional body supervising all elections in India",keyRights:["Art.324","Art.326","Art.325"],base:58},
media:{id:"media",name:"Media & Press",icon:"📰",color:"#f59e0b",articles:["Art.19(1)(a)","Art.19(2)"],description:"Fourth estate — free press as democracy's watchdog",keyRights:["Art.19(1)(a)","Art.21"],base:28},
military:{id:"military",name:"Armed Forces",icon:"⭐",color:"#14b8a6",articles:["Art.53","Art.355","Art.352","Art.33"],description:"Indian Army, Navy, Air Force under civilian control",keyRights:["Art.21","Art.355"],base:65},
localGov:{id:"localGov",name:"Local Government",icon:"🏘",color:"#ec4899",articles:["Art.243","Art.243A","Art.243D","Art.243G"],description:"Panchayats & Municipalities — grassroots democracy",keyRights:["Art.243D","Art.243G"],base:42},
};

const CA={"Art.14":{t:"Equality Before Law",c:"#6366f1"},"Art.15":{t:"No Discrimination",c:"#8b5cf6"},"Art.17":{t:"Abolition of Untouchability",c:"#c084fc"},"Art.19(1)(a)":{t:"Freedom of Speech & Press",c:"#f97316"},"Art.19(1)(b)":{t:"Right to Assembly",c:"#fb923c"},"Art.21":{t:"Right to Life & Liberty",c:"#ef4444"},"Art.21A":{t:"Right to Education",c:"#fca5a5"},"Art.22":{t:"Protection from Arrest",c:"#f87171"},"Art.23":{t:"No Forced Labour",c:"#fbbf24"},"Art.25":{t:"Freedom of Religion",c:"#ec4899"},"Art.26":{t:"Religious Autonomy",c:"#f472b6"},"Art.29":{t:"Minority Cultural Rights",c:"#c084fc"},"Art.30":{t:"Minority Education Rights",c:"#e879f9"},"Art.32":{t:"Constitutional Remedies",c:"#22c55e"},"Art.39":{t:"Right to Livelihood",c:"#86efac"},"Art.46":{t:"Weaker Sections Protection",c:"#a5f3fc"},"Art.82":{t:"Delimitation After Census",c:"#60a5fa"},"Art.300A":{t:"Right to Property",c:"#fbbf24"},"Art.324":{t:"Election Commission",c:"#f59e0b"},"Art.326":{t:"Universal Adult Suffrage",c:"#d97706"},"Art.355":{t:"Union Duty to States",c:"#92400e"},"5th Sch":{t:"Tribal Areas",c:"#047857"},"10th Sch":{t:"Anti-Defection Law",c:"#991b1b"}};

const PILLARS={press_freedom:{label:"Press Freedom",color:"#f97316",base:22,weight:1.2,dept:"media"},liberty:{label:"Liberty",color:"#ef4444",base:35,weight:1.2,dept:"police"},equality:{label:"Equality",color:"#8b5cf6",base:32,weight:1.1,dept:"executive"},electoral:{label:"Electoral",color:"#3b82f6",base:48,weight:1.0,dept:"ec"},separation:{label:"Separation",color:"#14b8a6",base:43,weight:0.9,dept:"parliament"},religion:{label:"Religion",color:"#ec4899",base:28,weight:1.0,dept:"executive"},justice:{label:"Justice",color:"#22c55e",base:45,weight:0.9,dept:"judiciary"}};

const STATE_BASELINES={"Andhra Pradesh":45,"Arunachal Pradesh":52,"Assam":29,"Bihar":38,"Chhattisgarh":34,"Goa":40,"Gujarat":35,"Haryana":37,"Himachal Pradesh":53,"Jharkhand":43,"Karnataka":55,"Kerala":64,"Madhya Pradesh":38,"Maharashtra":40,"Manipur":17,"Meghalaya":51,"Mizoram":54,"Nagaland":48,"Odisha":47,"Punjab":50,"Rajasthan":44,"Sikkim":57,"Tamil Nadu":59,"Telangana":49,"Tripura":46,"Uttar Pradesh":26,"Uttarakhand":50,"West Bengal":39,"Delhi":41,"J&K":30};

const BASE_SCORE=41;
const SK="dtn_v7";
const CONF_W={verified:1.0,corroborated:0.8,single_source:0.5,citizen_unverified:0.3};
const IMPACT_RADIUS={national:{national:1.0,state:0.4,local:0.2},state:{national:0.3,state:1.0,local:0.5},local:{national:0.1,state:0.2,local:1.0},district:{national:0.05,state:0.15,local:1.0}};
const PATTERN_CLASSES={isolated:{label:"Isolated",color:"#64748b",dot:"○",bg:"rgba(100,116,139,0.1)",mult:1.0},emerging:{label:"Emerging",color:"#f59e0b",dot:"◔",bg:"rgba(245,158,11,0.1)",mult:1.15},repeated:{label:"Repeated",color:"#f97316",dot:"◑",bg:"rgba(249,115,22,0.1)",mult:1.3},systemic:{label:"Systemic",color:"#ef4444",dot:"●",bg:"rgba(239,68,68,0.1)",mult:1.5}};

// ── SCORING ENGINE ─────────────────────────────────────────────
function calcDemocracyWeight(story,scope,state){const src=CONF_W[story.source]||0.3;const days=Math.max(0,(Date.now()-story.ts)/86400000);const rec=Math.max(0.2,1-days*0.006);const pw=PILLARS[story.pillar]?.weight||1.0;const pm=PATTERN_CLASSES[story.pattern]?.mult||1.0;const r=(IMPACT_RADIUS[story.scope||"national"]||IMPACT_RADIUS.national)[scope]||0.1;const sf=(story.state&&story.state===state)?1.0:(story.state&&scope==="state")?0.2:1.0;return(story.aiScore||story.delta||0)*src*rec*pw*pm*r*sf;}
function calcScopeScore(stories,scope,state){const a=stories.filter(s=>s.approved);const base=scope==="state"?(STATE_BASELINES[state]||BASE_SCORE):BASE_SCORE;if(!a.length)return base;return Math.max(0,Math.min(100,Math.round(base+a.reduce((t,s)=>t+calcDemocracyWeight(s,scope,state),0))));}
function calcDeptScore(stories,deptId){const dept=DEPARTMENTS[deptId];if(!dept)return 50;const rel=stories.filter(s=>s.approved&&s.institution===deptId);if(!rel.length)return dept.base;const delta=rel.reduce((a,s)=>{const src=CONF_W[s.source]||0.3;const days=Math.max(0,(Date.now()-s.ts)/86400000);const rec=Math.max(0.2,1-days*0.006);return a+(s.aiScore||s.delta||0)*src*rec;},0);return Math.max(0,Math.min(100,Math.round(dept.base+delta)));}
function scoreColor(n){return n>=60?"#22c55e":n>=40?"#f59e0b":n>=25?"#f97316":"#ef4444";}
function scoreLabelKey(n){return n>=60?"functioning":n>=40?"erosion":n>=25?"backsliding":"authoritarian";}

// ── CLASSIFIER ─────────────────────────────────────────────────
function classify(headline,body){
  const txt=((headline||"")+" "+(body||"")).toLowerCase();
  let pillar="justice",direction="negative",delta=-2,violations=[],supports=[],pattern="isolated",scope="national",institution=null;
  if(/supreme court|high court|sc |hc |judiciary|bench|verdict|judgment/.test(txt))institution="judiciary";
  else if(/parliament|lok sabha|rajya sabha|bill |amendment/.test(txt))institution="parliament";
  else if(/police|arrested|detained|custody|encounter/.test(txt))institution="police";
  else if(/election commission|eci|ballot|voter/.test(txt))institution="ec";
  else if(/government|ministry|cm |chief minister|governor/.test(txt))institution="executive";
  else if(/journalist|reporter|media|press|editor/.test(txt))institution="media";
  else if(/army|military|afspa|armed force/.test(txt))institution="military";
  else if(/panchayat|municipality|gram sabha/.test(txt))institution="localGov";
  if(txt.includes("village")||txt.includes("district")||txt.includes("taluk"))scope="local";
  else if(Object.keys(STATE_BASELINES).some(s=>txt.includes(s.toLowerCase())))scope="state";
  if(/journalist|press|media|reporter/.test(txt)){pillar="press_freedom";if(/kill|murder|dead/.test(txt)){delta=-5;violations=[{a:"Art.21",h:"Journalist killed — right to life violated"},{a:"Art.19(1)(a)",h:"Press freedom suppressed through killing"}];}else if(/arrest|detain|raid/.test(txt)){delta=-3;violations=[{a:"Art.19(1)(a)",h:"Journalist arrested — press freedom restricted"},{a:"Art.22",h:"Arbitrary detention without proper grounds"}];}else if(/free|release|acquit/.test(txt)){direction="positive";delta=2;supports=[{a:"Art.19(1)(a)",h:"Press freedom upheld by authority"}];}else{delta=-2;violations=[{a:"Art.19(1)(a)",h:"Press freedom facing restrictions"}];}}
  else if(/uapa|psa|afspa|custody death|encounter|arbitrary arrest/.test(txt)){pillar="liberty";if(/kill|dead|death/.test(txt)){delta=-5;violations=[{a:"Art.21",h:"Right to life violated — killing without due process"},{a:"Art.22",h:"Extra-judicial death — no accountability"}];}else{delta=-3;violations=[{a:"Art.21",h:"Liberty arbitrarily denied by state"},{a:"Art.22",h:"Detained without proper grounds or procedure"}];}}
  else if(/election|voter|ballot|eci|delimitation|electoral bond/.test(txt)){pillar="electoral";if(/sc.*struck|court.*quash|upheld/.test(txt)){direction="positive";delta=3;supports=[{a:"Art.324",h:"Election Commission independence upheld"},{a:"Art.326",h:"Universal suffrage protected"}];}else if(/rig|fraud|manipulat/.test(txt)){delta=-5;violations=[{a:"Art.326",h:"Election fraud — universal suffrage undermined"},{a:"Art.324",h:"Election Commission integrity compromised"}];}else{delta=-2;violations=[{a:"Art.82",h:"Electoral process affected — representation at risk"}];}}
  else if(/nrc|caa |citizenship|stateless/.test(txt)){pillar="equality";delta=-4;violations=[{a:"Art.14",h:"Unequal citizenship — equality before law denied"},{a:"Art.15",h:"Religious discrimination in citizenship law"}];}
  else if(/bulldoz|demolish|evict/.test(txt)){pillar="equality";delta=-3;violations=[{a:"Art.300A",h:"Property demolished without legal authority"},{a:"Art.21",h:"Home demolition violates human dignity"}];}
  else if(/sc.*upheld|court.*protected|acquitted|bail.*granted|sc.*struck down/.test(txt)){pillar="justice";direction="positive";delta=3;supports=[{a:"Art.32",h:"Constitutional remedy granted — rights upheld"},{a:"Art.141",h:"Supreme Court law protects citizens"}];}
  else if(/dalit|caste|sc.st|untouchab/.test(txt)){pillar="equality";delta=-3;violations=[{a:"Art.17",h:"Caste discrimination — untouchability practiced"},{a:"Art.46",h:"State failed to protect weaker sections"}];}
  else if(/tribal|adivasi|forest right|displacement/.test(txt)){pillar="equality";delta=-3;scope="state";violations=[{a:"5th Sch",h:"Tribal rights violated — schedule not enforced"},{a:"Art.21",h:"Forced displacement violates right to life"}];}
  else if(/riot|communal|violence|killed|murder/.test(txt)){pillar="liberty";delta=-4;violations=[{a:"Art.21",h:"Right to life threatened by communal violence"},{a:"Art.355",h:"Union failed duty to protect state"}];}
  else if(/anti.conversion|religious|church|mosque|temple/.test(txt)){pillar="religion";delta=-2;violations=[{a:"Art.25",h:"Freedom of religion and conscience restricted"}];}
  else{direction="negative";delta=-1;violations=[{a:"Art.21",h:"Potential constitutional rights concern identified"}];}
  if(delta<=-5)pattern="systemic";else if(delta<=-4)pattern="repeated";else if(delta<=-3)pattern="emerging";else pattern="isolated";
  let detectedState=null;
  for(const st of Object.keys(STATE_BASELINES)){if(txt.includes(st.toLowerCase())){detectedState=st;break;}}
  const severity=Math.abs(delta)>=5?"critical":Math.abs(delta)>=3?"high":"medium";
  return{pillar,direction,delta,violations,supports,institution,pattern,scope,state:detectedState,source:"single_source",confidence:0.55,aiScore:delta,aiDone:false,mythos:null,aiAnalysis:null,severity};
}

let _rlu=0;
const isRL=()=>Date.now()<_rlu;
const setRL=ms=>{_rlu=Date.now()+ms;};

async function parseRSS(rssUrl,stateHint){try{const proxy="https://api.allorigins.win/get?url="+encodeURIComponent(rssUrl);const res=await fetch(proxy,{signal:AbortSignal.timeout(12000)});if(!res.ok)return[];const data=await res.json();const parser=new DOMParser();const xml=parser.parseFromString(data.contents,"text/xml");const items=[...xml.querySelectorAll("item")];return items.slice(0,10).map(item=>{const rawTitle=item.querySelector("title")?.textContent||"";const headline=rawTitle.replace(/ - [^-]*$/,"").replace(/<!\[CDATA\[|\]\]>/g,"").trim();const rawDesc=item.querySelector("description")?.textContent||"";const body=rawDesc.replace(/<[^>]*>/g,"").replace(/<!\[CDATA\[|\]\]>/g,"").trim().slice(0,400);return{headline,body,state:stateHint||null};}).filter(i=>i.headline.length>10);}catch{return[];}}

async function fetchNewsRSS(scope,stateName,district){try{const BASE="https://news.google.com/rss/search?hl=en-IN&gl=IN&ceid=IN:en&q=";const RIGHTS="rights+court+police+arrest+protest+constitution+demolition+election+-cricket+-IPL";let url,stateHint=null;if(scope==="national")url=BASE+encodeURIComponent("India+democracy+"+RIGHTS);else if(scope==="state"&&stateName){url=BASE+encodeURIComponent(stateName+"+India+"+RIGHTS);stateHint=stateName;}else if(scope==="district"&&district)url=BASE+encodeURIComponent(district+"+India+"+RIGHTS);else url=BASE+encodeURIComponent("India+civic+rights+"+RIGHTS);const items=await parseRSS(url,stateHint);const kw=/rights|court|police|arrest|detain|demolish|protest|riot|murder|dalit|minority|muslim|tribal|election|verdict|bail|uapa|afspa|judge|constitution|freedom|violence|killed|ed |cbi|rti|corruption|atrocity|evict/i;const filtered=items.filter(i=>kw.test(i.headline+" "+i.body));return(filtered.length>0?filtered:items).slice(0,6);}catch{return[];}}

async function aiUpgrade(story){if(!GROQ_API_KEY||isRL())return story;try{const r=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+GROQ_API_KEY},body:JSON.stringify({model:"llama-3.3-70b-versatile",max_tokens:500,temperature:0.2,messages:[{role:"system",content:`You are India's top constitutional law expert. Return ONLY valid JSON:
{"score":-5to5,"pillar":"press_freedom|liberty|equality|electoral|separation|religion|justice","department":"parliament|executive|judiciary|police|ec|media|military|localGov","scope":"national|state|local","national_impact":0-100,"state_impact":0-100,"local_impact":0-100,"violations":[{"a":"Art.XX","h":"why violated 10 words"}],"supports":[{"a":"Art.XX","h":"why upheld 10 words"}],"analysis":"constitutional analysis 120 chars","mythos":"poetic insight 140 chars"}`},{role:"user",content:"Scope:"+story.scope+" State:"+story.state+" News:"+story.headline}]})});if(r.status===429){setRL(30000);return story;}if(!r.ok)return story;const d=await r.json();const txt=d.choices?.[0]?.message?.content||"";const clean=txt.replace(/```json|```/g,"").trim();const start=clean.indexOf("{"),end=clean.lastIndexOf("}");if(start<0||end<0)return story;const j=JSON.parse(clean.slice(start,end+1));return{...story,aiScore:Number(j.score)||story.delta,aiPillar:j.pillar||story.pillar,institution:j.department||story.institution,nationalImpact:Number(j.national_impact)||null,stateImpact:Number(j.state_impact)||null,localImpact:Number(j.local_impact)||null,violations:j.violations?.length?j.violations:story.violations,supports:j.supports?.length?j.supports:story.supports,aiAnalysis:j.analysis||null,mythos:j.mythos||null,aiDone:true};}catch{return story;}}

// ── TOAST ──────────────────────────────────────────────────────
function useToasts(){const[toasts,setToasts]=useState([]);const add=useCallback((msg,type="info")=>{const id=Date.now();setToasts(p=>[...p,{id,msg,type}]);setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),4000);},[]);return{toasts,add};}
function Toasts({items}){return(<div style={{position:"fixed",top:68,right:14,zIndex:9999,display:"flex",flexDirection:"column",gap:8,maxWidth:"88vw"}}>{items.map(t=>(<div key={t.id} style={{padding:"10px 16px",borderRadius:10,background:t.type==="error"?"var(--red-s)":t.type==="success"?"var(--green-s)":"var(--surface2)",border:"1px solid "+(t.type==="error"?"var(--red)":t.type==="success"?"var(--green)":"var(--border2)"),color:"var(--t1)",fontSize:13,animation:"fadeUp 0.2s ease",boxShadow:"0 8px 24px rgba(0,0,0,0.4)"}}>{t.msg}</div>))}</div>);}

// ── PRIMITIVES ─────────────────────────────────────────────────
function ScoreRing({score,size=100}){const r=(size-14)/2,circ=2*Math.PI*r,col=scoreColor(score),dash=(score/100)*circ;return(<div style={{position:"relative",width:size,height:size,flexShrink:0}}><svg width={size} height={size} style={{transform:"rotate(-90deg)"}}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={9}/><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={9} strokeDasharray={circ} strokeDashoffset={circ-dash} strokeLinecap="round" style={{transition:"stroke-dashoffset 1.2s ease"}}/></svg><div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:"var(--font-m)",fontSize:size*0.21,fontWeight:700,color:col,lineHeight:1}}>{score}</span><span style={{fontSize:size*0.09,color:"var(--t3)"}}>/ 100</span></div></div>);}
function Tag({children,color="#4F8EF7"}){return<span style={{display:"inline-flex",alignItems:"center",fontSize:10,fontWeight:700,fontFamily:"var(--font-m)",color:color,background:color+"22",borderRadius:5,padding:"1px 7px"}}>{children}</span>;}
function Pill({children,color="var(--t2)"}){return<span style={{display:"inline-flex",alignItems:"center",fontSize:10,fontWeight:500,color:color,background:"rgba(255,255,255,0.06)",borderRadius:99,padding:"2px 9px"}}>{children}</span>;}
function Metric({label,value,color}){return(<div style={{padding:"12px 14px",background:"var(--surface2)",borderRadius:10,border:"1px solid var(--border)"}}><div style={{fontSize:9,color:"var(--t3)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:4}}>{label}</div><div style={{fontFamily:"var(--font-m)",fontSize:18,fontWeight:700,color:color||"var(--t1)"}}>{value}</div></div>);}

// ── IMPACT BAR ─────────────────────────────────────────────────
function ImpactBar({story,t}){const scope=story.scope||"national";const r=IMPACT_RADIUS[scope]||IMPACT_RADIUS.national;const abs=Math.abs(story.aiScore||story.delta||0);const ni=story.nationalImpact!=null?story.nationalImpact:Math.round(r.national*100*abs/5);const si=story.stateImpact!=null?story.stateImpact:Math.round(r.state*100*abs/5);const li=story.localImpact!=null?story.localImpact:Math.round(r.local*100*abs/5);const col=story.direction==="positive"?"var(--green)":"var(--red)";return(<div style={{padding:"10px 12px",background:"rgba(255,255,255,0.03)",borderRadius:9,marginTop:8}}><div style={{fontSize:9,color:"var(--t3)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:8}}>{t.impactRadius}</div>{[["🌐 "+t.national,ni],["🏛 "+t.state,si],["📍 "+t.district,li]].map(([lbl,val])=>(<div key={lbl} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}><span style={{fontSize:10,color:"var(--t2)",width:80,flexShrink:0}}>{lbl}</span><div style={{flex:1,height:5,background:"rgba(255,255,255,0.06)",borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",borderRadius:99,background:col,width:Math.min(100,val)+"%",transition:"width 1s ease"}}/></div><span style={{fontSize:10,fontFamily:"var(--font-m)",fontWeight:700,color:col,width:30,textAlign:"right"}}>{Math.round(val)}%</span></div>))}</div>);}

// ── CONSTITUTION PANEL ─────────────────────────────────────────
function ConstitutionPanel({violations=[],supports=[],t}){if(!violations.length&&!supports.length)return null;return(<div style={{marginTop:8}}>{violations.length>0&&(<div style={{marginBottom:8}}><div style={{fontSize:9,color:"var(--red)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:5}}>⚠ {t.constitutionViolations}</div>{violations.map((v,i)=>(<div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",padding:"5px 0",borderBottom:"1px solid var(--border)"}}><Tag color={CA[v.a]?.c||"#ef4444"}>{v.a}</Tag><div style={{flex:1}}><div style={{fontSize:11,fontWeight:600,color:"var(--t1)"}}>{CA[v.a]?.t||v.a}</div><div style={{fontSize:10,color:"var(--t2)"}}>{v.h||v.reason}</div></div></div>))}</div>)}{supports.length>0&&(<div><div style={{fontSize:9,color:"var(--green)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:5}}>✓ {t.constitutionSupports}</div>{supports.map((v,i)=>(<div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",padding:"5px 0",borderBottom:"1px solid var(--border)"}}><Tag color="var(--green)">{v.a}</Tag><div style={{flex:1}}><div style={{fontSize:11,fontWeight:600,color:"var(--t1)"}}>{CA[v.a]?.t||v.a}</div><div style={{fontSize:10,color:"var(--t2)"}}>{v.h||v.reason}</div></div></div>))}</div>)}</div>);}


// ── STORY CARD ─────────────────────────────────────────────────
function StoryCard({s,t,onReview,compact}){
  const[tab,setTab]=useState("impact");
  const isCrit=s.severity==="critical"&&s.direction==="negative";
  const isPos=s.direction==="positive";
  const dc=isCrit?"var(--red)":isPos?"var(--green)":"var(--amber)";
  const bg=isCrit?"rgba(240,74,90,0.04)":isPos?"rgba(34,197,94,0.04)":"rgba(245,158,11,0.03)";
  const pc=PATTERN_CLASSES[s.pattern]||PATTERN_CLASSES.isolated;
  const deptInfo=s.institution?DEPARTMENTS[s.institution]:null;
  return(
    <div style={{background:bg,border:"1px solid "+(isCrit?"rgba(240,74,90,0.15)":isPos?"rgba(34,197,94,0.15)":"rgba(245,158,11,0.10)"),borderRadius:14,padding:compact?"12px":"16px 18px",marginBottom:10}}>
      <div style={{display:"flex",gap:6,alignItems:"flex-start",marginBottom:8,flexWrap:"wrap"}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap",marginBottom:6}}>
            <Tag color={dc}>{isCrit?t.critical:isPos?t.positive:t.high}</Tag>
            {deptInfo&&<span style={{fontSize:9,color:deptInfo.color,background:deptInfo.color+"18",borderRadius:5,padding:"1px 7px",fontWeight:700}}>{deptInfo.icon} {deptInfo.name}</span>}
            {s.state&&<Pill color="var(--blue)">{s.state}</Pill>}
            <span style={{fontSize:9,color:"var(--t3)",textTransform:"uppercase"}}>{s.scope||"national"}</span>
            <div style={{marginLeft:"auto",padding:"2px 8px",borderRadius:6,background:dc+"18",border:"1px solid "+dc+"44"}}>
              <span style={{fontFamily:"var(--font-m)",fontSize:11,fontWeight:800,color:dc}}>{isPos?"+":""}{s.aiScore||s.delta} pts</span>
            </div>
          </div>
          <h3 style={{fontSize:13,fontWeight:600,color:"var(--t1)",lineHeight:1.5,marginBottom:5,wordBreak:"break-word"}}>{s.headline}</h3>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}>
            <span style={{fontSize:9,color:pc.color,background:pc.bg,borderRadius:4,padding:"1px 6px",fontWeight:700}}>{pc.dot} {pc.label}</span>
            {s.aiDone&&<span style={{fontSize:9,color:"var(--purple)",background:"var(--purple-s)",borderRadius:4,padding:"1px 6px",fontWeight:700}}>✦ AI</span>}
            <span style={{fontSize:9,fontWeight:700,color:"var(--t3)",background:"rgba(255,255,255,0.05)",borderRadius:4,padding:"1px 6px"}}>WT {Math.abs(s.aiScore||s.delta||0)}/5</span>
            <span style={{fontSize:9,color:"var(--t3)"}}>{new Date(s.ts).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}</span>
          </div>
        </div>
      </div>
      {!compact&&(<>
        <div style={{display:"flex",gap:2,marginBottom:8,flexWrap:"wrap"}}>
          {[["impact",t.impact],["facts",t.facts],["mythos",t.mythos]].map(([k,label])=>(
            <button key={k} onClick={()=>setTab(k)} style={{padding:"3px 9px",borderRadius:6,border:"none",background:tab===k?"rgba(255,255,255,0.1)":"transparent",color:tab===k?"var(--t1)":"var(--t2)",fontSize:10,fontWeight:tab===k?700:400,cursor:"pointer"}}>{label}</button>
          ))}
        </div>
        {tab==="impact"&&<ImpactBar story={s} t={t}/>}
        {tab==="facts"&&<ConstitutionPanel violations={s.violations} supports={s.supports} t={t}/>}
        {tab==="mythos"&&(<div style={{padding:"12px 14px",background:"rgba(255,255,255,0.03)",borderRadius:9,borderLeft:"3px solid var(--purple)"}}>{s.mythos?<p style={{fontSize:13,color:"var(--t1)",fontStyle:"italic",lineHeight:1.8,margin:0}}>{s.mythos}</p>:<p style={{fontSize:12,color:"var(--t2)",margin:0}}>AI narrative pending...</p>}{s.aiAnalysis&&<p style={{fontSize:11,color:"var(--t2)",marginTop:8,padding:"6px 10px",background:"var(--purple-s)",borderRadius:6,margin:"8px 0 0"}}>{s.aiAnalysis}</p>}</div>)}
      </>)}
      {onReview&&(<div style={{display:"flex",gap:5,marginTop:8,flexWrap:"wrap"}}>
        <button onClick={()=>onReview(s.id,"approve")} style={{padding:"4px 11px",borderRadius:7,border:"1px solid var(--green)",background:"var(--green-s)",color:"var(--green)",fontSize:10,fontWeight:600,cursor:"pointer"}}>✓</button>
        <button onClick={()=>onReview(s.id,"hold")} style={{padding:"4px 11px",borderRadius:7,border:"1px solid var(--amber)",background:"var(--amber-s)",color:"var(--amber)",fontSize:10,fontWeight:600,cursor:"pointer"}}>⏸</button>
        <button onClick={()=>onReview(s.id,"reject")} style={{padding:"4px 11px",borderRadius:7,border:"1px solid var(--red)",background:"var(--red-s)",color:"var(--red)",fontSize:10,fontWeight:600,cursor:"pointer"}}>✗</button>
      </div>)}
    </div>
  );
}

// ── SIGN IN PAGE ─────────────────────────────────────────────────
function SignInPage({onSignIn,lang,setLang,t}){
  const[name,setName]=useState("");
  const[email,setEmail]=useState("");
  return(
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px"}}>
      <div style={{position:"fixed",top:16,right:16,display:"flex",gap:5,flexWrap:"wrap",justifyContent:"flex-end",maxWidth:"80vw"}}>
        {Object.entries(LANG).map(([k,l])=>(<button key={k} onClick={()=>setLang(k)} style={{padding:"3px 7px",borderRadius:6,border:"1px solid "+(lang===k?"var(--blue)":"var(--border)"),background:lang===k?"var(--blue-s)":"var(--surface)",color:lang===k?"var(--blue)":"var(--t2)",fontSize:10,fontWeight:lang===k?700:400,cursor:"pointer"}}>{l.flag} {l.name}</button>))}
      </div>
      <div style={{width:"100%",maxWidth:420}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:60,height:60,borderRadius:16,background:"linear-gradient(135deg,#7C5CFC,#EF4444)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:900,fontFamily:"var(--font-h)",color:"#fff",margin:"0 auto 12px"}}>D</div>
          <h1 style={{fontFamily:"var(--font-h)",fontSize:22,fontWeight:800,color:"var(--t1)",marginBottom:4}}>{t.appName}</h1>
          <p style={{fontSize:12,color:"var(--t2)",lineHeight:1.6}}>{t.appSub}</p>
        </div>
        <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:16,padding:"24px"}}>
          <h2 style={{fontFamily:"var(--font-h)",fontSize:17,fontWeight:700,color:"var(--t1)",marginBottom:5}}>{t.signIn}</h2>
          <p style={{fontSize:12,color:"var(--t2)",marginBottom:18,lineHeight:1.6}}>{t.signInSub}</p>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:9,color:"var(--t3)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:5}}>{t.yourName} *</label>
            <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&name.trim()&&onSignIn({name:name.trim(),email:email.trim()})} placeholder={t.yourName} style={{width:"100%",padding:"10px 14px",borderRadius:9,border:"1px solid var(--border2)",background:"var(--surface2)",color:"var(--t1)",fontSize:13,outline:"none"}}/>
          </div>
          <div style={{marginBottom:20}}>
            <label style={{fontSize:9,color:"var(--t3)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:5}}>{t.yourEmail}</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder={t.yourEmail} type="email" style={{width:"100%",padding:"10px 14px",borderRadius:9,border:"1px solid var(--border2)",background:"var(--surface2)",color:"var(--t1)",fontSize:13,outline:"none"}}/>
          </div>
          <button onClick={()=>name.trim()&&onSignIn({name:name.trim(),email:email.trim()})} disabled={!name.trim()} style={{width:"100%",padding:"12px",borderRadius:10,border:"none",background:name.trim()?"var(--blue)":"var(--surface2)",color:name.trim()?"#fff":"var(--t3)",fontSize:14,fontWeight:700,cursor:name.trim()?"pointer":"default",transition:"all 0.2s"}}>{t.continueBtn}</button>
        </div>
        <div style={{display:"flex",gap:12,justifyContent:"center",marginTop:18,flexWrap:"wrap"}}>
          {["🔒 No data sold","🌐 Open source","📜 Constitutional basis","💰 Free forever"].map(b=>(<span key={b} style={{fontSize:10,color:"var(--t3)"}}>{b}</span>))}
        </div>
      </div>
    </div>
  );
}

// ── DISCLAIMER PAGE ───────────────────────────────────────────────
function DisclaimerPage({onAccept,t,userName}){
  const[read,setRead]=useState(false);
  const ref=useRef(null);
  useEffect(()=>{const el=ref.current;if(!el)return;const h=()=>{if(el.scrollTop+el.clientHeight>=el.scrollHeight-30)setRead(true);};el.addEventListener("scroll",h);return()=>el.removeEventListener("scroll",h);},[]);
  const sections=[
    {icon:"📊",title:"How We Calculate the Democracy Score",body:"India's national democracy score starts at a baseline of 41/100, calibrated against four international indices: Freedom House (63/100, 2025), V-Dem Democracy Rank (100th of 179 nations), RSF Press Freedom Index (151st of 180), and EIU Democracy Index (6.6/10).\n\nEach news story is classified for its constitutional pillar, the government department involved, and whether it represents a violation or support of fundamental rights. The story is then assigned a Democracy Weight Score from -5 (severe constitutional harm) to +5 (significant democratic benefit)."},
    {icon:"🌐",title:"The Impact Radius System — All 3 Scores Update Simultaneously",body:"Every story affects democracy at National, State, and Local levels simultaneously:\n\n• National news (Parliament, Supreme Court, Central Govt): 100% national · 40% state · 20% local\n• State news (High Court, State Police, State Govt): 30% national · 100% state · 50% local\n• Local/District news: 5% national · 15% state · 100% local\n\nThis means every story you see moves all three score rings in real time — the national ring, your state ring, and your local ring — by exact amounts based on geographic relevance."},
    {icon:"⚖",title:"Constitutional Violations & Supports — Every Story, Every Department",body:"Every news story is mapped to specific Articles of the Indian Constitution of 1950. We display:\n\n• VIOLATIONS (red ⚠): Where police, courts, government or media have acted against constitutional guarantees\n• SUPPORTS (green ✓): Where institutions have upheld fundamental rights\n\nWe track 7 constitutional pillars: Press Freedom (Art.19(1)(a)), Liberty (Art.21), Equality (Art.14-15), Electoral Integrity (Art.324-326), Separation of Powers (Art.50), Religious Freedom (Art.25-28), Access to Justice (Art.32)."},
    {icon:"🏛",title:"Government Department Scoring",body:"Each of India's 8 major government departments gets its own live democracy score based on how stories involving that institution affect constitutional rights:\n\n• Parliament: Legislative integrity, anti-defection, delimitation\n• Executive/Government: Policy violations, demolitions, ED/CBI misuse\n• Judiciary: Court rulings, bail, landmark judgments\n• Police: Custodial deaths, arbitrary arrests, encounter killings\n• Election Commission: Electoral integrity, voter rolls, EVM issues\n• Media/Press: Journalist arrests, press freedom, censorship\n• Armed Forces: AFSPA, civilian casualties, accountability\n• Local Government: Panchayat functioning, grassroots rights"},
    {icon:"📰",title:"Data Sources — 100% Free, No API Keys",body:"News is fetched in real time from Google News RSS feeds — covering thousands of Indian newspapers, TV channels, and digital media. Stories are filtered by constitutional relevance using 40+ keyword categories.\n\nAI verification is performed by Groq Llama 3.3 70B (free) which reviews each story for constitutional accuracy, identifies violations and supports with article numbers, and calculates precise National/State/Local impact percentages."},
    {icon:"⚠",title:"Important Limitations & Legal Disclaimer",body:"DTN Mythos is an independent analytical platform. All scores are estimates based on public news and are NOT legal, constitutional, or journalistic determinations. They reflect algorithmic assessment only.\n\nThis platform does not provide legal advice. For genuine legal emergencies: NALSA: 15100 · NHRC: 14433. Not affiliated with any political party, government body, or NGO. Free to use, no data sold, no advertising."},
  ];
  return(
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",flexDirection:"column",alignItems:"center",padding:"24px 16px"}}>
      <div style={{width:"100%",maxWidth:680}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontFamily:"var(--font-h)",fontSize:18,fontWeight:800,color:"var(--t1)",marginBottom:4}}>{t.disclaimerTitle}</div>
          <p style={{fontSize:12,color:"var(--t2)"}}>Hello {userName} — please read all sections before entering</p>
        </div>
        <div ref={ref} style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:16,padding:"24px",maxHeight:"60vh",overflowY:"auto",marginBottom:14}}>
          {sections.map((s,i)=>(
            <div key={i} style={{marginBottom:24,paddingBottom:24,borderBottom:i<sections.length-1?"1px solid var(--border)":"none"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <span style={{fontSize:20}}>{s.icon}</span>
                <h3 style={{fontFamily:"var(--font-h)",fontSize:14,fontWeight:700,color:"var(--t1)"}}>{s.title}</h3>
              </div>
              {s.body.split("\n\n").map((para,j)=>(<p key={j} style={{fontSize:12,color:"var(--t2)",lineHeight:1.8,marginBottom:8,whiteSpace:"pre-line"}}>{para}</p>))}
            </div>
          ))}
          {!read&&<div style={{textAlign:"center",padding:"12px",fontSize:11,color:"var(--t3)"}}>↓ Scroll down to read all sections</div>}
        </div>
        <button onClick={onAccept} disabled={!read} style={{width:"100%",padding:"13px",borderRadius:11,border:"none",background:read?"linear-gradient(135deg,#7C5CFC,#3b82f6)":"var(--surface2)",color:read?"#fff":"var(--t3)",fontSize:14,fontWeight:700,cursor:read?"pointer":"default",transition:"all 0.3s",boxShadow:read?"0 4px 24px rgba(124,92,252,0.3)":"none"}}>
          {read?t.disclaimerAccept:"↓ Scroll to read all first"}
        </button>
      </div>
    </div>
  );
}


// ── SIDEBAR + TOPBAR + TICKER ──────────────────────────────────
const NAV=[{g:"Overview",items:[{id:"dashboard",tk:"dashboard",icon:"◉"},{id:"feed",tk:"liveFeed",icon:"⚡"},{id:"rights",tk:"myRights",icon:"🛡"}]},{g:"Analysis",items:[{id:"patterns",tk:"patterns",icon:"◈"},{id:"timeline",tk:"timeline",icon:"◷"},{id:"constitution",tk:"constitution",icon:"⚖"},{id:"score",tk:"scoreAnalysis",icon:"◎"},{id:"anomalies",tk:"anomalies",icon:"⚠"}]},{g:"India",items:[{id:"states",tk:"states",icon:"◱"},{id:"departments",tk:"departments",icon:"🏛"}]},{g:"Community",items:[{id:"submit",tk:"submit",icon:"+"},{id:"review",tk:"review",icon:"◻"}]},{g:"Platform",items:[{id:"method",tk:"methodology",icon:"◈"},{id:"about",tk:"about",icon:"ℹ"}]}];

function Sidebar({page,setPage,pending,t,user,lang,setLang}){return(<aside className="sidebar"><div className="sidebar-logo"><div style={{display:"flex",alignItems:"center",gap:10}}><div className="logo-mark">D</div><div><div style={{fontFamily:"var(--font-h)",fontSize:12,fontWeight:800,color:"var(--t1)"}}>{t.appName}</div><div style={{fontSize:9,color:"var(--t3)",textTransform:"uppercase",letterSpacing:"0.08em"}}>dtn.today</div></div></div></div>{user&&<div style={{padding:"8px 14px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:8}}><div style={{width:26,height:26,borderRadius:"50%",background:"linear-gradient(135deg,#7C5CFC,#3b82f6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff",flexShrink:0}}>{user.name[0].toUpperCase()}</div><div style={{minWidth:0}}><div style={{fontSize:11,fontWeight:600,color:"var(--t1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div><div style={{fontSize:9,color:"var(--t3)"}}>Citizen Analyst</div></div></div>}<nav className="sidebar-nav">{NAV.map(g=>(<div key={g.g} className="nav-section"><div className="nav-section-label">{g.g}</div>{g.items.map(item=>(<button key={item.id} className={"nav-btn"+(page===item.id?" active":"")} onClick={()=>setPage(item.id)}><span className="icon">{item.icon}</span>{t[item.tk]||item.tk}{item.id==="review"&&pending>0&&<span className="nav-badge">{pending}</span>}{item.id==="feed"&&<span style={{marginLeft:"auto",width:6,height:6,borderRadius:"50%",background:"var(--green)",display:"inline-block",boxShadow:"0 0 6px var(--green)"}}/>}</button>))}</div>))}</nav><div style={{padding:"8px 12px",borderTop:"1px solid var(--border)"}}><div style={{fontSize:9,color:"var(--t3)",marginBottom:5,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em"}}>Language</div><div style={{display:"flex",flexWrap:"wrap",gap:3}}>{Object.entries(LANG).map(([k,l])=>(<button key={k} onClick={()=>setLang(k)} style={{padding:"2px 5px",borderRadius:4,border:"1px solid "+(lang===k?"var(--blue)":"var(--border)"),background:lang===k?"var(--blue-s)":"transparent",color:lang===k?"var(--blue)":"var(--t3)",fontSize:9,cursor:"pointer"}}>{l.flag}</button>))}</div></div></aside>);}

function Topbar({natScore,stScore,distScore,fetching,onFetch,autoOn,setAutoOn,rl,fetchScope,setFetchScope,fetchState,setFetchState,fetchDistrict,setFetchDistrict,t}){const states=Object.keys(STATE_BASELINES).sort();return(<div className="topbar"><div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}><span style={{fontFamily:"var(--font-m)",fontSize:12,fontWeight:700,color:scoreColor(natScore)}}>🌐{natScore}</span><span style={{fontFamily:"var(--font-m)",fontSize:12,fontWeight:700,color:scoreColor(stScore)}}>🏛{stScore}</span><span style={{fontFamily:"var(--font-m)",fontSize:12,fontWeight:700,color:scoreColor(distScore)}}>📍{distScore}</span></div><div style={{flex:1,display:"flex",alignItems:"center",gap:5,overflow:"hidden",padding:"0 5px"}}><select value={fetchScope} onChange={e=>setFetchScope(e.target.value)} style={{padding:"3px 6px",borderRadius:6,border:"1px solid var(--border2)",background:"var(--surface2)",color:"var(--t1)",fontSize:10,outline:"none",cursor:"pointer"}}><option value="national">🌐 {t.national}</option><option value="state">🏛 {t.state}</option><option value="district">📍 {t.district}</option></select>{fetchScope==="state"&&(<select value={fetchState} onChange={e=>setFetchState(e.target.value)} style={{padding:"3px 6px",borderRadius:6,border:"1px solid var(--border2)",background:"var(--surface2)",color:"var(--t1)",fontSize:10,outline:"none",cursor:"pointer",maxWidth:90}}>{states.map(s=><option key={s} value={s}>{s}</option>)}</select>)}{fetchScope==="district"&&(<input value={fetchDistrict} onChange={e=>setFetchDistrict(e.target.value)} placeholder={t.district} style={{padding:"3px 8px",borderRadius:6,border:"1px solid var(--border2)",background:"var(--surface2)",color:"var(--t1)",fontSize:10,outline:"none",width:90}}/>)}</div>{rl&&<span style={{fontSize:9,color:"var(--red)",background:"var(--red-s)",borderRadius:99,padding:"2px 6px",flexShrink:0}}>⏸RL</span>}<button onClick={onFetch} disabled={fetching||rl} style={{padding:"5px 10px",borderRadius:7,border:"1px solid var(--border2)",background:fetching?"var(--surface2)":"var(--surface)",color:fetching?"var(--t2)":"var(--t1)",fontSize:11,fontWeight:600,cursor:fetching?"default":"pointer",display:"flex",alignItems:"center",gap:4,flexShrink:0}}><span style={fetching?{display:"inline-block",animation:"spin 1s linear infinite"}:{}}>{fetching?"⟳":"⚡"}</span><span className="hide-xs">{t.fetch}</span></button><button onClick={()=>setAutoOn(a=>!a)} style={{padding:"4px 8px",borderRadius:7,border:"1px solid "+(autoOn?"var(--green)":"var(--border)"),background:autoOn?"var(--green-s)":"transparent",color:autoOn?"var(--green)":"var(--t2)",fontSize:9,fontWeight:700,cursor:"pointer",flexShrink:0}}>{t.auto}{autoOn?"✓":""}</button></div>);}

function LiveTicker({stories,countdown,autoOn,natScore,stScore,distScore}){const approved=[...stories.filter(s=>s.approved)].sort((a,b)=>b.ts-a.ts);const[idx,setIdx]=useState(0);useEffect(()=>{if(!approved.length)return;const timer=setInterval(()=>setIdx(i=>(i+1)%approved.length),3500);return()=>clearInterval(timer);},[approved.length]);const s=approved[idx];const dc=s?.direction==="positive"?"var(--green)":s?.severity==="critical"?"var(--red)":"var(--amber)";return(<div style={{background:"var(--surface)",borderBottom:"1px solid var(--border)",padding:"5px 12px",display:"flex",alignItems:"center",gap:8,overflow:"hidden",flexShrink:0}}><span style={{fontSize:9,fontWeight:800,color:"var(--red)",background:"var(--red-s)",borderRadius:3,padding:"1px 6px",letterSpacing:"0.1em",flexShrink:0,animation:"pulse 2s infinite"}}>LIVE</span>{s?<><span style={{fontFamily:"var(--font-m)",fontSize:9,fontWeight:700,color:dc,flexShrink:0}}>{(s.aiScore||s.delta)>0?"+":""}{s.aiScore||s.delta}</span><span style={{fontSize:11,color:"var(--t2)",flex:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.headline}</span></>:<span style={{fontSize:11,color:"var(--t3)",flex:1}}>Fetching news...</span>}<div style={{display:"flex",gap:6,flexShrink:0,alignItems:"center"}}><span style={{fontSize:9,fontFamily:"var(--font-m)",color:scoreColor(natScore)}}>🌐{natScore}</span><span style={{fontSize:9,fontFamily:"var(--font-m)",color:scoreColor(stScore)}}>🏛{stScore}</span><span style={{fontSize:9,fontFamily:"var(--font-m)",color:scoreColor(distScore)}}>📍{distScore}</span>{autoOn&&<span style={{fontSize:9,color:"var(--green)",background:"var(--green-s)",borderRadius:3,padding:"1px 5px"}}>↻{countdown}s</span>}</div></div>);}


// ── DEPARTMENTS PAGE ───────────────────────────────────────────
function DepartmentsPage({stories,t}){
  const[sel,setSel]=useState(null);
  const approved=stories.filter(s=>s.approved);
  const deptList=Object.values(DEPARTMENTS);
  const selDept=sel?DEPARTMENTS[sel]:null;
  const selStories=sel?approved.filter(s=>s.institution===sel):[];
  const allViol=selStories.flatMap(s=>s.violations||[]);
  const allSupp=selStories.flatMap(s=>s.supports||[]);
  const vCounts={},sCounts={};
  allViol.forEach(v=>{vCounts[v.a]=(vCounts[v.a]||0)+1;});
  allSupp.forEach(v=>{sCounts[v.a]=(sCounts[v.a]||0)+1;});
  return(
    <div className="fade-up">
      <h2 style={{fontFamily:"var(--font-h)",fontSize:"clamp(16px,3vw,20px)",fontWeight:800,color:"var(--t1)",marginBottom:6}}>{t.departments}</h2>
      <p style={{fontSize:11,color:"var(--t2)",marginBottom:14}}>Live democracy scores · Constitutional violations & supports per institution</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:8,marginBottom:14}}>
        {deptList.map(dept=>{
          const ds=calcDeptScore(approved,dept.id);
          const dStories=approved.filter(s=>s.institution===dept.id);
          const dViol=dStories.reduce((a,s)=>a+(s.violations||[]).length,0);
          const dSupp=dStories.reduce((a,s)=>a+(s.supports||[]).length,0);
          return(
            <div key={dept.id} onClick={()=>setSel(dept.id===sel?null:dept.id)} style={{padding:"14px",background:sel===dept.id?"var(--surface2)":"var(--surface)",border:"2px solid "+(sel===dept.id?dept.color:"var(--border)"),borderRadius:12,cursor:"pointer",transition:"all 0.2s"}}>
              <div style={{fontSize:22,marginBottom:5}}>{dept.icon}</div>
              <div style={{fontSize:11,fontWeight:700,color:"var(--t1)",marginBottom:4,lineHeight:1.3}}>{dept.name}</div>
              <div style={{fontFamily:"var(--font-m)",fontSize:20,fontWeight:700,color:scoreColor(ds),marginBottom:5}}>{ds}</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {dViol>0&&<span style={{fontSize:9,color:"var(--red)",background:"var(--red-s)",borderRadius:4,padding:"1px 5px",fontWeight:700}}>⚠{dViol}</span>}
                {dSupp>0&&<span style={{fontSize:9,color:"var(--green)",background:"var(--green-s)",borderRadius:4,padding:"1px 5px",fontWeight:700}}>✓{dSupp}</span>}
                {dStories.length===0&&<span style={{fontSize:9,color:"var(--t3)"}}>base {dept.base}</span>}
              </div>
            </div>
          );
        })}
      </div>
      {selDept&&(
        <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,padding:"16px 18px"}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:12}}>
            <span style={{fontSize:24}}>{selDept.icon}</span>
            <div style={{flex:1}}>
              <h3 style={{fontFamily:"var(--font-h)",fontSize:15,fontWeight:700,color:"var(--t1)",marginBottom:2}}>{selDept.name}</h3>
              <p style={{fontSize:11,color:"var(--t2)",marginBottom:8}}>{selDept.description}</p>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{selDept.articles.map(a=><Tag key={a} color={CA[a]?.c||"var(--blue)"}>{a}</Tag>)}</div>
            </div>
            <ScoreRing score={calcDeptScore(approved,sel)} size={60}/>
          </div>
          {Object.keys(vCounts).length>0&&(
            <div style={{marginBottom:12}}>
              <div style={{fontSize:9,color:"var(--red)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:8}}>⚠ {t.constitutionViolations} — Frequency Analysis</div>
              {Object.entries(vCounts).sort((a,b)=>b[1]-a[1]).map(([art,count])=>{const maxC=Math.max(...Object.values(vCounts));return(
                <div key={art} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <Tag color={CA[art]?.c||"var(--red)"}>{art}</Tag>
                  <div style={{flex:1}}><div style={{fontSize:10,color:"var(--t1)",fontWeight:600}}>{CA[art]?.t||art}</div></div>
                  <div style={{width:70,height:5,background:"rgba(255,255,255,0.05)",borderRadius:99,overflow:"hidden",flexShrink:0}}>
                    <div style={{height:"100%",background:"var(--red)",borderRadius:99,width:(count/maxC*100)+"%"}}/>
                  </div>
                  <span style={{fontSize:10,fontFamily:"var(--font-m)",color:"var(--red)",width:18,textAlign:"right",flexShrink:0}}>{count}x</span>
                </div>
              );})}
            </div>
          )}
          {Object.keys(sCounts).length>0&&(
            <div style={{marginBottom:12}}>
              <div style={{fontSize:9,color:"var(--green)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:8}}>✓ {t.constitutionSupports} — Frequency Analysis</div>
              {Object.entries(sCounts).sort((a,b)=>b[1]-a[1]).map(([art,count])=>{const maxC=Math.max(...Object.values(sCounts));return(
                <div key={art} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <Tag color="var(--green)">{art}</Tag>
                  <div style={{flex:1}}><div style={{fontSize:10,color:"var(--t1)",fontWeight:600}}>{CA[art]?.t||art}</div></div>
                  <div style={{width:70,height:5,background:"rgba(255,255,255,0.05)",borderRadius:99,overflow:"hidden",flexShrink:0}}>
                    <div style={{height:"100%",background:"var(--green)",borderRadius:99,width:(count/maxC*100)+"%"}}/>
                  </div>
                  <span style={{fontSize:10,fontFamily:"var(--font-m)",color:"var(--green)",width:18,textAlign:"right",flexShrink:0}}>{count}x</span>
                </div>
              );})}
            </div>
          )}
          {selStories.length>0?(<><div style={{fontSize:9,color:"var(--t3)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:8}}>Recent Stories</div>{selStories.slice(0,3).map(s=><StoryCard key={s.id} s={s} t={t} compact/>)}</>):(<div style={{fontSize:12,color:"var(--t2)",padding:"14px",textAlign:"center"}}>No stories yet — fetch news to populate this department</div>)}
        </div>
      )}
    </div>
  );
}

// ── DASHBOARD ──────────────────────────────────────────────────
function Dashboard({natScore,stScore,distScore,stories,natHistory,fetchState,fetchDistrict,t,setPage,setFetchScope}){
  const approved=stories.filter(s=>s.approved);
  const pillarData=Object.entries(PILLARS).map(([k,p])=>{const rel=approved.filter(s=>s.pillar===k);const delta=rel.reduce((a,s)=>a+calcDemocracyWeight(s,"national",fetchState),0);return{full:p.label,color:p.color,score:Math.max(0,Math.min(100,Math.round(p.base+delta)))};});
  const deptScores=Object.entries(DEPARTMENTS).slice(0,4).map(([k,d])=>({name:d.name,icon:d.icon,score:calcDeptScore(approved,k)}));
  return(
    <div className="fade-up">
      <div style={{marginBottom:12}}><div style={{fontSize:9,color:"var(--t3)",textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:700,marginBottom:4}}>Constitutional Awareness · Live 24/7</div><h1 style={{fontFamily:"var(--font-h)",fontSize:"clamp(15px,4vw,21px)",fontWeight:800,color:"var(--t1)"}}>India Democracy Health Score</h1></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
        {[{scope:"national",score:natScore,label:"🌐 "+t.national},{scope:"state",score:stScore,label:"🏛 "+fetchState},{scope:"district",score:distScore,label:"📍 "+(fetchDistrict||t.district)}].map(item=>(
          <div key={item.scope} onClick={()=>setFetchScope(item.scope)} style={{padding:"12px 8px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,cursor:"pointer",textAlign:"center"}}>
            <div style={{fontSize:9,color:"var(--t3)",fontWeight:700,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.06em"}}>{item.label}</div>
            <ScoreRing score={item.score} size={72}/>
            <div style={{fontSize:9,fontWeight:700,color:scoreColor(item.score),marginTop:5}}>{t[scoreLabelKey(item.score)]}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginBottom:10}}>
        <Metric label={t.storiesTracked} value={approved.length} color="var(--blue)"/>
        <Metric label={t.critical} value={approved.filter(s=>s.severity==="critical"&&s.direction==="negative").length} color="var(--red)"/>
        <Metric label={t.positive} value={approved.filter(s=>s.direction==="positive").length} color="var(--green)"/>
        <Metric label="Score Δ" value={(natScore-BASE_SCORE>0?"+":"")+(natScore-BASE_SCORE)} color={natScore>=BASE_SCORE?"var(--green)":"var(--red)"}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginBottom:10}}>
        {[{l:"Freedom House",v:"63/100"},{l:"V-Dem",v:"100/179"},{l:"RSF Press",v:"151/180"},{l:"EIU",v:"6.6/10"}].map(e=>(<div key={e.l} style={{padding:"8px 10px",background:"var(--surface2)",borderRadius:8,border:"1px solid var(--border)"}}><div style={{fontSize:8,color:"var(--t3)",fontWeight:700,textTransform:"uppercase",marginBottom:2}}>{e.l}</div><div style={{fontFamily:"var(--font-m)",fontSize:12,fontWeight:700,color:"var(--t1)"}}>{e.v}</div></div>))}
      </div>
      <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"12px 14px",marginBottom:10}}>
        <div style={{fontSize:9,fontWeight:700,color:"var(--t2)",textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span>{t.deptScore}</span><button onClick={()=>setPage("departments")} style={{fontSize:8,color:"var(--blue)",background:"transparent",border:"none",cursor:"pointer"}}>See All →</button></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>{deptScores.map(d=>(<div key={d.name} onClick={()=>setPage("departments")} style={{textAlign:"center",cursor:"pointer"}}><div style={{fontSize:16,marginBottom:2}}>{d.icon}</div><div style={{fontFamily:"var(--font-m)",fontSize:13,fontWeight:700,color:scoreColor(d.score)}}>{d.score}</div><div style={{fontSize:8,color:"var(--t2)",marginTop:1}}>{d.name.split(" ")[0]}</div></div>))}</div>
      </div>
      <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"12px 14px",marginBottom:10}}>
        <div style={{fontSize:9,fontWeight:700,color:"var(--t2)",textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:8}}>Constitutional Pillars</div>
        {pillarData.map(p=>(<div key={p.full} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><span style={{fontSize:10,color:"var(--t2)",width:65,flexShrink:0}}>{p.full}</span><div style={{flex:1,height:5,background:"rgba(255,255,255,0.05)",borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",borderRadius:99,background:p.color,width:p.score+"%",transition:"width 1.2s ease"}}/></div><span style={{fontFamily:"var(--font-m)",fontSize:10,fontWeight:700,color:p.color,width:24,textAlign:"right"}}>{p.score}</span></div>))}
      </div>
      {natHistory.length>1&&(<div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"12px 14px"}}><div style={{fontSize:9,fontWeight:700,color:"var(--t2)",textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:6}}>Score Trend</div><ResponsiveContainer width="100%" height={65}><AreaChart data={natHistory}><defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={scoreColor(natScore)} stopOpacity={0.2}/><stop offset="95%" stopColor={scoreColor(natScore)} stopOpacity={0}/></linearGradient></defs><XAxis dataKey="label" tick={{fill:"var(--t3)",fontSize:7}} axisLine={false} tickLine={false}/><YAxis domain={[0,100]} tick={{fill:"var(--t3)",fontSize:7}} axisLine={false} tickLine={false} width={18}/><Tooltip contentStyle={{background:"var(--surface2)",border:"1px solid var(--border2)",borderRadius:8,fontSize:10}}/><Area type="monotone" dataKey="score" stroke={scoreColor(natScore)} fill="url(#sg)" strokeWidth={2} dot={false}/></AreaChart></ResponsiveContainer></div>)}
      {approved.length===0&&(<div style={{textAlign:"center",padding:"20px",background:"var(--surface)",borderRadius:12,border:"1px solid var(--border)",marginTop:10}}><div style={{fontSize:22,marginBottom:6}}>⚡</div><div style={{fontSize:12,color:"var(--t2)",marginBottom:10}}>{t.tapFetch}</div><button onClick={()=>setPage("feed")} style={{padding:"8px 18px",borderRadius:8,border:"none",background:"var(--blue)",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>{t.fetchLive}</button></div>)}
    </div>
  );
}


// ── FEED + REMAINING PAGES ──────────────────────────────────────
function FeedPage({stories,fetching,onFetch,onAI,countdown,autoOn,t}){
  const[filter,setFilter]=useState("all");
  const sorted=[...stories.filter(s=>s.approved)].sort((a,b)=>b.ts-a.ts);
  const filtered=filter==="all"?sorted:filter==="critical"?sorted.filter(s=>s.severity==="critical"):filter==="positive"?sorted.filter(s=>s.direction==="positive"):sorted.filter(s=>s.scope===filter);
  return(
    <div className="fade-up">
      <div style={{marginBottom:12}}><h2 style={{fontFamily:"var(--font-h)",fontSize:"clamp(15px,3vw,20px)",fontWeight:800,color:"var(--t1)",marginBottom:3}}>⚡ {t.liveFeed}</h2><p style={{fontSize:11,color:"var(--t2)"}}>Every story scored · Violations & supports mapped · All 3 scopes</p></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginBottom:10}}>
        <Metric label="Total" value={stories.filter(s=>s.approved).length} color="var(--blue)"/>
        <Metric label={t.national} value={stories.filter(s=>s.approved&&s.scope==="national").length} color="var(--blue)"/>
        <Metric label={t.state} value={stories.filter(s=>s.approved&&s.scope==="state").length} color="var(--amber)"/>
        <Metric label={t.district} value={stories.filter(s=>s.approved&&(s.scope==="local"||s.scope==="district")).length} color="var(--green)"/>
      </div>
      <div style={{display:"flex",gap:4,marginBottom:10,flexWrap:"wrap"}}>
        {["all","national","state","local","critical","positive"].map(f=>(<button key={f} onClick={()=>setFilter(f)} style={{padding:"3px 10px",borderRadius:6,border:"1px solid "+(filter===f?"var(--blue)":"var(--border)"),background:filter===f?"var(--blue-s)":"transparent",color:filter===f?"var(--blue)":"var(--t2)",fontSize:9,fontWeight:filter===f?700:400,cursor:"pointer",textTransform:"capitalize"}}>{f}</button>))}
        <div style={{flex:1}}/>
        <button onClick={onAI} style={{padding:"3px 10px",borderRadius:6,border:"1px solid var(--purple)",background:"var(--purple-s)",color:"var(--purple)",fontSize:9,fontWeight:700,cursor:"pointer"}}>✦ AI All</button>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}><div style={{width:6,height:6,borderRadius:"50%",background:"var(--green)",boxShadow:"0 0 6px var(--green)",animation:"pulse 2s infinite"}}/><span style={{fontSize:11,fontWeight:600,color:"var(--green)"}}>Live · Scoring Active</span>{autoOn&&<span style={{fontSize:10,color:"var(--t3)"}}>Next: {countdown}s</span>}</div>
      {filtered.length===0&&(<div style={{textAlign:"center",padding:"44px 20px"}}><div style={{fontSize:24,marginBottom:8}}>⚡</div><div style={{fontSize:13,fontWeight:700,color:"var(--t1)",marginBottom:5}}>{t.noStories}</div><div style={{fontSize:11,color:"var(--t2)",marginBottom:14}}>{t.tapFetch}</div><button onClick={onFetch} style={{padding:"8px 20px",borderRadius:9,border:"none",background:"var(--blue)",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>{t.fetchLive}</button></div>)}
      {filtered.map(s=><StoryCard key={s.id} s={s} t={t}/>)}
    </div>
  );
}

const OCC_RIGHTS={"Journalist":{rights:["Art.19(1)(a)","Art.21","Art.22"],threats:["Arrest under UAPA/BNS-152","Criminal defamation","Physical attacks — 3 killed 2024-25"],actions:["Document arrest or detention immediately","Contact press bodies within 24 hours","Preserve all video evidence and notices","File writ petition if detained unlawfully"],helplines:["Press Club India: 011-23379161","NHRC: 14433"]},"Farmer":{rights:["Art.39","Art.41","Art.21"],threats:["Debt crisis 12,000+ suicides/yr","MSP non-statutory","Land acquisition"],actions:["Preserve land and compensation docs","Use RTI for acquisition records"],helplines:["Kisan Call: 1800-180-1551","NALSA: 15100"]},"Tribal/Adivasi":{rights:["Art.21","5th Sch","Art.29"],threats:["Mining displacement","PESA violations","Forest rights denial"],actions:["Collect Gram Sabha and FRA records","Document all displacement"],helplines:["NALSA: 15100","NHRC: 14433"]},"Dalit (SC)":{rights:["Art.17","Art.14","Art.15"],threats:["Atrocities 50,000+/yr","Manual scavenging","Caste discrimination"],actions:["Document atrocity incidents in writing","Use SC/ST Act channels"],helplines:["SC/ST Commission: 011-23381202","NHRC: 14433"]},"Muslim Minority":{rights:["Art.14","Art.25","Art.29"],threats:["CAA exclusion","Bulldozer demolitions","UAPA misuse"],actions:["Document demolition notices","Preserve all property records"],helplines:["Minority Commission: 011-23517473","NHRC: 14433"]},"Woman":{rights:["Art.14","Art.15","Art.21"],threats:["Gender-based violence","Workplace discrimination"],actions:["Preserve medical and police records","Use women helplines"],helplines:["Women Helpline: 181","NCW: 011-26942369"]},"General Citizen":{rights:["Art.14","Art.21","Art.32"],threats:["Administrative overreach","Arbitrary detention"],actions:["Document all notices and detentions","Use district legal aid"],helplines:["NHRC: 14433","NALSA: 15100"]}};

function MyRightsPage({scope,setScope,t}){
  const states=Object.keys(STATE_BASELINES).sort();
  const occ=OCC_RIGHTS[scope.occupation]||OCC_RIGHTS["General Citizen"];
  return(
    <div className="fade-up">
      <h2 style={{fontFamily:"var(--font-h)",fontSize:"clamp(15px,3vw,20px)",fontWeight:800,color:"var(--t1)",marginBottom:12}}>🛡 {t.myRights}</h2>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
        <div><label style={{fontSize:9,color:"var(--t3)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:4}}>{t.state}</label><select value={scope.state} onChange={e=>setScope(p=>({...p,state:e.target.value}))} style={{width:"100%",padding:"8px 12px",borderRadius:9,border:"1px solid var(--border2)",background:"var(--surface2)",color:"var(--t1)",fontSize:12,outline:"none"}}>{states.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
        <div><label style={{fontSize:9,color:"var(--t3)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:4}}>Profile</label><select value={scope.occupation} onChange={e=>setScope(p=>({...p,occupation:e.target.value}))} style={{width:"100%",padding:"8px 12px",borderRadius:9,border:"1px solid var(--border2)",background:"var(--surface2)",color:"var(--t1)",fontSize:12,outline:"none"}}>{Object.keys(OCC_RIGHTS).map(o=><option key={o} value={o}>{o}</option>)}</select></div>
      </div>
      <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"14px 16px",marginBottom:10}}>
        <div style={{fontSize:9,color:"var(--green)",fontWeight:700,textTransform:"uppercase",marginBottom:8}}>✓ {t.constitutionSupports}</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:12}}>{occ.rights.map(r=><Tag key={r} color={CA[r]?.c||"var(--blue)"}>{r} — {CA[r]?.t||r}</Tag>)}</div>
        <div style={{fontSize:9,color:"var(--red)",fontWeight:700,textTransform:"uppercase",marginBottom:6}}>⚠ {t.constitutionViolations} Risk</div>
        {occ.threats.map((th,i)=><div key={i} style={{fontSize:11,color:"var(--t2)",padding:"4px 0",borderBottom:"1px solid var(--border)"}}>• {th}</div>)}
      </div>
      <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"14px 16px",marginBottom:10}}>
        <div style={{fontSize:9,color:"var(--t3)",fontWeight:700,textTransform:"uppercase",marginBottom:8}}>What To Do If Rights Are Violated</div>
        {occ.actions.map((a,i)=>(<div key={i} style={{display:"flex",gap:8,padding:"7px 0",borderBottom:"1px solid var(--border)"}}><span style={{color:"var(--blue)",fontWeight:700,fontSize:11,flexShrink:0}}>{i+1}.</span><span style={{fontSize:11,color:"var(--t2)"}}>{a}</span></div>))}
      </div>
      <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"12px 16px"}}><div style={{fontSize:9,color:"var(--t3)",fontWeight:700,textTransform:"uppercase",marginBottom:6}}>Emergency Helplines</div>{occ.helplines.map((h,i)=><div key={i} style={{fontSize:11,color:"var(--green)",fontFamily:"var(--font-m)",padding:"2px 0"}}>{h}</div>)}</div>
    </div>
  );
}

function PatternsPage({stories,t}){const approved=stories.filter(s=>s.approved);return(<div className="fade-up"><h2 style={{fontFamily:"var(--font-h)",fontSize:"clamp(15px,3vw,20px)",fontWeight:800,color:"var(--t1)",marginBottom:12}}>{t.patterns}</h2><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginBottom:12}}>{Object.entries(PATTERN_CLASSES).map(([k,p])=>(<div key={k} style={{padding:"12px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:11,textAlign:"center"}}><div style={{fontSize:18,marginBottom:4}}>{p.dot}</div><div style={{fontFamily:"var(--font-m)",fontSize:16,fontWeight:700,color:p.color}}>{approved.filter(s=>s.pattern===k).length}</div><div style={{fontSize:9,color:"var(--t2)",marginTop:2}}>{p.label}</div></div>))}</div>{approved.filter(s=>s.pattern==="systemic").map(s=><StoryCard key={s.id} s={s} t={t} compact/>)}</div>);}

function TimelinePage({stories,natHistory,t}){
  const approved=[...stories.filter(s=>s.approved)].sort((a,b)=>b.ts-a.ts);
  return(<div className="fade-up"><h2 style={{fontFamily:"var(--font-h)",fontSize:"clamp(15px,3vw,20px)",fontWeight:800,color:"var(--t1)",marginBottom:12}}>{t.timeline}</h2>{natHistory.length>1&&(<div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"12px 14px",marginBottom:12}}><ResponsiveContainer width="100%" height={80}><LineChart data={natHistory}><XAxis dataKey="label" tick={{fill:"var(--t3)",fontSize:7}} axisLine={false} tickLine={false}/><YAxis domain={[0,100]} tick={{fill:"var(--t3)",fontSize:7}} axisLine={false} tickLine={false} width={18}/><Tooltip contentStyle={{background:"var(--surface2)",border:"1px solid var(--border2)",borderRadius:8,fontSize:10}}/><Line type="monotone" dataKey="score" stroke="var(--blue)" strokeWidth={2} dot={{r:2,fill:"var(--blue)"}}/></LineChart></ResponsiveContainer></div>)}<div style={{position:"relative",paddingLeft:16}}><div style={{position:"absolute",left:4,top:0,bottom:0,width:1,background:"var(--border)"}}/>{approved.map(s=>(<div key={s.id} style={{position:"relative",paddingBottom:12}}><div style={{position:"absolute",left:-14,top:3,width:7,height:7,borderRadius:"50%",background:s.direction==="positive"?"var(--green)":s.severity==="critical"?"var(--red)":"var(--amber)",border:"2px solid var(--bg)"}}/><div style={{fontSize:9,color:"var(--t3)",marginBottom:2}}>{new Date(s.ts).toLocaleString("en-IN",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</div><div style={{fontSize:12,fontWeight:600,color:"var(--t1)",marginBottom:3}}>{s.headline}</div><div style={{display:"flex",gap:4,flexWrap:"wrap"}}><Tag color={s.direction==="positive"?"var(--green)":s.severity==="critical"?"var(--red)":"var(--amber)"}>{s.direction==="positive"?"+":""}{s.aiScore||s.delta}</Tag>{s.state&&<Pill color="var(--blue)">{s.state}</Pill>}{(s.violations||[]).slice(0,2).map((v,i)=><Tag key={i} color={CA[v.a]?.c||"var(--red)"}>{v.a}</Tag>)}</div></div>))}</div></div>);
}

function ConstitutionPage(){const[search,setSearch]=useState("");const[sel,setSel]=useState(null);const filtered=Object.entries(CA).filter(([k,v])=>!search||k.toLowerCase().includes(search.toLowerCase())||v.t.toLowerCase().includes(search.toLowerCase()));return(<div className="fade-up"><h2 style={{fontFamily:"var(--font-h)",fontSize:"clamp(15px,3vw,20px)",fontWeight:800,color:"var(--t1)",marginBottom:10}}>⚖ Constitution Explorer</h2><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search articles..." style={{width:"100%",padding:"8px 12px",borderRadius:8,border:"1px solid var(--border2)",background:"var(--surface2)",color:"var(--t1)",fontSize:12,outline:"none",marginBottom:10}}/><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:6}}>{filtered.map(([k,v])=>(<button key={k} onClick={()=>setSel(k===sel?null:k)} style={{textAlign:"left",padding:"10px 12px",background:sel===k?"var(--surface2)":"var(--surface)",border:"1px solid "+(sel===k?"var(--border2)":"var(--border)"),borderRadius:9,cursor:"pointer"}}><Tag color={v.c}>{k}</Tag><div style={{fontSize:10,color:"var(--t1)",fontWeight:600,marginTop:4,lineHeight:1.4}}>{v.t}</div></button>))}</div></div>);}

function ScorePage({natScore,stScore,distScore,stories,fetchState,fetchDistrict,t}){const approved=stories.filter(s=>s.approved);const pillarData=Object.entries(PILLARS).map(([k,p])=>{const rel=approved.filter(s=>s.pillar===k);const delta=rel.reduce((a,s)=>a+calcDemocracyWeight(s,"national",fetchState),0);return{subject:p.label,score:Math.max(0,Math.min(100,Math.round(p.base+delta))),color:p.color,base:p.base,delta:Math.round(delta)};});return(<div className="fade-up"><h2 style={{fontFamily:"var(--font-h)",fontSize:"clamp(15px,3vw,20px)",fontWeight:800,color:"var(--t1)",marginBottom:12}}>{t.scoreAnalysis}</h2><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>{[["🌐 "+t.national,natScore],["🏛 "+fetchState,stScore],["📍 "+(fetchDistrict||t.district),distScore]].map(([l,v])=>(<div key={l} style={{padding:"12px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:11,textAlign:"center"}}><div style={{fontSize:9,color:"var(--t3)",fontWeight:700,textTransform:"uppercase",marginBottom:5}}>{l}</div><ScoreRing score={v} size={60}/><div style={{fontSize:9,fontWeight:700,color:scoreColor(v),marginTop:4}}>{t[scoreLabelKey(v)]}</div></div>))}</div>{pillarData.map(p=>(<div key={p.subject} style={{padding:"10px 14px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:9,marginBottom:6}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><span style={{fontSize:12,color:"var(--t1)",fontWeight:600}}>{p.subject}</span><div style={{display:"flex",gap:6,alignItems:"center"}}><span style={{fontSize:9,color:"var(--t2)"}}>base {p.base}</span><span style={{fontFamily:"var(--font-m)",fontSize:12,fontWeight:700,color:p.color}}>{p.score}</span><span style={{fontSize:10,color:p.delta>=0?"var(--green)":"var(--red)",fontWeight:600}}>{p.delta>=0?"+":""}{p.delta}</span></div></div><div style={{height:4,background:"rgba(255,255,255,0.05)",borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",borderRadius:99,background:p.color,width:p.score+"%",transition:"width 1s ease"}}/></div></div>))}</div>);}

function AnomaliesPage({stories,t}){const approved=stories.filter(s=>s.approved);return(<div className="fade-up"><h2 style={{fontFamily:"var(--font-h)",fontSize:"clamp(15px,3vw,20px)",fontWeight:800,color:"var(--t1)",marginBottom:12}}>{t.anomalies}</h2><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7,marginBottom:12}}><Metric label={t.critical} value={approved.filter(s=>s.severity==="critical").length} color="var(--red)"/><Metric label="Systemic" value={approved.filter(s=>s.pattern==="systemic").length} color="var(--amber)"/><Metric label="Total" value={approved.length} color="var(--blue)"/></div>{approved.filter(s=>s.pattern==="systemic").map(s=><StoryCard key={s.id} s={s} t={t} compact/>)}</div>);}

function StatesPage({stories,t}){
  const approved=stories.filter(s=>s.approved);
  const stateScores=Object.entries(STATE_BASELINES).map(([st])=>({state:st,score:calcScopeScore(approved,"state",st)})).sort((a,b)=>b.score-a.score);
  return(<div className="fade-up"><h2 style={{fontFamily:"var(--font-h)",fontSize:"clamp(15px,3vw,20px)",fontWeight:800,color:"var(--t1)",marginBottom:12}}>{t.states}</h2><div style={{display:"flex",flexDirection:"column",gap:5}}>{stateScores.map((item,i)=>{const col=scoreColor(item.score);const stViol=approved.filter(s=>s.state===item.state).reduce((a,s)=>a+(s.violations||[]).length,0);const stSupp=approved.filter(s=>s.state===item.state).reduce((a,s)=>a+(s.supports||[]).length,0);return(<div key={item.state} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:9}}><span style={{fontFamily:"var(--font-m)",fontSize:10,color:"var(--t3)",width:20,flexShrink:0}}>{i+1}</span><span style={{flex:1,fontSize:12,fontWeight:600,color:"var(--t1)"}}>{item.state}</span>{stViol>0&&<span style={{fontSize:9,color:"var(--red)",background:"var(--red-s)",borderRadius:99,padding:"1px 5px",fontWeight:700}}>⚠{stViol}</span>}{stSupp>0&&<span style={{fontSize:9,color:"var(--green)",background:"var(--green-s)",borderRadius:99,padding:"1px 5px",fontWeight:700}}>✓{stSupp}</span>}<div style={{width:55,height:4,background:"rgba(255,255,255,0.05)",borderRadius:99,overflow:"hidden",flexShrink:0}}><div style={{height:"100%",borderRadius:99,background:col,width:item.score+"%"}}/></div><span style={{fontFamily:"var(--font-m)",fontSize:11,fontWeight:700,color:col,width:22,textAlign:"right",flexShrink:0}}>{item.score}</span></div>);})}</div></div>);
}

function SubmitPage({onSubmit,toast,t}){const[form,setForm]=useState({headline:"",body:"",state:"",source:"citizen_unverified",scope:"local"});const handle=()=>{if(!form.headline.trim()){toast("Please enter a headline","error");return;}onSubmit(form);setForm({headline:"",body:"",state:"",source:"citizen_unverified",scope:"local"});toast("Report submitted for review","success");};return(<div className="fade-up" style={{maxWidth:540}}><h2 style={{fontFamily:"var(--font-h)",fontSize:"clamp(15px,3vw,20px)",fontWeight:800,color:"var(--t1)",marginBottom:12}}>+ {t.submit}</h2><div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,padding:"16px"}}>{[{k:"headline",label:"Headline *",type:"input",ph:"Brief description"},{k:"body",label:"Details",type:"textarea",ph:"Context..."}].map(f=>(<div key={f.k} style={{marginBottom:10}}><label style={{fontSize:9,color:"var(--t3)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:4}}>{f.label}</label>{f.type==="textarea"?<textarea value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph} rows={3} style={{width:"100%",padding:"7px 12px",borderRadius:8,border:"1px solid var(--border2)",background:"var(--surface2)",color:"var(--t1)",fontSize:12,outline:"none",resize:"vertical"}}/>:<input value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph} style={{width:"100%",padding:"7px 12px",borderRadius:8,border:"1px solid var(--border2)",background:"var(--surface2)",color:"var(--t1)",fontSize:12,outline:"none"}}/>}</div>))}<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>{[{k:"scope",label:"Scope",opts:[["national","National"],["state","State"],["local","Local"]]},{k:"state",label:"State",opts:[["","All India"],...Object.keys(STATE_BASELINES).sort().map(s=>[s,s])]},{k:"source",label:"Source",opts:[["citizen_unverified","Citizen"],["single_source","Single"],["corroborated","Confirmed"],["verified","Verified"]]}].map(f=>(<div key={f.k}><label style={{fontSize:9,color:"var(--t3)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:3}}>{f.label}</label><select value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} style={{width:"100%",padding:"6px 8px",borderRadius:7,border:"1px solid var(--border2)",background:"var(--surface2)",color:"var(--t1)",fontSize:10,outline:"none"}}>{f.opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>))}</div><button onClick={handle} style={{padding:"8px 20px",borderRadius:8,border:"none",background:"var(--blue)",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>{t.submit}</button></div></div>);}

function ReviewPage({stories,onReview,t}){const pending=stories.filter(s=>!s.approved&&!s.held);const held=stories.filter(s=>s.held);return(<div className="fade-up"><h2 style={{fontFamily:"var(--font-h)",fontSize:"clamp(15px,3vw,20px)",fontWeight:800,color:"var(--t1)",marginBottom:12}}>{t.review}</h2>{pending.length===0&&held.length===0&&<div style={{textAlign:"center",padding:"36px 20px",color:"var(--t2)"}}>No items pending</div>}{pending.length>0&&<div style={{marginBottom:12}}><div style={{fontSize:11,fontWeight:700,color:"var(--amber)",marginBottom:8}}>⏳ Pending ({pending.length})</div>{pending.map(s=><StoryCard key={s.id} s={s} t={t} onReview={onReview}/>)}</div>}{held.length>0&&<div><div style={{fontSize:11,fontWeight:700,color:"var(--t2)",marginBottom:8}}>Held ({held.length})</div>{held.map(s=><StoryCard key={s.id} s={s} t={t} onReview={onReview}/>)}</div>}</div>);}

function MethodPage({t}){return(<div className="fade-up" style={{maxWidth:640}}><h2 style={{fontFamily:"var(--font-h)",fontSize:"clamp(15px,3vw,20px)",fontWeight:800,color:"var(--t1)",marginBottom:12}}>{t.methodology}</h2>{[{icon:"🌐",title:"Impact Radius — All 3 Scores Live",body:"National news → 100% national · 40% state · 20% local\nState news → 30% national · 100% state · 50% local\nLocal/District → 5% national · 15% state · 100% local\nAll 3 score rings update simultaneously from every story."},{icon:"⚖",title:"Constitutional Violations & Supports",body:"Every story maps to specific Indian Constitution articles. Violations (red ⚠) show where rights are denied. Supports (green ✓) show where rights are upheld. Shown per story, per department, per state."},{icon:"🏛",title:"8 Department Scores",body:"Parliament · Executive · Judiciary · Police · Election Commission · Media/Press · Armed Forces · Local Government. Each has own live democracy score based on stories involving that institution."},{icon:"📊",title:"Democracy Weight Formula",body:"weight = score_delta × source_confidence × recency_decay × pillar_weight × pattern_multiplier × impact_radius_factor"},{icon:"🤖",title:"Groq AI (Free, 14,400 req/day)",body:"Groq Llama 3.3 70B verifies constitutional violations and supports with article numbers, calculates National/State/Local impact %, refines democracy scores."},{icon:"📰",title:"Google News RSS (Free, No Key)",body:"Real-time India news from 1000s of sources. Filtered for constitutional relevance using 40+ keyword categories."}].map((item,i)=>(<div key={i} style={{padding:"12px 14px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:11,marginBottom:7}}><div style={{display:"flex",gap:8,alignItems:"flex-start"}}><span style={{fontSize:16,flexShrink:0}}>{item.icon}</span><div><div style={{fontSize:12,fontWeight:700,color:"var(--t1)",marginBottom:3}}>{item.title}</div><div style={{fontSize:11,color:"var(--t2)",lineHeight:1.7,whiteSpace:"pre-line"}}>{item.body}</div></div></div></div>))}</div>);}

function AboutPage({t}){return(<div className="fade-up" style={{maxWidth:520}}><h2 style={{fontFamily:"var(--font-h)",fontSize:"clamp(15px,3vw,20px)",fontWeight:800,color:"var(--t1)",marginBottom:12}}>{t.about} DTN Mythos</h2><div style={{padding:"16px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,marginBottom:10}}><p style={{fontSize:13,color:"var(--t2)",lineHeight:1.9,marginBottom:10}}>DTN Mythos tracks India's constitutional health across National, State, and Local levels simultaneously. Every story scored · Every violation mapped · 10 Indian languages · All departments.</p><p style={{fontSize:13,color:"var(--t2)",lineHeight:1.9}}>We believe every Indian citizen deserves to know not just what the news is — but what it means for their constitutional rights, which government department is responsible, and at what geographic level it matters.</p></div><div style={{padding:"12px 14px",background:"var(--blue-s)",border:"1px solid rgba(79,142,247,0.2)",borderRadius:10}}><div style={{fontSize:9,color:"var(--blue)",fontWeight:700,marginBottom:3}}>LEGAL NOTICE</div><p style={{fontSize:11,color:"var(--t2)",lineHeight:1.7,margin:0}}>Independent civic tech. Analytical estimates only. Not legal advice. NALSA: 15100 · NHRC: 14433</p></div></div>);}


// ── MAIN APP ──────────────────────────────────────────────────
const MOBILE_NAV=[{id:"dashboard",icon:"◉",tk:"dashboard"},{id:"feed",icon:"⚡",tk:"liveFeed"},{id:"rights",icon:"🛡",tk:"myRights"},{id:"departments",icon:"🏛",tk:"departments"},{id:"states",icon:"◱",tk:"states"}];

export default function App(){
  const[lang,setLang]=useState(()=>localStorage.getItem("dtn_lang")||"en");
  const t=LANG[lang]||LANG.en;
  const[user,setUser]=useState(()=>{try{const d=localStorage.getItem("dtn_user");return d?JSON.parse(d):null;}catch{return null;}});
  const[showDisc,setShowDisc]=useState(()=>!localStorage.getItem("dtn_disc"));
  const[page,setPage]=useState("dashboard");
  const[stories,setStories]=useState(()=>{try{const d=localStorage.getItem(SK);return d?JSON.parse(d):[];}catch{return[];}});
  const[scope,setScope]=useState({state:"Gujarat",occupation:"General Citizen"});
  const[natHistory,setNatHistory]=useState([]);
  const[fetching,setFetching]=useState(false);
  const[autoOn,setAutoOn]=useState(false);
  const[rl,setRlState]=useState(false);
  const[fetchScope,setFetchScope]=useState("national");
  const[fetchState,setFetchState]=useState("Gujarat");
  const[fetchDistrict,setFetchDistrict]=useState("");
  const[countdown,setCountdown]=useState(120);
  const{toasts,add:toast}=useToasts();
  const countRef=useRef(null);

  useEffect(()=>{localStorage.setItem("dtn_lang",lang);},[lang]);

  const natScore=useMemo(()=>calcScopeScore(stories,"national",fetchState),[stories,fetchState]);
  const stScore=useMemo(()=>calcScopeScore(stories,"state",fetchState),[stories,fetchState]);
  const distScore=useMemo(()=>calcScopeScore(stories,"district",fetchState),[stories,fetchState]);

  useEffect(()=>{const label=new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});setNatHistory(p=>{const last=p[p.length-1];if(last&&last.score===natScore)return p;return[...p,{label,score:natScore}].slice(-40);});},[natScore]);
  useEffect(()=>{try{localStorage.setItem(SK,JSON.stringify(stories));}catch{}},[stories]);

  const runUpgrades=useCallback(async(list)=>{
    const todo=list.filter(s=>s.approved&&!s.aiDone&&!isRL()&&GROQ_API_KEY);
    for(let i=0;i<todo.length;i++){if(isRL())break;const u=await aiUpgrade(todo[i]);setStories(p=>p.map(s=>s.id===u.id?u:s));if(i<todo.length-1)await new Promise(r=>setTimeout(r,5000));}
  },[]);

  const doFetch=useCallback(async()=>{
    if(fetching)return;setFetching(true);
    try{
      const items=await fetchNewsRSS(fetchScope,fetchState,fetchDistrict);
      if(isRL()){setRlState(true);setTimeout(()=>setRlState(false),31000);toast("Rate limited — retry in 30s","error");return;}
      if(!items.length){toast("No relevant stories found","info");return;}
      const newStories=items.map((item,i)=>{
        const cls=classify(item.headline,item.body||"");
        const id="F"+Date.now()+i;
        return{id,ts:Date.now(),headline:item.headline,body:item.body||"",...cls,scope:cls.scope||fetchScope,state:cls.state||(fetchScope==="state"?fetchState:null),approved:true,held:false,aiDone:false};
      });
      setStories(p=>{const ids=new Set(p.map(s=>s.headline.slice(0,50)));const unique=newStories.filter(s=>!ids.has(s.headline.slice(0,50)));if(!unique.length){toast("No new stories","info");return p;}toast(unique.length+" new stories · 3 scores updated","success");return[...unique,...p].slice(0,200);});
      setTimeout(()=>runUpgrades(newStories),2000);
    }finally{setFetching(false);}
  },[fetching,fetchScope,fetchState,fetchDistrict,runUpgrades,toast]);

  useEffect(()=>{if(autoOn){setCountdown(120);countRef.current=setInterval(()=>setCountdown(c=>{if(c<=1){doFetch();return 120;}return c-1;}),1000);return()=>clearInterval(countRef.current);}else{clearInterval(countRef.current);setCountdown(120);}},[autoOn,doFetch]);
  useEffect(()=>{if(user)setTimeout(()=>doFetch(),1500);},[user]);

  const handleSignIn=useCallback((u)=>{setUser(u);localStorage.setItem("dtn_user",JSON.stringify(u));},[]);
  const handleDisc=useCallback(()=>{setShowDisc(false);localStorage.setItem("dtn_disc","1");},[]);
  const handleReview=useCallback((id,action)=>{setStories(p=>p.map(s=>s.id===id?{...s,approved:action==="approve",held:action==="hold"}:s));toast(action==="approve"?"Approved and scored":"Story "+action+"ed","success");},[toast]);
  const handleSubmit=useCallback((form)=>{const cls=classify(form.headline,form.body);setStories(p=>[{id:"C"+Date.now(),ts:Date.now(),headline:form.headline,body:form.body,state:form.state||null,scope:form.scope,...cls,source:form.source,approved:false,held:false,aiDone:false},...p]);},[]);

  const pending=stories.filter(s=>!s.approved&&!s.held).length;

  if(!user)return<SignInPage onSignIn={handleSignIn} lang={lang} setLang={setLang} t={t}/>;
  if(showDisc)return<DisclaimerPage onAccept={handleDisc} t={t} userName={user.name}/>;

  return(
    <div className="shell">
      <Sidebar page={page} setPage={setPage} pending={pending} t={t} user={user} lang={lang} setLang={setLang}/>
      <div className="main-area">
        <Topbar natScore={natScore} stScore={stScore} distScore={distScore} fetching={fetching} onFetch={doFetch} autoOn={autoOn} setAutoOn={setAutoOn} rl={rl} fetchScope={fetchScope} setFetchScope={setFetchScope} fetchState={fetchState} setFetchState={setFetchState} fetchDistrict={fetchDistrict} setFetchDistrict={setFetchDistrict} t={t}/>
        <LiveTicker stories={stories} countdown={countdown} autoOn={autoOn} natScore={natScore} stScore={stScore} distScore={distScore}/>
        <main className="page">
          {page==="dashboard"&&<Dashboard natScore={natScore} stScore={stScore} distScore={distScore} stories={stories} natHistory={natHistory} fetchState={fetchState} fetchDistrict={fetchDistrict} t={t} setPage={setPage} setFetchScope={setFetchScope}/>}
          {page==="feed"&&<FeedPage stories={stories} fetching={fetching} onFetch={doFetch} onAI={()=>runUpgrades(stories)} countdown={countdown} autoOn={autoOn} t={t}/>}
          {page==="rights"&&<MyRightsPage scope={scope} setScope={setScope} t={t}/>}
          {page==="patterns"&&<PatternsPage stories={stories} t={t}/>}
          {page==="timeline"&&<TimelinePage stories={stories} natHistory={natHistory} t={t}/>}
          {page==="constitution"&&<ConstitutionPage/>}
          {page==="score"&&<ScorePage natScore={natScore} stScore={stScore} distScore={distScore} stories={stories} fetchState={fetchState} fetchDistrict={fetchDistrict} t={t}/>}
          {page==="anomalies"&&<AnomaliesPage stories={stories} t={t}/>}
          {page==="states"&&<StatesPage stories={stories} t={t}/>}
          {page==="departments"&&<DepartmentsPage stories={stories} t={t}/>}
          {page==="submit"&&<SubmitPage onSubmit={handleSubmit} toast={toast} t={t}/>}
          {page==="review"&&<ReviewPage stories={stories} onReview={handleReview} t={t}/>}
          {page==="method"&&<MethodPage t={t}/>}
          {page==="about"&&<AboutPage t={t}/>}
        </main>
      </div>
      <nav className="mobile-nav">
        {MOBILE_NAV.map(item=>(
          <button key={item.id} className={"mobile-nav-btn"+(page===item.id?" active":"")} onClick={()=>setPage(item.id)}>
            <span className="m-icon">{item.icon}</span>
            <span style={{fontSize:8}}>{(t[item.tk]||item.tk).slice(0,6)}</span>
          </button>
        ))}
      </nav>
      <Toasts items={toasts}/>
    </div>
  );
}
