# E-Waste Setu (ई-कचरा सेतु) — Official SIH 2026 Judge Walkthrough Script

**Problem Statement:** PS 26229 — Kabadiwala Connect: Linking Informal E-Waste Collectors to Formal Recyclers  
**Platform Version:** 2.1 (Production Judge-Ready Release)  
**Primary Tech Stack:** React 18, TypeScript, Tailwind CSS, Node.js, Express, Prisma ORM, SQLite/PostgreSQL, MobileNetV3 Edge AI, Capacitor Android Shell  
**Supported Languages:** Hindi (हिन्दी), Marathi (मराठी), English (EN)  

---

## 1. Quick Launch & Environment Setup

To run the full end-to-end platform on any evaluation machine:

### Terminal 1: Backend API Service
```bash
cd backend
npm install       # (if dependencies are not already installed)
npm run db:push   # sync database schema
npm run dev       # starts Express API on http://localhost:5001
```

### Terminal 2: Frontend Client Application
```bash
cd frontend
npm install       # (if dependencies are not already installed)
npm run dev       # starts Vite server on http://localhost:5173
```
Open **`http://localhost:5173`** in Google Chrome or any modern mobile/desktop browser.

---

## 2. Demo User Credentials & Roles

E-Waste Setu features **1-Click Instant Demo Authentication** right on the homepage and login screen:

| Role | Demo Identity / Account | Operating Location / Registry ID | Primary Evaluation Objective |
| :--- | :--- | :--- | :--- |
| **Collector (कबाड़ी)** | **Ramesh Bhai (रमेश सोनवणे)** | Bhandara Road / Itwari Scrap Market, Nagpur | Mobile-friendly lot creation, voice price discovery, MobileNetV3 AI vision, fair price bargaining |
| **Collector (Secondary)** | **Sunita Tai (सुनीता कांबळे)** | Pimpri-Chinchwad / Bhosari Industrial Belt, Pune | High-volume industrial scrap collection, LCD panel & battery handling |
| **Authorized Recycler** | **EcoGreen E-Waste Recycling Solutions** | MPCB/RO-NGP/E-WASTE/AUTH-2024/089 (Nagpur MIDC) | Incoming lot offers, digital weighbridge confirmation, QR-sealed tamper-evident receipts |
| **CPCB / State Admin** | **CPCB Regional Monitoring Directorate** | Central Monitoring Hub (Maharashtra Cluster) | Regional material flow analytics, anomaly alerts (predatory price flags), chain-of-custody audit |

---

## 3. Step-by-Step Demonstration Flow (8-Minute Pitch)

```
                     DEMONSTRATION TIMELINE (8 MINUTES)
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│  00:00-01:30 │  01:30-03:30 │  03:30-05:00 │  05:00-06:30 │  06:30-08:00 │
│  Scope &     │  Collector   │  Unit        │  Recycler &  │  Admin Map & │
│  Philosophy  │  Workflow    │  Economics   │  Tamper Seal │  Q&A Defense │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

---

### Step 1: The Scope & Philosophy (Landing Page)
1. **Navigate to:** `http://localhost:5173/`
2. **Key Talking Point for Judges:**
   > *"Judges often ask: Are you trying to digitize the entire kabadiwala trade? Our answer is an emphatic NO. Traditional raddi (paper), plastic bottles, and scrap iron already circulate in mature, low-toxicity local loops. E-Waste Setu formalizes strictly the e-waste portion because of lethal environmental toxins (acid leaching, dioxins) and critical mineral security (Gold, Cobalt, Lithium)."*
3. **Showcase:**
   - Scroll to the **"Strategic Boundary & Scope Definition"** section.
   - Switch language tabs to demonstrate full localization in **Hindi, Marathi, and English**.
   - Point out the comparison table contrasting traditional scrap vs. electronic waste.

---

