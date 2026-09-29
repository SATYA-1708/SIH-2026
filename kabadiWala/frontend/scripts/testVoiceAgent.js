import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const en = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/locales/en.json'), 'utf8'));
const hi = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/locales/hi.json'), 'utf8'));
const mr = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/locales/mr.json'), 'utf8'));

const translations = { en, hi, mr };

const NUMBER_WORDS = {
  // English words
  'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
  'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
  'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20,
  'twenty-five': 25, 'twenty five': 25, 'thirty': 30, 'thirty-five': 35,
  'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90, 'hundred': 100,

  // Hindi words
  'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पांच': 5, 'पाँच': 5,
  'छह': 6, 'सात': 7, 'आठ': 8, 'नौ': 9, 'दस': 10,
  'ग्यारह': 11, 'बारह': 12, 'तेरह': 13, 'चौदह': 14, 'पंद्रह': 15,
  'सोलह': 16, 'सत्रह': 17, 'अट्ठारह': 18, 'उन्नीस': 19, 'बीस': 20,
  'पच्चीस': 25, 'तीस': 30, 'पैंतीस': 35, 'चालीस': 40, 'पचास': 50, 'सौ': 100,

  // Marathi words
  'दोन': 2, 'पाच': 5, 'सहा': 6, 'दहा': 10, 'अकरा': 11, 'बारा': 12,
  'तेरा': 13, 'चौदा': 14, 'पंधरा': 15, 'सोळा': 16, 'सतरा': 17,
  'अठरा': 18, 'एकोणीस': 19, 'वीस': 20, 'पंचवीस': 25, 'चाळीस': 40,
  'पन्नास': 50, 'शंभर': 100,
};

function normalizeDevanagariDigits(text) {
  const devanagariDigits = {
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
  };
  return text.replace(/[०-९]/g, (ch) => devanagariDigits[ch] || ch);
}

function extractWeight(rawText) {
  const text = normalizeDevanagariDigits(rawText.toLowerCase());

  const digitRegex = /(\d+(?:\.\d+)?)\s*(?:kg|kilo|kilogram|किलो|किलोग्राम|कलो|कि\.ग्रा\.)/i;
  const match = text.match(digitRegex);
  if (match && match[1]) {
    return parseFloat(match[1]);
  }

  for (const [word, val] of Object.entries(NUMBER_WORDS)) {
    const wordRegex = new RegExp(`\\b${word}\\b\\s*(?:kg|kilo|kilogram|किलो|किलोग्राम|कलो)`, 'i');
    if (wordRegex.test(text)) {
      return val;
    }
  }

  const standaloneMatch = text.match(/\b(\d+(?:\.\d+)?)\b/);
  if (standaloneMatch && standaloneMatch[1]) {
    const val = parseFloat(standaloneMatch[1]);
    if (val > 0 && val <= 1000) {
      return val;
    }
  }

  for (const [word, val] of Object.entries(NUMBER_WORDS)) {
    if (text.includes(word)) {
      return val;
    }
  }

  return undefined;
}

function extractMaterial(rawText, lang) {
  const text = rawText.toLowerCase();
  const languagesToSearch = [lang, 'hi', 'en', 'mr'];

  for (const l of languagesToSearch) {
    const materialDict = translations[l]?.material_names || {};
    for (const [category, synonyms] of Object.entries(materialDict)) {
      if (Array.isArray(synonyms)) {
        for (const syn of synonyms) {
          const s = syn.toLowerCase();
          if (text.includes(s)) {
            return { category, match: syn };
          }
        }
      }
    }
  }
  return undefined;
}

function matchesIntentKeywords(text, phrases) {
  const lower = text.toLowerCase();
  return phrases.some((phrase) => lower.includes(phrase.toLowerCase()));
}

