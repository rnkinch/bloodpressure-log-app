import React, { useState, useEffect } from 'react';
import ApiKeyConfig from './ApiKeyConfig';

interface AIInsights {
  insights: string;
  source: string;
  timestamp: string;
}

interface LLMRecommendations {
  recommendations: string[];
  source: string;
  timestamp: string;
}

interface EnhancedAnalysis {
  llmInsights: AIInsights;
  llmRecommendations: LLMRecommendations;
  enhanced: boolean;
  enhancementTimestamp: string;
  riskAssessment?: {
    current?: string;
    historical?: string;
    lifestyle?: string;
    overall?: string;
    riskScore?: number;
  };
  trendAnalysis?: {
    systolic?: {
      direction?: string;
      confidence?: string;
    };
    diastolic?: {
      direction?: string;
      confidence?: string;
    };
    heartRate?: {
      direction?: string;
      confidence?: string;
    };
    volatility?: {
      level?: string;
      systolicStdDev?: number;
      diastolicStdDev?: number;
    };
  };
  lifestyleCorrelation?: {
    smoking?: {
      impact?: string;
      correlation?: number;
    };
    alcohol?: {
      moderateDrinking?: {
        impact?: string;
      };
      lightDrinking?: {
        impact?: string;
      };
    };
    overallImpact?: number;
  };
  circadianAnalysis?: {
    morning?: {
      averageSystolic?: number;
      averageDiastolic?: number;
      readingCount?: number;
    };
    afternoon?: {
      averageSystolic?: number;
      averageDiastolic?: number;
      readingCount?: number;
    };
    evening?: {
      averageSystolic?: number;
      averageDiastolic?: number;
      readingCount?: number;
    };
    optimalTime?: string;
  };
  predictiveInsights?: {
    shortTerm?: {
      systolic?: number;
      diastolic?: number;
    };
    longTerm?: {
      projected30Day?: {
        systolic?: number;
        diastolic?: number;
      };
      confidence?: number;
    };
    confidence?: number;
  };
  dataQuality?: {
    totalReadings?: number;
    timeSpanDays?: number;
    quality?: string;
    averageFrequency?: number;
  };
}

interface QAResponse {
  question: string;
  answer: {
    answer: string;
    source: string;
  };
  timestamp: string;
}

