# E-Waste Setu — Voice-Agent Architecture & Specification
**Problem Statement 26229: Kabadiwala Connect (Smart India Hackathon 2026)**

---

## 1. Executive Summary & Design Rationale

Informal scrap collectors (*kabadiwalas*) in India operate in high-noise, outdoor scrap yards, often possessing low formal literacy in textual interfaces, but high verbal competence in regional vernaculars (**Hindi, Marathi, Hinglish**). 

Traditional mobile applications fail informal collectors because:
1. Multi-step form navigation requires reading and keyboard typing.
2. Open-ended LLM voice chatbots (e.g. GPT-4o voice / cloud STT) suffer from **high latency (2–4 seconds)**, **per-second API billing costs**, **hallucinations**, and **unpredictable output formatting** when attempting to drive mobile UI navigation.

**E-Waste Setu's Conversational Voice Agent** implements a deterministic, edge-first, **fixed-intent voice command layer**:
- **Zero Cloud API Dependencies / Free Execution**: Leverages the browser/WebView native **Web Speech API** (`webkitSpeechRecognition` / native Android `SpeechRecognizer`) and SpeechSynthesis TTS (`hi-IN`, `mr-IN`, `en-IN`).
- **Fixed Intent System**: Restricts speech interpretation strictly to 6 high-value platform actions. If an utterance falls outside these bounds, it delivers a graceful spoken fallback explaining valid commands.
- **Bi-directional Conversational Feedback**: Speaks out loud confirming the detected intent, material, and weight, provides real-time visual cards, and automatically transitions the collector to the target workflow.
- **Judge-Ready Simulation**: Includes interactive sample chips in the voice modal so evaluators in noisy exhibition halls or without microphones can trigger real recognition and execution pipelines in 1 click.

---

## 2. Core Supported Intents & Target Actions

| Intent Key | Spoken Collector Goal | Parameters Extracted | Destination Route | Spoken Confirmation Example (Hindi) |
|---|---|---|---|---|
| `CHECK_PRICE` | Check price for a material or general market board | `materialCategory` (optional) | `/prices` | *"सर्किट बोर्ड (PCB) का आज का भाव लगभग ₹480 प्रति किलो है। प्राइस बोर्ड खोला जा रहा है।"* |
| `CREATE_LOT` | "I have X kg of Y material" / sell scrap | `materialCategory`, `weight` (kg) | `/create-lot` (Step 3 pre-filled) | *"15 किलो केबल तार (कॉपर) का नया लॉट बनाया जा रहा है। स्क्रीन पर जानकारी आ रही है।"* |
| `FIND_RECYCLER` | Find nearby authorized government recyclers | None | `/recyclers` | *"आपके आस-पास के सरकारी मान्यता प्राप्त रीसायकलर्स खोजे जा रहे हैं।"* |
| `CHECK_EARNINGS` | Check earnings, pending dues, or ledger | None | `/earnings` | *"आपकी कमाई और बकाया भुगतान का खाता खोला जा रहा है।"* |
| `SAFETY_ADVICE` | Ask if a material is hazardous / how to handle | `materialCategory`, `sectionId` | `/safety` (card highlighted) | *"बैटरी के लिए सुरक्षा नियम खोले जा रहे हैं। कृपया सावधानी बरतें।"* |
| `CHECK_LOT_STATUS` | Check recent lot handover / digital receipt | None | `/lots` | *"आपके लॉट्स की स्थिति और डिजिटल रसीदें दिखाई जा रही हैं।"* |
| `UNKNOWN` | Unrecognized query / non-platform speech | None | Modal Fallback | *"माफ़ कीजिए, मैं समझ नहीं पाया। आप भाव पूछ सकते हैं, अपना कबाड़ जोड़ सकते हैं, या रीसायकलर खोज सकते हैं।"* |

---

## 3. Multilingual Phrase Sets & Vocabulary

