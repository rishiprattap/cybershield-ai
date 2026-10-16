import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AiChatWidget } from './components/AiChatWidget';

import { Home } from './pages/Home';
import { MessageAnalysisPage } from './pages/MessageAnalysisPage';
import { UrlScannerPage } from './pages/UrlScannerPage';
import { ImageAnalysisPage } from './pages/ImageAnalysisPage';
import { AnalysisResultPage } from './pages/AnalysisResultPage';
import { DashboardPage } from './pages/DashboardPage';
import { AcademyPage } from './pages/AcademyPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Login page appears first at root '/' for visitors */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/analyze/message" element={<MessageAnalysisPage />} />
      <Route path="/analyze/url" element={<UrlScannerPage />} />
      <Route path="/analyze/image" element={<ImageAnalysisPage />} />
      <Route path="/results/:id" element={<AnalysisResultPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/academy" element={<AcademyPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/feedback" element={<FeedbackPage />} />
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-[#080D1A] text-slate-100">
          <Navbar />
          <main className="flex-1">
            <AppRoutes />
          </main>
          <Footer />
          <AiChatWidget />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
