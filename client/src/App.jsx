import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { SafetyBanner } from './components/SafetyBanner';
import { NotificationToast } from './components/NotificationToast';

import { LandingPage } from './pages/LandingPage';
import { ChatPage } from './pages/ChatPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { RulesPage } from './pages/RulesPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <div className="min-h-screen flex flex-col bg-[#fbfbfe] text-violet-950 selection:bg-brand-500 selection:text-white">
            <Navbar />
            <SafetyBanner />
            <main className="flex-1 flex flex-col">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/rules" element={<RulesPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <NotificationToast />
          </div>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
