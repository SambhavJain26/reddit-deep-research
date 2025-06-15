
// Search service to communicate with FastAPI Python backend

export interface SearchResult {
  query: string;
  result: string;
  timestamp: Date;
}

export interface SearchSession {
  session_id: string;
  status: string;
}

export interface SearchStatus {
  status: 'processing' | 'completed';
  current_step: string;
  result?: string;
}

class SearchService {
  private baseUrl: string;

  constructor() {
    // Python FastAPI backend URL - hardcoded for demo
    this.baseUrl = 'http://localhost:8000';
  }

  async search(query: string): Promise<{ sessionId: string; statusGenerator: AsyncGenerator<SearchStatus> }> {
    try {
      // Start the search session
      const response = await fetch(`${this.baseUrl}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`Failed to start search: ${response.statusText}`);
      }

      const session: SearchSession = await response.json();
      
      return {
        sessionId: session.session_id,
        statusGenerator: this.pollStatus(session.session_id)
      };
    } catch (error) {
      console.error('Search error:', error);
      throw new Error('Failed to perform search. Please try again.');
    }
  }

  private async *pollStatus(sessionId: string): AsyncGenerator<SearchStatus> {
    while (true) {
      try {
        const response = await fetch(`${this.baseUrl}/api/search/${sessionId}/status`);
        
        if (!response.ok) {
          throw new Error(`Failed to get status: ${response.statusText}`);
        }

        const status: SearchStatus = await response.json();
        yield status;

        if (status.status === 'completed') {
          break;
        }

        // Poll every 500ms
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Status polling error:', error);
        throw error;
      }
    }
  }
}

export const searchService = new SearchService();
