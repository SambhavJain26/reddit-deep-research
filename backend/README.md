
# Reddit Research Engine Backend

This Flask backend integrates with AI research agents to perform deep research queries on Reddit data.

## Complete Step-by-Step Setup Instructions

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)
- API keys for the agents library (OpenAI, etc.)

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Create Virtual Environment (Recommended)
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Set Up Environment Variables
Create a `.env` file in the backend directory with your API keys:
```bash
# Create .env file
touch .env

# Add your API keys (example):
# OPENAI_API_KEY=your_openai_api_key_here
# Add any other required environment variables
```

### Step 5: Run the Flask Server
```bash
python app.py
```

You should see output like:
```
* Running on http://0.0.0.0:5001
* Debug mode: on
```

### Step 6: Access the Frontend
1. The backend will be running on `http://localhost:5001`
2. Open your web browser and go to your frontend URL (usually `http://localhost:5173`)
3. The frontend should automatically connect to the backend
4. You should see a green status if the backend is connected properly

## How the Research Process Works

The backend integrates 4 main components:

1. **PlannerAgent** (`planner_agent.py`) - Plans search queries
2. **SearchAgent** (`search_agent.py`) - Searches Reddit posts
3. **WriterAgent** (`writer_agent.py`) - Writes the final report
4. **ResearchManager** (`research_manager.py`) - Orchestrates the entire process

### The 4-Step Process:
1. **Planning searches** - Agent plans what to search for
2. **Searching reddit** - Agent performs Reddit searches
3. **Writing report** - Agent writes comprehensive report
4. **Finalizing** - Final report is delivered

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

## Troubleshooting

### Backend Won't Start
- Check if Python is installed: `python --version`
- Ensure you're in the backend directory
- Make sure virtual environment is activated
- Check if all dependencies are installed: `pip list`

### Connection Issues
- Verify Flask is running on port 5001
- Check firewall settings
- Ensure frontend is trying to connect to the correct URL

### API Key Issues
- Make sure `.env` file is in the backend directory
- Verify API keys are correctly formatted
- Check if API keys have sufficient credits/permissions

## Development

To modify the research process:
- Edit agent instructions in respective agent files
- Modify the research flow in `research_manager.py`
- Update API endpoints in `app.py`

The backend uses async/await for efficient processing and supports real-time streaming of research progress to the frontend.
