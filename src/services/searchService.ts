
// Search service to communicate with Flask backend
export interface SearchResult {
  query: string;
  result: string;
  timestamp: Date;
}

export interface StreamingUpdate {
  type: 'chunk' | 'error';
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
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Search error:', error);
      throw new Error('Failed to perform search. Please try again.');
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
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          
          // Process complete lines
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer
          
          for (const line of lines) {
            if (line.trim() === '') continue;
            
            if (line.startsWith('data: ')) {
              try {
                const jsonStr = line.slice(6); // Remove 'data: ' prefix
                const parsed: StreamingUpdate = JSON.parse(jsonStr);
                
                if (parsed.type === 'chunk' && parsed.data) {
                  yield parsed.data;
                } else if (parsed.type === 'error') {
                  throw new Error(parsed.message || 'Unknown error occurred');
                }
              } catch (parseError) {
                console.warn('Failed to parse streaming data:', parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Streaming search error:', error);
      throw new Error('Failed to perform streaming search. Please try again.');
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