const EnhancedAIFeatures: React.FC = () => {
  const [enhancedAnalysis, setEnhancedAnalysis] = useState<EnhancedAnalysis | null>(null);
  const [qaResponse, setQAResponse] = useState<QAResponse | null>(null);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'overview' | 'trends' | 'lifestyle' | 'predictions' | 'recommendations' | 'qa'>('overview');
  const [apiKey, setApiKey] = useState<string>('');
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  useEffect(() => {
    // Load API key from localStorage on component mount
    const storedApiKey = localStorage.getItem('huggingFaceApiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setApiKeyConfigured(true);
    }
    loadEnhancedAnalysis();
  }, []);

  useEffect(() => {
    // Reload analysis when API key changes
    if (apiKey) {
      loadEnhancedAnalysis();
    }
  }, [apiKey]);

  const loadEnhancedAnalysis = async () => {
    try {
      setLoading(true);
      
      console.log('Loading enhanced analysis with API key:', apiKey ? 'present' : 'missing');
      const requestBody = { apiKey: apiKey || '' };
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
        setApiKeyConfigured(data.llmInsights?.source === 'huggingface');
      }
    } catch (error) {
      console.error('Error loading enhanced analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) return;

    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/api/analysis/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question, apiKey }),
      });

      if (response.ok) {
        const data = await response.json();
        setQAResponse(data);
      }
    } catch (error) {
      console.error('Error asking question:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApiKeySet = (key: string) => {
    setApiKey(key);
    setApiKeyConfigured(true);
    // Load analysis with the new API key
    loadEnhancedAnalysis();
  };


  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Enhanced AI Features</h2>
        <div className="flex space-x-2">
          <button
            onClick={loadEnhancedAnalysis}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh Analysis'}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
            activeTab === 'overview'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('trends')}
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
            activeTab === 'trends'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Trends
        </button>
        <button
          onClick={() => setActiveTab('lifestyle')}
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
            activeTab === 'lifestyle'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Lifestyle
        </button>
        <button
          onClick={() => setActiveTab('predictions')}
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
            activeTab === 'predictions'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Predictions
        </button>
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
            activeTab === 'recommendations'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Recommendations
        </button>
        <button
          onClick={() => setActiveTab('qa')}
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
            activeTab === 'qa'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Ask Questions
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
            activeTab === 'config'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Settings
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'config' && (
        <div>
          <ApiKeyConfig onApiKeySet={handleApiKeySet} />
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">AI-Powered Insights</h3>
            {enhancedAnalysis?.llmInsights ? (
              <div>
                <p className="text-blue-700 mb-2">{enhancedAnalysis.llmInsights.insights}</p>
                <div className="text-sm text-blue-600">
                  Source: {enhancedAnalysis.llmInsights.source} | 
                  Generated: {new Date(enhancedAnalysis.llmInsights.timestamp).toLocaleString()}
                </div>
              </div>
            ) : (
              <p className="text-blue-700">Loading AI insights...</p>
            )}
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-800 mb-2">AI Recommendations</h3>
            {enhancedAnalysis?.llmRecommendations ? (
              <div>
                <ul className="list-disc list-inside space-y-1 text-green-700">
                  {enhancedAnalysis.llmRecommendations.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
                <div className="text-sm text-green-600 mt-2">
                  Source: {enhancedAnalysis.llmRecommendations.source} | 
                  Generated: {new Date(enhancedAnalysis.llmRecommendations.timestamp).toLocaleString()}
                </div>
              </div>
            ) : (
              <p className="text-green-700">Loading AI recommendations...</p>
            )}
          </div>

          {/* Risk Assessment */}
          {enhancedAnalysis && (
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Risk Assessment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-800">Current Risk</h4>
                  <p className="text-red-600 text-lg font-bold">{enhancedAnalysis.riskAssessment?.current || 'Unknown'}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800">Historical Risk</h4>
                  <p className="text-blue-600 text-lg font-bold">{enhancedAnalysis.riskAssessment?.historical || 'Unknown'}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800">Lifestyle Impact</h4>
                  <p className="text-green-600 text-lg font-bold">{enhancedAnalysis.riskAssessment?.lifestyle || 'Unknown'}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800">Overall Risk</h4>
                  <p className="text-purple-600 text-lg font-bold">{enhancedAnalysis.riskAssessment?.overall || 'Unknown'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="space-y-6">
          {enhancedAnalysis && (
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Trend Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Systolic Trend</h4>
                  <p className="text-gray-600 text-lg font-bold">{enhancedAnalysis.trendAnalysis?.systolic?.direction || 'Unknown'}</p>
                  <p className="text-sm text-gray-500">Confidence: {enhancedAnalysis.trendAnalysis?.systolic?.confidence || 'Unknown'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Diastolic Trend</h4>
                  <p className="text-gray-600 text-lg font-bold">{enhancedAnalysis.trendAnalysis?.diastolic?.direction || 'Unknown'}</p>
                  <p className="text-sm text-gray-500">Confidence: {enhancedAnalysis.trendAnalysis?.diastolic?.confidence || 'Unknown'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Heart Rate Trend</h4>
                  <p className="text-gray-600 text-lg font-bold">{enhancedAnalysis.trendAnalysis?.heartRate?.direction || 'Unknown'}</p>
                  <p className="text-sm text-gray-500">Confidence: {enhancedAnalysis.trendAnalysis?.heartRate?.confidence || 'Unknown'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'lifestyle' && (
        <div className="space-y-6">
          {enhancedAnalysis?.lifestyleCorrelation && (
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Lifestyle Impact Analysis</h3>
              <div className="space-y-4">
                {enhancedAnalysis.lifestyleCorrelation.smoking && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">Smoking Impact</h4>
                    <p className="text-yellow-700">{enhancedAnalysis.lifestyleCorrelation.smoking.impact}</p>
                    <p className="text-sm text-yellow-600">Correlation: {enhancedAnalysis.lifestyleCorrelation.smoking.correlation}%</p>
                  </div>
                )}
                {enhancedAnalysis.lifestyleCorrelation.alcohol && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Alcohol Impact</h4>
                    <p className="text-blue-700">
                      {enhancedAnalysis.lifestyleCorrelation.alcohol.moderateDrinking?.impact || 
                       enhancedAnalysis.lifestyleCorrelation.alcohol.lightDrinking?.impact || 'No data'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'predictions' && (
        <div className="space-y-6">
          {enhancedAnalysis?.predictiveInsights && (
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Predictive Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">Short-term (7 days)</h4>
                  <p className="text-purple-600 text-lg font-bold">
                    {enhancedAnalysis.predictiveInsights.shortTerm?.systolic || 0}/{enhancedAnalysis.predictiveInsights.shortTerm?.diastolic || 0}
                  </p>
                  <p className="text-sm text-purple-500">
                    Confidence: {((enhancedAnalysis.predictiveInsights.confidence || 0) * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-indigo-800 mb-2">Long-term (30 days)</h4>
                  <p className="text-indigo-600 text-lg font-bold">
                    {enhancedAnalysis.predictiveInsights.longTerm?.projected30Day?.systolic || 0}/{enhancedAnalysis.predictiveInsights.longTerm?.projected30Day?.diastolic || 0}
                  </p>
                  <p className="text-sm text-indigo-500">
                    Confidence: {((enhancedAnalysis.predictiveInsights.longTerm?.confidence || 0) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-800 mb-2">AI Recommendations</h3>
            {enhancedAnalysis?.llmRecommendations ? (
              <div>
                <ul className="list-disc list-inside space-y-1 text-green-700">
                  {enhancedAnalysis.llmRecommendations.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
                <div className="text-sm text-green-600 mt-2">
                  Source: {enhancedAnalysis.llmRecommendations.source} | 
                  Generated: {new Date(enhancedAnalysis.llmRecommendations.timestamp).toLocaleString()}
                </div>
              </div>
            ) : (
              <p className="text-green-700">Loading AI recommendations...</p>
            )}
          </div>
        </div>
      )}


      {activeTab === 'qa' && (
        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Ask AI About Your Health</h3>
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question about your blood pressure data..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
              />
              <button
                onClick={askQuestion}
                disabled={loading || !question.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Asking...' : 'Ask'}
              </button>
            </div>
            
            {qaResponse && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="mb-2">
                  <span className="font-medium text-gray-700">Q: </span>
                  <span className="text-gray-800">{qaResponse.question}</span>
                </div>
                <div className="mb-2">
                  <span className="font-medium text-gray-700">A: </span>
                  <span className="text-gray-800">{qaResponse.answer.answer}</span>
                </div>
                <div className="text-sm text-gray-500">
                  Source: {qaResponse.answer.source} | 
                  Answered: {new Date(qaResponse.timestamp).toLocaleString()}
                </div>
              </div>
            )}

            <div className="mt-4">
              <h4 className="font-medium text-gray-700 mb-2">Suggested Questions:</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  "What is a normal blood pressure range?",
                  "Why is my blood pressure trending upward?",
                  "How does smoking affect my readings?",
                  "What lifestyle changes should I make?",
                  "Are my recent readings concerning?"
                ].map((suggestedQ, index) => (
                  <button
                    key={index}
                    onClick={() => setQuestion(suggestedQ)}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300"
                  >
                    {suggestedQ}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Status Indicator */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            {apiKeyConfigured ? (
              <span className="text-green-600">✓ API Key Configured - Full AI Features Active</span>
            ) : enhancedAnalysis?.enhanced ? (
              <span className="text-blue-600">✓ AI Enhancement Active (Fallback Mode)</span>
            ) : (
              <span className="text-yellow-600">⚠ Using Fallback Responses</span>
            )}
          </div>
          <div>
            Last updated: {enhancedAnalysis?.enhancementTimestamp ? 
              new Date(enhancedAnalysis.enhancementTimestamp).toLocaleString() : 
              'Never'
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAIFeatures;
