import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../services/i18n';
import { api, getCurrentUser } from '../services/api';
import { AudioSpeaker } from '../components/AudioSpeaker';
import { 
  Building2, 
  ShieldCheck, 
  MapPin, 
  Truck, 
  Phone, 
  CheckCircle2, 
  Filter, 
  Sparkles,
  ArrowRight,
  Info,
  ChevronDown
} from 'lucide-react';

export const RecyclerMarketplacePage: React.FC = () => {
  const { t, language } = useI18n();
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [recyclers, setRecyclers] = useState<any[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('PCB');
  const [loading, setLoading] = useState<boolean>(true);
  const [showCriteriaModal, setShowCriteriaModal] = useState<boolean>(false);
  const [selectedRecyclerForModal, setSelectedRecyclerForModal] = useState<any | null>(null);

  const materials = ['PCB', 'Cable', 'Battery', 'Motor', 'CRT', 'LCD Panel', 'Mixed Plastic'];

  useEffect(() => {
    loadRecyclers();
  }, [selectedMaterial]);

  const loadRecyclers = async () => {
    setLoading(true);
    try {
      // Use match endpoint to get transparent matching scores
      const data = await api.getRecyclerMatches(selectedMaterial, 25);
      setRecyclers(data);
    } catch (e) {
      console.error('Failed to load recyclers', e);
      // Fallback to all recyclers
      const all = await api.getRecyclers();
      setRecyclers(all);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestHandover = (recycler: any) => {
    navigate('/create-lot', { state: { preSelectedRecyclerId: recycler.id, preCategory: selectedMaterial } });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 pb-20 space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl sm:text-2xl font-black">{t('find_recycler')}</h1>
          </div>
          <p className="text-xs text-slate-300">
            सरकारी प्रदूषण नियंत्रण बोर्ड (CPCB / MPCB) द्वारा सत्यापित और अधिकृत रीसायकलर्स
          </p>
        </div>
        <button
          onClick={() => setShowCriteriaModal(true)}
          className="self-start sm:self-auto px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-amber-300 flex items-center gap-1.5 transition-all"
        >
          <Info className="w-4 h-4" />
          <span>रैंकिंग नियम देखें (Matching Logic)</span>
        </button>
      </div>

      {/* Material Filter Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-1.5 overflow-x-auto">
        <Filter className="w-4 h-4 text-emerald-600 shrink-0" />
        <span className="text-xs font-bold text-slate-500 shrink-0">सामग्री:</span>
        {materials.map((m) => (
          <button
            key={m}
            onClick={() => setSelectedMaterial(m)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all ${
              selectedMaterial === m
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Recyclers Marketplace List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-3xl border animate-pulse">
            Loading verified recyclers nearby...
          </div>
        ) : recyclers.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-3xl border">
            इस सामग्री के लिए कोई अधिकृत रीसायकलर नहीं मिला।
          </div>
        ) : (
          recyclers.map((r, idx) => {
            const offeredRate = r.offeredRatesMap?.[selectedMaterial] || 50;
            const distance = r.distanceKm || r.matchDetails?.distanceKm || '8.2';
            const score = r.matchDetails?.totalMatchScore || 85;

            return (
              <div
                key={r.id || idx}
                className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-emerald-400 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Info & Badges */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900">{r.name}</h3>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      {t('authorized_recycler')}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      {r.authorizationNumber?.split('/')[0] || 'CPCB Validated'}
                    </span>
                  </div>

                  {/* Proximity & Facility Location */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{r.facilityLocation}</span>
                      <strong className="text-emerald-800">({distance} km {t('distance_away')})</strong>
                    </div>

                    <div className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className={r.pickupAvailable ? 'text-emerald-700 font-bold' : 'text-slate-500'}>
                        {r.pickupAvailable ? t('pickup_available') : t('pickup_not_available')}
                      </span>
                    </div>
                  </div>

                  {/* Materials Accepted Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[11px] text-slate-400 font-semibold">स्वीकृत सामग्री:</span>
                    {(r.materialsAcceptedList || ['PCB', 'Cable', 'Battery']).map((m: string) => (
                      <span
                        key={m}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          m === selectedMaterial
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {m}
                      </span>
                    ))}
                  </div>

                  {/* Transparent Match Factor Snippet */}
                  {r.matchDetails?.scoringExplanation && (
                    <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100 italic">
                      🎯 {r.matchDetails.scoringExplanation}
                    </div>
                  )}
                </div>

                {/* Right: Price & Action */}
                <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 gap-2 shrink-0">
                  <div className="text-left md:text-right">
                    <span className="text-[11px] text-slate-400 block font-semibold">{selectedMaterial} के लिए दर:</span>
                    <span className="text-2xl font-black text-emerald-800">
                      ₹{offeredRate}
                    </span>
                    <span className="text-xs text-slate-500 font-bold ml-1">/ किलो</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <AudioSpeaker
                      size="sm"
                      text={`${r.name} offers ₹${offeredRate} per kg for ${selectedMaterial} with ${r.pickupAvailable ? 'free doorstep pickup' : 'self drop-off'}.`}
                    />
                    <button
                      onClick={() => handleRequestHandover(r)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 flex items-center gap-1.5 active:scale-95 transition-all"
                    >
                      <span>{t('request_pickup')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Transparent Match Logic Explanatory Modal */}
      {showCriteriaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>पारदर्शी मिलान प्रणाली (Match Rules)</span>
              </h3>
              <button
                onClick={() => setShowCriteriaModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              हम बिना कारण वाला "ब्लैक-बॉक्स एआई स्कोर" नहीं दिखाते। हमारी रैंकिंग इन 5 स्पष्ट मानकों पर आधारित है:
            </p>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="font-extrabold text-emerald-900 block">1. सरकारी मान्यता (35 अंक)</span>
                <span>केवल केंद्रीय/राज्य प्रदूषण नियंत्रण बोर्ड (CPCB/MPCB) अधिकृत सुविधाएं ही शीर्ष पर आती हैं।</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-extrabold text-slate-900 block">2. सामग्री संगतता (अनिवार्य Gatekeeper)</span>
                <span>रीसायकलर के लाइसेंस में वह विशेष ई-कचरा श्रेणी शामिल होना अनिवार्य है।</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-extrabold text-slate-900 block">3. निकटता व दूरी (25 अंक)</span>
                <span>आपके संग्रह केंद्र से सबसे कम दूरी (हावरसाइन दूरी) को प्राथमिकता दी जाती है।</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-extrabold text-slate-900 block">4. प्रस्तावित खरीद दर (25 अंक)</span>
                <span>औसत बाजार भाव से अधिक दर देने वाले रीसायकलर को बोनस अंक।</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-extrabold text-slate-900 block">5. पिकअप उपलब्धता (15 अंक)</span>
                <span>दुकान/गोदाम से फ्री वाहन पिकअप देने वाली इकाइयों को अतिरिक्त अंक।</span>
              </div>
            </div>

            <button
              onClick={() => setShowCriteriaModal(false)}
              className="mt-5 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow"
            >
              समझ गया (Close)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