### A. Number & Weight Parser
Informal collectors dictate weights using numerals, Devanagari digits, or spoken words. The parser normalizes:
- **Devanagari Digits**: `०, १, २, ३, ४, ५, ६, ७, ८, ९` → `0, 1, 2, 3, 4, 5, 6, 7, 8, 9`
- **Spoken Word Dictionary**:
  - **Hindi**: `एक` (1), `दो` (2), `तीन` (3), `चार` (4), `पांच/पाँच` (5), `छह` (6), `सात` (7), `आठ` (8), `नौ` (9), `दस` (10), `पंद्रह` (15), `बीस` (20), `पच्चीस` (25), `तीस` (30), `चालीस` (40), `पचास` (50), `सौ` (100)
  - **Marathi**: `दोन` (2), `पाच` (5), `सहा` (6), `दहा` (10), `पंधरा` (15), `वीस` (20), `पंचवीस` (25), `चाळीस` (40), `पन्नास` (50), `शंभर` (100)
  - **English**: `ten`, `fifteen`, `twenty`, `twenty-five`, `thirty`, `forty`, `fifty`, etc.
- **Unit Regex**: Matches `kg`, `kilo`, `kilogram`, `किलो`, `किलोग्राम`, `कलो`, `कि.ग्रा.`

### B. Material Category Synonyms
The parser maps vernacular terminology to standardized E-Waste Setu categories:
- **`PCB`**: PCB, सर्किट बोर्ड, मदरबोर्ड, कंप्यूटर बोर्ड, printed circuit, green board, प्लेट, सर्किट
- **`Cable`**: केबल, तार, तांबा, तांबे, कॉपर, बिजली का तार, विजेची वायर, copper, wire, cables
- **`Battery`**: बैटरी, सेल, लिथियम, इन्वर्टर, मोबाईल बॅटरी, battery, batteries, li-ion, cell
- **`CRT`**: सीआरटी, टीवी का शीशा, कांच, पिक्चर ट्यूब, जुन्या टीव्हीची काच, crt, tv glass
- **`LCD Panel`**: एलसीडी, स्क्रीन, डिस्प्ले, मॉनिटर, लॅपटॉप स्क्रीन, lcd, led, monitor
- **`Motor`**: मोटर, पंखा, पंप, इलेक्ट्रिक मोटर, winding, motor, pump
- **`Magnet-bearing Assembly`**: चुंबक, हार्ड डिस्क, मैग्नेट, magnet, hard disk, hdd
- **`Mixed Plastic`**: प्लास्टिक, कम्प्यूटर प्लास्टिक, संगणकाचे प्लास्टिक, बॉडी, e-waste plastic

---

## 4. Test Suite & Validation Matrix

The automated verification suite (`frontend/scripts/testVoiceAgent.js`) evaluates 46 distinct phrasing variations across English, Hindi, and Marathi:

