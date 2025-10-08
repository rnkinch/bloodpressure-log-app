import { BloodPressureReading, TrendAnalysis, BloodPressureStats, ChartDataPoint, TimeRangeFilter, TimeRangeComparisonData } from '../types';
import { format, subWeeks, subMonths } from 'date-fns';

export const calculateStats = (readings: BloodPressureReading[], period: 'week' | 'month' | 'all' = 'all'): BloodPressureStats => {
  if (readings.length === 0) {
    return {
      averageSystolic: 0,
      averageDiastolic: 0,
      averageHeartRate: 0,
      minSystolic: 0,
      maxSystolic: 0,
      minDiastolic: 0,
      maxDiastolic: 0,
      totalReadings: 0,
      period
    };
  }

  const now = new Date();
  let filteredReadings = readings;

  if (period === 'week') {
    const weekAgo = subWeeks(now, 1);
    filteredReadings = readings.filter(r => r.timestamp >= weekAgo);
  } else if (period === 'month') {
    const monthAgo = subMonths(now, 1);
    filteredReadings = readings.filter(r => r.timestamp >= monthAgo);
  }

  const systolicValues = filteredReadings.map(r => r.systolic);
  const diastolicValues = filteredReadings.map(r => r.diastolic);
  const heartRateValues = filteredReadings.map(r => r.heartRate);

  return {
    averageSystolic: Math.round(systolicValues.reduce((a, b) => a + b, 0) / systolicValues.length),
    averageDiastolic: Math.round(diastolicValues.reduce((a, b) => a + b, 0) / diastolicValues.length),
    averageHeartRate: Math.round(heartRateValues.reduce((a, b) => a + b, 0) / heartRateValues.length),
    minSystolic: Math.min(...systolicValues),
    maxSystolic: Math.max(...systolicValues),
    minDiastolic: Math.min(...diastolicValues),
    maxDiastolic: Math.max(...diastolicValues),
    totalReadings: filteredReadings.length,
    period
  };
};

export const analyzeTrends = (readings: BloodPressureReading[]): TrendAnalysis => {
  if (readings.length < 2) {
    return {
      systolicTrend: 'stable',
      diastolicTrend: 'stable',
      heartRateTrend: 'stable',
      riskLevel: 'low',
      recommendations: ['Continue monitoring your blood pressure regularly'],
      insights: ['Not enough data for trend analysis. Keep logging readings!']
    };
  }

  // Sort readings by date
  const sortedReadings = [...readings].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  
  // Calculate trends using simple linear regression
  const systolicTrend = calculateTrend(sortedReadings.map(r => r.systolic));
  const diastolicTrend = calculateTrend(sortedReadings.map(r => r.diastolic));
  const heartRateTrend = calculateTrend(sortedReadings.map(r => r.heartRate));

  // Determine risk level based on recent readings
  const recentReadings = sortedReadings.slice(-7); // Last 7 readings
  const avgSystolic = recentReadings.reduce((sum, r) => sum + r.systolic, 0) / recentReadings.length;
  const avgDiastolic = recentReadings.reduce((sum, r) => sum + r.diastolic, 0) / recentReadings.length;

  let riskLevel: 'low' | 'moderate' | 'high' = 'low';
  if (avgSystolic >= 140 || avgDiastolic >= 90) {
    riskLevel = 'high';
  } else if (avgSystolic >= 130 || avgDiastolic >= 80) {
    riskLevel = 'moderate';
  }

  const recommendations = generateRecommendations(systolicTrend, diastolicTrend, heartRateTrend, riskLevel, readings);
  const insights = generateInsights(systolicTrend, diastolicTrend, heartRateTrend, avgSystolic, avgDiastolic, readings);

  return {
    systolicTrend,
    diastolicTrend,
    heartRateTrend,
    riskLevel,
    recommendations,
    insights
  };
};

const calculateTrend = (values: number[]): 'increasing' | 'decreasing' | 'stable' => {
  if (values.length < 2) return 'stable';
  
  const n = values.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = values;
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  
  if (Math.abs(slope) < 0.5) return 'stable';
  return slope > 0 ? 'increasing' : 'decreasing';
};

const generateRecommendations = (
  systolicTrend: string,
  diastolicTrend: string,
  heartRateTrend: string,
  riskLevel: string,
  readings: BloodPressureReading[]
): string[] => {
  const recommendations: string[] = [];
  
  if (riskLevel === 'high') {
    recommendations.push('Consider consulting with a healthcare provider about your blood pressure');
    recommendations.push('Monitor your blood pressure more frequently');
  }
  
  if (systolicTrend === 'increasing' || diastolicTrend === 'increasing') {
    recommendations.push('Consider lifestyle changes like reducing sodium intake and increasing exercise');
  }
  
  if (heartRateTrend === 'increasing') {
    recommendations.push('Consider stress management techniques and regular cardiovascular exercise');
  }
  
  if (systolicTrend === 'stable' && diastolicTrend === 'stable') {
    recommendations.push('Great job maintaining stable blood pressure!');
  }

  // Lifestyle-based recommendations
  const lifestyleInsights = generateLifestyleRecommendations(readings);
  recommendations.push(...lifestyleInsights);
  
  if (recommendations.length === 0) {
    recommendations.push('Continue monitoring your blood pressure regularly');
  }
  
  return recommendations;
};

