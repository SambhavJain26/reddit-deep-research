
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, AlertCircle } from "lucide-react";
import { searchService } from "@/services/api/searchService";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from 'react-markdown';

const Index = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [showSteps, setShowSteps] = useState(false);
  const [currentStatus, setCurrentStatus] = useState("");
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);
  const { toast } = useToast();

  const steps = [
    "Planning searches",
    "Searching reddit", 
    "Writing report",
    "Finalizing"
  ];

  // Check backend health on component mount
  useEffect(() => {
    const checkHealth = async () => {
      const healthy = await searchService.healthCheck();
      setBackendHealthy(healthy);
      if (!healthy) {
        toast({
          title: "Backend Connection Issue",
          description: "Unable to connect to the research backend. Please ensure the Flask server is running on port 5001.",
          variant: "destructive",
        });
      }
    };
    
    checkHealth();
  }, [toast]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setResults(null);
    setActiveStep(-1);
    setShowSteps(true);
    setCurrentStatus("Starting research...");
    
    // Show step animations with 2-second delays
    setTimeout(() => {
      setActiveStep(0);
      setCurrentStatus("Planning searches...");
    }, 500);
    
    setTimeout(() => {
      setActiveStep(1);
      setCurrentStatus("Searching reddit...");
    }, 2500);
    
    setTimeout(() => {
      setActiveStep(2);
      setCurrentStatus("Writing report...");
    }, 4500);
    
    setTimeout(() => {
      setActiveStep(3);
      setCurrentStatus("Finalizing...");
    }, 6500);
    
    try {
      // Use streaming search for real-time updates
      const streamingGenerator = searchService.searchStreaming(query);
      
      for await (const chunk of streamingGenerator) {
        console.log('Received chunk:', chunk);
        
        if (chunk.includes("#") && chunk.length > 100) {
          // This is the final markdown report
          setResults(chunk);
          setCurrentStatus("Research completed!");
          break;
        }
      }
      
    } catch (error) {
      console.error('Streaming search failed, falling back to simple search:', error);
      
      // Fallback to simple search
      try {
        const result = await searchService.search(query);
        setResults(result);
        setCurrentStatus("Search completed!");
      } catch (fallbackError) {
        toast({
          title: "Search Error",
          description: fallbackError instanceof Error ? fallbackError.message : "An error occurred while searching",
          variant: "destructive",
        });
      }
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 7000); // Complete after all animations
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col">
      {/* Backend Status Indicator */}
      {backendHealthy === false && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-sm text-red-700">
              Backend is not available. Please start the Flask server: <code>cd backend && uv run app.py</code>
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl text-center space-y-8">
          {/* Reddit Icon and Title */}
          <div className="space-y-6">
            <div className="flex justify-center">
              <img 
                src="https://i.postimg.cc/sXt3ZvLF/54018bb5d58887e39c92a1f54164d421.png" 
                alt="Reddit Research Engine" 
                className="w-16 h-16 rounded-full object-cover"
              />
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Reddit Research Engine
              </h1>
              <p className="text-lg md:text-xl text-gray-600">
                Ask the internet's underground brain trust.
              </p>
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-3 p-2 bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <Input
                type="text"
                placeholder="Enter your search query..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 h-12 border-0 bg-transparent text-gray-900 placeholder-gray-500 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
              />
              <Button
                type="submit"
                disabled={isLoading || !query.trim() || backendHealthy === false}
                className="h-12 px-6 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 rounded-xl text-white font-medium transition-colors"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Current Status */}
          {currentStatus && (
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <p className="font-medium">Status: {currentStatus}</p>
            </div>
          )}

          {/* Animated Process Steps */}
          {showSteps && (
            <div className={`relative flex items-center justify-center space-x-8 text-sm transition-all duration-500 ease-out ${showSteps ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
              {steps.map((step, index) => (
                <div key={index} className="relative z-10 px-4 py-2 transition-all duration-500">
                  {/* Active step background box */}
                  {activeStep === index && (
                    <div className="absolute inset-0 bg-orange-500 rounded-lg transition-all duration-500 ease-in-out transform animate-scale-in"></div>
                  )}
                  <span className={`relative z-20 transition-colors duration-500 font-medium ${
                    activeStep === index 
                      ? 'text-white' 
                      : activeStep > index 
                        ? 'text-orange-600' 
                        : 'text-gray-500'
                  }`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Results Section - This displays the Python output in proper markdown */}
          {results && (
            <Card className="bg-white border border-gray-200 shadow-lg text-left mt-8 animate-fade-in">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  Research Report
                </h2>
                <div className="text-gray-700 leading-relaxed prose prose-sm max-w-none">
                  <ReactMarkdown>{results}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-400 text-sm">
        <p>Reddit Research Engine - Powered by AI Research Agents</p>
      </footer>
    </div>
  );
};

export default Index;
