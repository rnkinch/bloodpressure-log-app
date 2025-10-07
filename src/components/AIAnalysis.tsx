import React from 'react';
import { TrendAnalysis } from '../types';
import { Brain, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface AIAnalysisProps {
  analysis: TrendAnalysis;
}

export const AIAnalysis: React.FC<AIAnalysisProps> = ({ analysis }) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'text-red-600';
      case 'decreasing':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getRiskLevelIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'moderate':
        return <Info className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <div className="bg-purple-100 p-2 rounded-lg mr-3">
          <Brain className="h-6 w-6 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">AI Health Analysis</h3>
      </div>

      {/* Risk Level */}
      <div className="mb-6">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRiskLevelColor(analysis.riskLevel)}`}>
          {getRiskLevelIcon(analysis.riskLevel)}
          <span className="ml-2">
            Risk Level: {analysis.riskLevel.charAt(0).toUpperCase() + analysis.riskLevel.slice(1)}
          </span>
        </div>
      </div>

      {/* Trend Analysis */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-900 mb-3">Trend Analysis</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Systolic Pressure</span>
              {getTrendIcon(analysis.systolicTrend)}
            </div>
            <p className={`text-sm font-semibold ${getTrendColor(analysis.systolicTrend)}`}>
              {analysis.systolicTrend.charAt(0).toUpperCase() + analysis.systolicTrend.slice(1)}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Diastolic Pressure</span>
              {getTrendIcon(analysis.diastolicTrend)}
            </div>
            <p className={`text-sm font-semibold ${getTrendColor(analysis.diastolicTrend)}`}>
              {analysis.diastolicTrend.charAt(0).toUpperCase() + analysis.diastolicTrend.slice(1)}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Heart Rate</span>
              {getTrendIcon(analysis.heartRateTrend)}
            </div>
            <p className={`text-sm font-semibold ${getTrendColor(analysis.heartRateTrend)}`}>
              {analysis.heartRateTrend.charAt(0).toUpperCase() + analysis.heartRateTrend.slice(1)}
            </p>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-900 mb-3">Key Insights</h4>
        <div className="space-y-2">
          {analysis.insights.map((insight, index) => (
            <div key={index} className="flex items-start">
              <div className="bg-blue-100 p-1 rounded-full mr-3 mt-0.5">
                <Info className="h-3 w-3 text-blue-600" />
              </div>
              <p className="text-sm text-gray-700">{insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-3">Recommendations</h4>
        <div className="space-y-2">
          {analysis.recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start">
              <div className="bg-green-100 p-1 rounded-full mr-3 mt-0.5">
                <CheckCircle className="h-3 w-3 text-green-600" />
              </div>
              <p className="text-sm text-gray-700">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 font-medium">AI Analysis Disclaimer</p>
            <p className="text-xs text-blue-700 mt-1">
              This analysis is for informational purposes only and should not replace professional medical advice. 
              Always consult with a healthcare provider for medical decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
