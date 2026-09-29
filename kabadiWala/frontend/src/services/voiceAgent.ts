import { Language, translations } from './i18n';

export type VoiceIntentType =
  | 'CHECK_PRICE'
  | 'CREATE_LOT'
  | 'FIND_RECYCLER'
  | 'CHECK_EARNINGS'
  | 'SAFETY_ADVICE'
  | 'CHECK_LOT_STATUS'
  | 'UNKNOWN';

export interface ParsedVoiceResult {
  rawTranscript: string;
  intent: VoiceIntentType;
  material?: string;
  materialDisplay?: string;
  weight?: number;
  spokenConfirmation: string;
  targetPath?: string;
  navigationState?: Record<string, any>;
  confidence: number;
}

export const MATERIAL_BASE_RATES: Record<string, number> = {
  'PCB': 480,
  'Cable': 125,
  'Battery': 85,
  'CRT': 25,
  'LCD Panel': 85,
  'Motor': 140,
  'Magnet-bearing Assembly': 110,
  'Mixed Plastic': 30,
};

const MATERIAL_DISPLAY_NAMES: Record<Language, Record<string, string>> = {
  en: {
    'PCB': 'Circuit Board (PCB)',
    'Cable': 'Copper / Cable Wire',
    'Battery': 'Battery',
    'CRT': 'CRT Screen Glass',
    'LCD Panel': 'LCD / LED Screen',
    'Motor': 'Electric Motor',
    'Magnet-bearing Assembly': 'Magnet Assembly',
    'Mixed Plastic': 'E-Waste Plastic',
  },
  hi: {
    'PCB': 'सर्किट बोर्ड (PCB)',
    'Cable': 'केबल तार (कॉपर)',
    'Battery': 'बैटरी',
    'CRT': 'पुराने टीवी का शीशा',
    'LCD Panel': 'एलसीडी स्क्रीन',
    'Motor': 'इलेक्ट्रिक मोटर',
    'Magnet-bearing Assembly': 'हार्ड डिस्क चुंबक',
    'Mixed Plastic': 'ई-कचरा प्लास्टिक',
  },
  mr: {
    'PCB': 'सर्किट बोर्ड (PCB)',
    'Cable': 'केबल वायर (तांबे)',
    'Battery': 'बॅटरी',
    'CRT': 'टीव्हीची काच',
    'LCD Panel': 'एलसीडी स्क्रीन',
    'Motor': 'इलेक्ट्रिक मोटर',
    'Magnet-bearing Assembly': 'हार्ड डिस्क चुंबक',
    'Mixed Plastic': 'ई-कचरा प्लास्टिक',
  },
};

