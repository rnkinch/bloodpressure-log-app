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

  async generateAdvancedAnalysis(readings, cigarEntries = [], drinkEntries = [], weightEntries = [], cardioEntries = []) {
    if (!readings || readings.length === 0) {
      return this.getInsufficientDataResponse();
    }

    const analysis = {
      timestamp: new Date().toISOString(),
      dataQuality: this.assessDataQuality(readings),
      riskAssessment: this.performAdvancedRiskAssessment(readings),
      trendAnalysis: this.performAdvancedTrendAnalysis(readings),
      lifestyleCorrelation: this.analyzeLifestyleCorrelations(readings, cigarEntries, drinkEntries, weightEntries, cardioEntries),
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

  analyzeLifestyleCorrelations(readings, cigarEntries, drinkEntries, weightEntries, cardioEntries) {
    const correlations = {
      smoking: this.analyzeSmokingCorrelation(readings, cigarEntries),
      alcohol: this.analyzeAlcoholCorrelation(readings, drinkEntries),
      weight: this.analyzeWeightCorrelation(readings, weightEntries),
      cardio: this.analyzeCardioCorrelation(readings, cardioEntries),
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

  analyzeWeightCorrelation(readings, weightEntries) {
    if (weightEntries.length === 0) {
      return { 
        correlation: 0, 
        impact: 'no_data', 
        confidence: 'low',
        trend: 'stable',
        bmiCategory: 'unknown',
        recentWeight: 'no data',
        weightVariability: 'unknown',
        weightChangeRate: 0,
        idealWeightRange: 'unknown',
        weightStatus: 'unknown',
        healthRiskLevel: 'unknown'
      };
    }

    // Calculate weight trend
    const sortedWeights = weightEntries
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    const weightTrend = this.calculateWeightTrend(sortedWeights);
    const recentWeight = sortedWeights[sortedWeights.length - 1].weight;
    
    // Calculate weight variability (standard deviation)
    const weightValues = sortedWeights.map(w => w.weight);
    const weightVariability = this.standardDeviation(weightValues);
    
    // Calculate weight change rate (kg per month)
    const weightChangeRate = this.calculateWeightChangeRate(sortedWeights);
    
    // Calculate BMI and related metrics
    const height = 1.83; // Default height of 6ft (1.83m)
    const bmi = recentWeight / (height * height);
    const bmiCategory = this.calculateBMICategory(recentWeight, height);
    
    // Calculate ideal weight range based on BMI 18.5-24.9
    const minIdealWeight = 18.5 * (height * height);
    const maxIdealWeight = 24.9 * (height * height);
    const idealWeightRange = `${minIdealWeight.toFixed(1)}-${maxIdealWeight.toFixed(1)} kg`;
    
    // Determine weight status relative to ideal range
    let weightStatus = 'within range';
    if (recentWeight < minIdealWeight) weightStatus = 'below range';
    else if (recentWeight > maxIdealWeight) weightStatus = 'above range';
    
    // Find readings that have weight data within 7 days
    const readingsWithWeight = readings.filter(reading => {
      const readingDate = new Date(reading.timestamp);
      return weightEntries.some(weight => {
        const weightDate = new Date(weight.timestamp);
        const daysDiff = Math.abs(readingDate - weightDate) / (1000 * 60 * 60 * 24);
        return daysDiff <= 7;
      });
    });

    if (readingsWithWeight.length === 0) {
      return { 
        correlation: 0, 
        impact: 'insufficient_data', 
        confidence: 'low',
        trend: weightTrend.trend,
        bmiCategory: bmiCategory,
        recentWeight: recentWeight,
        weightVariability: weightVariability.toFixed(2),
        weightChangeRate: weightChangeRate.toFixed(2),
        idealWeightRange: idealWeightRange,
        weightStatus: weightStatus,
        healthRiskLevel: this.calculateWeightHealthRisk(bmi, weightTrend.trend)
      };
    }

    // Calculate correlation between weight and blood pressure
    const correlation = this.calculateWeightBPCorrelation(readingsWithWeight, weightEntries);
    
    // Calculate additional BP metrics related to weight
    const weightImpact = this.assessWeightImpact(correlation, weightTrend);
    const weightBPSensitivity = this.calculateWeightBPSensitivity(readingsWithWeight, weightEntries);
    const healthRiskLevel = this.calculateWeightHealthRisk(bmi, weightTrend.trend);
    
    // Generate comprehensive recommendations
    const recommendations = this.generateWeightRecommendations(correlation, weightTrend, bmi, weightBPSensitivity);
    
    return {
      correlation: correlation,
      impact: weightImpact,
      confidence: readingsWithWeight.length >= 5 ? 'medium' : 'low',
      trend: weightTrend.trend,
      bmiCategory: bmiCategory,
      recentWeight: recentWeight,
      weightVariability: weightVariability.toFixed(2),
      weightChangeRate: weightChangeRate.toFixed(2),
      idealWeightRange: idealWeightRange,
      weightStatus: weightStatus,
      healthRiskLevel: healthRiskLevel,
      bpSensitivity: weightBPSensitivity.toFixed(2),
      recommendations: recommendations
    };
  }

  analyzeCardioCorrelation(readings, cardioEntries) {
    if (!cardioEntries || cardioEntries.length === 0) {
      return {
        impact: 'no_data',
        confidence: 'low',
        averageMinutes: 0,
        sessions: 0,
        recommendations: ['Log cardio activities to see how exercise impacts your readings.']
      };
    }

    const totalMinutes = cardioEntries.reduce((sum, entry) => sum + (entry.minutes || 0), 0);
    const sessions = cardioEntries.length;
    const averageMinutes = sessions > 0 ? totalMinutes / sessions : 0;

    const cardioDays = new Set(cardioEntries.map(entry => new Date(entry.timestamp).toDateString()));
    const cardioDayReadings = readings.filter(reading => cardioDays.has(new Date(reading.timestamp).toDateString()));
    const nonCardioReadings = readings.filter(reading => !cardioDays.has(new Date(reading.timestamp).toDateString()));

    if (cardioDayReadings.length === 0 || nonCardioReadings.length === 0) {
      return {
        impact: 'insufficient_data',
        confidence: 'low',
        averageMinutes: parseFloat(averageMinutes.toFixed(1)),
        sessions,
        recommendations: ['Keep logging blood pressure readings on cardio days to spot trends.']
      };
    }

    const cardioAvgSystolic = this.mean(cardioDayReadings.map(r => r.systolic));
    const cardioAvgDiastolic = this.mean(cardioDayReadings.map(r => r.diastolic));
    const nonCardioAvgSystolic = this.mean(nonCardioReadings.map(r => r.systolic));
    const nonCardioAvgDiastolic = this.mean(nonCardioReadings.map(r => r.diastolic));

    const systolicDelta = nonCardioAvgSystolic - cardioAvgSystolic;
    const diastolicDelta = nonCardioAvgDiastolic - cardioAvgDiastolic;
    const combinedDelta = (systolicDelta + diastolicDelta) / 2;

    let impact = 'neutral';
    if (combinedDelta > 3) {
      impact = 'beneficial';
    } else if (combinedDelta < -3) {
      impact = 'potentially_negative';
    }

    const confidence = cardioDayReadings.length + nonCardioReadings.length > 6 ? 'medium' : 'low';

    const recommendations = [];
    if (impact === 'beneficial') {
      recommendations.push('Regular cardio appears to lower your blood pressure—keep it up!');
    } else if (impact === 'potentially_negative') {
      recommendations.push('Cardio days show higher readings—review workout intensity and recovery.');
    } else {
      recommendations.push('Maintain consistent cardio sessions to improve cardiovascular health.');
    }

    if (averageMinutes < 30) {
      recommendations.push('Aim for at least 30 minutes of cardio to maximize heart health benefits.');
    }

    return {
      impact,
      confidence,
      averageMinutes: parseFloat(averageMinutes.toFixed(1)),
      sessions,
      systolicDelta: parseFloat(systolicDelta.toFixed(2)),
      diastolicDelta: parseFloat(diastolicDelta.toFixed(2)),
      readingsOnCardioDays: cardioDayReadings.length,
      readingsOnNonCardioDays: nonCardioReadings.length,
      recommendations
    };
  }
  
  // New helper methods for enhanced weight analysis
  
  calculateWeightChangeRate(weightEntries) {
    if (weightEntries.length < 2) return 0;
    
    const firstEntry = weightEntries[0];
    const lastEntry = weightEntries[weightEntries.length - 1];
    const weightChange = lastEntry.weight - firstEntry.weight;
    
    // Calculate time difference in months
    const timeDiffMs = new Date(lastEntry.timestamp) - new Date(firstEntry.timestamp);
    const timeDiffMonths = timeDiffMs / (1000 * 60 * 60 * 24 * 30.44); // Average days per month
    
    if (timeDiffMonths < 0.1) return 0; // Avoid division by very small numbers
    
    return weightChange / timeDiffMonths;
  }
  
  calculateBMICategory(weight, height = 1.83) {
    const bmi = weight / (height * height);
    
    if (bmi < 16.5) return 'severely underweight';
    if (bmi < 18.5) return 'underweight';
    if (bmi < 25) return 'normal';
    if (bmi < 30) return 'overweight';
    if (bmi < 35) return 'obese class I';
    if (bmi < 40) return 'obese class II';
    return 'obese class III';
  }
  
  calculateWeightHealthRisk(bmi, weightTrend) {
    // Base risk on BMI category
    let risk = 'low';
    
    if (bmi < 16.5) risk = 'high'; // Severely underweight
    else if (bmi < 18.5) risk = 'moderate'; // Underweight
    else if (bmi < 25) risk = 'low'; // Normal
    else if (bmi < 30) risk = 'moderate'; // Overweight
    else if (bmi < 35) risk = 'high'; // Obese class I
    else risk = 'very high'; // Obese class II and III
    
    // Adjust risk based on weight trend
    if (risk === 'high' || risk === 'very high') {
      if (weightTrend === 'increasing') risk = 'very high';
      if (weightTrend === 'decreasing') risk = 'high';
    } else if (risk === 'moderate') {
      if (weightTrend === 'increasing') risk = 'high';
      if (weightTrend === 'decreasing') risk = 'low';
    }
    
    return risk;
  }
  
  calculateWeightBPSensitivity(readingsWithWeight, weightEntries) {
    // Calculate how sensitive BP is to weight changes
    // Higher values indicate greater BP response to weight changes
    
    if (readingsWithWeight.length < 5 || weightEntries.length < 2) return 0;
    
    // Group readings by weight (rounded to nearest kg)
    const readingsByWeight = {};
    
    readingsWithWeight.forEach(reading => {
      // Find closest weight entry
      const readingDate = new Date(reading.timestamp);
      let closestWeight = null;
      let minDaysDiff = Infinity;
      
      weightEntries.forEach(weight => {
        const weightDate = new Date(weight.timestamp);
        const daysDiff = Math.abs(readingDate - weightDate) / (1000 * 60 * 60 * 24);
        
        if (daysDiff <= 7 && daysDiff < minDaysDiff) {
          minDaysDiff = daysDiff;
          closestWeight = Math.round(weight.weight);
        }
      });
      
      if (closestWeight !== null) {
        if (!readingsByWeight[closestWeight]) {
          readingsByWeight[closestWeight] = [];
        }
        readingsByWeight[closestWeight].push(reading);
      }
    });
    
    // Calculate average BP for each weight
    const weightBPMap = {};
    Object.entries(readingsByWeight).forEach(([weight, readings]) => {
      const avgSystolic = this.mean(readings.map(r => r.systolic));
      const avgDiastolic = this.mean(readings.map(r => r.diastolic));
      weightBPMap[weight] = {
        systolic: avgSystolic,
        diastolic: avgDiastolic,
        count: readings.length
      };
    });
    
    // Calculate sensitivity (BP change per kg of weight)
    const weights = Object.keys(weightBPMap).map(Number).sort((a, b) => a - b);
    if (weights.length < 2) return 0;
    
    let totalSensitivity = 0;
    let pairCount = 0;
    
    for (let i = 1; i < weights.length; i++) {
      const lowerWeight = weights[i-1];
      const higherWeight = weights[i];
      const weightDiff = higherWeight - lowerWeight;
      
      if (weightDiff > 0) {
        const systolicDiff = weightBPMap[higherWeight].systolic - weightBPMap[lowerWeight].systolic;
        const diastolicDiff = weightBPMap[higherWeight].diastolic - weightBPMap[lowerWeight].diastolic;
        
        // Average of systolic and diastolic sensitivity
        const sensitivity = (systolicDiff + diastolicDiff) / (2 * weightDiff);
        totalSensitivity += sensitivity;
        pairCount++;
      }
    }
    
    return pairCount > 0 ? totalSensitivity / pairCount : 0;
  }
  
  generateWeightRecommendations(correlation, weightTrend, bmi, sensitivity = 0) {
    const recommendations = [];
    
    // Base recommendations on BMI
    if (bmi < 18.5) {
      recommendations.push('Consider a nutritionist consultation for healthy weight gain strategies');
      recommendations.push('Focus on nutrient-dense foods to increase weight in a healthy manner');
    } else if (bmi >= 25) {
      recommendations.push('Aim for gradual weight loss of 0.5-1 kg per week through balanced diet and exercise');
      
      if (bmi >= 30) {
        recommendations.push('Consider medical supervision for your weight management plan');
      }
    }
    
    // Add recommendations based on correlation with BP
    if (Math.abs(correlation) > 0.5) {
      recommendations.push('Your blood pressure shows strong correlation with weight changes');
      
      if (sensitivity > 1.5) {
        recommendations.push('Your blood pressure appears highly sensitive to weight changes');
      }
    }
    
    // Add recommendations based on weight trend
    if (weightTrend.trend === 'increasing' && bmi >= 25) {
      recommendations.push('Current weight trend is increasing - consider lifestyle modifications');
    } else if (weightTrend.trend === 'decreasing' && bmi >= 25) {
      recommendations.push('Current weight loss trend is positive - continue your current approach');
    }
    
    // Ensure we have at least some recommendations
    if (recommendations.length === 0) {
      recommendations.push('Maintain current weight through balanced diet and regular physical activity');
    }
    
    return recommendations;
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
    
    if (correlations.cardio?.impact === 'potentially_negative') score += 2;
    else if (correlations.cardio?.impact === 'beneficial') score = Math.max(score - 1, 0);

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
    
    if (correlations.cardio?.impact === 'beneficial') {
      recommendations.push('Continue regular cardio sessions—they are linked with better readings.');
    } else if (correlations.cardio?.impact === 'potentially_negative') {
      recommendations.push('Review cardio intensity and recovery since readings rise on workout days.');
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
  async generateEnhancedAnalysis(readings, cigarEntries = [], drinkEntries = [], weightEntries = [], cardioEntries = []) {
    // Generate the existing statistical analysis
      const baseAnalysis = await this.generateAdvancedAnalysis(readings, cigarEntries, drinkEntries, weightEntries, cardioEntries);
    
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

  async answerUserQuestion(question, readings, cigarEntries = [], drinkEntries = [], weightEntries = [], cardioEntries = []) {
    try {
      const userData = {
        readings: readings,
        cigars: cigarEntries,
        drinks: drinkEntries,
        weights: weightEntries,
        cardio: cardioEntries
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

  async generateHealthReport(readings, cigarEntries = [], drinkEntries = [], weightEntries = [], cardioEntries = []) {
    try {
      // Generate enhanced analysis with AI insights
      const analysis = await this.generateEnhancedAnalysis(readings, cigarEntries, drinkEntries, weightEntries, cardioEntries);
      
      // Create a prompt for the health report
      const reportPrompt = this.createHealthReportPrompt(analysis);
      
      // Use the medical model for health reports
      const report = await this.huggingFaceService.callHuggingFaceAPI(reportPrompt, this.huggingFaceService.medicalModel);
      
      // Add a disclaimer to the report
      const reportWithDisclaimer = `${report}\n\nDISCLAIMER: This report was generated using AI and should be reviewed by a healthcare professional. It is not a substitute for professional medical advice, diagnosis, or treatment.`;
      
      return {
        report: reportWithDisclaimer,
        analysis: analysis,
        generatedAt: new Date().toISOString(),
        source: 'huggingface',
        period: {
          start: readings.length > 0 ? new Date(readings[readings.length - 1].timestamp).toISOString() : null,
          end: readings.length > 0 ? new Date(readings[0].timestamp).toISOString() : null,
          totalReadings: readings.length
        }
      };
    } catch (error) {
      console.error('Error generating health report:', error);
      
      // If there's an error with the AI, still provide a basic report
      const basicAnalysis = await this.generateAdvancedAnalysis(readings, cigarEntries, drinkEntries, weightEntries, cardioEntries);
      
      return {
        report: 'Unable to generate AI-powered health report at this time. Please ensure your API key is configured correctly and try again.',
        analysis: basicAnalysis,
        generatedAt: new Date().toISOString(),
        source: 'fallback',
        error: error.message,
        period: {
          start: readings.length > 0 ? new Date(readings[readings.length - 1].timestamp).toISOString() : null,
          end: readings.length > 0 ? new Date(readings[0].timestamp).toISOString() : null,
          totalReadings: readings.length
        }
      };
    }
  }

  createHealthReportPrompt(analysis) {
    // Extract weight data if available
    const weightData = analysis.lifestyleCorrelation?.weight || {};
    const hasWeightData = Object.keys(weightData).length > 0;
    const weightTrend = weightData?.trend || 'unknown';
    const weightCorrelation = weightData?.correlation || 0;
    const weightImpact = weightData?.impact || 'no data';
    const bmiCategory = weightData?.bmiCategory || 'unknown';
    const recentWeight = weightData?.recentWeight || 'no data';
    const cardioData = analysis.lifestyleCorrelation?.cardio || {};
    const hasCardioData = Object.keys(cardioData).length > 0 && cardioData.impact && cardioData.impact !== 'no_data';
    const cardioImpact = cardioData?.impact || 'no data';
    const cardioAverageMinutes = cardioData?.averageMinutes ?? 0;
    const cardioSessions = cardioData?.sessions ?? 0;
    const cardioRecommendations = cardioData?.recommendations || [];
    
    return `You are a cardiologist creating a comprehensive blood pressure health report for a patient. Use the following data to generate a professional medical report:

RISK ASSESSMENT:
- Overall Risk Level: ${analysis.riskAssessment?.overall || 'unknown'}
- Risk Score: ${analysis.riskAssessment?.riskScore || 0}
- Current Risk: ${analysis.riskAssessment?.current || 'unknown'}
- Historical Risk: ${analysis.riskAssessment?.historical || 'unknown'}

TREND ANALYSIS:
- Systolic Trend: ${analysis.trendAnalysis?.systolic?.direction || 'stable'} (Confidence: ${analysis.trendAnalysis?.systolic?.confidence || 'unknown'})
- Diastolic Trend: ${analysis.trendAnalysis?.diastolic?.direction || 'stable'} (Confidence: ${analysis.trendAnalysis?.diastolic?.confidence || 'unknown'})
- Heart Rate Trend: ${analysis.trendAnalysis?.heartRate?.direction || 'stable'} (Confidence: ${analysis.trendAnalysis?.heartRate?.confidence || 'unknown'})

DATA QUALITY:
- Quality Assessment: ${analysis.dataQuality?.quality || 'unknown'}
- Total Readings: ${analysis.dataQuality?.totalReadings || 0}
- Time Span: ${analysis.dataQuality?.timeSpanDays || 0} days
- Confidence Score: ${analysis.confidenceScore || 0}

LIFESTYLE FACTORS:
- Smoking Impact: ${analysis.lifestyleCorrelation?.smoking?.impact || 'no data'}
- Alcohol Impact: ${analysis.lifestyleCorrelation?.alcohol?.moderateDrinking?.impact || analysis.lifestyleCorrelation?.alcohol?.lightDrinking?.impact || 'no data'}

WEIGHT ASSESSMENT:
- Recent Weight: ${recentWeight}
- BMI Category: ${bmiCategory}
- Weight Trend: ${weightTrend}
- BP Correlation: ${weightCorrelation.toFixed(2)}
- Impact on BP: ${weightImpact}
${hasWeightData ? `- Weight Recommendations: ${weightData?.recommendations?.join(', ') || 'none available'}` : ''}

CARDIO ACTIVITY:
- Impact: ${cardioImpact}
- Average Minutes per Session: ${cardioAverageMinutes}
- Sessions Logged: ${cardioSessions}
${hasCardioData ? `- Cardio Recommendations: ${cardioRecommendations.join(', ')}` : ''}

CIRCADIAN PATTERNS:
- Morning Average: ${analysis.circadianAnalysis?.morning?.averageSystolic || 0}/${analysis.circadianAnalysis?.morning?.averageDiastolic || 0}
- Evening Average: ${analysis.circadianAnalysis?.evening?.averageSystolic || 0}/${analysis.circadianAnalysis?.evening?.averageDiastolic || 0}

Create a structured medical report with these sections:
1. EXECUTIVE SUMMARY: Brief overview of cardiovascular health status
2. DETAILED FINDINGS: Analysis of blood pressure patterns and risk factors
3. WEIGHT ANALYSIS: Assessment of weight status and its relationship to blood pressure
4. CLINICAL INTERPRETATION: Medical significance of the findings according to current guidelines
5. RECOMMENDATIONS: Evidence-based interventions appropriate for the risk level, including weight management if relevant
6. MONITORING PLAN: Suggested frequency and approach for continued BP monitoring
7. DISCLAIMER: Note that this report is generated by AI and should be reviewed by a healthcare professional

Format the report professionally as a medical document. Include specific values from the data provided. Reference relevant clinical guidelines (JNC 8, AHA, ESC) where appropriate.

If weight data shows a significant correlation with blood pressure, emphasize weight management strategies in your recommendations section. Include specific dietary approaches (like DASH diet) and physical activity recommendations based on the patient's BMI category.`;
  }

  // Weight analysis helper methods
  calculateWeightTrend(weightEntries) {
    if (weightEntries.length < 2) {
      return { trend: 'insufficient_data', change: 0, rate: 0 };
    }

    const firstWeight = weightEntries[0].weight;
    const lastWeight = weightEntries[weightEntries.length - 1].weight;
    const totalChange = lastWeight - firstWeight;
    
    const daysDiff = this.differenceInDays(
      new Date(weightEntries[weightEntries.length - 1].timestamp),
      new Date(weightEntries[0].timestamp)
    );
    
    const rate = daysDiff > 0 ? totalChange / daysDiff : 0;
    
    let trend = 'stable';
    if (Math.abs(rate) > 0.1) {
      trend = rate > 0 ? 'increasing' : 'decreasing';
    }
    
    return {
      trend,
      change: parseFloat(totalChange.toFixed(2)),
      rate: parseFloat(rate.toFixed(3))
    };
  }

  calculateWeightBPCorrelation(readings, weightEntries) {
    if (readings.length < 3 || weightEntries.length < 2) {
      return 0;
    }

    // Match readings with closest weight entries
    const matchedData = readings.map(reading => {
      const readingDate = new Date(reading.timestamp);
      let closestWeight = null;
      let minDaysDiff = Infinity;

      weightEntries.forEach(weight => {
        const weightDate = new Date(weight.timestamp);
        const daysDiff = Math.abs(readingDate - weightDate) / (1000 * 60 * 60 * 24);
        
        if (daysDiff <= 7 && daysDiff < minDaysDiff) {
          minDaysDiff = daysDiff;
          closestWeight = weight.weight;
        }
      });

      return closestWeight ? {
        systolic: reading.systolic,
        diastolic: reading.diastolic,
        weight: closestWeight
      } : null;
    }).filter(data => data !== null);

    if (matchedData.length < 3) {
      return 0;
    }

    // Calculate correlation coefficient
    const systolicCorrelation = this.calculateCorrelation(
      matchedData.map(d => d.systolic),
      matchedData.map(d => d.weight)
    );
    
    const diastolicCorrelation = this.calculateCorrelation(
      matchedData.map(d => d.diastolic),
      matchedData.map(d => d.weight)
    );

    return (systolicCorrelation + diastolicCorrelation) / 2;
  }

  calculateCorrelation(x, y) {
    const n = x.length;
    if (n === 0) return 0;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  assessWeightImpact(correlation, weightTrend) {
    if (Math.abs(correlation) < 0.3) return 'minimal';
    if (Math.abs(correlation) < 0.6) return 'moderate';
    return 'significant';
  }

  calculateBMICategory(weight) {
    // This is a simplified BMI calculation - in a real app, you'd need height
    // For now, we'll use weight ranges as a proxy
    if (weight < 120) return 'underweight';
    if (weight < 150) return 'normal';
    if (weight < 180) return 'overweight';
    return 'obese';
  }

  generateWeightRecommendations(correlation, weightTrend) {
    const recommendations = [];
    
    if (Math.abs(correlation) > 0.5) {
      recommendations.push('Strong correlation detected between weight and blood pressure');
    }
    
    if (weightTrend.trend === 'increasing' && weightTrend.rate > 0.2) {
      recommendations.push('Consider weight management strategies to help control blood pressure');
    }
    
    if (weightTrend.trend === 'decreasing' && weightTrend.rate < -0.2) {
      recommendations.push('Monitor blood pressure closely during weight loss');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Continue monitoring both weight and blood pressure trends');
    }
    
  return recommendations;
  }
}

module.exports = AIAnalysisService;