import os
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
from dotenv import load_dotenv
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
    
    async def search(self, query: str, max_results: int = 5) -> str:
        """Perform web search using Tavily API"""
        try:
            response = self.client.search(
                query=query,
                search_depth="basic" if self.search_context_size == "low" else "advanced",
                max_results=max_results,
                include_answer=True,
                include_raw_content=False
            )
            
            # Format results concisely
            results = []
            if response.get('answer'):
                results.append(f"Summary: {response['answer']}")
            
            for result in response.get('results', [])[:max_results]:
                title = result.get('title', 'No title')
                content = result.get('content', '')[:200] + "..." if len(result.get('content', '')) > 200 else result.get('content', '')
                url = result.get('url', '')
                results.append(f"• {title}\n  {content}\n  {url}")
            
            return "\n\n".join(results)
        except Exception as e:
            logger.error(f"Search error: {e}")
            return f"Search failed: {str(e)}"

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
        self.client = AsyncOpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    
    async def run(self, user_input: str) -> 'RunResult':
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
        
        response = await self.client.chat.completions.create(**kwargs)
        
        # Handle function calls
        final_content = ""
        message = response.choices[0].message
        
        if message.function_call:
            # Execute function call
            function_name = message.function_call.name
            function_args = json.loads(message.function_call.arguments)
            
            if function_name in available_functions:
                function_result = await available_functions[function_name](**function_args)
                
                # Add function result and get final response
                messages.extend([
                    {"role": "assistant", "content": None, "function_call": message.function_call},
                    {"role": "function", "name": function_name, "content": str(function_result)}
                ])
                
                final_response = await self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    temperature=self.model_settings.temperature
                )
                final_content = final_response.choices[0].message.content
        else:
            final_content = message.content
        
        return RunResult(final_content, self.output_type)

class RunResult:
    def __init__(self, content: str, output_type: Type[T] = None):
        self.content = content
        self.output_type = output_type
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