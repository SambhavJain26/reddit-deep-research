import React from "react";
import { AlertCircle } from "lucide-react";

interface BackendStatusProps {
  isHealthy: boolean | null;
}

export const BackendStatus: React.FC<BackendStatusProps> = ({ isHealthy }) => {
  if (isHealthy !== false) return null;

  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
      <div className="flex items-center">
        <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
        <p className="text-sm text-red-700">
          Backend is not available. Please start the Flask server: <code>cd backend && uv run app.py</code>
        </p>
      </div>
    </div>
  );
};