| Language | Test Utterance | Predicted Intent | Extracted Entities | Status |
|---|---|---|---|---|
| **Hindi** | "आज पीसीबी का भाव क्या है?" | `CHECK_PRICE` | Category: `PCB` | PASS |
| **Hindi** | "तांबे का रेट बताओ" | `CHECK_PRICE` | Category: `Cable` | PASS |
| **Hindi** | "मेरे पास 15 किलो केबल तार है" | `CREATE_LOT` | Category: `Cable`, Wt: `15kg` | PASS |
| **Hindi** | "20 किलो सर्किट बोर्ड बेचना है" | `CREATE_LOT` | Category: `PCB`, Wt: `20kg` | PASS |
| **Hindi** | "नजदीकी रीसायकलर खोजें" | `FIND_RECYCLER` | — | PASS |
| **Hindi** | "मेरी बकाया कमाई कितनी है?" | `CHECK_EARNINGS` | — | PASS |
| **Hindi** | "बैटरी को सुरक्षित कैसे रखें?" | `SAFETY_ADVICE` | Category: `Battery` | PASS |
| **Hindi** | "तार जलाना खतरनाक क्यों है?" | `SAFETY_ADVICE` | Category: `Cable` (Flame/Toxic) | PASS |
| **Hindi** | "मेरे लॉट का स्टेटस क्या है?" | `CHECK_LOT_STATUS` | — | PASS |
| **Marathi** | "आज पीसीबीचा दर काय आहे?" | `CHECK_PRICE` | Category: `PCB` | PASS |
| **Marathi** | "केबल वायरचा दर सांगा" | `CHECK_PRICE` | Category: `Cable` | PASS |
| **Marathi** | "माझ्याकडे 15 किलो केबल वायर आहे" | `CREATE_LOT` | Category: `Cable`, Wt: `15kg` | PASS |
| **Marathi** | "२५ किलो जुनी बॅटरी विकायची आहे" | `CREATE_LOT` | Category: `Battery`, Wt: `25kg` | PASS |
| **Marathi** | "१० किलो पीसीबी जमा करायचे आहे" | `CREATE_LOT` | Category: `PCB`, Wt: `10kg` | PASS |
| **Marathi** | "जवळचा रिसायकलर शोधा" | `FIND_RECYCLER` | — | PASS |
| **Marathi** | "माझी शिल्लक कमाई किती आहे?" | `CHECK_EARNINGS` | — | PASS |
| **Marathi** | "बॅटरी सुरक्षित कशी हाताळावी?" | `SAFETY_ADVICE` | Category: `Battery` | PASS |
| **Marathi** | "माझ्या लॉटची स्थिती काय आहे?" | `CHECK_LOT_STATUS` | — | PASS |
| **English** | "What is PCB price today?" | `CHECK_PRICE` | Category: `PCB` | PASS |
| **English** | "I have 15 kg copper wire" | `CREATE_LOT` | Category: `Cable`, Wt: `15kg` | PASS |
| **English** | "Find nearby recycler" | `FIND_RECYCLER` | — | PASS |
| **English** | "Check my pending earnings" | `CHECK_EARNINGS` | — | PASS |
| **English** | "How to safely handle batteries?" | `SAFETY_ADVICE` | Category: `Battery` | PASS |
| **English** | "Check my lot status" | `CHECK_LOT_STATUS` | — | PASS |
| **Fallback** | "आज दिल्ली में मौसम कैसा है?" | `UNKNOWN` | Fallback Guidance Triggered | PASS |
| **Fallback** | "उद्या पाऊस पडेल का?" | `UNKNOWN` | Fallback Guidance Triggered | PASS |
| **Fallback** | "What is the score of cricket match?" | `UNKNOWN` | Fallback Guidance Triggered | PASS |

**Result: 46 / 46 Passing (100% Deterministic Intent Accuracy).**

---

## 5. UI/UX & Interaction Flow

1. **Global Presence**: A floating circular emerald mic button (`z-40`, pulse animation, tooltip *"बोलकर पूछें / Speak"*) is mounted globally in `frontend/src/App.tsx`.
2. **Audio Visualization**: Tapping the button activates the on-screen modal with animated audio wave ripples and status indicators (*"सुन रहा हूँ..."* / *"Listening..."*).
3. **Live Transcript**: Displays real-time speech transcription in an italicized quote box as words are spoken.
4. **Instant Intent Card**: Shows the recognized intent icon, badge (`95% Confirmed`), and localized spoken confirmation message.
5. **Speech Synthesis**: Speaks out loud in native accent (`hi-IN` or `mr-IN` or `en-IN` via Web SpeechSynthesis).
6. **Smooth Auto-Navigation**: Navigates to the relevant screen with parsed state after 2.6 seconds (or immediately when the user taps "आगे बढ़ें / Proceed Now"):
   - `/create-lot`: Pre-selects category, pre-fills weight, jumps directly to Step 3, and displays a green notification banner: `🎤 बोलकर भरा गया: केबल तार (15 किलो)`.
   - `/prices`: Filters directly to the requested category (e.g. PCB) and shows a voice filter banner.
   - `/safety`: Highlights the specific hazard card with a glowing green ring (`ring-4 ring-emerald-500`) and a `🎤 Voice Requested Guideline` badge.
   - `/recyclers`, `/earnings`, `/lots`: Automatically loads the requested marketplace or ledger view.
7. **Judge Test Chips**: When speech recognition is unavailable or in a quiet evaluation setting, 6 sample prompt chips allow 1-click end-to-end demonstrations.