function parseVoiceIntent(transcript, language = 'hi') {
  const text = transcript.trim();
  if (!text) {
    return { intent: 'UNKNOWN', confidence: 0 };
  }

  const langIntents = translations[language]?.voice_intents || translations.en.voice_intents;
  const enIntents = translations.en.voice_intents;
  const hiIntents = translations.hi.voice_intents;
  const mrIntents = translations.mr.voice_intents;

  const detectedMaterial = extractMaterial(text, language);
  const detectedWeight = extractWeight(text);

  const hasWeight = detectedWeight !== undefined;
  const hasCreateLotPhrases =
    matchesIntentKeywords(text, langIntents.create_lot?.phrases || []) ||
    matchesIntentKeywords(text, hiIntents.create_lot?.phrases || []) ||
    matchesIntentKeywords(text, mrIntents.create_lot?.phrases || []) ||
    matchesIntentKeywords(text, enIntents.create_lot?.phrases || []);

  if (hasCreateLotPhrases || (hasWeight && detectedMaterial)) {
    const material = detectedMaterial ? detectedMaterial.category : 'Cable';
    const weight = detectedWeight || 10;
    return {
      intent: 'CREATE_LOT',
      material,
      weight,
      targetPath: '/create-lot',
    };
  }

  const hasPricePhrases =
    matchesIntentKeywords(text, langIntents.price_check?.phrases || []) ||
    matchesIntentKeywords(text, hiIntents.price_check?.phrases || []) ||
    matchesIntentKeywords(text, mrIntents.price_check?.phrases || []) ||
    matchesIntentKeywords(text, enIntents.price_check?.phrases || []);

  if (hasPricePhrases) {
    return {
      intent: 'CHECK_PRICE',
      material: detectedMaterial?.category,
      targetPath: '/prices',
    };
  }

  const hasRecyclerPhrases =
    matchesIntentKeywords(text, langIntents.find_recycler?.phrases || []) ||
    matchesIntentKeywords(text, hiIntents.find_recycler?.phrases || []) ||
    matchesIntentKeywords(text, mrIntents.find_recycler?.phrases || []) ||
    matchesIntentKeywords(text, enIntents.find_recycler?.phrases || []);

  if (hasRecyclerPhrases) {
    return { intent: 'FIND_RECYCLER', targetPath: '/recyclers' };
  }

  const hasEarningsPhrases =
    matchesIntentKeywords(text, langIntents.check_earnings?.phrases || []) ||
    matchesIntentKeywords(text, hiIntents.check_earnings?.phrases || []) ||
    matchesIntentKeywords(text, mrIntents.check_earnings?.phrases || []) ||
    matchesIntentKeywords(text, enIntents.check_earnings?.phrases || []);

  if (hasEarningsPhrases) {
    return { intent: 'CHECK_EARNINGS', targetPath: '/earnings' };
  }

  const hasSafetyPhrases =
    matchesIntentKeywords(text, langIntents.safety_advice?.phrases || []) ||
    matchesIntentKeywords(text, hiIntents.safety_advice?.phrases || []) ||
    matchesIntentKeywords(text, mrIntents.safety_advice?.phrases || []) ||
    matchesIntentKeywords(text, enIntents.safety_advice?.phrases || []);

  if (hasSafetyPhrases) {
    return {
      intent: 'SAFETY_ADVICE',
      material: detectedMaterial?.category,
      targetPath: '/safety',
    };
  }

  const hasStatusPhrases =
    matchesIntentKeywords(text, langIntents.lot_status?.phrases || []) ||
    matchesIntentKeywords(text, hiIntents.lot_status?.phrases || []) ||
    matchesIntentKeywords(text, mrIntents.lot_status?.phrases || []) ||
    matchesIntentKeywords(text, enIntents.lot_status?.phrases || []);

  if (hasStatusPhrases) {
    return { intent: 'CHECK_LOT_STATUS', targetPath: '/lots' };
  }

  return { intent: 'UNKNOWN' };
}

