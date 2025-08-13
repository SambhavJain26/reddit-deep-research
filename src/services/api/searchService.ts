// Search service to communicate with Flask backend
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

class SearchService {
  private baseUrl: string;

  constructor() {
    // Flask backend URL - update this to match your Flask server
    this.baseUrl = (typeof process !== 'undefined' && process.env?.REACT_APP_BACKEND_URL) || 'http://localhost:5001';
  }

  async search(query: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/search_simple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.report || data.result || 'No results found';
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  async *searchStreaming(query: string): AsyncGenerator<string, void, unknown> {
    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonStr = line.slice(6); // Remove 'data: ' prefix
                if (jsonStr.trim()) {
                  const parsed = JSON.parse(jsonStr) as StreamingUpdate;
                  
                  if (parsed.type === 'update' && parsed.message) {
                    yield parsed.message;
                  } else if (parsed.type === 'complete') {
                    return;
                  } else if (parsed.type === 'error') {
                    throw new Error(parsed.message || 'Unknown error');
                  }
                }
              } catch (parseError) {
                console.warn('Failed to parse chunk:', line, parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Streaming search error:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

export const searchService = new SearchService();