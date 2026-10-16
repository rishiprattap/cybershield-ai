export type RiskLevel = 'HIGH' | 'SUSPICIOUS' | 'LOW' | 'INCONCLUSIVE';

export type AnalysisType = 'message' | 'url' | 'image';

export interface ThreatIndicator {
  title: string;
  severity: 'high' | 'warning' | 'info';
  description: string;
}

export interface AnalysisResult {
  id: string;
  userId?: string;
  type: AnalysisType;
  target: string;
  title?: string;
  riskLevel: RiskLevel;
  score: number; // 0 - 100, where 100 is most severe/highest risk
  verdict: string;
  summary: string;
  indicators: ThreatIndicator[];
  uncertaintyExplanation: string;
  recommendations: string[];
  technicalDetails?: {
    model: string;
    timestamp: string;
    checksPerformed: string[];
    aiGenerationLikelihood?: number | null; // 0 - 100%
    manipulationEvidenceDetected?: boolean;
    manipulationDetails?: string;
    redirectHops?: number;
    domainTrustScore?: number;
    suspiciousKeywords?: string[];
    ssrfSafe?: boolean;
  };
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  onboardingCompleted: boolean;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface FeedbackItem {
  id: string;
  userId?: string;
  analysisId?: string;
  category: 'incorrect_result' | 'false_positive' | 'missed_threat' | 'image_concern' | 'chatbot' | 'usability' | 'feature_request' | 'general';
  rating: number;
  message: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  suggestedFollowUps?: string[];
}
