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
import { FactCheckPage } from './pages/FactCheckPage';

function AppRoutes() {
  return (
    <Routes>
      {/* Public Fact-Checking Page at root for instant hackathon evaluation */}
      <Route path="/" element={<FactCheckPage />} />
      <Route path="/check-claim" element={<FactCheckPage />} />
      <Route path="/home" element={<Home />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/analyze/message" element={<MessageAnalysisPage />} />
      <Route path="/analyze/url" element={<UrlScannerPage />} />
      <Route path="/analyze/image" element={<ImageAnalysisPage />} />
      <Route path="/results/:id" element={<AnalysisResultPage />} />
      <Route path="/academy" element={<AcademyPage />} />
      <Route path="/feedback" element={<FeedbackPage />} />
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
