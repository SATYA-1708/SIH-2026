import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useI18n } from '../services/i18n';
import { api, getCurrentUser } from '../services/api';
import { saveToOfflineQueue } from '../services/offlineStorage';
import { CameraCapture } from '../components/CameraCapture';
import { AudioSpeaker } from '../components/AudioSpeaker';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  MapPin, 
  Scale, 
  AlertTriangle, 
  Building2,
  Cpu,
  Layers,
  Radio,
  Tv,
  Monitor,
  Zap,
  Magnet,
  Boxes,
  HelpCircle,
  WifiOff,
  Flame
} from 'lucide-react';

const MATERIAL_CATEGORIES = [
  { id: 'PCB', label: 'Circuit Board (PCB)', labelHi: 'सर्किट बोर्ड (PCB)', labelMr: 'सर्किट बोर्ड (PCB)', icon: Cpu, baseRate: '₹450–₹580/kg' },
  { id: 'Cable', label: 'Copper / Electric Cable', labelHi: 'केबल / बिजली का तार', labelMr: 'केबल / विजेची वायर', icon: Radio, baseRate: '₹100–₹155/kg' },
  { id: 'Battery', label: 'Batteries (Li-ion/Lead)', labelHi: 'बैटरी (मोबाइल / इनवर्टर)', labelMr: 'बॅटरी (मोबाईल / इनव्हर्टर)', icon: Zap, baseRate: '₹75–₹125/kg' },
  { id: 'CRT', label: 'CRT Screen / Glass', labelHi: 'पुराने टीवी का शीशा (CRT)', labelMr: 'जुन्या टीव्हीची काच (CRT)', icon: Tv, baseRate: '₹20–₹35/kg' },
  { id: 'LCD Panel', label: 'LCD / LED Display', labelHi: 'एलसीडी / लैपटॉप स्क्रीन', labelMr: 'एलसीडी / लॅपटॉप स्क्रीन', icon: Monitor, baseRate: '₹70–₹105/kg' },
  { id: 'Motor', label: 'Electric Motor / Pump', labelHi: 'इलेक्ट्रिक मोटर / पंखा', labelMr: 'इलेक्ट्रिक मोटर / पंखा', icon: Layers, baseRate: '₹120–₹165/kg' },
  { id: 'Magnet-bearing Assembly', label: 'Magnet Assembly', labelHi: 'चुंबक / हार्ड डिस्क', labelMr: 'चुंबक / हार्ड डिस्क', icon: Magnet, baseRate: '₹95–₹140/kg' },
  { id: 'Mixed Plastic', label: 'E-Waste Plastic', labelHi: 'कम्प्यूटर का प्लास्टिक', labelMr: 'संगणकाचे प्लास्टिक', icon: Boxes, baseRate: '₹24–₹38/kg' },
  { id: 'Other', label: 'Other Electronic Scrap', labelHi: 'अन्य इलेक्ट्रॉनिक कचरा', labelMr: 'इतर इलेक्ट्रॉनिक भंगार', icon: HelpCircle, baseRate: '₹35–₹70/kg' },
];

