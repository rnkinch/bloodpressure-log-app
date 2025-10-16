import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Info, Activity, Clock, Target, Zap, Shield } from 'lucide-react';
import { api } from '../utils/api';

interface AdvancedAnalysis {
  timestamp: string;
  dataQuality: {
    totalReadings: number;
    timeSpanDays: number;
    averageFrequency: number;
    quality: string;
    recommendations: string[];
  };
  riskAssessment: {
    current: string;
    historical: string;
    progression: string;
    lifestyle: string;
    overall: string;
    riskScore: number;
    nextAssessment: {
      days: number;
      date: string;
      reason: string;
    };
  };
  trendAnalysis: {
    systolic: {
      direction: string;
      slope: number;
      rSquared: number;
      confidence: string;
      predictedValue: number;
      changeRate: number;
    };
    diastolic: {
      direction: string;
      slope: number;
      rSquared: number;
      confidence: string;
      predictedValue: number;
      changeRate: number;
    };
    heartRate: {
      direction: string;
      slope: number;
      rSquared: number;
      confidence: string;
      predictedValue: number;
      changeRate: number;
    };
    volatility: {
      level: string;
      score: number;
      systolicStdDev: number;
      diastolicStdDev: number;
    };
    trendStrength: string;
    significance: string;
  };
  lifestyleCorrelation: {
    smoking: {
      correlation: number;
      impact: string;
      confidence: string;
      averageDifference: {
        systolic: number;
        diastolic: number;
      };
    };
    alcohol: {
      heavyDrinking: any;
      moderateDrinking: any;
      lightDrinking: any;
      noDrinking: any;
    };
    overallImpact: number;
    recommendations: string[];
  };
  circadianAnalysis: {
    morning?: any;
    afternoon?: any;
    evening?: any;
    night?: any;
    optimalTime: string;
    concernTime: string;
    recommendations: string[];
  };
  predictiveInsights: {
    shortTerm: {
      status: string;
      systolic: number;
      diastolic: number;
      trend: any;
      confidence: number;
    };
    longTerm: {
      status: string;
      projected30Day: {
        systolic: number;
        diastolic: number;
      };
      trend: any;
      confidence: number;
    };
    confidence: number;
    riskFactors: string[];
    interventions: string[];
  };
  personalizedRecommendations: Array<{
    category: string;
    priority: string;
    message: string;
    action: string;
  }>;
  medicalAlerts: Array<{
    type: string;
    message: string;
    reading: any;
    timestamp: string;
  }>;
  confidenceScore: number;
}

