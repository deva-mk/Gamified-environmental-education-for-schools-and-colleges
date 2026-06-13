import { saveScore } from './firebase.js';

// ---- STATE ----
let studentName = '';
let studentClass = '';
let currentLang = 'en';
let totalXP = 0;
let lives = 3;
let currentDifficulty = 'beginner';
let currentLevelNum = 1;
let currentQuestion = 0;
let score = 0;
let questions = [];
let answered = false;
let levelsDone = 0;
const completed = { beginner: {}, intermediate: {}, advanced: {} };

// ---- SPLASH ----
function showSplash2() { showScreen('splash2-screen'); }
function showLogin()   { showScreen('login-screen'); }

// ---- LOGIN ----
function handleLogin() {
  const name = document.getElementById('student-name').value.trim();
  const cls  = document.getElementById('student-class').value.trim();
  if (!name) { alert('Please enter your name!'); return; }
  studentName  = name;
  studentClass = cls || 'Student';
  document.getElementById('welcome-name').textContent = `Hi, ${studentName}! 👋`;
  document.getElementById('student-class-display').textContent = studentClass;
  showScreen('home-screen');
  updateHomeUI();
}

function logout() {
  studentName = ''; studentClass = ''; totalXP = 0; levelsDone = 0;
  Object.keys(completed).forEach(d => completed[d] = {});
  document.getElementById('student-name').value = '';
  document.getElementById('student-class').value = '';
  showScreen('login-screen');
}

// ---- LANGUAGE ----
const levelNames = {
  en: { b1:'What is AI?', b2:'AI in Daily Life', b3:'AI Tools', i1:'How AI Thinks', i2:'Machine Learning', i3:'AI Ethics', a1:'Deep Learning', a2:'AI in Future', a3:'Build with AI' },
  ta: { b1:'AI என்றால் என்ன?', b2:'அன்றாட வாழ்வில் AI', b3:'AI கருவிகள்', i1:'AI எப்படி சிந்திக்கிறது?', i2:'இயந்திர கற்றல்', i3:'AI நெறிமுறைகள்', a1:'ஆழமான கற்றல்', a2:'எதிர்கால AI', a3:'AI-உடன் கட்டுங்கள்' }
};

function setLang(lang) {
  currentLang = lang;
  document.getElementById('btn-en').classList.toggle('active', lang === 'en');
  document.getElementById('btn-ta').classList.toggle('active', lang === 'ta');
  const n = levelNames[lang];
  ['b1','b2','b3','i1','i2','i3','a1','a2','a3'].forEach(k => {
    document.getElementById(k+'-name').textContent = n[k];
  });
}

