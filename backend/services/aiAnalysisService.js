const HuggingFaceService = require('./huggingFaceService');

class AIAnalysisService {
  constructor() {
    this.medicalKnowledgeBase = this.initializeMedicalKnowledgeBase();
    this.huggingFaceService = new HuggingFaceService();
  }

  // Utility functions
  sum(arr) {
    return arr.reduce((a, b) => a + b, 0);
  }

  mean(arr) {
    if (arr.length === 0) return 0;
    return this.sum(arr) / arr.length;
  }

  standardDeviation(arr) {
    if (arr.length === 0) return 0;
    const avg = this.mean(arr);
    const squaredDiffs = arr.map(value => Math.pow(value - avg, 2));
    return Math.sqrt(this.mean(squaredDiffs));
  }

  format(date, formatStr) {
    return date.toLocaleDateString();
  }

  subDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
  }

  subWeeks(date, weeks) {
    return this.subDays(date, weeks * 7);
  }

  subMonths(date, months) {
    const result = new Date(date);
    result.setMonth(result.getMonth() - months);
    return result;
  }

  differenceInDays(date1, date2) {
    const diffTime = Math.abs(date1 - date2);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  initializeMedicalKnowledgeBase() {
    return {
      bpCategories: {
        normal: { systolic: [90, 120], diastolic: [60, 80], risk: 'low' },
        elevated: { systolic: [120, 129], diastolic: [60, 79], risk: 'low-moderate' },
        stage1: { systolic: [130, 139], diastolic: [80, 89], risk: 'moderate' },
        stage2: { systolic: [140, 179], diastolic: [90, 119], risk: 'high' },
        crisis: { systolic: [180, 999], diastolic: [120, 999], risk: 'critical' }
      },
      lifestyleFactors: {
        smoking: {
          impact: 0.15,
          recommendations: [
            'Smoking cessation is the single most important step for cardiovascular health',
            'Consider nicotine replacement therapy or counseling',
            'Blood pressure typically improves within 20 minutes of quitting'
          ]
        },
        alcohol: {
          moderate: { threshold: 2, impact: 0.05 },
          heavy: { threshold: 4, impact: 0.25 },
          recommendations: [
            'Limit alcohol to 1-2 drinks per day for men, 1 for women',
            'Heavy drinking significantly increases hypertension risk',
            'Consider alcohol-free days to monitor impact'
          ]
        }
      },
      emergencyThresholds: {
        systolic: 180,
        diastolic: 120,
        heartRate: { high: 100, low: 50 }
      }
    };
  }

  async generateAdvancedAnalysis(readings, cigarEntries = [], drinkEntries = []) {
    if (!readings || readings.length === 0) {
      return this.getInsufficientDataResponse();
    }

    const analysis = {
      timestamp: new Date().toISOString(),
      dataQuality: this.assessDataQuality(readings),
      riskAssessment: this.performAdvancedRiskAssessment(readings),
      trendAnalysis: this.performAdvancedTrendAnalysis(readings),
      lifestyleCorrelation: this.analyzeLifestyleCorrelations(readings, cigarEntries, drinkEntries),
      circadianAnalysis: this.analyzeCircadianPatterns(readings),
      predictiveInsights: this.generatePredictiveInsights(readings),
      personalizedRecommendations: [],
      medicalAlerts: this.checkMedicalAlerts(readings),
      confidenceScore: this.calculateConfidenceScore(readings)
    };

    analysis.personalizedRecommendations = this.generatePersonalizedRecommendations(analysis);
    
    return analysis;
  }

  assessDataQuality(readings) {
    const totalReadings = readings.length;
    const timeSpan = this.calculateTimeSpan(readings);
    const frequency = totalReadings / Math.max(timeSpan, 1);
    
    return {
      totalReadings,
      timeSpanDays: timeSpan,
      averageFrequency: frequency,
      quality: frequency >= 1 ? 'excellent' : frequency >= 0.5 ? 'good' : 'needs_improvement',
      recommendations: this.getDataQualityRecommendations(frequency, totalReadings)
    };
  }

  performAdvancedRiskAssessment(readings) {
    const recentReadings = this.getRecentReadings(readings, 7);
    
    const riskFactors = {
      current: this.assessCurrentRisk(recentReadings),
      historical: this.assessHistoricalRisk(readings),
      progression: this.assessRiskProgression(readings),
      lifestyle: 'low' // Simplified for now
    };

    const overallRisk = this.calculateOverallRisk(riskFactors);
    
    return {
      ...riskFactors,
      overall: overallRisk,
      riskScore: this.calculateRiskScore(riskFactors),
      nextAssessment: this.recommendNextAssessment(overallRisk)
    };
  }

  performAdvancedTrendAnalysis(readings) {
    if (readings.length < 3) {
      return { status: 'insufficient_data', message: 'Need at least 3 readings for trend analysis' };
    }

    const sortedReadings = [...readings].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    const systolicTrend = this.performRegressionAnalysis(sortedReadings.map(r => r.systolic));
    const diastolicTrend = this.performRegressionAnalysis(sortedReadings.map(r => r.diastolic));
    const heartRateTrend = this.performRegressionAnalysis(sortedReadings.map(r => r.heartRate));

    const volatility = this.calculateVolatility(sortedReadings);

    return {
      systolic: systolicTrend,
      diastolic: diastolicTrend,
      heartRate: heartRateTrend,
      volatility,
      trendStrength: this.calculateTrendStrength(systolicTrend, diastolicTrend),
      significance: this.calculateTrendSignificance(readings)
    };
  }

  performRegressionAnalysis(values) {
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;

    const sumX = this.sum(x);
    const sumY = this.sum(y);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate R-squared
    const yMean = sumY / n;
    const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - (slope * x[i] + intercept), 2), 0);
    const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    const rSquared = ssTot > 0 ? 1 - (ssRes / ssTot) : 0;

    let direction = 'stable';
    if (Math.abs(slope) > 0.5) {
      direction = slope > 0 ? 'increasing' : 'decreasing';
    }

    return {
      direction,
      slope: parseFloat(slope.toFixed(4)),
      rSquared: parseFloat(rSquared.toFixed(4)),
      confidence: this.calculateRegressionConfidence(rSquared, n),
      predictedValue: parseFloat((slope * (n - 1) + intercept).toFixed(2)),
      changeRate: parseFloat((slope * 30).toFixed(2))
    };
  }

  analyzeLifestyleCorrelations(readings, cigarEntries, drinkEntries) {
    const correlations = {
      smoking: this.analyzeSmokingCorrelation(readings, cigarEntries),
      alcohol: this.analyzeAlcoholCorrelation(readings, drinkEntries),
      combined: { impact: 'none', confidence: 'low' }
    };

    return {
      ...correlations,
      overallImpact: this.calculateLifestyleImpactScore(correlations),
      recommendations: this.generateLifestyleRecommendations(correlations)
    };
  }

  analyzeSmokingCorrelation(readings, cigarEntries) {
    if (cigarEntries.length === 0) {
      return { correlation: 0, impact: 'none', confidence: 'low' };
    }

    const smokingDays = new Set(cigarEntries.map(entry => 
      new Date(entry.timestamp).toDateString()
    ));

    const readingsOnSmokingDays = readings.filter(reading => 
      smokingDays.has(new Date(reading.timestamp).toDateString())
    );
    
    const readingsOnNonSmokingDays = readings.filter(reading => 
      !smokingDays.has(new Date(reading.timestamp).toDateString())
    );

    if (readingsOnSmokingDays.length === 0 || readingsOnNonSmokingDays.length === 0) {
      return { correlation: 0, impact: 'insufficient_data', confidence: 'low' };
    }

    const smokingAvgSystolic = this.mean(readingsOnSmokingDays.map(r => r.systolic));
    const nonSmokingAvgSystolic = this.mean(readingsOnNonSmokingDays.map(r => r.systolic));
    const smokingAvgDiastolic = this.mean(readingsOnSmokingDays.map(r => r.diastolic));
    const nonSmokingAvgDiastolic = this.mean(readingsOnNonSmokingDays.map(r => r.diastolic));

    const systolicDifference = smokingAvgSystolic - nonSmokingAvgSystolic;
    const diastolicDifference = smokingAvgDiastolic - nonSmokingAvgDiastolic;

    return {
      correlation: parseFloat(((systolicDifference + diastolicDifference) / 2).toFixed(2)),
      impact: Math.abs(systolicDifference) > 5 ? 'significant' : 'moderate',
      confidence: readingsOnSmokingDays.length > 3 ? 'high' : 'medium',
      smokingDaysReadings: readingsOnSmokingDays.length,
      nonSmokingDaysReadings: readingsOnNonSmokingDays.length,
      averageDifference: {
        systolic: parseFloat(systolicDifference.toFixed(2)),
        diastolic: parseFloat(diastolicDifference.toFixed(2))
      }
    };
  }

  analyzeAlcoholCorrelation(readings, drinkEntries) {
    if (drinkEntries.length === 0) {
      return { 
        heavyDrinking: { impact: 'no_data', confidence: 'low' },
        moderateDrinking: { impact: 'no_data', confidence: 'low' },
        lightDrinking: { impact: 'no_data', confidence: 'low' },
        noDrinking: { impact: 'no_data', confidence: 'low' }
      };
    }

    return {
      heavyDrinking: this.calculateDrinkingImpact(readings, drinkEntries, 4, 'heavy'),
      moderateDrinking: this.calculateDrinkingImpact(readings, drinkEntries, 2, 'moderate'),
      lightDrinking: this.calculateDrinkingImpact(readings, drinkEntries, 1, 'light'),
      noDrinking: { impact: 'no_data', confidence: 'low' }
    };
  }

  calculateDrinkingImpact(readings, drinkEntries, threshold, category) {
    const drinkingDays = drinkEntries
      .filter(entry => entry.count >= threshold)
      .map(entry => new Date(entry.timestamp).toDateString());

    if (drinkingDays.length === 0) {
      return { impact: 'no_data', confidence: 'low' };
    }

    const readingsOnDrinkingDays = readings.filter(reading => 
      drinkingDays.includes(new Date(reading.timestamp).toDateString())
    );

    if (readingsOnDrinkingDays.length === 0) {
      return { impact: 'no_data', confidence: 'low' };
    }

    const avgSystolic = this.mean(readingsOnDrinkingDays.map(r => r.systolic));
    const avgDiastolic = this.mean(readingsOnDrinkingDays.map(r => r.diastolic));

    return {
      category,
      averageReadings: {
        systolic: parseFloat(avgSystolic.toFixed(2)),
        diastolic: parseFloat(avgDiastolic.toFixed(2))
      },
      readingCount: readingsOnDrinkingDays.length,
      impact: this.assessAlcoholImpactLevel(avgSystolic, avgDiastolic, category),
      confidence: readingsOnDrinkingDays.length > 2 ? 'high' : 'medium'
    };
  }

  analyzeCircadianPatterns(readings) {
    const patterns = {
      morning: readings.filter(r => r.timestamp.getHours() >= 6 && r.timestamp.getHours() < 12),
      afternoon: readings.filter(r => r.timestamp.getHours() >= 12 && r.timestamp.getHours() < 18),
      evening: readings.filter(r => r.timestamp.getHours() >= 18 && r.timestamp.getHours() < 24),
      night: readings.filter(r => r.timestamp.getHours() >= 0 && r.timestamp.getHours() < 6)
    };

    const analysis = {};
    Object.entries(patterns).forEach(([period, periodReadings]) => {
      if (periodReadings.length > 0) {
        analysis[period] = {
          averageSystolic: parseFloat(this.mean(periodReadings.map(r => r.systolic)).toFixed(2)),
          averageDiastolic: parseFloat(this.mean(periodReadings.map(r => r.diastolic)).toFixed(2)),
          averageHeartRate: parseFloat(this.mean(periodReadings.map(r => r.heartRate)).toFixed(2)),
          readingCount: periodReadings.length,
          riskLevel: this.assessCircadianRisk(periodReadings, period)
        };
      }
    });

    return {
      ...analysis,
      optimalTime: this.findOptimalTime(analysis),
      concernTime: this.findConcernTime(analysis),
      recommendations: this.generateCircadianRecommendations(analysis)
    };
  }

  generatePredictiveInsights(readings) {
    if (readings.length < 10) {
      return { status: 'insufficient_data', message: 'Need at least 10 readings for predictive analysis' };
    }

    const sortedReadings = [...readings].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    const shortTermPrediction = this.predictShortTermTrend(sortedReadings);
    const longTermProjection = this.projectLongTermTrend(sortedReadings);

    return {
      shortTerm: shortTermPrediction,
      longTerm: longTermProjection,
      confidence: this.calculatePredictionConfidence(readings),
      riskFactors: this.identifyRiskFactors(readings),
      interventions: this.suggestInterventions(shortTermPrediction, longTermProjection)
    };
  }

  checkMedicalAlerts(readings) {
    const alerts = [];
    const recentReadings = this.getRecentReadings(readings, 3);

    recentReadings.forEach(reading => {
      if (reading.systolic >= 180 || reading.diastolic >= 120) {
        alerts.push({
          type: 'critical',
          message: 'CRITICAL: Blood pressure reading indicates hypertensive crisis. Seek immediate medical attention.',
          reading: reading,
          timestamp: reading.timestamp
        });
      }
      else if (reading.systolic >= 140 || reading.diastolic >= 90) {
        alerts.push({
          type: 'warning',
          message: 'WARNING: Blood pressure reading indicates Stage 2 hypertension. Consult healthcare provider.',
          reading: reading,
          timestamp: reading.timestamp
        });
      }
      if (reading.heartRate > 100 || reading.heartRate < 50) {
        alerts.push({
          type: 'warning',
          message: `Heart rate of ${reading.heartRate} BPM is outside normal range (50-100 BPM).`,
          reading: reading,
          timestamp: reading.timestamp
        });
      }
    });

    return alerts;
  }

  generatePersonalizedRecommendations(analysis) {
    const recommendations = [];

    if (analysis.riskAssessment.overall === 'high') {
      recommendations.push({
        category: 'urgent',
        priority: 'high',
        message: 'Your blood pressure readings indicate high cardiovascular risk. Please consult with a healthcare provider immediately for proper evaluation and treatment.',
        action: 'schedule_appointment'
      });
    }

    if (analysis.trendAnalysis.systolic.direction === 'increasing' || 
        analysis.trendAnalysis.diastolic.direction === 'increasing') {
      recommendations.push({
        category: 'lifestyle',
        priority: 'high',
        message: 'Your blood pressure is trending upward. Consider immediate lifestyle modifications including diet, exercise, and stress management.',
        action: 'lifestyle_changes'
      });
    }

    if (analysis.lifestyleCorrelation.smoking.impact === 'significant') {
      recommendations.push({
        category: 'smoking',
        priority: 'critical',
        message: 'Smoking is significantly impacting your blood pressure. Quitting smoking is the most important step for your cardiovascular health.',
        action: 'quit_smoking'
      });
    }

    if (analysis.dataQuality.quality === 'needs_improvement') {
      recommendations.push({
        category: 'monitoring',
        priority: 'medium',
        message: 'More frequent monitoring would improve the accuracy of your analysis. Aim for daily readings.',
        action: 'increase_frequency'
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        category: 'general',
        priority: 'low',
        message: 'Continue monitoring your blood pressure regularly and maintain a healthy lifestyle.',
        action: 'continue_monitoring'
      });
    }

    return recommendations;
  }

  // Helper methods
  getRecentReadings(readings, days = 7) {
    const cutoffDate = this.subDays(new Date(), days);
    return readings.filter(reading => new Date(reading.timestamp) >= cutoffDate);
  }

  calculateTimeSpan(readings) {
    if (readings.length < 2) return 0;
    const sortedReadings = [...readings].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const firstReading = new Date(sortedReadings[0].timestamp);
    const lastReading = new Date(sortedReadings[sortedReadings.length - 1].timestamp);
    return this.differenceInDays(lastReading, firstReading);
  }

  calculateConfidenceScore(readings) {
    const factors = {
      dataVolume: Math.min(readings.length / 30, 1),
      timeSpan: Math.min(this.calculateTimeSpan(readings) / 90, 1),
      frequency: Math.min(this.calculateTimeSpan(readings) / readings.length, 1)
    };

    return parseFloat((Object.values(factors).reduce((a, b) => a + b, 0) / 3).toFixed(2));
  }

  getInsufficientDataResponse() {
    return {
      timestamp: new Date().toISOString(),
      status: 'insufficient_data',
      message: 'Need at least 2 blood pressure readings to generate AI analysis',
      recommendations: [
        'Continue logging daily blood pressure readings',
        'Aim for consistent timing of measurements',
        'Include lifestyle factors like smoking and alcohol consumption'
      ]
    };
  }

  // Additional helper methods
  assessCurrentRisk(readings) {
    if (readings.length === 0) return 'unknown';
    
    const avgSystolic = this.mean(readings.map(r => r.systolic));
    const avgDiastolic = this.mean(readings.map(r => r.diastolic));
    
    if (avgSystolic >= 140 || avgDiastolic >= 90) return 'high';
    if (avgSystolic >= 130 || avgDiastolic >= 80) return 'moderate';
    return 'low';
  }

  assessHistoricalRisk(readings) {
    return this.assessCurrentRisk(readings);
  }

  assessRiskProgression(readings) {
    if (readings.length < 10) return 'insufficient_data';
    
    const firstHalf = readings.slice(0, Math.floor(readings.length / 2));
    const secondHalf = readings.slice(Math.floor(readings.length / 2));
    
    const firstAvg = this.mean(firstHalf.map(r => r.systolic));
    const secondAvg = this.mean(secondHalf.map(r => r.systolic));
    
    const change = secondAvg - firstAvg;
    if (Math.abs(change) < 2) return 'stable';
    return change > 0 ? 'increasing' : 'decreasing';
  }

  calculateOverallRisk(riskFactors) {
    const weights = { current: 0.4, historical: 0.2, progression: 0.2, lifestyle: 0.2 };
    const riskValues = { low: 1, moderate: 2, high: 3, critical: 4, unknown: 1, insufficient_data: 1 };
    
    const weightedScore = Object.entries(weights).reduce((sum, [key, weight]) => {
      return sum + (riskValues[riskFactors[key]] || 1) * weight;
    }, 0);
    
    if (weightedScore >= 3) return 'high';
    if (weightedScore >= 2.5) return 'moderate';
    return 'low';
  }

  calculateRiskScore(riskFactors) {
    const riskValues = { low: 1, moderate: 2, high: 3, critical: 4, unknown: 1 };
    const weights = { current: 0.4, historical: 0.2, progression: 0.2, lifestyle: 0.2 };
    
    return parseFloat(Object.entries(weights).reduce((sum, [key, weight]) => {
      return sum + (riskValues[riskFactors[key]] || 1) * weight;
    }, 0).toFixed(2));
  }

  recommendNextAssessment(riskLevel) {
    const intervals = {
      low: 30,
      moderate: 14,
      high: 7,
      critical: 1
    };
    
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + (intervals[riskLevel] || 30));
    
    return {
      days: intervals[riskLevel] || 30,
      date: nextDate.toISOString(),
      reason: `Based on ${riskLevel} risk level`
    };
  }

  calculateVolatility(readings) {
    if (readings.length < 3) return { level: 'unknown', score: 0 };
    
    const systolicValues = readings.map(r => r.systolic);
    const diastolicValues = readings.map(r => r.diastolic);
    
    const systolicStdDev = this.standardDeviation(systolicValues);
    const diastolicStdDev = this.standardDeviation(diastolicValues);
    
    const avgVolatility = (systolicStdDev + diastolicStdDev) / 2;
    
    let level = 'low';
    if (avgVolatility > 15) level = 'high';
    else if (avgVolatility > 10) level = 'moderate';
    
    return {
      level,
      score: parseFloat(avgVolatility.toFixed(2)),
      systolicStdDev: parseFloat(systolicStdDev.toFixed(2)),
      diastolicStdDev: parseFloat(diastolicStdDev.toFixed(2))
    };
  }

  calculateTrendStrength(systolicTrend, diastolicTrend) {
    const avgR2 = (systolicTrend.rSquared + diastolicTrend.rSquared) / 2;
    
    if (avgR2 > 0.7) return 'strong';
    if (avgR2 > 0.4) return 'moderate';
    return 'weak';
  }

  calculateTrendSignificance(readings) {
    const n = readings.length;
    if (n < 5) return 'low';
    if (n < 15) return 'medium';
    return 'high';
  }

  calculateRegressionConfidence(rSquared, n) {
    const confidence = Math.min(rSquared * (n / 20), 1);
    if (confidence > 0.8) return 'high';
    if (confidence > 0.6) return 'medium';
    return 'low';
  }

  calculateLifestyleImpactScore(correlations) {
    let score = 0;
    if (correlations.smoking.impact === 'significant') score += 3;
    else if (correlations.smoking.impact === 'moderate') score += 2;
    
    if (correlations.alcohol.heavyDrinking?.impact === 'significant') score += 3;
    else if (correlations.alcohol.moderateDrinking?.impact === 'moderate') score += 2;
    
    return Math.min(score, 8);
  }

  generateLifestyleRecommendations(correlations) {
    const recommendations = [];
    
    if (correlations.smoking.impact === 'significant') {
      recommendations.push('Smoking cessation should be your top priority for blood pressure management');
    }
    
    if (correlations.alcohol.heavyDrinking?.impact === 'significant') {
      recommendations.push('Reduce alcohol consumption to moderate levels (1-2 drinks per day)');
    }
    
    return recommendations;
  }

  assessCircadianRisk(readings, period) {
    if (readings.length === 0) return 'unknown';
    
    const avgSystolic = this.mean(readings.map(r => r.systolic));
    const avgDiastolic = this.mean(readings.map(r => r.diastolic));
    
    if (avgSystolic >= 140 || avgDiastolic >= 90) return 'high';
    if (avgSystolic >= 130 || avgDiastolic >= 80) return 'moderate';
    return 'low';
  }

  findOptimalTime(analysis) {
    const periods = Object.entries(analysis);
    const optimal = periods.reduce((best, [period, data]) => {
      if (!data || data.readingCount < 2) return best;
      
      const riskScore = data.averageSystolic + data.averageDiastolic;
      if (!best || riskScore < (best.data.averageSystolic + best.data.averageDiastolic)) {
        return { period, data };
      }
      return best;
    }, null);
    
    return optimal ? optimal.period : null;
  }

  findConcernTime(analysis) {
    const periods = Object.entries(analysis);
    const concern = periods.reduce((worst, [period, data]) => {
      if (!data || data.readingCount < 2) return worst;
      
      const riskScore = data.averageSystolic + data.averageDiastolic;
      if (!worst || riskScore > (worst.data.averageSystolic + worst.data.averageDiastolic)) {
        return { period, data };
      }
      return worst;
    }, null);
    
    return concern && (concern.data.averageSystolic >= 130 || concern.data.averageDiastolic >= 80) 
      ? concern.period : null;
  }

  generateCircadianRecommendations(analysis) {
    const recommendations = [];
    
    Object.entries(analysis).forEach(([period, data]) => {
      if (data && data.readingCount >= 2) {
        if (data.averageSystolic >= 140 || data.averageDiastolic >= 90) {
          recommendations.push(`${period} readings are consistently high - consider monitoring more closely during this time`);
        }
      }
    });
    
    return recommendations;
  }

  predictShortTermTrend(readings) {
    const recentReadings = readings.slice(-7);
    if (recentReadings.length < 3) return { status: 'insufficient_data' };
    
    const systolicTrend = this.performRegressionAnalysis(recentReadings.map(r => r.systolic));
    const diastolicTrend = this.performRegressionAnalysis(recentReadings.map(r => r.diastolic));
    
    return {
      status: 'predicted',
      systolic: systolicTrend.predictedValue,
      diastolic: diastolicTrend.predictedValue,
      trend: {
        systolic: systolicTrend.direction,
        diastolic: diastolicTrend.direction
      },
      confidence: Math.min((systolicTrend.confidence === 'high' ? 0.8 : 0.6), 1)
    };
  }

  projectLongTermTrend(readings) {
    if (readings.length < 15) return { status: 'insufficient_data' };
    
    const systolicTrend = this.performRegressionAnalysis(readings.map(r => r.systolic));
    const diastolicTrend = this.performRegressionAnalysis(readings.map(r => r.diastolic));
    
    const futureSystolic = systolicTrend.slope * (readings.length + 30) + (systolicTrend.predictedValue - systolicTrend.slope * (readings.length - 1));
    const futureDiastolic = diastolicTrend.slope * (readings.length + 30) + (diastolicTrend.predictedValue - diastolicTrend.slope * (readings.length - 1));
    
    return {
      status: 'projected',
      projected30Day: {
        systolic: parseFloat(futureSystolic.toFixed(2)),
        diastolic: parseFloat(futureDiastolic.toFixed(2))
      },
      trend: {
        systolic: systolicTrend.direction,
        diastolic: diastolicTrend.direction
      },
      confidence: Math.min((systolicTrend.rSquared + diastolicTrend.rSquared) / 2, 1)
    };
  }

  calculatePredictionConfidence(readings) {
    const factors = {
      dataVolume: Math.min(readings.length / 50, 1),
      timeSpan: Math.min(this.calculateTimeSpan(readings) / 180, 1),
      consistency: 1 - this.calculateVolatility(readings).score / 20
    };
    
    return parseFloat(Object.values(factors).reduce((a, b) => a + b, 0) / 3).toFixed(2);
  }

  identifyRiskFactors(readings) {
    const riskFactors = [];
    
    const recentReadings = this.getRecentReadings(readings, 7);
    const avgSystolic = this.mean(recentReadings.map(r => r.systolic));
    const avgDiastolic = this.mean(recentReadings.map(r => r.diastolic));
    
    if (avgSystolic >= 140 || avgDiastolic >= 90) {
      riskFactors.push('Current high blood pressure readings');
    }
    
    const volatility = this.calculateVolatility(readings);
    if (volatility.level === 'high') {
      riskFactors.push('High blood pressure variability');
    }
    
    return riskFactors;
  }

  suggestInterventions(shortTerm, longTerm) {
    const interventions = [];
    
    if (shortTerm.trend?.systolic === 'increasing' || shortTerm.trend?.diastolic === 'increasing') {
      interventions.push('Immediate lifestyle modifications recommended');
    }
    
    if (longTerm.projected30Day?.systolic >= 140 || longTerm.projected30Day?.diastolic >= 90) {
      interventions.push('Medical consultation may be needed within 30 days');
    }
    
    return interventions;
  }

  assessAlcoholImpactLevel(avgSystolic, avgDiastolic, category) {
    if (avgSystolic >= 140 || avgDiastolic >= 90) return 'significant';
    if (avgSystolic >= 130 || avgDiastolic >= 80) return 'moderate';
    return 'minimal';
  }

  getDataQualityRecommendations(frequency, totalReadings) {
    const recommendations = [];
    
    if (frequency < 0.5) {
      recommendations.push('Increase monitoring frequency to at least every other day');
    }
    
    if (totalReadings < 10) {
      recommendations.push('Continue logging readings to improve analysis accuracy');
    }
    
    return recommendations;
  }

  // New Hugging Face enhanced methods
  async generateEnhancedAnalysis(readings, cigarEntries = [], drinkEntries = []) {
    // Generate the existing statistical analysis
    const baseAnalysis = await this.generateAdvancedAnalysis(readings, cigarEntries, drinkEntries);
    
    try {
      // Enhance with Hugging Face insights
      const llmInsights = await this.huggingFaceService.generateInsights(baseAnalysis);
      const llmRecommendations = await this.huggingFaceService.generateRecommendations(
        baseAnalysis.riskAssessment, 
        baseAnalysis.lifestyleCorrelation
      );

      // Combine the analysis
      return {
        ...baseAnalysis,
        llmInsights: llmInsights,
        llmRecommendations: llmRecommendations,
        enhanced: true,
        enhancementTimestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error enhancing analysis with Hugging Face:', error);
      // Return base analysis if enhancement fails
      return {
        ...baseAnalysis,
        llmInsights: { insights: 'AI enhancement temporarily unavailable', source: 'error' },
        llmRecommendations: { recommendations: [], source: 'error' },
        enhanced: false,
        enhancementError: error.message
      };
    }
  }

  async answerUserQuestion(question, readings, cigarEntries = [], drinkEntries = []) {
    try {
      const userData = {
        readings: readings,
        cigars: cigarEntries,
        drinks: drinkEntries
      };

      const answer = await this.huggingFaceService.answerQuestion(question, userData);
      
      return {
        question: question,
        answer: answer,
        timestamp: new Date().toISOString(),
        context: {
          totalReadings: readings.length,
          recentAverage: readings.length > 0 ? {
            systolic: this.mean(readings.slice(-5).map(r => r.systolic)),
            diastolic: this.mean(readings.slice(-5).map(r => r.diastolic))
          } : null
        }
      };
    } catch (error) {
      console.error('Error answering user question:', error);
      return {
        question: question,
        answer: {
          answer: 'I apologize, but I encountered an error while processing your question. Please try again or consult with a healthcare provider for medical advice.',
          source: 'error'
        },
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }

  async generateHealthReport(readings, cigarEntries = [], drinkEntries = []) {
    try {
      const analysis = await this.generateEnhancedAnalysis(readings, cigarEntries, drinkEntries);
      
      const reportPrompt = this.createHealthReportPrompt(analysis);
      const report = await this.huggingFaceService.callHuggingFaceAPI(reportPrompt);
      
      return {
        report: report,
        analysis: analysis,
        generatedAt: new Date().toISOString(),
        period: {
          start: readings.length > 0 ? readings[readings.length - 1].timestamp : null,
          end: readings.length > 0 ? readings[0].timestamp : null,
          totalReadings: readings.length
        }
      };
    } catch (error) {
      console.error('Error generating health report:', error);
      return {
        report: 'Unable to generate comprehensive health report at this time.',
        analysis: await this.generateAdvancedAnalysis(readings, cigarEntries, drinkEntries),
        generatedAt: new Date().toISOString(),
        error: error.message
      };
    }
  }

  createHealthReportPrompt(analysis) {
    return `Generate a comprehensive health report based on this blood pressure analysis:

Risk Assessment: ${analysis.riskAssessment?.overall || 'unknown'}
Trend Analysis: ${analysis.trendAnalysis?.systolic?.direction || 'stable'}
Data Quality: ${analysis.dataQuality?.quality || 'unknown'}
Confidence Score: ${analysis.confidenceScore || 0}

Create a detailed, professional health report summarizing the findings and recommendations:`;
  }
}

module.exports = AIAnalysisService;