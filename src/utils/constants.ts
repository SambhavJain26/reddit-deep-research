export const API_CONFIG = {
  BASE_URL: (typeof process !== 'undefined' && process.env?.REACT_APP_BACKEND_URL) || 'http://localhost:5001',
  ENDPOINTS: {
    HEALTH: '/health',
    SEARCH: '/search',
    SEARCH_SIMPLE: '/search_simple'
  }
} as const;

export const SEARCH_CONFIG = {
  MAX_QUERY_LENGTH: 500,
  STEP_ANIMATION_DELAY: 2000,
  ANIMATION_TIMEOUT: 7000
} as const;

export const RESEARCH_STEPS = [
  "Planning searches",
  "Searching reddit", 
  "Writing report",
  "Finalizing"
] as const;