from pydantic import BaseModel, Field
from .agent_base import Agent

# Optimized prompt - much shorter while maintaining quality
INSTRUCTIONS = """Write a research report from the provided findings.

Structure:
1. Brief overview
2. Key findings (2-3 main points)
3. Notable insights

Requirements:
- Markdown format
- Under 400 words
- No references
- Concise, factual tone

Output JSON with report and summary."""

class ReportData(BaseModel):
    short_summary: str = Field(description="2-sentence key findings summary")
    markdown_report: str = Field(description="Complete markdown report")
    follow_up_questions: list[str] = Field(description="3 follow-up research topics")

writer_agent = Agent(
    name="WriterAgent",
    instructions=INSTRUCTIONS,
    model="gpt-4o-mini",
    output_type=ReportData,
)