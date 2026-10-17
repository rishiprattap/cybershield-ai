import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Link2, Image as ImageIcon, CheckCircle2, ArrowRight, ArrowLeft, Sparkles, Check, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ASSETS } from '../assets/images';

export const OnboardingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { completeOnboarding } = useAuth();

  const steps = [
    {
      title: 'Analyze Suspicious Messages',
      subtitle: 'Identify smishing, phishing, and psychological coercion',
      image: ASSETS.messageInspect,
      icon: Mail,
      content:
        'When you receive an urgent text, email, or chat prompting immediate password reset or payment, do not click. Copy the message text and paste it into the Message Threat Inspector. The engine analyzes linguistic urgency, impersonation cues, and credential requests.',
      tips: [
        'Watch out for artificial deadlines (e.g. "Action needed in 15 minutes").',
        'Look at the sender address carefully, not just the display name.',
        'Never forward one-time authorization passcodes to any caller.'
      ]
    },
    {
      title: 'Investigate Suspicious URLs',
      subtitle: 'Inspect domains safely without opening links in your browser',
      image: ASSETS.urlScanner,
      icon: Link2,
      content:
        'Attackers often disguise malicious websites using lookalike characters (typosquatting) or deceptive subdomains like "chase.com.fraud-alert.ru". Submit any link to the URL Scanner. Our SSRF-safe sandbox dissects the apex host without exposing your device to drive-by scripts.',
      tips: [
        'Examine the apex domain right before the first forward slash.',
        'Avoid clicking unprompted shortlinks (bit.ly, tinyurl) sent by unknown contacts.',
        'Look for legitimate HTTPS certificates on corporate login forms.'
      ]
    },
    {
      title: 'Examine Images & Digital Media',
      subtitle: 'Forensic integrity check for synthetic generation vs tampering',
      image: ASSETS.imageAnalysis,
      icon: ImageIcon,
      content:
        'With generative AI and photo editing tools widespread, verify unverified badges, profile photos, and documents. Our forensic tool differentiates between synthetic AI generation likelihood and localized photo tampering/splicing.',
      tips: [
        'AI generation estimates assess whether diffusion models rendered the image.',
        'Photo tampering detection inspects clone-stamped or spliced pixels.',
        'Compression artifacts on social media can mask subtle clues.'
      ]
    },
    {
      title: 'Understand Risk Classifications',
      subtitle: 'Transparent evidence and calibrated uncertainty',
      image: ASSETS.hero,
      icon: Shield,
      content:
        'Trust Lens assigns clear labels: Supported, Contradicted, Mixed, or Unverified. We provide the specific indicators observed and transparently explain what cannot be determined without deeper evidence, rather than inventing false certainty.',
      tips: [
        'A "Lower Observed Risk" label is not a guarantee that a novel zero-day is absent.',
        '"Inconclusive" results suggest seeking independent confirmation.',
        'Review the documented evidence before deciding your next move.'
      ]
    },
    {
      title: 'Take Safer Digital Action',
      subtitle: 'Turn threat intelligence into proactive defense',
      image: ASSETS.academy,
      icon: Lock,
      content:
        'Knowledge without action is vulnerable. If an item tests as High Risk, block the sender, alert your organization, report the phishing attempt, and change passwords using an independent browser tab. You now have the tools to browse with confidence.',
      tips: [
        'Use password managers and unique credentials for every service.',
        'Activate app-based multi-factor authentication (TOTP) everywhere.',
        'Reach out to our integrated AI Assistant anytime you have a question.'
      ]
    }
  ];

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      await completeOnboarding();
      navigate('/dashboard');
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
    navigate('/dashboard');
  };

  const stepData = steps[currentStep];
  const StepIcon = stepData.icon;

  return (
    <div className="min-h-screen bg-[#080D1A] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-4xl w-full bg-[#0E172B] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Top Progress Bar */}
        <div className="p-6 bg-[#121B32] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="font-display text-sm font-bold text-white block">
                Welcome to Trust Lens
              </span>
              <span className="text-[11px] font-mono text-cyan-400">
                Step {currentStep + 1} of {steps.length} · Interactive Onboarding
              </span>
            </div>
          </div>

          <button
            onClick={handleSkip}
            className="text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Skip Tutorial →
          </button>
        </div>

        {/* Step Indicator Circles */}
        <div className="px-6 pt-4 flex items-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i <= currentStep ? 'bg-cyan-400' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Step Body */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center flex-1">
          
          {/* Visual column */}
          <div className="md:col-span-5 relative">
            <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#080D1A] shadow-md">
              <img
                src={stepData.image}
                alt={stepData.title}
                className="w-full h-56 md:h-64 object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Description column */}
          <div className="md:col-span-7 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
              <StepIcon className="w-4 h-4" />
              <span>{stepData.subtitle}</span>
            </div>

            <h2 className="font-display text-2xl font-bold text-white tracking-tight">
              {stepData.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {stepData.content}
            </p>

            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-mono uppercase text-slate-400 block font-semibold">
                Key Defensive Practice:
              </span>
              {stepData.tips.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Navigation Controls */}
        <div className="p-6 bg-[#0B1224] border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
          >
            {currentStep === steps.length - 1 ? (
              <>
                <Check className="w-4 h-4" />
                <span>Finish Tutorial & Go to Dashboard</span>
              </>
            ) : (
              <>
                <span>Next Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
