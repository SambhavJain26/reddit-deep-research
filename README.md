
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
│   ├── requirements.txt       # Python dependencies
│   └── README.md              # Backend-specific documentation
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
- Node.js (v16 or higher)
- Python 3.8 or higher
- pip (Python package installer)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd reddit-research-engine
```

### 2. Set Up the Frontend
```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```
The React app will be available at `http://localhost:5173`

### 3. Set Up the Backend
```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
# Create a .env file and add your API keys:
# OPENAI_API_KEY=your_openai_api_key_here

# Start the Flask server
python app.py
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
Create a `.env` file in the backend directory:
```bash
OPENAI_API_KEY=your_openai_api_key_here
# Add other API keys as needed
```

### Frontend Configuration
Create a `.env` file in the root directory:
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

## Development

### Adding New Features
- **Frontend**: Add components in `src/components/` or pages in `src/pages/`
- **Backend**: Modify agents in respective files or update the research flow in `research_manager.py`

### Customizing Research Agents
Each agent can be customized by editing their respective files:
- `planner_agent.py` - Modify search planning logic
- `search_agent.py` - Update Reddit search strategies  
- `writer_agent.py` - Customize report generation

## Troubleshooting

### Backend Issues
- Ensure Python 3.8+ is installed
- Verify virtual environment is activated
- Check that all dependencies are installed: `pip list`
- Confirm API keys are set in `.env` file

### Frontend Issues
- Verify Node.js 16+ is installed
- Clear browser cache and reload
- Check browser console for errors
- Ensure backend is running on port 5001

### Connection Issues
- Verify Flask server is running on `http://localhost:5001`
- Check firewall settings
- Ensure CORS is properly configured

## Deployment

### Frontend
```bash
npm run build
# Deploy the `dist` folder to your hosting platform
```

### Backend
```bash
# For production, consider using gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5001 app:app
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
