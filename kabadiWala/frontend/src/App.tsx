import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { I18nProvider } from './services/i18n';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { CollectorDashboard } from './pages/CollectorDashboard';
import { CreateLotPage } from './pages/CreateLotPage';
import { PriceBoardPage } from './pages/PriceBoardPage';
import { RecyclerMarketplacePage } from './pages/RecyclerMarketplacePage';
import { HandoverReceiptPage } from './pages/HandoverReceiptPage';
import { EarningsLedgerPage } from './pages/EarningsLedgerPage';
import { SafetyPage } from './pages/SafetyPage';
import { MyLotsPage } from './pages/MyLotsPage';
import { RecyclerDashboard } from './pages/RecyclerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { VerifyPage } from './pages/VerifyPage';
import { UnitEconomicsPage } from './pages/UnitEconomicsPage';
import { VoiceAgent } from './components/VoiceAgent';

export const App: React.FC = () => {
  return (
    <I18nProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/collector" element={<CollectorDashboard />} />
              <Route path="/create-lot" element={<CreateLotPage />} />
              <Route path="/prices" element={<PriceBoardPage />} />
              <Route path="/unit-economics" element={<UnitEconomicsPage />} />
              <Route path="/recyclers" element={<RecyclerMarketplacePage />} />
              <Route path="/lots" element={<MyLotsPage />} />
              <Route path="/receipt/:id" element={<HandoverReceiptPage />} />
              <Route path="/earnings" element={<EarningsLedgerPage />} />
              <Route path="/safety" element={<SafetyPage />} />
              <Route path="/recycler" element={<RecyclerDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/verify/:reference" element={<VerifyPage />} />
              {/* Fallback to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <VoiceAgent />
        </div>
      </BrowserRouter>
    </I18nProvider>
  );
};

export default App;
