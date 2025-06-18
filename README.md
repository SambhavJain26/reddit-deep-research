
# Reddit Research Engine

A powerful AI-driven research tool that analyzes Reddit data to provide comprehensive insights. The system uses a React frontend with a Flask backend powered by intelligent research agents.

## Project Structure

```
reddit-research-engine/
├── src/
│   ├── pages/
│   │   └── Index.tsx          # Main search interface
│   ├── services/
│   │   └── searchService.ts   # Backend communication service
│   └── ...                    # Other React components and utilities
├── backend/
│   ├── app.py                 # Flask API server
│   ├── research_manager.py    # Orchestrates the research process
│   ├── planner_agent.py       # Plans search queries
│   ├── search_agent.py        # Performs Reddit searches
│   ├── writer_agent.py        # Generates final reports
│   └── README.md              # Backend-specific documentation
├── pyproject.toml             # Python dependencies and project config
└── README.md                  # This file
```

## Features

- **AI-Powered Research**: Uses multiple specialized agents for comprehensive analysis
- **Real-time Streaming**: Live progress updates during research
- **Dark Theme**: Clean, minimal interface optimized for readability
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Error Handling**: Robust error handling with user-friendly messages
- **Health Monitoring**: Backend connectivity status indicators

## Quick Start

### Prerequisites
- **uv** (Python package manager) - [Installation Guide](https://docs.astral.sh/uv/getting-started/installation/)
- **Node.js** (v16 or higher)
- **Python** 3.12 or higher (managed by uv)

### 1. Install uv
First, install uv following the instructions at: https://docs.astral.sh/uv/getting-started/installation/

For most systems:
```bash
# macOS and Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### 2. Clone the Repository
```bash
git clone <your-repo-url>
cd reddit-research-engine
```

### 3. Set Up Python Dependencies
```bash
# Install all Python dependencies with uv
uv sync
```
This will automatically create a virtual environment and install all dependencies from `pyproject.toml`.

### 4. Set Up the Frontend
```bash
# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```
The React app will be available at `http://localhost:5173`

### 5. Set Up Environment Variables
Create a `.env` file in the project root:
```bash
# Required API keys
OPENAI_API_KEY=your_openai_api_key_here
# Add other API keys as needed
```

### 6. Start the Backend
```bash
# Run the Flask server using uv
uv run backend/app.py
```
The backend will be available at `http://localhost:5001`

## How It Works

The research process involves 4 intelligent agents working together:

### 1. Planning Phase
The **PlannerAgent** analyzes your query and determines the best search strategies for Reddit.

### 2. Search Phase  
The **SearchAgent** performs targeted searches across Reddit using the planned queries.

### 3. Analysis Phase
The **WriterAgent** synthesizes all search results into a comprehensive report.

### 4. Delivery Phase
The final markdown report is streamed back to the frontend in real-time.

## API Endpoints

- `GET /health` - Backend health check
- `POST /search` - Streaming research endpoint with real-time updates
- `POST /search_simple` - Non-streaming endpoint for basic testing

### Request Format
```json
{
  "query": "your research question here"
}
```

### Response Format (Streaming)
```
data: {"type": "chunk", "data": "Planning searches..."}
data: {"type": "chunk", "data": "Searching reddit..."}
data: {"type": "chunk", "data": "# Final Report\n\nYour research results..."}
```

## Configuration

### Environment Variables
Create a `.env` file in the project root:
```bash
OPENAI_API_KEY=your_openai_api_key_here
# Add other API keys as needed
```

### Frontend Configuration
Create a `.env` file in the root directory (if different from backend):
```bash
REACT_APP_BACKEND_URL=http://localhost:5001
```

## Technologies Used

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Lucide React** for icons
- **React Markdown** for report rendering

### Backend
- **Flask** web framework
- **AI Agents** library for intelligent research
- **asyncio** for concurrent processing
- **CORS** for cross-origin requests
- **uv** for dependency management

## Development

### Adding New Features
- **Frontend**: Add components in `src/components/` or pages in `src/pages/`
- **Backend**: Modify agents in respective files or update the research flow in `research_manager.py`

### Adding Python Dependencies
```bash
# Add a new dependency
uv add package-name

# Add a development dependency
uv add --dev package-name
```

### Customizing Research Agents
Each agent can be customized by editing their respective files:
- `planner_agent.py` - Modify search planning logic
- `search_agent.py` - Update Reddit search strategies  
- `writer_agent.py` - Customize report generation

## Troubleshooting

### Backend Issues
- Ensure uv is installed: `uv --version`
- Verify virtual environment: `uv sync` in project directory
- Check that API keys are set in `.env` file
- Run with verbose output: `uv run --verbose backend/app.py`

### Frontend Issues
- Verify Node.js 16+ is installed: `node --version`
- Clear browser cache and reload
- Check browser console for errors
- Ensure backend is running on port 5001

### Connection Issues
- Verify Flask server is running on `http://localhost:5001`
- Check firewall settings
- Ensure CORS is properly configured
- Test backend health: `curl http://localhost:5001/health`

### Dependency Issues
- Recreate environment: `uv sync --reinstall`
- Check Python version: `uv python list`
- Update dependencies: `uv sync --upgrade`

## Deployment

### Frontend
```bash
npm run build
# Deploy the `dist` folder to your hosting platform
```

### Backend
```bash
# For production, consider using gunicorn
uv add gunicorn
uv run gunicorn -w 4 -b 0.0.0.0:5001 backend.app:app
```

## Project Dependencies

The project uses `pyproject.toml` for Python dependency management with uv. Key dependencies include:

- **AI & ML**: anthropic, openai, langchain, langgraph
- **Web Framework**: flask, flask-cors
- **Data Processing**: requests, bs4, lxml, pypdf
- **Development Tools**: gradio, ipywidgets, ipykernel

## Contributing

1. Fork the repository
2. Create a feature branch
3. Install dependencies: `uv sync`
4. Make your changes
5. Test thoroughly
6. Submit a pull request

## License

This project is open source and available under the MIT License.
