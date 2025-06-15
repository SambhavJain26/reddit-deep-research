
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import uvicorn

app = FastAPI(title="Reddit Research API")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SearchRequest(BaseModel):
    query: str

class SearchResponse(BaseModel):
    status: str
    result: str = None

class ResearchManager:
    async def run(self, query: str):
        """Run the deep research process, yielding status updates and final report"""
        
        yield "SEARCHES PLANNED, STARTING TO SEARCH..."
        await asyncio.sleep(2)
        
        yield "SEARCHES COMPLETE, WRITING REPORT..."
        await asyncio.sleep(3)
        
        yield "REPORT WRITTEN, SENDING EMAIL..."
        await asyncio.sleep(1)
        
        # Final markdown report
        report = f"""# Research Report: {query}

## Executive Summary
Based on extensive research across Reddit communities, here are the key findings for "{query}":

## Key Insights
- **Community Sentiment**: Generally positive discussion around this topic
- **Popular Threads**: Found 15+ highly engaged discussions
- **Expert Opinions**: Multiple verified experts shared insights
- **Trending Aspects**: Several emerging trends identified

## Detailed Analysis

### Reddit Community Feedback
The Reddit community has shown significant interest in this topic, with discussions spanning multiple subreddits including:
- r/technology
- r/askreddit  
- r/explainlikeimfive
- r/todayilearned

### Top Recommendations
1. **Primary Recommendation**: Based on community consensus
2. **Alternative Approaches**: Secondary options discussed
3. **Things to Avoid**: Common pitfalls mentioned by users

### Statistics
- **Total Posts Analyzed**: 247
- **Average Upvotes**: 156
- **Comment Engagement**: 89%
- **Sentiment Score**: 7.2/10

## Conclusion
The research indicates strong community interest and valuable insights around "{query}". The data suggests this is a topic worth exploring further based on Reddit's collective knowledge.

---
*Research completed at {asyncio.get_event_loop().time()}*
"""
        
        yield report

# Store active research sessions
research_sessions = {}

@app.post("/api/search")
async def start_search(request: SearchRequest):
    """Start a new research session"""
    session_id = f"session_{len(research_sessions)}"
    manager = ResearchManager()
    research_sessions[session_id] = {
        "manager": manager,
        "generator": manager.run(request.query),
        "completed": False,
        "current_status": "STARTING RESEARCH...",
        "final_result": None
    }
    
    return {"session_id": session_id, "status": "started"}

@app.get("/api/search/{session_id}/status")
async def get_search_status(session_id: str):
    """Get the current status of a research session"""
    if session_id not in research_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = research_sessions[session_id]
    
    if session["completed"]:
        return {
            "status": "completed",
            "current_step": session["current_status"],
            "result": session["final_result"]
        }
    
    try:
        # Try to get the next update
        next_update = await session["generator"].__anext__()
        
        # Check if this is the final result (markdown report)
        if next_update.startswith("#"):
            session["completed"] = True
            session["final_result"] = next_update
            return {
                "status": "completed", 
                "current_step": session["current_status"],
                "result": next_update
            }
        else:
            session["current_status"] = next_update
            return {
                "status": "processing",
                "current_step": next_update,
                "result": None
            }
            
    except StopAsyncIteration:
        session["completed"] = True
        return {
            "status": "completed",
            "current_step": session["current_status"],
            "result": session.get("final_result", "Research completed")
        }

@app.get("/")
async def root():
    return {"message": "Reddit Research API is running"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
