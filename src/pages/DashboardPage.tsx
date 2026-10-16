import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Mail,
  Link2,
  Image as ImageIcon,
  Sparkles,
  BookOpen,
  RefreshCw,
  User,
  HelpCircle,
  Star,
  Send,
  CheckCircle2,
  MessageSquareQuote,
  AlertCircle,
} from 'lucide-react';
import { AnalysisResult, FeedbackItem } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedRisk, setSelectedRisk] = useState('all');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // In-Dashboard Feedback Form States
  const [fbCategory, setFbCategory] = useState<FeedbackItem['category']>('general');
  const [fbRating, setFbRating] = useState<number>(5);
  const [fbMessage, setFbMessage] = useState('');
  const [fbAnalysisId, setFbAnalysisId] = useState('');
  const [fbLoading, setFbLoading] = useState(false);
  const [fbSuccess, setFbSuccess] = useState(false);
  const [fbError, setFbError] = useState<string | null>(null);

  const fetchAnalyses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedType !== 'all') params.append('type', selectedType);
      if (selectedRisk !== 'all') params.append('risk', selectedRisk);
      if (search.trim()) params.append('search', search.trim());

      const res = await fetch(`/api/analyses?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAnalyses(data);
      }
    } catch (err) {
      console.error('Failed to load user analyses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, [selectedType, selectedRisk]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAnalyses();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this analysis record?')) return;
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/analyses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAnalyses((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error('Error deleting analysis:', err);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Permanently purge all your analysis history? This action cannot be undone.')) return;
    try {
      const res = await fetch('/api/analyses', { method: 'DELETE' });
      if (res.ok) {
        setAnalyses([]);
      }
    } catch (err) {
      console.error('Error purging history:', err);
    }
  };

  const handleDashboardFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbMessage.trim()) {
      setFbError('Please provide your feedback observation.');
      return;
    }
    setFbLoading(true);
    setFbError(null);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          analysisId: fbAnalysisId.trim() || undefined,
          category: fbCategory,
          rating: fbRating,
          message: fbMessage.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit feedback.');
      }

      setFbSuccess(true);
      setFbMessage('');
      setFbAnalysisId('');
    } catch (err: any) {
      setFbError(err.message || 'Error submitting feedback.');
    } finally {
      setFbLoading(false);
    }
  };

  // Real statistics derived directly from active records
  const total = analyses.length;
  const highRisk = analyses.filter((a) => a.riskLevel === 'HIGH').length;
  const suspicious = analyses.filter((a) => a.riskLevel === 'SUSPICIOUS').length;
  const lowerRisk = analyses.filter((a) => a.riskLevel === 'LOW').length;

  return (
    <div className="min-h-screen bg-[#080D1A] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Cyber Threat Command Center</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Welcome!
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Manage previous investigations, monitor threat telemetry, and review safety guidance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/onboarding"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-700/80 rounded-lg transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>Revisit Tutorial</span>
            </Link>

            <Link
              to="/analyze/message"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm shadow-cyan-500/20 transition-all whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>New Analysis</span>
            </Link>
          </div>
        </div>

        {/* Real Statistics Metric Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-[#0E172B] border border-slate-800 space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Total Inspected
            </span>
            <span className="font-mono text-2xl font-bold text-white tabular-nums block">
              {total}
            </span>
            <span className="text-[10px] text-slate-400">Filtered analysis dossiers</span>
          </div>

          <div className="p-5 rounded-xl bg-[#0E172B] border border-slate-800 space-y-1">
            <span className="text-[11px] font-mono text-rose-400 uppercase tracking-wider block flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              High Risk Flagged
            </span>
            <span className="font-mono text-2xl font-bold text-rose-400 tabular-nums block">
              {highRisk}
            </span>
            <span className="text-[10px] text-slate-400">Malicious threats isolated</span>
          </div>

          <div className="p-5 rounded-xl bg-[#0E172B] border border-slate-800 space-y-1">
            <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider block flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Suspicious Items
            </span>
            <span className="font-mono text-2xl font-bold text-amber-300 tabular-nums block">
              {suspicious}
            </span>
            <span className="text-[10px] text-slate-400">Anomalous or deceptive signals</span>
          </div>

          <div className="p-5 rounded-xl bg-[#0E172B] border border-slate-800 space-y-1">
            <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Lower Observed Risk
            </span>
            <span className="font-mono text-2xl font-bold text-emerald-400 tabular-nums block">
              {lowerRisk}
            </span>
            <span className="text-[10px] text-slate-400">Heuristically nominal entries</span>
          </div>
        </div>

        {/* Quick Launch Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/analyze/message"
            className="p-4 rounded-xl bg-[#0B1324] hover:bg-[#101B33] border border-slate-800/80 hover:border-cyan-500/40 transition-colors flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block group-hover:text-cyan-300">
                  Inspect Text & Email
                </span>
                <span className="text-[11px] text-slate-400">Phishing & urgency triggers</span>
              </div>
            </div>
            <span className="text-xs font-mono text-cyan-400">Launch →</span>
          </Link>

          <Link
            to="/analyze/url"
            className="p-4 rounded-xl bg-[#0B1324] hover:bg-[#101B33] border border-slate-800/80 hover:border-cyan-500/40 transition-colors flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Link2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block group-hover:text-cyan-300">
                  Scan Link or Domain
                </span>
                <span className="text-[11px] text-slate-400">Typosquatting & redirects</span>
              </div>
            </div>
            <span className="text-xs font-mono text-cyan-400">Launch →</span>
          </Link>

          <Link
            to="/analyze/image"
            className="p-4 rounded-xl bg-[#0B1324] hover:bg-[#101B33] border border-slate-800/80 hover:border-cyan-500/40 transition-colors flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block group-hover:text-cyan-300">
                  Verify Image Integrity
                </span>
                <span className="text-[11px] text-slate-400">Synthetic AI & splicing check</span>
              </div>
            </div>
            <span className="text-xs font-mono text-cyan-400">Launch →</span>
          </Link>
        </div>

        {/* History Table Container */}
        <div className="bg-[#0E172B] border border-slate-800 rounded-xl overflow-hidden shadow-xl space-y-4 p-6">
          
          {/* Search and Filters Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search dossiers by target, domain, verdict..."
                className="w-full bg-[#080D1A] border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </form>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Type filter */}
              <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                {['all', 'message', 'url', 'image'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    className={`px-2.5 py-1 rounded text-xs font-medium capitalize transition-colors cursor-pointer ${
                      selectedType === t
                        ? 'bg-cyan-500 text-slate-950 font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Risk filter */}
              <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                {['all', 'HIGH', 'SUSPICIOUS', 'LOW'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedRisk(r)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                      selectedRisk === r
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {r === 'all' ? 'All Risks' : r}
                  </button>
                ))}
              </div>

              {analyses.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="p-2 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Purge all records"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>

          {/* Table of Analyses */}
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Querying database records...</span>
            </div>
          ) : analyses.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white">No Analyses Match Criteria</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Try clearing your search filters, or launch your first threat inspection now.
                </p>
              </div>
              <Link
                to="/analyze/message"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm"
              >
                <span>Start New Analysis</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Engine / Target</th>
                    <th className="py-3 px-4">Classification</th>
                    <th className="py-3 px-4 text-right">Threat Idx</th>
                    <th className="py-3 px-4">Findings Verdict</th>
                    <th className="py-3 px-4 text-right">Timestamp</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {analyses.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-800/30 transition-colors group"
                    >
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="p-1.5 rounded bg-slate-900 border border-slate-800 text-cyan-400 shrink-0">
                            {item.type === 'message' && <Mail className="w-3.5 h-3.5" />}
                            {item.type === 'url' && <Link2 className="w-3.5 h-3.5" />}
                            {item.type === 'image' && <ImageIcon className="w-3.5 h-3.5" />}
                          </span>
                          <div className="overflow-hidden">
                            <span className="font-semibold text-white block truncate">
                              {item.title || item.target}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400 truncate block">
                              {item.target}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <RiskBadge level={item.riskLevel} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums text-slate-200">
                        {item.score}/100
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-slate-300 truncate" title={item.verdict}>
                          {item.verdict}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-slate-400 whitespace-nowrap text-[11px]">
                        {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/results/${item.id}`)}
                            className="p-1 text-slate-400 hover:text-cyan-400 rounded transition-colors"
                            title="View Full Dossier"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={isDeleting === item.id}
                            className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

        {/* In-Dashboard Feedback & Accuracy Reporting Form */}
        <div className="bg-[#0E172B] border border-slate-800 rounded-xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
                <MessageSquareQuote className="w-3.5 h-3.5" />
                <span>Analyst Feedback & Continuous Calibration</span>
              </div>
              <h3 className="font-display text-lg font-bold text-white">
                Submit Detection Feedback & Accuracy Observations
              </h3>
              <p className="text-xs text-slate-400">
                Help tune threat classification boundaries, report false positives on verified links, or suggest heuristic adjustments.
              </p>
            </div>

            <Link
              to="/feedback"
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0"
            >
              Open Dedicated Feedback Center →
            </Link>
          </div>

          {fbSuccess ? (
            <div className="p-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-white">Feedback Logged Successfully</h4>
                <p className="text-xs text-slate-300">
                  Your observation has been committed to the security database and will be reviewed during model calibration.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFbSuccess(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded cursor-pointer transition-colors"
              >
                Submit Additional Note
              </button>
            </div>
          ) : (
            <form onSubmit={handleDashboardFeedback} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-medium text-slate-300 block">
                    Category:
                  </label>
                  <select
                    value={fbCategory}
                    onChange={(e) => setFbCategory(e.target.value as any)}
                    className="w-full bg-[#080D1A] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="false_positive">False Positive (Benign item flagged)</option>
                    <option value="missed_threat">Missed Threat (Evasive link or text)</option>
                    <option value="incorrect_result">Incorrect Risk Level Assigned</option>
                    <option value="image_concern">Image Forensic Ambiguity</option>
                    <option value="chatbot">AI Chatbot Answer Feedback</option>
                    <option value="usability">Dashboard or Scanner Usability</option>
                    <option value="feature_request">Feature Request / Enhancement</option>
                    <option value="general">General Analyst Comment</option>
                  </select>
                </div>

                {/* Rating */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-medium text-slate-300 block">
                    Detection Accuracy Rating:
                  </label>
                  <div className="flex items-center gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFbRating(star)}
                        className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                        title={`${star} Star`}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            star <= fbRating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-mono text-slate-400 ml-2">
                      {fbRating}/5
                    </span>
                  </div>
                </div>

                {/* Reference ID */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-medium text-slate-300 block">
                    Dossier ID Reference (Optional):
                  </label>
                  <input
                    type="text"
                    value={fbAnalysisId}
                    onChange={(e) => setFbAnalysisId(e.target.value)}
                    placeholder="e.g. cs-analysis-101"
                    className="w-full bg-[#080D1A] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-slate-300 block">
                  Detailed Findings or Comments:
                </label>
                <textarea
                  rows={3}
                  value={fbMessage}
                  onChange={(e) => setFbMessage(e.target.value)}
                  placeholder="Share details regarding the scan accuracy, unexpected signals, or suggested heuristic enhancements..."
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
                <span className="text-[11px] font-mono text-slate-500">
                  Submitting as: {user?.fullName || user?.email || 'Anonymous Analyst'}
                </span>

                <button
                  type="submit"
                  disabled={fbLoading || !fbMessage.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 shadow-sm shadow-cyan-500/20 cursor-pointer transition-all"
                >
                  {fbLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Observation</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
