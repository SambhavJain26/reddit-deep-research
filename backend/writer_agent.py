
from pydantic import BaseModel, Field
from agents import Agent

INSTRUCTIONS = (
    "You are a senior researcher tasked with writing a cohesive report for a research query. "
    "You will be provided with the original query, and some initial research done by a research assistant.\n"
    "You should first come up with an outline for the report based on the query that describes the structure and "
    "flow of the report. The topics of the report should be highlighted based on the research done by the research assistant."
    "Then, generate the report and return that as your final output. Add the reddit post url to the report in the references section.\n"
    "The final output should be in markdown format, and it should cover the research done by the research assistant briefly "
    "Maximum 500 words. The report should be concise and to the point."
)


class ReportData(BaseModel):
    short_summary: str = Field(description="A short 2-3 sentence summary of the findings.")

    markdown_report: str = Field(description="The final report")

    follow_up_questions: list[str] = Field(description="Suggested topics to research further")


writer_agent = Agent(
    name="WriterAgent",
    instructions=INSTRUCTIONS,
    model="gpt-4o-mini",
    output_type=ReportData,
)