// Test cases spanning all intents and languages
const testCases = [
  // CHECK_PRICE
  { lang: 'hi', input: 'आज पीसीबी का भाव क्या है?', expectedIntent: 'CHECK_PRICE', expectedMat: 'PCB' },
  { lang: 'hi', input: 'तांबे का रेट बताओ', expectedIntent: 'CHECK_PRICE', expectedMat: 'Cable' },
  { lang: 'hi', input: 'आज का भाव दिखाओ', expectedIntent: 'CHECK_PRICE' },
  { lang: 'mr', input: 'आज पीसीबीचा दर काय आहे?', expectedIntent: 'CHECK_PRICE', expectedMat: 'PCB' },
  { lang: 'mr', input: 'केबल वायरचा दर सांगा', expectedIntent: 'CHECK_PRICE', expectedMat: 'Cable' },
  { lang: 'mr', input: 'आजचा भाव फलक उघडा', expectedIntent: 'CHECK_PRICE' },
  { lang: 'en', input: 'What is PCB price today?', expectedIntent: 'CHECK_PRICE', expectedMat: 'PCB' },
  { lang: 'en', input: 'How much is copper wire rate', expectedIntent: 'CHECK_PRICE', expectedMat: 'Cable' },
  { lang: 'en', input: 'Check today scrap prices', expectedIntent: 'CHECK_PRICE' },

  // CREATE_LOT
  { lang: 'hi', input: 'मेरे पास 15 किलो केबल तार है', expectedIntent: 'CREATE_LOT', expectedMat: 'Cable', expectedWeight: 15 },
  { lang: 'hi', input: '20 किलो सर्किट बोर्ड बेचना है', expectedIntent: 'CREATE_LOT', expectedMat: 'PCB', expectedWeight: 20 },
  { lang: 'hi', input: 'नया लॉट 10 किलो बैटरी', expectedIntent: 'CREATE_LOT', expectedMat: 'Battery', expectedWeight: 10 },
  { lang: 'mr', input: 'माझ्याकडे 15 किलो केबल वायर आहे', expectedIntent: 'CREATE_LOT', expectedMat: 'Cable', expectedWeight: 15 },
  { lang: 'mr', input: '२५ किलो जुनी बॅटरी विकायची आहे', expectedIntent: 'CREATE_LOT', expectedMat: 'Battery', expectedWeight: 25 },
  { lang: 'mr', input: '१० किलो पीसीबी जमा करायचे आहे', expectedIntent: 'CREATE_LOT', expectedMat: 'PCB', expectedWeight: 10 },
  { lang: 'en', input: 'I have 15 kg copper wire', expectedIntent: 'CREATE_LOT', expectedMat: 'Cable', expectedWeight: 15 },
  { lang: 'en', input: 'Sell 30 kg circuit boards', expectedIntent: 'CREATE_LOT', expectedMat: 'PCB', expectedWeight: 30 },
  { lang: 'en', input: 'Add new lot 25 kg batteries', expectedIntent: 'CREATE_LOT', expectedMat: 'Battery', expectedWeight: 25 },

  // FIND_RECYCLER
  { lang: 'hi', input: 'नजदीकी रीसायकलर खोजें', expectedIntent: 'FIND_RECYCLER' },
  { lang: 'hi', input: 'कहाँ बेचूँ कबाड़ आसपास रीसायकलर बताओ', expectedIntent: 'FIND_RECYCLER' },
  { lang: 'mr', input: 'जवळचा रिसायकलर शोधा', expectedIntent: 'FIND_RECYCLER' },
  { lang: 'mr', input: 'ई-कचरा खरेदीदार केंद्र कुठे आहे', expectedIntent: 'FIND_RECYCLER' },
  { lang: 'en', input: 'Find nearby recycler', expectedIntent: 'FIND_RECYCLER' },
  { lang: 'en', input: 'Who will buy my scrap nearby', expectedIntent: 'FIND_RECYCLER' },

  // CHECK_EARNINGS
  { lang: 'hi', input: 'मेरी बकाया कमाई कितनी है?', expectedIntent: 'CHECK_EARNINGS' },
  { lang: 'hi', input: 'बाकी पैसे का हिसाब दिखाओ', expectedIntent: 'CHECK_EARNINGS' },
  { lang: 'mr', input: 'माझी शिल्लक कमाई किती आहे?', expectedIntent: 'CHECK_EARNINGS' },
  { lang: 'mr', input: 'एकूण जमा झालेले पैसे दाखवा', expectedIntent: 'CHECK_EARNINGS' },
  { lang: 'en', input: 'Check my pending earnings', expectedIntent: 'CHECK_EARNINGS' },
  { lang: 'en', input: 'Show my payment ledger', expectedIntent: 'CHECK_EARNINGS' },

  // SAFETY_ADVICE
  { lang: 'hi', input: 'बैटरी को सुरक्षित कैसे रखें?', expectedIntent: 'SAFETY_ADVICE', expectedMat: 'Battery' },
  { lang: 'hi', input: 'तार जलाना खतरनाक क्यों है?', expectedIntent: 'SAFETY_ADVICE', expectedMat: 'Cable' },
  { lang: 'hi', input: 'तेज़ाब से क्या खतरा है?', expectedIntent: 'SAFETY_ADVICE' },
  { lang: 'mr', input: 'बॅटरी सुरक्षित कशी हाताळावी?', expectedIntent: 'SAFETY_ADVICE', expectedMat: 'Battery' },
  { lang: 'mr', input: 'केबल जाळणे विषारी आहे का?', expectedIntent: 'SAFETY_ADVICE', expectedMat: 'Cable' },
  { lang: 'en', input: 'How to safely handle batteries?', expectedIntent: 'SAFETY_ADVICE', expectedMat: 'Battery' },
  { lang: 'en', input: 'Is burning copper wire dangerous?', expectedIntent: 'SAFETY_ADVICE', expectedMat: 'Cable' },

  // CHECK_LOT_STATUS
  { lang: 'hi', input: 'मेरे लॉट का स्टेटस क्या है?', expectedIntent: 'CHECK_LOT_STATUS' },
  { lang: 'hi', input: 'कबाड़ की डिजिटल रसीद दिखाओ', expectedIntent: 'CHECK_LOT_STATUS' },
  { lang: 'mr', input: 'माझ्या लॉटची स्थिती काय आहे?', expectedIntent: 'CHECK_LOT_STATUS' },
  { lang: 'mr', input: 'माझा लॉट जमा झाला का', expectedIntent: 'CHECK_LOT_STATUS' },
  { lang: 'en', input: 'Check my lot status', expectedIntent: 'CHECK_LOT_STATUS' },
  { lang: 'en', input: 'Where is my scrap receipt?', expectedIntent: 'CHECK_LOT_STATUS' },

  // UNKNOWN / FALLBACK
  { lang: 'hi', input: 'आज दिल्ली में मौसम कैसा है?', expectedIntent: 'UNKNOWN' },
  { lang: 'mr', input: 'उद्या पाऊस पडेल का?', expectedIntent: 'UNKNOWN' },
  { lang: 'en', input: 'What is the score of cricket match?', expectedIntent: 'UNKNOWN' },
];

