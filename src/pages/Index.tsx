import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  AlertCircle, 
  Copy, 
  Check, 
  BookOpen, 
  ArrowUpRight, 
  Sparkles,
  MessageSquare
} from "lucide-react";
import { searchService } from "@/services/searchService";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from 'react-markdown';

interface SourceItem {
  id: number;
  title: string;
  url: string;
  subreddit: string;
}

function extractReportAndSources(rawMarkdown: string): { body: string; sources: SourceItem[] } {
  if (!rawMarkdown) return { body: "", sources: [] };

  // Split on References heading
  const splitRegex = /(?:^|\n)#{1,3}\s*References\b|(?:^|\n)References\s*:?\s*\n/i;
  const parts = rawMarkdown.split(splitRegex);
  const body = parts[0].trim();
  const refText = parts.length > 1 ? parts.slice(1).join("\n").trim() : "";

  const sources: SourceItem[] = [];
  const seenUrls = new Set<string>();

  if (refText) {
    const lines = refText.split("\n").map(l => l.trim()).filter(Boolean);
    let fallbackId = 1;

    for (const line of lines) {
      // Format 1: 1. [Title](url) - `r/sub`
      const mdLinkMatch = line.match(/(?:(\d+)[\.\)]\s*)?\[(.*?)\]\((https?:\/\/[^\s\)]+)\)(?:\s*-\s*`?([rR]\/[a-zA-Z0-9_]+)`?)?/);
      if (mdLinkMatch) {
        const id = mdLinkMatch[1] ? parseInt(mdLinkMatch[1], 10) : fallbackId++;
        const title = mdLinkMatch[2].trim();
        const url = mdLinkMatch[3].trim();
        if (!seenUrls.has(url)) {
          seenUrls.add(url);
          const subMatch = url.match(/\/r\/([a-zA-Z0-9_]+)/i);
          const subreddit = mdLinkMatch[4] || (subMatch ? `r/${subMatch[1]}` : "r/reddit");
          sources.push({ id, title, url, subreddit });
        }
        continue;
      }

      // Format 2: 1. Title - https://url
      const separatorPattern = '(?:(\\d+)[\\.\\)]\\s*)?(.*?)\\s*(?:\\-|\\:)\\s*(https?:\\/\\/[^\\s]+)';
      const rawMatch = line.match(new RegExp(separatorPattern));
      if (rawMatch) {
        const id = rawMatch[1] ? parseInt(rawMatch[1], 10) : fallbackId++;
        const title = rawMatch[2].trim() || "Reddit Discussion";
        const url = rawMatch[3].trim();
        if (!seenUrls.has(url)) {
          seenUrls.add(url);
          const subMatch = url.match(/\/r\/([a-zA-Z0-9_]+)/i);
          const subreddit = subMatch ? `r/${subMatch[1]}` : "r/reddit";
          sources.push({ id, title, url, subreddit });
        }
        continue;
      }

      // Format 3: Generic line containing a URL
      const anyUrl = line.match(/(https?:\/\/[^\s\)]+)/);
      if (anyUrl) {
        const url = anyUrl[1];
        if (!seenUrls.has(url)) {
          seenUrls.add(url);
          let cleanedTitle = line.replace(url, "").replace(/^\d+[\.\)]\s*/, "");
          ['-', ':', '[', ']', '(', ')'].forEach(ch => {
            cleanedTitle = cleanedTitle.split(ch).join(" ");
          });
          const title = cleanedTitle.trim() || "Reddit Discussion";
          const subMatch = url.match(/\/r\/([a-zA-Z0-9_]+)/i);
          sources.push({
            id: fallbackId++,
            title,
            url,
            subreddit: subMatch ? `r/${subMatch[1]}` : "r/reddit"
          });
        }
      }
    }
  }

  return { body, sources };
}

