
import { useState } from "react";
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
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    
    try {
      const result = await searchService.search(query);
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
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl text-center space-y-8">
          {/* Title and Tagline */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Reddit Research Engine
            </h1>
            <p className="text-lg md:text-xl text-gray-300">
              Ask the internet's underground brain trust.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter your search query..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 h-12 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
              />
              <Button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="h-12 px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </form>

          {/* Results Section */}
          {results && (
            <Card className="bg-gray-800 border-gray-700 text-left">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 text-white">
                  Search Results
                </h2>
                <p className="text-gray-300 whitespace-pre-wrap">
                  {results}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-gray-500 text-sm">
        <p>Reddit Research Engine - Powered by the community</p>
      </footer>
    </div>
  );
};

export default Index;
