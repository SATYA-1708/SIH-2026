"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('--- Cleaning existing database ---');
    await prisma.syncLog.deleteMany();
    await prisma.earnings.deleteMany();
    await prisma.traceabilityRecord.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.lot.deleteMany();
    await prisma.price.deleteMany();
    await prisma.materialCatalog.deleteMany();
    await prisma.recycler.deleteMany();
    await prisma.collector.deleteMany();
    console.log('--- Seeding Collectors (10+) ---');
    const collectorsData = [
        { id: 'col-001', displayName: 'Ramesh Sonawane (रमेश सोनवणे)', phoneNumber: '+91 98230 11201', preferredLanguage: 'mr', generalOperatingLocation: 'Nagpur (Sitabuldi & MIDC)' },
        { id: 'col-002', displayName: 'Sunil Kumar Gupta (सुनील कुमार)', phoneNumber: '+91 98230 22302', preferredLanguage: 'hi', generalOperatingLocation: 'Nagpur (Kamptee Road)' },
        { id: 'col-003', displayName: 'Vinod Jadhav (विनोद जाधव)', phoneNumber: '+91 97654 33403', preferredLanguage: 'mr', generalOperatingLocation: 'Pune (Bhosari MIDC)' },
        { id: 'col-004', displayName: 'Mohammad Rafiq (मोहम्मद रफ़ीक)', phoneNumber: '+91 98221 44504', preferredLanguage: 'hi', generalOperatingLocation: 'Mumbai (Kurla Scrap Yard)' },
        { id: 'col-005', displayName: 'Santosh Shinde (संतोष शिंदे)', phoneNumber: '+91 94220 55605', preferredLanguage: 'mr', generalOperatingLocation: 'Nashik (Ambad Industrial)' },
        { id: 'col-006', displayName: 'Anil Yadav (अनिल यादव)', phoneNumber: '+91 91580 66706', preferredLanguage: 'hi', generalOperatingLocation: 'Thane (Wagle Estate)' },
        { id: 'col-007', displayName: 'Dattatray Kadam (दत्तात्रय कदम)', phoneNumber: '+91 98900 77807', preferredLanguage: 'mr', generalOperatingLocation: 'Pune (Hadapsar)' },
        { id: 'col-008', displayName: 'Pooja Devi (पूजा देवी)', phoneNumber: '+91 96370 88908', preferredLanguage: 'hi', generalOperatingLocation: 'Nagpur (Hingna MIDC)' },
        { id: 'col-009', displayName: 'Rajendra More (राजेन्द्र मोरे)', phoneNumber: '+91 98239 99009', preferredLanguage: 'mr', generalOperatingLocation: 'Aurangabad (Waluj)' },
        { id: 'col-010', displayName: 'Amit Sharma (अमित शर्मा)', phoneNumber: '+91 94231 10110', preferredLanguage: 'en', generalOperatingLocation: 'Mumbai (Dharavi / Mahim)' },
    ];
    for (const c of collectorsData) {
        await prisma.collector.create({ data: c });
    }
    console.log('--- Seeding Recyclers (8 Authorized Recyclers) ---');
    const recyclersData = [
        {
            id: 'rec-001',
            name: 'EcoGreen E-Waste Recycling Solutions',
            facilityLocation: 'Nagpur MIDC Phase 2, Maharashtra',
            latitude: 21.1215,
            longitude: 79.0352,
            materialsAccepted: JSON.stringify(['PCB', 'Cable', 'Battery', 'LCD Panel', 'Motor']),
            authorizationNumber: 'MPCB/RO-NGP/E-WASTE/AUTH-2024/089',
            authorizationStatus: 'Authorized (CPCB / MPCB Registered)',
            contact: '+91 712 2549001 / contact@ecogreenwaste.in',
            offeredRates: JSON.stringify({
                'PCB': 520,
                'Cable': 130,
                'Battery': 95,
                'LCD Panel': 85,
                'Motor': 140,
                'CRT': 25,
                'Mixed Plastic': 28,
                'Magnet-bearing Assembly': 110,
                'Other': 50
            }),
            pickupAvailable: true,
            serviceArea: 'Nagpur, Wardha, Bhandara (Radius: 60km)'
        },
        {
            id: 'rec-002',
            name: 'Vidarbha Clean Tech & Metal Extractors',
            facilityLocation: 'Hingna Industrial Area, Nagpur',
            latitude: 21.0984,
            longitude: 78.9890,
            materialsAccepted: JSON.stringify(['PCB', 'Cable', 'Motor', 'Magnet-bearing Assembly']),
            authorizationNumber: 'CPCB/HW-EWASTE/MH/2023/1442',
            authorizationStatus: 'Authorized (CPCB Validated R-Unit)',
            contact: '+91 712 2894100 / ops@vidarbhaclean.com',
            offeredRates: JSON.stringify({
                'PCB': 540,
                'Cable': 125,
                'Motor': 150,
                'Magnet-bearing Assembly': 115,
                'Battery': 90,
                'Other': 45
            }),
            pickupAvailable: true,
            serviceArea: 'Nagpur Metro & Hingna Cluster (Radius: 35km)'
        },
        {
            id: 'rec-003',
            name: 'MahaRecycle Safe Green Hub',
            facilityLocation: 'Pimpri-Chinchwad MIDC, Pune',
            latitude: 18.6298,
            longitude: 73.7997,
            materialsAccepted: JSON.stringify(['PCB', 'Cable', 'Battery', 'CRT', 'LCD Panel', 'Motor', 'Mixed Plastic']),
            authorizationNumber: 'MPCB-PUNE-EW-9821-A',
            authorizationStatus: 'Authorized (ISO 14001 & CPCB)',
            contact: '+91 20 67341900 / support@maharecycle.org',
            offeredRates: JSON.stringify({
                'PCB': 530,
                'Cable': 135,
                'Battery': 100,
                'CRT': 30,
                'LCD Panel': 90,
                'Motor': 145,
                'Mixed Plastic': 32,
                'Magnet-bearing Assembly': 112,
                'Other': 52
            }),
            pickupAvailable: true,
            serviceArea: 'Pune, Pimpri, Chakan, Talegaon (Radius: 80km)'
        },
        {
            id: 'rec-004',
            name: 'Apex Circular Economy & Refining Ltd',
            facilityLocation: 'Taloja Industrial Area, Navi Mumbai',
            latitude: 19.0438,
            longitude: 73.1189,
            materialsAccepted: JSON.stringify(['PCB', 'Cable', 'Battery', 'LCD Panel']),
            authorizationNumber: 'CPCB-REG-MUM-2022-3310',
            authorizationStatus: 'Authorized (CPCB Grade A Facility)',
            contact: '+91 22 27419800 / desk@apexcircular.com',
            offeredRates: JSON.stringify({
                'PCB': 550,
                'Cable': 140,
                'Battery': 105,
                'LCD Panel': 95,
                'Motor': 138,
                'Mixed Plastic': 30,
                'Other': 55
            }),
            pickupAvailable: true,
            serviceArea: 'Mumbai, Navi Mumbai, Thane, Raigad'
        },
        {
            id: 'rec-005',
            name: 'Sahyadri Green Electronics Recyclers',
            facilityLocation: 'Ambad MIDC, Nashik',
            latitude: 19.9532,
            longitude: 73.7431,
            materialsAccepted: JSON.stringify(['PCB', 'Cable', 'Battery', 'Motor', 'CRT']),
            authorizationNumber: 'MPCB-NSK-EW-7712',
            authorizationStatus: 'Authorized (Govt. Licensed)',
            contact: '+91 253 2381200 / info@sahyadrigreen.in',
            offeredRates: JSON.stringify({
                'PCB': 510,
                'Cable': 122,
                'Battery': 92,
                'Motor': 135,
                'CRT': 28,
                'Mixed Plastic': 26,
                'Other': 45
            }),
            pickupAvailable: false,
            serviceArea: 'Nashik District & Sinnar Cluster'
        },
        {
            id: 'rec-006',
            name: 'Deccan E-Scrap Processors',
            facilityLocation: 'Waluj Industrial Estate, Aurangabad / Chhatrapati Sambhajinagar',
            latitude: 19.8378,
            longitude: 75.2415,
            materialsAccepted: JSON.stringify(['PCB', 'Cable', 'Battery', 'Motor', 'Magnet-bearing Assembly']),
            authorizationNumber: 'MPCB-AGB-EW-4491-B',
            authorizationStatus: 'Authorized (State Board Certified)',
            contact: '+91 240 2552901 / contact@deccanescrap.com',
            offeredRates: JSON.stringify({
                'PCB': 515,
                'Cable': 128,
                'Battery': 96,
                'Motor': 142,
                'Magnet-bearing Assembly': 108,
                'Other': 48
            }),
            pickupAvailable: true,
            serviceArea: 'Aurangabad, Jalna, Ahmednagar'
        },
        {
            id: 'rec-007',
            name: 'EarthSafe Recovery & Smelting Works',
            facilityLocation: 'Bhiwandi Logistic Hub, Thane',
            latitude: 19.2967,
            longitude: 73.0631,
            materialsAccepted: JSON.stringify(['PCB', 'Cable', 'Battery', 'LCD Panel', 'Mixed Plastic']),
            authorizationNumber: 'CPCB-REC-THN-8801',
            authorizationStatus: 'Authorized (Central Registry)',
            contact: '+91 2522 284102 / plant@earthsaferecovery.in',
            offeredRates: JSON.stringify({
                'PCB': 535,
                'Cable': 138,
                'Battery': 102,
                'LCD Panel': 88,
                'Mixed Plastic': 35,
                'Other': 50
            }),
            pickupAvailable: true,
            serviceArea: 'Thane, Kalyan, Bhiwandi, Dombivli'
        },
        {
            id: 'rec-008',
            name: 'Kalyan E-Waste Dismantling Unit',
            facilityLocation: 'MIDC Kalyan, Maharashtra',
            latitude: 19.2403,
            longitude: 73.1305,
            materialsAccepted: JSON.stringify(['CRT', 'PCB', 'Cable', 'Mixed Plastic', 'Other']),
            authorizationNumber: 'MPCB/RO-KLN/E-WASTE/2021',
            authorizationStatus: 'Authorized (MPCB Audited)',
            contact: '+91 251 2291034 / kalyanewaste@gmail.com',
            offeredRates: JSON.stringify({
                'PCB': 495,
                'Cable': 120,
                'CRT': 32,
                'Mixed Plastic': 30,
                'Other': 42
            }),
            pickupAvailable: false,
            serviceArea: 'Kalyan, Ulhasnagar, Ambernath'
        }
    ];
    for (const r of recyclersData) {
        await prisma.recycler.create({ data: r });
    }
    console.log('--- Seeding Material Catalog (30+ variations) ---');
    const materials = [
        { category: 'PCB', subCategory: 'High-Grade Telecom / Server Boards', description: 'Gold/palladium plated server boards, motherboards, telecom switches.', basePricePerKg: 540, marketRangeMin: 500, marketRangeMax: 620, hazardLevel: 'High', handlingTip: 'Never use toxic acid leaching; formal recyclers use mechanical granulation and hydrometallurgy.', handlingTipHi: 'तेज़ाब का उपयोग कभी न करें; अधिकृत रीसायकलर्स सुरक्षित मशीनों का उपयोग करते हैं।', handlingTipMr: 'अॅसिडमध्ये कधीही जाळू नका; अधिकृत प्रक्रिया केंद्र सुरक्षित पद्धती वापरतात.' },
        { category: 'PCB', subCategory: 'Computer & Laptop Motherboards', description: 'Standard desktop and notebook green/blue motherboards.', basePricePerKg: 490, marketRangeMin: 450, marketRangeMax: 560, hazardLevel: 'Medium', handlingTip: 'Keep boards intact without snapping to preserve component values.', handlingTipHi: 'बोर्ड्स को न तोड़ें ताकि कॉम्पोनेन्ट की पूरी कीमत मिले।', handlingTipMr: 'बोर्डचे तुकडे करू नका; अखंड बोर्डला चांगला भाव मिळतो.' },
        { category: 'PCB', subCategory: 'Low-Grade Power Supply / TV Boards', description: 'Brown phenolic paper board from TVs, radios, power adapters.', basePricePerKg: 180, marketRangeMin: 150, marketRangeMax: 220, hazardLevel: 'Medium', handlingTip: 'Store in dry shade; do not burn resin coatings.', handlingTipHi: 'सूखी जगह पर रखें; प्लास्टिक या रेज़िन को कभी न जलाएं।', handlingTipMr: 'सुक्या जागेत ठेवा; कोटिंग किंवा प्लास्टिक जाळू नका.' },
        { category: 'Cable', subCategory: 'High-Grade Thick Copper Cable', description: 'Heavy industrial power cable, copper core > 60%.', basePricePerKg: 280, marketRangeMin: 250, marketRangeMax: 330, hazardLevel: 'High', handlingTip: 'DO NOT BURN CABLES. Stripping machines get you ₹50-₹80 more per kg safely.', handlingTipHi: 'तार को आग मत लगाओ! केबल छीलने वाली मशीन से ₹50-₹80 ज्यादा भाव मिलता है।', handlingTipMr: 'केबल जाळू नका! मशिनने छिलल्यास ₹५०-₹८० जास्त दर मिळतो.' },
        { category: 'Cable', subCategory: 'Domestic PVC Insulated Copper Wire', description: 'Household electrical flexible insulated copper wiring.', basePricePerKg: 135, marketRangeMin: 110, marketRangeMax: 155, hazardLevel: 'Medium', handlingTip: 'Burning releases toxic dioxins into your lungs. Handover with insulation intact.', handlingTipHi: 'जलाने से फेफड़ों में ज़हरीला धुआं जाता है। बिना जलाए बेचें।', handlingTipMr: 'जाळल्याने विषारी वायू पसरतो. अखंड वायर अधिकृत केंद्राला द्या.' },
        { category: 'Cable', subCategory: 'Aluminum Ribbon & Power Cables', description: 'Aluminum conductor cables from appliances and wiring.', basePricePerKg: 85, marketRangeMin: 70, marketRangeMax: 105, hazardLevel: 'Low', handlingTip: 'Separate aluminum from copper for accurate grading.', handlingTipHi: 'एल्युमिनियम और तांबे की तारों को अलग-अलग रखें।', handlingTipMr: 'अ‍ॅल्युमिनियम आणि तांब्याच्या तारा वेगळ्या ठेवा.' },
        { category: 'Battery', subCategory: 'Lithium-Ion Smartphone / Laptop Cells', description: 'Pouch and 18650 cylindrical Li-ion cells.', basePricePerKg: 115, marketRangeMin: 95, marketRangeMax: 140, hazardLevel: 'Extreme', handlingTip: 'Do not puncture, crush, or immerse in water. Risk of thermal fire!', handlingTipHi: 'बैटरी को छेदें या तोड़ें नहीं; इसमें भयंकर आग लग सकती है!', handlingTipMr: 'बॅटरी कापू नका किंवा दाबू नका; स्फोट किंवा आगीचा धोका असतो!' },
        { category: 'Battery', subCategory: 'Lead-Acid Inverter / UPS Batteries', description: 'Sealed lead-acid (SLA) backup units and e-rickshaw batteries.', basePricePerKg: 95, marketRangeMin: 80, marketRangeMax: 115, hazardLevel: 'Extreme', handlingTip: 'Never drain acid into soil or sewer drains. Wear heavy rubber gloves.', handlingTipHi: 'एसिड को नाली या मिट्टी में न बहाएं। रबर के दस्ताने पहनें।', handlingTipMr: 'अॅसिड जमिनीत किंवा नाल्यात ओतू नका. हातमोजे वापरा.' },
        { category: 'Battery', subCategory: 'Nickel-Cadmium / NiMH Power Tool Packs', description: 'Rechargeable cordless drill battery packs.', basePricePerKg: 65, marketRangeMin: 50, marketRangeMax: 80, hazardLevel: 'High', handlingTip: 'Cadmium is a cumulative neurotoxin. Keep terminals taped.', handlingTipHi: 'कैडमियम ज़हरीला होता है। सिरों पर टेप चिपका कर रखें।', handlingTipMr: 'कॅडमियम अत्यंत विषारी आहे. टोकांवर चिकटपट्टी लावा.' },
        { category: 'CRT', subCategory: 'CRT Television Monitor Glass Tube', description: 'Bulky leaded glass funnel and phosphor shadow mask.', basePricePerKg: 28, marketRangeMin: 20, marketRangeMax: 35, hazardLevel: 'High', handlingTip: 'Do NOT break CRT glass tube with hammer. Vacuum implosion and lead dust danger.', handlingTipHi: 'हथौड़े से कांच न फोड़ें! अंदर वैक्यूम और सीसा (लेड) होता है।', handlingTipMr: 'काच हातोडीने फोडू नका! विषारी शिशाची धूळ पसरते.' },
        { category: 'LCD Panel', subCategory: 'LED/LCD Laptop & TV Screens', description: 'Flat screens with CCFL or LED edge backlights.', basePricePerKg: 85, marketRangeMin: 70, marketRangeMax: 105, hazardLevel: 'Medium', handlingTip: 'Older CCFL backlights contain toxic mercury vapor. Keep screens unbroken.', handlingTipHi: 'पुरानी स्क्रीन में पारा (मरकरी) होता है। कांच टूटने से बचाएं।', handlingTipMr: 'जुन्या स्क्रीनमध्ये पारा असतो. काच फुटणार नाही याची काळजी घ्या.' },
        { category: 'Motor', subCategory: 'Copper Wound Washing Machine & Fan Motors', description: 'Electric induction motors containing heavy copper windings.', basePricePerKg: 145, marketRangeMin: 125, marketRangeMax: 165, hazardLevel: 'Low', handlingTip: 'Recyclers test copper vs aluminum winding with simple scratch check.', handlingTipHi: 'रीसायकलर तांबे की जांच खरोंच कर करते हैं; तांबे का रेट सबसे अधिक होता है।', handlingTipMr: 'तांब्याच्या वाइंडिंगला चांगला भाव मिळतो.' },
        { category: 'Motor', subCategory: 'Compressor Units (AC / Fridge)', description: 'Sealed hermetic refrigeration compressor motor units.', basePricePerKg: 75, marketRangeMin: 65, marketRangeMax: 90, hazardLevel: 'High', handlingTip: 'Contains refrigerant oil. Venting freon gas is harmful to environment.', handlingTipHi: 'इसमें गैस और तेल होता है। अधिकृत सेंटर पर ही खोलें।', handlingTipMr: 'यात गॅस व ऑईल असते. केवळ अधिकृत केंद्रातच जमा करा.' },
        { category: 'Magnet-bearing Assembly', subCategory: 'Neodymium Hard Disk Drive Magnets', description: 'Rare-earth NdFeB permanent magnets from HDDs and optical pickups.', basePricePerKg: 120, marketRangeMin: 100, marketRangeMax: 150, hazardLevel: 'Low', handlingTip: 'Keep separated from magnetic credit cards and phone screens.', handlingTipHi: 'इन्हें मोबाइल और एटीएम कार्ड से दूर रखें।', handlingTipMr: 'हे चुंबक फोन आणि एटीएम कार्डपासून दूर ठेवा.' },
        { category: 'Magnet-bearing Assembly', subCategory: 'Ferrite Speaker Magnet Assemblies', description: 'Ceramic ferrite permanent magnets from audio speakers.', basePricePerKg: 35, marketRangeMin: 25, marketRangeMax: 45, hazardLevel: 'Low', handlingTip: 'Keep dry to avoid oxidization.', handlingTipHi: 'सूखे में रखें।', handlingTipMr: 'सुक्या जागेत ठेवा.' },
        { category: 'Mixed Plastic', subCategory: 'ABS Printer & Monitor Casings', description: 'Clean rigid plastic casings from electronics, flame retardant free.', basePricePerKg: 32, marketRangeMin: 26, marketRangeMax: 38, hazardLevel: 'Low', handlingTip: 'Keep clean from oil and dirt to get premium grade classification.', handlingTipHi: 'धूल-मिट्टी से साफ रखें ताकि बढ़िया ग्रेड का मूल्य मिले।', handlingTipMr: 'माती व तेलापासून दूर ठेवा, चांगला दर मिळतो.' },
        { category: 'Mixed Plastic', subCategory: 'HIPS & Polycarbonate Housings', description: 'Transparent and high-impact plastic electronic parts.', basePricePerKg: 28, marketRangeMin: 22, marketRangeMax: 35, hazardLevel: 'Low', handlingTip: 'Segregate colored and clear plastics for higher payouts.', handlingTipHi: 'सफ़ेद और रंगीन प्लास्टिक को अलग करने से ज्यादा पैसे मिलते हैं।', handlingTipMr: 'रंगीत आणि पारदर्शक प्लास्टिक वेगळे केल्यास अधिक पैसे मिळतात.' },
        { category: 'Other', subCategory: 'SMPS Computer Power Supplies', description: 'Enclosed metal boxes with transformer, capacitors, wires.', basePricePerKg: 65, marketRangeMin: 50, marketRangeMax: 80, hazardLevel: 'Medium', handlingTip: 'Do not touch internal large electrolytic capacitors; risk of high residual voltage.', handlingTipHi: 'बड़े कंडेंसर को हाथ न लगाएं, झटका लग सकता है।', handlingTipMr: 'मोठ्या कॅपॅसिटरला हात लावू नका, विजेचा धक्का बसू शकतो.' },
        { category: 'Other', subCategory: 'Optical CD/DVD Drives & Floppy Units', description: 'Drive mechanisms with small motor, steel tray, and circuit.', basePricePerKg: 55, marketRangeMin: 40, marketRangeMax: 70, hazardLevel: 'Low', handlingTip: 'Steel casing and aluminum tray can be disassembled easily.', handlingTipHi: 'आसानी से अलग किया जा सकता है।', handlingTipMr: 'सहज वेगळे करता येते.' },
        { category: 'Other', subCategory: 'Mixed Small Household Appliances', description: 'Mix of blenders, toasters, chargers, electric irons.', basePricePerKg: 45, marketRangeMin: 35, marketRangeMax: 55, hazardLevel: 'Low', handlingTip: 'Cut power cords and bundle separately to maximize value.', handlingTipHi: 'तार काटकर अलग जमा करें, इससे दोनों का अच्छा भाव मिलता है।', handlingTipMr: 'वायर कापून वेगळी करा, दोघांचा चांगला दर मिळतो.' },
    ];
    for (const m of materials) {
        await prisma.materialCatalog.create({ data: m });
    }
    console.log('--- Seeding Historical Price Records (120+ entries) ---');
    const cities = ['Nagpur', 'Pune', 'Mumbai', 'Nashik'];
    const categoriesForPrice = [
        { cat: 'PCB', base: 490, vol: 15 },
        { cat: 'Cable', base: 130, vol: 6 },
        { cat: 'Battery', base: 95, vol: 5 },
        { cat: 'LCD Panel', base: 85, vol: 4 },
        { cat: 'Motor', base: 140, vol: 8 },
        { cat: 'CRT', base: 28, vol: 2 },
        { cat: 'Magnet-bearing Assembly', base: 110, vol: 6 },
        { cat: 'Mixed Plastic', base: 30, vol: 2 }
    ];
    // Generate historical prices for 15 days across 4 cities
    for (let dayOffset = 15; dayOffset >= 0; dayOffset--) {
        const date = new Date(Date.now() - dayOffset * 24 * 60 * 60 * 1000);
        for (const city of cities) {
            for (const item of categoriesForPrice) {
                // Pseudo-random trend with slight variation
                const dayTrend = Math.sin((15 - dayOffset) * 0.4) * item.vol;
                const cityOffset = city === 'Mumbai' ? 12 : city === 'Pune' ? 8 : city === 'Nagpur' ? 0 : -5;
                const currentPrice = Math.round(item.base + dayTrend + cityOffset);
                await prisma.price.create({
                    data: {
                        materialCategory: item.cat,
                        location: city,
                        date: date,
                        buyingPrice: currentPrice,
                        sellingPrice: Math.round(currentPrice * 1.15),
                        unit: 'kg',
                        source: 'Recycler Average / Market APMC Hub'
                    }
                });
            }
        }
    }
    console.log('--- Seeding Realistic Lots & Transactions (30+) ---');
    const sampleLots = [
        { ref: 'EWL-20260928-0001', colId: 'col-001', recId: 'rec-001', cat: 'PCB', wt: 25.0, estMin: 11250, estMax: 13750, estVal: 12500, loc: 'Nagpur (Sitabuldi)', status: 'COMPLETED', rate: 520, finalVal: 13000, daysAgo: 0, payStatus: 'PAID' },
        { ref: 'EWL-20260927-0002', colId: 'col-001', recId: 'rec-001', cat: 'Cable', wt: 40.0, estMin: 4400, estMax: 5600, estVal: 5000, loc: 'Nagpur (MIDC)', status: 'COMPLETED', rate: 130, finalVal: 5200, daysAgo: 1, payStatus: 'PAID' },
        { ref: 'EWL-20260926-0003', colId: 'col-002', recId: 'rec-002', cat: 'Motor', wt: 35.0, estMin: 4500, estMax: 5800, estVal: 5100, loc: 'Nagpur (Kamptee)', status: 'COMPLETED', rate: 150, finalVal: 5250, daysAgo: 2, payStatus: 'PAID' },
        { ref: 'EWL-20260925-0004', colId: 'col-003', recId: 'rec-003', cat: 'PCB', wt: 18.5, estMin: 8500, estMax: 10500, estVal: 9500, loc: 'Pune (Bhosari)', status: 'COMPLETED', rate: 530, finalVal: 9805, daysAgo: 3, payStatus: 'PAID' },
        { ref: 'EWL-20260924-0005', colId: 'col-003', recId: 'rec-003', cat: 'Battery', wt: 50.0, estMin: 4200, estMax: 5500, estVal: 4800, loc: 'Pune (Chakan)', status: 'COMPLETED', rate: 100, finalVal: 5000, daysAgo: 4, payStatus: 'PAID' },
        { ref: 'EWL-20260923-0006', colId: 'col-004', recId: 'rec-004', cat: 'Cable', wt: 75.0, estMin: 9000, estMax: 11500, estVal: 10200, loc: 'Mumbai (Kurla)', status: 'COMPLETED', rate: 140, finalVal: 10500, daysAgo: 5, payStatus: 'PAID' },
        { ref: 'EWL-20260922-0007', colId: 'col-004', recId: 'rec-004', cat: 'PCB', wt: 42.0, estMin: 20000, estMax: 24500, estVal: 22000, loc: 'Mumbai (Dharavi)', status: 'COMPLETED', rate: 550, finalVal: 23100, daysAgo: 6, payStatus: 'PAID' },
        { ref: 'EWL-20260921-0008', colId: 'col-005', recId: 'rec-005', cat: 'Battery', wt: 30.0, estMin: 2500, estMax: 3300, estVal: 2900, loc: 'Nashik (Ambad)', status: 'COMPLETED', rate: 92, finalVal: 2760, daysAgo: 7, payStatus: 'PAID' },
        { ref: 'EWL-20260920-0009', colId: 'col-006', recId: 'rec-007', cat: 'LCD Panel', wt: 22.0, estMin: 1600, estMax: 2200, estVal: 1900, loc: 'Thane (Wagle)', status: 'COMPLETED', rate: 88, finalVal: 1936, daysAgo: 8, payStatus: 'PAID' },
        { ref: 'EWL-20260919-0010', colId: 'col-007', recId: 'rec-003', cat: 'Motor', wt: 60.0, estMin: 7500, estMax: 9500, estVal: 8500, loc: 'Pune (Hadapsar)', status: 'COMPLETED', rate: 145, finalVal: 8700, daysAgo: 9, payStatus: 'PAID' },
        { ref: 'EWL-20260918-0011', colId: 'col-008', recId: 'rec-001', cat: 'Mixed Plastic', wt: 90.0, estMin: 2200, estMax: 3000, estVal: 2600, loc: 'Nagpur (Hingna)', status: 'COMPLETED', rate: 28, finalVal: 2520, daysAgo: 10, payStatus: 'PAID' },
        { ref: 'EWL-20260917-0012', colId: 'col-009', recId: 'rec-006', cat: 'PCB', wt: 15.0, estMin: 7000, estMax: 8800, estVal: 7800, loc: 'Aurangabad (Waluj)', status: 'COMPLETED', rate: 515, finalVal: 7725, daysAgo: 11, payStatus: 'PAID' },
        { ref: 'EWL-20260916-0013', colId: 'col-010', recId: 'rec-004', cat: 'Magnet-bearing Assembly', wt: 45.0, estMin: 4500, estMax: 5900, estVal: 5200, loc: 'Mumbai (Mahim)', status: 'COMPLETED', rate: 115, finalVal: 5175, daysAgo: 12, payStatus: 'PAID' },
        { ref: 'EWL-20260915-0014', colId: 'col-001', recId: 'rec-002', cat: 'Motor', wt: 28.0, estMin: 3600, estMax: 4600, estVal: 4100, loc: 'Nagpur (Sitabuldi)', status: 'COMPLETED', rate: 150, finalVal: 4200, daysAgo: 13, payStatus: 'PAID' },
        { ref: 'EWL-20260914-0015', colId: 'col-002', recId: 'rec-001', cat: 'CRT', wt: 80.0, estMin: 1800, estMax: 2600, estVal: 2200, loc: 'Nagpur (Kamptee)', status: 'COMPLETED', rate: 25, finalVal: 2000, daysAgo: 14, payStatus: 'PAID' },
        // Pending / In-progress Lots for Live Demo
        { ref: 'EWL-20260928-0016', colId: 'col-001', recId: 'rec-001', cat: 'Battery', wt: 12.0, estMin: 1050, estMax: 1400, estVal: 1200, loc: 'Nagpur (Sitabuldi)', status: 'ACCEPTED', rate: 95, finalVal: 1140, daysAgo: 0, payStatus: 'PENDING' },
        { ref: 'EWL-20260928-0017', colId: 'col-002', recId: 'rec-002', cat: 'PCB', wt: 30.0, estMin: 14000, estMax: 17500, estVal: 15500, loc: 'Nagpur (Kamptee Road)', status: 'PENDING_MATCH', rate: 540, finalVal: 16200, daysAgo: 0, payStatus: 'PENDING' },
        { ref: 'EWL-20260928-0018', colId: 'col-003', recId: 'rec-003', cat: 'Cable', wt: 22.0, estMin: 2600, estMax: 3300, estVal: 2900, loc: 'Pune (Bhosari)', status: 'OFFER_RECEIVED', rate: 135, finalVal: 2970, daysAgo: 0, payStatus: 'PENDING' },
        // Intentional Demo Anomaly Lot (for AI Anomaly Detection demonstration)
        { ref: 'EWL-20260927-0019', colId: 'col-006', recId: 'rec-007', cat: 'PCB', wt: 50.0, estMin: 22500, estMax: 28000, estVal: 25000, loc: 'Thane (Wagle Estate)', status: 'COMPLETED', rate: 90, finalVal: 4500, daysAgo: 1, payStatus: 'PAID', anomaly: true, anomalyReason: 'Recorded rate ₹90/kg is 81% below typical market baseline (₹450-₹550/kg). Flagged for quality inspection.' },
        // More varied transactions
        { ref: 'EWL-20260926-0020', colId: 'col-005', recId: 'rec-005', cat: 'Cable', wt: 38.0, estMin: 4200, estMax: 5400, estVal: 4700, loc: 'Nashik (Ambad)', status: 'COMPLETED', rate: 122, finalVal: 4636, daysAgo: 2, payStatus: 'PAID' },
        { ref: 'EWL-20260925-0021', colId: 'col-007', recId: 'rec-003', cat: 'Battery', wt: 45.0, estMin: 3800, estMax: 5000, estVal: 4400, loc: 'Pune (Hadapsar)', status: 'COMPLETED', rate: 100, finalVal: 4500, daysAgo: 3, payStatus: 'PAID' },
        { ref: 'EWL-20260924-0022', colId: 'col-008', recId: 'rec-001', cat: 'Cable', wt: 26.0, estMin: 3000, estMax: 3800, estVal: 3400, loc: 'Nagpur (Hingna)', status: 'COMPLETED', rate: 130, finalVal: 3380, daysAgo: 4, payStatus: 'PAID' },
        { ref: 'EWL-20260923-0023', colId: 'col-009', recId: 'rec-006', cat: 'Motor', wt: 40.0, estMin: 5000, estMax: 6400, estVal: 5700, loc: 'Aurangabad (Waluj)', status: 'COMPLETED', rate: 142, finalVal: 5680, daysAgo: 5, payStatus: 'PAID' },
        { ref: 'EWL-20260922-0024', colId: 'col-010', recId: 'rec-004', cat: 'PCB', wt: 32.0, estMin: 15500, estMax: 19000, estVal: 17200, loc: 'Mumbai (Dharavi)', status: 'COMPLETED', rate: 550, finalVal: 17600, daysAgo: 6, payStatus: 'PAID' },
        { ref: 'EWL-20260921-0025', colId: 'col-001', recId: 'rec-001', cat: 'LCD Panel', wt: 18.0, estMin: 1300, estMax: 1800, estVal: 1500, loc: 'Nagpur (Sitabuldi)', status: 'COMPLETED', rate: 85, finalVal: 1530, daysAgo: 7, payStatus: 'PAID' },
        { ref: 'EWL-20260920-0026', colId: 'col-002', recId: 'rec-002', cat: 'Cable', wt: 55.0, estMin: 6200, estMax: 7800, estVal: 7000, loc: 'Nagpur (Kamptee)', status: 'COMPLETED', rate: 125, finalVal: 6875, daysAgo: 8, payStatus: 'PAID' },
        { ref: 'EWL-20260919-0027', colId: 'col-003', recId: 'rec-003', cat: 'Mixed Plastic', wt: 110.0, estMin: 2800, estMax: 3800, estVal: 3300, loc: 'Pune (Bhosari)', status: 'COMPLETED', rate: 32, finalVal: 3520, daysAgo: 9, payStatus: 'PAID' },
        { ref: 'EWL-20260918-0028', colId: 'col-004', recId: 'rec-004', cat: 'Motor', wt: 50.0, estMin: 6200, estMax: 7800, estVal: 7000, loc: 'Mumbai (Kurla)', status: 'COMPLETED', rate: 138, finalVal: 6900, daysAgo: 10, payStatus: 'PAID' },
        { ref: 'EWL-20260917-0029', colId: 'col-005', recId: 'rec-005', cat: 'PCB', wt: 20.0, estMin: 9200, estMax: 11500, estVal: 10200, loc: 'Nashik (Ambad)', status: 'COMPLETED', rate: 510, finalVal: 10200, daysAgo: 11, payStatus: 'PAID' },
        { ref: 'EWL-20260916-0030', colId: 'col-006', recId: 'rec-007', cat: 'Battery', wt: 35.0, estMin: 3000, estMax: 4000, estVal: 3400, loc: 'Thane (Wagle)', status: 'COMPLETED', rate: 102, finalVal: 3570, daysAgo: 12, payStatus: 'PAID' },
        { ref: 'EWL-20260915-0031', colId: 'col-007', recId: 'rec-003', cat: 'Cable', wt: 45.0, estMin: 5200, estMax: 6600, estVal: 5900, loc: 'Pune (Hadapsar)', status: 'COMPLETED', rate: 135, finalVal: 6075, daysAgo: 13, payStatus: 'PAID' },
        { ref: 'EWL-20260914-0032', colId: 'col-008', recId: 'rec-001', cat: 'PCB', wt: 16.0, estMin: 7500, estMax: 9200, estVal: 8300, loc: 'Nagpur (Hingna)', status: 'COMPLETED', rate: 520, finalVal: 8320, daysAgo: 14, payStatus: 'PAID' },
    ];
    let txnCounter = 1;
    for (const item of sampleLots) {
        const lotDate = new Date(Date.now() - item.daysAgo * 24 * 60 * 60 * 1000);
        const lot = await prisma.lot.create({
            data: {
                lotReference: item.ref,
                collectorId: item.colId,
                materialCategory: item.cat,
                materialDescription: `Clean sorted batch of ${item.cat} collected by field team`,
                imageReference: `/demo-images/${item.cat.toLowerCase().replace(/\s+/g, '-')}.jpg`,
                approximateWeight: item.wt,
                condition: 'Good',
                estimatedValue: item.estVal,
                estimatedRangeMin: item.estMin,
                estimatedRangeMax: item.estMax,
                collectionLocation: item.loc,
                latitude: item.loc.includes('Nagpur') ? 21.1458 : item.loc.includes('Pune') ? 18.5204 : item.loc.includes('Mumbai') ? 19.0760 : 19.9975,
                longitude: item.loc.includes('Nagpur') ? 79.0882 : item.loc.includes('Pune') ? 73.8567 : item.loc.includes('Mumbai') ? 72.8777 : 73.7898,
                status: item.status,
                selectedRecyclerId: item.recId,
                createdAt: lotDate
            }
        });
        if (item.status === 'COMPLETED' || item.status === 'ACCEPTED') {
            const txnRef = `TXN-20260928-${String(txnCounter).padStart(4, '0')}`;
            txnCounter++;
            const transaction = await prisma.transaction.create({
                data: {
                    transactionReference: txnRef,
                    lotId: lot.id,
                    collectorId: item.colId,
                    recyclerId: item.recId,
                    quotedPrice: item.rate,
                    finalSaleValue: item.finalVal,
                    handoverLocation: item.loc,
                    handoverLatitude: lot.latitude,
                    handoverLongitude: lot.longitude,
                    dateTime: lotDate,
                    paymentStatus: item.payStatus,
                    transactionStatus: item.status === 'COMPLETED' ? 'COMPLETED' : 'HANDED_OVER',
                    anomalyFlag: item.anomaly || false,
                    anomalyReason: item.anomalyReason || null
                }
            });
            // Traceability record
            await prisma.traceabilityRecord.create({
                data: {
                    lotId: lot.id,
                    photographs: JSON.stringify([lot.imageReference || '/demo-images/sample-ewaste.jpg']),
                    weight: item.wt,
                    timestamp: lotDate,
                    gpsCoordinates: `${lot.latitude}, ${lot.longitude}`,
                    handoverReference: txnRef,
                    recyclerConfirmation: true,
                    subsequentStatus: item.status === 'COMPLETED' ? 'Processed into clean scrap fractions' : 'In Facility Storage'
                }
            });
            // Earnings entry
            await prisma.earnings.create({
                data: {
                    collectorId: item.colId,
                    transactionId: transaction.id,
                    amount: item.finalVal,
                    paymentMethod: 'Instant UPI / Direct Bank',
                    paymentStatus: item.payStatus,
                    date: lotDate
                }
            });
        }
    }
    console.log('--- Database seeding completed successfully! ---');
}
main()
    .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
