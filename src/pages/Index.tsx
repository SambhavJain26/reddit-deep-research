
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
  const [currentStep, setCurrentStep] = useState("");
  const [showSteps, setShowSteps] = useState(false);
  const { toast } = useToast();

  const steps = [
    "SEARCHES PLANNED, STARTING TO SEARCH...",
    "SEARCHES COMPLETE, WRITING REPORT...", 
    "REPORT WRITTEN, SENDING EMAIL..."
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setResults(null);
    setCurrentStep("");
    setShowSteps(true);

    try {
      const { statusGenerator } = await searchService.search(query);
      
      for await (const status of statusGenerator) {
        setCurrentStep(status.current_step);
        
        if (status.status === 'completed' && status.result) {
          setResults(status.result);
          break;
        }
      }
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

  const getActiveStepIndex = () => {
    return steps.findIndex(step => step === currentStep);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl text-center space-y-8">
          {/* Icon and Title */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <img 
                src="https://i.postimg.cc/sXt3ZvLF/54018bb5d58887e39c92a1f54164d421.png" 
                alt="Reddit Research Icon" 
                className="w-16 h-16 rounded-full"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Reddit Deep Research</h1>
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

          {/* Current Step Display */}
          {showSteps && currentStep && (
            <div className="transition-all duration-500 ease-out opacity-100 translate-y-0">
              <div className="relative px-4 py-2">
                <div className="bg-orange-500 rounded-lg px-4 py-2">
                  <span className="text-white font-medium">
                    {currentStep}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Results Section */}
          {results && (
            <Card className="bg-white border border-gray-200 shadow-lg text-left mt-8 animate-fade-in">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  Research Results
                </h2>
                <div className="prose max-w-none text-gray-700">
                  <pre className="whitespace-pre-wrap font-sans leading-relaxed">
                    {results}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-400 text-sm">
        <p>Reddit Research Engine - Powered by Python & FastAPI</p>
      </footer>
    </div>
  );
};

export default Index;
