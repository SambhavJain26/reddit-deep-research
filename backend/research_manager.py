
from agents import Runner, trace, gen_trace_id
from search_agent import search_agent
from planner_agent import planner_agent, WebSearchItem, WebSearchPlan
from writer_agent import writer_agent, ReportData
import asyncio

class ResearchManager:

    async def run(self, query: str):
        """ Run the deep research process, yielding the status updates and the final report"""
        trace_id = gen_trace_id()
        with trace("Research trace", trace_id=trace_id):
            print("Starting research...")
            yield "Starting research..."
            
            # Step 1: Planning
            print("Planning searches...")
            yield "Planning searches..."
            search_plan = await self.plan_searches(query)
            yield "Searches planned, starting to search..."
            
            # Step 2: Searching with progress updates
            print("Searching...")
            yield "Searching..."
            search_results = []
            num_completed = 0
            tasks = [asyncio.create_task(self.search(item)) for item in search_plan.searches]
            
            for task in asyncio.as_completed(tasks):
                result = await task
                if result is not None:
                    search_results.append(result)
                num_completed += 1
                print(f"Searching... {num_completed}/{len(tasks)} completed")
                yield f"Searching... {num_completed}/{len(tasks)} completed"
            
            print("Finished searching")
            yield "Finished searching"
            
            # Step 3: Writing report
            print("Thinking about report...")
            yield "Thinking about report..."
            report = await self.write_report(query, search_results)
            print("Finished writing report")
            yield "Finished writing report"
            
            # Step 4: Final result
            yield report.markdown_report

    async def plan_searches(self, query: str) -> WebSearchPlan:
        """ Plan the searches to perform for the query """
        result = await Runner.run(
            planner_agent,
            f"Query: {query}",
        )
        print(f"Will perform {len(result.final_output.searches)} searches")
        return result.final_output_as(WebSearchPlan)

    async def search(self, item: WebSearchItem) -> str | None:
        """ Perform a search for the query """
        input = f"Search term: {item.query}\nReason for searching: {item.reason}"
        try:
            result = await Runner.run(
                search_agent,
                input,
            )
            return str(result.final_output)
        except Exception:
            return None

    async def write_report(self, query: str, search_results: list[str]) -> ReportData:
        """ Write the report for the query """
        input = f"Original query: {query}\nSummarized search results: {search_results}"
        result = await Runner.run(
            writer_agent,
            input,
        )
        return result.final_output_as(ReportData)
