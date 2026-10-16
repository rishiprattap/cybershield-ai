import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image as ImageIcon, Upload, RefreshCw, AlertCircle, CheckCircle2, ArrowRight, Eye, ShieldAlert, Cpu, Sparkles } from 'lucide-react';
import { AnalysisResult } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { ScoreGauge } from '../components/ScoreGauge';
import { useAuth } from '../context/AuthContext';
import { ASSETS } from '../assets/images';

export const ImageAnalysisPage: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const sampleLibrary = [
    {
      title: 'Deepfake Facial Forensic Test',
      filename: 'ai_synthesized_portrait.jpg',
      image: ASSETS.imageAnalysis,
      desc: 'Synthetic diffusion cues, pupil asymmetry, and micro-texture boundaries.',
    },
    {
      title: 'Digital Tampering & Splicing',
      filename: 'security_badge_tampered.jpg',
      image: ASSETS.messageInspect,
      desc: 'Localized text interpolation and clone stamp edges in credential overlay.',
    },
    {
      title: 'Authentic Photographic Capture',
      filename: 'authentic_event_photo.jpg',
      image: ASSETS.academy,
      desc: 'Uniform optical lens dispersion, natural sensor grain, consistent lighting vector.',
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please upload a valid JPEG, PNG, or WebP image.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError('File size must be under 15MB.');
      return;
    }

    setError(null);
    setFileName(file.name);
    setMimeType(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample: typeof sampleLibrary[0]) => {
    setSelectedImage(sample.image);
    setFileName(sample.filename);
    setMimeType('image/jpeg');
    setError(null);
    runAnalysis(sample.image, sample.filename, 'image/jpeg');
  };

  const runAnalysis = async (base64Img: string, name: string, mime: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Img,
          mimeType: mime,
          filename: name,
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to inspect image.');
      }

      const data: AnalysisResult = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Image analysis encountered an error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080D1A] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-cyan-400">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Forensic Engine · Image Authenticity & Manipulation</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Image Authenticity & Splicing Detector
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
            Examine digital images for synthetic generative cues and localized photo tampering. We treat AI-generation likelihood and image manipulation as distinct forensic questions.
          </p>
        </div>

        {/* Quick Sample Library */}
        <div className="space-y-2">
          <span className="text-xs font-mono text-slate-400 block uppercase tracking-wider">
            Quick Forensic Samples (Click to load & analyze)
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {sampleLibrary.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSample(sample)}
                className="text-left p-3 rounded-lg bg-[#0E172B] hover:bg-[#131F3A] border border-slate-800 hover:border-cyan-500/40 transition-colors group flex items-start gap-3 cursor-pointer"
              >
                <img
                  src={sample.image}
                  alt={sample.title}
                  className="w-16 h-16 rounded object-cover shrink-0 border border-slate-700"
                  referrerPolicy="no-referrer"
                />
                <div className="overflow-hidden">
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 block truncate">
                    {sample.title}
                  </span>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                    {sample.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Upload Box */}
        <div className="bg-[#0D1527] border border-slate-800 rounded-xl p-6 space-y-4 shadow-xl">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />

          {!selectedImage ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700/80 hover:border-cyan-400/60 rounded-xl p-8 text-center cursor-pointer transition-colors bg-[#080D1A]/50 hover:bg-[#0A1122] flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-200 block">
                  Click to browse or drag & drop an image file
                </span>
                <span className="text-xs text-slate-400 mt-1 block">
                  Supports JPEG, PNG, or WebP up to 15MB
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-6 items-center p-4 rounded-lg bg-[#080D1A] border border-slate-800">
                <div className="relative w-40 h-40 rounded-lg overflow-hidden border border-slate-700 shrink-0 bg-slate-950">
                  <img
                    src={selectedImage}
                    alt="Upload Preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-cyan-500/5 pointer-events-none" />
                </div>

                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                      Target File Active
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null);
                        setResult(null);
                        setFileName('');
                      }}
                      className="text-xs text-slate-400 hover:text-rose-400"
                    >
                      Remove
                    </button>
                  </div>
                  <h3 className="font-display text-base font-bold text-white truncate max-w-md">
                    {fileName || 'selected_image.jpg'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    MIME: <span className="font-mono text-slate-300">{mimeType}</span> · Ready for forensic pixel inspection.
                  </p>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 rounded border border-slate-700"
                    >
                      Replace Image
                    </button>
                    <button
                      type="button"
                      onClick={() => runAnalysis(selectedImage, fileName, mimeType)}
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-md shadow-cyan-500/20"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Scanning Pixels...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Run Image Analysis</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 font-mono">
            <span>Client-side base64 stream · No raw images saved permanently</span>
            <span>Gemini Vision Forensics</span>
          </div>
        </div>

        {/* Live Forensic Result View */}
        {result && (
          <div className="bg-[#0E172B] border border-slate-800 rounded-xl overflow-hidden shadow-2xl space-y-6 animate-in fade-in duration-300">
            {/* Header banner */}
            <div className="p-6 bg-[#131F3B] border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <RiskBadge level={result.riskLevel} size="lg" />
                  <span className="text-xs font-mono text-slate-400">
                    ID: {result.id}
                  </span>
                </div>
                <h2 className="font-display text-xl font-bold text-white">
                  {result.title}
                </h2>
                <p className="text-sm font-medium text-cyan-300">
                  {result.verdict}
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <ScoreGauge score={result.score} riskLevel={result.riskLevel} size="md" />
              </div>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Dual Forensics: AI-Generation vs Image Manipulation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Metric 1: AI Generation Likelihood */}
                <div className="p-5 rounded-lg bg-[#080D1A] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                      <Cpu className="w-4 h-4" />
                      AI Generation Likelihood
                    </span>
                    <span className="font-mono text-lg font-bold tabular-nums text-white">
                      {result.technicalDetails?.aiGenerationLikelihood ?? 30}%
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-700"
                      style={{ width: `${result.technicalDetails?.aiGenerationLikelihood ?? 30}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Estimated probability that synthetic diffusion algorithms (Midjourney, Stable Diffusion, Flux, DALL-E) synthesized this subject.
                  </p>
                </div>

                {/* Metric 2: Photo Manipulation & Splicing */}
                <div className="p-5 rounded-lg bg-[#080D1A] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      Photo Tampering / Splicing
                    </span>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded uppercase text-white bg-slate-800">
                      {result.technicalDetails?.manipulationEvidenceDetected ? 'DETECTED' : 'NOT DETECTED'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono">
                    {result.technicalDetails?.manipulationDetails || 'Uniform pixel gradient detected across inspected sectors.'}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Analyzes whether parts of an authentic photograph were retouched, cloned, spliced, or digitally altered after camera capture.
                  </p>
                </div>

              </div>

              {/* Summary */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                  Forensic Observation Summary
                </h3>
                <p className="text-sm text-slate-200 leading-relaxed bg-[#080D1A] p-4 rounded-lg border border-slate-800/80">
                  {result.summary}
                </p>
              </div>

              {/* Observed Diagnostic Indicators */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Forensic Diagnostic Markers
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {result.indicators.map((ind, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-lg bg-[#080D1A] border border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">
                          {ind.title}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase ${
                            ind.severity === 'high'
                              ? 'text-rose-400 bg-rose-500/10'
                              : ind.severity === 'warning'
                              ? 'text-amber-400 bg-amber-500/10'
                              : 'text-slate-400 bg-slate-800'
                          }`}
                        >
                          {ind.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {ind.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Advice */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Recommended Verification Steps
                </h3>
                <div className="space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-lg bg-[#080D1A] border border-slate-800/80 text-xs text-slate-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Uncertainty Explanation */}
              <div className="p-4 rounded-lg bg-[#0A1020] border border-slate-800/80 text-xs text-slate-400 space-y-1">
                <strong className="text-slate-300 block">Forensic Limits & Transparency:</strong>
                <p className="leading-relaxed">{result.uncertaintyExplanation}</p>
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
                <button
                  onClick={() => navigate(`/feedback?analysisId=${result.id}`)}
                  className="text-xs font-medium text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  Report Model Accuracy Feedback
                </button>

                <button
                  onClick={() => navigate(`/results/${result.id}`)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 font-mono"
                >
                  <span>Open Dedicated Result Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