const generateInsights = (
  systolicTrend: string,
  diastolicTrend: string,
  heartRateTrend: string,
  avgSystolic: number,
  avgDiastolic: number,
  readings: BloodPressureReading[]
): string[] => {
  const insights: string[] = [];
  
  // Blood pressure category insights
  if (avgSystolic < 120 && avgDiastolic < 80) {
    insights.push('Your blood pressure is in the normal range - excellent!');
  } else if (avgSystolic < 130 && avgDiastolic < 80) {
    insights.push('Your blood pressure is elevated but not in the high range');
  } else if (avgSystolic < 140 && avgDiastolic < 90) {
    insights.push('Your blood pressure is in Stage 1 hypertension range');
  } else {
    insights.push('Your blood pressure is in Stage 2 hypertension range');
  }
  
  // Trend insights
  if (systolicTrend === 'decreasing' && diastolicTrend === 'decreasing') {
    insights.push('Both systolic and diastolic pressures are trending downward - positive progress!');
  } else if (systolicTrend === 'increasing' && diastolicTrend === 'increasing') {
    insights.push('Both pressures are trending upward - consider lifestyle modifications');
  }
  
  if (heartRateTrend === 'decreasing') {
    insights.push('Your heart rate is trending downward, which may indicate improved cardiovascular fitness');
  } else if (heartRateTrend === 'increasing') {
    insights.push('Your heart rate is trending upward - consider stress management and regular exercise');
  }

  // Time-based pattern analysis
  const timePatterns = analyzeTimePatterns(readings);
  insights.push(...timePatterns);
  
  return insights;
};

const generateLifestyleRecommendations = (readings: BloodPressureReading[]): string[] => {
  const recommendations: string[] = [];
  
  if (readings.length === 0) {
    return recommendations;
  }

  // Analyze cigar smoking patterns
  const smokingReadings = readings.filter(r => r.cigarSmoking && r.cigarSmoking !== 'none');
  const heavySmokingReadings = readings.filter(r => r.cigarSmoking === 'heavy');
  const moderateSmokingReadings = readings.filter(r => r.cigarSmoking === 'moderate');

  if (heavySmokingReadings.length > 0) {
    const avgSystolic = heavySmokingReadings.reduce((sum, r) => sum + r.systolic, 0) / heavySmokingReadings.length;
    const avgDiastolic = heavySmokingReadings.reduce((sum, r) => sum + r.diastolic, 0) / heavySmokingReadings.length;
    
    if (avgSystolic >= 130 || avgDiastolic >= 80) {
      recommendations.push('Heavy cigar smoking may be contributing to elevated blood pressure. Consider reducing frequency or consulting with a healthcare provider about smoking cessation strategies.');
    }
  }

  if (moderateSmokingReadings.length > 0) {
    const avgSystolic = moderateSmokingReadings.reduce((sum, r) => sum + r.systolic, 0) / moderateSmokingReadings.length;
    const avgDiastolic = moderateSmokingReadings.reduce((sum, r) => sum + r.diastolic, 0) / moderateSmokingReadings.length;
    
    if (avgSystolic >= 140 || avgDiastolic >= 90) {
      recommendations.push('Moderate cigar smoking combined with high blood pressure readings suggests a potential correlation. Consider monitoring your blood pressure before and after smoking.');
    }
  }

  // Analyze drinking patterns
  const drinkingReadings = readings.filter(r => r.drinkingHabits && r.drinkingHabits !== 'none');
  const heavyDrinkingReadings = readings.filter(r => r.drinkingHabits === 'heavy');
  const moderateDrinkingReadings = readings.filter(r => r.drinkingHabits === 'moderate');

  if (heavyDrinkingReadings.length > 0) {
    const avgSystolic = heavyDrinkingReadings.reduce((sum, r) => sum + r.systolic, 0) / heavyDrinkingReadings.length;
    const avgDiastolic = heavyDrinkingReadings.reduce((sum, r) => sum + r.diastolic, 0) / heavyDrinkingReadings.length;
    
    if (avgSystolic >= 130 || avgDiastolic >= 80) {
      recommendations.push('Heavy alcohol consumption may be contributing to elevated blood pressure. Consider reducing alcohol intake and monitoring blood pressure changes.');
    }
  }

  if (moderateDrinkingReadings.length > 0) {
    const avgSystolic = moderateDrinkingReadings.reduce((sum, r) => sum + r.systolic, 0) / moderateDrinkingReadings.length;
    const avgDiastolic = moderateDrinkingReadings.reduce((sum, r) => sum + r.diastolic, 0) / moderateDrinkingReadings.length;
    
    if (avgSystolic >= 140 || avgDiastolic >= 90) {
      recommendations.push('Moderate alcohol consumption with high blood pressure readings suggests monitoring the relationship between drinking and your blood pressure.');
    }
  }

  // Combined lifestyle analysis
  const combinedLifestyleReadings = readings.filter(r => 
    (r.cigarSmoking && r.cigarSmoking !== 'none') && 
    (r.drinkingHabits && r.drinkingHabits !== 'none')
  );

  if (combinedLifestyleReadings.length > 0) {
    const avgSystolic = combinedLifestyleReadings.reduce((sum, r) => sum + r.systolic, 0) / combinedLifestyleReadings.length;
    const avgDiastolic = combinedLifestyleReadings.reduce((sum, r) => sum + r.diastolic, 0) / combinedLifestyleReadings.length;
    
    if (avgSystolic >= 130 || avgDiastolic >= 80) {
      recommendations.push('The combination of smoking and drinking may be amplifying blood pressure effects. Consider addressing both lifestyle factors for optimal cardiovascular health.');
    }
  }

  return recommendations;
};

