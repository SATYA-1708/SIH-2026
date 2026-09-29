import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '../services/i18n';
import { AudioSpeaker } from '../components/AudioSpeaker';
import { 
  Flame, 
  FlaskConical, 
  AlertTriangle, 
  BatteryCharging, 
  ShieldAlert, 
  ArrowLeft,
  Volume2
} from 'lucide-react';

export const SafetyPage: React.FC = () => {
  const { t, language } = useI18n();
  const location = useLocation();
  const navState = (location.state as any) || {};
  const highlightedId = navState.highlightSection;

  const safetyItems = [
    {
      id: 'cables',
      icon: Flame,
      color: 'bg-red-50 border-red-300 text-red-700',
      badge: '🔥 जानलेवा धुआं',
      title: t('safety_cable_title'),
      desc: t('safety_cable_desc'),
      audio: language === 'mr' 
        ? 'वायर किंवा केबल कधीही जाळू नका. जाळल्याने विषारी वायू फुप्फुसात जातो. न जाळता सोलून दिल्यास जास्त भाव मिळतो.'
        : language === 'en'
        ? 'Do not burn cables. Burning releases toxic fumes that damage your lungs. Sell cables unburned to get better rates.'
        : 'तार को आग मत लगाओ! तार जलाने से फेफड़ों में ज़हरीला धुआं जाता है। केबल छीलने से ज्यादा पैसे भी मिलते हैं।'
    },
    {
      id: 'acid',
      icon: FlaskConical,
      color: 'bg-amber-50 border-amber-300 text-amber-800',
      badge: '☠ एसिड का खतरा',
      title: t('safety_acid_title'),
      desc: t('safety_acid_desc'),
      audio: language === 'mr'
        ? 'सर्किट बोर्डवर ॲसिड टाकू नका. ॲसिडने हात भाजतात आणि विषारी वायू पसरतो. अधिकृत केंद्र सुरक्षित पद्धतीने सोने काढतात.'
        : language === 'en'
        ? 'Do not use acid on PCBs. Strong acids cause severe chemical burns. Authorized recyclers extract metals cleanly.'
        : 'सर्किट बोर्ड पर तेज़ाब मत डालो! इससे हाथ जलते हैं और ज़हरीली गैस निकलती है। अधिकृत सेंटर सुरक्षित मशीनों से काम करते हैं।'
    },
    {
      id: 'crt',
      icon: AlertTriangle,
      color: 'bg-orange-50 border-orange-300 text-orange-800',
      badge: '⚠ सीसा और कांच',
      title: t('safety_crt_title'),
      desc: t('safety_crt_desc'),
      audio: language === 'mr'
        ? 'टीव्हीची काच हातोडीने फोडू नका. जुन्या टीव्हीच्या नळीत पोकळी आणि विषारी शिसे असते. ती अखंड केंद्रात जमा करा.'
        : language === 'en'
        ? 'Do not break CRT screens improperly. Vacuum tubes implode forcefully and scatter toxic lead dust.'
        : 'पुराने टीवी का शीशा हथौड़े से मत फोड़ो! अंदर वैक्यूम और ज़हरीला सीसा होता है। इसे बिना तोड़े रीसायकलर को दें।'
    },
    {
      id: 'batteries',
      icon: BatteryCharging,
      color: 'bg-yellow-50 border-yellow-300 text-yellow-800',
      badge: '🔋 आग और धमाका',
      title: t('safety_battery_title'),
      desc: t('safety_battery_desc'),
      audio: language === 'mr'
        ? 'बॅटरी काळजीपूर्वक हाताळा. मोबाईलच्या लिथियम बॅटरीवर दाब पडल्यास किंवा ती कापल्यास स्फोट होऊ शकतो. सुक्या डब्यात ठेवा.'
        : language === 'en'
        ? 'Handle batteries carefully. Lithium cells can catch fire or explode if crushed or punctured.'
        : 'मोबाइल की बैटरी को मोड़ें या छेदें नहीं! इसमें भयंकर आग लग सकती है। इसे सूखे प्लास्टिक के डिब्बे में अलग रखें।'
    },
    {
      id: 'ppe',
      icon: ShieldAlert,
      color: 'bg-emerald-50 border-emerald-300 text-emerald-800',
      badge: '🧤 सुरक्षा कवच',
      title: t('safety_ppe_title'),
      desc: t('safety_ppe_desc'),
      audio: language === 'mr'
        ? 'नेहमी जाड हातमोजे आणि बूट वापरा. तीक्ष्ण काच आणि लोखंडापासून बचावासाठी हातमोजे आवश्यक आहेत.'
        : language === 'en'
        ? 'Wear protective equipment. Use thick gloves and sturdy shoes when handling sharp electronic scrap.'
        : 'हमेशा मोटे दस्ताने और जूते पहनें! नुकीले कांच और कबाड़ से खुद को सुरक्षित रखें।'
    },
  ];

  return (
    <div className="max-w-xl mx-auto px-4 py-4 pb-20 space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/collector"
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-base font-black text-slate-900">{t('safety_guide')}</h1>
        <AudioSpeaker
          text="ई-कचरा सुरक्षा नियम: तार न जलाएं, तेज़ाब का इस्तेमाल न करें, टीवी का शीशा न फोड़ें और हमेशा दस्ताने पहनें।"
          size="sm"
        />
      </div>

      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-red-700 to-amber-700 rounded-3xl p-5 text-white shadow-xl text-center">
        <span className="text-3xl mb-1 block">🧤 🔥 ☠</span>
        <h2 className="text-xl font-black tracking-tight">स्वास्थ्य और जीवन सबसे पहले</h2>
        <p className="text-xs text-red-100 mt-1 max-w-sm mx-auto">
          असुरक्षित तरीके से ई-कचरा जलाने से कैंसर और सांस की बीमारियां होती हैं। सही तरीके अपनाएं और अधिक पैसे पाएं।
        </p>
      </div>

      {/* Safety Cards List */}
      <div className="space-y-4">
        {safetyItems.map((item) => {
          const Icon = item.icon;
          const isHighlighted = item.id === highlightedId;
          return (
            <div
              key={item.id}
              id={`safety-${item.id}`}
              className={`p-5 rounded-3xl border-2 ${item.color} shadow-sm flex flex-col justify-between transition-all ${
                isHighlighted ? 'ring-4 ring-emerald-500 shadow-xl scale-[1.02] bg-white' : ''
              }`}
            >
              {isHighlighted && (
                <div className="mb-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold self-start border border-emerald-300">
                  <span>🎤 {language === 'hi' ? 'आवाज द्वारा पूछा गया नियम' : language === 'mr' ? 'आवाजाद्वारे विचारलेला नियम' : 'Voice Requested Guideline'}</span>
                </div>
              )}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-white/90 shadow-sm flex items-center justify-center shrink-0 border">
                    <Icon className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/80 border shadow-xs inline-block mb-1">
                      {item.badge}
                    </span>
                    <h3 className="text-base font-black tracking-tight leading-snug">
                      {item.title}
                    </h3>
                  </div>
                </div>
              </div>

              <p className="text-xs font-medium text-slate-700 leading-relaxed my-2 bg-white/60 p-3 rounded-2xl border">
                {item.desc}
              </p>

              <div className="flex justify-end pt-1">
                <AudioSpeaker text={item.audio} size="md" label="नियम सुनें" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