// ---- QUIZ DATA ----
const quizData = {
  en: {
    beginner: {
      1: [
        { q:"What does AI stand for?", options:["Automated Internet","Artificial Intelligence","Advanced Input","Automated Information"], answer:1 },
        { q:"Which is an example of AI?", options:["A fan","A calculator","Google Assistant","A light bulb"], answer:2 },
        { q:"AI learns from ___.", options:["Electricity","Data","Sunlight","People only"], answer:1 },
        { q:"Which company made ChatGPT?", options:["Google","Microsoft","OpenAI","Apple"], answer:2 },
        { q:"AI helps humans by ___.", options:["Replacing all jobs","Doing repetitive tasks faster","Feeling emotions","None of these"], answer:1 }
      ],
      2: [
        { q:"Which app uses AI to recommend videos?", options:["Calculator","YouTube","Notepad","Paint"], answer:1 },
        { q:"Face unlock uses which AI technology?", options:["Sound recognition","Face recognition","Text recognition","Motion detection"], answer:1 },
        { q:"Google Maps uses AI to ___.", options:["Play music","Predict traffic and suggest routes","Send emails","Take photos"], answer:1 },
        { q:"Which of these is an AI chatbot?", options:["WhatsApp","Instagram","ChatGPT","Gmail"], answer:2 },
        { q:"Netflix recommends movies using ___.", options:["Random selection","Your watch history and AI","Alphabetical order","Most popular only"], answer:1 }
      ],
      3: [
        { q:"What is ChatGPT used for?", options:["Playing games","Answering questions and writing","Editing photos","Making calls"], answer:1 },
        { q:"Which AI tool generates images from text?", options:["Excel","DALL-E","Word","Paint"], answer:1 },
        { q:"Google Gemini is ___.", options:["A music app","An AI assistant by Google","A photo editor","A game"], answer:1 },
        { q:"Grammarly uses AI to ___.", options:["Translate languages","Check and fix grammar","Generate images","Write code"], answer:1 },
        { q:"Which is a free AI tool for students?", options:["ChatGPT","Gemini","Copilot","All of the above"], answer:3 }
      ]
    },
    intermediate: {
      1: [
        { q:"What is an algorithm?", options:["A type of computer","A step-by-step set of instructions","A programming language","A robot"], answer:1 },
        { q:"AI makes decisions based on ___.", options:["Guessing","Patterns learned from data","Random numbers","Human emotions"], answer:1 },
        { q:"What is a neural network inspired by?", options:["The internet","The human brain","A calculator","A spreadsheet"], answer:1 },
        { q:"Which of these is NOT a type of AI?", options:["Computer Vision","Natural Language Processing","Wi-Fi","Machine Learning"], answer:2 },
        { q:"What does NLP stand for?", options:["Natural Language Processing","New Learning Program","Network Layer Protocol","None"], answer:0 }
      ],
      2: [
        { q:"What is Machine Learning?", options:["Robots building machines","AI learning from data without explicit programming","Programming every rule manually","Using calculators"], answer:1 },
        { q:"Which is a Machine Learning task?", options:["Spam detection in email","Switching on a fan","Printing a document","Charging a phone"], answer:0 },
        { q:"Training data is ___.", options:["Data used to teach AI models","Data stored in USB","Random internet files","Social media posts only"], answer:0 },
        { q:"What is overfitting in ML?", options:["Model works on all data","Model memorizes training data and fails on new data","Model trains too slowly","Model uses too much power"], answer:1 },
        { q:"Supervised learning uses ___.", options:["Unlabelled data","Labelled data with correct answers","No data at all","Only images"], answer:1 }
      ],
      3: [
        { q:"AI bias happens when ___.", options:["AI runs too fast","AI makes unfair decisions due to biased training data","AI uses too much power","AI crashes"], answer:1 },
        { q:"Which is an ethical concern with AI?", options:["AI is too cheap","Privacy invasion and data misuse","AI works too fast","AI is colourful"], answer:1 },
        { q:"Deepfake technology is a concern because ___.", options:["It makes videos blurry","It creates fake but realistic videos to mislead people","It uses too much storage","It slows the internet"], answer:1 },
        { q:"Who is responsible for AI decisions?", options:["Nobody","Only the AI","Developers and organizations deploying AI","The government only"], answer:2 },
        { q:"Responsible AI means ___.", options:["AI that charges itself","AI that is fair, transparent and safe for all","AI that works offline","AI that is expensive"], answer:1 }
      ]
    },
    advanced: {
      1: [
        { q:"What is Deep Learning?", options:["Learning in a basement","A subset of ML using multi-layered neural networks","Programming with deep code","Learning very slowly"], answer:1 },
        { q:"What are layers in a neural network?", options:["Physical floors in a building","Groups of neurons that process and transform data","Levels in a video game","Types of cables"], answer:1 },
        { q:"What is a CNN used for?", options:["Translating text","Image recognition and computer vision","Weather prediction","Playing music"], answer:1 },
        { q:"What is a Large Language Model (LLM)?", options:["A very big dictionary","An AI model trained on massive text to understand language","A translation tool only","A search engine"], answer:1 },
        { q:"What does backpropagation do in training?", options:["It stores data","It adjusts model weights to reduce errors","It speeds up the CPU","It connects to internet"], answer:1 }
      ],
      2: [
        { q:"Which field will AI transform most by 2030?", options:["Only gaming","Healthcare, education, transport and more","Only social media","Only music"], answer:1 },
        { q:"What is AGI?", options:["Advanced Gaming Interface","Artificial General Intelligence — AI that can do any task like humans","A Google product","A new programming language"], answer:1 },
        { q:"AI in healthcare can ___.", options:["Replace all doctors immediately","Detect diseases early and assist doctors","Only manage hospital bills","Only book appointments"], answer:1 },
        { q:"A self-driving car is an example of ___.", options:["Basic automation","AI combining computer vision, sensors and decision-making","Simple programming","Remote control technology"], answer:1 },
        { q:"The biggest challenge for future AI is ___.", options:["Making AI faster","Ensuring AI is safe, unbiased and beneficial to all","Making AI cheaper","Making AI louder"], answer:1 }
      ],
      3: [
        { q:"What is a Prompt in AI?", options:["A power cable","The input instruction you give to an AI model","A type of database","An AI company"], answer:1 },
        { q:"Which API can add AI to your app for free?", options:["Only paid APIs","Google Gemini API free tier","No free APIs exist","Only OpenAI"], answer:1 },
        { q:"What does API stand for?", options:["Application Programming Interface","Automated Process Integration","Apple Programming Interface","Advanced Protocol Internet"], answer:0 },
        { q:"Most common language to build AI apps?", options:["Tamil","Python","Microsoft Word","HTML only"], answer:1 },
        { q:"What is prompt engineering?", options:["Building physical machines","Crafting effective inputs to get better AI outputs","Engineering a new language","Drawing circuit diagrams"], answer:1 }
      ]
    }
  },
  ta: {
    beginner: {
      1: [
        { q:"AI என்பதன் முழு வடிவம் என்ன?", options:["Automated Internet","Artificial Intelligence","Advanced Input","Automated Information"], answer:1 },
        { q:"இவற்றில் AI-யின் உதாரணம் எது?", options:["மின்விசிறி","கணிப்பான்","Google Assistant","விளக்கு"], answer:2 },
        { q:"AI ___ மூலம் கற்றுக்கொள்கிறது.", options:["மின்சாரம்","தரவு (Data)","சூரிய ஒளி","மனிதர்கள் மட்டும்"], answer:1 },
        { q:"ChatGPT-ஐ உருவாக்கிய நிறுவனம் எது?", options:["Google","Microsoft","OpenAI","Apple"], answer:2 },
        { q:"AI மனிதர்களுக்கு எவ்வாறு உதவுகிறது?", options:["எல்லா வேலைகளையும் மாற்றுகிறது","திரும்பத் திரும்பும் வேலைகளை வேகமாக செய்கிறது","உணர்வுகளை உணர்கிறது","எதுவும் இல்லை"], answer:1 }
      ],
      2: [
        { q:"எந்த app வீடியோக்களை பரிந்துரைக்க AI பயன்படுத்துகிறது?", options:["Calculator","YouTube","Notepad","Paint"], answer:1 },
        { q:"முக அறிதல் எந்த AI தொழில்நுட்பத்தை பயன்படுத்துகிறது?", options:["ஒலி அறிதல்","முக அறிதல்","உரை அறிதல்","இயக்க கண்டறிதல்"], answer:1 },
        { q:"Google Maps AI-ஐ எதற்கு பயன்படுத்துகிறது?", options:["இசை வாசிக்க","போக்குவரத்தை கணிக்க மற்றும் வழி சொல்ல","மின்னஞ்சல் அனுப்ப","படம் எடுக்க"], answer:1 },
        { q:"இவற்றில் AI chatbot எது?", options:["WhatsApp","Instagram","ChatGPT","Gmail"], answer:2 },
        { q:"Netflix திரைப்படங்களை பரிந்துரைக்க ___ பயன்படுத்துகிறது.", options:["சீரற்ற தேர்வு","உங்கள் பார்வை வரலாறும் AI-யும்","அகர வரிசை","மிகவும் பிரபலமானவை மட்டும்"], answer:1 }
      ],
      3: [
        { q:"ChatGPT எதற்கு பயன்படுகிறது?", options:["விளையாட்டு விளையாட","கேள்விகளுக்கு பதில் சொல்ல மற்றும் உரை எழுத","புகைப்படங்களை திருத்த","அழைப்புகள் செய்ய"], answer:1 },
        { q:"உரையிலிருந்து படங்களை உருவாக்கும் AI கருவி எது?", options:["Excel","DALL-E","Word","Paint"], answer:1 },
        { q:"Google Gemini என்பது ___.", options:["இசை app","Google-இன் AI உதவியாளர்","புகைப்பட திருத்தி","விளையாட்டு"], answer:1 },
        { q:"Grammarly AI-ஐ எதற்கு பயன்படுத்துகிறது?", options:["மொழிகளை மொழிபெயர்க்க","இலக்கண பிழைகளை சரிசெய்ய","படங்கள் உருவாக்க","குறியீடு எழுத"], answer:1 },
        { q:"மாணவர்களுக்கான இலவச AI கருவி எது?", options:["ChatGPT","Gemini","Copilot","மேற்கூறிய அனைத்தும்"], answer:3 }
      ]
    },
    intermediate: {
      1: [
        { q:"அல்காரிதம் என்றால் என்ன?", options:["ஒரு வகை கணினி","படிப்படியான வழிமுறைகளின் தொகுப்பு","ஒரு நிரலாக்க மொழி","ஒரு ரோபோ"], answer:1 },
        { q:"AI முடிவுகளை எதன் அடிப்படையில் எடுக்கிறது?", options:["யூகிப்பதன் மூலம்","தரவிலிருந்து கற்ற முறைகளின் அடிப்படையில்","சீரற்ற எண்கள்","மனித உணர்வுகள்"], answer:1 },
        { q:"நரம்பியல் வலையமைப்பு எதனால் ஈர்க்கப்பட்டது?", options:["இணையம்","மனித மூளை","கணிப்பான்","விரிதாள்"], answer:1 },
        { q:"இவற்றில் AI வகை அல்லாதது எது?", options:["Computer Vision","Natural Language Processing","Wi-Fi","Machine Learning"], answer:2 },
        { q:"NLP என்பதன் முழு வடிவம் என்ன?", options:["Natural Language Processing","New Learning Program","Network Layer Protocol","எதுவும் இல்லை"], answer:0 }
      ],
      2: [
        { q:"இயந்திர கற்றல் என்றால் என்ன?", options:["ரோபோக்கள் இயந்திரங்களை கட்டுவது","நிரலாக்கமின்றி தரவிலிருந்து AI கற்றுக்கொள்வது","ஒவ்வொரு விதியையும் கையாளுதல்","கணிப்பான்களை பயன்படுத்துவது"], answer:1 },
        { q:"இவற்றில் ML பணி எது?", options:["மின்னஞ்சலில் spam கண்டறிதல்","மின்விசிறி இயக்குதல்","ஆவணம் அச்சிடுதல்","தொலைபேசி சார்ஜ் செய்தல்"], answer:0 },
        { q:"பயிற்சி தரவு என்பது ___.", options:["AI மாதிரிகளுக்கு கற்பிக்க பயன்படும் தரவு","USB-ல் சேமிக்கப்பட்ட தரவு","சீரற்ற இணைய கோப்புகள்","சமூக ஊடக இடுகைகள் மட்டும்"], answer:0 },
        { q:"ML-ல் overfitting என்றால் என்ன?", options:["மாதிரி அனைத்து தரவிலும் செயல்படுகிறது","மாதிரி பயிற்சி தரவை மனப்பாடம் செய்து புதிய தரவில் தோல்வியடைகிறது","மாதிரி மிகவும் மெதுவாக பயிலுகிறது","மாதிரி அதிக சக்தி பயன்படுத்துகிறது"], answer:1 },
        { q:"Supervised learning ___ பயன்படுத்துகிறது.", options:["லேபிளிடப்படாத தரவு","சரியான விடைகளுடன் லேபிளிடப்பட்ட தரவு","தரவே இல்லாமல்","படங்கள் மட்டும்"], answer:1 }
      ],
      3: [
        { q:"AI bias எப்போது நடக்கிறது?", options:["AI மிகவும் வேகமாக இயங்கும்போது","சார்புடைய பயிற்சி தரவு காரணமாக AI நியாயமற்ற முடிவுகளை எடுக்கும்போது","AI அதிக சக்தி பயன்படுத்தும்போது","AI செயலிழக்கும்போது"], answer:1 },
        { q:"AI-யின் நெறிமுறை கவலை எது?", options:["AI மிகவும் மலிவானது","தனியுரிமை மீறல் மற்றும் தரவு துஷ்பிரயோகம்","AI மிகவும் வேகமாக செயல்படுகிறது","AI வண்ணமயமாக உள்ளது"], answer:1 },
        { q:"Deepfake தொழில்நுட்பம் ஒரு கவலை ஏனென்றால் ___.", options:["அது வீடியோக்களை மங்கலாக்குகிறது","மக்களை தவறாக வழிநடத்த போலியான ஆனால் யதார்த்தமான வீடியோக்களை உருவாக்க முடியும்","அது அதிக சேமிப்பக இடத்தை பயன்படுத்துகிறது","அது இணையத்தை மெதுவாக்குகிறது"], answer:1 },
        { q:"AI முடிவுகளுக்கு யார் பொறுப்பு?", options:["யாரும் இல்லை","AI மட்டுமே","AI-ஐ உருவாக்கி பயன்படுத்தும் டெவலப்பர்கள் மற்றும் நிறுவனங்கள்","அரசாங்கம் மட்டும்"], answer:2 },
        { q:"பொறுப்பான AI என்றால் ___.", options:["தானே சார்ஜ் ஆகும் AI","அனைவருக்கும் நியாயமான, வெளிப்படையான மற்றும் பாதுகாப்பான AI","ஆஃப்லைனில் வேலை செய்யும் AI","விலையுயர்ந்த AI"], answer:1 }
      ]
    },
    advanced: {
      1: [
        { q:"Deep Learning என்றால் என்ன?", options:["ஒரு தளவாடத்தில் கற்றல்","பல அடுக்கு நரம்பியல் வலையமைப்புகளை பயன்படுத்தும் ML-இன் ஒரு பிரிவு","ஆழமான குறியீட்டுடன் நிரலாக்கம்","மிகவும் மெதுவாக கற்றல்"], answer:1 },
        { q:"நரம்பியல் வலையமைப்பில் அடுக்குகள் என்றால் என்ன?", options:["கட்டிடத்தில் உள்ள தளங்கள்","தரவை செயலாக்கி மாற்றும் நியூரான்களின் குழுக்கள்","வீடியோ கேமில் நிலைகள்","கேபிள் வகைகள்"], answer:1 },
        { q:"CNN எதற்கு பயன்படுகிறது?", options:["உரையை மொழிபெயர்க்க","படம் அறிதல் மற்றும் கணினி பார்வை","வானிலை கணிப்பு","இசை வாசிக்க"], answer:1 },
        { q:"LLM என்றால் என்ன?", options:["மிகவும் பெரிய அகராதி","மொழியை புரிந்துகொள்ளவும் உருவாக்கவும் பாரிய உரை தரவில் பயிற்றுவிக்கப்பட்ட AI மாதிரி","மொழிபெயர்ப்பு கருவி மட்டும்","தேடுபொறி"], answer:1 },
        { q:"பயிற்சியில் backpropagation-இன் பங்கு என்ன?", options:["தரவை சேமிக்கிறது","பிழைகளை குறைக்க மாதிரி எடையை சரிசெய்கிறது","CPU-ஐ வேகப்படுத்துகிறது","இணையத்துடன் இணைக்கிறது"], answer:1 }
      ],
      2: [
        { q:"2030 வரையில் AI எந்த துறையை அதிகமாக மாற்றும்?", options:["கேமிங் மட்டும்","சுகாதாரம், கல்வி, போக்குவரத்து மற்றும் பலவற்றை","சமூக ஊடகங்கள் மட்டும்","இசை மட்டும்"], answer:1 },
        { q:"AGI என்றால் என்ன?", options:["Advanced Gaming Interface","மனிதர்களைப் போல எந்த அறிவார்ந்த பணியையும் செய்யக்கூடிய AI","ஒரு Google தயாரிப்பு","ஒரு புதிய நிரலாக்க மொழி"], answer:1 },
        { q:"சுகாதாரத்தில் AI ___.", options:["உடனடியாக அனைத்து மருத்துவர்களையும் மாற்றும்","நோய்களை முன்கூட்டியே கண்டறிந்து மருத்துவர்களுக்கு உதவும்","மருத்துவமனை கட்டணங்களை மட்டும் நிர்வகிக்கும்","சந்திப்புகளை மட்டும் பதிவு செய்யும்"], answer:1 },
        { q:"சுய-ஓட்டும் கார் எதற்கு உதாரணம்?", options:["அடிப்படை தானியங்கி","கணினி பார்வை, சென்சார்கள் மற்றும் முடிவெடுத்தலை ஒருங்கிணைக்கும் AI","எளிய நிரலாக்கம்","ரிமோட் கண்ட்ரோல் தொழில்நுட்பம்"], answer:1 },
        { q:"AI-இன் எதிர்காலத்தில் மிகப்பெரிய சவால் ___.", options:["AI-ஐ வேகப்படுத்துவது","AI அனைத்து மனிதர்களுக்கும் பாதுகாப்பான, சார்பற்ற மற்றும் பயனுள்ளதாக இருப்பதை உறுதி செய்வது","AI-ஐ மலிவாக்குவது","AI-ஐ சத்தமாக்குவது"], answer:1 }
      ],
      3: [
        { q:"AI-ல் Prompt என்றால் என்ன?", options:["ஒரு சக்தி கேபிள்","AI மாதிரிக்கு நீங்கள் கொடுக்கும் உள்ளீட்டு வழிமுறை","ஒரு வகை தரவுத்தளம்","ஒரு AI நிறுவனம்"], answer:1 },
        { q:"உங்கள் app-ல் AI சேர்க்க இலவசமாக எந்த API பயன்படுத்தலாம்?", options:["கட்டண API மட்டும்","Google Gemini API இலவச அடுக்கு","இலவச API இல்லை","OpenAI மட்டும்"], answer:1 },
        { q:"API என்பதன் முழு வடிவம் என்ன?", options:["Application Programming Interface","Automated Process Integration","Apple Programming Interface","Advanced Protocol Internet"], answer:0 },
        { q:"AI app-களை கட்டுவதற்கு மிகவும் பொதுவாக பயன்படுத்தப்படும் மொழி எது?", options:["தமிழ்","Python","Microsoft Word","HTML மட்டும்"], answer:1 },
        { q:"Prompt engineering என்றால் என்ன?", options:["உடல் இயந்திரங்களை கட்டுவது","AI-லிருந்து சிறந்த வெளியீடுகளைப் பெற பயனுள்ள உள்ளீடுகளை வடிவமைப்பது","புதிய மொழியை வடிவமைப்பது","சர்க்யூட் வரைபடங்களை வரைவது"], answer:1 }
      ]
    }
  }
};

