import React from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchFormProps {
  query: string;
  setQuery: (query: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({
  query,
  setQuery,
  onSubmit,
  isLoading,
  disabled = false
}) => {
  return (
    <form onSubmit={onSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex gap-3">
        <Input
          type="text"
          placeholder="What would you like to research on Reddit? (e.g., 'best budget laptops for programming')"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 h-12 px-4 text-base border-2 border-orange-200 focus:border-orange-400 rounded-xl"
          disabled={isLoading || disabled}
        />
        <Button
          type="submit"
          disabled={isLoading || !query.trim() || disabled}
          className="h-12 px-6 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 rounded-xl text-white font-medium transition-colors"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <Search className="w-5 h-5 mr-2" />
              Research
            </>
          )}
        </Button>
      </div>
    </form>
  );
};