const NUMBER_WORDS: Record<string, number> = {
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

// Convert Devanagari numerals to standard digits
function normalizeDevanagariDigits(text: string): string {
  const devanagariDigits: Record<string, string> = {
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
  };
  return text.replace(/[०-९]/g, (ch) => devanagariDigits[ch] || ch);
}

// Extract weight / quantity in kg from text
export function extractWeight(rawText: string): number | undefined {
  const text = normalizeDevanagariDigits(rawText.toLowerCase());

  // 1. Look for digit followed by optional space and kg/kilo/किलो/किलोग्रॅम
  const digitRegex = /(\d+(?:\.\d+)?)\s*(?:kg|kilo|kilogram|किलो|किलोग्राम|कलो|कि\.ग्रा\.)/i;
  const match = text.match(digitRegex);
  if (match && match[1]) {
    return parseFloat(match[1]);
  }

  // 2. Look for word numbers before kg/kilo
  for (const [word, val] of Object.entries(NUMBER_WORDS)) {
    const wordRegex = new RegExp(`\\b${word}\\b\\s*(?:kg|kilo|kilogram|किलो|किलोग्राम|कलो)`, 'i');
    if (wordRegex.test(text)) {
      return val;
    }
  }

  // 3. Fallback: check if standalone number exists in context of scrap/lot
  const standaloneMatch = text.match(/\b(\d+(?:\.\d+)?)\b/);
  if (standaloneMatch && standaloneMatch[1]) {
    const val = parseFloat(standaloneMatch[1]);
    if (val > 0 && val <= 1000) {
      return val;
    }
  }

  // 4. Standalone word number
  for (const [word, val] of Object.entries(NUMBER_WORDS)) {
    if (text.includes(word)) {
      return val;
    }
  }

  return undefined;
}

// Extract material category
export function extractMaterial(rawText: string, lang: Language): { category: string; display: string } | undefined {
  const text = rawText.toLowerCase();

  // Search through all material dictionaries (current lang first, then other languages as fallback)
  const languagesToSearch: Language[] = [lang, 'hi', 'en', 'mr'];
  
  for (const l of languagesToSearch) {
    const materialDict = translations[l]?.material_names || {};
    for (const [category, synonyms] of Object.entries(materialDict)) {
      if (Array.isArray(synonyms)) {
        for (const syn of synonyms) {
          const s = syn.toLowerCase();
          if (text.includes(s)) {
            const display = MATERIAL_DISPLAY_NAMES[lang]?.[category] || category;
            return { category, display };
          }
        }
      }
    }
  }

  return undefined;
}

// Check if any keywords match an intent
function matchesIntentKeywords(text: string, phrases: string[]): boolean {
  const lower = text.toLowerCase();
  return phrases.some((phrase) => lower.includes(phrase.toLowerCase()));
}

/**
 * Main parser: analyzes spoken speech input, classifies fixed intent,
 * extracts parameters (material, weight), and builds voice confirmation.
 */
export function parseVoiceIntent(transcript: string, language: Language = 'hi'): ParsedVoiceResult {
  const text = transcript.trim();
  if (!text) {
    return {
      rawTranscript: transcript,
      intent: 'UNKNOWN',
      spokenConfirmation: translations[language]?.voice_intents?.fallback_message || translations.en.voice_intents.fallback_message,
      confidence: 0,
    };
  }

  const langIntents = translations[language]?.voice_intents || translations.en.voice_intents;
  const enIntents = translations.en.voice_intents;
  const hiIntents = translations.hi.voice_intents;
  const mrIntents = translations.mr.voice_intents;

  const detectedMaterial = extractMaterial(text, language);
  const detectedWeight = extractWeight(text);

  // 1. Check CREATE_LOT Intent
  // Strong indicators: "I have X kg", "मेरे पास 15 किलो", "माझ्याकडे 10 किलो", "नया लॉट", "बेचना है", "विकायचे आहे", or both weight + material detected
  const hasWeight = detectedWeight !== undefined;
  const hasCreateLotPhrases =
    matchesIntentKeywords(text, langIntents.create_lot?.phrases || []) ||
    matchesIntentKeywords(text, hiIntents.create_lot?.phrases || []) ||
    matchesIntentKeywords(text, mrIntents.create_lot?.phrases || []) ||
    matchesIntentKeywords(text, enIntents.create_lot?.phrases || []);

  if (hasCreateLotPhrases || (hasWeight && detectedMaterial)) {
    const material = detectedMaterial ? detectedMaterial.category : 'Cable';
    const materialDisplay = detectedMaterial ? detectedMaterial.display : MATERIAL_DISPLAY_NAMES[language]['Cable'];
    const weight = detectedWeight || 10;

    let confirm = langIntents.create_lot?.confirm_template || 'Creating a new lot for {weight} kg of {material}.';
    confirm = confirm.replace('{weight}', String(weight)).replace('{material}', materialDisplay);

    return {
      rawTranscript: transcript,
      intent: 'CREATE_LOT',
      material,
      materialDisplay,
      weight,
      spokenConfirmation: confirm,
      targetPath: '/create-lot',
      navigationState: {
        preCategory: material,
        preWeight: String(weight),
        fromVoice: true,
      },
      confidence: 0.95,
    };
  }

  // 2. Check CHECK_PRICE Intent
  const hasPricePhrases =
    matchesIntentKeywords(text, langIntents.price_check?.phrases || []) ||
    matchesIntentKeywords(text, hiIntents.price_check?.phrases || []) ||
    matchesIntentKeywords(text, mrIntents.price_check?.phrases || []) ||
    matchesIntentKeywords(text, enIntents.price_check?.phrases || []);

  if (hasPricePhrases) {
    if (detectedMaterial) {
      const rate = MATERIAL_BASE_RATES[detectedMaterial.category] || 120;
      let confirm = langIntents.price_check?.confirm_template || "Showing today's price for {material}. Rate is ₹{rate}/kg.";
      confirm = confirm.replace('{material}', detectedMaterial.display).replace('{rate}', String(rate));

      return {
        rawTranscript: transcript,
        intent: 'CHECK_PRICE',
        material: detectedMaterial.category,
        materialDisplay: detectedMaterial.display,
        spokenConfirmation: confirm,
        targetPath: '/prices',
        navigationState: {
          category: detectedMaterial.category,
          fromVoice: true,
        },
        confidence: 0.92,
      };
    } else {
      const confirm = langIntents.price_check?.confirm_general || "Opening today's scrap price board.";
      return {
        rawTranscript: transcript,
        intent: 'CHECK_PRICE',
        spokenConfirmation: confirm,
        targetPath: '/prices',
        navigationState: { fromVoice: true },
        confidence: 0.88,
      };
    }
  }

  // 3. Check FIND_RECYCLER Intent
  const hasRecyclerPhrases =
    matchesIntentKeywords(text, langIntents.find_recycler?.phrases || []) ||
    matchesIntentKeywords(text, hiIntents.find_recycler?.phrases || []) ||
    matchesIntentKeywords(text, mrIntents.find_recycler?.phrases || []) ||
    matchesIntentKeywords(text, enIntents.find_recycler?.phrases || []);

  if (hasRecyclerPhrases) {
    const confirm = langIntents.find_recycler?.confirm_template || 'Finding authorized government recyclers near you.';
    return {
      rawTranscript: transcript,
      intent: 'FIND_RECYCLER',
      spokenConfirmation: confirm,
      targetPath: '/recyclers',
      navigationState: { fromVoice: true },
      confidence: 0.94,
    };
  }

  // 4. Check CHECK_EARNINGS Intent
  const hasEarningsPhrases =
    matchesIntentKeywords(text, langIntents.check_earnings?.phrases || []) ||
    matchesIntentKeywords(text, hiIntents.check_earnings?.phrases || []) ||
    matchesIntentKeywords(text, mrIntents.check_earnings?.phrases || []) ||
    matchesIntentKeywords(text, enIntents.check_earnings?.phrases || []);

  if (hasEarningsPhrases) {
    const confirm = langIntents.check_earnings?.confirm_template || 'Opening your earnings ledger.';
    return {
      rawTranscript: transcript,
      intent: 'CHECK_EARNINGS',
      spokenConfirmation: confirm,
      targetPath: '/earnings',
      navigationState: { fromVoice: true },
      confidence: 0.93,
    };
  }

  // 5. Check SAFETY_ADVICE Intent
  const hasSafetyPhrases =
    matchesIntentKeywords(text, langIntents.safety_advice?.phrases || []) ||
    matchesIntentKeywords(text, hiIntents.safety_advice?.phrases || []) ||
    matchesIntentKeywords(text, mrIntents.safety_advice?.phrases || []) ||
    matchesIntentKeywords(text, enIntents.safety_advice?.phrases || []);

  if (hasSafetyPhrases) {
    let sectionId = 'cables';
    if (detectedMaterial) {
      if (detectedMaterial.category === 'PCB') sectionId = 'acid';
      else if (detectedMaterial.category === 'Battery') sectionId = 'batteries';
      else if (detectedMaterial.category === 'CRT') sectionId = 'crt';
      else if (detectedMaterial.category === 'Cable') sectionId = 'cables';

      let confirm = langIntents.safety_advice?.confirm_template || 'Opening safety guidelines for {material}.';
      confirm = confirm.replace('{material}', detectedMaterial.display);

      return {
        rawTranscript: transcript,
        intent: 'SAFETY_ADVICE',
        material: detectedMaterial.category,
        materialDisplay: detectedMaterial.display,
        spokenConfirmation: confirm,
        targetPath: '/safety',
        navigationState: {
          highlightSection: sectionId,
          materialCategory: detectedMaterial.category,
          fromVoice: true,
        },
        confidence: 0.92,
      };
    } else {
      const confirm = langIntents.safety_advice?.confirm_general || 'Opening e-waste safety guidelines.';
      return {
        rawTranscript: transcript,
        intent: 'SAFETY_ADVICE',
        spokenConfirmation: confirm,
        targetPath: '/safety',
        navigationState: { fromVoice: true },
        confidence: 0.89,
      };
    }
  }

  // 6. Check CHECK_LOT_STATUS Intent
  const hasStatusPhrases =
    matchesIntentKeywords(text, langIntents.lot_status?.phrases || []) ||
    matchesIntentKeywords(text, hiIntents.lot_status?.phrases || []) ||
    matchesIntentKeywords(text, mrIntents.lot_status?.phrases || []) ||
    matchesIntentKeywords(text, enIntents.lot_status?.phrases || []);

  if (hasStatusPhrases) {
    const confirm = langIntents.lot_status?.confirm_template || 'Opening your lots to track status.';
    return {
      rawTranscript: transcript,
      intent: 'CHECK_LOT_STATUS',
      spokenConfirmation: confirm,
      targetPath: '/lots',
      navigationState: { fromVoice: true },
      confidence: 0.91,
    };
  }

  // 7. Fallback / Unrecognized Intent
  const fallback = langIntents.fallback_message || translations.en.voice_intents.fallback_message;
  return {
    rawTranscript: transcript,
    intent: 'UNKNOWN',
    spokenConfirmation: fallback,
    confidence: 0.2,
  };
}