// ---- BIAS DETECTIVE GAME ----
const biasScenarios = [
  {
    title: "Scenario 1 — Job Application AI",
    text: "A company uses an AI to shortlist job applicants. The AI was trained on 10 years of past hiring data. The company historically hired mostly men. Now the AI rejects most female applicants automatically. What is the problem?",
    options: ["The AI is working correctly", "The AI is biased because it learned from unfair historical data", "Women are less qualified", "The AI needs more speed"],
    answer: 1,
    explanation: "✅ This is AI bias! The AI learned from biased historical data where women were unfairly rejected. This is called Historical Bias — when past human discrimination gets encoded into AI systems."
  },
  {
    title: "Scenario 2 — Facial Recognition",
    text: "A police department uses an AI facial recognition system. The system correctly identifies white faces 99% of the time but only 65% for dark-skinned faces. The AI was trained mostly on white faces. Is this a problem?",
    options: ["No, 65% is good enough", "No, this is normal for AI", "Yes, this is racial bias that can cause wrongful arrests", "Yes, but only a minor technical issue"],
    answer: 2,
    explanation: "✅ This is dangerous racial bias! This has caused real wrongful arrests. AI trained on non-diverse data performs poorly for underrepresented groups — a serious AI ethics violation."
  },
  {
    title: "Scenario 3 — Loan Approval AI",
    text: "A bank uses AI to approve loans. The AI denies loans to people from certain zip codes (areas). These zip codes happen to be where lower-income and minority communities live. The AI was never told about race — it just used zip codes. Is this bias?",
    options: ["No, zip codes are not race", "No, the AI is just being smart", "Yes, this is indirect discrimination called Proxy Bias", "Yes, but only if the AI mentioned race directly"],
    answer: 2,
    explanation: "✅ This is Proxy Bias! Even without using race directly, using zip codes can indirectly discriminate. Responsible AI must check if its decisions have unfair real-world impacts on specific communities."
  },
  {
    title: "Scenario 4 — Deepfake Video",
    text: "You see a video of a famous politician saying something shocking and controversial. The video looks 100% real. Your friend shares it saying 'This is proof!' Before sharing further, what should you do?",
    options: ["Share it immediately — it looks real", "Check if it's from a verified news source and look for deepfake signs", "Believe it because it's a video", "Ignore it completely"],
    answer: 1,
    explanation: "✅ Always verify before sharing! Deepfake videos use AI to create fake but realistic content. Signs include: unnatural blinking, blurry edges around face, voice not matching lip movement. Responsible AI use means critical thinking!"
  },
  {
    title: "Scenario 5 — AI Content Moderation",
    text: "A social media AI moderates content and removes posts. It removes posts in English about violence correctly. But it fails to remove harmful posts in Tamil and Hindi because it was trained only on English data. What is the ethical issue?",
    options: ["There is no issue", "The AI is too strict", "The AI is unfair to non-English speakers due to language bias", "English should be the only language online"],
    answer: 2,
    explanation: "✅ This is Language Bias! AI systems trained on limited language data fail minority language speakers. This is exactly why our EcoChronicles app supports Tamil — ensuring AI literacy reaches everyone equally!"
  }
];

