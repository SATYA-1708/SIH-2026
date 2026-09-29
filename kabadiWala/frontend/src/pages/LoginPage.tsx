import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n, Language } from '../services/i18n';
import { api, setAuthSession } from '../services/api';
import { Recycle, User, Building2, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { language, setLanguage, t } = useI18n();
  const navigate = useNavigate();

  const [activeRole, setActiveRole] = useState<'collector' | 'recycler' | 'admin'>('collector');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDemoLogin = async (role: 'collector' | 'recycler' | 'admin') => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.demoLogin(role);
      setAuthSession(res.token, res.user);
      if (role === 'admin') navigate('/admin');
      else if (role === 'recycler') navigate('/recycler');
      else navigate('/collector');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.login({
        role: activeRole,
        name: name || (activeRole === 'collector' ? 'Ramesh Sonawane' : 'EcoGreen Recycler'),
        identifier: phone || '+91 98230 11201',
        preferredLanguage: language,
        location: 'Nagpur MIDC',
      });
      setAuthSession(res.token, res.user);
      if (activeRole === 'admin') navigate('/admin');
      else if (activeRole === 'recycler') navigate('/recycler');
      else navigate('/collector');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8">
        {/* Header with App Logo */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-700/20">
            <Recycle className="w-8 h-8 animate-spin-slow" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('app_title')}</h1>
          <p className="text-xs text-slate-500 mt-1">{t('tagline')}</p>
        </div>

        {/* 1. Large Language Selection Buttons */}
        <div className="mb-6 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 text-center">
          <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
            {t('choose_language')}
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                language === 'hi' ? 'bg-emerald-700 text-white shadow-sm font-black' : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              हिन्दी
            </button>
            <button
              type="button"
              onClick={() => setLanguage('mr')}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                language === 'mr' ? 'bg-emerald-700 text-white shadow-sm font-black' : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              मराठी
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                language === 'en' ? 'bg-emerald-700 text-white shadow-sm font-black' : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Demo Mode Fast Pass Section */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-tr from-amber-50 to-orange-50 border border-amber-200">
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-900 mb-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>SIH Live Demo Mode (One-Click Login):</span>
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('collector')}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{t('demo_collector_btn')}</span>
              </div>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('recycler')}
              className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-sm flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>{t('demo_recycler_btn')}</span>
              </div>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('admin')}
              className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-sm flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>{t('demo_admin_btn')}</span>
              </div>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Regular Role Selection & Login Form */}
        <div className="border-t border-slate-200 pt-5">
          <div className="flex rounded-xl bg-slate-100 p-1 mb-4">
            <button
              type="button"
              onClick={() => setActiveRole('collector')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeRole === 'collector' ? 'bg-white shadow text-emerald-800' : 'text-slate-600'
              }`}
            >
              {t('collector')}
            </button>
            <button
              type="button"
              onClick={() => setActiveRole('recycler')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeRole === 'recycler' ? 'bg-white shadow text-blue-800' : 'text-slate-600'
              }`}
            >
              {t('recycler')}
            </button>
            <button
              type="button"
              onClick={() => setActiveRole('admin')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeRole === 'admin' ? 'bg-white shadow text-indigo-800' : 'text-slate-600'
              }`}
            >
              {t('admin')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {activeRole === 'collector' ? 'नाम (Name)' : 'सुविधा / कंपनी नाम (Facility Name)'}
              </label>
              <input
                type="text"
                placeholder={activeRole === 'collector' ? 'रमेश सोनवणे' : 'EcoGreen Recycling'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                मोबाइल नंबर (Mobile Number)
              </label>
              <input
                type="tel"
                placeholder="+91 98230 11201"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-xs font-bold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-md transition-all mt-2"
            >
              {loading ? 'कृपया प्रतीक्षा करें...' : 'लॉगिन / साइन-अप'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