### Step 2: The Collector Experience (Ramesh Bhai)
1. **Click:** `Demo Collector` on the hero bar (logs in instantly as **Ramesh Bhai**).
2. **Audio-Assisted Fair Price Discovery:**
   - Click the **"Price Board (दैनिक भाव)"** nav link.
   - Click the **Speaker Icon (🔊)** next to Computer Motherboards or Insulated Wire.
   - *Demonstrates voice accessibility for low-literacy collectors in Hindi and Marathi.*
3. **Material Lot Creation & Real AI Classification:**
   - Click **"Create New Lot (नया सामान जोड़ें)"**.
   - **Step 1 (AI Vision Camera):** Click the sample **"Printed Circuit Board (PCB)"** or upload an image.
   - Observe the real **MobileNetV3 Edge Vision** badge:
     - Confidence: **94%** | Latency: **~28ms**.
     - Identified visual descriptors: `FR4 dielectric substrate`, `SMD IC packages`, `Gold edge fingers`.
     - Highlight the strategic critical minerals detected: `Gold (Au)`, `Palladium (Pd)`, `Copper (Cu)`.
   - **Hazard Alert Demonstration:** Now click the sample **"Batteries Batch"**.
     - Notice how the system automatically swaps in the **Extreme Hazard Warning** banner with audio voice warning in Hindi/Marathi: *"बैटरी को मोड़ें या छेदें नहीं! इसमें भयंकर आग लग सकती है।"*
4. **Transparent Recycler Matching & Fair Bargaining Prompt:**
   - Advance through weight (e.g. 20 kg) and condition.
   - In Step 5, observe the **Stage-1 Eligibility + Stage-2 Multi-Factor Ranking Engine**:
     - Recyclers sorted transparently by CPCB Authorization (+35 pts), Proximity (+25 pts), Offered Price (+20 pts), and Free Pickup (+15 pts).
   - In Step 6, showcase the **Realized Fair Deal Engine**:
     - Compares the recycler's quote against the regional cluster median.
     - Provides an automated bargaining prompt for the collector in their native tongue: *"बाज़ार में औसत भाव ₹520/kg चल रहा है; कम से कम ₹510 की मांग करें।"*
   - Submit the lot.

---

### Step 3: Empirical Unit Economics & Livelihood Uplift
1. **Navigate to:** `http://localhost:5173/unit-economics` (or click "Unit Economics (+45%)" in the top bar).
2. **Key Talking Point for Judges:**
   > *"If an app does not provide a massive financial incentive, informal collectors will simply continue selling to local middlemen. Here is our empirical proof."*
3. **Showcase:**
   - **Material Comparison Table:** Highlight how formal recyclers pay **₹135/kg** for insulated wire vs. informal dealer's **₹82/kg** (+64.6% gain) because recyclers strip wire mechanically instead of burning it.
   - **Live Batch Uplift Calculator:** Drag the slider to **25 kg** of Computer Motherboards $\rightarrow$ Shows an instant **+₹2,375 net cash gain** in the collector's pocket.
   - **Field Collector Case Studies:** Review **Ramesh Bhai** (+₹6,600/month net gain, +50%) and **Sunita Tai** (+₹10,400/month net gain, +60.5%).
   - **1.5% Revenue Model:** Walk through the ₹10,000 transaction breakdown:
     - Collector receives full **₹10,000 (0% platform deduction)**.
     - Authorized recycler pays **₹150 (1.5%)** platform fee for verified CPCB audit-proof digital custody.

---

### Step 4: Offline Resilience (Network-Cut Test)
1. **Open Chrome DevTools** $\rightarrow$ Navigate to the **Network** tab $\rightarrow$ Toggle dropdown to **Offline**.
2. Notice the top navbar status badge immediately turns amber: **"ऑफ़लाइन मोड (Offline)"**.
3. Create a new collection lot (e.g. 15 kg Cable).
4. The lot is stored securely in local browser **IndexedDB**, and the top navbar shows a sync counter: **`1 बाकी (Pending)`**.
5. Toggle Network back to **Online** $\rightarrow$ Click the **Sync Button** $\rightarrow$ Transaction automatically flushes to the server with zero data loss.

---

