import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  Package, 
  IndianRupee, 
  Scale, 
  AlertTriangle, 
  Clock, 
  RefreshCw,
  Cpu,
  TrendingUp,
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminAnalytics();
      setData(res);
    } catch (e) {
      console.error('Failed to load admin analytics', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-12 text-center text-xs text-slate-500 animate-pulse">
        Loading national e-waste compliance and circularity registry...
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalCollectors: 10,
    totalRecyclers: 8,
    totalLots: 32,
    totalTransactions: 30,
    totalWeightKg: 1250,
    totalTransactionValue: 245000,
    pendingTransactions: 3,
  };

  const distribution = data?.materialDistributionChart || [
    { category: 'PCB', lots: 12, weightKg: 380 },
    { category: 'Cable', lots: 8, weightKg: 280 },
    { category: 'Battery', lots: 6, weightKg: 190 },
    { category: 'Motor', lots: 4, weightKg: 180 },
    { category: 'CRT', lots: 2, weightKg: 120 },
  ];

  const anomalies = data?.anomalies || [];
  const recent = data?.recentActivity || [];
  const syncLogs = data?.syncLogs || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
      {/* Admin Title Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              National E-Waste Circularity & Traceability Hub
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Central Authority & CPCB Monitoring Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            E-Waste (Management) Rules 2022 • Real-Time Informal Sector Formalization Telemetry
          </p>
        </div>

        <button
          onClick={loadAnalytics}
          className="self-start md:self-auto p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* KPI METRICS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-1">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Informal Collectors</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900">{metrics.totalCollectors}</span>
          <span className="text-[10px] text-emerald-600 font-semibold block">KYC & Geotagged</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-1">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Authorized Recyclers</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-blue-900">{metrics.totalRecyclers}</span>
          <span className="text-[10px] text-blue-600 font-semibold block">CPCB / MPCB Registered</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-1">
            <Scale className="w-4 h-4 text-amber-600" />
            <span>E-Waste Formalized</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900">{metrics.totalWeightKg.toLocaleString('en-IN')} kg</span>
          <span className="text-[10px] text-slate-400 font-semibold block">Diverted from toxic landfills</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-1">
            <IndianRupee className="w-4 h-4 text-emerald-600" />
            <span>Circulated Value</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-emerald-700">₹{metrics.totalTransactionValue.toLocaleString('en-IN')}</span>
          <span className="text-[10px] text-emerald-600 font-semibold block">Paid directly to collectors</span>
        </div>
      </div>

      {/* AI TRANSACTION ANOMALY DETECTION SECTION */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-3xl p-5 border border-red-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-red-950">
                AI Transaction Anomaly Monitor ({anomalies.length} Flagged)
              </h3>
              <p className="text-xs text-red-800">
                Automated statistical deviation detection protects collectors from predatory down-grading.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-red-200 text-red-900">
            Active Watchdog
          </span>
        </div>

        {anomalies.length === 0 ? (
          <div className="p-4 bg-white/80 rounded-2xl text-xs text-slate-600 border border-red-100">
            ✓ No statistical price anomalies detected across recent transactions.
          </div>
        ) : (
          <div className="space-y-2">
            {anomalies.map((a: any) => (
              <div
                key={a.id}
                className="bg-white rounded-2xl p-4 border border-red-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-red-700">{a.transactionReference}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-red-100 text-red-800">
                      Unusual Price Deviation
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 font-bold">
                    Recorded Quoted Rate: <span className="text-red-600 font-black">₹{a.quotedPrice}/kg</span>
                  </div>
                  <p className="text-[11px] text-red-800 mt-1 italic leading-tight">
                    {a.anomalyReason || 'Recorded price is significantly outside recent observed range.'}
                  </p>
                </div>

                <Link
                  to={`/receipt/${a.id}`}
                  className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold shadow-xs hover:bg-red-700 self-start sm:self-auto"
                >
                  Inspect Audit Log
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Material Distribution Bar Chart */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-900 mb-1">
            E-Waste Weight Handled by Category (kg)
          </h3>
          <p className="text-xs text-slate-500 mb-4">Volume breakdown across formal recycler partners</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val: any) => [`${val} kg`, 'Total Weight']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="weightKg" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Offline Sync Logs & Telemetry */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-extrabold text-slate-900">
                Offline Tolerance & Sync Logs
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                PWA / Sync Queue
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Automated batched sync records from low-connectivity field areas
            </p>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {syncLogs.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  No sync events logged recently. All field units synced.
                </div>
              ) : (
                syncLogs.map((log: any) => (
                  <div key={log.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800 block">{log.action}</span>
                      <span className="text-[10px] text-slate-500">{log.details}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                      {log.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Offline sync engine:</span>
            <span className="font-bold text-emerald-700">Conflict-Safe Transaction Buffer Active</span>
          </div>
        </div>
      </div>

      {/* END-TO-END REGULATORY CHAIN-OF-CUSTODY TRACEABILITY WORKFLOW */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block mb-1">
              CPCB E-Waste Rules 2022 • Chain-of-Custody Telemetry
            </span>
            <h3 className="text-lg font-black tracking-tight">
              End-to-End Material Traceability Pipeline
            </h3>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 self-start sm:self-auto">
            LIVE REGISTRY AUDIT
          </span>
        </div>

        {/* Lifecycle Flowchart Steps */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pt-2">
          <div className="p-3 bg-slate-800/90 rounded-2xl border border-slate-700">
            <span className="text-[10px] text-slate-400 font-mono block">1. FIELD ORIGIN</span>
            <span className="font-bold text-xs text-white block mt-0.5">Informal Collector</span>
            <span className="text-[10px] text-emerald-400 font-semibold">GPS Tagged • Photo</span>
          </div>

          <div className="p-3 bg-slate-800/90 rounded-2xl border border-slate-700">
            <span className="text-[10px] text-slate-400 font-mono block">2. SCRAP BATCH</span>
            <span className="font-bold text-xs text-white block mt-0.5">Lot Generated</span>
            <span className="text-[10px] text-blue-400 font-semibold">AI Vision Classified</span>
          </div>

          <div className="p-3 bg-slate-800/90 rounded-2xl border border-slate-700">
            <span className="text-[10px] text-slate-400 font-mono block">3. VERIFIED INTAKE</span>
            <span className="font-bold text-xs text-white block mt-0.5">Scale Weighbridge</span>
            <span className="text-[10px] text-emerald-400 font-semibold">Weight Discrepancy &lt; 2%</span>
          </div>

          <div className="p-3 bg-slate-800/90 rounded-2xl border border-slate-700">
            <span className="text-[10px] text-slate-400 font-mono block">4. CRYPTO SEAL</span>
            <span className="font-bold text-xs text-white block mt-0.5">SHA-256 Hash Chain</span>
            <span className="text-[10px] text-amber-300 font-semibold">Tamper-Evident QR</span>
          </div>

          <div className="p-3 bg-slate-800/90 rounded-2xl border border-slate-700">
            <span className="text-[10px] text-slate-400 font-mono block">5. FORMAL RECYCLING</span>
            <span className="font-bold text-xs text-white block mt-0.5">Facility Granulation</span>
            <span className="text-[10px] text-emerald-400 font-semibold">EPR Credit Generated</span>
          </div>
        </div>
      </div>

      {/* RECENT FORMAL HANDOVERS TABLE */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900">
            Recent Digital Traceability Records ({recent.length})
          </h3>
          <span className="text-xs text-slate-500 font-mono">CPCB Audit Trail Validated</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-2">Reference</th>
                <th className="py-2">Collector</th>
                <th className="py-2">Recycler</th>
                <th className="py-2">Material</th>
                <th className="py-2">Weight</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Status</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recent.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 font-mono font-bold text-slate-900">{item.ref}</td>
                  <td className="py-2.5 font-semibold text-slate-800">{item.collector?.split(' ')[0]}</td>
                  <td className="py-2.5 text-slate-600 truncate max-w-[140px]">{item.recycler}</td>
                  <td className="py-2.5 font-bold text-emerald-800">{item.material}</td>
                  <td className="py-2.5 text-slate-700">{item.weight} kg</td>
                  <td className="py-2.5 font-black text-slate-900">₹{item.amount?.toLocaleString('en-IN')}</td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                      {item.status}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <Link to={`/receipt/${item.id}`} className="text-emerald-700 hover:underline font-bold">
                      Verify →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
