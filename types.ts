
export interface PolicyAnalysis {
  similarityScore: number;
  isRepetitive: boolean;
  status: 'Safe' | 'Warning' | 'High Risk';
  policyViolations: string[];
  recommendations: string;
  visualSignature: string; 
  comparisonDetails: {
    composition: string;
    colors: string;
    subjectMatter: string;
    motionAnalysis: string;
  };
  historyCheck: {
    isSimilarToPast: boolean;
    matchedVideoIndex?: number; // Relative to the history context sent (1-based)
    details: string;
  };
}

export interface HistoryEntry {
  timestamp: number;
  visualSignature: string;
  previewThumbnail: string; // Base64 compressed image
}

export interface VideoFile {
  file: File;
  preview: string;
}