export const prepareChartData = (readings: BloodPressureReading[]): ChartDataPoint[] => {
  return readings
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    .map(reading => {
      // Convert to local timezone for display
      const localDate = new Date(reading.timestamp.getTime() - reading.timestamp.getTimezoneOffset() * 60000);
      return {
        date: format(localDate, 'MMM dd'),
        systolic: reading.systolic,
        diastolic: reading.diastolic,
        heartRate: reading.heartRate,
        timestamp: reading.timestamp.getTime()
      };
    });
};

export const filterReadingsByTimeRange = (
  readings: BloodPressureReading[], 
  timeRange: TimeRangeFilter
): BloodPressureReading[] => {
  if (!timeRange.enabled) {
    return readings;
  }

  return readings.filter(reading => {
    const hour = reading.timestamp.getHours();
    const minute = reading.timestamp.getMinutes();
    const readingTime = hour + minute / 60;
    const startTime = timeRange.startHour;
    const endTime = timeRange.endHour;

    // Handle time ranges that cross midnight (e.g., 22:00-06:00)
    if (startTime > endTime) {
      return readingTime >= startTime || readingTime <= endTime;
    }
    
    return readingTime >= startTime && readingTime <= endTime;
  });
};

export const prepareTimeRangeComparisonData = (
  readings: BloodPressureReading[],
  timeRange: TimeRangeFilter,
  period: 'week' | 'month' | 'all' = 'all'
): TimeRangeComparisonData => {
  const now = new Date();
  let filteredReadings = readings;
  
  // First apply period filter
  if (period === 'week') {
    const weekAgo = subWeeks(now, 1);
    filteredReadings = readings.filter(r => r.timestamp >= weekAgo);
  } else if (period === 'month') {
    const monthAgo = subMonths(now, 1);
    filteredReadings = readings.filter(r => r.timestamp >= monthAgo);
  }

  // Then apply time range filter
  const timeFilteredReadings = filterReadingsByTimeRange(filteredReadings, timeRange);
  
  // Prepare chart data
  const allData = prepareChartData(filteredReadings);
  const filteredData = prepareChartData(timeFilteredReadings);

  // Calculate stats for filtered data
  let stats = {
    avgSystolic: 0,
    avgDiastolic: 0,
    avgHeartRate: 0,
    readingCount: 0
  };

  if (timeFilteredReadings.length > 0) {
    const systolicSum = timeFilteredReadings.reduce((sum, r) => sum + r.systolic, 0);
    const diastolicSum = timeFilteredReadings.reduce((sum, r) => sum + r.diastolic, 0);
    const heartRateSum = timeFilteredReadings.reduce((sum, r) => sum + r.heartRate, 0);
    
    stats = {
      avgSystolic: Math.round(systolicSum / timeFilteredReadings.length),
      avgDiastolic: Math.round(diastolicSum / timeFilteredReadings.length),
      avgHeartRate: Math.round(heartRateSum / timeFilteredReadings.length),
      readingCount: timeFilteredReadings.length
    };
  }

  return {
    filtered: filteredData,
    allData: allData,
    timeRange: timeRange,
    stats: stats
  };
};

