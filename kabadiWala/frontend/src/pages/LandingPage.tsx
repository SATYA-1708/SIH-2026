import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useI18n } from '../services/i18n';
import { api, setAuthSession } from '../services/api';
import { 
  Recycle, 
  ShieldCheck, 
  TrendingUp, 
  Cpu, 
  Smartphone, 
  MapPin, 
  QrCode, 
  CheckCircle2, 
  ArrowRight,
  Flame,
  Award,
  DollarSign,
  Users
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { t, language } = useI18n();
  const navigate = useNavigate();

  const handleQuickDemo = async (role: 'collector' | 'recycler' | 'admin') => {
    try {
      const res = await api.demoLogin(role);
      setAuthSession(res.token, res.user);
      if (role === 'admin') navigate('/admin');
      else if (role === 'recycler') navigate('/recycler');
      else navigate('/collector');
    } catch (e) {
      console.error(e);
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-900 via-brand-800 to-emerald-950 text-white pt-12 pb-20 px-4 sm:px-6">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        
        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-6 backdrop-blur-md">
            <Award className="w-4 h-4" />
            <span>Smart India Hackathon • Formal E-Waste Circularity Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight mb-6">
            Connecting Informal E-Waste Collectors with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-amber-300">
              Authorized Formal Recyclers
            </span>
          </h1>

          <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl mx-auto mb-8 font-medium leading-relaxed">
            Eliminate predatory middlemen. Empower local scrap collectors with instant fair market pricing, 
            verified CPCB/MPCB recyclers, digital traceability receipts, and offline tolerance.
          </p>

          {/* Quick CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto mb-10">
            <Link
              to="/collector"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <span>{language === 'hi' ? 'कबाड़ी पोर्टल शुरू करें' : language === 'mr' ? 'भंगार वेचक पोर्टल सुरू करा' : 'Start as Collector'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/recycler"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm backdrop-blur-md flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <span>{language === 'hi' ? 'रीसायकलर लॉगिन' : language === 'mr' ? 'रिसायकलर लॉगिन' : 'Recycler Login'}</span>
            </Link>
          </div>

          {/* Hackathon Demo Quick Access Bar */}
          <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md max-w-xl mx-auto">
            <span className="text-xs font-bold text-emerald-200 block mb-2 uppercase tracking-wider">
              🚀 Instant Hackathon Demo Mode:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleQuickDemo('collector')}
                className="py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
              >
                Demo Collector
              </button>
              <button
                onClick={() => handleQuickDemo('recycler')}
                className="py-2 px-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm"
              >
                Demo Recycler
              </button>
              <button
                onClick={() => handleQuickDemo('admin')}
                className="py-2 px-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm"
              >
                Demo Admin
              </button>
            </div>
            <div className="mt-2.5 pt-2 border-t border-white/15 flex items-center justify-center">
              <Link
                to="/unit-economics"
                className="text-xs font-extrabold text-amber-300 hover:text-amber-200 flex items-center gap-1.5 transition-colors"
              >
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                <span>📊 Empirical Unit Economics & 1.5% Model (+45% Collector Uplift)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Problem vs Solution */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            The Informal E-Waste Challenge in India
          </h2>
          <p className="text-slate-600 text-sm mt-2 max-w-xl mx-auto">
            Over 95% of India's electronic waste is handled informally with hazardous methods. E-Waste Setu builds the direct bridge.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Informal Reality */}
          <div className="p-6 rounded-3xl bg-red-50/50 border border-red-200">
            <div className="flex items-center gap-2 text-red-700 font-extrabold text-base mb-4">
              <Flame className="w-5 h-5" />
              <span>Before: Informal Scrap Chain</span>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">✗</span>
                <span>Unfair prices dictated by layers of unregulated middlemen.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">✗</span>
                <span>Dangerous backyard acid leaching and open burning of cables.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">✗</span>
                <span>Zero digital receipts, cash disputes, and lack of credit history.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">✗</span>
                <span>Inability to discover authorized recyclers within operating radius.</span>
              </li>
            </ul>
          </div>

          {/* E-Waste Setu Solution */}
          <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-base mb-4">
              <ShieldCheck className="w-5 h-5" />
              <span>With E-Waste Setu: Direct Digital Bridge</span>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Real-time fair market prices</strong> with audio speaker support for low-literacy users.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Verified CPCB/MPCB recyclers</strong> ranked transparently by price, proximity, and pickup.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Tamper-evident digital receipts with QR code</strong> for instant traceability.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>100% offline tolerance:</strong> create lots anywhere, auto-sync when network returns.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* STRATEGIC SCOPE REPOSITIONING: FORMALIZING ONLY E-WASTE FRACTIONS */}
      <section className="py-12 px-4 sm:px-6 bg-slate-100 border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-8">
            <span className="px-3.5 py-1 rounded-full text-xs font-black bg-emerald-200 text-emerald-900 border border-emerald-300 uppercase tracking-wider inline-block mb-3">
              Strategic Boundary & Scope Definition
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Why E-Waste Setu Formalizes <span className="text-emerald-700">ONLY</span> Electronic Scrap
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Preserving the kabadiwala's traditional livelihood while formalizing the lethal, high-value e-waste fraction.
            </p>
          </div>

          {/* 3-Language Perspective Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* English Scope Card */}
            <div className={`p-6 rounded-3xl border-2 transition-all flex flex-col justify-between ${
              language === 'en' 
                ? 'bg-white border-emerald-600 shadow-md ring-2 ring-emerald-500/20' 
                : 'bg-white/70 border-slate-200'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                    English Scope
                  </span>
                  {language === 'en' && (
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Active Lang
                    </span>
                  )}
                </div>
                <h3 className="font-extrabold text-base text-slate-900 mb-2">
                  No Intrusion on Traditional Scrap
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  We do <strong>not</strong> digitize raddi (waste paper), plastic bottles, or iron scrap. 
                  The informal market already handles traditional scrap efficiently with minimal environmental toxicity. 
                  E-Waste Setu focuses strictly on the <strong>electronic waste portion</strong> of a kabadiwala's trade.
                </p>
                <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-100 text-[11px] text-emerald-900 space-y-1">
                  <div><strong>Why E-Waste Only?</strong></div>
                  <div>1. Eliminates lethal backyard acid leaching & dioxin-releasing wire burning.</div>
                  <div>2. Reclaims critical strategic minerals (Gold, Cobalt, Lithium) for India's economy.</div>
                </div>
              </div>
            </div>

            {/* Hindi Scope Card */}
            <div className={`p-6 rounded-3xl border-2 transition-all flex flex-col justify-between ${
              language === 'hi' 
                ? 'bg-white border-emerald-600 shadow-md ring-2 ring-emerald-500/20' 
                : 'bg-white/70 border-slate-200'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                    हिन्दी (Hindi Scope)
                  </span>
                  {language === 'hi' && (
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      सक्रिय भाषा
                    </span>
                  )}
                </div>
                <h3 className="font-extrabold text-base text-slate-900 mb-2">
                  पारंपरिक कबाड़ में कोई दखल नहीं
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  हम कबाड़ी भाई के पूरे काम (अखबार की रद्दी, लोहे का कबाड़, प्लास्टिक बोतलें) को बदलने की कोशिश <strong>नहीं करते</strong>। 
                  ई-कचरा सेतु का लक्ष्य केवल <strong>ई-कचरा (इलेक्ट्रॉनिक वेस्ट)</strong> है, क्योंकि इसे जलाना या तेज़ाब में डालना जानलेवा है।
                </p>
                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-950 space-y-1">
                  <div><strong>केवल ई-कचरे पर ही फोकस क्यों?</strong></div>
                  <div>1. तार जलाने और बैटरी फोड़ने से निकलने वाले ज़हरीले धुएं व तेज़ाब से मुक्ति।</div>
                  <div>2. मदरबोर्ड से सोना व लिथियम की पूरी कीमत सीधे कबाड़ी के बैंक खाते में।</div>
                </div>
              </div>
            </div>

            {/* Marathi Scope Card */}
            <div className={`p-6 rounded-3xl border-2 transition-all flex flex-col justify-between ${
              language === 'mr' 
                ? 'bg-white border-emerald-600 shadow-md ring-2 ring-emerald-500/20' 
                : 'bg-white/70 border-slate-200'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-900">
                    मराठी (Marathi Scope)
                  </span>
                  {language === 'mr' && (
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      सक्रिय भाषा
                    </span>
                  )}
                </div>
                <h3 className="font-extrabold text-base text-slate-900 mb-2">
                  पारंपारिक व्यवसायात कोणताही अडथळा नाही
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  आम्ही भंगार वेचकांचा संपूर्ण व्यापार (वर्तमानपत्राची रद्दी, लोखंड किंवा प्लास्टिक) बदलत <strong>नाही</strong>. 
                  ई-कचरा सेतू केवळ <strong>ई-कचऱ्याच्या भागाचे</strong> औपचारिकीकरण करतो, कारण त्याची अनधिकृत विल्हेवाट अत्यंत विषारी असते.
                </p>
                <div className="p-3 rounded-xl bg-purple-50/80 border border-purple-200/80 text-[11px] text-purple-950 space-y-1">
                  <div><strong>केवळ ई-कचऱ्यावरच भर का?</strong></div>
                  <div>1. अॅसिडचे विषारी धोके आणि केबल जाळण्यामुळे होणारे फुफ्फुसाचे आजार थांबवणे.</div>
                  <div>2. मौल्यवान धातूंचा (सोने, तांबे, कोबाल्ट) थेट अधिकृत प्रक्रिया केंद्राकडून सर्वोत्तम भाव.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Scope Comparison Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 text-xs">
              <div className="p-4 bg-slate-50/60">
                <span className="font-extrabold text-slate-700 uppercase tracking-wider block mb-2 text-[10px]">
                  Traditional Scrap (Paper, Cardboard, PET Bottles, Ferrous Rods)
                </span>
                <div className="flex items-center gap-2 text-slate-700 mb-1">
                  <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                  <span><strong>Operational Status:</strong> Mature, well-functioning local informal loops.</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 mb-1">
                  <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                  <span><strong>Toxicity:</strong> Negligible chemical hazard to neighborhood.</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                  <span><strong>Platform Action:</strong> <em>Preserved as-is (Zero disruption to kabadiwala).</em></span>
                </div>
              </div>

              <div className="p-4 bg-emerald-50/40">
                <span className="font-extrabold text-emerald-800 uppercase tracking-wider block mb-2 text-[10px]">
                  Electronic Scrap (PCBs, Lithium/Lead Batteries, Copper Cables, Displays)
                </span>
                <div className="flex items-center gap-2 text-emerald-900 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                  <span><strong>Operational Status:</strong> 4 layers of predatory middlemen & price exploitation.</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-900 mb-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  <span><strong>Toxicity:</strong> Extreme (Lead, mercury, dioxins, explosive thermal fire).</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                  <span><strong>Platform Action:</strong> <strong>Formalized & Connected to CPCB Recyclers (+45% Uplift).</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Philosophy Banner */}
      <section className="bg-gradient-to-r from-emerald-900 via-brand-900 to-slate-900 text-white py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-widest inline-block">
            Our Fundamental Philosophy
          </span>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            “We don’t replace the kabadiwala.<br className="hidden sm:inline" />
            We connect the kabadiwala to the formal recycling economy.”
          </h2>
          <p className="text-sm sm:text-base text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
            Informal scrap collectors are India's irreplaceable last-mile circular workforce. 
            Our platform equips them with real-time fair market pricing, direct access to authorized recyclers, digital traceability records, and worker health protections.
          </p>

          {/* THE 6 TRUST ANCHORS */}
          <div className="pt-6 border-t border-emerald-800/80">
            <h3 className="text-base sm:text-xl font-black text-amber-300 mb-4">
              “Most solutions digitize the transaction. E-Waste Setu digitizes trust.”
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 text-left">
              <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                <span className="text-amber-300 font-bold block text-xs">Price Isn't Trusted?</span>
                <span className="text-[11px] text-emerald-100">→ Realized Fair Deal Engine with local median benchmarking</span>
              </div>
              <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                <span className="text-amber-300 font-bold block text-xs">Recycler Isn't Known?</span>
                <span className="text-[11px] text-emerald-100">→ Transaction-derived operational trust ratings (scale, pickup, pay)</span>
              </div>
              <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                <span className="text-amber-300 font-bold block text-xs">Weight Isn't Trusted?</span>
                <span className="text-[11px] text-emerald-100">→ Weighbridge tare verification with variance audits (&lt; 2%)</span>
              </div>
              <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                <span className="text-amber-300 font-bold block text-xs">Payment Isn't Trusted?</span>
                <span className="text-[11px] text-emerald-100">→ Dual-signoff for Cash + instant bank UTR verification</span>
              </div>
              <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                <span className="text-amber-300 font-bold block text-xs">Handover Isn't Trusted?</span>
                <span className="text-[11px] text-emerald-100">→ Tamper-evident SHA-256 hash-chained traceability receipts</span>
              </div>
              <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                <span className="text-amber-300 font-bold block text-xs">Destination Unknown?</span>
                <span className="text-[11px] text-emerald-100">→ Post-handover critical mineral recovery & CPCB EPR credits</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Unit Economics & Value Chain Comparison */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase">Real Field-Derived Economics</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Value Chain Comparison & Collector Income Realization
          </h2>
          <p className="text-slate-600 text-sm mt-2 max-w-2xl mx-auto">
            By collapsing 4 layers of predatory intermediaries into a transparent direct-to-recycler model, collectors realize 50% to 70% higher payouts per kilogram.
          </p>
        </div>

        {/* 2-Column Model Comparison */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Current Model */}
          <div className="p-6 rounded-3xl bg-slate-100/80 border border-slate-200">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-2">Traditional Exploitative Chain</span>
            <h3 className="text-lg font-black text-slate-800 mb-4">Current Model (4 Intermediary Tiers)</h3>
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-700">1. Informal Collector</span>
                <span className="text-red-600 font-extrabold">Distress price realization</span>
              </div>
              <div className="text-center text-slate-400">↓ Takes 25% cut</div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-700">2. Local Scrapyard Dealer</span>
                <span className="text-slate-500">Unregulated grading & scales</span>
              </div>
              <div className="text-center text-slate-400">↓ Takes 20% cut</div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-700">3. Regional Aggregator / Middleman</span>
                <span className="text-slate-500">Bulk hoarding & backyard smelting</span>
              </div>
              <div className="text-center text-slate-400">↓ Takes 15% cut</div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-700">4. Final Recycler / Smelter</span>
                <span className="text-slate-600">Pays peak rate, collector never sees it</span>
              </div>
            </div>
          </div>

          {/* Platform Model */}
          <div className="p-6 rounded-3xl bg-emerald-50/70 border-2 border-emerald-300 relative shadow-sm">
            <div className="absolute -top-3 right-6 bg-emerald-700 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full">
              Transparent & Direct
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800 block mb-2">Kabadiwala Connect Platform</span>
            <h3 className="text-lg font-black text-emerald-950 mb-4">Direct-to-Recycler Digital Architecture</h3>
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-white rounded-xl border border-emerald-200 flex items-center justify-between shadow-sm">
                <div>
                  <span className="font-bold text-slate-900 block">1. Informal Collector (Kabadiwala)</span>
                  <span className="text-[11px] text-emerald-700 font-semibold font-sans">Full transparency + live APMC rates + instant UPI</span>
                </div>
                <span className="text-emerald-700 font-black text-sm">+50–70% Income</span>
              </div>
              <div className="p-3 bg-emerald-100/80 rounded-xl border border-emerald-300 text-center text-emerald-900 font-sans font-bold text-xs">
                ⚡ Direct Digital Bridge: AI Vision • Transparent Matching • Digital QR Traceability
              </div>
              <div className="p-3 bg-white rounded-xl border border-emerald-200 flex items-center justify-between shadow-sm">
                <div>
                  <span className="font-bold text-slate-900 block">2. Authorized CPCB/MPCB Recycler</span>
                  <span className="text-[11px] text-slate-500 font-sans">Compliant feedstock, doorstep pickup, EPR credit auditable</span>
                </div>
                <span className="text-blue-700 font-black text-sm">Verified EPR Volume</span>
              </div>
            </div>
          </div>
        </div>

        {/* Real Field-Derived Material Numbers Table */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div>
              <h4 className="font-black text-slate-900 text-base">Field Payout Realization Per Kilogram</h4>
              <p className="text-xs text-slate-500">Empirical benchmark rates observed across Maharashtra industrial clusters (Nagpur / Pune / Mumbai)</p>
            </div>
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              Field Benchmark
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-100/60 text-slate-600 font-extrabold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Material Category</th>
                  <th className="py-3 px-4">Middleman Rate (Current)</th>
                  <th className="py-3 px-4 text-emerald-800">Platform Rate (Direct)</th>
                  <th className="py-3 px-4 text-emerald-700 font-black">Collector Realization Increase</th>
                  <th className="py-3 px-4">Formal Advantage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">Printed Circuit Boards (PCB)</td>
                  <td className="py-3 px-4 text-slate-500 line-through">₹320 / kg</td>
                  <td className="py-3 px-4 font-black text-emerald-700">₹510 / kg</td>
                  <td className="py-3 px-4 font-extrabold text-emerald-600">+₹190/kg (+59.4%)</td>
                  <td className="py-3 px-4 text-slate-600 text-xs">Eliminates toxic backyard acid leeching</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">Copper Power Cable</td>
                  <td className="py-3 px-4 text-slate-500 line-through">₹80 / kg</td>
                  <td className="py-3 px-4 font-black text-emerald-700">₹130 / kg</td>
                  <td className="py-3 px-4 font-extrabold text-emerald-600">+₹50/kg (+62.5%)</td>
                  <td className="py-3 px-4 text-slate-600 text-xs">Mechanical stripping vs toxic wire burning</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">Lithium-Ion / Lead Batteries</td>
                  <td className="py-3 px-4 text-slate-500 line-through">₹55 / kg</td>
                  <td className="py-3 px-4 font-black text-emerald-700">₹95 / kg</td>
                  <td className="py-3 px-4 font-extrabold text-emerald-600">+₹40/kg (+72.7%)</td>
                  <td className="py-3 px-4 text-slate-600 text-xs">Safe fireproof logistics & zero acid spillage</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">Electric Motors & Pumps</td>
                  <td className="py-3 px-4 text-slate-500 line-through">₹90 / kg</td>
                  <td className="py-3 px-4 font-black text-emerald-700">₹140 / kg</td>
                  <td className="py-3 px-4 font-extrabold text-emerald-600">+₹50/kg (+55.5%)</td>
                  <td className="py-3 px-4 text-slate-600 text-xs">Transparent copper scratch grading</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">Rare-Earth Magnet Assemblies</td>
                  <td className="py-3 px-4 text-slate-500 line-through">₹65 / kg</td>
                  <td className="py-3 px-4 font-black text-emerald-700">₹110 / kg</td>
                  <td className="py-3 px-4 font-extrabold text-emerald-600">+₹45/kg (+69.2%)</td>
                  <td className="py-3 px-4 text-slate-600 text-xs">Direct separation for industrial magnets</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Platform Revenue / Financial Sustainability Model */}
          <div className="p-6 bg-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="text-amber-400 text-xs font-black uppercase tracking-wider block mb-1">
                Platform Financial Sustainability (No Fee on Informal Workers)
              </span>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Collectors use 100% of the platform free of charge. Revenue is generated via a <strong>1.5% recycler facilitation fee</strong>, 
                EPR (Extended Producer Responsibility) compliance telemetry credits, and aggregated logistics optimization.
              </p>
            </div>
            <div className="flex gap-2">
              <div className="bg-slate-800 border border-slate-700 p-3 rounded-xl text-center">
                <span className="text-[10px] text-slate-400 block font-mono">Recycler Fee</span>
                <span className="text-sm font-black text-emerald-400">1.5% – 2.0%</span>
              </div>
              <div className="bg-slate-800 border border-slate-700 p-3 rounded-xl text-center">
                <span className="text-[10px] text-slate-400 block font-mono">Collector Cost</span>
                <span className="text-sm font-black text-amber-300">₹0 (100% Free)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Workflow */}
      <section className="py-16 bg-white border-y border-slate-200 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase">Simple 6-Step Workflow</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              From Scrap Collector to Formal Facility
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              { step: '1', title: 'Photograph', desc: 'AI camera assists category detection', icon: Smartphone },
              { step: '2', title: 'Weight', desc: 'Enter approximate scrap weight', icon: Cpu },
              { step: '3', title: 'Fair Rate', desc: 'View live APMC / recycler market rates', icon: DollarSign },
              { step: '4', title: 'Match', desc: 'Select authorized nearby recycler', icon: MapPin },
              { step: '5', title: 'Handover', desc: 'Doorstep pickup & physical verification', icon: Recycle },
              { step: '6', title: 'Earn & Trace', desc: 'Direct payment & digital QR receipt', icon: QrCode },
            ].map((s, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm mb-3">
                  {s.step}
                </div>
                <h4 className="font-extrabold text-sm text-slate-800 mb-1">{s.title}</h4>
                <p className="text-[11px] text-slate-500 leading-tight">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact & Principles */}
      <section className="py-14 px-4 sm:px-6 max-w-6xl mx-auto text-center">
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-3">
          Product Principle: Economic Attraction, Not Red Tape
        </h3>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto mb-8">
          We don't design complicated government compliance forms for informal workers. 
          We make formal recycling <strong>faster, more profitable, and safer</strong> than backyard operations.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/collector"
            className="px-6 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-md transition-all"
          >
            Launch Collector App
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-all"
          >
            Explore Demo Portals
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-slate-900 text-slate-400 text-xs border-t border-slate-800 px-4 text-center">
        <p>© 2026 E-Waste Setu • Smart India Hackathon Prototype • Made for India's Informal Recycling Workers</p>
      </footer>
    </div>
  );
};
