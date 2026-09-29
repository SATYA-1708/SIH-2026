import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, ExternalLink, ShieldCheck, CheckCircle2, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  reference: string; // e.g. TXN-20260928-0012 or EWL-20260928-0001
  title?: string;
  subtitle?: string;
  amount?: number;
  weight?: number;
  material?: string;
}

export const QRModal: React.FC<QRModalProps> = ({
  isOpen,
  onClose,
  reference,
  title = 'Digital Verification QR',
  subtitle = 'Scan to verify this formal e-waste traceability record',
  amount,
  weight,
  material,
}) => {
  if (!isOpen) return null;

  const verifyUrl = `${window.location.origin}/verify/${reference}`;
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 shadow-inner">
          <ShieldCheck className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-extrabold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">{subtitle}</p>

        {/* QR Code Container */}
        <div className="p-4 bg-white border-2 border-emerald-600 rounded-2xl shadow-md mb-4 flex items-center justify-center">
          <QRCodeSVG
            value={verifyUrl}
            size={180}
            level="H"
            includeMargin={true}
          />
        </div>

        <div className="w-full bg-slate-50 rounded-xl p-3 mb-4 text-left border border-slate-200">
          <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
            <span>Reference ID</span>
            <span className="font-mono font-bold text-slate-800">{reference}</span>
          </div>
          {material && (
            <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
              <span>Material</span>
              <span className="font-bold text-slate-800">{material} ({weight} kg)</span>
            </div>
          )}
          {amount !== undefined && (
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>Transaction Value</span>
              <span className="font-bold text-emerald-700 text-sm">₹{amount.toLocaleString('en-IN')}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 w-full">
          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy Link'}</span>
          </button>
          <Link
            to={`/verify/${reference}`}
            onClick={onClose}
            className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/20 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Page</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
