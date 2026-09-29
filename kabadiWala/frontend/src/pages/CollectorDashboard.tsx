import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../services/i18n';
import { api, getCurrentUser } from '../services/api';
import { AudioSpeaker } from '../components/AudioSpeaker';
import { 
  PlusCircle, 
  Search, 
  Package, 
  History, 
  ShieldAlert, 
  TrendingUp, 
  IndianRupee, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  Flame,
  Volume2
} from 'lucide-react';

export const CollectorDashboard: React.FC = () => {
  const { t, language } = useI18n();
  const user = getCurrentUser();

  const [prices, setPrices] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<{ totalEarned: number; pendingAmount: number; totalLotsCompleted: number } | null>(null);
  const [recentLots, setRecentLots] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadDashboardData();
  }, [user?.id]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [priceData, earningsData, lotsData] = await Promise.all([
        api.getPrices(),
        user?.id ? api.getCollectorEarnings(user.id).catch(() => null) : null,
        api.getLots({ collectorId: user?.id, status: undefined }),
      ]);

      setPrices(priceData.slice(0, 4));
      if (earningsData) {
        setEarnings(earningsData);
      } else {
        setEarnings({ totalEarned: 48250, pendingAmount: 3200, totalLotsCompleted: 14 });
      }
      setRecentLots(lotsData.slice(0, 3));
    } catch (e) {
      console.error('Failed to load dashboard data', e);
      // Fallback demo values if network is slow/offline
      setEarnings({ totalEarned: 48250, pendingAmount: 3200, totalLotsCompleted: 14 });
    } finally {
      setLoading(false);
    }
  };

  const getAudioIntro = () => {
    if (language === 'mr') {
      return `नमस्कार ${user?.name || 'मित्र'}! आजचा पीसीबी दर ५२० रुपये आणि तांब्याची वायर १३० रुपये आहे. नवीन लॉट जमा करण्यासाठी हिरवे बटण दाबा.`;
    }
    if (language === 'en') {
      return `Welcome ${user?.name || 'Collector'}! Today's PCB price is ₹520/kg and Cable is ₹130/kg. Tap the green button to create a new lot.`;
    }
    return `नमस्ते ${user?.name || 'साथी'}! आज पीसीबी का भाव ₹520 और केबल का भाव ₹130 प्रति किलो है। नया लॉट बनाने के लिए हरा बटन दबाएं।`;
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-20 space-y-4">
      {/* Welcome & Voice Greeting Card */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs text-emerald-200 font-bold block">{t('welcome')},</span>
            <h2 className="text-xl font-black tracking-tight">{user?.name || 'रमेश सोनवणे'}</h2>
            <span className="text-[11px] text-emerald-300 font-medium">{user?.location || 'Nagpur MIDC Cluster'}</span>
          </div>
          <AudioSpeaker text={getAudioIntro()} size="md" />
        </div>

        {/* Financial Highlights */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-emerald-700/60">
          <div className="bg-emerald-950/40 rounded-2xl p-3 border border-emerald-600/30">
            <span className="text-[11px] text-emerald-300 font-bold block">{t('total_earned')}</span>
            <div className="flex items-center gap-1 text-xl font-black text-amber-300">
              <span>₹{earnings?.totalEarned?.toLocaleString('en-IN') || '48,250'}</span>
            </div>
            <span className="text-[10px] text-emerald-200">✓ {earnings?.totalLotsCompleted || 14} {language === 'hi' ? 'लॉट्स पूरे' : 'Lots Complete'}</span>
          </div>

          <div className="bg-emerald-950/40 rounded-2xl p-3 border border-emerald-600/30">
            <span className="text-[11px] text-emerald-300 font-bold block">{t('pending_payment')}</span>
            <div className="flex items-center gap-1 text-xl font-black text-white">
              <span>₹{earnings?.pendingAmount?.toLocaleString('en-IN') || '3,200'}</span>
            </div>
            <span className="text-[10px] text-amber-300">⏳ 1 {language === 'hi' ? 'लॉट बाकी' : 'Lot In Transit'}</span>
          </div>
        </div>
      </div>

      {/* TWO PRIMARY HIGH-CONTRAST BIG BUTTONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          to="/create-lot"
          className="p-5 rounded-3xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-700/25 flex flex-col items-center justify-center text-center group active:scale-95 transition-all border-2 border-emerald-400"
        >
          <div className="w-14 h-14 rounded-2xl bg-white text-emerald-700 flex items-center justify-center mb-2 shadow group-hover:scale-110 transition-transform">
            <PlusCircle className="w-8 h-8" />
          </div>
          <span className="text-lg font-black tracking-tight">{t('create_lot')}</span>
          <span className="text-xs text-emerald-100 font-medium">फोटो लें व तुरंत भाव जानें</span>
        </Link>

        <Link
          to="/recyclers"
          className="p-5 rounded-3xl bg-slate-900 hover:bg-slate-800 text-white shadow-lg flex flex-col items-center justify-center text-center group active:scale-95 transition-all border-2 border-slate-700"
        >
          <div className="w-14 h-14 rounded-2xl bg-slate-800 text-amber-400 flex items-center justify-center mb-2 shadow group-hover:scale-110 transition-transform">
            <Search className="w-8 h-8" />
          </div>
          <span className="text-lg font-black tracking-tight">{t('find_recycler')}</span>
          <span className="text-xs text-slate-300 font-medium">पास के सरकारी रीसायकलर</span>
        </Link>
      </div>

      {/* TODAY'S PRICES CARD WITH AUDIO */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-slate-900">{t('today_prices')}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
              Nagpur Hub
            </span>
          </div>
          <Link to="/prices" className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-0.5">
            <span>सभी देखें</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {(prices.length > 0 ? prices : [
            { materialCategory: 'PCB', currentBuyingPrice: 520, unit: 'kg', trend: 'UP', percentChange: 4.2 },
            { materialCategory: 'Cable', currentBuyingPrice: 130, unit: 'kg', trend: 'DOWN', percentChange: -1.5 },
            { materialCategory: 'Battery', currentBuyingPrice: 95, unit: 'kg', trend: 'UP', percentChange: 2.1 },
            { materialCategory: 'Motor', currentBuyingPrice: 140, unit: 'kg', trend: 'UP', percentChange: 3.0 },
          ]).map((p, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-extrabold text-slate-700">
                  {p.materialCategory.substring(0, 2)}
                </div>
                <div>
                  <span className="text-sm font-extrabold text-slate-800 block">{p.materialCategory}</span>
                  <span className="text-[10px] text-slate-400">प्रति {p.unit}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-base font-black text-emerald-800">
                  ₹{p.currentBuyingPrice}
                </span>
                <AudioSpeaker
                  size="sm"
                  text={`${p.materialCategory} ka bhav lagbhag ${p.currentBuyingPrice} rupaye prati kilo hai.`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QUICK WORKFLOW NAVIGATION TILES */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/lots"
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 shadow-sm flex items-center gap-3 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-black text-slate-800 block">{t('my_lots')}</span>
            <span className="text-[10px] text-slate-500">स्टेटस ट्रैक करें</span>
          </div>
        </Link>

        <Link
          to="/earnings"
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 shadow-sm flex items-center gap-3 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-black text-slate-800 block">{t('my_earnings')}</span>
            <span className="text-[10px] text-slate-500">खाता बही</span>
          </div>
        </Link>

        <Link
          to="/prices"
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 shadow-sm flex items-center gap-3 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-black text-slate-800 block">{t('price_trends')}</span>
            <span className="text-[10px] text-slate-500">बाज़ार का उतार-चढ़ाव</span>
          </div>
        </Link>

        <Link
          to="/safety"
          className="p-4 rounded-2xl bg-white border border-red-200 hover:border-red-400 shadow-sm flex items-center gap-3 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-black text-slate-800 block">{t('safety_guide')}</span>
            <span className="text-[10px] text-slate-500">ज़हर और आग से बचें</span>
          </div>
        </Link>
      </div>

      {/* CRITICAL SAFETY BANNER WITH AUDIO */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-black text-red-950 uppercase">{t('safety_cable_title')}</h4>
            <p className="text-[11px] text-red-800 leading-tight">तार जलाने से फेफड़े खराब होते हैं।</p>
          </div>
        </div>
        <AudioSpeaker
          size="sm"
          text="तार को कभी न जलाएं। इससे निकलने वाला धुआं फेफड़ों के लिए जानलेवा है।"
        />
      </div>
    </div>
  );
};
