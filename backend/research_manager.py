from agent_base import Runner, trace, gen_trace_id
from search_agent import search_agent
from planner_agent import planner_agent, WebSearchItem, WebSearchPlan
from writer_agent import writer_agent, ReportData
import asyncio

class ResearchManager:

    async def run(self, query: str):
        """Run the research process, yielding status updates and final report"""
        trace_id = gen_trace_id()
        with trace("Research process", trace_id=trace_id):
            yield "🔍 Starting research..."
            
            # Step 1: Planning
            yield "📋 Planning searches..."
            try:
                search_plan = await self.plan_searches(query)
                yield f"✅ Planned {len(search_plan.searches)} searches"
            except Exception as e:
                yield f"❌ Planning failed: {str(e)}"
                return
            
            # Step 2: Execute searches
            yield "🔎 Executing searches..."
            search_results = []
            completed = 0
            
            # Run searches concurrently
            tasks = [asyncio.create_task(self.search(item)) for item in search_plan.searches]
            
            for task in asyncio.as_completed(tasks):
                try:
                    result = await task
                    if result:
                        search_results.append(result)
                    completed += 1
                    yield f"🔎 Search progress: {completed}/{len(tasks)}"
                except Exception as e:
                    completed += 1
                    yield f"⚠️ Search {completed} failed: {str(e)}"
            
            if not search_results:
                yield "❌ No search results found"
                return
            
            yield f"✅ Completed {len(search_results)} searches"
            
            # Step 3: Generate report
            yield "📝 Writing report..."
            try:
                report = await self.write_report(query, search_results)
                yield "✅ Report complete"
                yield report.markdown_report
            except Exception as e:
                yield f"❌ Report generation failed: {str(e)}"

    async def plan_searches(self, query: str) -> WebSearchPlan:
        """Plan Reddit searches for the query"""
        result = await Runner.run(planner_agent, f"Query: {query}")
        return result.final_output_as(WebSearchPlan)

    async def search(self, item: WebSearchItem) -> str | None:
        """Execute a single search"""
        try:
            input_text = f"Search: {item.query}\nFocus: {item.reason}"
            result = await Runner.run(search_agent, input_text)
            return str(result.final_output)
        except Exception as e:
            print(f"Search failed for '{item.query}': {e}")
            return None

    async def write_report(self, query: str, search_results: list[str]) -> ReportData:
        """Generate final report from search results"""
        # Limit input size to control costs
        combined_results = "\n\n---\n\n".join(search_results)
        if len(combined_results) > 3000:  # Truncate if too long
            combined_results = combined_results[:3000] + "...\n[Results truncated]"
        
        input_text = f"Query: {query}\n\nFindings:\n{combined_results}"
        result = await Runner.run(writer_agent, input_text)
        return result.final_output_as(ReportData)