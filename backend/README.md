
# Reddit Research Python Backend

This is a demo FastAPI backend that simulates the ResearchManager functionality.

## Setup

1. Install Python dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Run the FastAPI server:
```bash
python app.py
```

The API will be available at `http://localhost:8000`

## API Endpoints

- `POST /api/search` - Start a new research session
- `GET /api/search/{session_id}/status` - Get current status of research session
- `GET /` - Health check

## Testing

You can test the API directly:
```bash
curl -X POST "http://localhost:8000/api/search" -H "Content-Type: application/json" -d '{"query": "best programming languages 2024"}'
```

## Integration

The React frontend will automatically connect to this backend when both are running.
