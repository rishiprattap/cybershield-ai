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
        <Link to="/home" className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-colors">
            <Shield className="w-5 h-5" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
            Trust Lens
          </span>
        </Link>

        {/* Zone 2: 4–5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <Link
            to="/home"
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              location.pathname === '/home' ? 'text-cyan-400' : 'text-slate-300'
            }`}
          >
            Home
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
            to="/dashboard"
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              isActive('/dashboard') ? 'text-cyan-400' : 'text-slate-300'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/academy"
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              isActive('/academy') ? 'text-cyan-400' : 'text-slate-300'
            }`}
          >
            Cyber Academy
          </Link>
          <Link
            to="/feedback"
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              isActive('/feedback') ? 'text-cyan-400' : 'text-slate-300'
            }`}
          >
            Feedback
          </Link>
          <Link
            to="/admin"
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              isActive('/admin') ? 'text-cyan-400' : 'text-slate-300'
            }`}
          >
            SecOps Admin
          </Link>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="flex items-center gap-2 text-xs font-mono text-slate-300 hover:text-white bg-slate-900 border border-slate-700/80 px-3 py-1.5 rounded-md transition-colors"
              >
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span className="max-w-[130px] truncate">Login</span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                title="Sign Out"
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-md hover:bg-slate-800/60 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-xs font-medium text-slate-300 hover:text-white px-3 py-2 transition-colors whitespace-nowrap shrink-0"
              >
                <span>Login</span>
              </Link>
              <Link
                to="/analyze/message"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 rounded-lg shadow-sm shadow-cyan-500/20 transition-all whitespace-nowrap shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Start Free Analysis</span>
              </Link>
            </div>
          )}
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
              to="/home"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800/50"
            >
              Home
            </Link>
            <Link
              to="/analyze/message"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800/50"
            >
              Threat Analyzers
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800/50"
            >
              Dashboard & History
            </Link>
            <Link
              to="/academy"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800/50"
            >
              Cyber Academy
            </Link>
            <Link
              to="/onboarding"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800/50"
            >
              First-Time Tutorial
            </Link>
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800/50"
            >
              SecOps Admin
            </Link>
            <Link
              to="/feedback"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800/50"
            >
              Give Feedback
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            {user ? (
              <div className="flex items-center justify-between px-3 py-2 bg-slate-900 rounded-md">
                <span className="text-xs font-mono text-slate-300 truncate">{user.fullName || user.email}</span>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate('/');
                  }}
                  className="text-xs text-rose-400 hover:underline"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-1/2 text-center py-2 text-xs font-medium text-slate-300 bg-slate-900 rounded-md"
                >
                  Log In
                </Link>
                <Link
                  to="/analyze/message"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-1/2 text-center py-2 text-xs font-semibold text-slate-950 bg-cyan-400 rounded-md"
                >
                  Start Analysis
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
