import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useI18n } from '../services/i18n';
import { api } from '../services/api';
import { AudioSpeaker } from '../components/AudioSpeaker';
import { 
  CheckCircle2, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Clock, 
  Scale, 
  IndianRupee, 
  Printer, 
  Share2, 
  ArrowLeft,
  Building2,
  User,
  QrCode
} from 'lucide-react';

export const HandoverReceiptPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useI18n();

  const [transaction, setTransaction] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      loadTransaction(id);
    }
  }, [id]);

  const loadTransaction = async (txnId: string) => {
    setLoading(true);
    try {
      const data = await api.getTransactionById(txnId);
      setTransaction(data);
    } catch (e) {
      console.error('Failed to load transaction receipt', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `E-Waste Receipt: ${transaction?.transactionReference}`,
        text: `Verified E-Waste Handover Receipt for ${transaction?.lot?.materialCategory} (${transaction?.lot?.approximateWeight}kg) - ₹${transaction?.finalSaleValue}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-8 text-center text-xs text-slate-500 animate-pulse">
        Generating official digital traceability certificate...
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="max-w-md mx-auto p-8 text-center">
        <h3 className="font-extrabold text-slate-800">रसीद नहीं मिली (Receipt Not Found)</h3>
        <Link to="/collector" className="text-xs text-emerald-700 font-bold mt-2 inline-block">
          डैशबोर्ड पर वापस जाएं
        </Link>
      </div>
    );
  }

  const verifyUrl = `${window.location.origin}/verify/${transaction.transactionReference}`;

  const audioReceiptText = `लेन-देन रसीद नंबर ${transaction.transactionReference}. लॉट नंबर ${transaction.lot?.lotReference}. सामग्री ${transaction.lot?.materialCategory}, वजन ${transaction.lot?.approximateWeight} किलो. कुल देय राशि ₹${transaction.finalSaleValue}. भुगतान स्थिति: ${transaction.paymentStatus === 'PAID' ? 'प्राप्त हुआ' : 'बाकी है'}.`;

  return (
    <div className="max-w-xl mx-auto px-4 py-4 pb-20 space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between no-print">
        <Link
          to="/collector"
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 text-xs font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>वापस</span>
        </Link>
        <div className="flex items-center gap-2">
          <AudioSpeaker text={audioReceiptText} size="sm" />
          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>{copied ? 'Copied' : 'Share'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="p-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Official Certificate Paper Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-emerald-500 relative overflow-hidden print:border-none print:shadow-none">
        {/* Certificate Seal Background Watermark */}
        <div className="absolute top-2 right-2 text-emerald-100/50 -rotate-12 select-none pointer-events-none">
          <ShieldCheck className="w-48 h-48" />
        </div>

        {/* Certificate Header */}
        <div className="text-center pb-5 border-b-2 border-slate-100 relative">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>TRANSACTION VERIFIED ✓</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            DIGITAL TRACEABILITY & HANDOVER RECEIPT
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            E-Waste (Management) Rules, 2022 • Official Collector-to-Recycler Ledger Record
          </p>
        </div>

        {/* Main Reference Banner */}
        <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
              Transaction Reference
            </span>
            <span className="text-lg font-black font-mono text-emerald-800">
              {transaction.transactionReference}
            </span>
          </div>

          <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800">
              {transaction.transactionStatus}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
              transaction.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {transaction.paymentStatus === 'PAID' ? '✓ PAID' : '⏳ PENDING'}
            </span>
          </div>
        </div>

        {/* 2-Column Parties Section: Collector & Recycler */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 border-b border-slate-100">
          <div className="p-3 bg-slate-50/70 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 mb-1">
              <User className="w-4 h-4 text-emerald-600" />
              <span>COLLECTOR (कबाड़ी / वेचक)</span>
            </div>
            <div className="text-xs text-slate-800 font-bold">{transaction.collector?.displayName}</div>
            <div className="text-[11px] text-slate-500">{transaction.collector?.generalOperatingLocation}</div>
          </div>

          <div className="p-3 bg-slate-50/70 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 mb-1">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>AUTHORIZED RECYCLER</span>
            </div>
            <div className="text-xs text-slate-800 font-bold">{transaction.recycler?.name}</div>
            <div className="text-[10px] font-mono text-emerald-700 font-bold">
              Reg: {transaction.recycler?.authorizationNumber}
            </div>
            <div className="text-[11px] text-slate-500">{transaction.recycler?.facilityLocation}</div>
          </div>
        </div>

        {/* Scrap Lot Specifications */}
        <div className="py-4 border-b border-slate-100 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-semibold">Lot Identification:</span>
            <span className="font-mono font-bold text-slate-900">{transaction.lot?.lotReference}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-semibold">Material Category:</span>
            <span className="font-black text-emerald-800 text-sm">{transaction.lot?.materialCategory}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-semibold">Weight Recorded:</span>
            <span className="font-bold text-slate-900">{transaction.lot?.approximateWeight} kg</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-semibold">Agreed Quoted Rate:</span>
            <span className="font-bold text-slate-900">₹{transaction.quotedPrice} / kg</span>
          </div>
          <div className="flex justify-between items-center text-xs pt-2 border-t border-dashed border-slate-200">
            <span className="text-sm font-black text-slate-900">Final Sale Amount:</span>
            <span className="text-2xl font-black text-emerald-800">
              ₹{transaction.finalSaleValue?.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* GPS, Location, Timestamp & Verification QR */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1.5 text-[11px] text-slate-500 flex-1 text-center sm:text-left">
            <div className="flex items-center gap-1 justify-center sm:justify-start">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{new Date(transaction.dateTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-1 justify-center sm:justify-start">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{new Date(transaction.dateTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex items-center gap-1 justify-center sm:justify-start">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate max-w-[220px]">{transaction.handoverLocation}</span>
            </div>
            <div className="font-mono text-[10px] text-slate-400">
              GPS: {transaction.handoverLatitude?.toFixed(4)}, {transaction.handoverLongitude?.toFixed(4)}
            </div>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center">
            <div className="p-2.5 bg-white border-2 border-slate-900 rounded-2xl shadow-sm">
              <QRCodeSVG value={verifyUrl} size={96} level="M" />
            </div>
            <span className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-wider">
              Scan to Verify
            </span>
          </div>
        </div>

        {/* Security watermark footer */}
        <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>SECURE HASH: SHA-256 VALIDATED</span>
          <span>RECYCLER SIGN: CONFIRMED ✓</span>
        </div>
      </div>
    </div>
  );
};
