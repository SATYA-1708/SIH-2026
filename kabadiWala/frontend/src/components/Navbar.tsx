import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useI18n, Language } from '../services/i18n';
import { getCurrentUser, clearAuthSession } from '../services/api';
import { getOfflineQueue, syncOfflineQueue } from '../services/offlineStorage';
import { 
  Recycle, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  LogOut, 
  ShieldCheck, 
  User, 
  Building2, 
  TrendingUp,
  Scale
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { language, setLanguage, t } = useI18n();
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    const updateOnline = () => {
      setIsOnline(true);
      // Auto sync when coming online
      handleSync();
    };
    const updateOffline = () => setIsOnline(false);

    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOffline);

    const updateQueueCount = () => {
      const queue = getOfflineQueue();
      const pending = queue.filter(q => q.syncStatus === 'PENDING_SYNC');
      setPendingCount(pending.length);
    };

    updateQueueCount();
    window.addEventListener('ewaste:queue-changed', updateQueueCount);

    return () => {
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOffline);
      window.removeEventListener('ewaste:queue-changed', updateQueueCount);
    };
  }, []);

  const handleSync = async () => {
    if (isSyncing || !navigator.onLine) return;
    setIsSyncing(true);
    try {
      await syncOfflineQueue(user?.id);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = () => {
    clearAuthSession();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
            <Recycle className="w-6 h-6 animate-spin-slow" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 leading-none">
              {t('app_title')}
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold tracking-wide">
              {language === 'hi' ? 'ई-कचरा सेतु' : language === 'mr' ? 'ई-कचरा सेतू' : 'Formal Recycler Bridge'}
            </span>
          </div>
        </Link>

        {/* Center / Navigation Links for Judges */}
        <div className="hidden md:flex items-center gap-1 text-xs font-bold text-slate-700">
          <Link
            to="/prices"
            className="px-2.5 py-1.5 rounded-lg hover:text-emerald-700 hover:bg-slate-100 transition-colors"
          >
            {language === 'hi' ? 'दैनिक भाव' : language === 'mr' ? 'दैनिक दर' : 'Prices'}
          </Link>
          <Link
            to="/unit-economics"
            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Unit Economics (+45%)</span>
          </Link>
          <Link
            to="/safety"
            className="px-2.5 py-1.5 rounded-lg hover:text-emerald-700 hover:bg-slate-100 transition-colors"
          >
            {language === 'hi' ? 'सुरक्षा' : language === 'mr' ? 'सुरक्षा' : 'Safety'}
          </Link>
        </div>

        {/* Right Section: Sync, Language, Role, Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Offline / Online Status Badge */}
          <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
            isOnline ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-300'
          }`}>
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('online_status')}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>{t('offline_status')}</span>
              </>
            )}
          </div>

          {/* Pending Sync Button if count > 0 */}
          {pendingCount > 0 && (
            <button
              onClick={handleSync}
              disabled={isSyncing || !isOnline}
              title={isOnline ? 'Click to sync pending lots' : 'Offline - will sync when online'}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{pendingCount} {language === 'hi' ? 'बाकी' : language === 'mr' ? 'शिल्लक' : 'Pending'}</span>
            </button>
          )}

          {/* Language Selector: Large touch targets */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2 py-1 rounded-md transition-all ${
                language === 'hi' ? 'bg-white text-emerald-800 shadow-sm font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => setLanguage('mr')}
              className={`px-2 py-1 rounded-md transition-all ${
                language === 'mr' ? 'bg-white text-emerald-800 shadow-sm font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              मराठी
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded-md transition-all ${
                language === 'en' ? 'bg-white text-emerald-800 shadow-sm font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              EN
            </button>
          </div>

          {/* User Role Badge / Navigation */}
          {user ? (
            <div className="flex items-center gap-1.5">
              <Link
                to={user.role === 'admin' ? '/admin' : user.role === 'recycler' ? '/recycler' : '/collector'}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 transition-colors"
              >
                {user.role === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />}
                {user.role === 'recycler' && <Building2 className="w-3.5 h-3.5 text-blue-600" />}
                {user.role === 'collector' && <User className="w-3.5 h-3.5 text-emerald-600" />}
                <span className="truncate max-w-[120px]">{user.name?.split(' ')[0]}</span>
              </Link>
              <button
                onClick={handleLogout}
                title="Log out"
                className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
            >
              Login / डेमो
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
