from agent_base import Agent, WebSearchTool, ModelSettings

# Optimized prompt - shorter, more direct
INSTRUCTIONS = """Search Reddit and summarize findings in 2-3 paragraphs (under 250 words).

Focus on:
- Key insights and common themes
- Specific examples/experiences mentioned
- Different perspectives if any

Be concise. Include relevant Reddit post URLs."""

search_agent = Agent(
    name="SearchAgent",
    instructions=INSTRUCTIONS,
    tools=[WebSearchTool(search_context_size="low")],
    model="gpt-4o-mini",
    model_settings=ModelSettings(tool_choice="required"),
)