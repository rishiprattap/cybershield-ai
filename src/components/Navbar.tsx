import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Menu, X, User, LogOut, Sparkles, BookOpen, LayoutDashboard, Terminal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#080D1A]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single text element wordmark with brand insignia */}
        <Link to="/" className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-colors">
            <Shield className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-base font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
              Trust Lens
            </span>
            <span className="text-[10px] font-mono text-cyan-400/80 -mt-1">
              Fact Check Engine
            </span>
          </div>
        </Link>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <Link
            to="/"
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              location.pathname === '/' || location.pathname === '/check-claim'
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-300'
            }`}
          >
            Check a Claim
          </Link>
          <Link
            to="/?reportId=fc-demo-supported"
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              location.search.includes('reportId=fc-demo') ? 'text-cyan-400' : 'text-slate-300'
            }`}
          >
            Demo Benchmarks
          </Link>
          <Link
            to="/home"
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              location.pathname === '/home' ? 'text-cyan-400' : 'text-slate-300'
            }`}
          >
            Platform Overview
          </Link>
          <Link
            to="/analyze/message"
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              isActive('/analyze') ? 'text-cyan-400' : 'text-slate-300'
            }`}
          >
            Threat Analyzers
          </Link>
          <Link
            to="/feedback"
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              isActive('/feedback') ? 'text-cyan-400' : 'text-slate-300'
            }`}
          >
            Feedback
          </Link>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
            Hackathon Public Demo
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 rounded-lg shadow-sm shadow-cyan-500/20 transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Verify Claim Now</span>
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#0B1224] px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-2 text-sm font-medium">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-cyan-400 font-semibold bg-slate-800/60"
            >
              Check a Claim
            </Link>
            <Link
              to="/?reportId=fc-demo-supported"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800/50"
            >
              Demo Benchmarks
            </Link>
            <Link
              to="/home"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800/50"
            >
              Platform Overview
            </Link>
            <Link
              to="/analyze/message"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800/50"
            >
              Threat Analyzers
            </Link>
            <Link
              to="/feedback"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800/50"
            >
              Give Feedback
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center block py-2.5 text-xs font-semibold text-slate-950 bg-cyan-400 rounded-md"
            >
              Verify Claim Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
