import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../services/i18n';
import { api, getCurrentUser } from '../services/api';
import { getOfflineQueue } from '../services/offlineStorage';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  ArrowLeft, 
  Plus, 
  WifiOff, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const MyLotsPage: React.FC = () => {
  const { t, language } = useI18n();
  const user = getCurrentUser();

  const [lots, setLots] = useState<any[]>([]);
  const [offlineLots, setOfflineLots] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadLots();
  }, [user?.id]);

  const loadLots = async () => {
    setLoading(true);
    try {
      // 1. Check offline queue
      const queued = getOfflineQueue();
      setOfflineLots(queued);

      // 2. Fetch server lots if online
      if (navigator.onLine) {
        const serverLots = await api.getLots({ collectorId: user?.id });
        setLots(serverLots);
      }
    } catch (e) {
      console.error('Failed to load lots', e);
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-base font-black text-slate-900">{t('my_lots')}</h1>
        <Link
          to="/create-lot"
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>नया लॉट</span>
        </Link>
      </div>

      {/* Offline Pending Lots (if any) */}
      {offlineLots.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
            <WifiOff className="w-4 h-4 text-amber-600" />
            <span>ऑफलाइन लॉट ({offlineLots.length} Pending Synchronization)</span>
          </div>

          {offlineLots.map((item, idx) => (
            <div
              key={item.localId || idx}
              className="bg-white rounded-2xl p-4 border-2 border-amber-300 shadow-sm flex items-center justify-between gap-3"
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-700 block">
                  PENDING SYNC • {item.localId.slice(0, 14)}
                </span>
                <span className="font-extrabold text-sm text-slate-900 block">
                  {item.materialCategory} ({item.approximateWeight} kg)
                </span>
                <span className="text-[11px] text-slate-500">{item.collectionLocation}</span>
              </div>
              <div className="text-right">
                <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                  ⏳ कतार में (In Queue)
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Server Synced Lots */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
          सक्रिय व पूर्ण लॉट्स ({lots.length})
        </span>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500 animate-pulse bg-white rounded-2xl border">
            लॉट्स लोड हो रहे हैं...
          </div>
        ) : lots.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">अभी कोई लॉट नहीं है।</p>
            <Link
              to="/create-lot"
              className="mt-3 inline-block px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
            >
              पहला लॉट बनाएं
            </Link>
          </div>
        ) : (
          lots.map((l, idx) => {
            const hasTxn = l.transactions && l.transactions.length > 0;
            const txn = hasTxn ? l.transactions[0] : null;

            return (
              <div
                key={l.id || idx}
                className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-emerald-400 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-black text-slate-800">{l.lotReference}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      l.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                      l.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {l.status}
                    </span>
                  </div>

                  <div className="text-sm font-black text-slate-900">
                    {l.materialCategory} • {l.approximateWeight} kg
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {l.collectionLocation} • {new Date(l.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 block font-semibold">अनुमानित मूल्य:</span>
                    <span className="text-base font-black text-emerald-800">
                      ₹{l.estimatedValue?.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {txn && (
                    <Link
                      to={`/receipt/${txn.id}`}
                      className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1 border border-emerald-200 transition-colors"
                    >
                      <span>रसीद</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
