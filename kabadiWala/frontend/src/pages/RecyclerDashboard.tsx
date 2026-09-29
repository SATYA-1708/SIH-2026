import React, { useState, useEffect } from 'react';
import { useI18n } from '../services/i18n';
import { api, getCurrentUser } from '../services/api';
import { 
  Building2, 
  ShieldCheck, 
  Package, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  Scale, 
  IndianRupee, 
  Clock, 
  RefreshCw,
  QrCode,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const RecyclerDashboard: React.FC = () => {
  const { t } = useI18n();
  const user = getCurrentUser();

  const [lots, setLots] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [recycler, setRecycler] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'INCOMING' | 'TRANSACTIONS' | 'RATES'>('INCOMING');

  // Modal states for Handover / Quote
  const [selectedTxn, setSelectedTxn] = useState<any | null>(null);
  const [modalMode, setModalMode] = useState<'HANDOVER' | 'PAYMENT' | 'OFFER' | null>(null);
  const [finalWeight, setFinalWeight] = useState<string>('');
  const [quotedRate, setQuotedRate] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadRecyclerData();
  }, [user?.id]);

  const loadRecyclerData = async () => {
    setLoading(true);
    try {
      const recId = user?.id || 'rec-001';
      const [recData, allLots, allTxns] = await Promise.all([
        api.getRecyclerById(recId).catch(() => null),
        api.getLots({ recyclerId: recId }),
        api.getTransactions({ recyclerId: recId }),
      ]);

      setRecycler(recData);
      setLots(allLots);
      setTransactions(allTxns);
    } catch (e) {
      console.error('Failed to load recycler dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptLot = async (lot: any) => {
    setActionLoading(true);
    try {
      const res = await api.createTransaction({
        lotId: lot.id,
        recyclerId: user?.id || 'rec-001',
      });
      setActionSuccess(`Lot ${lot.lotReference} accepted! Transaction ${res.transactionReference} initiated.`);
      loadRecyclerData();
    } catch (e: any) {
      alert(`Accept failed: ${e.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectLot = async (txnId: string) => {
    if (!window.confirm('Reject this lot?')) return;
    try {
      await api.updateTransactionStatus(txnId, 'REJECTED');
      loadRecyclerData();
    } catch (e: any) {
      alert(`Reject failed: ${e.message}`);
    }
  };

  const openHandoverModal = (txn: any) => {
    setSelectedTxn(txn);
    setFinalWeight(String(txn.lot?.approximateWeight || 25));
    setModalMode('HANDOVER');
  };

  const confirmHandoverSubmit = async () => {
    if (!selectedTxn) return;
    setActionLoading(true);
    try {
      await api.confirmHandover(selectedTxn.id, {
        finalWeight: parseFloat(finalWeight) || selectedTxn.lot?.approximateWeight,
        handoverLocation: recycler?.facilityLocation || 'Nagpur MIDC Facility Scale',
      });
      setActionSuccess(`Physical handover confirmed and digital traceability receipt created for ${selectedTxn.transactionReference}!`);
      setModalMode(null);
      loadRecyclerData();
    } catch (e: any) {
      alert(`Handover failed: ${e.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const openPaymentModal = (txn: any) => {
    setSelectedTxn(txn);
    setModalMode('PAYMENT');
  };

  const confirmPaymentSubmit = async () => {
    if (!selectedTxn) return;
    setActionLoading(true);
    try {
      await api.confirmPayment(selectedTxn.id, {
        paymentMethod: 'Instant UPI Direct',
        amount: selectedTxn.finalSaleValue,
      });
      setActionSuccess(`Payment of ₹${selectedTxn.finalSaleValue} confirmed! Added to collector ledger.`);
      setModalMode(null);
      loadRecyclerData();
    } catch (e: any) {
      alert(`Payment confirmation failed: ${e.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
      {/* Recycler Facility Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Authorized Processing Facility
            </span>
            <span className="text-xs font-mono text-slate-400">
              {recycler?.authorizationNumber || 'MPCB/RO-NGP/AUTH-2024'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {recycler?.name || 'EcoGreen E-Waste Recycling Solutions'}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            📍 {recycler?.facilityLocation || 'Nagpur MIDC Phase 2, Maharashtra'} • Doorstep Pickup: Active
          </p>
        </div>

        <button
          onClick={loadRecyclerData}
          className="self-start md:self-auto p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between animate-fade-in">
          <span>✓ {actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-700 font-black">✕</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 block">Pending Inflow</span>
          <span className="text-2xl font-black text-slate-900 block mt-1">
            {transactions.filter(t => t.transactionStatus === 'INITIATED' || t.transactionStatus === 'ACCEPTED').length} Lots
          </span>
          <span className="text-[10px] text-amber-600 font-semibold">Awaiting handover</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 block">Handed Over</span>
          <span className="text-2xl font-black text-blue-700 block mt-1">
            {transactions.filter(t => t.transactionStatus === 'HANDED_OVER').length} Lots
          </span>
          <span className="text-[10px] text-blue-600 font-semibold">Ready for payment</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 block">Completed</span>
          <span className="text-2xl font-black text-emerald-700 block mt-1">
            {transactions.filter(t => t.transactionStatus === 'COMPLETED').length} Lots
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold">Paid & Processed</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 block">Total Disbursed</span>
          <span className="text-2xl font-black text-slate-900 block mt-1">
            ₹{transactions.reduce((acc, t) => acc + (t.finalSaleValue || 0), 0).toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">To informal collectors</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-sm font-extrabold">
        <button
          onClick={() => setActiveTab('INCOMING')}
          className={`pb-3 transition-colors ${
            activeTab === 'INCOMING' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Incoming Lots ({lots.length})
        </button>
        <button
          onClick={() => setActiveTab('TRANSACTIONS')}
          className={`pb-3 transition-colors ${
            activeTab === 'TRANSACTIONS' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Transactions & Handover ({transactions.length})
        </button>
      </div>

      {/* TAB 1: INCOMING LOTS */}
      {activeTab === 'INCOMING' && (
        <div className="space-y-3">
          {lots.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-3xl border">
              No new incoming lots assigned.
            </div>
          ) : (
            lots.map((lot) => {
              const matchingTxn = transactions.find(t => t.lotId === lot.id);

              return (
                <div
                  key={lot.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-slate-800">{lot.lotReference}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">
                        {lot.status}
                      </span>
                    </div>

                    <div className="text-base font-extrabold text-slate-900">
                      {lot.materialCategory} • {lot.approximateWeight} kg
                    </div>

                    <div className="text-xs text-slate-500">
                      Collector Location: <strong className="text-slate-700">{lot.collectionLocation}</strong> • 
                      Estimated: <span className="font-bold text-emerald-700">₹{lot.estimatedValue?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {matchingTxn ? (
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
                        TXN: {matchingTxn.transactionReference} ({matchingTxn.transactionStatus})
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleAcceptLot(lot)}
                          disabled={actionLoading}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm active:scale-95 transition-all"
                        >
                          Accept Lot
                        </button>
                        <button
                          onClick={() => handleRejectLot(lot.id)}
                          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-600 font-bold text-xs transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: ACTIVE TRANSACTIONS & HANDOVER CONFIRMATION */}
      {activeTab === 'TRANSACTIONS' && (
        <div className="space-y-3">
          {transactions.map((txn) => {
            const isHandedOver = txn.transactionStatus === 'HANDED_OVER';
            const isCompleted = txn.transactionStatus === 'COMPLETED';
            const isPaid = txn.paymentStatus === 'PAID';

            return (
              <div
                key={txn.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-slate-900">{txn.transactionReference}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isCompleted ? 'bg-emerald-100 text-emerald-800' :
                      isHandedOver ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {txn.transactionStatus}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {txn.paymentStatus}
                    </span>
                  </div>

                  <div className="text-sm font-black text-slate-800">
                    {txn.lot?.materialCategory} ({txn.lot?.approximateWeight} kg) • ₹{txn.quotedPrice}/kg
                  </div>

                  <div className="text-xs text-slate-500">
                    Collector: <strong>{txn.collector?.displayName}</strong> ({txn.collector?.generalOperatingLocation})
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="text-right mr-3">
                    <span className="text-[10px] text-slate-400 block font-semibold">Final Sale Amount:</span>
                    <span className="text-lg font-black text-emerald-800">
                      ₹{txn.finalSaleValue?.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Step 1 Handover Button */}
                  {!isHandedOver && !isCompleted && (
                    <button
                      onClick={() => openHandoverModal(txn)}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5 transition-all"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>Confirm Handover</span>
                    </button>
                  )}

                  {/* Step 2 Payment Button */}
                  {isHandedOver && !isPaid && (
                    <button
                      onClick={() => openPaymentModal(txn)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5 transition-all"
                    >
                      <IndianRupee className="w-3.5 h-3.5" />
                      <span>Confirm Payment</span>
                    </button>
                  )}

                  <Link
                    to={`/receipt/${txn.id}`}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Receipt</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CONFIRM HANDOVER MODAL */}
      {modalMode === 'HANDOVER' && selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-black text-slate-900 mb-1">Confirm Physical Handover</h3>
            <p className="text-xs text-slate-500 mb-4">
              Lot: {selectedTxn.lot?.lotReference} ({selectedTxn.lot?.materialCategory})
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Scale Verified Final Weight (kg)
                </label>
                <input
                  type="number"
                  value={finalWeight}
                  onChange={(e) => setFinalWeight(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border text-xs">
                <span className="text-slate-500 block">Agreed Quoted Rate:</span>
                <span className="text-sm font-black text-slate-800">₹{selectedTxn.quotedPrice}/kg</span>
                <div className="mt-1 pt-1 border-t border-slate-200 flex justify-between">
                  <span className="font-bold">Calculated Amount:</span>
                  <span className="font-black text-emerald-800">
                    ₹{Math.round((parseFloat(finalWeight) || 0) * selectedTxn.quotedPrice)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmHandoverSubmit}
                  disabled={actionLoading}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md"
                >
                  {actionLoading ? 'Saving...' : 'Confirm Handover'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM PAYMENT MODAL */}
      {modalMode === 'PAYMENT' && selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-black text-slate-900 mb-1">Confirm Collector Payment</h3>
            <p className="text-xs text-slate-500 mb-4">
              Collector: {selectedTxn.collector?.displayName}
            </p>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center mb-4">
              <span className="text-xs text-emerald-700 font-bold block mb-1">Payment Amount</span>
              <span className="text-3xl font-black text-emerald-900">
                ₹{selectedTxn.finalSaleValue?.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">Direct Bank / UPI Settlement</span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmPaymentSubmit}
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md"
              >
                {actionLoading ? 'Processing...' : 'Confirm & Disburse'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
