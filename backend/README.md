
# Flask Backend for Reddit Research Engine

## Setup Instructions

1. Create a virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up your environment variables:
Create a `.env` file in the backend directory with your API keys and configuration.

4. Run the Flask app:
```bash
python app.py
```

The backend will be available at `http://localhost:5001`

## API Endpoints

- `GET /health` - Health check endpoint
- `POST /search` - Streaming search endpoint (returns real-time updates)
- `POST /search_simple` - Simple search endpoint (returns final result only)

## Request Format

```json
{
  "query": "your search query here"
}
```

## Response Format

For streaming endpoint, responses are sent as Server-Sent Events (SSE).
For simple endpoint, response is a JSON object with the final result.
