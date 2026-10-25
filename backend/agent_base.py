import os
import re
import json
import asyncio
import logging
from typing import Any, Dict, List, Optional, Type, TypeVar, Union
from pydantic import BaseModel
from openai import AsyncOpenAI
from tavily import TavilyClient
import time
import uuid

# Load environment variables
from pathlib import Path
from dotenv import load_dotenv

root_env = Path(__file__).resolve().parent.parent / '.env'
if root_env.exists():
    load_dotenv(dotenv_path=root_env)
else:
    load_dotenv()

T = TypeVar('T', bound=BaseModel)

# Simple logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def gen_trace_id() -> str:
    """Generate a unique trace ID"""
    return str(uuid.uuid4())[:8]

def trace(description: str, trace_id: str = None):
    """Simple context manager for tracing"""
    class TraceContext:
        def __enter__(self):
            logger.info(f"[{trace_id}] Starting: {description}")
            return self
        def __exit__(self, *args):
            logger.info(f"[{trace_id}] Completed: {description}")
    return TraceContext()

class ModelSettings:
    def __init__(self, temperature: float = 0.7, tool_choice: str = "auto"):
        self.temperature = temperature
        self.tool_choice = tool_choice

class WebSearchTool:
    def __init__(self, search_context_size: str = "low"):
        self.search_context_size = search_context_size
        self.client = TavilyClient(api_key=os.getenv('TAVILY_API_KEY'))
    
    async def search(self, query: str, max_results: int = 5) -> dict:
        """Perform web search using Tavily API and return structured results"""
        try:
            response = self.client.search(
                query=query,
                search_depth="basic" if self.search_context_size == "low" else "advanced",
                max_results=max_results,
                include_answer=True,
                include_raw_content=False
            )
            
            # Extract sources for referencing
            sources = []
            content_parts = []
            
            if response.get('answer'):
                content_parts.append(f"Summary: {response['answer']}")
            
            junk_patterns = [
                'prove your humanity',
                'captcha',
                'just a moment',
                'access denied',
                'blocked',
                'dive into anything',
                'sign in to reddit',
                'log in to reddit',
                'page not found',
                '404 not found'
            ]

            valid_results = []
            for r in response.get('results', []):
                t = (r.get('title') or '').strip()
                u = (r.get('url') or '').strip()
                t_lower = t.lower()
                if any(p in t_lower for p in junk_patterns):
                    continue
                if '/login' in u or '/captcha' in u:
                    continue
                if len(t) < 4 or not u:
                    continue
                valid_results.append(r)

            for i, result in enumerate(valid_results[:max_results], 1):
                title = result.get('title', 'Reddit Discussion').strip()
                content = result.get('content', '').strip()
                url = result.get('url', '').strip()
                
                sub_match = re.search(r'/r/([a-zA-Z0-9_]+)', url)
                subreddit = f"r/{sub_match.group(1)}" if sub_match else "r/reddit"

                if len(content) > 250:
                    content = content[:250] + "..."
                
                sources.append({
                    'id': i,
                    'title': title,
                    'url': url,
                    'subreddit': subreddit
                })
                
                content_parts.append(f"• [{subreddit}] {title} [{i}]\n  {content}")
            
            return {
                'content': "\n\n".join(content_parts),
                'sources': sources
            }
            
        except Exception as e:
            logger.error(f"Search error: {e}")
            return {
                'content': f"Search failed: {str(e)}",
                'sources': []
            }

class Agent:
    def __init__(self, name: str, instructions: str, model: str = "gpt-4o-mini", 
                 tools: List[Any] = None, output_type: Type[T] = None, 
                 model_settings: ModelSettings = None):
        self.name = name
        self.instructions = instructions
        self.model = model
        self.tools = tools or []
        self.output_type = output_type
        self.model_settings = model_settings or ModelSettings()
    async def run(self, user_input: str) -> 'RunResult':
        client = AsyncOpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        try:
            return await self._execute_run(client, user_input)
        finally:
            await client.close()

    async def _execute_run(self, client: AsyncOpenAI, user_input: str) -> 'RunResult':
        """Run the agent with user input"""
        messages = [
            {"role": "system", "content": self.instructions},
            {"role": "user", "content": user_input}
        ]
        
        # Prepare function definitions for OpenAI
        functions = []
        available_functions = {}
        
        if self.tools:
            for tool in self.tools:
                if isinstance(tool, WebSearchTool):
                    functions.append({
                        "name": "web_search",
                        "description": "Search the web for information",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "query": {"type": "string", "description": "Search query"}
                            },
                            "required": ["query"]
                        }
                    })
                    available_functions["web_search"] = tool.search
        
        # Make OpenAI API call
        kwargs = {
            "model": self.model,
            "messages": messages,
            "temperature": self.model_settings.temperature
        }
        
        if functions:
            kwargs["functions"] = functions
            if self.model_settings.tool_choice == "required":
                kwargs["function_call"] = "auto"
        
        if self.output_type:
            # Use structured output for Pydantic models
            kwargs["response_format"] = {
                "type": "json_object"
            }
            # Add JSON schema instruction to system message
            schema_instruction = f"\n\nRespond with valid JSON matching this schema: {self.output_type.model_json_schema()}"
            kwargs["messages"][0]["content"] += schema_instruction
        
        response = await client.chat.completions.create(**kwargs)
        
        # Handle function calls
        final_content = ""
        sources = []
        message = response.choices[0].message
        
        if message.function_call:
            # Execute function call
            function_name = message.function_call.name
            function_args = json.loads(message.function_call.arguments)
            
            if function_name in available_functions:
                function_result = await available_functions[function_name](**function_args)
                
                # Handle structured search results
                if isinstance(function_result, dict) and 'sources' in function_result:
                    sources = function_result['sources']
                    function_content = function_result['content']
                else:
                    function_content = str(function_result)
                
                # Add function result and get final response
                messages.extend([
                    {"role": "assistant", "content": None, "function_call": message.function_call},
                    {"role": "function", "name": function_name, "content": function_content}
                ])
                
                final_response = await client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    temperature=self.model_settings.temperature
                )
                final_content = final_response.choices[0].message.content
        else:
            final_content = message.content
        
        return RunResult(final_content, self.output_type, sources)

class RunResult:
    def __init__(self, content: str, output_type: Type[T] = None, sources: list = None):
        self.content = content
        self.output_type = output_type
        self.sources = sources or []
        self._parsed_output = None
    
    @property
    def final_output(self) -> Union[str, T]:
        """Get the final output, parsed if output_type is specified"""
        if self.output_type and self._parsed_output is None:
            try:
                # Parse JSON content into Pydantic model
                if self.content.strip().startswith('{'):
                    json_data = json.loads(self.content)
                    self._parsed_output = self.output_type(**json_data)
                else:
                    # Try to extract JSON from content
                    import re
                    json_match = re.search(r'\{.*\}', self.content, re.DOTALL)
                    if json_match:
                        json_data = json.loads(json_match.group())
                        self._parsed_output = self.output_type(**json_data)
                    else:
                        raise ValueError("No valid JSON found in response")
            except Exception as e:
                logger.error(f"Failed to parse output: {e}")
                self._parsed_output = self.content
        
        return self._parsed_output if self.output_type else self.content
    
    def final_output_as(self, target_type: Type[T]) -> T:
        """Get the final output as a specific type"""
        if isinstance(self.final_output, target_type):
            return self.final_output
        raise ValueError(f"Output is not of type {target_type}")

class Runner:
    @staticmethod
    async def run(agent: Agent, user_input: str) -> RunResult:
        """Run an agent with user input"""
        return await agent.run(user_input)