export const getPresetTimeRanges = (): TimeRangeFilter[] => {
  return [
    { enabled: false, startHour: 6, endHour: 10, label: 'Morning (6 AM - 10 AM)' },
    { enabled: false, startHour: 10, endHour: 14, label: 'Late Morning (10 AM - 2 PM)' },
    { enabled: false, startHour: 14, endHour: 18, label: 'Afternoon (2 PM - 6 PM)' },
    { enabled: false, startHour: 18, endHour: 22, label: 'Evening (6 PM - 10 PM)' },
    { enabled: false, startHour: 22, endHour: 6, label: 'Night (10 PM - 6 AM)' },
    { enabled: false, startHour: 0, endHour: 6, label: 'Early Morning (12 AM - 6 AM)' },
    { enabled: false, startHour: 6, endHour: 12, label: 'Morning Hours (6 AM - 12 PM)' },
    { enabled: false, startHour: 12, endHour: 18, label: 'Afternoon Hours (12 PM - 6 PM)' },
    { enabled: false, startHour: 18, endHour: 24, label: 'Evening Hours (6 PM - 12 AM)' }
  ];
};

const analyzeTimePatterns = (readings: BloodPressureReading[]): string[] => {
  const insights: string[] = [];
  
  if (readings.length < 4) {
    return insights; // Need at least 4 readings to detect patterns
  }

  // Group readings by time periods
  const timePeriods = {
    morning: readings.filter(r => r.timestamp.getHours() >= 6 && r.timestamp.getHours() < 12),
    afternoon: readings.filter(r => r.timestamp.getHours() >= 12 && r.timestamp.getHours() < 18),
    evening: readings.filter(r => r.timestamp.getHours() >= 18 && r.timestamp.getHours() < 24),
    night: readings.filter(r => r.timestamp.getHours() >= 0 && r.timestamp.getHours() < 6)
  };

  // Calculate averages for each time period
  const periodAverages = Object.entries(timePeriods)
    .map(([period, readings]) => {
      if (readings.length === 0) return null;
      
      const avgSystolic = readings.reduce((sum, r) => sum + r.systolic, 0) / readings.length;
      const avgDiastolic = readings.reduce((sum, r) => sum + r.diastolic, 0) / readings.length;
      
      return {
        period,
        avgSystolic: Math.round(avgSystolic),
        avgDiastolic: Math.round(avgDiastolic),
        count: readings.length
      };
    })
    .filter((period): period is NonNullable<typeof period> => period !== null);

  if (periodAverages.length < 2) {
    return insights;
  }

  // Find highest and lowest periods
  const highestSystolic = periodAverages.reduce((max, current) => 
    current.avgSystolic > max.avgSystolic ? current : max
  );
  const lowestSystolic = periodAverages.reduce((min, current) => 
    current.avgSystolic < min.avgSystolic ? current : min
  );

  const highestDiastolic = periodAverages.reduce((max, current) => 
    current.avgDiastolic > max.avgDiastolic ? current : max
  );
  const lowestDiastolic = periodAverages.reduce((min, current) => 
    current.avgDiastolic < min.avgDiastolic ? current : min
  );

  // Generate insights based on time patterns
  const systolicDiff = highestSystolic.avgSystolic - lowestSystolic.avgSystolic;
  const diastolicDiff = highestDiastolic.avgDiastolic - lowestDiastolic.avgDiastolic;

  if (systolicDiff >= 10) {
    insights.push(
      `Your systolic pressure varies significantly by time of day: highest in ${highestSystolic.period} (${highestSystolic.avgSystolic} mmHg) and lowest in ${lowestSystolic.period} (${lowestSystolic.avgSystolic} mmHg). This ${systolicDiff}-point difference suggests circadian patterns.`
    );
  }

  if (diastolicDiff >= 8) {
    insights.push(
      `Your diastolic pressure shows notable time-based variation: highest in ${highestDiastolic.period} (${highestDiastolic.avgDiastolic} mmHg) and lowest in ${lowestDiastolic.period} (${lowestDiastolic.avgDiastolic} mmHg).`
    );
  }

  // Check for consistent high readings in specific periods
  const highRiskPeriods = periodAverages.filter(period => 
    period.avgSystolic >= 140 || period.avgDiastolic >= 90
  );

  if (highRiskPeriods.length > 0) {
    const periodNames = highRiskPeriods.map(p => p.period).join(', ');
    insights.push(
      `Your blood pressure readings are consistently high during ${periodNames}. Consider monitoring these times more closely and discussing with your healthcare provider.`
    );
  }

  // Check for optimal periods
  const optimalPeriods = periodAverages.filter(period => 
    period.avgSystolic < 120 && period.avgDiastolic < 80
  );

  if (optimalPeriods.length > 0) {
    const periodNames = optimalPeriods.map(p => p.period).join(', ');
    insights.push(
      `Your blood pressure is consistently optimal during ${periodNames}. This suggests these may be your best times for important activities or medications.`
    );
  }

  return insights;
};
