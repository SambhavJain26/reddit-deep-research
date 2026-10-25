from agent_base import Runner, trace, gen_trace_id
from search_agent import search_agent
from planner_agent import planner_agent, WebSearchItem, WebSearchPlan
from writer_agent import writer_agent, ReportData
import asyncio

class SearchResult:
    """Container for search results with sources"""
    def __init__(self, content: str, sources: list = None):
        self.content = content
        self.sources = sources or []

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
            all_sources = []
            completed = 0
            
            # Run searches concurrently
            tasks = [asyncio.create_task(self.search(item)) for item in search_plan.searches]
            
            for task in asyncio.as_completed(tasks):
                try:
                    result = await task
                    if result:
                        search_results.append(result.content)
                        # Deduplicate and renumber sources globally
                        for source in result.sources:
                            if not any(s.get('url') == source.get('url') for s in all_sources):
                                source['global_id'] = len(all_sources) + 1
                                all_sources.append(source)
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
                report = await self.write_report(query, search_results, all_sources)
                yield "✅ Report complete"
                yield report.markdown_report
            except Exception as e:
                yield f"❌ Report generation failed: {str(e)}"

    async def plan_searches(self, query: str) -> WebSearchPlan:
        """Plan Reddit searches for the query"""
        result = await Runner.run(planner_agent, f"Query: {query}")
        return result.final_output_as(WebSearchPlan)

    async def search(self, item: WebSearchItem) -> SearchResult | None:
        """Execute a single search and return results with sources"""
        try:
            input_text = f"Search: {item.query}\nFocus: {item.reason}"
            result = await Runner.run(search_agent, input_text)
            return SearchResult(
                content=str(result.final_output),
                sources=result.sources
            )
        except Exception as e:
            print(f"Search failed for '{item.query}': {e}")
            return None

    async def write_report(self, query: str, search_results: list[str], sources: list[dict]) -> ReportData:
        """Generate final report from search results with sources"""
        # Limit input size to control costs
        combined_results = "\n\n---\n\n".join(search_results)
        if len(combined_results) > 3000:  # Truncate if too long
            combined_results = combined_results[:3000] + "...\n[Results truncated]"
        
        import re
        sources_text = "\n".join([
            f"[{src['global_id']}] {src['title']} ({src.get('subreddit', 'r/reddit')}) - {src['url']}" 
            for src in sources
        ])
        
        input_text = f"Query: {query}\n\nFindings:\n{combined_results}\n\nAvailable Sources:\n{sources_text}"
        result = await Runner.run(writer_agent, input_text)
        
        report_data = result.final_output_as(ReportData)
        
        # Strip any inconsistent references the agent might have written
        body_text = re.split(r'\n#{1,3}\s*References|\nReferences\s*:?\s*\n', report_data.markdown_report, flags=re.IGNORECASE)[0].strip()
        
        # Build canonical markdown references with active links and subreddit tags
        if sources:
            ref_lines = []
            for src in sources:
                gid = src.get('global_id', 1)
                title = src.get('title', 'Reddit Discussion').replace('[', '(').replace(']', ')')
                url = src.get('url', '')
                sub = src.get('subreddit', 'r/reddit')
                ref_lines.append(f"{gid}. [{title}]({url}) - `{sub}`")
            body_text += "\n\n## References\n\n" + "\n".join(ref_lines)
            
        report_data.markdown_report = body_text
        return report_data