let biasQuestion = 0;
let biasScore = 0;

function showBiasGame() {
  biasQuestion = 0;
  biasScore = 0;
  showScreen('bias-screen');
  renderBiasQuestion();
}

function renderBiasQuestion() {
  const container = document.getElementById('bias-game-content');
  if (biasQuestion >= biasScenarios.length) {
    container.innerHTML = `
      <div class="bias-score-box">
        <div class="bias-final-score">${biasScore}/${biasScenarios.length}</div>
        <div class="bias-final-label">Bias scenarios identified correctly!</div>
        <br/>
        ${biasScore >= 4 ? '🏆 Excellent! You are a true Bias Detective!' : biasScore >= 3 ? '🎉 Good job! Keep learning about AI ethics.' : '💪 Keep practicing — AI ethics is important!'}
        <br/><br/>
        <button class="play-again-btn" onclick="goHome()">Back to Home</button>
      </div>`;
    return;
  }
  const s = biasScenarios[biasQuestion];
  container.innerHTML = `
    <p class="bias-progress">Scenario ${biasQuestion + 1} of ${biasScenarios.length}</p>
    <div class="bias-scenario">
      <div class="bias-scenario-title">${s.title}</div>
      <div class="bias-scenario-text">${s.text}</div>
    </div>
    <div class="bias-options">
      ${s.options.map((opt, i) => `
        <button class="bias-opt-btn" onclick="selectBiasAnswer(${i})">${opt}</button>
      `).join('')}
    </div>
    <div class="bias-explanation" id="bias-explanation">${s.explanation}</div>
    <button id="bias-next-btn" class="next-btn hidden" onclick="nextBiasQuestion()" style="margin-top:14px">Next Scenario ➜</button>
  `;
}

