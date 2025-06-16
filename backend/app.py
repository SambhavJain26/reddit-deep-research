
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import json
import asyncio
from research_manager import ResearchManager
import threading
from queue import Queue

app = Flask(__name__)
CORS(app)

class StreamingResponse:
    def __init__(self):
        self.queue = Queue()
        self.finished = False
    
    def add_chunk(self, chunk):
        self.queue.put(chunk)
    
    def finish(self):
        self.finished = True
        self.queue.put(None)  # Signal end of stream

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"})

@app.route('/search', methods=['POST'])
def search():
    try:
        data = request.get_json()
        query = data.get('query', '')
        
        if not query:
            return jsonify({"error": "Query is required"}), 400
        
        def generate():
            try:
                # Create a new event loop for this thread
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                
                async def run_research():
                    research_manager = ResearchManager()
                    async for chunk in research_manager.run(query):
                        yield chunk
                
                # Run the async generator
                async def async_generator():
                    async for chunk in run_research():
                        yield chunk
                
                # Execute the async generator in the event loop
                gen = async_generator()
                
                try:
                    while True:
                        try:
                            chunk = loop.run_until_complete(gen.__anext__())
                            # Send each chunk as a JSON object
                            yield f"data: {json.dumps({'type': 'chunk', 'data': chunk})}\n\n"
                        except StopAsyncIteration:
                            break
                except Exception as e:
                    yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
                finally:
                    loop.close()
                    
            except Exception as e:
                yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
        
        return Response(
            generate(),
            mimetype='text/plain',
            headers={
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
            }
        )
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/search_simple', methods=['POST'])
def search_simple():
    """Simple non-streaming endpoint for basic testing"""
    try:
        data = request.get_json()
        query = data.get('query', '')
        
        if not query:
            return jsonify({"error": "Query is required"}), 400
        
        # Create a new event loop for this thread
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            research_manager = ResearchManager()
            
            # Collect all chunks
            chunks = []
            async def collect_chunks():
                async for chunk in research_manager.run(query):
                    chunks.append(chunk)
                return chunks
            
            loop.run_until_complete(collect_chunks())
            
            # Return the final result (last chunk should be the report)
            final_result = chunks[-1] if chunks else "No results found"
            
            return jsonify({
                "query": query,
                "result": final_result,
                "status": "completed"
            })
            
        finally:
            loop.close()
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001, threaded=True)
