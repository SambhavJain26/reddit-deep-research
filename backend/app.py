from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import json
import asyncio
from research_manager import ResearchManager
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "Reddit Research Engine"})

@app.route('/search', methods=['POST'])
def search():
    """Streaming search endpoint"""
    try:
        data = request.get_json()
        query = data.get('query', '').strip()
        
        if not query:
            return jsonify({"error": "Query is required"}), 400
        
        if len(query) > 500:  # Limit query length
            return jsonify({"error": "Query too long (max 500 characters)"}), 400

        def generate():
            try:
                # Create event loop for this thread
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                
                async def run_research():
                    research_manager = ResearchManager()
                    async for chunk in research_manager.run(query):
                        yield chunk
                
                # Execute async generator
                async def async_gen():
                    async for chunk in run_research():
                        yield chunk
                
                gen = async_gen()
                
                try:
                    while True:
                        try:
                            chunk = loop.run_until_complete(gen.__anext__())
                            # Send formatted chunk
                            yield f"data: {json.dumps({'type': 'update', 'message': chunk})}\n\n"
                        except StopAsyncIteration:
                            yield f"data: {json.dumps({'type': 'complete'})}\n\n"
                            break
                except Exception as e:
                    logger.error(f"Research error: {e}")
                    yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
                finally:
                    loop.close()
                    
            except Exception as e:
                logger.error(f"Generation error: {e}")
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
        logger.error(f"Search endpoint error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/search_simple', methods=['POST'])
def search_simple():
    """Non-streaming endpoint for testing"""
    try:
        data = request.get_json()
        query = data.get('query', '').strip()
        
        if not query:
            return jsonify({"error": "Query is required"}), 400
            
        if len(query) > 500:
            return jsonify({"error": "Query too long (max 500 characters)"}), 400
        
        # Create event loop
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            research_manager = ResearchManager()
            
            # Collect all updates
            updates = []
            final_report = None
            
            async def collect_results():
                nonlocal final_report
                async for chunk in research_manager.run(query):
                    if chunk.startswith('#') or len(chunk) > 200:  # Likely the final report
                        final_report = chunk
                    else:
                        updates.append(chunk)
            
            loop.run_until_complete(collect_results())
            
            return jsonify({
                "query": query,
                "updates": updates,
                "report": final_report or "No report generated",
                "status": "completed"
            })
            
        finally:
            loop.close()
            
    except Exception as e:
        logger.error(f"Simple search error: {e}")
        return jsonify({"error": str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    # Check for required environment variables
    import os
    required_vars = ['OPENAI_API_KEY', 'TAVILY_API_KEY']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        print("Please set them in a .env file or environment")
        exit(1)
    
    print("🚀 Starting Reddit Research Engine...")
    print("📍 Health check: http://localhost:5001/health")
    print("🔍 Search endpoint: POST http://localhost:5001/search")
    print("🧪 Simple endpoint: POST http://localhost:5001/search_simple")
    
    app.run(debug=True, host='0.0.0.0', port=5001, threaded=True)