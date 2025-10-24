import React, { useState, useEffect } from 'react';
import { TrendAnalysis } from '../types';
import { Brain, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Info, Zap } from 'lucide-react';

interface AIAnalysisProps {
  analysis: TrendAnalysis;
}

interface EnhancedAnalysis {
  llmInsights: {
    insights: string;
    source: string;
    timestamp: string;
  };
  llmRecommendations: {
    recommendations: string[];
    source: string;
    timestamp: string;
  };
  enhanced: boolean;
  enhancementTimestamp: string;
}

export const AIAnalysis: React.FC<AIAnalysisProps> = ({ analysis }) => {
  const [enhancedAnalysis, setEnhancedAnalysis] = useState<EnhancedAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  useEffect(() => {
    loadEnhancedAnalysis();
  }, []);

  const loadEnhancedAnalysis = async () => {
    try {
      setLoading(true);
      const apiKey = localStorage.getItem('huggingFaceApiKey');
      const requestBody = apiKey ? { apiKey } : {};
      
      const response = await fetch(`${apiUrl}/api/analysis/enhanced`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        setEnhancedAnalysis(data);
      }
    } catch (error) {
      console.error('Error loading enhanced analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center mb-6">
        <div className="bg-blue-100 p-2 rounded-full mr-3">
          <Brain className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800">AI Analysis</h2>
        {enhancedAnalysis?.enhanced && (
          <div className="ml-3 flex items-center">
            <Zap className="h-4 w-4 text-yellow-500 mr-1" />
            <span className="text-sm text-yellow-600 font-medium">AI Enhanced</span>
          </div>
        )}
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="text-gray-500">Loading AI analysis...</div>
        </div>
      )}

      {enhancedAnalysis && (
        <>
          {/* AI Insights */}
          <div className="mb-6">
            <h4 className="text-md font-semibold text-gray-900 mb-3">AI Insights</h4>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start">
                <div className="bg-blue-100 p-1 rounded-full mr-3 mt-0.5">
                  <Brain className="h-3 w-3 text-blue-600" />
                </div>
                <p className="text-sm text-gray-700">{enhancedAnalysis.llmInsights.insights}</p>
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="mb-6">
            <h4 className="text-md font-semibold text-gray-900 mb-3">AI Recommendations</h4>
            <div className="space-y-2">
              {enhancedAnalysis.llmRecommendations.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start">
                  <div className="bg-green-100 p-1 rounded-full mr-3 mt-0.5">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-700">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                {enhancedAnalysis.llmInsights.source === 'huggingface' ? (
                  <span className="text-green-600">✓ AI Enhanced Analysis Active</span>
                ) : (
                  <span className="text-yellow-600">⚠ Using Fallback Responses</span>
                )}
              </div>
              <div>
                Last updated: {new Date(enhancedAnalysis.enhancementTimestamp).toLocaleString()}
              </div>
            </div>
          </div>
        </>
      )}

      {!enhancedAnalysis && !loading && (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">No AI analysis available</div>
          <button
            onClick={loadEnhancedAnalysis}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Load AI Analysis
          </button>
        </div>
      )}
    </div>
  );
};