function selectBiasAnswer(selected) {
  const s = biasScenarios[biasQuestion];
  const btns = document.querySelectorAll('.bias-opt-btn');
  btns.forEach(b => b.disabled = true);
  btns[selected].classList.add(selected === s.answer ? 'correct' : 'wrong');
  if (selected === s.answer) { btns[s.answer].classList.add('correct'); biasScore++; }
  else { btns[s.answer].classList.add('correct'); }
  document.getElementById('bias-explanation').style.display = 'block';
  document.getElementById('bias-next-btn').classList.remove('hidden');
}

function nextBiasQuestion() {
  biasQuestion++;
  renderBiasQuestion();
}

// ---- HOME UI ----
const xpMap = { beginner: 50, intermediate: 100, advanced: 150 };
const levelOrder = [
  { id:'b1', diff:'beginner', num:1 }, { id:'b2', diff:'beginner', num:2 }, { id:'b3', diff:'beginner', num:3 },
  { id:'i1', diff:'intermediate', num:1 }, { id:'i2', diff:'intermediate', num:2 }, { id:'i3', diff:'intermediate', num:3 },
  { id:'a1', diff:'advanced', num:1 }, { id:'a2', diff:'advanced', num:2 }, { id:'a3', diff:'advanced', num:3 },
];

