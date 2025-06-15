
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { searchService } from "@/services/searchService";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [showSteps, setShowSteps] = useState(false);
  const { toast } = useToast();

  const steps = [
    "Search Reddit",
    "Analyze Posts", 
    "Generate Insights",
    "Final Report"
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setResults(null);
    setActiveStep(-1);
    setShowSteps(true);
    
    // Start the step animation
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, i === 0 ? 100 : 1500));
      setActiveStep(i);
    }

    try {
      const result = await searchService.search(query);
      // Wait a bit after final step before showing results
      await new Promise(resolve => setTimeout(resolve, 1000));
      setResults(result);
    } catch (error) {
      toast({
        title: "Search Error",
        description: error instanceof Error ? error.message : "An error occurred while searching",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl text-center space-y-8">
          {/* Title and Tagline */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Reddit Research Engine
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              Ask the internet's underground brain trust.
            </p>
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
                disabled={isLoading || !query.trim()}
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

          {/* Animated Process Steps */}
          {showSteps && (
            <div className={`flex items-center justify-center space-x-6 text-sm text-gray-500 transition-all duration-500 ease-out ${showSteps ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
              {steps.map((step, index) => (
                <div key={index} className="flex items-center space-x-2 transition-all duration-300">
                  <div 
                    className={`w-3 h-3 rounded-full transition-all duration-500 ${
                      activeStep >= index ? 'bg-orange-500 scale-110' : 'bg-gray-300'
                    }`}
                  ></div>
                  <span className={`transition-colors duration-300 ${
                    activeStep >= index ? 'text-orange-600 font-medium' : 'text-gray-500'
                  }`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Results Section */}
          {results && (
            <Card className="bg-white border border-gray-200 shadow-lg text-left mt-8 animate-fade-in">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  Search Results
                </h2>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {results}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-400 text-sm">
        <p>Reddit Research Engine - Powered by the community</p>
      </footer>
    </div>
  );
};

export default Index;
