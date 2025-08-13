import React from "react";
import { CheckCircle, Clock, Search } from "lucide-react";

interface Step {
  id: number;
  label: string;
  status: 'pending' | 'active' | 'completed';
}

interface ResearchStepsProps {
  steps: Step[];
}

export const ResearchSteps: React.FC<ResearchStepsProps> = ({ steps }) => {
  if (steps.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-orange-500" />
          Research Progress
        </h3>
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {step.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : step.status === 'active' ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                ) : (
                  <Clock className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <span 
                className={`text-sm font-medium transition-colors duration-500 ${
                  step.status === 'completed' 
                    ? 'text-green-700' 
                    : step.status === 'active'
                    ? 'text-orange-600'
                    : 'text-gray-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};