function updateHomeUI() {
  document.getElementById('total-xp').textContent = totalXP;
  document.getElementById('levels-done').textContent = levelsDone;
  document.getElementById('streak-count').textContent = levelsDone > 0 ? 1 : 0;

  levelOrder.forEach((lvl, idx) => {
    const btn = document.getElementById(lvl.id + '-btn');
    const statusEl = document.getElementById(lvl.id + '-status');
    if (!btn) return;
    const isDone = completed[lvl.diff][lvl.num];
    const prevDone = idx === 0 ? true : completed[levelOrder[idx-1].diff][levelOrder[idx-1].num];
    btn.classList.remove('unlocked','locked','completed');
    if (isDone) { btn.classList.add('completed'); statusEl.textContent = '✅'; btn.disabled = false; }
    else if (prevDone) { btn.classList.add('unlocked'); statusEl.textContent = '▶'; btn.disabled = false; }
    else { btn.classList.add('locked'); statusEl.textContent = '🔒'; btn.disabled = true; }
  });
}

// ---- QUIZ ----
function startQuiz(difficulty, levelNum) {
  currentDifficulty = difficulty;
  currentLevelNum = levelNum;
  currentQuestion = 0;
  score = 0;
  lives = 3;
  answered = false;
  questions = quizData[currentLang][difficulty][levelNum];
  document.getElementById('score').textContent = 0;
  updateLivesDisplay();
  showScreen('quiz-screen');
  loadQuestion();
}

