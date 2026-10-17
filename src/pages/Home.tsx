import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Search,
  Sparkles,
  ArrowRight,
  Mail,
  Link2,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  FileCheck,
  Activity,
  Layers,
  ChevronRight,
  User,
  LogOut,
  Star,
  Send,
  RefreshCw,
  AlertCircle,
  MessageSquareQuote,
} from 'lucide-react';
import { ASSETS } from '../assets/images';
import { useAuth } from '../context/AuthContext';
import { FeedbackItem } from '../types';

export const Home: React.FC = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  // In-page Login states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // In-page Feedback states
  const [fbCategory, setFbCategory] = useState<FeedbackItem['category']>('general');
  const [fbRating, setFbRating] = useState<number>(5);
  const [fbMessage, setFbMessage] = useState('');
  const [fbLoading, setFbLoading] = useState(false);
  const [fbSubmitted, setFbSubmitted] = useState(false);
  const [fbError, setFbError] = useState<string | null>(null);
  const [recentFeedbacks, setRecentFeedbacks] = useState<FeedbackItem[]>([]);

  useEffect(() => {
    fetch('/api/feedback')
      .then((res) => res.json())
      .then((data) => setRecentFeedbacks(data.slice(0, 4)))
      .catch((err) => console.error('Failed to load feedback:', err));
  }, [fbSubmitted]);

  const handleInPageLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setLoginError('Please enter both email and password.');
      return;
    }
    setLoginLoading(true);
    setLoginError(null);

    const res = await login(loginEmail, loginPassword);
    setLoginLoading(false);
    if (!res.success) {
      setLoginError(res.error || 'Authentication failed.');
    }
  };

  const handleDemoLogin = async () => {
    setLoginEmail('admin@trustlens.ai');
    setLoginPassword('hemlo@guys123');
    setLoginLoading(true);
    setLoginError(null);
    const res = await login('admin@trustlens.ai', 'hemlo@guys123');
    setLoginLoading(false);
    if (!res.success) {
      setLoginError(res.error || 'Authentication failed.');
    }
  };

  const handleInPageFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbMessage.trim()) {
      setFbError('Please provide your feedback details.');
      return;
    }
    setFbLoading(true);
    setFbError(null);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          category: fbCategory,
          rating: fbRating,
          message: fbMessage.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback.');
      }

      setFbSubmitted(true);
      setFbMessage('');
    } catch (err: any) {
      setFbError(err.message || 'Error submitting feedback.');
    } finally {
      setFbLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#080D1A] text-slate-100">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden border-b border-slate-800/60">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Headline and Call-to-actions */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-mono text-xs tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Your shield against misinformation</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] text-balance">
                Verify Factual Claims With{' '}
                <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
                  Web Evidence.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
                Extract checkable factual assertions from public statements or articles, cross-reference against authoritative web sources, and inspect transparent, cited verdicts.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg text-sm font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-sky-300 hover:from-cyan-300 hover:to-sky-200 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Search className="w-4 h-4" />
                  <span>Check a Claim Now (Public)</span>
                </Link>

                <Link
                  to="/?reportId=fc-demo-supported"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-sm font-medium text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 transition-colors whitespace-nowrap"
                >
                  <span>Explore Demo Benchmarks</span>
                  <ArrowRight className="w-4 h-4 text-cyan-400" />
                </Link>
              </div>

              {/* Supporting Trust Message */}
              <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-400 font-mono">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Informed Decision Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>SSRF Safe Sandbox</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Privacy First · Zero Tracking</span>
                </div>
              </div>
            </div>

            {/* Right Column: Premium Cinematic Cyber Defense Illustration */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-cyan-500/30 bg-[#0E172B] shadow-2xl shadow-cyan-950/40 group">
                <img
                  src={ASSETS.hero}
                  alt="Trust Lens Shield and Evidence Core"
                  className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-[1.02]"
                  referrerPolicy="no-referrer"
                />
                
                {/* Visual Glass Overlay Badge */}
                <div className="absolute bottom-4 left-4 right-4 bg-slate-950/85 backdrop-blur-md border border-slate-800 p-3.5 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-white block">Active Threat Inspection</span>
                      <span className="text-[11px] font-mono text-slate-400">Multi-vector analysis active</span>
                    </div>
                  </div>
                  <Link
                    to="/analyze/url"
                    className="font-mono text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <span>Test URL</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Verification Methodology Section */}
      <section className="py-16 bg-[#060B17] border-b border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
              Deterministic Verification Architecture
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              How Our Fact-Checking Engine Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Designed for transparency under hackathon evaluation guidelines: LLMs are used strictly as text parsers and comparisons, with all factual determinations grounded in retrieved evidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-xl bg-[#0D1527] border border-slate-800 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono text-xs font-bold">
                01
              </div>
              <h3 className="font-semibold text-white text-sm">Claim Extraction</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Extracts 1 to 5 distinct checkable assertions. Preserves numbers, dates, geography, and explicitly flags missing time or jurisdiction context rather than guessing.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#0D1527] border border-slate-800 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono text-xs font-bold">
                02
              </div>
              <h3 className="font-semibold text-white text-sm">Evidence Retrieval</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Executes live web search separately for each assertion. Records exact destination URLs, publication dates, excerpts, and retrieval timestamps.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#0D1527] border border-slate-800 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono text-xs font-bold">
                03
              </div>
              <h3 className="font-semibold text-white text-sm">Rank & Deduplication</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Prioritizes primary sources (.gov, .edu) and recognized wire services. Identifies syndicated stories so copied articles are never counted as independent corroboration.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#0D1527] border border-slate-800 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono text-xs font-bold">
                04
              </div>
              <h3 className="font-semibold text-white text-sm">Evidence-Grounded Verdicts</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Outputs Supported, Contradicted, Unverified, or Mixed with direct citations. Synthesizes overall findings via discrete claim count rules without arbitrary percentages.
              </p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Launch Fact Checker Now</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Overview: The 3 Primary Tools */}
      <section className="py-20 bg-[#0B1120] border-b border-slate-800/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
              Three Specialized Engines
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Comprehensive Digital Threat Detection
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Targeted forensic workflows designed to unpack deceptive patterns in text, links, and multimedia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Tool 1: Message Analysis */}
            <div className="bg-[#10192E] border border-slate-800 hover:border-cyan-500/40 rounded-xl overflow-hidden flex flex-col transition-all group">
              <div className="relative h-48 overflow-hidden bg-slate-900">
                <img
                  src={ASSETS.messageInspect}
                  alt="Message Analysis interface scanning phishing text"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-sm border border-slate-800 px-2.5 py-1 rounded-md text-[11px] font-mono text-cyan-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Phishing & Smishing</span>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-white mb-2">
                    Message Analysis
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Paste suspicious SMS, emails, or chat messages. Detects artificial urgency, brand impersonation, coercive framing, and credential-harvesting triggers.
                  </p>
                </div>
                <Link
                  to="/analyze/message"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 font-mono pt-2"
                >
                  <span>Inspect Message</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Tool 2: URL Security Scanner */}
            <div className="bg-[#10192E] border border-slate-800 hover:border-cyan-500/40 rounded-xl overflow-hidden flex flex-col transition-all group">
              <div className="relative h-48 overflow-hidden bg-slate-900">
                <img
                  src={ASSETS.urlScanner}
                  alt="URL security scanner inspecting link redirects and domain reputation"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-sm border border-slate-800 px-2.5 py-1 rounded-md text-[11px] font-mono text-cyan-400 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Domain Trust</span>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-white mb-2">
                    URL Security Scanner
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Investigate suspicious links without opening them in your browser. Inspects lookalike domains, deceptive subdomains, raw IP hosts, and shorteners with SSRF guard.
                  </p>
                </div>
                <Link
                  to="/analyze/url"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 font-mono pt-2"
                >
                  <span>Scan Link</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Tool 3: Image Authenticity Analysis */}
            <div className="bg-[#10192E] border border-slate-800 hover:border-cyan-500/40 rounded-xl overflow-hidden flex flex-col transition-all group">
              <div className="relative h-48 overflow-hidden bg-slate-900">
                <img
                  src={ASSETS.imageAnalysis}
                  alt="Image authenticity scanner checking pixel manipulation and synthetic signals"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-sm border border-slate-800 px-2.5 py-1 rounded-md text-[11px] font-mono text-cyan-400 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Forensic Signals</span>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-white mb-2">
                    Image Authenticity Analysis
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Evaluate images for synthetic generation indicators and physical manipulation cues. Clearly separates AI generation likelihood from photo splicing.
                  </p>
                </div>
                <Link
                  to="/analyze/image"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 font-mono pt-2"
                >
                  <span>Examine Image</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works: 4-Step Workflow */}
      <section className="py-20 bg-[#080D1A] border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
              Clear Operational Model
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
              How Trust Lens Protects You
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              A structured 4-step framework turning ambiguous threats into informed, defensive action.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Step 1 */}
            <div className="bg-[#0F172B] border border-slate-800 p-6 rounded-xl relative">
              <span className="font-mono text-3xl font-bold text-slate-700/80 block mb-4 tabular-nums">
                01
              </span>
              <h3 className="font-display text-base font-bold text-white mb-2">
                Submit Content
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Paste suspicious text, submit a link, or upload an image into the secure sandbox without exposing your primary browser or personal device.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#0F172B] border border-slate-800 p-6 rounded-xl relative">
              <span className="font-mono text-3xl font-bold text-cyan-500/60 block mb-4 tabular-nums">
                02
              </span>
              <h3 className="font-display text-base font-bold text-white mb-2">
                Analyze Signals
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                The engine evaluates domain architecture, urgency cues, forensic pixel textures, and social engineering hallmarks via Gemini AI.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#0F172B] border border-slate-800 p-6 rounded-xl relative">
              <span className="font-mono text-3xl font-bold text-slate-700/80 block mb-4 tabular-nums">
                03
              </span>
              <h3 className="font-display text-base font-bold text-white mb-2">
                Understand Evidence
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Review objective findings, risk classifications, and transparent explanations of uncertainty rather than opaque black-box labels.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-[#0F172B] border border-slate-800 p-6 rounded-xl relative">
              <span className="font-mono text-3xl font-bold text-emerald-500/60 block mb-4 tabular-nums">
                04
              </span>
              <h3 className="font-display text-base font-bold text-white mb-2">
                Take Safer Action
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Execute actionable recommendations: block contacts, report spoofing, independently verify banking requests, or report false alarms.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Trust Lens Academy Spotlight */}
      <section className="py-20 bg-[#0B1120] border-b border-slate-800/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-5">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
                Cybersecurity Academy
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Empower Your Intuition with Practical Digital Defense
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Automated tools help, but educated judgment stops scams at the root. Explore beginner-friendly tutorials, phishing dissection case studies, and interactive readiness quizzes.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300">
                    <strong>Phishing Anatomy:</strong> Learn how attackers manipulate emotion and authority to induce urgent clicks.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300">
                    <strong>URL Inspection:</strong> Spot typosquatting and sub-domain masquerades with the naked eye.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300">
                    <strong>Interactive Readiness Quiz:</strong> Test your scam-spotting reflexes with instant scoring.
                  </p>
                </div>
              </div>

              <div className="pt-3">
                <Link
                  to="/academy"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                >
                  <span>Explore Academy Guides</span>
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-[#0E172B] shadow-xl">
                <img
                  src={ASSETS.academy}
                  alt="Cybersecurity Education and Awareness Learning Environment"
                  className="w-full h-auto object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Privacy and Responsible AI Pledge */}
      <section className="py-20 bg-[#080D1A] border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#0E162B] border border-cyan-500/20 rounded-2xl p-8 sm:p-12 relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="font-display text-base font-bold text-white">
                  Zero Data Selling
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Your submitted messages, links, and photos are strictly processed for threat analysis. We never monetize or sell personal analysis data.
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
                  <Eye className="w-5 h-5" />
                </div>
                <h3 className="font-display text-base font-bold text-white">
                  Transparent Uncertainty
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Every result discloses its forensic limits. If image compression masks artifacts or lack of email headers prevents certainty, we tell you directly.
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
                  <FileCheck className="w-5 h-5" />
                </div>
                <h3 className="font-display text-base font-bold text-white">
                  SSRF Safe Architecture
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Our link inspection engine enforces strict Server-Side Request Forgery shields, blocking malicious attempts to query private or internal networks.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Community Feedback & Accuracy Reporting Section (At the end) */}
      <section id="feedback-section" className="py-20 bg-[#060B17] border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
              User Community Feedback
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Share Your Threat Detection Feedback
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Help us sharpen detection models, verify false positives, and improve the digital trust platform for everyone.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-[#0E172B] border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl space-y-8">
            {fbSubmitted ? (
              <div className="py-10 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Thank You for Your Feedback!</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Your contribution has been logged in our database and helps refine heuristic weighting and AI detection boundaries.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFbSubmitted(false)}
                  className="px-5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg cursor-pointer"
                >
                  Submit Another Note
                </button>
              </div>
            ) : (
              <form onSubmit={handleInPageFeedback} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-medium text-slate-300 block">
                      Feedback Type
                    </label>
                    <select
                      value={fbCategory}
                      onChange={(e) => setFbCategory(e.target.value as any)}
                      className="w-full bg-[#080D1A] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                    >
                      <option value="general">General Experience & Impression</option>
                      <option value="false_positive">False Positive (Safe marked unsafe)</option>
                      <option value="missed_threat">Missed Threat (Deception not caught)</option>
                      <option value="incorrect_result">Classification Accuracy Issue</option>
                      <option value="image_concern">Image Authenticity Question</option>
                      <option value="chatbot">AI Chatbot Answer Feedback</option>
                      <option value="feature_request">Feature Request / Idea</option>
                      <option value="usability">Usability or Navigation</option>
                    </select>
                  </div>

                  {/* Rating */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-medium text-slate-300 block">
                      Your Rating (1 to 5 Stars)
                    </label>
                    <div className="flex items-center gap-2 pt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFbRating(star)}
                          className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= fbRating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-mono text-slate-400 ml-2">
                        {fbRating} / 5
                      </span>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-medium text-slate-300 block">
                    Your Feedback & Analysis Observations:
                  </label>
                  <textarea
                    rows={4}
                    value={fbMessage}
                    onChange={(e) => setFbMessage(e.target.value)}
                    placeholder="Tell us what worked well, any edge cases you encountered, or ideas to make Trust Lens even better..."
                    className="w-full bg-[#080D1A] border border-slate-700/80 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 leading-relaxed resize-y"
                    disabled={fbLoading}
                  />
                </div>

                {fbError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{fbError}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-400 font-mono">
                    {user ? `Posting as ${user.fullName || user.email}` : 'Submitting anonymously'}
                  </span>

                  <button
                    type="submit"
                    disabled={fbLoading || !fbMessage.trim()}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 shadow-sm shadow-cyan-500/20 cursor-pointer transition-all"
                  >
                    {fbLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Feedback</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Recent Community Feedback Feed */}
            {recentFeedbacks.length > 0 && (
              <div className="pt-6 border-t border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Recent Community Inputs
                  </span>
                  <Link to="/feedback" className="text-xs font-mono text-cyan-400 hover:underline">
                    View All Community Notes →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recentFeedbacks.map((fb) => (
                    <div
                      key={fb.id}
                      className="p-3.5 rounded-lg bg-[#080D1A] border border-slate-800 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-cyan-400 text-[10px] uppercase">
                          {fb.category.replace('_', ' ')}
                        </span>
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {Array.from({ length: fb.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-300 leading-relaxed italic text-[11px] line-clamp-2">
                        "{fb.message}"
                      </p>
                      <span className="text-[10px] font-mono text-slate-500 block pt-1">
                        {new Date(fb.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 bg-gradient-to-b from-[#080D1A] to-[#040710] text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Received something that feels off?
          </h2>
          <p className="text-base text-slate-300 max-w-xl mx-auto">
            Take twenty seconds to verify suspicious messages, links, or media before entering passwords or sending funds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/analyze/message"
              className="px-6 py-3.5 rounded-lg text-sm font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer whitespace-nowrap"
            >
              Analyze Suspicious Text Now
            </Link>
            <Link
              to="/onboarding"
              className="px-6 py-3.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-700 transition-colors whitespace-nowrap"
            >
              Take First-Time Tutorial
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
