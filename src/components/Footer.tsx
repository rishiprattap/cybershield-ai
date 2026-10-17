import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, FileText, MessageSquareQuote, ExternalLink, HelpCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#060A14] text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12 mb-12">
          
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-display text-base font-bold text-white tracking-tight">
                Trust<span className="text-cyan-400"> Lens</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Empowering individuals and teams to inspect suspicious digital messages, analyze unverified web links, and verify image manipulation signals before taking action.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs font-mono text-slate-500">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                Zero-Retention SSRF Shield
              </span>
              <span>·</span>
              <span>Gemini 3.8 Intelligence</span>
            </div>
          </div>

          {/* Tools */}
          <div>
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Detection Engines
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/analyze/message" className="hover:text-cyan-300 transition-colors">
                  Message Threat Inspector
                </Link>
              </li>
              <li>
                <Link to="/analyze/url" className="hover:text-cyan-300 transition-colors">
                  URL & Domain Scanner
                </Link>
              </li>
              <li>
                <Link to="/analyze/image" className="hover:text-cyan-300 transition-colors">
                  Image Authenticity Forensics
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-cyan-300 transition-colors">
                  Investigation History
                </Link>
              </li>
            </ul>
          </div>

          {/* Academy */}
          <div>
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Cyber Academy
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/academy" className="hover:text-cyan-300 transition-colors">
                  Phishing Defense Guide
                </Link>
              </li>
              <li>
                <Link to="/academy" className="hover:text-cyan-300 transition-colors">
                  Deepfakes & AI Media
                </Link>
              </li>
              <li>
                <Link to="/academy" className="hover:text-cyan-300 transition-colors">
                  Safe URL Verification
                </Link>
              </li>
              <li>
                <Link to="/onboarding" className="hover:text-cyan-300 transition-colors">
                  First-Time User Walkthrough
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Operations */}
          <div>
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Trust & System
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/admin" className="hover:text-cyan-300 transition-colors">
                  SecOps Admin Portal
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="hover:text-cyan-300 transition-colors">
                  Report False Findings
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="hover:text-cyan-300 transition-colors">
                  Provide Feedback
                </Link>
              </li>
              <li>
                <span className="text-xs text-slate-500 block pt-1">
                  Responsible AI Standard
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Legal & Responsible AI Disclaimer */}
        <div className="pt-8 border-t border-slate-800/80 text-xs text-slate-400 space-y-3">
          <p className="leading-relaxed">
            <strong className="text-slate-300">Responsible AI & Verification Disclosure:</strong> Trust Lens employs language models grounded strictly in live web search evidence to evaluate factual claims. Verdicts and source citations provide evidence-backed transparency to aid critical thinking.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 font-mono text-[11px] text-slate-400">
            <div>
              © 2026 Trust Lens Platform. Verify Before You Share.
            </div>
            <div className="flex items-center gap-4">
              <span className="hover:text-slate-300 cursor-pointer">Privacy Framework</span>
              <span>·</span>
              <span className="hover:text-slate-300 cursor-pointer">Terms of Inspection</span>
              <span>·</span>
              <span className="hover:text-slate-300 cursor-pointer">C2PA Standard Alignment</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};
