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

// ==========================================
// FACT-CHECKING SYSTEM TYPES
// ==========================================

export type FactCheckVerdict = 'SUPPORTED' | 'CONTRADICTED' | 'UNVERIFIED' | 'MIXED';

export type ReputationTier =
  | 'wire_or_factchecker'
  | 'institutional_academic'
  | 'major_news'
  | 'general_web';

export interface SourceEvidence {
  id: string;
  url: string;
  title: string;
  snippet: string;
  contentExcerpt?: string;
  sourceType: 'search_snippet' | 'extracted_article';
  domain: string;
  publicationDate?: string | null;
  retrievedAt: string;
  rankScore: number;
  rankReasons: string[];
  isPrimarySource?: boolean;
  reputationTier: ReputationTier;
}

export interface ClaimCitation {
  sourceId: string;
  url: string;
  title: string;
  quoteOrEvidence: string;
}

export interface ExtractedClaim {
  id: string;
  claimText: string;
  searchQuery?: string;
  verdict: FactCheckVerdict;
  explanation: string;
  missingContext?: string | null;
  citations: ClaimCitation[];
  sourcesSearched: SourceEvidence[];
  searchStatus: 'SUCCESS' | 'NO_RESULTS' | 'FAILED';
}

export interface OverallAssessment {
  status: 'SUPPORTED' | 'CONTRADICTED' | 'UNVERIFIED' | 'MIXED' | 'INCOMPLETE';
  summary: string;
  totalClaims: number;
  supportedCount: number;
  contradictedCount: number;
  unverifiedCount: number;
  mixedCount: number;
  ruleApplied: string;
}

export interface FactCheckReport {
  id: string;
  inputType: 'text' | 'url';
  rawInput: string;
  extractedArticleTitle?: string;
  extractedArticleContent?: string;
  claims: ExtractedClaim[];
  overall: OverallAssessment;
  modelUsed: string;
  aiStatus: 'ACTIVE' | 'UNAVAILABLE' | 'ERROR';
  aiStatusMessage?: string;
  checkedAt: string;
  isDemoExample?: boolean;
  processingTimeMs?: number;
  warning?: string;
}

