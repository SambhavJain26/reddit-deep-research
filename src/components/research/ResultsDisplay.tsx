import React from "react";
import ReactMarkdown from "react-markdown";

interface ResultsDisplayProps {
  results: string | null;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  if (!results) return null;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8 border border-orange-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-200">
          Research Results
        </h2>
        <div className="prose prose-lg max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 className="text-3xl font-bold text-gray-800 mb-4">{children}</h1>,
              h2: ({ children }) => <h2 className="text-2xl font-semibold text-gray-700 mb-3 mt-6">{children}</h2>,
              h3: ({ children }) => <h3 className="text-xl font-medium text-gray-600 mb-2 mt-4">{children}</h3>,
              p: ({ children }) => <p className="text-gray-600 mb-4 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-2 text-gray-600">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-600">{children}</ol>,
              li: ({ children }) => <li className="text-gray-600">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold text-gray-800">{children}</strong>,
              em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
              a: ({ href, children }) => (
                <a 
                  href={href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-orange-600 hover:text-orange-700 underline"
                >
                  {children}
                </a>
              ),
              code: ({ children }) => (
                <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">
                  {children}
                </code>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-orange-200 pl-4 italic text-gray-600 my-4">
                  {children}
                </blockquote>
              ),
            }}
          >
            {results}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};