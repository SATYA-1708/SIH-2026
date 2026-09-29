import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useI18n } from '../services/i18n';
import { api } from '../services/api';
import { AudioSpeaker } from '../components/AudioSpeaker';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  MapPin, 
  Filter, 
  RefreshCw, 
  Calendar,
  Volume2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export const PriceBoardPage: React.FC = () => {
  const { t, language } = useI18n();
  const location = useLocation();
  const navState = (location.state as any) || {};

  const [prices, setPrices] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(() => navState.category || 'PCB');
  const [selectedLocation, setSelectedLocation] = useState<string>('Nagpur');
  const [loading, setLoading] = useState<boolean>(true);
  const [voiceNotice, setVoiceNotice] = useState<boolean>(() => !!navState.fromVoice && !!navState.category);

  const locations = ['Nagpur', 'Pune', 'Mumbai', 'Nashik'];
  const categories = ['PCB', 'Cable', 'Battery', 'Motor', 'CRT', 'LCD Panel', 'Mixed Plastic'];

  useEffect(() => {
    if (navState.category && navState.category !== selectedCategory) {
      setSelectedCategory(navState.category);
      setVoiceNotice(true);
    }
  }, [location.state]);

  useEffect(() => {
    fetchPriceData();
  }, [selectedLocation, selectedCategory]);

  const fetchPriceData = async () => {
    setLoading(true);
    try {
      const [priceData, trendData] = await Promise.all([
        api.getPrices(selectedLocation),
        api.getPriceTrends(selectedCategory, selectedLocation),
      ]);
      setPrices(priceData);
      setTrends(trendData);
    } catch (e) {
      console.error('Failed to load prices', e);
    } finally {
      setLoading(false);
    }
  };

  const getAudioOverview = () => {
    const pcb = prices.find(p => p.materialCategory === 'PCB');
    const cable = prices.find(p => p.materialCategory === 'Cable');
    const battery = prices.find(p => p.materialCategory === 'Battery');

    if (language === 'mr') {
      return `${selectedLocation} मध्ये आजचा पीसीबी दर ₹${pcb?.currentBuyingPrice || 520} प्रति किलो, तांब्याची केबल ₹${cable?.currentBuyingPrice || 130} आणि बॅटरी ₹${battery?.currentBuyingPrice || 95} आहे.`;
    }
    if (language === 'en') {
      return `In ${selectedLocation}, today's PCB price is ₹${pcb?.currentBuyingPrice || 520} per kg, Cable is ₹${cable?.currentBuyingPrice || 130}, and Battery is ₹${battery?.currentBuyingPrice || 95}.`;
    }
    return `${selectedLocation} में आज पीसीबी का भाव ₹${pcb?.currentBuyingPrice || 520} प्रति किलो, केबल ₹${cable?.currentBuyingPrice || 130} और बैटरी ₹${battery?.currentBuyingPrice || 95} है।`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 pb-20 space-y-5">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-5 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-amber-300" />
            <h1 className="text-xl sm:text-2xl font-black">{t('today_prices')}</h1>
          </div>
          <p className="text-xs text-emerald-200">
            सरकारी व अधिकृत रीसायकलर्स द्वारा सत्यापित पारदर्शी बाजार भाव
          </p>
        </div>
        <AudioSpeaker text={getAudioOverview()} size="md" label="आज के भाव सुनें" />
      </div>

      {/* Voice Assistant Filter Notice */}
      {voiceNotice && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3 flex items-center justify-between text-xs text-emerald-900 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="text-base">🎤</span>
            <span className="font-semibold">
              {language === 'hi'
                ? `आवाज द्वारा फ़िल्टर: ${selectedCategory} का आज का भाव प्रदर्शित किया गया`
                : language === 'mr'
                ? `आवाजाद्वारे फिल्टर: ${selectedCategory} चा आजचा दर दाखवला आहे`
                : `Voice Filter: Showing today's rate for ${selectedCategory}`}
            </span>
          </div>
          <button
            onClick={() => setVoiceNotice(false)}
            className="text-emerald-700 hover:text-emerald-950 font-bold px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* City & Category Filter Chips */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        {/* City Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold text-slate-500 shrink-0">शहर:</span>
          {locations.map((loc) => (
            <button
              key={loc}
              onClick={() => setSelectedLocation(loc)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all ${
                selectedLocation === loc
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {loc}
            </button>
          ))}
        </div>

        {/* Refresh button */}
        <button
          onClick={fetchPriceData}
          className="self-end sm:self-auto p-2 text-slate-500 hover:text-emerald-700 hover:bg-slate-50 rounded-xl transition-colors"
          title="Refresh rates"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Grid of Material Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {prices.map((p, idx) => {
          const isSelected = selectedCategory === p.materialCategory;
          const trendIcon =
            p.trend === 'UP' ? (
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            ) : p.trend === 'DOWN' ? (
              <TrendingDown className="w-4 h-4 text-red-500" />
            ) : (
              <Minus className="w-4 h-4 text-slate-400" />
            );

          return (
            <div
              key={idx}
              onClick={() => setSelectedCategory(p.materialCategory)}
              className={`p-4 rounded-3xl border-2 cursor-pointer transition-all bg-white shadow-sm flex flex-col justify-between ${
                isSelected
                  ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-xs font-bold text-slate-400 block">{selectedLocation}</span>
                  <h3 className="text-base font-black text-slate-900">{p.materialCategory}</h3>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-50 border border-slate-200">
                  {trendIcon}
                  <span className={p.trend === 'UP' ? 'text-emerald-700' : p.trend === 'DOWN' ? 'text-red-600' : 'text-slate-600'}>
                    {p.percentChange > 0 ? `+${p.percentChange}%` : `${p.percentChange}%`}
                  </span>
                </div>
              </div>

              {/* Price & Unit */}
              <div className="my-2">
                <span className="text-3xl font-black text-emerald-800">₹{p.currentBuyingPrice}</span>
                <span className="text-xs text-slate-500 font-bold ml-1">/ {p.unit}</span>
              </div>

              {/* Market Range */}
              <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100 mb-3">
                <span>Fair Range: </span>
                <span className="font-bold text-slate-700">₹{p.marketRangeMin} – ₹{p.marketRangeMax}</span>
              </div>

              {/* Card Footer: Audio & Click action */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <AudioSpeaker
                  size="sm"
                  text={language === 'hi' ? p.audioTextHi : language === 'mr' ? p.audioTextMr : p.audioText}
                />
                <span className="text-[10px] font-bold text-emerald-700">
                  {isSelected ? 'चार्ट देख रहे हैं' : 'चार्ट देखें →'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* HISTORICAL TRENDS CHART */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-100 text-emerald-800">
                {selectedCategory}
              </span>
              <h3 className="text-base font-black text-slate-900">
                15-Day Historical Price Trend ({selectedLocation})
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              ट्रेंड चार्ट से जानें कि कब बेचना सबसे फायदेमंद रहेगा।
            </p>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto">
            {categories.slice(0, 5).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Line Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="displayDate" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                formatter={(val: any) => [`₹${val}/kg`, 'Buying Price']}
                labelFormatter={(lbl) => `Date: ${lbl}`}
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#059669"
                strokeWidth={3}
                dot={{ r: 4, fill: '#059669' }}
                activeDot={{ r: 7, fill: '#f59e0b' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