let passed = 0;
let failed = 0;

console.log('='.repeat(80));
console.log('E-WASTE SETU — VOICE AGENT INTENT PARSER VERIFICATION');
console.log('='.repeat(80));

for (const tc of testCases) {
  const res = parseVoiceIntent(tc.input, tc.lang);
  const intentMatch = res.intent === tc.expectedIntent;
  const matMatch = !tc.expectedMat || res.material === tc.expectedMat;
  const wtMatch = tc.expectedWeight === undefined || res.weight === tc.expectedWeight;

  if (intentMatch && matMatch && wtMatch) {
    passed++;
    console.log(`[PASS] [${tc.lang.toUpperCase()}] "${tc.input}" -> ${res.intent}` +
      (res.material ? ` (Mat: ${res.material})` : '') +
      (res.weight ? ` (Wt: ${res.weight}kg)` : ''));
  } else {
    failed++;
    console.log(`[FAIL] [${tc.lang.toUpperCase()}] "${tc.input}"`);
    console.log(`       Expected: ${tc.expectedIntent}` + (tc.expectedMat ? `, Mat: ${tc.expectedMat}` : '') + (tc.expectedWeight ? `, Wt: ${tc.expectedWeight}` : ''));
    console.log(`       Got:      ${res.intent}` + (res.material ? `, Mat: ${res.material}` : '') + (res.weight ? `, Wt: ${res.weight}` : ''));
  }
}

console.log('='.repeat(80));
console.log(`TOTAL TESTS: ${testCases.length} | PASSED: ${passed} | FAILED: ${failed}`);
console.log('='.repeat(80));

if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL VOICE INTENT TESTS PASSED SUCCESSFULLY! 🎯');
}
