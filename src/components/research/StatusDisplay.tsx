import React from "react";

interface StatusDisplayProps {
  currentStatus: string;
  isLoading: boolean;
}

export const StatusDisplay: React.FC<StatusDisplayProps> = ({
  currentStatus,
  isLoading
}) => {
  if (!isLoading || !currentStatus) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mb-6">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
          <p className="text-gray-700 font-medium">{currentStatus}</p>
        </div>
      </div>
    </div>
  );
};