function updateLivesDisplay() {
  document.getElementById('lives-display').textContent = '❤️'.repeat(lives) + '🖤'.repeat(3 - lives);
}

function loadQuestion() {
  const q = questions[currentQuestion];
  const total = questions.length;
  document.getElementById('q-number').textContent = `Question ${currentQuestion + 1} of ${total}`;
  document.getElementById('q-text').textContent = q.q;
  document.getElementById('progress-fill').style.width = `${(currentQuestion / total) * 100}%`;
  const container = document.getElementById('options-container');
  container.innerHTML = '';
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.onclick = () => selectAnswer(i, q.answer, btn);
    container.appendChild(btn);
  });
  document.getElementById('feedback-box').classList.add('hidden');
  document.getElementById('next-btn').classList.add('hidden');
  answered = false;
}

function selectAnswer(selected, correct, btn) {
  if (answered) return;
  answered = true;
  const allBtns = document.querySelectorAll('.option-btn');
  allBtns.forEach(b => b.disabled = true);
  if (selected === correct) {
    btn.classList.add('correct'); score++;
    totalXP += Math.round(xpMap[currentDifficulty] / questions.length);
    document.getElementById('score').textContent = score;
    showFeedback(true);
  } else {
    btn.classList.add('wrong');
    allBtns[correct].classList.add('correct');
    lives--; updateLivesDisplay();
    showFeedback(false);
  }
  document.getElementById('next-btn').classList.remove('hidden');
}

