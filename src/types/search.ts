export interface SearchResult {
  query: string;
  result: string;
  timestamp: Date;
}

export interface StreamingUpdate {
  type: 'chunk' | 'error' | 'update' | 'complete';
  data?: string;
  message?: string;
}

export interface ResearchReport {
  query: string;
  updates: string[];
  report: string;
  status: string;
}