export const EnhancedAIAnalysis: React.FC = () => {
  const [analysis, setAnalysis] = useState<AdvancedAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'lifestyle' | 'predictions' | 'recommendations'>('overview');

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAdvancedAnalysis();
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analysis');
    } finally {
      setLoading(false);
    }
  };

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

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-green-600 bg-green-50';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generating AI-powered health analysis...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Analysis Unavailable</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAnalysis}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retry Analysis
          </button>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-12">
          <Info className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analysis Available</h3>
          <p className="text-gray-600">Add more blood pressure readings to generate AI analysis.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg mr-4">
              <Brain className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">AI Health Analysis</h2>
              <p className="text-purple-100">Powered by advanced medical algorithms</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-purple-100">Confidence Score</div>
            <div className="text-2xl font-bold">{Math.round(analysis.confidenceScore * 100)}%</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'trends', label: 'Trends', icon: TrendingUp },
            { id: 'lifestyle', label: 'Lifestyle', icon: Target },
            { id: 'predictions', label: 'Predictions', icon: Zap },
            { id: 'recommendations', label: 'Recommendations', icon: CheckCircle }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Risk Assessment */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Risk Assessment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-600">Overall Risk</div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRiskLevelColor(analysis.riskAssessment.overall)}`}>
                    {analysis.riskAssessment.overall.charAt(0).toUpperCase() + analysis.riskAssessment.overall.slice(1)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Score: {analysis.riskAssessment.riskScore}</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-600">Current Status</div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRiskLevelColor(analysis.riskAssessment.current)}`}>
                    {analysis.riskAssessment.current.charAt(0).toUpperCase() + analysis.riskAssessment.current.slice(1)}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-600">Progression</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {analysis.riskAssessment.progression === 'increasing' ? '📈' : 
                     analysis.riskAssessment.progression === 'decreasing' ? '📉' : '➡️'}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">{analysis.riskAssessment.progression}</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-600">Next Assessment</div>
                  <div className="text-lg font-semibold text-gray-900">{analysis.riskAssessment.nextAssessment.days} days</div>
                  <div className="text-xs text-gray-500">
                    {new Date(analysis.riskAssessment.nextAssessment.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Data Quality */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Info className="h-5 w-5 mr-2" />
                Data Quality
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{analysis.dataQuality.totalReadings}</div>
                  <div className="text-sm text-gray-600">Total Readings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{analysis.dataQuality.timeSpanDays}</div>
                  <div className="text-sm text-gray-600">Days Tracked</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{analysis.dataQuality.averageFrequency.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">Readings/Day</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-sm text-gray-600 mb-2">Quality Status: 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    analysis.dataQuality.quality === 'excellent' ? 'bg-green-100 text-green-800' :
                    analysis.dataQuality.quality === 'good' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {analysis.dataQuality.quality.replace('_', ' ')}
                  </span>
                </div>
                {analysis.dataQuality.recommendations.length > 0 && (
                  <div className="text-sm text-gray-700">
                    <strong>Recommendations:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {analysis.dataQuality.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Medical Alerts */}
            {analysis.medicalAlerts.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Medical Alerts
                </h3>
                <div className="space-y-3">
                  {analysis.medicalAlerts.map((alert, index) => (
                    <div key={index} className={`p-3 rounded-lg border-l-4 ${
                      alert.type === 'critical' ? 'bg-red-100 border-red-500' : 'bg-yellow-100 border-yellow-500'
                    }`}>
                      <div className="flex items-start">
                        <AlertTriangle className={`h-5 w-5 mr-3 mt-0.5 ${
                          alert.type === 'critical' ? 'text-red-600' : 'text-yellow-600'
                        }`} />
                        <div>
                          <p className="font-medium text-gray-900">{alert.message}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-6">
            {/* Trend Analysis */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Systolic Pressure</span>
                    {getTrendIcon(analysis.trendAnalysis.systolic.direction)}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {analysis.trendAnalysis.systolic.direction.charAt(0).toUpperCase() + analysis.trendAnalysis.systolic.direction.slice(1)}
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>Slope: {analysis.trendAnalysis.systolic.slope.toFixed(3)}</div>
                    <div>R²: {analysis.trendAnalysis.systolic.rSquared.toFixed(3)}</div>
                    <div>Predicted: {analysis.trendAnalysis.systolic.predictedValue.toFixed(1)} mmHg</div>
                    <div>Monthly Change: {analysis.trendAnalysis.systolic.changeRate.toFixed(1)} mmHg</div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Diastolic Pressure</span>
                    {getTrendIcon(analysis.trendAnalysis.diastolic.direction)}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {analysis.trendAnalysis.diastolic.direction.charAt(0).toUpperCase() + analysis.trendAnalysis.diastolic.direction.slice(1)}
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>Slope: {analysis.trendAnalysis.diastolic.slope.toFixed(3)}</div>
                    <div>R²: {analysis.trendAnalysis.diastolic.rSquared.toFixed(3)}</div>
                    <div>Predicted: {analysis.trendAnalysis.diastolic.predictedValue.toFixed(1)} mmHg</div>
                    <div>Monthly Change: {analysis.trendAnalysis.diastolic.changeRate.toFixed(1)} mmHg</div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Heart Rate</span>
                    {getTrendIcon(analysis.trendAnalysis.heartRate.direction)}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {analysis.trendAnalysis.heartRate.direction.charAt(0).toUpperCase() + analysis.trendAnalysis.heartRate.direction.slice(1)}
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>Slope: {analysis.trendAnalysis.heartRate.slope.toFixed(3)}</div>
                    <div>R²: {analysis.trendAnalysis.heartRate.rSquared.toFixed(3)}</div>
                    <div>Predicted: {analysis.trendAnalysis.heartRate.predictedValue.toFixed(1)} BPM</div>
                    <div>Monthly Change: {analysis.trendAnalysis.heartRate.changeRate.toFixed(1)} BPM</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Volatility Analysis */}
            <div className="bg-yellow-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Volatility Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{analysis.trendAnalysis.volatility.level.toUpperCase()}</div>
                  <div className="text-sm text-gray-600">Volatility Level</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{analysis.trendAnalysis.volatility.systolicStdDev.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">Systolic Std Dev</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{analysis.trendAnalysis.volatility.diastolicStdDev.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">Diastolic Std Dev</div>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-700">
                {analysis.trendAnalysis.volatility.level === 'high' && 
                  'High variability in blood pressure readings may indicate need for medical evaluation.'}
                {analysis.trendAnalysis.volatility.level === 'moderate' && 
                  'Moderate variability detected. Consider lifestyle factors affecting consistency.'}
                {analysis.trendAnalysis.volatility.level === 'low' && 
                  'Good consistency in blood pressure readings.'}
              </div>
            </div>

            {/* Circadian Analysis */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Circadian Patterns
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(analysis.circadianAnalysis).filter(([key]) => 
                  ['morning', 'afternoon', 'evening', 'night'].includes(key)
                ).map(([period, data]) => (
                  <div key={period} className="bg-white rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-700 capitalize mb-2">{period}</div>
                    {data ? (
                      <>
                        <div className="text-lg font-bold text-gray-900">
                          {data.averageSystolic}/{data.averageDiastolic}
                        </div>
                        <div className="text-xs text-gray-500">mmHg</div>
                        <div className="text-xs text-gray-500 mt-1">{data.readingCount} readings</div>
                      </>
                    ) : (
                      <div className="text-sm text-gray-500">No data</div>
                    )}
                  </div>
                ))}
              </div>
              {analysis.circadianAnalysis.optimalTime && (
                <div className="mt-4 text-sm text-green-700">
                  <strong>Optimal Time:</strong> {analysis.circadianAnalysis.optimalTime} shows your best blood pressure readings.
                </div>
              )}
              {analysis.circadianAnalysis.concernTime && (
                <div className="mt-2 text-sm text-red-700">
                  <strong>Concern Time:</strong> {analysis.circadianAnalysis.concernTime} shows consistently elevated readings.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'lifestyle' && (
          <div className="space-y-6">
            {/* Smoking Analysis */}
            <div className="bg-orange-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Smoking Impact Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{analysis.lifestyleCorrelation.smoking.correlation.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">Correlation Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 capitalize">{analysis.lifestyleCorrelation.smoking.impact}</div>
                  <div className="text-sm text-gray-600">Impact Level</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 capitalize">{analysis.lifestyleCorrelation.smoking.confidence}</div>
                  <div className="text-sm text-gray-600">Confidence</div>
                </div>
              </div>
              {analysis.lifestyleCorrelation.smoking.averageDifference && (
                <div className="mt-4 text-sm text-gray-700">
                  <strong>Average Difference on Smoking Days:</strong>
                  <div className="ml-4">
                    Systolic: {analysis.lifestyleCorrelation.smoking.averageDifference.systolic > 0 ? '+' : ''}{analysis.lifestyleCorrelation.smoking.averageDifference.systolic.toFixed(1)} mmHg
                  </div>
                  <div className="ml-4">
                    Diastolic: {analysis.lifestyleCorrelation.smoking.averageDifference.diastolic > 0 ? '+' : ''}{analysis.lifestyleCorrelation.smoking.averageDifference.diastolic.toFixed(1)} mmHg
                  </div>
                </div>
              )}
            </div>

            {/* Alcohol Analysis */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Alcohol Consumption Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(analysis.lifestyleCorrelation.alcohol).map(([category, data]) => (
                  <div key={category} className="bg-white rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-700 capitalize mb-2">{category.replace(/([A-Z])/g, ' $1')}</div>
                    {data && data.averageReadings ? (
                      <>
                        <div className="text-lg font-bold text-gray-900">
                          {data.averageReadings.systolic}/{data.averageReadings.diastolic}
                        </div>
                        <div className="text-xs text-gray-500">mmHg</div>
                        <div className="text-xs text-gray-500 mt-1">{data.readingCount} readings</div>
                        <div className="text-xs text-gray-500 capitalize">{data.impact} impact</div>
                      </>
                    ) : (
                      <div className="text-sm text-gray-500">No data</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Lifestyle Recommendations */}
            {analysis.lifestyleCorrelation.recommendations.length > 0 && (
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Lifestyle Recommendations</h3>
                <ul className="space-y-2">
                  {analysis.lifestyleCorrelation.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-3 mt-0.5" />
                      <span className="text-sm text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'predictions' && (
          <div className="space-y-6">
            {/* Short-term Predictions */}
            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Short-term Predictions (7 days)</h3>
              {analysis.predictiveInsights.shortTerm.status === 'predicted' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-2">Predicted Values</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {analysis.predictiveInsights.shortTerm.systolic}/{analysis.predictiveInsights.shortTerm.diastolic}
                    </div>
                    <div className="text-sm text-gray-500">mmHg</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-2">Confidence</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(analysis.predictiveInsights.shortTerm.confidence * 100)}%
                    </div>
                    <div className="text-sm text-gray-500">Prediction Accuracy</div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-600">{analysis.predictiveInsights.shortTerm.status}</div>
              )}
            </div>

            {/* Long-term Projections */}
            <div className="bg-indigo-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Long-term Projections (30 days)</h3>
              {analysis.predictiveInsights.longTerm.status === 'projected' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-2">Projected Values</div>
                    <div className="text-2xl font-bold text-indigo-600">
                      {analysis.predictiveInsights.longTerm.projected30Day.systolic}/{analysis.predictiveInsights.longTerm.projected30Day.diastolic}
                    </div>
                    <div className="text-sm text-gray-500">mmHg</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-2">Confidence</div>
                    <div className="text-2xl font-bold text-indigo-600">
                      {Math.round(analysis.predictiveInsights.longTerm.confidence * 100)}%
                    </div>
                    <div className="text-sm text-gray-500">Projection Accuracy</div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-600">{analysis.predictiveInsights.longTerm.status}</div>
              )}
            </div>

            {/* Risk Factors */}
            {analysis.predictiveInsights.riskFactors.length > 0 && (
              <div className="bg-red-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Identified Risk Factors</h3>
                <ul className="space-y-2">
                  {analysis.predictiveInsights.riskFactors.map((factor, index) => (
                    <li key={index} className="flex items-start">
                      <AlertTriangle className="h-4 w-4 text-red-600 mr-3 mt-0.5" />
                      <span className="text-sm text-gray-700">{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Interventions */}
            {analysis.predictiveInsights.interventions.length > 0 && (
              <div className="bg-yellow-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggested Interventions</h3>
                <ul className="space-y-2">
                  {analysis.predictiveInsights.interventions.map((intervention, index) => (
                    <li key={index} className="flex items-start">
                      <Target className="h-4 w-4 text-yellow-600 mr-3 mt-0.5" />
                      <span className="text-sm text-gray-700">{intervention}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            {/* Personalized Recommendations */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personalized Recommendations</h3>
              <div className="space-y-4">
                {analysis.personalizedRecommendations.map((rec, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${getPriorityColor(rec.priority)}`}>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        {rec.priority === 'critical' && <AlertTriangle className="h-5 w-5 text-red-600" />}
                        {rec.priority === 'high' && <Zap className="h-5 w-5 text-orange-600" />}
                        {rec.priority === 'medium' && <Info className="h-5 w-5 text-yellow-600" />}
                        {rec.priority === 'low' && <CheckCircle className="h-5 w-5 text-green-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 capitalize">{rec.category}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                            {rec.priority} priority
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{rec.message}</p>
                        <div className="text-xs text-gray-500">
                          Action: {rec.action.replace(/_/g, ' ')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Circadian Recommendations */}
            {analysis.circadianAnalysis.recommendations.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Timing-Based Recommendations
                </h3>
                <ul className="space-y-2">
                  {analysis.circadianAnalysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <Clock className="h-4 w-4 text-blue-600 mr-3 mt-0.5" />
                      <span className="text-sm text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Disclaimer */}
      <div className="bg-blue-50 border-t p-6 rounded-b-lg">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 font-medium">AI Analysis Disclaimer</p>
            <p className="text-xs text-blue-700 mt-1">
              This advanced analysis is generated using medical algorithms and statistical models. 
              It is for informational purposes only and should not replace professional medical advice. 
              Always consult with a healthcare provider for medical decisions and treatment options.
            </p>
            <p className="text-xs text-blue-700 mt-2">
              Analysis generated on {new Date(analysis.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
