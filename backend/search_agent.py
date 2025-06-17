
from agents import Agent, WebSearchTool, ModelSettings

INSTRUCTIONS = (
    "You are a reddit research assistant. Given a search term, you search only on reddit for a given search term and "
    'The way to search on reddit is by putting "site:reddit.com" in the search term.'
    "produce a concise summary of the results. The summary must 2-3 paragraphs and less than 300 "
    "words. Capture the main points. Write succintly, no need to have complete sentences or good "
    "grammar. This will be consumed by someone synthesizing a report, so its vital you capture the "
    "essence and ignore any fluff. Do not include any additional commentary other than the summary itself."
    "Add the reddit post url to the summary."
)

search_agent = Agent(
    name="Search agent",
    instructions=INSTRUCTIONS,
    tools=[WebSearchTool(search_context_size="low")],
    model="gpt-4o-mini",
    model_settings=ModelSettings(tool_choice="required"),
)