export const CreateLotPage: React.FC = () => {
  const { t, language } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const navState = (location.state as any) || {};
  const user = getCurrentUser();

  const [step, setStep] = useState<number>(() => {
    if (navState.fromVoice && (navState.preCategory || navState.preWeight)) {
      return 3;
    }
    return 1;
  });
  const [photo, setPhoto] = useState<string>('');
  const [category, setCategory] = useState<string>(() => navState.preCategory || 'PCB');
  const [weight, setWeight] = useState<string>(() => navState.preWeight || '25');
  const [voiceBanner, setVoiceBanner] = useState<boolean>(() => !!navState.fromVoice);
  const [condition, setCondition] = useState<string>('Good');
  const [locationName, setLocationName] = useState<string>(user?.location || 'Nagpur MIDC Phase 2');
  const [latitude, setLatitude] = useState<number>(21.1458);
  const [longitude, setLongitude] = useState<number>(79.0882);
  const [matchedRecyclers, setMatchedRecyclers] = useState<any[]>([]);
  const [selectedRecyclerId, setSelectedRecyclerId] = useState<string>('');
  const [loadingMatches, setLoadingMatches] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isOfflineCreated, setIsOfflineCreated] = useState<boolean>(false);

  // Trust & Market Intelligence State
  const [dealEvaluation, setDealEvaluation] = useState<any | null>(null);
  const [recoveryYield, setRecoveryYield] = useState<any | null>(null);

  // Auto detect GPS location if user grants permission
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
        },
        () => console.log('Location permission denied, using city default')
      );
    }
  }, []);

  // Fetch matched recyclers when category or weight changes
  useEffect(() => {
    const fetchMatches = async () => {
      setLoadingMatches(true);
      try {
        const wt = parseFloat(weight) || 10;
        const matches = await api.getRecyclerMatches(category, wt, latitude, longitude);
        setMatchedRecyclers(matches);
        if (matches.length > 0 && !selectedRecyclerId) {
          setSelectedRecyclerId(matches[0].id);
        }
      } catch (e) {
        console.error('Match failed', e);
      } finally {
        setLoadingMatches(false);
      }
    };

    if (step >= 5) {
      fetchMatches();
    }
  }, [category, weight, step, latitude, longitude]);

  // Load Realized Fair Value & Critical Mineral Yield
  useEffect(() => {
    const fetchDealAndYield = async () => {
      try {
        const wt = parseFloat(weight) || 10;
        const selectedRecycler = matchedRecyclers.find((r) => r.id === selectedRecyclerId);
        const offeredRate = selectedRecycler?.offeredRatesMap?.[category] || 510;

        const [dealRes, yieldRes] = await Promise.all([
          api
            .evaluateDeal({
              materialCategory: category,
              offeredRate,
              location: locationName,
            })
            .catch(() => null),
          api.getRecoveryYield(category, wt).catch(() => null),
        ]);

        if (dealRes) setDealEvaluation(dealRes);
        if (yieldRes) setRecoveryYield(yieldRes);
      } catch (err) {
        console.error('Failed to load deal intelligence', err);
      }
    };

    if (step === 6) {
      fetchDealAndYield();
    }
  }, [step, category, weight, selectedRecyclerId, matchedRecyclers, locationName]);

  // Rate calculations
  const calculateRates = () => {
    const wt = parseFloat(weight) || 0;
    const rates: Record<string, { min: number; max: number; base: number }> = {
      'PCB': { min: 450, max: 580, base: 510 },
      'Cable': { min: 100, max: 155, base: 130 },
      'Battery': { min: 75, max: 125, base: 95 },
      'CRT': { min: 20, max: 35, base: 28 },
      'LCD Panel': { min: 70, max: 105, base: 85 },
      'Motor': { min: 120, max: 165, base: 140 },
      'Magnet-bearing Assembly': { min: 95, max: 140, base: 110 },
      'Mixed Plastic': { min: 24, max: 38, base: 30 },
      'Other': { min: 35, max: 70, base: 50 },
    };

    const cfg = rates[category] || rates['Other'];
    let factor = 1.0;
    if (condition === 'Used') factor = 0.95;
    if (condition === 'Damaged') factor = 0.85;
    if (condition === 'Mixed') factor = 0.88;

    const minPerKg = Math.round(cfg.min * factor);
    const maxPerKg = Math.round(cfg.max * factor);
    const estMin = Math.round(minPerKg * wt);
    const estMax = Math.round(maxPerKg * wt);
    const avgVal = Math.round(((estMin + estMax) / 2));

    return { minPerKg, maxPerKg, estMin, estMax, avgVal };
  };

  const rates = calculateRates();

  const handleSubmitLot = async () => {
    setSubmitting(true);
    const lotPayload = {
      collectorId: user?.id,
      materialCategory: category,
      materialDescription: `${condition} condition ${category} scrap lot`,
      imageReference: photo || '/demo-images/pcb.jpg',
      approximateWeight: parseFloat(weight) || 10,
      condition,
      collectionLocation: locationName,
      latitude,
      longitude,
      selectedRecyclerId: selectedRecyclerId || undefined,
    };

    // Check if offline
    if (!navigator.onLine) {
      // Save to offline storage queue
      const queuedLot = saveToOfflineQueue({
        ...lotPayload,
        estimatedValue: rates.avgVal,
      });
      setIsOfflineCreated(true);
      setSubmitting(false);
      setTimeout(() => {
        navigate('/lots');
      }, 2000);
      return;
    }

    try {
      const res = await api.createLot(lotPayload);
      if (res.transaction) {
        navigate(`/receipt/${res.transaction.id}`);
      } else {
        navigate('/lots');
      }
    } catch (error: any) {
      console.warn('Network error, fallback to offline queue', error);
      saveToOfflineQueue({
        ...lotPayload,
        estimatedValue: rates.avgVal,
      });
      setIsOfflineCreated(true);
      setTimeout(() => {
        navigate('/lots');
      }, 2000);
    } finally {
      setSubmitting(false);
    }
  };

  const getAudioStepExplanation = () => {
    if (step === 1) return 'फोटो खींचें या नीचे दिए गए किसी भी नमूने को चुनें। हमारा एआई अपने आप पहचान करेगा।';
    if (step === 2) return `आपने ${category} चुना है। इसका बाजार भाव लगभग ₹${rates.minPerKg} से ₹${rates.maxPerKg} प्रति किलो है।`;
    if (step === 3) return 'सामान का अंदाज़न वजन किलो में डालें। जैसे 25 किलो।';
    if (step === 4) return 'सामान की स्थिति चुनें - बढ़िया, पुराना, या टूटा हुआ।';
    if (step === 5) return 'अपनी दुकान या संग्रह का पता दर्ज करें।';
    return `कुल अनुमानित मूल्य लगभग ₹${rates.estMin.toLocaleString('en-IN')} से ₹${rates.estMax.toLocaleString('en-IN')} है। लॉट जमा करने के लिए बटन दबाएं।`;
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-20 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => (step > 1 ? setStep(step - 1) : navigate('/collector'))}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
            Step {step} of 6
          </span>
          <h2 className="text-base font-black text-slate-900">
            {step === 1 && t('step_photo')}
            {step === 2 && t('step_material')}
            {step === 3 && t('step_weight')}
            {step === 4 && t('step_condition')}
            {step === 5 && t('step_location')}
            {step === 6 && t('step_estimate')}
          </h2>
        </div>
        <AudioSpeaker text={getAudioStepExplanation()} size="sm" />
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
        <div
          className="bg-emerald-600 h-full transition-all duration-300"
          style={{ width: `${(step / 6) * 100}%` }}
        />
      </div>

      {/* Voice Assistant Prefill Notice */}
      {voiceBanner && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3 flex items-center justify-between text-xs text-emerald-900 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="text-base">🎤</span>
            <div className="font-medium">
              <span className="font-bold text-emerald-800">
                {language === 'hi' ? 'बोलकर भरा गया:' : language === 'mr' ? 'बोलून भरले:' : 'Voice Input Applied:'}
              </span>{' '}
              {category} • {weight} kg
            </div>
          </div>
          <button
            onClick={() => setVoiceBanner(false)}
            className="text-emerald-700 hover:text-emerald-950 font-bold px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* STEP 1: PHOTO UPLOAD & AI CLASSIFICATION */}
      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <CameraCapture
            onPhotoSelected={(url) => setPhoto(url)}
            onCategoryPredicted={(predicted) => setCategory(predicted)}
            selectedCategory={category}
          />
          <button
            onClick={() => setStep(2)}
            className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <span>{language === 'hi' ? 'अगला: सामान चुनें' : 'Next: Select Material'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* STEP 2: MATERIAL CATEGORY SELECTION */}
      {step === 2 && (
        <div className="space-y-3 animate-fade-in">
          <div className="text-xs text-slate-500 font-medium">
            सामान का प्रकार चुनें (Select Category):
          </div>
          <div className="grid grid-cols-1 gap-2">
            {MATERIAL_CATEGORIES.map((m) => {
              const Icon = m.icon;
              const isSelected = category === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setCategory(m.id)}
                  className={`p-3.5 rounded-2xl border-2 text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50 shadow-md ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="font-extrabold text-sm text-slate-900 block">
                        {language === 'hi' ? m.labelHi : language === 'mr' ? m.labelMr : m.label}
                      </span>
                      <span className="text-xs text-emerald-700 font-bold">{m.baseRate}</span>
                    </div>
                  </div>
                  {isSelected && <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* CONTEXTUAL REAL-TIME SAFETY ADVISORY */}
          {category === 'Battery' && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 text-xs space-y-1 animate-fade-in shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold flex items-center gap-1.5 text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  बैटरी सुरक्षा चेतावनी (Battery Hazard Alert)
                </span>
                <AudioSpeaker text="बैटरी को मोड़ें या छेदें नहीं! इसमें भयंकर आग लग सकती है। इसे सूखे प्लास्टिक के डिब्बे में अलग रखें।" size="sm" />
              </div>
              <p className="text-[11px] text-amber-900/90 leading-relaxed">
                <strong>नियम:</strong> बैटरी को कभी न जलाएं और न ही तोड़ें। इसे सूखे प्लास्टिक के क्रेट में अलग रखें ताकि आग या विस्फोट न हो।
              </p>
            </div>
          )}

          {category === 'Cable' && (
            <div className="p-3.5 rounded-2xl bg-red-50 border-2 border-red-300 text-red-950 text-xs space-y-1 animate-fade-in shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold flex items-center gap-1.5 text-red-900">
                  <Flame className="w-4 h-4 text-red-600 shrink-0" />
                  तार जलाने पर सख्त पाबंदी (Do NOT Burn Cables)
                </span>
                <AudioSpeaker text="तार को आग मत लगाओ! केबल छीलने वाली मशीन से ₹50 ज्यादा भाव मिलता है और फेफड़े सुरक्षित रहते हैं।" size="sm" />
              </div>
              <p className="text-[11px] text-red-900/90 leading-relaxed">
                <strong>आर्थिक लाभ:</strong> बिना जलाए छीलकर बेचने से ₹50–₹80/kg ज्यादा मिलते हैं और ज़हरीले धुएं (Dioxin) से फेफड़े सुरक्षित रहते हैं।
              </p>
            </div>
          )}

          {category === 'CRT' && (
            <div className="p-3.5 rounded-2xl bg-orange-50 border-2 border-orange-300 text-orange-950 text-xs space-y-1 animate-fade-in shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold flex items-center gap-1.5 text-orange-900">
                  <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0" />
                  कांच और सीसा (CRT Implosion & Lead Danger)
                </span>
                <AudioSpeaker text="टीवी की स्क्रीन को हथौड़े से मत तोड़ें! अंदर ज़हरीला सीसा होता है। इसे बिना तोड़े रीसायकलर को दें।" size="sm" />
              </div>
              <p className="text-[11px] text-orange-900/90 leading-relaxed">
                <strong>चेतावनी:</strong> हथौड़े से फोड़ने पर वैक्यूम ब्लास्ट और जहरीला सीसा (Lead Phosphor) फेफड़ों में घुस सकता है।
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setStep(1)}
              className="py-3 px-4 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-700"
            >
              पीछे
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md"
            >
              आगे: वजन डालें
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: APPROXIMATE WEIGHT */}
      {step === 3 && (
        <div className="space-y-4 animate-fade-in bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-2">
              <Scale className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900">{t('enter_weight')}</h3>
            <p className="text-xs text-slate-500">वजन का अंदाज़ा लगाएं, अंतिम तौल रीसायकलर के कांटे पर होगी।</p>
          </div>

          {/* Large weight display and presets */}
          <div className="flex items-center justify-center gap-2 py-4">
            <input
              type="number"
              min="1"
              max="5000"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-32 text-center text-4xl font-black text-slate-900 border-2 border-emerald-500 rounded-2xl py-3 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
            />
            <span className="text-xl font-black text-slate-500">किलो (kg)</span>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex justify-center gap-2">
            {['10', '25', '50', '100', '250'].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setWeight(w)}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all ${
                  weight === w ? 'bg-emerald-700 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {w} kg
              </button>
            ))}
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={() => setStep(2)}
              className="py-3 px-4 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-700"
            >
              पीछे
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md"
            >
              आगे: स्थिति चुनें
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: CONDITION */}
      {step === 4 && (
        <div className="space-y-3 animate-fade-in">
          <div className="text-xs text-slate-500 font-medium">
            सामान की स्थिति कैसी है? (Select Condition)
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'Good', label: t('condition_good'), desc: 'साबुत, गैर-टूटा हुआ (100% Rate)', icon: '✨' },
              { id: 'Used', label: t('condition_used'), desc: 'साधारण उपयोग (95% Rate)', icon: '📦' },
              { id: 'Damaged', label: t('condition_damaged'), desc: 'टूटा-फूटा / जला नहीं (85% Rate)', icon: '⚠️' },
              { id: 'Mixed', label: t('condition_mixed'), desc: 'मिला-जुला ढेर (88% Rate)', icon: '🔀' },
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCondition(c.id)}
                className={`p-4 rounded-2xl border-2 text-left flex flex-col justify-between transition-all ${
                  condition === c.id
                    ? 'border-emerald-600 bg-emerald-50 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <span className="text-2xl mb-1">{c.icon}</span>
                <span className="font-black text-sm text-slate-900 block">{c.label}</span>
                <span className="text-[10px] text-slate-500 leading-tight mt-0.5">{c.desc}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={() => setStep(3)}
              className="py-3 px-4 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-700"
            >
              पीछे
            </button>
            <button
              onClick={() => setStep(5)}
              className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md"
            >
              आगे: स्थान
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: LOCATION */}
      {step === 5 && (
        <div className="space-y-4 animate-fade-in bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm mb-1">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <span>कहाँ से उठाना है? (Pickup Location)</span>
            </div>
            <p className="text-xs text-slate-500">रीसायकलर की गाड़ी इसी पते पर आएगी।</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">स्थान / इलाका (Area / Landmark)</label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-600">GPS Coordinates:</span>
            <span className="font-mono font-bold text-slate-800">{latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setStep(4)}
              className="py-3 px-4 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-700"
            >
              पीछे
            </button>
            <button
              onClick={() => setStep(6)}
              className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md"
            >
              अनुमानित मूल्य देखें
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: ESTIMATE & RECYCLER SELECTION */}
      {step === 6 && (
        <div className="space-y-4 animate-fade-in">
          {/* Estimated Value Card */}
          <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-5 text-white shadow-xl text-center">
            <span className="text-xs text-emerald-200 font-bold uppercase tracking-wider block mb-1">
              {category} ({weight} kg)
            </span>
            <span className="text-xs text-emerald-300 font-medium block">
              {t('current_rate')}: ₹{rates.minPerKg}–₹{rates.maxPerKg}/kg
            </span>

            <div className="my-4 py-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/15">
              <span className="text-xs text-emerald-200 block mb-0.5">{t('estimated_value')}</span>
              <span className="text-3xl font-black text-amber-300 tracking-tight">
                ₹{rates.estMin.toLocaleString('en-IN')} – ₹{rates.estMax.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-[11px] text-emerald-200 block">
              * अंतिम रकम कांटे पर वास्तविक वजन और ग्रेडिंग के अनुसार होगी।
            </span>
          </div>

          {/* Matched Recyclers Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-800">रीसायकलर चुनें (Select Recycler):</span>
              <span className="text-emerald-700 font-bold">100% CPCB/MPCB मान्य</span>
            </div>

            {loadingMatches ? (
              <div className="p-4 text-center text-xs text-slate-500 animate-pulse bg-white rounded-2xl border">
                Finding best authorized recyclers...
              </div>
            ) : (
              <div className="space-y-2">
                {matchedRecyclers.slice(0, 3).map((r) => {
                  const isSelected = selectedRecyclerId === r.id;
                  const rate = r.offeredRatesMap?.[category] || rates.minPerKg;
                  const expectedTotal = Math.round(rate * (parseFloat(weight) || 10));

                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRecyclerId(r.id)}
                      className={`w-full p-3.5 rounded-2xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-sm text-slate-900">{r.name}</span>
                          </div>
                          <span className="text-[11px] text-emerald-700 font-bold block">
                            ✓ {r.authorizationStatus?.split('(')[0] || 'Authorized Recycler'}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {r.matchDetails?.distanceKm || '8.2'} km दूर • {r.pickupAvailable ? 'गाड़ी आएगी (Pickup)' : 'स्वयं डिलीवरी'}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-slate-500 block">ऑफर दर:</span>
                          <span className="text-base font-black text-emerald-800 block">
                            ₹{rate}/kg
                          </span>
                          <span className="text-[10px] text-slate-500">
                            कुल: ₹{expectedTotal.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* FAIR DEAL & BARGAINING ASSISTANT CARD */}
          {dealEvaluation && (
            <div
              className={`p-4 rounded-3xl border-2 text-xs space-y-2.5 animate-fade-in shadow-xs ${
                dealEvaluation.dealStatus === 'COMPETITIVE' || dealEvaluation.dealStatus === 'FAIR'
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                  : 'bg-amber-50/90 border-amber-400 text-amber-950'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase tracking-wider ${
                    dealEvaluation.dealStatus === 'COMPETITIVE' || dealEvaluation.dealStatus === 'FAIR'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-amber-500 text-slate-950'
                  }`}
                >
                  {dealEvaluation.dealStatus === 'COMPETITIVE'
                    ? '✓ बेहतरीन भाव (Competitive Deal)'
                    : dealEvaluation.dealStatus === 'FAIR'
                    ? '✓ उचित बाज़ार भाव (Fair Market Deal)'
                    : '⚠ औसत से कम भाव (Sub-Market Warning)'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {dealEvaluation.sampleTransactionCount} सत्यापित सौदों पर आधारित
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-[11px] text-slate-500 block">इलाके का औसत भाव (Cluster Median):</span>
                  <span className="text-base font-black text-slate-900">₹{dealEvaluation.clusterMedianRate}/kg</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">वर्तमान ऑफर का अंतर:</span>
                  <span
                    className={`text-sm font-black ${
                      dealEvaluation.pctDeviationFromMedian >= 0 ? 'text-emerald-700' : 'text-amber-800'
                    }`}
                  >
                    {dealEvaluation.pctDeviationFromMedian >= 0
                      ? `+${dealEvaluation.pctDeviationFromMedian}% अधिक`
                      : `${dealEvaluation.pctDeviationFromMedian}% कम`}
                  </span>
                </div>
              </div>

              {/* Vernacular Bargaining Prompt for Collector Empowerment */}
              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[11px] text-slate-800 flex items-center gap-1">
                    💬 बातचीत के लिए सुझाव (Bargaining Assistant):
                  </span>
                  <AudioSpeaker
                    text={language === 'mr' ? dealEvaluation.bargainingPromptMr : dealEvaluation.bargainingPromptHi}
                    size="sm"
                  />
                </div>
                <p className="text-[11px] text-slate-700 italic leading-snug">
                  "{language === 'mr' ? dealEvaluation.bargainingPromptMr : language === 'en' ? dealEvaluation.bargainingPromptEn : dealEvaluation.bargainingPromptHi}"
                </p>
              </div>
            </div>
          )}

          {/* NATIONAL CRITICAL MINERAL RECOVERY POTENTIAL */}
          {recoveryYield && (
            <div className="p-4 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-md text-xs space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-black text-[10px] uppercase tracking-wider">
                  💎 राष्ट्रीय खनिज सुरक्षा (Critical Minerals Recoverable)
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">Ministry of Mines Alignment</span>
              </div>
              <p className="text-[11px] text-slate-300">
                आपके {weight} किलो {category} से निकलने वाली बहुमूल्य धातुएं:
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {recoveryYield.criticalMinerals.map((m: any, idx: number) => (
                  <div key={idx} className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 block">{m.mineral}</span>
                    <span className="text-xs font-black text-amber-300">{m.estimatedYieldGramsOrKg}</span>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-emerald-400 pt-1 border-t border-slate-800">
                ✓ {recoveryYield.environmentalHazardPrevented}
              </div>
            </div>
          )}

          {/* Offline Notice if connection is lost */}
          {!navigator.onLine && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2">
              <WifiOff className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                <strong>इंटरनेट बंद है (Offline):</strong> आपका लॉट सुरक्षित रहेगा और कनेक्शन आने पर अपने आप सर्वर पर चला जाएगा।
              </span>
            </div>
          )}

          {isOfflineCreated && (
            <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold text-center animate-bounce">
              ✓ लॉट स्थानीय रूप से सहेज लिया गया है! इंटरनेट आने पर सिंक होगा।
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setStep(5)}
              className="py-3.5 px-4 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-700"
            >
              पीछे
            </button>
            <button
              onClick={handleSubmitLot}
              disabled={submitting}
              className="flex-1 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base shadow-xl shadow-emerald-700/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              {submitting ? (
                <span>जमा हो रहा है...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{t('create_lot')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