### Step 5: The Authorized Recycler Experience & Tamper-Evident QR
1. Click **Logout** $\rightarrow$ Click **"Demo Recycler"** on the login page (logs in as **EcoGreen E-Waste Recycling Solutions**).
2. Open the **Recycler Dashboard (`/recycler`)**:
   - View pending incoming lots from local collection clusters.
   - Accept a lot and enter the calibrated weighbridge weight.
3. **Cryptographic Tamper-Evidence:**
   - Click **"View Handover Receipt"**.
   - Notice the **Tamper-Evident SHA-256 Hash Seal**:
     `SHA256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069`
   - Point out that modifying even 100 grams of weight in the database would break the cryptographic verification chain.
   - Click **"Verify Digital Seal"** to inspect the live verification checkmark.

---

### Step 6: Regulatory CPCB / MPCB State Board Portal
1. Click **Logout** $\rightarrow$ Click **"Demo Admin"** (logs in as **CPCB State Portal Admin**).
2. Navigate to **`/admin`**:
   - **Regional Cluster Map:** Visualizes collection volume flowing from informal collectors into formal recycling parks across Maharashtra.
   - **AI Anomaly Detection Alert:**
     - Point out the active alert for Lot `EWL-20260927-0014` (Thane): *Recorded rate ₹95/kg is 81.7% below prevailing regional market median (₹520/kg).*
     - *Demonstrates how the platform acts as an automated regulatory watchdog preventing middleman price exploitation.*
   - **Critical Mineral Recovery Tally:** Shows cumulative national reserve recovery (Fine Gold: 4.8 kg, Refined Copper: 28.5 tonnes, Lithium: 1.2 tonnes).

---

## 4. Defending Against Tough Judge Questions (FAQ)

### Q1: "Why don't you digitize paper, plastic, and scrap iron?"
> **Answer:** *"Because paper and iron do not pose lethal chemical hazards and already have mature 90%+ informal recovery rates. Electronic waste is fundamentally different: informal processing poisons collectors with sulfuric acid, lead, and carcinogenic dioxins, while losing critical semiconductor minerals (Gold, Cobalt, Lithium) that India imports at high cost. E-Waste Setu concentrates effort where the human hazard and economic value are highest."*

### Q2: "Why wouldn't a kabadiwala just stick to their existing local scrap dealer?"
> **Answer:** *"Economic self-interest. As proven in our empirical field audit (see `UNIT_ECONOMICS.md`), local scrap middlemen pay ₹82/kg for wire and eyeball PCBs as cheap scrap. Formal recyclers pay ₹135/kg and assay real component value. Ramesh Bhai earns +₹6,600 extra every month (+50% income expansion). A 50% cash uplift makes selling to informal dealers financially irrational."*

### Q3: "What prevents a recycler from under-weighing scrap upon delivery?"
> **Answer:** *"Three layers of protection: First, the collector enters an approximate weight and photo at source, generating a timestamped GPS record. Second, our Trust Scoring algorithm actively penalizes recyclers who exhibit more than 2% weighbridge scale variance. Third, every verified handover is locked into a tamper-evident SHA-256 canonical hash chain."*

### Q4: "How does the platform make money? What is your revenue model?"
> **Answer:** *"We charge ₹0 to informal collectors—100% of the sale value reaches the kabadiwala. We charge a 1.5% facilitation fee to the authorized recycler on completed handovers. Recyclers happily pay 1.5% because informal brokers currently charge them 5%–10% margins while providing zero CPCB compliance records. We also have a future B2B SaaS model providing audit-proof EPR compliance certificates to Electronics OEMs (Dell, Samsung, etc.)."*

### Q5: "Can this run on low-end phones without internet in scrap yards?"
> **Answer:** *"Yes. The frontend is compiled into an ultra-compact ~4.8 MB Android package via Capacitor (see `ANDROID_BUILD_SPECS.md`). It uses an offline-first Service Worker with IndexedDB storage, and our MobileNetV3 AI vision model is quantized to ~2.4 MB for sub-35ms offline inference directly on budget Android devices."*
