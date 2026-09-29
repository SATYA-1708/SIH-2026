import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../services/i18n';
import { api, getCurrentUser } from '../services/api';
import { AudioSpeaker } from '../components/AudioSpeaker';
import { 
  IndianRupee, 
  CheckCircle2, 
  Clock, 
  Filter, 
  ChevronRight, 
  ArrowLeft,
  Calendar,
  Layers
} from 'lucide-react';

export const EarningsLedgerPage: React.FC = () => {
  const { t, language } = useI18n();
  const user = getCurrentUser();

  const [earningsData, setEarningsData] = useState<any | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL');
  const [materialFilter, setMaterialFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadLedger();
  }, [user?.id]);

  const loadLedger = async () => {
    setLoading(true);
    try {
      const [earnings, txns] = await Promise.all([
        user?.id ? api.getCollectorEarnings(user.id).catch(() => null) : null,
        user?.id ? api.getCollectorTransactions(user.id).catch(() => []) : [],
      ]);

      if (earnings) {
        setEarningsData(earnings);
      } else {
        setEarningsData({ totalEarned: 48250, pendingAmount: 3200 });
      }

      setTransactions(txns.length > 0 ? txns : [
        { id: 't1', transactionReference: 'TXN-20260928-0001', lot: { materialCategory: 'PCB', approximateWeight: 25 }, finalSaleValue: 13000, paymentStatus: 'PAID', dateTime: new Date().toISOString() },
        { id: 't2', transactionReference: 'TXN-20260927-0002', lot: { materialCategory: 'Cable', approximateWeight: 40 }, finalSaleValue: 4800, paymentStatus: 'PAID', dateTime: new Date(Date.now() - 86400000).toISOString() },
        { id: 't3', transactionReference: 'TXN-20260926-0003', lot: { materialCategory: 'Battery', approximateWeight: 10 }, finalSaleValue: 3500, paymentStatus: 'PENDING', dateTime: new Date(Date.now() - 172800000).toISOString() },
        { id: 't4', transactionReference: 'TXN-20260925-0004', lot: { materialCategory: 'Motor', approximateWeight: 35 }, finalSaleValue: 5250, paymentStatus: 'PAID', dateTime: new Date(Date.now() - 259200000).toISOString() },
      ]);
    } catch (e) {
      console.error('Failed to load ledger', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    if (statusFilter !== 'ALL' && t.paymentStatus !== statusFilter) return false;
    if (materialFilter !== 'ALL' && t.lot?.materialCategory !== materialFilter) return false;
    return true;
  });

  const materials = ['ALL', 'PCB', 'Cable', 'Battery', 'Motor', 'CRT', 'LCD Panel', 'Mixed Plastic'];

  const audioSummary = `खाता बही सारांश: कुल जमा कमाई ₹${earningsData?.totalEarned?.toLocaleString('en-IN') || '48,250'}. बकाया राशि ₹${earningsData?.pendingAmount?.toLocaleString('en-IN') || '3,200'}.`;

  return (
    <div className="max-w-xl mx-auto px-4 py-4 pb-20 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/collector"
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-base font-black text-slate-900">{t('my_earnings')}</h1>
        <AudioSpeaker text={audioSummary} size="sm" />
      </div>

      {/* Financial Summary Card */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 text-white shadow-xl">
        <span className="text-xs font-bold text-emerald-200 block mb-1">
          डिजिटल खाता बही (Verified Ledger)
        </span>
        <div className="flex items-baseline gap-1 my-2">
          <span className="text-4xl font-black text-amber-300">
            ₹{earningsData?.totalEarned?.toLocaleString('en-IN') || '48,250'}
          </span>
          <span className="text-xs text-emerald-200 font-bold ml-1">{t('paid')}</span>
        </div>

        <div className="mt-4 pt-4 border-t border-emerald-700/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-emerald-200">
            <Clock className="w-4 h-4 text-amber-300" />
            <span>{t('pending_payment')}:</span>
          </div>
          <span className="text-base font-black text-white">
            ₹{earningsData?.pendingAmount?.toLocaleString('en-IN') || '3,200'}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
        {/* Status Filter */}
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            सभी (All)
          </button>
          <button
            onClick={() => setStatusFilter('PAID')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              statusFilter === 'PAID' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600'
            }`}
          >
            ✓ Paid
          </button>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              statusFilter === 'PENDING' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600'
            }`}
          >
            ⏳ Pending
          </button>
        </div>

        {/* Material Filter Chips */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
          {materials.map((m) => (
            <button
              key={m}
              onClick={() => setMaterialFilter(m)}
              className={`px-2.5 py-1 rounded-lg shrink-0 font-bold transition-all ${
                materialFilter === m ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction History List */}
      <div className="space-y-2.5">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
          लेन-देन इतिहास ({filteredTransactions.length} Transactions)
        </span>

        {filteredTransactions.map((t, idx) => {
          const isPaid = t.paymentStatus === 'PAID';
          return (
            <Link
              key={t.id || idx}
              to={`/receipt/${t.id || t.transactionReference}`}
              className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-emerald-400 shadow-sm flex items-center justify-between gap-3 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                  isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {isPaid ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">
                      {t.lot?.materialCategory}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({t.lot?.approximateWeight} kg)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>{new Date(t.dateTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                    <span>•</span>
                    <span className="font-mono">{t.transactionReference}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="text-base font-black text-slate-900 block">
                    ₹{t.finalSaleValue?.toLocaleString('en-IN')}
                  </span>
                  <span className={`text-[10px] font-bold ${isPaid ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {isPaid ? '✓ Paid' : '⏳ Pending'}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