const Index = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [showSteps, setShowSteps] = useState(false);
  const [currentStatus, setCurrentStatus] = useState("");
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const steps = [
    "Planning searches",
    "Searching reddit", 
    "Writing report",
    "Finalizing"
  ];

  // Parse markdown body and structured sources
  const { body: reportContent, sources: reportSources } = useMemo(() => {
    return extractReportAndSources(results || "");
  }, [results]);

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

  const handleCopyReport = async () => {
    if (!results) return;
    try {
      await navigator.clipboard.writeText(results);
      setCopied(true);
      toast({
        title: "Report Copied",
        description: "Full research report and references copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setResults(null);
    setActiveStep(-1);
    setShowSteps(true);
    setCurrentStatus("Starting research...");
    
    // Step animations
    setTimeout(() => {
      setActiveStep(0);
      setCurrentStatus("Planning searches...");
    }, 500);
    
    setTimeout(() => {
      setActiveStep(1);
      setCurrentStatus("Searching reddit...");
    }, 4000);
    
    setTimeout(() => {
      setActiveStep(2);
      setCurrentStatus("Writing report...");
    }, 7000);
    
    setTimeout(() => {
      setActiveStep(3);
      setCurrentStatus("Finalizing...");
    }, 10000);
    
    try {
      // Use streaming search for real-time updates
      const streamingGenerator = searchService.searchStreaming(query);
      
      for await (const chunk of streamingGenerator) {
        if ((chunk.includes("#") && chunk.length > 80) || chunk.includes("## References") || chunk.length > 250) {
          setResults(chunk);
          setCurrentStatus("Research completed!");
          setIsLoading(false);
          break;
        }
      }
      
    } catch (error) {
      console.warn("Streaming search encountered an issue, running fallback:", error);
      
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
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col">
      {/* Backend Status Indicator */}
      {backendHealthy === false && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-sm text-red-700">
              Backend is not available. Please start the Flask server: <code>uv run app.py</code>
            </p>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-3xl text-center space-y-8">
          
          {/* Brand Header */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <img 
                  src="https://i.postimg.cc/sXt3ZvLF/54018bb5d58887e39c92a1f54164d421.png" 
                  alt="Reddit Research Engine" 
                  className="w-16 h-16 rounded-2xl object-cover shadow-md border-2 border-white"
                />
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500 border-2 border-white"></span>
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/70 text-xs font-semibold text-orange-700">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                Autonomous Multi-Agent Intelligence
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                Reddit Deep Research
              </h1>
              <p className="text-base md:text-lg text-gray-600 max-w-lg mx-auto">
                Synthesize unfiltered human consensus, authentic experiences, and verified community threads in seconds.
              </p>
            </div>
          </div>

          {/* Search Query Input */}
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="flex items-center gap-2 p-2 bg-white rounded-2xl shadow-lg border border-gray-200/80 hover:border-orange-300 hover:shadow-xl transition-all">
              <div className="pl-3 text-gray-400">
                <Search className="w-5 h-5" />
              </div>
              <Input
                type="text"
                placeholder="Ask anything (e.g. best productivity tools for remote engineers)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 h-12 border-0 bg-transparent text-gray-900 placeholder-gray-400 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
              />
              <Button
                type="submit"
                disabled={isLoading || !query.trim() || backendHealthy === false}
                className="h-12 px-6 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 rounded-xl text-white font-semibold transition-all shadow-sm"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Researching...</span>
                  </div>
                ) : (
                  <span>Synthesize</span>
                )}
              </Button>
            </div>
          </form>

          {/* Stepper Status Progress */}
          {showSteps && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-center gap-2 text-xs font-medium text-gray-500">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                <span>{currentStatus}</span>
              </div>
              
              <div className="flex items-center justify-center gap-3 text-xs md:text-sm">
                {steps.map((step, index) => (
                  <div 
                    key={index}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-300 ${
                      activeStep === index
                        ? 'bg-orange-500 text-white shadow-sm ring-2 ring-orange-200'
                        : activeStep > index
                          ? 'bg-orange-50 text-orange-700 border border-orange-200'
                          : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Synthesized Research Report Section */}
          {results && (
            <Card id="research-report-card" className="bg-white border border-gray-200/90 shadow-xl rounded-2xl text-left mt-8 animate-fade-in overflow-hidden">
              {/* Report Header Bar */}
              <div className="px-6 py-4 bg-gray-50/80 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 leading-tight">
                      Reddit Consensus Report
                    </h2>
                    <p className="text-xs text-gray-500">
                      Multi-agent synthesis across authentic community threads
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {reportSources.length > 0 && (
                    <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                      <BookOpen className="w-3 h-3 text-orange-500" />
                      {reportSources.length} Sources Cited
                    </span>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyReport}
                    className="h-8 px-3 text-xs font-medium text-gray-700 hover:text-orange-600 hover:border-orange-300"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1 text-green-600" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1" />
                        Copy Markdown
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Report Body */}
              <CardContent className="p-6 md:p-8 space-y-6">
                <div className="prose prose-sm md:prose-base max-w-none text-gray-800 leading-relaxed">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-2xl font-extrabold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-lg font-bold text-gray-900 mt-6 mb-3 flex items-center gap-2 text-orange-700">
                          <span className="w-2 h-2 rounded-full bg-orange-500 inline-block"></span>
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-base font-semibold text-gray-800 mt-4 mb-2">
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p className="mb-4 leading-relaxed text-gray-700">
                          {children}
                        </p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc pl-5 mb-4 space-y-1.5 text-gray-700">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal pl-5 mb-4 space-y-2 text-gray-700">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="leading-relaxed">
                          {children}
                        </li>
                      ),
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-orange-600 hover:text-orange-700 underline decoration-orange-300 hover:decoration-orange-600 inline-flex items-center gap-0.5"
                        >
                          {children}
                          <ArrowUpRight className="w-3 h-3 inline" />
                        </a>
                      ),
                    }}
                  >
                    {reportContent}
                  </ReactMarkdown>
                </div>

                {/* Verified Community Sources Grid */}
                {reportSources.length > 0 && (
                  <div id="community-sources-section" className="mt-10 pt-8 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-orange-50 text-orange-600 border border-orange-200">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            Verified Community Sources
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                              {reportSources.length} Discussions
                            </span>
                          </h3>
                          <p className="text-xs text-gray-500">
                            Direct Reddit threads consulted and cited in this synthesis
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Source Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {reportSources.map((src) => (
                        <a
                          key={src.id}
                          id={`source-${src.id}`}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative flex flex-col justify-between p-4 rounded-xl border border-gray-200/80 bg-gray-50/50 hover:bg-white hover:border-orange-400 hover:shadow-md transition-all duration-200 text-left no-underline"
                        >
                          <div>
                            {/* Card Header */}
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="p-1 rounded-md bg-orange-100 text-orange-600">
                                  <MessageSquare className="w-3 h-3" />
                                </span>
                                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-orange-50 text-orange-800 border border-orange-200/60 truncate">
                                  {src.subreddit}
                                </span>
                              </div>
                              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-white text-gray-700 border border-gray-200 group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 transition-colors flex-shrink-0">
                                #{src.id}
                              </span>
                            </div>

                            {/* Thread Title */}
                            <h4 className="text-xs md:text-sm font-semibold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">
                              {src.title}
                            </h4>
                          </div>

                          {/* Card Footer */}
                          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100">
                            <span className="text-[11px] text-gray-400 group-hover:text-gray-600 truncate max-w-[200px] font-mono">
                              reddit.com/{src.subreddit}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 group-hover:translate-x-0.5 transition-transform">
                              <span>Open Discussion</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-400 text-xs border-t border-gray-100">
        <p>Reddit Deep Research • Autonomous Multi-Agent Consensus Engine</p>
      </footer>
    </div>
  );
};

export default Index;