function showFeedback(isCorrect) {
  const box = document.getElementById('feedback-box');
  box.textContent = isCorrect ? '✅ Correct! Keep going!' : '❌ Wrong! The highlighted answer is correct.';
  box.classList.remove('hidden');
}

function nextQuestion() {
  if (lives <= 0) { showScreen('gameover-screen'); return; }
  currentQuestion++;
  if (currentQuestion < questions.length) { loadQuestion(); }
  else { showResult(); }
}

async function showResult() {
  const total = questions.length;
  document.getElementById('final-score').textContent = score;
  document.getElementById('total-q').textContent = total;
  const xpEarned = Math.round((score / total) * xpMap[currentDifficulty]);
  document.getElementById('xp-earned').textContent = `+${xpEarned} XP earned!`;
  let icon = '🏆', title = 'Well Done!', badge = '';
  if (score === total) { icon = '🥇'; title = 'Perfect Score!'; badge = '🌟 AI Star'; }
  else if (score >= 3) { icon = '🎉'; title = 'Great Job!'; badge = '🔥 Explorer'; }
  else { icon = '💪'; title = 'Keep Trying!'; badge = '📚 Learner'; }
  document.getElementById('result-icon').textContent = icon;
  document.getElementById('result-title').textContent = title;
  document.getElementById('badge-box').textContent = badge;
  document.getElementById('save-status').textContent = 'Saving your score...';
  showScreen('result-screen');
  if (score >= 3) { completed[currentDifficulty][currentLevelNum] = true; levelsDone++; }
  updateHomeUI();
  await saveScore(studentName, `${currentDifficulty}-${currentLevelNum}`, score, total, currentLang, studentClass);
  document.getElementById('save-status').textContent = '✅ Score saved!';
}

function goHome() { updateHomeUI(); showScreen('home-screen'); }

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// ---- GLOBALS ----
window.showSplash2 = showSplash2;
window.showLogin = showLogin;
window.handleLogin = handleLogin;
window.logout = logout;
window.setLang = setLang;
window.startQuiz = startQuiz;
window.nextQuestion = nextQuestion;
window.goHome = goHome;
window.showBiasGame = showBiasGame;
window.selectBiasAnswer = selectBiasAnswer;
window.nextBiasQuestion = nextBiasQuestion;