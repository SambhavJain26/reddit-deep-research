from pydantic import BaseModel, Field
from agent_base import Agent

HOW_MANY_SEARCHES = 3

# Optimized prompt - more concise, direct instructions
INSTRUCTIONS = f"""Create {HOW_MANY_SEARCHES} Reddit search queries for the given topic.

For each search:
- Focus on different aspects/angles
- Use "site:reddit.com" prefix
- Target specific subreddits when relevant
- Keep queries 2-4 words

Output JSON only."""

class WebSearchItem(BaseModel):
    reason: str = Field(description="Why this search helps answer the query (max 15 words)")
    query: str = Field(description="Reddit search term with site:reddit.com prefix")

class WebSearchPlan(BaseModel):
    searches: list[WebSearchItem] = Field(description="List of Reddit searches")
    
planner_agent = Agent(
    name="PlannerAgent",
    instructions=INSTRUCTIONS,
    model="gpt-4o-mini",
    output_type=WebSearchPlan,
)