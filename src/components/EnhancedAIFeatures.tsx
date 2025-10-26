import React, { useState, useEffect } from 'react';
import ApiKeyConfig from './ApiKeyConfig';
import { api } from '../utils/api';

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
  const [activeTab, setActiveTab] = useState<'config' | 'dashboard' | 'insights' | 'health-plan' | 'forecast' | 'qa'>('dashboard');
  const [apiKey, setApiKey] = useState<string>('');
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  useEffect(() => {
    // Load API key from database on component mount
    const loadApiKey = async () => {
      try {
        const result = await api.getSetting('huggingface_api_key');
        if (result.value) {
          setApiKey(result.value);
          setApiKeyConfigured(true);
        }
      } catch (error) {
        console.error('Failed to load API key from database:', error);
      }
    };
    loadApiKey();
    loadEnhancedAnalysis();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Reload analysis when API key changes
    if (apiKey) {
      loadEnhancedAnalysis();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  const loadEnhancedAnalysis = async () => {
    try {
      setLoading(true);
      
      console.log('Loading enhanced analysis with API key:', apiKey ? 'present' : 'missing');
      
      // First, ensure we have the latest API key from the database
      try {
        const result = await api.getSetting('huggingface_api_key');
        if (result.value && (!apiKey || apiKey !== result.value)) {
          setApiKey(result.value);
        }
      } catch (err) {
        console.error('Failed to refresh API key:', err);
      }
      
      // Make the request with the most up-to-date API key
      const requestBody = { apiKey: apiKey || '' };
      const response = await fetch(`${apiUrl}/api/analysis/enhanced`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify(requestBody),
      });
      
      if (response.ok) {
        const data = await response.json();
        setEnhancedAnalysis(data);
        // Check if we're getting real HuggingFace responses
        setApiKeyConfigured(data.llmInsights?.source === 'huggingface');
        
        // Log source of insights for debugging
        console.log('Analysis source:', data.llmInsights?.source);
        console.log('Recommendations source:', data.llmRecommendations?.source);
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
      
      // First, ensure we have the latest API key
      try {
        const result = await api.getSetting('huggingface_api_key');
        if (result.value && (!apiKey || apiKey !== result.value)) {
          setApiKey(result.value);
        }
      } catch (err) {
        console.error('Failed to refresh API key:', err);
      }
      
      // Send the question with the current API key
      const response = await fetch(`${apiUrl}/api/analysis/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({ 
          question, 
          apiKey: apiKey || '',
          model: await api.getSetting('huggingface_model').then(res => res.value).catch(() => null)
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setQAResponse(data);
        
        // Update API key configuration status based on response source
        if (data.answer && data.answer.source) {
          console.log('Q&A response source:', data.answer.source);
          setApiKeyConfigured(data.answer.source === 'huggingface');
        }
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

      {/* Tab Navigation - Redesigned with icons for better UX */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap flex items-center space-x-1 ${
            activeTab === 'dashboard'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap flex items-center space-x-1 ${
            activeTab === 'insights'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span>Insights</span>
        </button>
        <button
          onClick={() => setActiveTab('health-plan')}
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap flex items-center space-x-1 ${
            activeTab === 'health-plan'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <span>Health Plan</span>
        </button>
        <button
          onClick={() => setActiveTab('forecast')}
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap flex items-center space-x-1 ${
            activeTab === 'forecast'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          <span>Forecast</span>
        </button>
        <button
          onClick={() => setActiveTab('qa')}
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap flex items-center space-x-1 ${
            activeTab === 'qa'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Ask AI</span>
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap flex items-center space-x-1 ${
            activeTab === 'config'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Settings</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'config' && (
        <div>
          <ApiKeyConfig onApiKeySet={handleApiKeySet} />
        </div>
      )}

      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Health Status Summary Card */}
          {enhancedAnalysis && (
            <div className="bg-white border rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Health Status Summary</h3>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  enhancedAnalysis.riskAssessment?.overall === 'low' ? 'bg-green-100 text-green-800' :
                  enhancedAnalysis.riskAssessment?.overall === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                  enhancedAnalysis.riskAssessment?.overall === 'high' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {enhancedAnalysis.riskAssessment?.overall === 'low' ? 'Healthy' :
                   enhancedAnalysis.riskAssessment?.overall === 'moderate' ? 'Attention Needed' :
                   enhancedAnalysis.riskAssessment?.overall === 'high' ? 'Medical Attention Advised' :
                   'Status Unknown'}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                  <div className="p-2 rounded-full bg-blue-100 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Blood Pressure</p>
                    <p className="font-bold text-gray-800">
                      {enhancedAnalysis.predictiveInsights?.shortTerm?.systolic || '?'}/
                      {enhancedAnalysis.predictiveInsights?.shortTerm?.diastolic || '?'} mmHg
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                  <div className="p-2 rounded-full bg-green-100 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Weight Status</p>
                    <p className="font-bold text-gray-800">
                      {(enhancedAnalysis.lifestyleCorrelation as any)?.weight?.bmiCategory || 'Unknown'}
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                  <div className="p-2 rounded-full bg-purple-100 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
              <div>
                    <p className="text-sm text-gray-500">BP Trend</p>
                    <p className="font-bold text-gray-800">
                      {enhancedAnalysis.trendAnalysis?.systolic?.direction || 'Stable'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* AI Insight Summary */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <h4 className="font-semibold text-blue-800">AI Health Summary</h4>
                </div>
                {enhancedAnalysis?.llmInsights ? (
                  <p className="text-blue-700">{enhancedAnalysis.llmInsights.insights}</p>
            ) : (
              <p className="text-blue-700">Loading AI insights...</p>
            )}
          </div>
            </div>
          )}
          
          {/* Top Recommendations */}
          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-800">Top Recommendations</h3>
          </div>

            {enhancedAnalysis?.llmRecommendations ? (
              <div className="space-y-3">
                {enhancedAnalysis.llmRecommendations.recommendations.slice(0, 3).map((rec, index) => (
                  <div key={index} className="flex items-start bg-gray-50 p-3 rounded-lg">
                    <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-gray-700">{rec}</p>
                  </div>
                ))}
                <button 
                  onClick={() => setActiveTab('health-plan')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center mt-2"
                >
                  View all recommendations
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            ) : (
              <p className="text-gray-500">Loading recommendations...</p>
            )}
          </div>

          {/* Risk Assessment */}
          {enhancedAnalysis && (
            <div className="bg-white border rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-800">Risk Assessment</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-4 rounded-lg ${
                  enhancedAnalysis.riskAssessment?.current === 'high' ? 'bg-red-50' :
                  enhancedAnalysis.riskAssessment?.current === 'moderate' ? 'bg-yellow-50' :
                  'bg-green-50'
                }`}>
                  <h4 className="font-semibold text-gray-700 text-sm">Current Risk</h4>
                  <p className={`text-lg font-bold ${
                    enhancedAnalysis.riskAssessment?.current === 'high' ? 'text-red-600' :
                    enhancedAnalysis.riskAssessment?.current === 'moderate' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {enhancedAnalysis.riskAssessment?.current || 'Unknown'}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 text-sm">Historical</h4>
                  <p className="text-blue-600 text-lg font-bold">{enhancedAnalysis.riskAssessment?.historical || 'Unknown'}</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 text-sm">Lifestyle Impact</h4>
                  <p className="text-indigo-600 text-lg font-bold">{enhancedAnalysis.riskAssessment?.lifestyle || 'Unknown'}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 text-sm">Overall Risk</h4>
                  <p className="text-purple-600 text-lg font-bold">{enhancedAnalysis.riskAssessment?.overall || 'Unknown'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* AI Insights Card */}
          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-800">AI Health Insights</h3>
            </div>
            
            {enhancedAnalysis?.llmInsights ? (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-line">{enhancedAnalysis.llmInsights.insights}</p>
                <div className="flex items-center mt-3 text-sm text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Generated: {new Date(enhancedAnalysis.llmInsights.timestamp).toLocaleString()}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Loading AI insights...</p>
            )}
          </div>
          
          {/* Trend Analysis Card */}
          {enhancedAnalysis && (
            <div className="bg-white border rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-800">Blood Pressure Trends</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`bg-white border rounded-lg p-4 ${
                  enhancedAnalysis.trendAnalysis?.systolic?.direction === 'increasing' ? 'border-red-200' :
                  enhancedAnalysis.trendAnalysis?.systolic?.direction === 'decreasing' ? 'border-green-200' :
                  'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-700">Systolic Trend</h4>
                    <div className={`w-2 h-2 rounded-full ${
                      enhancedAnalysis.trendAnalysis?.systolic?.direction === 'increasing' ? 'bg-red-500' :
                      enhancedAnalysis.trendAnalysis?.systolic?.direction === 'decreasing' ? 'bg-green-500' :
                      'bg-gray-500'
                    }`}></div>
                  </div>
                  <div className="flex items-center">
                    {enhancedAnalysis.trendAnalysis?.systolic?.direction === 'increasing' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    ) : enhancedAnalysis.trendAnalysis?.systolic?.direction === 'decreasing' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                      </svg>
                    )}
                    <p className="text-gray-700 text-lg font-medium">{enhancedAnalysis.trendAnalysis?.systolic?.direction || 'Stable'}</p>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Confidence: {enhancedAnalysis.trendAnalysis?.systolic?.confidence || 'Unknown'}</p>
                </div>
                
                <div className={`bg-white border rounded-lg p-4 ${
                  enhancedAnalysis.trendAnalysis?.diastolic?.direction === 'increasing' ? 'border-red-200' :
                  enhancedAnalysis.trendAnalysis?.diastolic?.direction === 'decreasing' ? 'border-green-200' :
                  'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-700">Diastolic Trend</h4>
                    <div className={`w-2 h-2 rounded-full ${
                      enhancedAnalysis.trendAnalysis?.diastolic?.direction === 'increasing' ? 'bg-red-500' :
                      enhancedAnalysis.trendAnalysis?.diastolic?.direction === 'decreasing' ? 'bg-green-500' :
                      'bg-gray-500'
                    }`}></div>
                  </div>
                  <div className="flex items-center">
                    {enhancedAnalysis.trendAnalysis?.diastolic?.direction === 'increasing' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    ) : enhancedAnalysis.trendAnalysis?.diastolic?.direction === 'decreasing' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                      </svg>
                    )}
                    <p className="text-gray-700 text-lg font-medium">{enhancedAnalysis.trendAnalysis?.diastolic?.direction || 'Stable'}</p>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Confidence: {enhancedAnalysis.trendAnalysis?.diastolic?.confidence || 'Unknown'}</p>
                </div>
                
                <div className={`bg-white border rounded-lg p-4 ${
                  enhancedAnalysis.trendAnalysis?.heartRate?.direction === 'increasing' ? 'border-red-200' :
                  enhancedAnalysis.trendAnalysis?.heartRate?.direction === 'decreasing' ? 'border-green-200' :
                  'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-700">Heart Rate Trend</h4>
                    <div className={`w-2 h-2 rounded-full ${
                      enhancedAnalysis.trendAnalysis?.heartRate?.direction === 'increasing' ? 'bg-red-500' :
                      enhancedAnalysis.trendAnalysis?.heartRate?.direction === 'decreasing' ? 'bg-green-500' :
                      'bg-gray-500'
                    }`}></div>
                  </div>
                  <div className="flex items-center">
                    {enhancedAnalysis.trendAnalysis?.heartRate?.direction === 'increasing' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    ) : enhancedAnalysis.trendAnalysis?.heartRate?.direction === 'decreasing' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                      </svg>
                    )}
                    <p className="text-gray-700 text-lg font-medium">{enhancedAnalysis.trendAnalysis?.heartRate?.direction || 'Stable'}</p>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Confidence: {enhancedAnalysis.trendAnalysis?.heartRate?.confidence || 'Unknown'}</p>
                </div>
              </div>
              
              {/* Volatility */}
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h4 className="font-semibold text-gray-700">Blood Pressure Volatility</h4>
                </div>
                <p className="text-gray-700">
                  Your readings show <span className="font-medium">{enhancedAnalysis.trendAnalysis?.volatility?.level || 'normal'}</span> volatility.
                </p>
              </div>
            </div>
          )}
          
          {/* Circadian Patterns */}
          {enhancedAnalysis?.circadianAnalysis && (
            <div className="bg-white border rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-800">Circadian Patterns</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-amber-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-amber-800 mb-2">Morning Average</h4>
                  <p className="text-amber-700 text-lg font-bold">
                    {enhancedAnalysis.circadianAnalysis.morning?.averageSystolic || 0}/
                    {enhancedAnalysis.circadianAnalysis.morning?.averageDiastolic || 0}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Afternoon Average</h4>
                  <p className="text-blue-700 text-lg font-bold">
                    {enhancedAnalysis.circadianAnalysis.afternoon?.averageSystolic || 0}/
                    {enhancedAnalysis.circadianAnalysis.afternoon?.averageDiastolic || 0}
                  </p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-indigo-800 mb-2">Evening Average</h4>
                  <p className="text-indigo-700 text-lg font-bold">
                    {enhancedAnalysis.circadianAnalysis.evening?.averageSystolic || 0}/
                    {enhancedAnalysis.circadianAnalysis.evening?.averageDiastolic || 0}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-1">Optimal Monitoring Time</h4>
                <p className="text-gray-600">
                  {enhancedAnalysis.circadianAnalysis.optimalTime || 'No optimal time determined yet'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'health-plan' && (
        <div className="space-y-6">
          {/* AI Recommendations Card */}
          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-800">Personalized Health Plan</h3>
              </div>
              <div className="text-sm text-gray-500">
                Updated {enhancedAnalysis?.enhancementTimestamp ? new Date(enhancedAnalysis.enhancementTimestamp).toLocaleDateString() : 'Never'}
              </div>
            </div>
            
            {enhancedAnalysis?.llmRecommendations ? (
              <div className="space-y-4">
                <p className="text-gray-700">Based on your health data, here are personalized recommendations to improve your cardiovascular health:</p>
                
                {enhancedAnalysis.llmRecommendations.recommendations.map((rec, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 flex items-start">
                    <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-gray-700">{rec}</p>
                    </div>
                  </div>
                ))}
                
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-4">
                  <div className="flex items-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-medium text-blue-700">Medical Disclaimer</p>
                  </div>
                  <p className="text-sm text-blue-600">
                    These recommendations are generated by AI based on your health data. Always consult with your healthcare provider before making significant changes to your health routine.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Loading your personalized health plan...</p>
            )}
          </div>
          
          {/* Lifestyle Impact Analysis */}
          {enhancedAnalysis?.lifestyleCorrelation && (
            <div className="bg-white border rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-800">Lifestyle Factors</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Weight Impact */}
                {(enhancedAnalysis.lifestyleCorrelation as any).weight && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-green-800">Weight</h4>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        (enhancedAnalysis.lifestyleCorrelation as any).weight.impact === 'significant' ? 'bg-red-100 text-red-800' :
                        (enhancedAnalysis.lifestyleCorrelation as any).weight.impact === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {(enhancedAnalysis.lifestyleCorrelation as any).weight.impact === 'significant' ? 'High Impact' :
                         (enhancedAnalysis.lifestyleCorrelation as any).weight.impact === 'moderate' ? 'Moderate Impact' :
                         'Low Impact'}
                      </div>
                    </div>
                    <p className="text-green-700 mb-1">
                      Status: <span className="font-medium">{(enhancedAnalysis.lifestyleCorrelation as any).weight.bmiCategory || 'Unknown'}</span>
                    </p>
                    <p className="text-green-700 mb-1">
                      Trend: <span className="font-medium">{(enhancedAnalysis.lifestyleCorrelation as any).weight.trend || 'Stable'}</span>
                    </p>
                    <p className="text-sm text-green-600">
                      BP Correlation: {((enhancedAnalysis.lifestyleCorrelation as any).weight.correlation || 0).toFixed(2)}
                    </p>
                  </div>
                )}
                
                {/* Smoking Impact */}
                {enhancedAnalysis.lifestyleCorrelation.smoking && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-yellow-800">Smoking</h4>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        enhancedAnalysis.lifestyleCorrelation.smoking.impact === 'significant' ? 'bg-red-100 text-red-800' :
                        enhancedAnalysis.lifestyleCorrelation.smoking.impact === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {enhancedAnalysis.lifestyleCorrelation.smoking.impact === 'significant' ? 'High Impact' :
                         enhancedAnalysis.lifestyleCorrelation.smoking.impact === 'moderate' ? 'Moderate Impact' :
                         'Low Impact'}
                      </div>
                    </div>
                    <p className="text-yellow-700">
                      {enhancedAnalysis.lifestyleCorrelation.smoking.impact === 'significant' 
                        ? 'Smoking significantly affects your blood pressure.'
                        : enhancedAnalysis.lifestyleCorrelation.smoking.impact === 'moderate'
                        ? 'Smoking moderately affects your blood pressure.'
                        : 'Smoking has minimal impact on your blood pressure.'}
                    </p>
                    <p className="text-sm text-yellow-600 mt-1">
                      Correlation: {(enhancedAnalysis.lifestyleCorrelation.smoking.correlation || 0).toFixed(2)}
                    </p>
                  </div>
                )}
                
                {/* Alcohol Impact */}
                {enhancedAnalysis.lifestyleCorrelation.alcohol && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-blue-800">Alcohol</h4>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        (enhancedAnalysis.lifestyleCorrelation.alcohol.moderateDrinking?.impact === 'significant' || 
                         enhancedAnalysis.lifestyleCorrelation.alcohol.lightDrinking?.impact === 'significant') ? 'bg-red-100 text-red-800' :
                        (enhancedAnalysis.lifestyleCorrelation.alcohol.moderateDrinking?.impact === 'moderate' || 
                         enhancedAnalysis.lifestyleCorrelation.alcohol.lightDrinking?.impact === 'moderate') ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {(enhancedAnalysis.lifestyleCorrelation.alcohol.moderateDrinking?.impact === 'significant' || 
                          enhancedAnalysis.lifestyleCorrelation.alcohol.lightDrinking?.impact === 'significant') ? 'High Impact' :
                         (enhancedAnalysis.lifestyleCorrelation.alcohol.moderateDrinking?.impact === 'moderate' || 
                          enhancedAnalysis.lifestyleCorrelation.alcohol.lightDrinking?.impact === 'moderate') ? 'Moderate Impact' :
                         'Low Impact'}
                      </div>
                    </div>
                    <p className="text-blue-700">
                      {enhancedAnalysis.lifestyleCorrelation.alcohol.moderateDrinking?.impact || 
                       enhancedAnalysis.lifestyleCorrelation.alcohol.lightDrinking?.impact || 'No data available'}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Combined Lifestyle Impact */}
              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">Overall Lifestyle Impact</h4>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        (enhancedAnalysis.lifestyleCorrelation.overallImpact || 0) > 70 ? 'bg-red-600' :
                        (enhancedAnalysis.lifestyleCorrelation.overallImpact || 0) > 40 ? 'bg-yellow-500' :
                        'bg-green-600'
                      }`} 
                      style={{ width: `${Math.min(100, enhancedAnalysis.lifestyleCorrelation.overallImpact || 0)}%` }}
                    ></div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    {enhancedAnalysis.lifestyleCorrelation.overallImpact || 0}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'forecast' && (
        <div className="space-y-6">
          {/* Predictions Card */}
          {enhancedAnalysis?.predictiveInsights && (
            <div className="bg-white border rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-800">Blood Pressure Forecast</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-purple-200 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-purple-800">7-Day Forecast</h4>
                    <div className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                      Short-term
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center my-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-700">
                        {enhancedAnalysis.predictiveInsights.shortTerm?.systolic || '?'}/
                        {enhancedAnalysis.predictiveInsights.shortTerm?.diastolic || '?'}
                      </div>
                      <div className="text-sm text-purple-600 mt-1">mmHg</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 bg-purple-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-purple-700">Confidence Level</span>
                      <span className="text-sm font-medium text-purple-800">
                        {((enhancedAnalysis.predictiveInsights.confidence || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-purple-200 rounded-full h-1.5 mt-1">
                      <div 
                        className="bg-purple-600 h-1.5 rounded-full" 
                        style={{ width: `${(enhancedAnalysis.predictiveInsights.confidence || 0) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border border-indigo-200 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-indigo-800">30-Day Forecast</h4>
                    <div className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded-full">
                      Long-term
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center my-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-indigo-700">
                        {enhancedAnalysis.predictiveInsights.longTerm?.projected30Day?.systolic || '?'}/
                        {enhancedAnalysis.predictiveInsights.longTerm?.projected30Day?.diastolic || '?'}
                      </div>
                      <div className="text-sm text-indigo-600 mt-1">mmHg</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 bg-indigo-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-indigo-700">Confidence Level</span>
                      <span className="text-sm font-medium text-indigo-800">
                        {((enhancedAnalysis.predictiveInsights.longTerm?.confidence || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-indigo-200 rounded-full h-1.5 mt-1">
                      <div 
                        className="bg-indigo-600 h-1.5 rounded-full" 
                        style={{ width: `${(enhancedAnalysis.predictiveInsights.longTerm?.confidence || 0) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h4 className="font-semibold text-gray-700">About This Forecast</h4>
                </div>
                <p className="text-gray-600 text-sm">
                  This forecast is based on your historical blood pressure readings, lifestyle factors, and trend analysis. 
                  The confidence level indicates the reliability of the prediction based on available data.
                  Continue regular monitoring for more accurate forecasts.
                </p>
              </div>
            </div>
          )}
        </div>
      )}


      {activeTab === 'qa' && (
        <div className="space-y-6">
          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-800">Ask AI About Your Health</h3>
        </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="relative">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a question about your blood pressure, weight, or health..."
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
              />
              <button
                onClick={askQuestion}
                disabled={loading || !question.trim()}
                  className="absolute right-2 top-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  aria-label="Ask question"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  )}
              </button>
              </div>
            </div>
            
            {/* Conversation Area */}
            {qaResponse && (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
                <div className="bg-gray-50 p-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="bg-blue-100 rounded-full p-2 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Your Question</p>
                      <p className="text-gray-800">{qaResponse.question}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50">
                  <div className="flex items-start">
                    <div className="bg-blue-600 rounded-full p-2 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-700 mb-2">AI Response</p>
                      <div className="text-gray-800 whitespace-pre-line">{qaResponse.answer.answer}</div>
                      <div className="text-sm text-gray-500 mt-3 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(qaResponse.timestamp).toLocaleString()}
                      </div>
                    </div>
                </div>
                </div>
              </div>
            )}

            {/* Suggested Questions */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Suggested Questions
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  "What is a normal blood pressure range?",
                  "Why is my blood pressure trending upward?",
                  "How does smoking affect my readings?",
                  "How does my weight impact my blood pressure?",
                  "What lifestyle changes should I make?",
                  "Are my recent readings concerning?",
                  "What time of day should I measure my blood pressure?",
                  "How can I reduce my blood pressure naturally?"
                ].map((suggestedQ, index) => (
                  <button
                    key={index}
                    onClick={() => setQuestion(suggestedQ)}
                    className="px-4 py-2 bg-white border border-gray-200 text-left text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {suggestedQ}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Disclaimer */}
            <div className="mt-6 bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500">
                AI responses are based on your health data and medical guidelines. They are not a substitute for professional medical advice.
                Always consult with a healthcare provider for medical decisions.
              </p>
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
